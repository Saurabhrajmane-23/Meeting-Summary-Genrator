import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { PLAN_LIMITS } from "../constants.js";

// Middleware to check user's plan limits
export const checkPlanLimit = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // If somehow user is not attached, throw error
  if (!user) {
    throw new ApiError(401, "Unauthorized - user not found");
  }

  // Get limit for the user's current plan
  const planLimit = PLAN_LIMITS[user.plan];

  // Handle case where plan doesn't exist in PLAN_LIMITS
  if (planLimit === undefined || planLimit === null) {
    console.error("Plan not found in PLAN_LIMITS:", user.plan);
    throw new ApiError(400, "Invalid user plan");
  }

  // Ensure user has required fields
  if (user.meetingCount === undefined || user.meetingCount === null) {
    user.meetingCount = 0;
  }

  // Reset meeting count if a new month has started
  const now = new Date();
  const lastReset = user.lastReset ? new Date(user.lastReset) : new Date(0);

  const isNewMonth =
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewMonth) {
    console.log("🔄 Resetting meeting count for new month");
    user.meetingCount = 0;
    user.lastReset = now;

    try {
      await user.save();
      console.log("✅ User meeting count reset successfully");
    } catch (error) {
      console.error("❌ Error saving user after reset:", error);
      throw new ApiError(500, "Failed to reset meeting count");
    }
  }

  // If limit exceeded, block the request
  if (user.meetingCount >= planLimit) {
    console.log("Meeting limit exceeded - blocking request");
    throw new ApiError(
      469,
      `Monthly meeting limit exceeded (${user.meetingCount}/${planLimit}). Please upgrade your plan.`
    );
  }

  next();
});
