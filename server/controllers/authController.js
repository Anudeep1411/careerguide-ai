import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

async function createOtpAndSendEmail({ email, purpose }) {
  const otp = generateOtp();

  await Otp.deleteMany({
    email,
    purpose,
    used: false,
  });

  const otpHash = await bcrypt.hash(otp, 10);
  const expiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 5);

  await Otp.create({
    email,
    otpHash,
    purpose,
    expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000),
  });
  console.log("====================================");
console.log("CAREERGUIDE AI RESET/SIGNUP OTP GENERATED");
console.log("Email:", email);
console.log("Purpose:", purpose);
console.log("OTP:", otp);
console.log("Expires in minutes:", expiresMinutes);
console.log("====================================");
  const purposeText =
    purpose === "signup" ? "complete your signup" : "reset your password";

  await sendEmail({
    to: email,
    subject: `CareerGuide AI OTP - ${otp}`,
    text: `Your CareerGuide AI OTP is ${otp}. Use it to ${purposeText}. This OTP expires in ${expiresMinutes} minutes.`,
    html: `
      <h2>CareerGuide AI Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in ${expiresMinutes} minutes.</p>
    `,
  });

  return otp;
}

async function verifyOtp({ email, otp, purpose }) {
  const otpRecord = await Otp.findOne({
    email,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return {
      success: false,
      message: "OTP expired or not found",
    };
  }

  if (otpRecord.attempts >= 5) {
    return {
      success: false,
      message: "Too many wrong attempts. Please request a new OTP.",
    };
  }

  const isOtpCorrect = await bcrypt.compare(String(otp), otpRecord.otpHash);

  if (!isOtpCorrect) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  otpRecord.used = true;
  await otpRecord.save();

  return {
    success: true,
  };
}

export const sendSignupOtp = async (req, res) => {
  try {
    const { name, email, targetRole } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login or reset password.",
      });
    }

    await createOtpAndSendEmail({
      email: cleanEmail,
      purpose: "signup",
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
      data: {
        name,
        email: cleanEmail,
        targetRole: targetRole || "Fresher",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send signup OTP",
      error: error.message,
    });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { name, email, password, targetRole, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and OTP are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    const otpResult = await verifyOtp({
      email: cleanEmail,
      otp,
      purpose: "signup",
    });

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
      });
    }

    // IMPORTANT:
    // Plain password pampistunnam.
    // User model pre-save hook password ni hash chesthundi.
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      targetRole: targetRole || "Fresher",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Signup completed successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup verification failed",
      error: error.message,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Plain password only. User model hashes it once.
    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      targetRole: targetRole || "Fresher",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Signup failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    await createOtpAndSendEmail({
      email: cleanEmail,
      purpose: "reset",
    });

    res.json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const otpResult = await verifyOtp({
      email: cleanEmail,
      otp,
      purpose: "reset",
    });

    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message,
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // save() use chesthe User model pre-save hook hash chesthundi.
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const demoEmail = `demo${Date.now()}@careerguide.ai`;

    // Plain password only. User model hashes it once.
    const user = await User.create({
      name: "Demo User",
      email: demoEmail,
      password: "123456",
      targetRole: "Frontend Developer",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Demo account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Demo login failed",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};