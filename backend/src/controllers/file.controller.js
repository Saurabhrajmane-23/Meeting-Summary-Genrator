import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  downloadFromCloudinary,
} from "../utils/cloudinary.js";
import { File } from "../models/file.model.js";
import fs from "fs";
import path from "path";

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

    console.log("File downloaded to:", localFilePath); // Add this line

    // Temporarily delay deletion to verify file
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second delay

    // Clean up downloaded file
    if (fs.existsSync(localFilePath)) {
      console.log("Cleaning up file:", localFilePath); // Add this line
      fs.unlinkSync(localFilePath);
    }

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Audio processed successfully",
        downloadPath: localFilePath, // Add this temporarily
      })
    );
  } catch (error) {
    console.error("Process error:", error); // Add this line
    throw new ApiError(500, error?.message || "Error processing audio file");
  }
});

export { uploadFile, processAudio };
