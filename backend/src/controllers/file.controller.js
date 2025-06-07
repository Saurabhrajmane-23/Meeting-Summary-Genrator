import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getAudioUrlFromVideo, // Import the helper function instead
} from "../utils/cloudinary.js";
import { File } from "../models/file.model.js";
import fs from "fs";
import path from "path";
import { transcribeAudioFile } from "../utils/assembly.js";
import { generateSummaryPDF } from "../utils/pdfGenerator.js";
import { generateMeetingSummary } from "../utils/gemini.js";

// Update the helper function to use the imported one from cloudinary.js
const transformVideoUrlToAudio = (videoUrl, publicId) => {
  // Use the helper function from cloudinary.js for consistency
  return getAudioUrlFromVideo(videoUrl);
};

// New endpoint for creating file record after direct Cloudinary upload
const createFileRecord = asyncHandler(async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      cloudinaryUrl,
      cloudinaryPublicId,
      duration,
      fileSize,
      description,
    } = req.body;

    // Validate required fields
    if (!fileName || !fileType || !cloudinaryUrl || !cloudinaryPublicId) {
      throw new ApiError(400, "Missing required file information");
    }

    // Validate file type
    const supportedTypes = ["audio", "video"];
    if (!supportedTypes.includes(fileType)) {
      throw new ApiError(
        400,
        "Invalid file type. Only audio and video files are supported"
      );
    }

    // Create database entry
    const fileDoc = await File.create({
      fileName: fileName,
      fileType: fileType,
      cloudinaryUrl: cloudinaryUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      duration: duration || 0,
      fileSize: fileSize || 0,
      owner: req.user._id,
      description: description || "",
    });

    // Return success response with file document
    return res
      .status(201)
      .json(new ApiResponse(201, fileDoc, "File record created successfully"));
  } catch (error) {
    console.error("File record creation error:", error);
    throw new ApiError(500, error?.message || "Error creating file record");
  }
});

// Update the existing uploadFile function to handle fallback scenario
const uploadFile = asyncHandler(async (req, res) => {
  try {
    // Check if file exists (fallback for non-direct uploads)
    if (!req.file) {
      throw new ApiError(400, "No file provided");
    }

    const file = req.file;
    const supportedTypes = ["audio", "video"];
    const fileType = file.mimetype.split("/")[0];

    // Validate file type
    if (!supportedTypes.includes(fileType)) {
      throw new ApiError(
        400,
        "Invalid file type. Only audio and video files are supported"
      );
    }

    // Get absolute path of the uploaded file
    const filePath = req.file?.path;
    if (!filePath) {
      throw new ApiError(400, "File is required");
    }

    // Upload to cloudinary
    const uploadedFile = await uploadOnCloudinary(filePath);

    if (!uploadedFile) {
      throw new ApiError(500, "Error while uploading file");
    }

    // Create database entry
    const fileDoc = await File.create({
      fileName: file.originalname,
      fileType: fileType,
      cloudinaryUrl: uploadedFile.url,
      cloudinaryPublicId: uploadedFile.public_id,
      duration: uploadedFile.duration || 0,
      fileSize: file.size,
      owner: req.user._id,
      description: req.body.description || "",
    });

    // Return success response with file document
    return res
      .status(201)
      .json(new ApiResponse(201, fileDoc, "File uploaded successfully"));
  } catch (error) {
    console.error("Upload error details:", error);

    // Clean up the file if it exists
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file:", cleanupError);
      }
    }

    throw new ApiError(500, error?.message || "Internal server error");
  }
});

const processAudio = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file details from database
    const file = await File.findById(fileId);
    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check if file belongs to user
    if (file.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized access");
    }

    console.log(
      "Processing file directly from Cloudinary URL:",
      file.cloudinaryUrl
    );

    // For video files, we need to get the audio-only URL from Cloudinary
    let audioUrl = file.cloudinaryUrl;
    if (file.fileType === "video") {
      // Transform video URL to audio format for processing
      audioUrl = transformVideoUrlToAudio(
        file.cloudinaryUrl,
        file.cloudinaryPublicId
      );
    }

    // Start transcription process directly with Cloudinary URL
    const transcript = await transcribeAudioFile(audioUrl);

    // Generate AI summary after transcription
    const summary = await generateMeetingSummary(transcript.text);

    // Update file in database with transcript and summary data
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      {
        $set: {
          transcript: transcript.text,
          chapters: transcript.chapters,
          speakers: transcript.utterances?.map((u) => ({
            speaker: u.speaker,
            text: u.text,
            start: u.start,
            end: u.end,
          })),
          aiSummary: summary,
          isProcessed: true,
          isAnalyzed: true,
        },
      },
      { new: true }
    );

    // increment meeting count for the user
    const user = req.user;
    user.meetingCount += 1;
    await user.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transcript: transcript.text,
          chapters: transcript.chapters,
          speakers: transcript.utterances,
          aiSummary: summary,
        },
        "Audio processed and summarized successfully"
      )
    );
  } catch (error) {
    console.error("Process error:", error);
    throw new ApiError(500, error?.message || "Error processing audio file");
  }
});

