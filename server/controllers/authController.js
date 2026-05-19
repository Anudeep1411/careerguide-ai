import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ResetRequest from "../models/ResetRequest.js";

const TEMP_PASSWORD_VALID_HOURS = 24;
const ADMIN_CONTACT_EMAIL = "carrerguideai@gmail.com";

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const makePublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  targetRole: user.targetRole,
  forcePasswordChange: user.forcePasswordChange,
});

const generateTemporaryPassword = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const isAdminRequest = (req) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const incomingSecret =
    req.headers["x-admin-secret"] || req.body?.adminSecret || req.query?.adminSecret;

  return Boolean(adminSecret && incomingSecret && incomingSecret === adminSecret);
};

function requireAdmin(req, res) {
  if (!process.env.ADMIN_SECRET) {
    res.status(500).json({
      success: false,
      message: "ADMIN_SECRET is not configured on server",
    });
    return false;
  }

  if (!isAdminRequest(req)) {
    res.status(401).json({
      success: false,
      message: "Admin access denied",
    });
    return false;
  }

  return true;
}

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

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      targetRole: targetRole || "Fresher",
      forcePasswordChange: false,
      tempPasswordExpiresAt: null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: makePublicUser(user),
      mustChangePassword: false,
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

    if (
      user.forcePasswordChange &&
      user.tempPasswordExpiresAt &&
      user.tempPasswordExpiresAt < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Temporary password expired. Please contact admin again.",
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
      message: user.forcePasswordChange
        ? "Login successful. Please change your temporary password."
        : "Login successful",
      token,
      user: makePublicUser(user),
      mustChangePassword: user.forcePasswordChange,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export const forgotPasswordInfo = async (req, res) => {
  res.json({
    success: true,
    message:
      "Please contact admin with your registered email. Admin will verify and share a temporary password.",
    adminEmail: ADMIN_CONTACT_EMAIL,
  });
};

export const submitForgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Registered email is required",
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

    const request = await ResetRequest.create({
      user: user._id,
      email: cleanEmail,
      status: "contact_admin",
      requestedAt: new Date(),
      adminNotes: "User was instructed to contact admin manually.",
    });

    res.json({
      success: true,
      message:
        "Reset help noted. Please contact admin with your registered email.",
      adminEmail: ADMIN_CONTACT_EMAIL,
      request: {
        id: request._id,
        email: request.email,
        status: request.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit reset help request",
      error: error.message,
    });
  }
};

export const listResetRequests = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const requests = await ResetRequest.find({})
      .populate("user", "name email targetRole forcePasswordChange tempPasswordExpiresAt")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load reset requests",
      error: error.message,
    });
  }
};

export const setTemporaryPassword = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { email, requestId, temporaryPassword, adminNotes } = req.body;

    if (!email && !requestId) {
      return res.status(400).json({
        success: false,
        message: "Email or requestId is required",
      });
    }

    let request = null;
    let user = null;

    if (requestId) {
      request = await ResetRequest.findById(requestId);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Reset request not found",
        });
      }

      user = await User.findById(request.user);
    } else {
      const cleanEmail = normalizeEmail(email);
      user = await User.findOne({ email: cleanEmail });

      request = await ResetRequest.findOne({
        email: cleanEmail,
        status: { $in: ["contact_admin", "temporary_password_set"] },
      }).sort({ createdAt: -1 });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tempPassword = temporaryPassword || generateTemporaryPassword();

    if (tempPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Temporary password must be at least 6 characters",
      });
    }

    user.password = tempPassword;
    user.forcePasswordChange = true;
    user.tempPasswordExpiresAt = new Date(
      Date.now() + TEMP_PASSWORD_VALID_HOURS * 60 * 60 * 1000
    );

    await user.save();

    if (!request) {
      request = await ResetRequest.create({
        user: user._id,
        email: user.email,
        status: "temporary_password_set",
        requestedAt: new Date(),
        temporaryPasswordSetAt: new Date(),
        adminNotes: adminNotes || "Temporary password created by admin",
      });
    } else {
      request.status = "temporary_password_set";
      request.temporaryPasswordSetAt = new Date();
      request.adminNotes = adminNotes || request.adminNotes || "";
      await request.save();
    }

    console.log("====================================");
    console.log("TEMPORARY PASSWORD SET BY ADMIN");
    console.log("Email:", user.email);
    console.log("Temporary Password:", tempPassword);
    console.log("Expires:", user.tempPasswordExpiresAt);
    console.log("====================================");

    res.json({
      success: true,
      message: "Temporary password created successfully",
      email: user.email,
      temporaryPassword: tempPassword,
      expiresAt: user.tempPasswordExpiresAt,
      request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set temporary password",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.forcePasswordChange = false;
    user.tempPasswordExpiresAt = null;
    await user.save();

    await ResetRequest.updateMany(
      {
        user: user._id,
        status: { $in: ["contact_admin", "temporary_password_set"] },
      },
      {
        status: "completed",
        completedAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Password changed successfully",
      user: makePublicUser(user),
      mustChangePassword: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const demoEmail = `demo${Date.now()}@careerguide.ai`;

    const user = await User.create({
      name: "Demo User",
      email: demoEmail,
      password: "123456",
      targetRole: "Frontend Developer",
      forcePasswordChange: false,
      tempPasswordExpiresAt: null,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Demo account created successfully",
      token,
      user: makePublicUser(user),
      mustChangePassword: false,
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

export const sendForgotPasswordOtp = forgotPasswordInfo;
export const resetPasswordWithOtp = async (req, res) => {
  res.status(410).json({
    success: false,
    message:
      "OTP reset is disabled. Contact admin at carrerguideai@gmail.com for a temporary password.",
    adminEmail: ADMIN_CONTACT_EMAIL,
  });
};
export const sendSignupOtp = async (req, res) => {
  res.status(410).json({
    success: false,
    message: "Signup OTP is disabled. Please create account directly.",
  });
};
export const verifySignupOtp = async (req, res) => {
  res.status(410).json({
    success: false,
    message: "Signup OTP verification is disabled. Please create account directly.",
  });
};
