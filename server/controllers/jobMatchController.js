import { PDFParse } from "pdf-parse";
import JobMatch from "../models/JobMatch.js";

const SKILL_BANK = [
  "html",
  "css",
  "javascript",
  "typescript",
  "react",
  "redux",
  "next.js",
  "node.js",
  "express",
  "mongodb",
  "mongoose",
  "sql",
  "mysql",
  "postgresql",
  "java",
  "python",
  "c",
  "c++",
  "dsa",
  "data structures",
  "algorithms",
  "git",
  "github",
  "tailwind",
  "bootstrap",
  "rest api",
  "api",
  "jwt",
  "authentication",
  "vite",
  "vercel",
  "render",
  "aws",
  "docker",
  "testing",
  "problem solving",
  "communication",
  "teamwork",
  "agile",
  "oops",
  "dbms",
  "os",
  "computer networks",
];

const ROLE_KEYWORDS = {
  "frontend developer": [
    "html",
    "css",
    "javascript",
    "react",
    "redux",
    "tailwind",
    "api",
    "git",
    "responsive",
  ],
  "backend developer": [
    "node.js",
    "express",
    "mongodb",
    "sql",
    "api",
    "jwt",
    "authentication",
    "database",
    "git",
  ],
  "full stack developer": [
    "html",
    "css",
    "javascript",
    "react",
    "node.js",
    "express",
    "mongodb",
    "api",
    "git",
  ],
  "java developer": ["java", "oops", "dsa", "sql", "spring", "api", "git"],
  "software developer": ["dsa", "javascript", "java", "python", "sql", "git", "problem solving"],
};

function normalizeText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value = "") {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function findSkills(text = "") {
  const normalized = normalizeText(text);

  return SKILL_BANK.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9+.#])${escaped}([^a-z0-9+.#]|$)`, "i");
    return pattern.test(normalized);
  }).map(titleCase);
}

