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
      required: true,
    },

    level: {
      type: String,
      default: "Beginner",
    },

    type: {
      type: String,
      default: "Technical",
    },

    questions: [
      {
        question: String,
        userAnswer: {
          type: String,
          default: "",
        },
        score: {
          type: Number,
          default: 0,
        },
        correctPoints: [String],
        missingPoints: [String],
        betterAnswer: {
          type: String,
          default: "",
        },
        followUpQuestion: {
          type: String,
          default: "",
        },
        weakArea: {
          type: String,
          default: "",
        },
      },
    ],

    overallScore: {
      type: Number,
      default: 0,
    },

    weakAreas: [String],

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