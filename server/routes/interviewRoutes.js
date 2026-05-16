import express from "express";
import {
  startInterview,
  submitAnswer,
  getMyInterviews,
  getSingleInterview,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/answer", protect, submitAnswer);
router.get("/", protect, getMyInterviews);
router.get("/:id", protect, getSingleInterview);

export default router;