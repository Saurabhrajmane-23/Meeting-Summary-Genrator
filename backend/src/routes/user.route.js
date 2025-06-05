import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  deleteUser,
  verifyEmail,
  createPaymentOrder,
  googleAuth,
  googleCallback,
} from "../controllers/user.controller.js";

import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "../config/passport.js";

const router = Router();

// public routes
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/verify-email").post(verifyEmail);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/delete-account").delete(verifyJWT, deleteUser);
router.route("/create-payment").post(verifyJWT, createPaymentOrder);

// Google OAuth routes
router.route("/auth/google").get(googleAuth);
router.route("/auth/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=authentication_failed",
    session: true,
  }),
  googleCallback
);

export default router;
