import express from "express";
import {
  getJobOffers,
  getCompanyReadiness,
} from "../controllers/jobOfferController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/offers", protect, getJobOffers);
router.post("/company-readiness", protect, getCompanyReadiness);

export default router;