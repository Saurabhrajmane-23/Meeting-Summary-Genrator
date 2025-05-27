import { registerUser, loginUser, logoutUser, getUserProfile, deleteUser } from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/profile").get(verifyJWT, getUserProfile);
router.route("/delete-account").delete(verifyJWT, deleteUser);

export default router;
