import ResumeAnalysis from "../models/ResumeAnalysis.js";

const roleSkills = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Tailwind",
    "Git",
    "Responsive Design",
  ],
  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "REST API",
    "JWT",
  ],
  "MERN Stack Developer": [
    "MongoDB",
    "Express",
    "React",
    "Node.js",
    "JavaScript",
    "REST API",
    "JWT",
  ],
  "Java Developer": [
    "Java",
    "OOP",
    "Spring Boot",
    "SQL",
    "DSA",
    "REST API",
  ],
  "Data Analyst": [
    "Excel",
    "SQL",
    "Python",
    "Power BI",
    "Data Cleaning",
    "Statistics",
  ],
};

function analyzeResumeText(resumeText, targetRole) {
  const text = resumeText.toLowerCase();
  const requiredSkills = roleSkills[targetRole] || roleSkills["Frontend Developer"];

  const skillsFound = requiredSkills.filter((skill) =>
    text.includes(skill.toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !text.includes(skill.toLowerCase())
  );

  let score = 40;

  score += skillsFound.length * 7;

  if (text.includes("project")) score += 10;
  if (text.includes("github")) score += 8;
  if (text.includes("deployment") || text.includes("vercel")) score += 8;
  if (text.includes("internship")) score += 6;
  if (text.includes("certification")) score += 5;

  score = Math.min(score, 100);

  const weakSections = [];

  if (!text.includes("project")) weakSections.push("Projects section is weak or missing");
  if (!text.includes("github")) weakSections.push("GitHub link is missing");
  if (!text.includes("deployment") && !text.includes("vercel")) {
    weakSections.push("Deployment/live project link is missing");
  }
  if (!text.includes("summary") && !text.includes("objective")) {
    weakSections.push("Professional summary/objective can be improved");
  }

  const suggestions = [
    "Add role-specific keywords from the job description.",
    "Improve project bullets with tech stack, problem solved and impact.",
    "Add GitHub and live deployment links for projects.",
    "Mention measurable achievements wherever possible.",
    "Keep resume ATS-friendly with clear section headings.",
  ];

  const improvedSummary = `Motivated ${targetRole} with hands-on experience in building web projects, strong problem-solving skills, and interest in creating real-world applications.`;

  return {
    atsScore: score,
    skillsFound,
    missingSkills,
    weakSections,
    suggestions,
    improvedSummary,
  };
}

export const analyzeResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText || !targetRole) {
      return res.status(400).json({
        success: false,
        message: "Resume text and target role are required",
      });
    }

    const result = analyzeResumeText(resumeText, targetRole);

    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      resumeText,
      targetRole,
      ...result,
    });

    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

export const getMyAnalyses = async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume analyses",
      error: error.message,
    });
  }
};