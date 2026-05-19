import express from "express";
import {
  startInterview,
  answerInterview,
  getInterviews,
  getInterviewById,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/answer", protect, answerInterview);
router.get("/", protect, getInterviews);
router.get("/:id", protect, getInterviewById);

export default router;
