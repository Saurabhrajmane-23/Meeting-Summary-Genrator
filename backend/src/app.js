import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import session from "express-session";
import passport from "./config/passport.js";

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

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Session configuration for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
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

// routes import
import userRouter from "./routes/user.route.js";
import fileRouter from "./routes/file.route.js";
import paymentRouter from "./routes/payment.route.js";

//routes decleration
app.use("/api/v2/users", userRouter);
app.use("/api/v2/files", fileRouter);
app.use("/api/v2/payments", paymentRouter);

export default app;
