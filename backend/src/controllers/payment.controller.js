import crypto from "crypto";
import { User } from "../models/user.model.js"; 

export const razorpayWebhookHandler = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }

  const event = req.body;

  if (event.event === "payment.captured") {
    const notes = event.payload.payment.entity.notes;
    const userId = notes.userId;
    const planType = notes.planType;

    const user = await User.findById(userId);
    if (user) {
      user.plan = planType;
      user.planStartedAt = new Date();
      await user.save();
      console.log(`Upgraded user ${user.email} to ${planType}`);
    }
  }

  res.status(200).json({ success: true });
};
