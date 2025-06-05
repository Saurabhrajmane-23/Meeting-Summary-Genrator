import crypto from "crypto";
import { User } from "../models/user.model.js";
import sendEmail from "../utils/nodeMailer.js";

export const verifyPaymentAndUpgradeUser = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Get user from token (if using auth middleware)
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Calculate plan expiry date
    const planStartDate = new Date();
    let planExpiryDate;

    if (planType === "monthly") {
      planExpiryDate = new Date(planStartDate);
      planExpiryDate.setMonth(planExpiryDate.getMonth() + 1);
    } else if (planType === "yearly") {
      planExpiryDate = new Date(planStartDate);
      planExpiryDate.setFullYear(planExpiryDate.getFullYear() + 1);
    }

    user.plan = planType;
    user.planStartedAt = planStartDate;
    user.planExpiresAt = planExpiryDate;
    user.meetingCount = 0;
    await user.save();

    // Send congratulatory email
    try {
      const planName = planType === "monthly" ? "Monthly" : "Yearly";
      const planPrice = planType === "monthly" ? "$5/month" : "$50/year";
      const planFeatures =
        planType === "monthly"
          ? "Up to 50 meeting summaries per month"
          : "Unlimited meeting summaries";

      const emailSubject = `🎉 Welcome to ${planName} Plan - Payment Successful!`;

      const emailText = `Hello ${user.username},

Congratulations! Your payment has been successfully processed and your ${planName} plan is now active.

Plan Details:
- Plan: ${planName} Plan (${planPrice})
- Features: ${planFeatures}
- Started: ${planStartDate.toLocaleDateString()}
- Expires: ${planExpiryDate.toLocaleDateString()}
- Payment ID: ${razorpay_payment_id}

You can now enjoy all the premium features of Meet Beater AI. Start creating amazing meeting summaries with our advanced AI technology!

Thank you for choosing Meet Beater AI.

Best regards,
The Meet Beater AI Team`;

      const paymentData = {
        username: user.username,
        planType: planName,
        planPrice: planPrice,
        planFeatures: planFeatures,
        planStartDate: planStartDate.toLocaleDateString(),
        planExpiryDate: planExpiryDate.toLocaleDateString(),
        paymentId: razorpay_payment_id,
      };

      await sendEmail(
        user.email,
        emailSubject,
        emailText,
        user.username,
        "", // No verification code needed
        "payment_success", // Email type
        paymentData // Payment data for template
      );

      console.log(
        `Congratulatory email sent to ${user.email} for ${planName} plan`
      );
    } catch (emailError) {
      console.error("Failed to send congratulatory email:", emailError);
      // Don't fail the payment verification if email fails
    }

    res.status(200).json({
      success: true,
      message: "Plan upgraded successfully",
      data: {
        plan: user.plan,
        planStartedAt: user.planStartedAt,
        planExpiresAt: user.planExpiresAt,
      },
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
