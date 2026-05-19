import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
  {
    themeColor: { type: String, default: "#4f46e5" },
    fontSize: { type: String, enum: ["small", "normal", "large"], default: "normal" },
    spacing: { type: String, enum: ["compact", "normal", "spacious"], default: "normal" },
    showSections: {
      summary: { type: Boolean, default: true },
      objective: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      languages: { type: Boolean, default: true },
      interests: { type: Boolean, default: true },
      customSections: { type: Boolean, default: true },
    },
    sectionTitles: {
      summary: { type: String, default: "Profile Summary" },
      objective: { type: String, default: "Career Objective" },
      skills: { type: String, default: "Technical Skills" },
      education: { type: String, default: "Education" },
      projects: { type: String, default: "Projects" },
      experience: { type: String, default: "Experience / Internship" },
      certifications: { type: String, default: "Certifications" },
      achievements: { type: String, default: "Achievements" },
      languages: { type: String, default: "Languages" },
      interests: { type: String, default: "Interests" },
      customSections: { type: String, default: "Additional Information" },
    },
  },
  { _id: false }
);

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
    customization: {
      type: customizationSchema,
      default: () => ({}),
    },
    resumeChecklist: {
      hasGithub: { type: Boolean, default: false },
      hasLinkedin: { type: Boolean, default: false },
      hasPortfolio: { type: Boolean, default: false },
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
