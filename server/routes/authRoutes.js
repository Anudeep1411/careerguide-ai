import express from "express";
import {
  signup,
  login,
  getProfile,
  demoLogin,
  forgotPasswordInfo,
  submitForgotPasswordRequest,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
  sendSignupOtp,
  verifySignupOtp,
  listResetRequests,
  setTemporaryPassword,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/demo", demoLogin);
router.get("/profile", protect, getProfile);

router.get("/forgot-password/info", forgotPasswordInfo);
router.post("/forgot-password/contact-admin", submitForgotPasswordRequest);
router.post("/forgot-password/request", submitForgotPasswordRequest);

router.post("/change-password", protect, changePassword);

router.get("/admin/reset-requests", listResetRequests);
router.post("/admin/set-temp-password", setTemporaryPassword);
router.post("/admin/reset-requests/:id/set-temp-password", setTemporaryPassword);

/* Old disabled OTP routes kept only to avoid route-not-found errors. */
router.post("/forgot-password/send-otp", sendForgotPasswordOtp);
router.post("/send-reset-otp", sendForgotPasswordOtp);
router.post("/forgot-password/reset", resetPasswordWithOtp);
router.post("/reset-password", resetPasswordWithOtp);
router.post("/send-signup-otp", sendSignupOtp);
router.post("/verify-signup-otp", verifySignupOtp);

export default router;
