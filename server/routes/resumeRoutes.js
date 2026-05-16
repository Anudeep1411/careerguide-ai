import express from "express";
import {
  createResume,
  getMyResumes,
  getSingleResume,
  updateResume,
  deleteResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResume);
router.get("/", protect, getMyResumes);
router.get("/:id", protect, getSingleResume);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);

export default router;