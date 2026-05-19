import express from "express";
import multer from "multer";
import {
  analyzeJobMatch,
  analyzeJobMatchPdf,
  getJobMatches,
} from "../controllers/jobMatchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});

router.get("/", protect, getJobMatches);
router.post("/", protect, analyzeJobMatch);
router.post(
  "/pdf",
  protect,
  upload.fields([
    { name: "resumePdf", maxCount: 1 },
    { name: "jobPdf", maxCount: 1 },
  ]),
  analyzeJobMatchPdf
);

export default router;