const getAllFiles = asyncHandler(async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .select(
        "fileName fileType duration fileSize description createdAt status isProcessed transcript"
      )
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, files, "Files fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching files");
  }
});

const deleteFile = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find file and check ownership
    const file = await File.findOne({
      _id: fileId,
      owner: req.user._id,
    });

    if (!file) {
      throw new ApiError(404, "File not found or unauthorized");
    }

    console.log("Attempting to delete file:", {
      fileId,
      cloudinaryPublicId: file.cloudinaryPublicId,
      fileType: file.fileType,
    });

    // Delete from cloudinary with correct resource type
    if (file.cloudinaryPublicId) {
      try {
        await deleteFromCloudinary(file.cloudinaryPublicId, file.fileType);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await File.findByIdAndDelete(fileId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "File deleted successfully"));
  } catch (error) {
    console.error("Delete error:", error);
    throw new ApiError(500, error?.message || "Error deleting file");
  }
});

const transcribeAudio = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file details from database
    const file = await File.findById(fileId);
    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check if file belongs to user
    if (file.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized access");
    }

    // Use Cloudinary URL directly for transcription
    let audioUrl = file.cloudinaryUrl;
    if (file.fileType === "video") {
      audioUrl = transformVideoUrlToAudio(
        file.cloudinaryUrl,
        file.cloudinaryPublicId
      );
    }

    // Send to AssemblyAI for transcription using direct URL
    const transcript = await transcribeAudioFile(audioUrl);

    // Update file in database with transcript data
    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      {
        $set: {
          transcript: transcript.text,
          chapters: transcript.chapters,
          speakers: transcript.utterances?.map((u) => ({
            speaker: u.speaker,
            text: u.text,
            start: u.start,
            end: u.end,
          })),
          isProcessed: true,
        },
      },
      { new: true }
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transcript: transcript.text,
          chapters: transcript.chapters,
          speakers: transcript.utterances,
        },
        "Audio transcribed successfully"
      )
    );
  } catch (error) {
    console.error("Transcription error:", error);
    throw new ApiError(500, error?.message || "Error transcribing audio file");
  }
});

const downloadSummaryPDF = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file details from database
    const file = await File.findById(fileId);
    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check if file has been processed and has a summary
    if (!file.aiSummary) {
      throw new ApiError(400, "No summary available for this file");
    }

    // Generate PDF
    const pdfFileName = `summary_${fileId}_${Date.now()}.pdf`;
    const pdfPath = path.join("public", "temp", pdfFileName);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join("public", "temp"))) {
      fs.mkdirSync(path.join("public", "temp"), { recursive: true });
    }

    // Generate PDF file
    await generateSummaryPDF(file.aiSummary, pdfPath);

    // Send file
    res.download(pdfPath, `summary_${file.fileName}.pdf`, (err) => {
      // Clean up: delete the temporary PDF file
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }

      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new ApiError(500, error?.message || "Error generating PDF");
  }
});

const getFileProcessingPercentage = asyncHandler(async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file details from database
    const file = await File.findById(fileId);
    if (!file) {
      throw new ApiError(404, "File not found");
    }

    // Check if file belongs to user
    if (file.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized access");
    }

    // Calculate processing percentage based on completion stages
    let percentage = 0;
    const stages = {
      uploaded: 20, // File uploaded to cloudinary
      transcribed: 60, // Audio transcribed
      summarized: 100, // AI summary generated
    };

    // Stage 1: File uploaded (always true if we found the file)
    if (file.cloudinaryUrl) {
      percentage = stages.uploaded;
    }

    // Stage 2: Transcription completed
    if (file.transcript && file.transcript.length > 0) {
      percentage = stages.transcribed;
    }

    // Stage 3: AI Summary completed
    if (file.aiSummary && Object.keys(file.aiSummary).length > 0) {
      percentage = stages.summarized;
    }

    // Determine processing status
    let status = "pending";
    if (percentage === 100) {
      status = "completed";
    } else if (percentage > 20) {
      status = "processing";
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          fileId: file._id,
          fileName: file.fileName,
          percentage: percentage,
          status: status,
          stages: {
            uploaded: file.cloudinaryUrl ? true : false,
            transcribed: file.transcript ? true : false,
            summarized: file.aiSummary ? true : false,
          },
          isProcessed: file.isProcessed || false,
          isAnalyzed: file.isAnalyzed || false,
        },
        "Processing percentage retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Processing percentage error:", error);
    throw new ApiError(
      500,
      error?.message || "Error getting processing percentage"
    );
  }
});

export {
  uploadFile,
  createFileRecord,
  processAudio,
  getAllFiles,
  deleteFile,
  transcribeAudio,
  downloadSummaryPDF,
  getFileProcessingPercentage,
};
