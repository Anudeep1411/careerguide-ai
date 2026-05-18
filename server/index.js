import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import analysisRoutes from "./routes/analysisRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobOfferRoutes from "./routes/jobOfferRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/* ----------------------------- CORS FIX ----------------------------- */
/* Beta testing kosam all origins allow chestunnam.
   Later final version lo CLIENT_URL ki restrict cheyyachu. */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ----------------------------- MIDDLEWARE ----------------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ----------------------------- HEALTH ROUTES ----------------------------- */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerGuide AI backend is running",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "CareerGuide AI API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "healthy",
    server: "CareerGuide AI Backend",
  });
});

/* ----------------------------- API ROUTES ----------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/job-offers", jobOfferRoutes);

/* ----------------------------- OPTIONAL DASHBOARD ROUTE ----------------------------- */
/* Frontend dashboard stats call crash kakunda fallback */
app.get("/api/dashboard/stats", (req, res) => {
  res.json({
    success: true,
    stats: {
      savedResumes: 0,
      resumeAnalyses: 0,
      jobMatches: 0,
      interviews: 0,
    },
  });
});

/* ----------------------------- 404 HANDLER ----------------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ----------------------------- ERROR HANDLER ----------------------------- */
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

/* ----------------------------- DB CONNECT + SERVER START ----------------------------- */
async function startServer() {
  try {
    if (!MONGO_URI || !MONGO_URI.startsWith("mongodb")) {
      throw new Error(
        'Invalid MONGO_URI. It must start with "mongodb://" or "mongodb+srv://".'
      );
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

startServer();