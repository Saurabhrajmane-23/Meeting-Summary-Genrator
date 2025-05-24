import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile, processAudio } from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload.single("file"), uploadFile);
router.route("/process/:fileId").post(processAudio);

export default router;
