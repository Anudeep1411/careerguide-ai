import mongoose from "mongoose";

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    skillsFound: [String],
    missingSkills: [String],
    weakSections: [String],
    suggestions: [String],
    improvedSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ResumeAnalysis = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);

export default ResumeAnalysis;