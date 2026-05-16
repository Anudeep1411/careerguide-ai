const companyProfiles = [
  {
    company: "TCS",
    type: "Service Based",
    requiredSkills: ["Java", "SQL", "OOP", "DSA", "Communication", "Aptitude", "Git"],
    expectedQuestions: [
      "Tell me about yourself.",
      "Explain OOP concepts.",
      "What is SQL?",
      "Explain your project.",
      "What is time complexity?",
    ],
  },
  {
    company: "Accenture",
    type: "Service Based",
    requiredSkills: ["JavaScript", "Java", "SQL", "Cloud", "Communication", "Git", "React"],
    expectedQuestions: [
      "Explain your project architecture.",
      "What is REST API?",
      "What is cloud computing?",
      "Explain JavaScript basics.",
      "Why Accenture?",
    ],
  },
  {
    company: "Wipro",
    type: "Service Based",
    requiredSkills: ["Java", "SQL", "OOP", "Testing", "Communication", "Aptitude", "DSA"],
    expectedQuestions: [
      "Explain OOP principles.",
      "What is testing?",
      "Explain SQL joins.",
      "Tell me about your project.",
      "Why Wipro?",
    ],
  },
  {
    company: "Google",
    type: "Product Based",
    requiredSkills: ["DSA", "Algorithms", "System Design", "Problem Solving", "Java", "Python", "C++"],
    expectedQuestions: [
      "Solve a DSA problem and explain complexity.",
      "Explain system design basics.",
      "How do you optimize performance?",
      "Explain your most difficult project.",
    ],
  },
  {
    company: "Amazon",
    type: "Product Based",
    requiredSkills: ["DSA", "OOP", "System Design", "Java", "Python", "Problem Solving", "Scalability"],
    expectedQuestions: [
      "Explain OOP concepts.",
      "Solve a coding problem.",
      "Explain your project.",
      "Tell me about a difficult problem you solved.",
    ],
  },
];

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
  "C++",
  "DSA",
  "OOP",
  "Algorithms",
  "System Design",
  "Deployment",
  "Vercel",
  "Render",
  "Cloud",
  "Communication",
  "Problem Solving",
  "Aptitude",
  "Testing",
  "Responsive Design",
];

function cleanHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractSkillsFromText(text = "") {
  const lowerText = text.toLowerCase();

  return commonSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
}

function getChance(score) {
  if (score >= 80) return "High";
  if (score >= 60) return "Moderate";
  return "Low";
}

function buildPreparationPlan(missingSkills = [], company = "") {
  const plan = [
    "Update resume keywords based on company/job requirements.",
    "Prepare a strong 2-minute self introduction.",
    "Revise your best project explanation with tech stack and challenges.",
    "Practice HR, project-based and technical interview questions.",
  ];

  if (missingSkills.length > 0) {
    plan.push(`Focus on missing skills: ${missingSkills.slice(0, 5).join(", ")}`);
  }

  if (company) {
    plan.push(`Research ${company} hiring process and role expectations.`);
  }

  return plan;
}

function analyzeCompanyReadiness(resumeText = "") {
  const resumeSkills = extractSkillsFromText(resumeText);

  return companyProfiles.map((profile) => {
    const matchedSkills = profile.requiredSkills.filter((skill) =>
      resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
    );

    const missingSkills = profile.requiredSkills.filter(
      (skill) =>
        !resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
    );

    const readinessScore = Math.round(
      (matchedSkills.length / profile.requiredSkills.length) * 100
    );

    return {
      company: profile.company,
      type: profile.type,
      readinessScore,
      chanceEstimate: getChance(readinessScore),
      requiredSkills: profile.requiredSkills,
      matchedSkills,
      missingSkills,
      expectedQuestions: profile.expectedQuestions,
      preparationPlan: buildPreparationPlan(missingSkills, profile.company),
    };
  });
}

function analyzeJobOffer(job, resumeText = "") {
  const title = job.title || "";
  const company = job.company_name || job.company || "Unknown Company";
  const location = job.location || "Not specified";
  const tags = Array.isArray(job.tags) ? job.tags : [];
  const description = cleanHtml(job.description || "");

  const jobText = `${title} ${company} ${location} ${tags.join(" ")} ${description}`;

  const requiredSkills = extractSkillsFromText(jobText);
  const resumeSkills = extractSkillsFromText(resumeText);

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );

  const missingSkills = requiredSkills.filter(
    (skill) =>
      !resumeSkills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
  );

  const matchScore =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 40;

  return {
    title,
    company,
    location,
    url: job.url || "",
    tags,
    date: job.created_at || "",
    description: description.slice(0, 300),
    requiredSkills,
    matchedSkills,
    missingSkills,
    matchScore,
    chanceEstimate: getChance(matchScore),
    preparationPlan: buildPreparationPlan(missingSkills, company),
    expectedInterviewQuestions: [
      `Tell me about yourself for the ${title} role.`,
      `Why do you want to join ${company}?`,
      "Explain your best project in detail.",
      "What challenges did you face while building your project?",
      ...missingSkills.slice(0, 4).map((skill) => `What is your experience with ${skill}?`),
    ],
  };
}

export const getCompanyReadiness = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const companies = analyzeCompanyReadiness(resumeText).sort(
      (a, b) => b.readinessScore - a.readinessScore
    );

    res.json({
      success: true,
      message: "Company readiness calculated successfully",
      companies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate company readiness",
      error: error.message,
    });
  }
};

export const getJobOffers = async (req, res) => {
  try {
    const { keyword = "developer", location = "", resumeText = "", limit = 12 } = req.body;

    const response = await fetch("https://www.arbeitnow.com/api/job-board-api");

    if (!response.ok) {
      throw new Error("Failed to fetch external job offers");
    }

    const data = await response.json();
    const jobs = Array.isArray(data) ? data : data.data || [];

    const keywordLower = keyword.toLowerCase();
    const locationLower = location.toLowerCase();

    const filteredJobs = jobs
      .filter((job) => {
        const searchableText = `${job.title || ""} ${job.company_name || ""} ${
          job.location || ""
        } ${Array.isArray(job.tags) ? job.tags.join(" ") : ""} ${cleanHtml(
          job.description || ""
        )}`.toLowerCase();

        const keywordMatch =
          !keywordLower || searchableText.includes(keywordLower);

        const locationMatch =
          !locationLower ||
          (job.location || "").toLowerCase().includes(locationLower) ||
          (locationLower === "remote" && searchableText.includes("remote"));

        return keywordMatch && locationMatch;
      })
      .slice(0, Number(limit))
      .map((job) => analyzeJobOffer(job, resumeText));

    res.json({
      success: true,
      source: "Arbeitnow Public Job API",
      count: filteredJobs.length,
      jobs: filteredJobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch job offers",
      error: error.message,
    });
  }
};