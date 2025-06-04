import crypto from "crypto";
import { User } from "../models/user.model.js";

export const razorpayWebhookHandler = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const payload = req.body.toString("utf8");

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.log("Invalid signature");
    return res.status(400).json({ success: false });
  }

  const event = JSON.parse(payload);
  console.log("Webhook Event:", event);

  if (event.event === "payment.captured") {
    const notes = event.payload.payment.entity.notes;
    const userId = notes.userId;
    const planType = notes.planType;
    console.log("Hurray payment is captured");

    const user = await User.findById(userId);
    if (user) {
      user.plan = "pro";
      user.planStartedAt = new Date();
      await user.save();
      console.log(`Upgraded user ${user.email} to ${planType}`);
    } else {
      console.log("user not found in razorpayWebhookHandler");
    }
  }

  res.status(200).json({ success: true });
};
