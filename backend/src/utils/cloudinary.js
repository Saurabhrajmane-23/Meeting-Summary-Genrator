import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add a helper function for URL transformations
const getAudioUrlFromVideo = (videoUrl) => {
  // Transform video URL to audio format for processing
  return videoUrl.replace("/upload/", "/upload/f_mp3,q_auto/");
};

const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
  try {
    if (!localFilePath) return null;

    // Configure upload options
    const uploadOptions = {
      resource_type: resourceType,
      folder:
        resourceType === "video"
          ? "videos"
          : resourceType === "audio"
          ? "audio"
          : "auto",
      chunk_size: 6000000,
      eager:
        resourceType === "video"
          ? [{ width: 720, height: 480, crop: "pad" }]
          : undefined,
      eager_async: true,
    };

    // Upload file to cloudinary with promise handling
    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Upload completed");
            resolve(result);
          }
        }
      );

      const fileStream = fs.createReadStream(localFilePath);

      // Track upload progress
      let uploadedBytes = 0;
      const fileSize = fs.statSync(localFilePath).size;

      fileStream.on("data", (chunk) => {
        uploadedBytes += chunk.length;
        const progress = Math.min((uploadedBytes / fileSize) * 100, 99); // Cap at 99% until fully complete
      });

      fileStream.on("end", () => {
        console.log("File stream ended");
      });

      fileStream.pipe(uploadStream);
    });

    console.log("Cloudinary upload response received");

    // Clean up local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: response.url,
      public_id: response.public_id,
      format: response.format,
      resource_type: response.resource_type,
      duration: response.duration || null,
    };
  } catch (error) {
    console.error("Detailed upload error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      http_code: error.http_code,
    });

    // Clean up local file in case of error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw error;
  }
};

const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
  try {
    // Remove any file extension from publicId if present
    const cleanPublicId = publicId.split(".")[0];

    // Map file types to Cloudinary resource types
    const resourceTypeMap = {
      audio: "video", // Cloudinary handles audio files under video resource type
      video: "video",
      auto: "auto",
    };

    const cloudinaryResourceType = resourceTypeMap[resourceType] || "auto";

    console.log(`Attempting to delete from Cloudinary:`, {
      publicId: cleanPublicId,
      resourceType: cloudinaryResourceType,
    });

    const result = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: cloudinaryResourceType,
    });

    if (result?.result !== "ok") {
      throw new Error(
        `Cloudinary deletion failed: ${result?.result || "unknown error"}`
      );
    }

    console.log(`Successfully deleted from Cloudinary:`, {
      publicId: cleanPublicId,
      result,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", {
      message: error.message,
      publicId,
      resourceType,
    });
    throw error;
  }
};

// Export the new helper function too
export { uploadOnCloudinary, deleteFromCloudinary, getAudioUrlFromVideo };
