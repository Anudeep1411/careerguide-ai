import mongoose from "mongoose";

const resetRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["contact_admin", "temporary_password_set", "completed", "closed"],
      default: "contact_admin",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    temporaryPasswordSetAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ResetRequest = mongoose.model("ResetRequest", resetRequestSchema);

export default ResetRequest;
