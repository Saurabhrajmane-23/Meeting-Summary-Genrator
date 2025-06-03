import express from "express";
import { razorpayWebhookHandler } from "../controllers/payment.controller.js";

const router = express.Router();

// Route to handle Razorpay webhook events
router.post("/razorpay/webhook", express.json(), razorpayWebhookHandler);

export default router;
