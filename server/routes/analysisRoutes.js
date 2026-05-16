import express from "express";
import {
  analyzeResume,
  getMyAnalyses,
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, analyzeResume);
router.get("/", protect, getMyAnalyses);

export default router;