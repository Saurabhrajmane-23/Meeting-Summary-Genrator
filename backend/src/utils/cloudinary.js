import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const extractAudioFromVideo = async (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat("mp3")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
};

const downloadFromCloudinary = async (
  cloudinaryUrl,
  localFileName,
  fileType
) => {
  try {
    const tempDir = "./public/temp";

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const downloadPath = path.join(tempDir, localFileName);

    // Determine which protocol to use
    const client = cloudinaryUrl.startsWith("https:") ? https : http;

    // Download the file
    await new Promise((resolve, reject) => {
      client
        .get(cloudinaryUrl, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const newUrl = response.headers.location;
            console.log("Redirecting to:", newUrl);
            // Recursively call with new URL
            downloadFromCloudinary(newUrl, localFileName, fileType)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          const writeStream = fs.createWriteStream(downloadPath);
          response.pipe(writeStream);

          writeStream.on("finish", () => resolve());
          writeStream.on("error", (err) => {
            fs.unlinkSync(downloadPath);
            reject(err);
          });
        })
        .on("error", reject);
    });

    // If it's a video file, extract audio
    if (fileType === "video") {
      const audioPath = path.join(tempDir, `audio_${localFileName}.mp3`);
      await extractAudioFromVideo(downloadPath, audioPath);

      // Clean up video file
      fs.unlinkSync(downloadPath);
      return audioPath;
    }

    return downloadPath;
  } catch (error) {
    console.error("Download/Convert from Cloudinary failed:", error);
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

// Update the export
export { uploadOnCloudinary, downloadFromCloudinary, deleteFromCloudinary };
