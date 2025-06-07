import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import session from "express-session";
import passport from "./config/passport.js"; // Import passport config

const app = express();
const upload = multer();

// for monthly resetting of Usage
import "./jobs/resetUsage.job.js";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Session configuration (required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route.js";
import fileRouter from "./routes/file.route.js";
import paymentRouter from "./routes/payment.route.js";
import cloudinaryRouter from "./routes/cloudinary.routes.js";

//routes decleration
app.use("/api/v2/users", userRouter);
app.use("/api/v2/files", fileRouter);
app.use("/api/v2/payments", paymentRouter);
app.use("/api/v2/cloudinary", cloudinaryRouter);

export default app;
