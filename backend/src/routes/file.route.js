import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPlanLimit } from "../middlewares/plan.middleware.js";
import {
  uploadFile,
  processAudio,
  getAllFiles,
  deleteFile,
  transcribeAudio,
  downloadSummaryPDF,
  getFileProcessingPercentage,
} from "../controllers/file.controller.js";

const router = Router();

router.route("/upload").post(verifyJWT, upload.single("file"), uploadFile);
router.route("/process/:fileId").post(verifyJWT, checkPlanLimit, processAudio); // add checkplanlimit middleware after its fixed.
router.route("/").get(verifyJWT, getAllFiles);
router.route("/delete/:fileId").delete(verifyJWT, deleteFile);
router.route("/transcribe/:fileId").post(verifyJWT, transcribeAudio);
router.route("/summary/:fileId/pdf").get(verifyJWT, downloadSummaryPDF);
router.route(":fileId/progress").get(verifyJWT, getFileProcessingPercentage);

export default router;
