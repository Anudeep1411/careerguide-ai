import express from "express";
import {
  signup,
  login,
  getProfile,
  sendSignupOtp,
  verifySignupOtp,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
  demoLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/send-signup-otp", sendSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);

router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.post("/send-reset-otp", sendForgotPasswordOtp);
router.post("/reset-password", resetPasswordWithOtp);
router.post("/demo", demoLogin);

router.get("/profile", protect, getProfile);

export default router;