import express from "express";
import { razorpayWebhookHandler } from "../controllers/payment.controller.js";

const router = express.Router();

router.post(
  "/razorpay/webhook",
  express.raw({ type: "*/*" }),
  razorpayWebhookHandler
);

export default router;
