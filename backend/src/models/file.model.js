import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["audio", "video"],
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    transcript: {
      type: String,
      default: null,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    isAnalyzed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const File = mongoose.model("File", fileSchema);
