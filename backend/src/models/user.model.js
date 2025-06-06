import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // This already creates an index
    },
    email: {
      type: String,
      required: true,
      unique: true, // This already creates an index
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    googleId: {
      type: String,
      unique: true, // This already creates an index
      sparse: true, // Allows null values while maintaining uniqueness
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    refreshToken: {
      type: String,
    },
    isVerified: { type: Boolean, default: false },

    verificationCode: String,

    codeExpiresAt: Date,

    plan: {
      type: String,
      enum: ["basic", "monthly", "yearly"],
      default: "basic",
    },
    planStartedAt: {
      type: Date,
    },
    planExpiresAt: {
      type: Date,
    },
    meetingCount: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 5);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
