import express from "express";
import {
  analyzeJobMatch,
  getMyJobMatches,
} from "../controllers/jobMatchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, analyzeJobMatch);
router.get("/", protect, getMyJobMatches);

export default router;