function extractRequiredKeywords(jobDescription = "", targetRole = "") {
  const jobSkills = findSkills(jobDescription).map((item) => item.toLowerCase());
  const roleSkills = ROLE_KEYWORDS[normalizeText(targetRole)] || [];

  const importantWords = normalizeText(jobDescription)
    .split(/[^a-z0-9+.#]+/)
    .filter((word) => word.length >= 4)
    .filter(
      (word) =>
        ![
          "with",
          "from",
          "this",
          "that",
          "will",
          "have",
          "must",
          "good",
          "strong",
          "candidate",
          "experience",
          "knowledge",
          "skills",
          "work",
          "role",
          "team",
        ].includes(word)
    )
    .slice(0, 30);

  return unique([...jobSkills, ...roleSkills, ...importantWords]).slice(0, 25).map(titleCase);
}

function computeScore({ matchedSkills, missingSkills, resumeText, jobDescription }) {
  const totalSkills = matchedSkills.length + missingSkills.length;
  const skillScore = totalSkills ? Math.round((matchedSkills.length / totalSkills) * 70) : 25;

  const normalizedResume = normalizeText(resumeText);
  const normalizedJob = normalizeText(jobDescription);

  let contentScore = 0;
  if (normalizedResume.length > 900) contentScore += 10;
  if (normalizedResume.includes("project")) contentScore += 8;
  if (normalizedResume.includes("github") || normalizedResume.includes("live")) contentScore += 6;
  if (normalizedResume.includes("intern") || normalizedResume.includes("experience")) contentScore += 4;
  if (normalizedJob.includes("fresher") && normalizedResume.includes("fresher")) contentScore += 2;

  return Math.min(100, Math.max(5, skillScore + contentScore));
}

function chanceFromScore(score) {
  if (score >= 85) return "Very High";
  if (score >= 70) return "High";
  if (score >= 55) return "Medium";
  if (score >= 40) return "Low-Medium";
  return "Low";
}

function buildImprovements({ missingSkills, matchedSkills, targetRole, resumeText }) {
  const improvements = [];

  if (missingSkills.length) {
    improvements.push(`Add missing job keywords: ${missingSkills.slice(0, 8).join(", ")}.`);
  }

  if (!/github|live|demo/i.test(resumeText)) {
    improvements.push("Add GitHub and live demo links for your strongest projects.");
  }

  if (!/summary|profile|objective/i.test(resumeText)) {
    improvements.push("Add a short professional summary focused on the target role.");
  }

  if (!/impact|improved|reduced|increased|built|implemented/i.test(resumeText)) {
    improvements.push("Rewrite project bullets with action verbs like Built, Implemented, Improved and mention impact.");
  }

  if (matchedSkills.length < 4) {
    improvements.push("Add a dedicated Technical Skills section with role-specific skills.");
  }

  improvements.push(`Tailor the resume headline and project descriptions toward ${targetRole || "the target role"}.`);

  return unique(improvements).slice(0, 8);
}

function buildQuestions({ targetRole, matchedSkills, missingSkills }) {
  const role = targetRole || "this role";
  const skills = [...matchedSkills, ...missingSkills].slice(0, 6);
  const skillQuestions = skills.map((skill) => `Explain your experience with ${skill}. Where did you use it in a project?`);

  return unique([
    `Tell me about yourself and why you are suitable for ${role}.`,
    "Walk me through your best project from problem statement to deployment.",
    "How did you handle authentication, routing, APIs or database design in your project?",
    "What challenges did you face while building your project and how did you solve them?",
    ...skillQuestions,
    "Why should we shortlist you for this role?",
  ]).slice(0, 10);
}

function buildRoadmap({ missingSkills, targetRole, score }) {
  const role = targetRole || "your target role";
  const firstMissing = missingSkills.slice(0, 6);

  return [
    `Days 1-3: Read the job notification carefully and update resume headline, summary and skills for ${role}.`,
    `Days 4-10: Revise core skills: ${firstMissing.length ? firstMissing.join(", ") : "role-specific fundamentals and project basics"}.`,
    "Days 11-17: Improve two projects with clear features, tech stack, GitHub links and deployment links.",
    "Days 18-23: Practice expected interview questions and prepare short STAR-format answers.",
    "Days 24-30: Apply with tailored resume, revise weak areas and do one mock interview.",
    score < 60
      ? "Priority: strengthen missing skills before applying to highly competitive roles."
      : "Priority: apply soon, but keep tailoring your resume for each company.",
  ];
}

function analyzeMatch({ resumeText = "", jobDescription = "", targetRole = "", companyName = "" }) {
  const resumeSkills = findSkills(resumeText);
  const requiredKeywords = extractRequiredKeywords(jobDescription, targetRole);
  const requiredSkillKeywords = requiredKeywords.filter((keyword) =>
    SKILL_BANK.includes(keyword.toLowerCase())
  );

  const resumeSkillSet = new Set(resumeSkills.map((item) => item.toLowerCase()));
  const matchedSkills = requiredSkillKeywords.filter((skill) => resumeSkillSet.has(skill.toLowerCase()));
  const missingSkills = requiredSkillKeywords.filter((skill) => !resumeSkillSet.has(skill.toLowerCase()));

  const matchScore = computeScore({ matchedSkills, missingSkills, resumeText, jobDescription });
  const shortlistChance = chanceFromScore(matchScore);
  const resumeImprovements = buildImprovements({ missingSkills, matchedSkills, targetRole, resumeText });
  const expectedInterviewQuestions = buildQuestions({ targetRole, matchedSkills, missingSkills });
  const preparationRoadmap = buildRoadmap({ missingSkills, targetRole, score: matchScore });

  const executiveSummary = `${companyName ? `${companyName} ` : ""}${targetRole || "Job"} match is ${matchScore}/100 with ${shortlistChance} shortlist chance. ${
    missingSkills.length
      ? `Focus on ${missingSkills.slice(0, 5).join(", ")} before applying.`
      : "Your resume covers most important role keywords."
  }`;

  return {
    targetRole: targetRole || "Target Role",
    companyName: companyName || "",
    resumeText,
    jobDescription,
    matchScore,
    shortlistChance,
    matchedSkills: unique(matchedSkills.map(titleCase)),
    missingSkills: unique(missingSkills.map(titleCase)),
    requiredKeywords: unique(requiredKeywords),
    resumeImprovements,
    expectedInterviewQuestions,
    preparationRoadmap,
    executiveSummary,
  };
}

async function extractPdfText(file) {
  if (!file) return "";

  const parser = new PDFParse({ data: file.buffer });
  const parsed = await parser.getText();
  await parser.destroy();

  return parsed.text || "";
}

export const analyzeJobMatch = async (req, res) => {
  try {
    const { resumeText, jobDescription, targetRole, companyName } = req.body;

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required. Please paste resume text or select/upload a resume.",
      });
    }

    if (!jobDescription || jobDescription.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: "Job description text is required. Please paste job description or upload job notification PDF.",
      });
    }

    const analysis = analyzeMatch({ resumeText, jobDescription, targetRole, companyName });

    const saved = await JobMatch.create({
      user: req.user._id,
      targetRole: analysis.targetRole,
      companyName: analysis.companyName,
      resumeText: analysis.resumeText,
      jobDescription: analysis.jobDescription,
      matchScore: analysis.matchScore,
      shortlistChance: analysis.shortlistChance,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      requiredKeywords: analysis.requiredKeywords,
      resumeImprovements: analysis.resumeImprovements,
      expectedInterviewQuestions: analysis.expectedInterviewQuestions,
      preparationRoadmap: analysis.preparationRoadmap,
    });

    res.status(201).json({
      success: true,
      message: "Job match analysis completed",
      result: {
        id: saved._id,
        ...analysis,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Job match analysis failed",
      error: error.message,
    });
  }
};

export const analyzeJobMatchPdf = async (req, res) => {
  try {
    const resumePdf = req.files?.resumePdf?.[0];
    const jobPdf = req.files?.jobPdf?.[0];

    const resumeTextFromPdf = await extractPdfText(resumePdf);
    const jobTextFromPdf = await extractPdfText(jobPdf);

    const resumeText = [req.body.resumeText, resumeTextFromPdf].filter(Boolean).join("\n\n").trim();
    const jobDescription = [req.body.jobDescription, jobTextFromPdf].filter(Boolean).join("\n\n").trim();

    req.body.resumeText = resumeText;
    req.body.jobDescription = jobDescription;

    return analyzeJobMatch(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "PDF text extraction failed",
      error: error.message,
    });
  }
};

export const getJobMatches = async (req, res) => {
  try {
    const matches = await JobMatch.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);

    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load job match history",
      error: error.message,
    });
  }
};
