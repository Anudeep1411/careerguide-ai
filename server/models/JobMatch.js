import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
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

    companyName: {
      type: String,
      default: "",
    },

    resumeText: {
      type: String,
      required: true,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    matchScore: {
      type: Number,
      default: 0,
    },

    shortlistChance: {
      type: String,
      default: "Low",
    },

    matchedSkills: [String],

    missingSkills: [String],

    requiredKeywords: [String],

    resumeImprovements: [String],

    expectedInterviewQuestions: [String],

    preparationRoadmap: [String],
  },
  { timestamps: true }
);

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

export default JobMatch;