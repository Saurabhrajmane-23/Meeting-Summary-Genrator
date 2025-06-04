import crypto from "crypto";
import { User } from "../models/user.model.js";

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

    user.plan = planType;
    user.planStartedAt = new Date();
    user.meetingCount = 0;
    await user.save();

    res.status(200).json({ success: true, message: "Plan upgraded" });
  } catch (error) {
    console.error("verifyPayment error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
