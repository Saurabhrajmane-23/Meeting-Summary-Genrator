import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

const app = express();
const upload = multer();

// for monthly resetting of Usage
import "./jobs/resetUsage.job.js";

// for monthly reset of plan
import "./jobs/resetPlan.job.js";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import fileRouter from "./routes/file.route.js";
import paymentRouter from "./routes/payment.route.js";

//routes decleration
app.use("/api/v2/users", userRouter);
app.use("/api/v2/files", fileRouter);
app.use("/api/v2/payments", paymentRouter);

export default app;
