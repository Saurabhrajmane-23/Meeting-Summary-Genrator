import { Router } from "express";
import {
  getUploadConfig,
  testAuth,
} from "../controllers/cloudinary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Test route
router.route("/test-auth").get(verifyJWT, testAuth);

// Get upload config
router.route("/upload-config").get(verifyJWT, getUploadConfig);

export default router;
