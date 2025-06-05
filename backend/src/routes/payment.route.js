import express from "express";
import { verifyPaymentAndUpgradeUser } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/verify-payment", verifyJWT, verifyPaymentAndUpgradeUser);

export default router;