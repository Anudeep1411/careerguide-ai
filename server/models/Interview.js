import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "Frontend Developer",
      trim: true,
    },
    level: {
      type: String,
      default: "Fresher",
      trim: true,
    },
    type: {
      type: String,
      default: "technical",
      trim: true,
    },
    questionCount: {
      type: Number,
      default: 5,
    },
    questions: {
      type: Array,
      default: [],
    },
    answers: {
      type: Array,
      default: [],
    },
    feedback: {
      type: Array,
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
