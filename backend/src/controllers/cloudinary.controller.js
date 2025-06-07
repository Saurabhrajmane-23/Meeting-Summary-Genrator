import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";

const getUploadConfig = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          uploadPreset: "meetingsummary_uploads", // Replace with your actual preset name
        },
        "Upload config retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Upload config error:", error);
    throw new ApiError(500, error?.message || "Error getting upload config");
  }
});

const testAuth = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: req.user._id }, "Authentication working")
    );
});

export { getUploadConfig, testAuth };
