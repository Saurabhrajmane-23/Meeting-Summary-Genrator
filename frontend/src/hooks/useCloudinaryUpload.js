import { useState } from "react";
import axios from "axios";

const useCloudinaryUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const getUploadConfig = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Use production URL instead of localhost
      const response = await axios.get(
        "http://localhost:8000/api/v2/cloudinary/upload-config",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Upload config from backend:", response.data.data);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        error.response?.data?.message || "Error getting upload config"
      );
    }
  };

  const uploadToCloudinary = async (file, onProgress) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");

      // Get upload config from backend
      const uploadConfig = await getUploadConfig();

      // Validate that we have the required config
      if (!uploadConfig.uploadPreset) {
        throw new Error("Upload preset not provided by backend");
      }

      if (!uploadConfig.cloudName) {
        throw new Error("Cloud name not provided by backend");
      }

      console.log("Using upload preset:", uploadConfig.uploadPreset);
      console.log("Using cloud name:", uploadConfig.cloudName);

      // Prepare form data for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadConfig.uploadPreset);

      // Log form data contents
      console.log("Form data contents:");
      for (let [key, value] of formData.entries()) {
        if (key === "file") {
          console.log(key + ":", value.name, value.size, value.type);
        } else {
          console.log(key + ":", value);
        }
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadConfig.cloudName}/upload`;
      console.log("Upload URL:", uploadUrl);

      // Upload directly to Cloudinary
      const cloudinaryResponse = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        },
        timeout: 300000, // 5 minutes timeout
      });

      console.log("Cloudinary upload successful:", cloudinaryResponse.data);

      return {
        url: cloudinaryResponse.data.secure_url,
        publicId: cloudinaryResponse.data.public_id,
        duration: cloudinaryResponse.data.duration,
        format: cloudinaryResponse.data.format,
        resourceType: cloudinaryResponse.data.resource_type,
        bytes: cloudinaryResponse.data.bytes,
      };
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Upload error response:", error.response?.data);
      setError(
        error.response?.data?.error?.message || error.message || "Upload failed"
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const createFileRecord = async (fileData) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Also update this URL to production
      const response = await axios.post(
        "http://localhost:8000/api/v2/files/create-record",
        fileData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating file record:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeRemoveItem("refreshToken");
        window.location.href = "/login";
        throw new Error("Session expired. Please login again.");
      }
      throw new Error(
        error.response?.data?.message || "Error creating file record"
      );
    }
  };

  return {
    uploadToCloudinary,
    createFileRecord,
    uploadProgress,
    uploading,
    error,
    setError,
  };
};

export default useCloudinaryUpload;
