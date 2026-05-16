import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Resume",
    },

    personalDetails: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      location: { type: String, default: "" },

      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      portfolio: { type: String, default: "" },

      leetcode: { type: String, default: "" },
      hackerrank: { type: String, default: "" },
      codechef: { type: String, default: "" },
      geeksforgeeks: { type: String, default: "" },
    },

    careerDetails: {
      targetRole: { type: String, default: "Fresher" },
      experienceLevel: { type: String, default: "Fresher" },
      careerObjective: { type: String, default: "" },
      professionalSummary: { type: String, default: "" },
    },

    education: [
      {
        degree: { type: String, default: "" },
        college: { type: String, default: "" },
        university: { type: String, default: "" },
        year: { type: String, default: "" },
        score: { type: String, default: "" },
        coursework: { type: String, default: "" },
      },
    ],

    skills: {
      programmingLanguages: [{ type: String }],
      frontend: [{ type: String }],
      backend: [{ type: String }],
      databases: [{ type: String }],
      tools: [{ type: String }],
      softSkills: [{ type: String }],
    },

    projects: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        techStack: { type: String, default: "" },
        features: { type: String, default: "" },
        challenges: { type: String, default: "" },
        githubLink: { type: String, default: "" },
        liveLink: { type: String, default: "" },
      },
    ],

    experience: [
      {
        company: { type: String, default: "" },
        role: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    certifications: [
      {
        title: { type: String, default: "" },
        issuer: { type: String, default: "" },
        year: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],

    achievements: [
      {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],

    languages: [{ type: String }],
    interests: [{ type: String }],

    customSections: [
      {
        heading: { type: String, default: "" },
        content: { type: String, default: "" },
      },
    ],

    template: {
      layout: { type: String, default: "Minimal ATS" },
      color: { type: String, default: "Indigo" },
      variant: { type: String, default: "Classic" },
    },

    resumeChecklist: {
      hasGithub: { type: Boolean, default: false },
      hasLinkedin: { type: Boolean, default: false },
      hasLiveProject: { type: Boolean, default: false },
      hasCodingProfile: { type: Boolean, default: false },
      hasStrongProjects: { type: Boolean, default: false },
      hasAtsKeywords: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;