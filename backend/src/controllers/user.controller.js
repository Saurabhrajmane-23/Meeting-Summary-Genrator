import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import sendEmail from "../utils/nodeMailer.js";
import Razorpay from "razorpay";
import passport from "../config/passport.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  // step 1 : get user details from frontend
  const { username, email, password } = req.body;
  // console.log(email);

  // check if email or username is provided
  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }

  // find user by email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // check if password is correct or not
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  console.log(accessToken, refreshToken);

  // send in cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      refreshToken: undefined,
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const tempUserStore = new Map();
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, verificationCode } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Username, email, and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If verification code is not provided, send verification email
  if (!verificationCode) {
    if (existingUser) {
      return res
        .status(201)
        .json(new ApiResponse(200, existingUser, "User already exists"));
    }

    // Handle avatar upload
    const avatarLocalPath = req.file?.path;
    let avatarUrl = "";
    if (avatarLocalPath) {
      const avatar = await uploadOnCloudinary(avatarLocalPath);
      if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
      }
      avatarUrl = avatar.url;
    }

    // Generate verification code
    const generatedCode = crypto.randomBytes(3).toString("hex");
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store temporary data in memory store
    tempUserStore.set(email, {
      username,
      email,
      password,
      avatar: avatarUrl,
      verificationCode: generatedCode,
      codeExpiresAt,
    });

    // Send email with verification code
    await sendEmail(
      email,
      "Verify your email",
      `Hello ${username},\n\nYour verification code is: ${generatedCode}\nThis code will expire in 10 minutes.\n\nPlease use this code to complete your registration.`,
      username,
      generatedCode
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email },
          "Verification code sent to your email. Please provide the code to complete registration."
        )
      );
  }

  // If verification code is provided, verify and create user
  const tempUserData = tempUserStore.get(email);

  if (!tempUserData) {
    throw new ApiError(400, "No pending registration found for this email");
  }

  // Check if code has expired
  if (new Date() > new Date(tempUserData.codeExpiresAt)) {
    tempUserStore.delete(email);
    throw new ApiError(
      400,
      "Verification code has expired. Please start registration again."
    );
  }

  // Verify the code
  if (tempUserData.verificationCode !== verificationCode) {
    throw new ApiError(400, "Invalid verification code");
  }

  // Check again if user exists (safety check)
  if (existingUser) {
    tempUserStore.delete(email);
    throw new ApiError(409, "User already exists");
  }

  // Create the user now that email is verified
  const user = await User.create({
    username: tempUserData.username,
    email: tempUserData.email,
    avatar: tempUserData.avatar,
    password: tempUserData.password,
    isVerified: true,
  });

  tempUserStore.delete(email);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "Email verified successfully. User account created."
      )
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  // Get user details from req.user (set by auth middleware)
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  // Get user ID from authenticated user
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Authentication required");
  }

  // Find and delete the user
  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  // Clear authentication cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  // Validate input
  if (!email || !code) {
    throw new ApiError(400, "Email and code are required");
  }

  // Check if there's pending registration data
  const tempUserData = tempUserStore.get(email);

  if (!tempUserData) {
    throw new ApiError(400, "No pending registration found for this email");
  }

  // Check if code has expired
  if (new Date() > new Date(tempUserData.codeExpiresAt)) {
    tempUserStore.delete(email);
    throw new ApiError(
      400,
      "Verification code has expired. Please start registration again."
    );
  }

  // Verify the code
  if (tempUserData.verificationCode !== code) {
    throw new ApiError(400, "Invalid verification code");
  }

  // Check if user already exists (safety check)
  const existingUser = await User.findOne({
    $or: [{ username: tempUserData.username }, { email: tempUserData.email }],
  });

  if (existingUser) {
    tempUserStore.delete(email);
    throw new ApiError(409, "User already exists");
  }

  // Create the user now that email is verified
  const user = await User.create({
    username: tempUserData.username,
    email: tempUserData.email,
    avatar: tempUserData.avatar,
    password: tempUserData.password,
    isVerified: true,
  });

  // Clear temporary data
  tempUserStore.delete(email);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "Email verified successfully. User account created."
      )
    );
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { planType } = req.body;

  // Validate plan type
  if (!planType || !["monthly", "yearly"].includes(planType)) {
    throw new ApiError(400, "Invalid plan type. Must be 'monthly' or 'yearly'");
  }

  const userId = req.user._id;

  // Set amount based on plan type
  const amount = planType === "monthly" ? 5 : 50;

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "USD",
    receipt: `receipt_order_${crypto.randomBytes(10).toString("hex")}`,
    notes: {
      userId: userId.toString(),
      planType,
    },
  };

  try {
    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      throw new ApiError(500, "Failed to create Razorpay order");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          planType: planType,
        },
        `${
          planType === "monthly" ? "Monthly" : "Yearly"
        } plan order created successfully`
      )
    );
  } catch (error) {
    console.error("Razorpay order error:", error);
    throw new ApiError(500, "Razorpay order creation failed");
  }
});

// Google OAuth login
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google OAuth callback
const googleCallback = asyncHandler(async (req, res) => {
  try {
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      req.user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };

    // Redirect to frontend with tokens
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`
      );
  } catch (error) {
    console.error("Google callback error:", error);
    res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/login?error=auth_failed`
    );
  }
});

// Google login for existing users (alternative approach)
const googleLogin = asyncHandler(async (req, res) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    throw new ApiError(400, "Google token is required");
  }

  try {
    // Verify Google token
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`,
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
          Accept: "application/json",
        },
      }
    );

    const googleUser = await response.json();

    if (!googleUser.email) {
      throw new ApiError(400, "Failed to get user info from Google");
    }

    // Find user by email or Google ID
    let user = await User.findOne({
      $or: [{ email: googleUser.email }, { googleId: googleUser.id }],
    });

    if (!user) {
      // Create new user
      let avatarUrl = "";

      if (googleUser.picture) {
        try {
          const response = await fetch(googleUser.picture);
          const buffer = await response.buffer();
          const tempPath = `./public/temp/google_avatar_${googleUser.id}.jpg`;
          require("fs").writeFileSync(tempPath, buffer);

          const avatar = await uploadOnCloudinary(tempPath);
          if (avatar) {
            avatarUrl = avatar.url;
          }

          require("fs").unlinkSync(tempPath);
        } catch (avatarError) {
          console.log("Error uploading Google avatar:", avatarError);
        }
      }

      let username =
        googleUser.name?.replace(/\s+/g, "").toLowerCase() ||
        googleUser.email.split("@")[0];

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = `${username}_${Date.now()}`;
      }

      user = await User.create({
        googleId: googleUser.id,
        username,
        email: googleUser.email,
        avatar: avatarUrl,
        password: Math.random().toString(36).slice(-8),
        isVerified: true,
        authProvider: "google",
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUser.id;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "Logged in successfully with Google"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Google authentication failed");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  deleteUser,
  verifyEmail,
  createPaymentOrder,
  googleAuth,
  googleCallback,
  googleLogin,
};
