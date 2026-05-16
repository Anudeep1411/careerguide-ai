import JobMatch from "../models/JobMatch.js";

const commonSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "REST API",
  "JWT",
  "Git",
  "GitHub",
  "Tailwind",
  "TypeScript",
  "Java",
  "Python",
  "DSA",
  "OOP",
  "Deployment",
  "Vercel",
  "Render",
  "Authentication",
  "Responsive Design",
];

function extractRequiredKeywords(jobDescription) {
  const text = jobDescription.toLowerCase();

  return commonSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );
}

function calculateJobMatch(resumeText, jobDescription, targetRole) {
  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();

  const requiredKeywords = extractRequiredKeywords(jobDescription);

  const matchedSkills = requiredKeywords.filter((skill) =>
    resume.includes(skill.toLowerCase())
  );

  const missingSkills = requiredKeywords.filter(
    (skill) => !resume.includes(skill.toLowerCase())
  );

  let score = 30;

  if (requiredKeywords.length > 0) {
    score += Math.round((matchedSkills.length / requiredKeywords.length) * 50);
  }

  if (resume.includes("project")) score += 5;
  if (resume.includes("github")) score += 5;
  if (resume.includes("deployment") || resume.includes("vercel") || resume.includes("render")) {
    score += 5;
  }
  if (resume.includes(targetRole.toLowerCase())) score += 5;

  score = Math.min(score, 100);

  let shortlistChance = "Low";

  if (score >= 80) {
    shortlistChance = "High";
  } else if (score >= 60) {
    shortlistChance = "Moderate";
  }

  const resumeImprovements = [];

  if (missingSkills.length > 0) {
    resumeImprovements.push(
      `Add or improve these required skills in your resume: ${missingSkills.join(", ")}`
    );
  }

  if (!resume.includes("project")) {
    resumeImprovements.push("Add a strong projects section with real-world project details.");
  }

  if (!resume.includes("github")) {
    resumeImprovements.push("Add GitHub profile and project repository links.");
  }

  if (!resume.includes("deployment") && !resume.includes("vercel") && !resume.includes("render")) {
    resumeImprovements.push("Add live deployment links for your projects.");
  }

  resumeImprovements.push(
    "Rewrite project bullets using: Built + Technology + Feature + Impact format."
  );

  const expectedInterviewQuestions = [
    `Tell me about yourself as a ${targetRole}.`,
    "Explain your best project in detail.",
    "What challenges did you face while building your project?",
    "How did you deploy your project?",
    "Explain your technical skills mentioned in resume.",
    "Why should we shortlist you for this role?",
  ];

  missingSkills.slice(0, 5).forEach((skill) => {
    expectedInterviewQuestions.push(`What is your experience with ${skill}?`);
  });

  const preparationRoadmap = [
    "Improve resume keywords based on job description.",
    "Prepare explanation for each project in your resume.",
    "Revise required technical skills mentioned in the job description.",
    "Practice common HR questions and project-based questions.",
    "Prepare 2-minute self introduction for this job role.",
  ];

  if (missingSkills.length > 0) {
    preparationRoadmap.push(
      `Focus first on missing skills: ${missingSkills.slice(0, 5).join(", ")}`
    );
  }

  return {
    matchScore: score,
    shortlistChance,
    matchedSkills,
    missingSkills,
    requiredKeywords,
    resumeImprovements,
    expectedInterviewQuestions,
    preparationRoadmap,
  };
}

export const analyzeJobMatch = async (req, res) => {
  try {
    const { resumeText, jobDescription, targetRole, companyName } = req.body;

    if (!resumeText || !jobDescription || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Resume text, job description and target role are required",
      });
    }

    const result = calculateJobMatch(resumeText, jobDescription, targetRole);

    const jobMatch = await JobMatch.create({
      user: req.user._id,
      resumeText,
      jobDescription,
      targetRole,
      companyName,
      ...result,
    });

    res.status(201).json({
      success: true,
      message: "Job match analyzed successfully",
      jobMatch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Job match analysis failed",
      error: error.message,
    });
  }
};

export const getMyJobMatches = async (req, res) => {
  try {
    const jobMatches = await JobMatch.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: jobMatches.length,
      jobMatches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job matches",
      error: error.message,
    });
  }
};