import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  downloadFromCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { File } from "../models/file.model.js";
import fs from "fs";
import path from "path";
import { transcribeAudioFile } from "../utils/assembly.js";
import { generateSummaryPDF } from "../utils/pdfGenerator.js";
import { generateMeetingSummary } from "../utils/gemini.js";

const uploadFile = asyncHandler(async (req, res) => {
  try {
    // Check if file exists
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
      owner: req.user._id, // This requires auth middleware
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

    // Generate a unique filename
    const localFileName = `${file._id}_${Date.now()}${path.extname(
      file.fileName
    )}`;

    // Download file from Cloudinary and extract audio if it's a video
    const localFilePath = await downloadFromCloudinary(
      file.cloudinaryUrl,
      localFileName,
      file.fileType
    );

    console.log("File downloaded to:", localFilePath);

    // Start transcription process
    const transcript = await transcribeAudioFile(localFilePath);

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

    // Clean up downloaded file only after transcription is complete
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

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

    // Send to AssemblyAI for transcription
    const transcript = await transcribeAudioFile(file.cloudinaryUrl);

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
    throw new ApiError(500, error?.message || "Error transcribing audio");
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
      uploaded: 20,        // File uploaded to cloudinary
      transcribed: 60,     // Audio transcribed
      summarized: 100      // AI summary generated
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
            summarized: file.aiSummary ? true : false
          },
          isProcessed: file.isProcessed || false,
          isAnalyzed: file.isAnalyzed || false
        },
        "Processing percentage retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Processing percentage error:", error);
    throw new ApiError(500, error?.message || "Error getting processing percentage");
  }
});

export {
  uploadFile,
  processAudio,
  getAllFiles,
  deleteFile,
  transcribeAudio,
  downloadSummaryPDF,
  getFileProcessingPercentage,
};
