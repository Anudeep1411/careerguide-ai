import { useEffect,useMemo, useRef, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

const templateLayouts = [
  "Minimal ATS",
  "Modern Developer",
  "Corporate Blue",
  "Sidebar Pro",
  "Two Column",
  "Frontend Specialist",
  "Full Stack Pro",
  "Product Company",
  "Service Company",
  "Elegant Fresher",
];

const templateColors = [
  { name: "Indigo", accent: "#4f46e5" },
  { name: "Blue", accent: "#0f4c81" },
  { name: "Emerald", accent: "#047857" },
  { name: "Purple", accent: "#6d28d9" },
  { name: "Slate", accent: "#0f172a" },
];

const allTemplates = templateLayouts.flatMap((layout) =>
  templateColors.map((color) => ({
    name: `${layout} - ${color.name}`,
    layout,
    color: color.name,
    accent: color.accent,
    variant: "Classic",
  }))
);

const emptyEducation = {
  degree: "",
  college: "",
  university: "",
  year: "",
  score: "",
  coursework: "",
};

const emptyProject = {
  title: "",
  description: "",
  techStack: "",
  features: "",
  challenges: "",
  githubLink: "",
  liveLink: "",
};

const emptyExperience = {
  company: "",
  role: "",
  duration: "",
  description: "",
};

const emptyCertification = {
  title: "",
  issuer: "",
  year: "",
  link: "",
};

const emptyAchievement = {
  title: "",
  description: "",
};

const emptyCustomSection = {
  heading: "",
  content: "",
};

export function ResumeBuilder({ setPage }) {
  const resumePdfRef = useRef(null);
   const [editingResumeId, setEditingResumeId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(allTemplates[1]);

  const [personalDetails, setPersonalDetails] = useState({
    name: "Anudeep",
    email: "anudeep@test.com",
    phone: "9999999999",
    location: "India",
    linkedin: "",
    github: "https://github.com/Anudeep1411",
    portfolio: "",
    leetcode: "",
    hackerrank: "",
    codechef: "",
    geeksforgeeks: "",
  });

  const [careerDetails, setCareerDetails] = useState({
    targetRole: "",
    experienceLevel: "",
    careerObjective:
      "To begin my career as a frontend developer and build user-friendly real-world web applications.",
    professionalSummary:
      "Motivated frontend developer with hands-on experience in React, JavaScript, Tailwind CSS and DSA-based projects. Strong interest in building responsive, clean and scalable user interfaces.",
  });

  const [skills, setSkills] = useState({
    programmingLanguages: "JavaScript, Java",
    frontend: "HTML, CSS, React, Tailwind CSS",
    backend: "Node.js, Express",
    databases: "MongoDB, SQL",
    tools: "Git, GitHub, VS Code, Vercel",
    softSkills: "Communication, Problem Solving, Teamwork",
  });

  const [education, setEducation] = useState([
    {
      degree: "B.Tech",
      college: "Your College Name",
      university: "Your University",
      year: "2026",
      score: "CGPA / Percentage",
      coursework: "DSA, DBMS, OOP, Web Development",
    },
  ]);

  const [projects, setProjects] = useState([
    {
      title: "DSA Visualizer",
      description:
        "Built an interactive DSA visualization platform to help students understand sorting, graphs, trees and core algorithms.",
      techStack: "React, Vite, Tailwind CSS",
      features:
        "Sorting visualizer, graph traversal, topic notes, quizzes, interview questions and progress tracking.",
      challenges:
        "Improved responsive UI, organized multiple DSA topics and structured the project for future scalability.",
      githubLink: "https://github.com/Anudeep1411/dsa-visualizer",
      liveLink: "https://dsa-visualizer-six-cyan.vercel.app/",
    },
  ]);

  const [experience, setExperience] = useState([]);

  const [certifications, setCertifications] = useState([
    {
      title: "JavaScript Fundamentals",
      issuer: "Online Platform",
      year: "2025",
      link: "",
    },
  ]);

  const [achievements, setAchievements] = useState([
    {
      title: "Built and deployed DSA Visualizer",
      description:
        "Created a complete frontend learning project and deployed it using Vercel.",
    },
  ]);

  const [languages, setLanguages] = useState("English, Telugu, Hindi");
  const [interests, setInterests] = useState(
    "Web Development, Problem Solving, AI Tools"
  );
  const [customSections, setCustomSections] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const editResumeId = localStorage.getItem("cg_edit_resume_id");
    const editResumeData = localStorage.getItem("cg_edit_resume_data");

    if (!editResumeData) return;

    try {
      const resume = JSON.parse(editResumeData);

      setEditingResumeId(editResumeId || resume._id || null);

      if (resume.personalDetails) {
        setPersonalDetails((prev) => ({
          ...prev,
          ...resume.personalDetails,
        }));
      }

      if (resume.careerDetails) {
        setCareerDetails((prev) => ({
          ...prev,
          ...resume.careerDetails,
        }));
      }

      const savedSkills = resume.skills || {};

      setSkills({
        programmingLanguages: Array.isArray(savedSkills.programmingLanguages)
          ? savedSkills.programmingLanguages.join(", ")
          : savedSkills.programmingLanguages || "",
        frontend: Array.isArray(savedSkills.frontend)
          ? savedSkills.frontend.join(", ")
          : savedSkills.frontend || "",
        backend: Array.isArray(savedSkills.backend)
          ? savedSkills.backend.join(", ")
          : savedSkills.backend || "",
        databases: Array.isArray(savedSkills.databases)
          ? savedSkills.databases.join(", ")
          : savedSkills.databases || "",
        tools: Array.isArray(savedSkills.tools)
          ? savedSkills.tools.join(", ")
          : savedSkills.tools || "",
        softSkills: Array.isArray(savedSkills.softSkills)
          ? savedSkills.softSkills.join(", ")
          : savedSkills.softSkills || "",
      });

      setEducation(Array.isArray(resume.education) ? resume.education : []);
      setProjects(Array.isArray(resume.projects) ? resume.projects : []);
      setExperience(Array.isArray(resume.experience) ? resume.experience : []);
      setCertifications(
        Array.isArray(resume.certifications) ? resume.certifications : []
      );
      setAchievements(
        Array.isArray(resume.achievements) ? resume.achievements : []
      );

      setLanguages(
        Array.isArray(resume.languages) ? resume.languages.join(", ") : ""
      );

      setInterests(
        Array.isArray(resume.interests) ? resume.interests.join(", ") : ""
      );

      setCustomSections(
        Array.isArray(resume.customSections) ? resume.customSections : []
      );

      if (resume.template) {
        const matchedTemplate = allTemplates.find(
          (template) =>
            template.layout === resume.template.layout &&
            template.color === resume.template.color
        );

        if (matchedTemplate) {
          setSelectedTemplate(matchedTemplate);
        }
      }

     
    } catch (err) {
      console.error("Failed to load edit resume:", err);
      setError("Failed to load saved resume for editing");
    }
  }, []);
  function splitText(value = "") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function updateObject(setter, key, value) {
    setter((prev) => ({ ...prev, [key]: value }));
  }

  function updateArrayItem(setter, index, key, value) {
    setter((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  }

  function improveSummary() {
    const improved = `Detail-oriented ${careerDetails.targetRole} with strong fundamentals in ${skills.frontend}, practical project experience, and the ability to build responsive, user-friendly and maintainable web applications. Passionate about solving problems and continuously improving through real-world development.`;

    setCareerDetails((prev) => ({
      ...prev,
      professionalSummary: improved,
    }));

    setMessage("Professional summary improved ✅");
  }

  function improveProject(index) {
    const project = projects[index];

    const improved = `Built ${project.title || "a real-world project"} using ${
      project.techStack || "modern web technologies"
    }, implementing ${
      project.features || "interactive features"
    } to improve usability and learning experience. Focused on responsive design, clean component structure and maintainable code.`;

    updateArrayItem(setProjects, index, "description", improved);
    setMessage("Project description improved ✅");
  }

  const checklist = useMemo(() => {
    const hasCodingProfile =
      personalDetails.leetcode ||
      personalDetails.hackerrank ||
      personalDetails.codechef ||
      personalDetails.geeksforgeeks;

    const hasLiveProject = projects.some((project) => project.liveLink);

    const hasStrongProjects = projects.some(
      (project) =>
        project.title &&
        project.description &&
        project.techStack &&
        project.features &&
        project.githubLink
    );

    return {
      hasGithub: Boolean(personalDetails.github),
      hasLinkedin: Boolean(personalDetails.linkedin),
      hasPortfolio: Boolean(personalDetails.portfolio),
      hasLiveProject: Boolean(hasLiveProject),
      hasCodingProfile: Boolean(hasCodingProfile),
      hasStrongProjects: Boolean(hasStrongProjects),
      hasAtsKeywords: Boolean(
        careerDetails.targetRole &&
          careerDetails.professionalSummary &&
          skills.programmingLanguages
      ),
    };
  }, [personalDetails, projects, careerDetails, skills]);

  async function saveResume() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const resumeData = {
        title: `${careerDetails.targetRole} Resume`,
        personalDetails,
        careerDetails,
        education,
        skills: {
          programmingLanguages: splitText(skills.programmingLanguages),
          frontend: splitText(skills.frontend),
          backend: splitText(skills.backend),
          databases: splitText(skills.databases),
          tools: splitText(skills.tools),
          softSkills: splitText(skills.softSkills),
        },
        projects,
        experience,
        certifications,
        achievements,
        languages: splitText(languages),
        interests: splitText(interests),
        customSections,
        template: {
          layout: selectedTemplate.layout,
          color: selectedTemplate.color,
          variant: selectedTemplate.variant,
        },
        resumeChecklist: checklist,
      };
const endpoint = editingResumeId ? `/resumes/${editingResumeId}` : "/resumes";
const method = editingResumeId ? "PUT" : "POST";

await apiRequest(endpoint, {
  method,
  body: JSON.stringify(resumeData),
});

if (editingResumeId) {
  setMessage("Resume updated successfully ✅");
} else {
  setMessage("Resume saved successfully ✅");
}
    } catch (err) {
      setError(err.message || "Failed to save resume");
    } finally {
      setLoading(false);
    }
  }

  function buildResumeText() {
    const skillsText = [
      skills.programmingLanguages,
      skills.frontend,
      skills.backend,
      skills.databases,
      skills.tools,
      skills.softSkills,
    ]
      .filter(Boolean)
      .join(", ");

    const educationText = education
      .map(
        (edu) =>
          `${edu.degree} ${edu.college} ${edu.university} ${edu.year} ${edu.score} ${edu.coursework}`
      )
      .join("\n");

    const projectText = projects
      .map(
        (project) =>
          `${project.title}. ${project.description}. Tech Stack: ${project.techStack}. Features: ${project.features}. Challenges: ${project.challenges}. GitHub: ${project.githubLink}. Live: ${project.liveLink}`
      )
      .join("\n");

    const experienceText = experience
      .map(
        (item) =>
          `${item.role} at ${item.company}. Duration: ${item.duration}. Work: ${item.description}`
      )
      .join("\n");

    const certificationText = certifications
      .map((cert) => `${cert.title} by ${cert.issuer} ${cert.year} ${cert.link}`)
      .join("\n");

    const achievementText = achievements
      .map((item) => `${item.title}. ${item.description}`)
      .join("\n");

    return `
Name: ${personalDetails.name}
Email: ${personalDetails.email}
Phone: ${personalDetails.phone}
Location: ${personalDetails.location}
GitHub: ${personalDetails.github}
LinkedIn: ${personalDetails.linkedin}
Portfolio: ${personalDetails.portfolio}
LeetCode: ${personalDetails.leetcode}
HackerRank: ${personalDetails.hackerrank}
CodeChef: ${personalDetails.codechef}
GeeksforGeeks: ${personalDetails.geeksforgeeks}

Target Role: ${careerDetails.targetRole}
Experience Level: ${careerDetails.experienceLevel}

Professional Summary:
${careerDetails.professionalSummary}

Career Objective:
${careerDetails.careerObjective}

Skills:
${skillsText}

Education:
${educationText}

Projects:
${projectText}

Experience:
${experienceText}

Certifications:
${certificationText}

Achievements:
${achievementText}

Languages:
${languages}

Interests:
${interests}
`;
  }

  function analyzeThisResume() {
    const resumeText = buildResumeText();

    localStorage.setItem("cg_analyzer_resume_text", resumeText);
    localStorage.setItem("cg_analyzer_target_role", careerDetails.targetRole);

    setPage("analyzer");
  }

 function downloadResumePdf() {
  try {
    setError("");
    setMessage("Opening professional resume print page...");

    const accent = selectedTemplate?.accent || "#0f4c81";
    const layoutName = selectedTemplate?.layout || "Minimal ATS";

    const isMinimal = layoutName.includes("Minimal");
    const isSidebar = layoutName.includes("Sidebar");
    const isTwoColumn = layoutName.includes("Two Column");
    const isModern =
      layoutName.includes("Modern") ||
      layoutName.includes("Developer") ||
      layoutName.includes("Pro") ||
      layoutName.includes("Product") ||
      layoutName.includes("Service");

    const safe = (value = "") =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
        .trim();

    const hasValue = (value) => Boolean(String(value || "").trim());

    const hasAnyValue = (obj) =>
      Object.values(obj || {}).some((value) => hasValue(value));

    const formatUrlForPrint = (url = "") => {
      if (!url) return "";
      return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    };

    const anchor = (label, url) => {
      if (!hasValue(url)) return "";
      return `<a href="${formatUrlForPrint(
        url
      )}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    };

    const cleanList = (value = "") =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");

    const profileLinks = [
      personalDetails.linkedin
        ? `LinkedIn: ${anchor("linkedin.com", personalDetails.linkedin)}`
        : "",
      personalDetails.github
        ? `Github: ${anchor("github.com", personalDetails.github)}`
        : "",
      personalDetails.leetcode
        ? `Leetcode: ${anchor("leetcode.com", personalDetails.leetcode)}`
        : "",
      personalDetails.portfolio
        ? `Portfolio: ${anchor("portfolio", personalDetails.portfolio)}`
        : "",
      personalDetails.hackerrank
        ? `HackerRank: ${anchor("hackerrank.com", personalDetails.hackerrank)}`
        : "",
      personalDetails.codechef
        ? `CodeChef: ${anchor("codechef.com", personalDetails.codechef)}`
        : "",
      personalDetails.geeksforgeeks
        ? `GeeksforGeeks: ${anchor(
            "geeksforgeeks.org",
            personalDetails.geeksforgeeks
          )}`
        : "",
    ].filter(Boolean);

    const skillsHtml = [
      ["Programming", cleanList(skills.programmingLanguages)],
      ["Web Development", cleanList(skills.frontend)],
      ["Backend", cleanList(skills.backend)],
      ["Databases", cleanList(skills.databases)],
      ["Tools", cleanList(skills.tools)],
      ["Soft Skills", cleanList(skills.softSkills)],
    ]
      .filter(([, value]) => hasValue(value))
      .map(([label, value]) => `<p><b>${label}:</b> ${safe(value)}</p>`)
      .join("");

    const educationHtml = education
      .filter(hasAnyValue)
      .map(
        (edu) => `
          <div class="item">
            ${
              hasValue(edu.degree)
                ? `<h3>${safe(edu.degree)}</h3>`
                : ""
            }
            ${
              hasValue(edu.college)
                ? `<p>${safe(edu.college)}</p>`
                : ""
            }
            ${
              hasValue(edu.university)
                ? `<p>${safe(edu.university)}</p>`
                : ""
            }
            ${
              hasValue(edu.year)
                ? `<p>(${safe(edu.year)})</p>`
                : ""
            }
            ${
              hasValue(edu.score)
                ? `<p><b>Score:</b> ${safe(edu.score)}</p>`
                : ""
            }
            ${
              hasValue(edu.coursework)
                ? `<p><b>Coursework:</b> ${safe(edu.coursework)}</p>`
                : ""
            }
          </div>
        `
      )
      .join("");

    const experienceHtml = experience
      .filter(hasAnyValue)
      .map(
        (item) => `
          <div class="item">
            ${
              hasValue(item.company) || hasValue(item.role) || hasValue(item.duration)
                ? `<div class="row">
                    <div>
                      ${
                        hasValue(item.company) || hasValue(item.role)
                          ? `<h3>${safe(item.company || item.role)}</h3>`
                          : ""
                      }
                      ${
                        hasValue(item.company) && hasValue(item.role)
                          ? `<p><b>${safe(item.role)}</b></p>`
                          : ""
                      }
                    </div>
                    ${
                      hasValue(item.duration)
                        ? `<span>${safe(item.duration)}</span>`
                        : ""
                    }
                  </div>`
                : ""
            }
            ${
              hasValue(item.description)
                ? `<ul><li>${safe(item.description)}</li></ul>`
                : ""
            }
          </div>
        `
      )
      .join("");

    const certificationsHtml = certifications
      .filter(hasAnyValue)
      .map(
        (cert) => `
          <li>
            ${hasValue(cert.title) ? safe(cert.title) : ""}
            ${hasValue(cert.issuer) ? ` - ${safe(cert.issuer)}` : ""}
            ${hasValue(cert.year) ? ` (${safe(cert.year)})` : ""}
            ${
              hasValue(cert.link)
                ? ` ${anchor("(Certificate Link)", cert.link)}`
                : ""
            }
          </li>
        `
      )
      .join("");

    const projectsHtml = projects
      .filter(hasAnyValue)
      .map((project) => {
        const links = [
          anchor("(Live Link)", project.liveLink),
          anchor("(Github Link)", project.githubLink),
        ]
          .filter(Boolean)
          .join(" ");

        const bullets = [project.description, project.features, project.challenges]
          .filter(hasValue)
          .map((point) => `<li>${safe(point)}</li>`)
          .join("");

        return `
          <div class="project">
            ${hasValue(project.title) ? `<h3>${safe(project.title)}</h3>` : ""}
            ${links ? `<p class="project-links">${links}</p>` : ""}
            ${
              hasValue(project.techStack)
                ? `<p class="tech"><b>Tech Stack:</b> ${safe(
                    project.techStack
                  )}</p>`
                : ""
            }
            ${bullets ? `<ul>${bullets}</ul>` : ""}
          </div>
        `;
      })
      .join("");

    const achievementsHtml = achievements
      .filter(hasAnyValue)
      .map(
        (item) => `
          <li>
            ${hasValue(item.title) ? `<b>${safe(item.title)}</b>` : ""}
            ${
              hasValue(item.description)
                ? `${hasValue(item.title) ? " - " : ""}${safe(
                    item.description
                  )}`
                : ""
            }
          </li>
        `
      )
      .join("");

    const customSectionsHtml = customSections
      .filter(hasAnyValue)
      .map(
        (section) => `
          <section>
            ${
              hasValue(section.heading)
                ? `<h2>${safe(section.heading)}</h2>`
                : ""
            }
            ${
              hasValue(section.content)
                ? `<p>${safe(section.content)}</p>`
                : ""
            }
          </section>
        `
      )
      .join("");

    const summaryBullets = careerDetails.professionalSummary
      .split(".")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<li>${safe(line)}.</li>`)
      .join("");

    const hasHeader =
      hasValue(personalDetails.name) ||
      hasValue(careerDetails.targetRole) ||
      hasValue(personalDetails.phone) ||
      hasValue(personalDetails.email) ||
      hasValue(personalDetails.location) ||
      profileLinks.length > 0;

    const hasLeftColumn =
      educationHtml ||
      skillsHtml ||
      experienceHtml ||
      certificationsHtml ||
      hasValue(languages) ||
      hasValue(interests);

    const hasRightColumn =
      summaryBullets ||
      hasValue(careerDetails.careerObjective) ||
      projectsHtml ||
      achievementsHtml ||
      customSectionsHtml;

    const shouldUseTwoColumns =
      (isSidebar || isTwoColumn) && hasLeftColumn && hasRightColumn;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${safe(personalDetails.name || "Resume")}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm 12mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: ${
        isMinimal
          ? "Arial, Helvetica, sans-serif"
          : '"Segoe UI", Arial, sans-serif'
      };
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .resume {
      width: 100%;
      max-width: 794px;
      margin: 0 auto;
      background: #ffffff;
      ${isModern ? `border-top: 7px solid ${accent}; padding-top: 8px;` : ""}
    }

    .header {
      border-bottom: 3px solid ${isMinimal ? "#0f172a" : accent};
      padding-bottom: 10px;
      margin-bottom: 13px;
    }

    .name {
      margin: 0;
      font-size: 34px;
      line-height: 1.05;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.6px;
    }

    .role {
      margin: 4px 0 0;
      font-size: 16px;
      font-weight: 900;
      color: ${isMinimal ? "#1f2937" : accent};
    }

    .contact,
    .profile-lines {
      margin-top: 6px;
      font-size: 13px;
      line-height: 1.5;
      color: #111827;
      font-weight: 600;
    }

    a {
      color: ${accent};
      text-decoration: underline;
      text-underline-offset: 2px;
      font-weight: 900;
    }

    .layout {
      display: grid;
      grid-template-columns: ${shouldUseTwoColumns ? "35% 65%" : "1fr"};
      gap: ${shouldUseTwoColumns ? "18px" : "12px"};
      align-items: start;
    }

    section {
      margin-bottom: 12px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    h2 {
      margin: 0 0 7px;
      padding-bottom: 4px;
      border-bottom: 1.7px solid ${accent};
      font-size: 13.8px;
      font-weight: 900;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: ${accent};
    }

    h3 {
      margin: 0 0 3px;
      font-size: 13.6px;
      line-height: 1.3;
      font-weight: 900;
      color: #0f172a;
    }

    p {
      margin: 3px 0;
      font-size: 13px;
      line-height: 1.55;
      color: #111827;
      font-weight: 500;
    }

    b,
    strong {
      color: #0f172a;
      font-weight: 900;
    }

    ul {
      margin: 4px 0 0 16px;
      padding: 0;
    }

    li {
      margin: 4px 0;
      padding-left: 2px;
      font-size: 13px;
      line-height: 1.55;
      color: #111827;
      font-weight: 500;
    }

    .item,
    .project {
      margin-bottom: 10px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
    }

    .row > div {
      flex: 1;
    }

    .row span {
      flex-shrink: 0;
      font-size: 12px;
      color: #374151;
      font-weight: 700;
    }

    .project-links {
      margin: 3px 0;
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
    }

    .tech {
      color: ${accent};
      font-weight: 900;
    }

    @media print {
      body {
        background: #ffffff;
      }

      .resume {
        box-shadow: none;
      }
    }
  </style>
</head>

<body>
  <main class="resume">
    ${
      hasHeader
        ? `<header class="header">
            ${
              hasValue(personalDetails.name)
                ? `<h1 class="name">${safe(personalDetails.name)}</h1>`
                : ""
            }
            ${
              hasValue(careerDetails.targetRole)
                ? `<p class="role">${safe(careerDetails.targetRole)}</p>`
                : ""
            }
            ${
              hasValue(personalDetails.phone) ||
              hasValue(personalDetails.email) ||
              hasValue(personalDetails.location)
                ? `<div class="contact">
                    ${
                      hasValue(personalDetails.phone)
                        ? `Mobile: ${safe(personalDetails.phone)}`
                        : ""
                    }
                    ${
                      hasValue(personalDetails.email)
                        ? `${
                            hasValue(personalDetails.phone) ? " | " : ""
                          }Email: ${safe(personalDetails.email)}`
                        : ""
                    }
                    ${
                      hasValue(personalDetails.location)
                        ? ` | ${safe(personalDetails.location)}`
                        : ""
                    }
                  </div>`
                : ""
            }
            ${
              profileLinks.length
                ? `<div class="profile-lines">${profileLinks.join("<br/>")}</div>`
                : ""
            }
          </header>`
        : ""
    }

    ${
      !hasLeftColumn && !hasRightColumn
        ? `<p>Start filling your details. Empty fields will not appear in the final resume.</p>`
        : `<div class="layout">
            ${
              hasLeftColumn
                ? `<div>
                    ${
                      educationHtml
                        ? `<section><h2>Education</h2>${educationHtml}</section>`
                        : ""
                    }
                    ${
                      skillsHtml
                        ? `<section><h2>Skills</h2>${skillsHtml}</section>`
                        : ""
                    }
                    ${
                      experienceHtml
                        ? `<section><h2>Internships / Experience</h2>${experienceHtml}</section>`
                        : ""
                    }
                    ${
                      certificationsHtml
                        ? `<section><h2>Certifications</h2><ul>${certificationsHtml}</ul></section>`
                        : ""
                    }
                    ${
                      hasValue(languages) || hasValue(interests)
                        ? `<section><h2>Languages & Interests</h2>
                            ${
                              hasValue(languages)
                                ? `<p><b>Languages:</b> ${safe(languages)}</p>`
                                : ""
                            }
                            ${
                              hasValue(interests)
                                ? `<p><b>Interests:</b> ${safe(interests)}</p>`
                                : ""
                            }
                          </section>`
                        : ""
                    }
                  </div>`
                : ""
            }

            ${
              hasRightColumn
                ? `<div>
                    ${
                      summaryBullets
                        ? `<section><h2>Resume Summary</h2><ul>${summaryBullets}</ul></section>`
                        : ""
                    }
                    ${
                      hasValue(careerDetails.careerObjective)
                        ? `<section><h2>Career Objective</h2><p>${safe(
                            careerDetails.careerObjective
                          )}</p></section>`
                        : ""
                    }
                    ${
                      projectsHtml
                        ? `<section><h2>Projects</h2>${projectsHtml}</section>`
                        : ""
                    }
                    ${
                      achievementsHtml
                        ? `<section><h2>Achievements</h2><ul>${achievementsHtml}</ul></section>`
                        : ""
                    }
                    ${customSectionsHtml}
                  </div>`
                : ""
            }
          </div>`
    }
  </main>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=1000");

    if (!printWindow) {
      setError("Popup blocked. Please allow popups and try again.");
      setMessage("");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setMessage("Print page opened. Chrome Save as PDF select cheyyi ✅");
  } catch (err) {
    console.error("PDF print error:", err);
    setError(err.message || "PDF print failed");
    setMessage("");
  }
}

  return (
    <div>
      <PageHeader
        eyebrow="AI Resume Builder"
        title="Build a professional ATS-friendly resume"
        desc="Create a detailed resume with dynamic sections, clickable links, 50+ templates, professional preview and resume strength checklist."
        action={
          <Button onClick={saveResume}>
          {loading ? "Saving..." : editingResumeId ? "Update Resume" : "Save Resume"}
          </Button>
        }
      />

      {message && (
        <div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 font-bold text-emerald-500">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(620px,720px)] xl:grid-cols-[minmax(0,1fr)_560px]">
        <div className="space-y-5">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />

          <Card>
            <SectionTitle title="Personal & Coding Profiles" />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                value={personalDetails.name}
                onChange={(v) => updateObject(setPersonalDetails, "name", v)}
              />
              <Field
                label="Email"
                value={personalDetails.email}
                onChange={(v) => updateObject(setPersonalDetails, "email", v)}
              />
              <Field
                label="Phone"
                value={personalDetails.phone}
                onChange={(v) => updateObject(setPersonalDetails, "phone", v)}
              />
              <Field
                label="Location"
                value={personalDetails.location}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "location", v)
                }
              />
              <Field
                label="LinkedIn URL"
                value={personalDetails.linkedin}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "linkedin", v)
                }
              />
              <Field
                label="GitHub URL"
                value={personalDetails.github}
                onChange={(v) => updateObject(setPersonalDetails, "github", v)}
              />
              <Field
                label="Portfolio URL"
                value={personalDetails.portfolio}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "portfolio", v)
                }
              />
              <Field
                label="LeetCode URL"
                value={personalDetails.leetcode}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "leetcode", v)
                }
              />
              <Field
                label="HackerRank URL"
                value={personalDetails.hackerrank}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "hackerrank", v)
                }
              />
              <Field
                label="CodeChef URL"
                value={personalDetails.codechef}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "codechef", v)
                }
              />
              <Field
                label="GeeksforGeeks URL"
                value={personalDetails.geeksforgeeks}
                onChange={(v) =>
                  updateObject(setPersonalDetails, "geeksforgeeks", v)
                }
              />
            </div>
          </Card>

          <Card>
            <SectionTitle title="Career Details" />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Target Role"
                value={careerDetails.targetRole}
                onChange={(v) =>
                  updateObject(setCareerDetails, "targetRole", v)
                }
              />
              <Field
                label="Experience Level"
                value={careerDetails.experienceLevel}
                onChange={(v) =>
                  updateObject(setCareerDetails, "experienceLevel", v)
                }
              />
            </div>

            <TextArea
              label="Career Objective"
              value={careerDetails.careerObjective}
              onChange={(v) =>
                updateObject(setCareerDetails, "careerObjective", v)
              }
            />
            <TextArea
              label="Professional Summary"
              value={careerDetails.professionalSummary}
              onChange={(v) =>
                updateObject(setCareerDetails, "professionalSummary", v)
              }
            />

            <Button onClick={improveSummary} variant="soft" className="mt-4">
              Improve Summary
            </Button>
          </Card>

          <Card>
            <SectionTitle title="Skills" />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Programming Languages"
                value={skills.programmingLanguages}
                onChange={(v) =>
                  updateObject(setSkills, "programmingLanguages", v)
                }
                help="Use commas"
              />
              <Field
                label="Frontend"
                value={skills.frontend}
                onChange={(v) => updateObject(setSkills, "frontend", v)}
                help="Use commas"
              />
              <Field
                label="Backend"
                value={skills.backend}
                onChange={(v) => updateObject(setSkills, "backend", v)}
                help="Use commas"
              />
              <Field
                label="Databases"
                value={skills.databases}
                onChange={(v) => updateObject(setSkills, "databases", v)}
                help="Use commas"
              />
              <Field
                label="Tools"
                value={skills.tools}
                onChange={(v) => updateObject(setSkills, "tools", v)}
                help="Use commas"
              />
              <Field
                label="Soft Skills"
                value={skills.softSkills}
                onChange={(v) => updateObject(setSkills, "softSkills", v)}
                help="Use commas"
              />
            </div>
          </Card>

          <DynamicSection
            title="Education"
            items={education}
            setItems={setEducation}
            emptyItem={emptyEducation}
          >
            {(item, index) => (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.keys(emptyEducation).map((key) => (
                  <Field
                    key={key}
                    label={labelize(key)}
                    value={item[key]}
                    onChange={(v) =>
                      updateArrayItem(setEducation, index, key, v)
                    }
                  />
                ))}
              </div>
            )}
          </DynamicSection>

          <DynamicSection
            title="Projects"
            items={projects}
            setItems={setProjects}
            emptyItem={emptyProject}
          >
            {(item, index) => (
              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Project Title"
                    value={item.title}
                    onChange={(v) =>
                      updateArrayItem(setProjects, index, "title", v)
                    }
                  />
                  <Field
                    label="Tech Stack"
                    value={item.techStack}
                    onChange={(v) =>
                      updateArrayItem(setProjects, index, "techStack", v)
                    }
                  />
                  <Field
                    label="GitHub Link"
                    value={item.githubLink}
                    onChange={(v) =>
                      updateArrayItem(setProjects, index, "githubLink", v)
                    }
                  />
                  <Field
                    label="Live Link"
                    value={item.liveLink}
                    onChange={(v) =>
                      updateArrayItem(setProjects, index, "liveLink", v)
                    }
                  />
                </div>

                <TextArea
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    updateArrayItem(setProjects, index, "description", v)
                  }
                />
                <TextArea
                  label="Features"
                  value={item.features}
                  onChange={(v) =>
                    updateArrayItem(setProjects, index, "features", v)
                  }
                />
                <TextArea
                  label="Challenges Solved"
                  value={item.challenges}
                  onChange={(v) =>
                    updateArrayItem(setProjects, index, "challenges", v)
                  }
                />

                <Button
                  onClick={() => improveProject(index)}
                  variant="soft"
                  className="mt-3"
                >
                  Improve Project Bullet
                </Button>
              </div>
            )}
          </DynamicSection>

          <DynamicSection
            title="Experience / Internship"
            items={experience}
            setItems={setExperience}
            emptyItem={emptyExperience}
          >
            {(item, index) => (
              <div>
                <div className="grid gap-4 md:grid-cols-2">
                  {["company", "role", "duration"].map((key) => (
                    <Field
                      key={key}
                      label={labelize(key)}
                      value={item[key]}
                      onChange={(v) =>
                        updateArrayItem(setExperience, index, key, v)
                      }
                    />
                  ))}
                </div>

                <TextArea
                  label="Work Description"
                  value={item.description}
                  onChange={(v) =>
                    updateArrayItem(setExperience, index, "description", v)
                  }
                />
              </div>
            )}
          </DynamicSection>

          <DynamicSection
            title="Certifications"
            items={certifications}
            setItems={setCertifications}
            emptyItem={emptyCertification}
          >
            {(item, index) => (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.keys(emptyCertification).map((key) => (
                  <Field
                    key={key}
                    label={key === "link" ? "Certificate Link" : labelize(key)}
                    value={item[key]}
                    onChange={(v) =>
                      updateArrayItem(setCertifications, index, key, v)
                    }
                  />
                ))}
              </div>
            )}
          </DynamicSection>

          <DynamicSection
            title="Achievements"
            items={achievements}
            setItems={setAchievements}
            emptyItem={emptyAchievement}
          >
            {(item, index) => (
              <div>
                <Field
                  label="Achievement Title"
                  value={item.title}
                  onChange={(v) =>
                    updateArrayItem(setAchievements, index, "title", v)
                  }
                />
                <TextArea
                  label="Description"
                  value={item.description}
                  onChange={(v) =>
                    updateArrayItem(setAchievements, index, "description", v)
                  }
                />
              </div>
            )}
          </DynamicSection>

          <Card>
            <SectionTitle title="Languages & Interests" />

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Languages"
                value={languages}
                onChange={setLanguages}
                help="Use commas"
              />
              <Field
                label="Interests"
                value={interests}
                onChange={setInterests}
                help="Use commas"
              />
            </div>
          </Card>

          <DynamicSection
            title="Custom Sections"
            items={customSections}
            setItems={setCustomSections}
            emptyItem={emptyCustomSection}
          >
            {(item, index) => (
              <div>
                <Field
                  label="Heading"
                  value={item.heading}
                  onChange={(v) =>
                    updateArrayItem(setCustomSections, index, "heading", v)
                  }
                />
                <TextArea
                  label="Content"
                  value={item.content}
                  onChange={(v) =>
                    updateArrayItem(setCustomSections, index, "content", v)
                  }
                />
              </div>
            )}
          </DynamicSection>

          <Card>
            <Button onClick={saveResume} className="w-full">
              {loading ? "Saving..." : "Save Resume"}
            </Button>
          </Card>
        </div>

        <div className="space-y-5">
          <ResumePreview
            personalDetails={personalDetails}
            careerDetails={careerDetails}
            skills={skills}
            education={education}
            projects={projects}
            experience={experience}
            certifications={certifications}
            achievements={achievements}
            languages={languages}
            interests={interests}
            customSections={customSections}
            selectedTemplate={selectedTemplate}
            splitText={splitText}
            resumePdfRef={resumePdfRef}
          />

          <Checklist checklist={checklist} />

          <ResumeActions
            saveResume={saveResume}
            analyzeThisResume={analyzeThisResume}
            downloadResumePdf={downloadResumePdf}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

function TemplateSelector({ selectedTemplate, setSelectedTemplate }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Resume Templates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            10 layouts × 5 colors = 50 professional templates
          </p>
        </div>

        <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-cyan-300">
          50+
        </span>
      </div>

      <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
        {allTemplates.map((template) => (
          <button
            key={template.name}
            onClick={() => setSelectedTemplate(template)}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedTemplate.name === template.name
                ? "border-indigo-500 bg-indigo-600/10"
                : "border-slate-200 bg-slate-50 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <div className="mb-3 h-20 rounded-xl border bg-white p-2 shadow-sm">
              <div
                className="mb-2 h-3 w-20 rounded"
                style={{ background: template.accent }}
              />
              <div className="mb-2 h-2 w-full rounded bg-slate-200" />
              <div className="mb-2 h-2 w-24 rounded bg-slate-200" />
              <div
                className="mt-3 h-2 w-28 rounded"
                style={{ background: template.accent }}
              />
            </div>

            <p className="font-black">{template.layout}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {template.color} / {template.variant}
            </p>
          </button>
        ))}
      </div>
    </Card>
  );
}

function DynamicSection({ title, items, setItems, emptyItem, children }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle title={title} noMargin />

        <Button
          onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
          variant="soft"
        >
          + Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-white/5">
          <p className="font-bold">No {title.toLowerCase()} added.</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Click + Add if you want this section in your resume.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-black">
                  {title} #{index + 1}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setItems((prev) =>
                      prev.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-black text-red-500"
                >
                  - Remove
                </button>
              </div>

              {children(item, index)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
function ResumePreview({
  personalDetails,
  careerDetails,
  skills,
  education,
  projects,
  experience,
  certifications,
  achievements,
  languages,
  interests,
  customSections,
  selectedTemplate,
  splitText,
  resumePdfRef,
}) {
  const accent = selectedTemplate?.accent || "#0f4c81";
  const layoutName = selectedTemplate?.layout || "Minimal ATS";

  const isMinimal = layoutName.includes("Minimal");
  const isSidebar = layoutName.includes("Sidebar");
  const isTwoColumn = layoutName.includes("Two Column");
  const isModern =
    layoutName.includes("Modern") ||
    layoutName.includes("Developer") ||
    layoutName.includes("Pro") ||
    layoutName.includes("Product") ||
    layoutName.includes("Service");

  const hasValue = (value) => Boolean(String(value || "").trim());

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some((value) => hasValue(value));

  const profileLinks = [
    ["LinkedIn", personalDetails.linkedin, "linkedin.com"],
    ["Github", personalDetails.github, "github.com"],
    ["Leetcode", personalDetails.leetcode, "leetcode.com"],
    ["Portfolio", personalDetails.portfolio, "portfolio"],
    ["HackerRank", personalDetails.hackerrank, "hackerrank.com"],
    ["CodeChef", personalDetails.codechef, "codechef.com"],
    ["GeeksforGeeks", personalDetails.geeksforgeeks, "geeksforgeeks.org"],
  ].filter(([, url]) => hasValue(url));

  const visibleEducation = education.filter(hasAnyValue);
  const visibleProjects = projects.filter(hasAnyValue);
  const visibleExperience = experience.filter(hasAnyValue);
  const visibleCertifications = certifications.filter(hasAnyValue);
  const visibleAchievements = achievements.filter(hasAnyValue);
  const visibleCustomSections = customSections.filter(hasAnyValue);

  const summaryPoints = careerDetails.professionalSummary
    .split(".")
    .map((point) => point.trim())
    .filter(Boolean);

  const hasSkills =
    splitText(skills.programmingLanguages).length > 0 ||
    splitText(skills.frontend).length > 0 ||
    splitText(skills.backend).length > 0 ||
    splitText(skills.databases).length > 0 ||
    splitText(skills.tools).length > 0 ||
    splitText(skills.softSkills).length > 0;

  const hasLanguagesInterests = hasValue(languages) || hasValue(interests);

  const hasLeftColumn =
    visibleEducation.length > 0 ||
    hasSkills ||
    visibleExperience.length > 0 ||
    visibleCertifications.length > 0 ||
    hasLanguagesInterests;

  const hasRightColumn =
    summaryPoints.length > 0 ||
    hasValue(careerDetails.careerObjective) ||
    visibleProjects.length > 0 ||
    visibleAchievements.length > 0 ||
    visibleCustomSections.length > 0;

  const shouldUseTwoColumns =
    (isSidebar || isTwoColumn) && hasLeftColumn && hasRightColumn;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Professional Resume Preview</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Empty fields are hidden automatically
          </p>
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-black text-white"
          style={{ background: accent }}
        >
          {selectedTemplate?.color || "Template"}
        </span>
      </div>

      <div className="rounded-[1.5rem] bg-slate-200 p-3 dark:bg-white/10">
        <div
          ref={resumePdfRef}
          className="mx-auto min-h-[1050px] max-w-[794px] bg-white px-9 py-8 text-slate-950 shadow-2xl"
          style={{
            fontFamily: isMinimal
              ? "Arial, Helvetica, sans-serif"
              : "Segoe UI, Arial, sans-serif",
            borderTop: isModern ? `7px solid ${accent}` : "none",
          }}
        >
          <header
            className="mb-4 border-b-[3px] pb-3"
            style={{ borderColor: isMinimal ? "#0f172a" : accent }}
          >
            {hasValue(personalDetails.name) && (
              <h1 className="m-0 text-[34px] font-black leading-none tracking-tight text-slate-950">
                {personalDetails.name}
              </h1>
            )}

            {hasValue(careerDetails.targetRole) && (
              <p
                className="mt-1 text-[16px] font-black"
                style={{ color: isMinimal ? "#1f2937" : accent }}
              >
                {careerDetails.targetRole}
              </p>
            )}

            {(hasValue(personalDetails.phone) ||
              hasValue(personalDetails.email) ||
              hasValue(personalDetails.location)) && (
              <p className="mt-2 text-[13px] font-semibold leading-[1.5] text-slate-950">
                {hasValue(personalDetails.phone) && (
                  <>Mobile: {personalDetails.phone}</>
                )}

                {hasValue(personalDetails.email) && (
                  <>
                    {hasValue(personalDetails.phone) ? " | " : ""}
                    Email: {personalDetails.email}
                  </>
                )}

                {hasValue(personalDetails.location) && (
                  <> | {personalDetails.location}</>
                )}
              </p>
            )}

            {profileLinks.length > 0 && (
              <div className="mt-1 space-y-0.5 text-[13px] font-semibold leading-[1.5] text-slate-950">
                {profileLinks.map(([label, url, display]) => (
                  <p key={label} className="m-0">
                    <b className="font-black text-slate-950">{label}:</b>{" "}
                    <ProfessionalLink
                      label={display}
                      url={url}
                      accent={accent}
                    />
                  </p>
                ))}
              </div>
            )}
          </header>

          {!hasLeftColumn && !hasRightColumn ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-[13px] font-semibold text-slate-500">
                Start filling your details. Empty fields will not appear in the
                final resume.
              </p>
            </div>
          ) : (
            <div
              className={
                shouldUseTwoColumns
                  ? "grid grid-cols-[35%_65%] gap-5"
                  : "grid grid-cols-1 gap-4"
              }
            >
              {hasLeftColumn && (
                <div>
                  {visibleEducation.length > 0 && (
                    <SampleSection title="Education" accent={accent}>
                      {visibleEducation.map((edu, index) => (
                        <div key={index} className="mb-3">
                          {hasValue(edu.degree) && (
                            <h3 className="m-0 text-[14px] font-black leading-snug text-slate-950">
                              {edu.degree}
                            </h3>
                          )}

                          {hasValue(edu.college) && <p>{edu.college}</p>}
                          {hasValue(edu.university) && <p>{edu.university}</p>}
                          {hasValue(edu.year) && <p>({edu.year})</p>}

                          {hasValue(edu.score) && (
                            <p>
                              <b>Score:</b> {edu.score}
                            </p>
                          )}

                          {hasValue(edu.coursework) && (
                            <p>
                              <b>Coursework:</b> {edu.coursework}
                            </p>
                          )}
                        </div>
                      ))}
                    </SampleSection>
                  )}

                  {hasSkills && (
                    <SampleSection title="Skills" accent={accent}>
                      <SampleSkillLine
                        title="Programming"
                        items={splitText(skills.programmingLanguages)}
                      />
                      <SampleSkillLine
                        title="Web Development"
                        items={splitText(skills.frontend)}
                      />
                      <SampleSkillLine
                        title="Backend"
                        items={splitText(skills.backend)}
                      />
                      <SampleSkillLine
                        title="Databases"
                        items={splitText(skills.databases)}
                      />
                      <SampleSkillLine
                        title="Tools"
                        items={splitText(skills.tools)}
                      />
                      <SampleSkillLine
                        title="Soft Skills"
                        items={splitText(skills.softSkills)}
                      />
                    </SampleSection>
                  )}

                  {visibleExperience.length > 0 && (
                    <SampleSection title="Internships / Experience" accent={accent}>
                      {visibleExperience.map((item, index) => (
                        <div key={index} className="mb-3">
                          {(hasValue(item.company) ||
                            hasValue(item.role) ||
                            hasValue(item.duration)) && (
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="m-0 text-[14px] font-black leading-snug text-slate-950">
                                {item.company || item.role}
                              </h3>

                              {hasValue(item.duration) && (
                                <span className="shrink-0 text-[12px] font-bold text-slate-700">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                          )}

                          {hasValue(item.role) && hasValue(item.company) && (
                            <p>
                              <b>{item.role}</b>
                            </p>
                          )}

                          {hasValue(item.description) && (
                            <ul className="ml-4 list-disc">
                              <li>{item.description}</li>
                            </ul>
                          )}
                        </div>
                      ))}
                    </SampleSection>
                  )}

                  {visibleCertifications.length > 0 && (
                    <SampleSection title="Certifications" accent={accent}>
                      <ul className="ml-4 list-disc">
                        {visibleCertifications.map((cert, index) => (
                          <li key={index}>
                            {hasValue(cert.title) && cert.title}
                            {hasValue(cert.issuer) && ` - ${cert.issuer}`}
                            {hasValue(cert.year) && ` (${cert.year})`}
                            {hasValue(cert.link) && (
                              <>
                                {" "}
                                <ProfessionalLink
                                  label="(Certificate Link)"
                                  url={cert.link}
                                  accent={accent}
                                />
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SampleSection>
                  )}

                  {hasLanguagesInterests && (
                    <SampleSection title="Languages & Interests" accent={accent}>
                      {hasValue(languages) && (
                        <p>
                          <b>Languages:</b> {languages}
                        </p>
                      )}

                      {hasValue(interests) && (
                        <p>
                          <b>Interests:</b> {interests}
                        </p>
                      )}
                    </SampleSection>
                  )}
                </div>
              )}

              {hasRightColumn && (
                <div>
                  {summaryPoints.length > 0 && (
                    <SampleSection title="Resume Summary" accent={accent}>
                      <ul className="ml-4 list-disc">
                        {summaryPoints.map((point, index) => (
                          <li key={index}>{point}.</li>
                        ))}
                      </ul>
                    </SampleSection>
                  )}

                  {hasValue(careerDetails.careerObjective) && (
                    <SampleSection title="Career Objective" accent={accent}>
                      <p>{careerDetails.careerObjective}</p>
                    </SampleSection>
                  )}

                  {visibleProjects.length > 0 && (
                    <SampleSection title="Projects" accent={accent}>
                      {visibleProjects.map((project, index) => (
                        <div key={index} className="mb-4">
                          {hasValue(project.title) && (
                            <h3 className="m-0 text-[14px] font-black leading-snug text-slate-950">
                              {project.title}
                            </h3>
                          )}

                          {(hasValue(project.liveLink) ||
                            hasValue(project.githubLink)) && (
                            <p className="font-black text-slate-950">
                              {hasValue(project.liveLink) && (
                                <ProfessionalLink
                                  label="(Live Link)"
                                  url={project.liveLink}
                                  accent={accent}
                                />
                              )}
                              {hasValue(project.githubLink) && (
                                <>
                                  {" "}
                                  <ProfessionalLink
                                    label="(Github Link)"
                                    url={project.githubLink}
                                    accent={accent}
                                  />
                                </>
                              )}
                            </p>
                          )}

                          {hasValue(project.techStack) && (
                            <p className="font-black" style={{ color: accent }}>
                              Tech Stack: {project.techStack}
                            </p>
                          )}

                          {(hasValue(project.description) ||
                            hasValue(project.features) ||
                            hasValue(project.challenges)) && (
                            <ul className="ml-4 list-disc">
                              {hasValue(project.description) && (
                                <li>{project.description}</li>
                              )}
                              {hasValue(project.features) && (
                                <li>{project.features}</li>
                              )}
                              {hasValue(project.challenges) && (
                                <li>{project.challenges}</li>
                              )}
                            </ul>
                          )}
                        </div>
                      ))}
                    </SampleSection>
                  )}

                  {visibleAchievements.length > 0 && (
                    <SampleSection title="Achievements" accent={accent}>
                      <ul className="ml-4 list-disc">
                        {visibleAchievements.map((item, index) => (
                          <li key={index}>
                            {hasValue(item.title) && <b>{item.title}</b>}
                            {hasValue(item.description) &&
                              `${hasValue(item.title) ? " - " : ""}${
                                item.description
                              }`}
                          </li>
                        ))}
                      </ul>
                    </SampleSection>
                  )}

                  {visibleCustomSections.map((section, index) => (
                    <SampleSection
                      key={index}
                      title={section.heading || "Custom Section"}
                      accent={accent}
                    >
                      {hasValue(section.content) && <p>{section.content}</p>}
                    </SampleSection>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


function SampleSection({ title, children, accent = "#0f4c81" }) {
  return (
    <section className="mb-4 break-inside-avoid">
      <h2
        className="mb-2 border-b-[1.7px] pb-1 text-[13.8px] font-black uppercase tracking-wide"
        style={{ color: accent, borderColor: accent }}
      >
        {title}
      </h2>

      <div className="text-[13px] font-medium leading-[1.6] text-slate-950 [&_b]:font-black [&_b]:text-slate-950 [&_li]:my-1 [&_li]:text-[13px] [&_li]:font-medium [&_li]:leading-[1.6] [&_li]:text-slate-950 [&_p]:my-1 [&_p]:text-[13px] [&_p]:font-medium [&_p]:leading-[1.6] [&_p]:text-slate-950">
        {children}
      </div>
    </section>
  );
}

function SampleSkillLine({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <p>
      <b>{title}:</b> {items.join(", ")}
    </p>
  );
}

function Checklist({ checklist }) {
  const items = [
    {
      label: "GitHub profile added",
      done: checklist.hasGithub,
      tip: "Add GitHub to show your code and projects.",
    },
    {
      label: "LinkedIn profile added",
      done: checklist.hasLinkedin,
      tip: "Add LinkedIn for professional identity.",
    },
    {
      label: "Portfolio added",
      done: checklist.hasPortfolio,
      tip: "Portfolio improves your credibility.",
    },
    {
      label: "Live project link added",
      done: checklist.hasLiveProject,
      tip: "Live project links help recruiters verify your work.",
    },
    {
      label: "Coding profile added",
      done: checklist.hasCodingProfile,
      tip: "LeetCode/HackerRank/CodeChef proves problem-solving.",
    },
    {
      label: "Strong project details added",
      done: checklist.hasStrongProjects,
      tip: "Add title, stack, features, challenges and links.",
    },
    {
      label: "ATS keywords added",
      done: checklist.hasAtsKeywords,
      tip: "Role-specific keywords improve screening.",
    },
  ];

  const completed = items.filter((item) => item.done).length;
  const score = Math.round((completed / items.length) * 100);

  return (
    <Card>
      <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-cyan-500 p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold opacity-90">Resume Strength</p>
            <h2 className="mt-1 text-3xl font-black">{score}% Ready</h2>
          </div>

          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/20 text-3xl">
            📄
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="mt-3 text-sm font-semibold opacity-90">
          {completed}/{items.length} resume quality checks completed.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-3 ${
              item.done
                ? "border-emerald-500/20 bg-emerald-500/10"
                : "border-red-500/20 bg-red-500/10"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{item.label}</p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  item.done
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {item.done ? "Done" : "Missing"}
              </span>
            </div>

            {!item.done && (
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {item.tip}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResumeActions({
  saveResume,
  analyzeThisResume,
  downloadResumePdf,
  loading,
}) {
  return (
    <Card>
      <h2 className="text-2xl font-black">Resume Actions</h2>

      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Save your resume, analyze ATS readiness, or open a professional print
        page to save as PDF.
      </p>

      <div className="mt-5 grid gap-3">
        <Button onClick={analyzeThisResume} className="w-full">
          Analyze This Resume
        </Button>

        <Button onClick={downloadResumePdf} variant="soft" className="w-full">
          Print / Download PDF
        </Button>

        <Button onClick={saveResume} variant="soft" className="w-full">
          {loading ? "Saving..." : "Save Resume"}
        </Button>
      </div>

      <div className="mt-4 rounded-2xl bg-indigo-600/10 p-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
        Tip: For clickable links in PDF, use Chrome destination “Save as PDF”.
      </div>
    </Card>
  );
}

function ProfessionalLink({ label, url, accent = "#0f4c81" }) {
  if (!url) return null;

  return (
    <a
      href={formatUrl(url)}
      target="_blank"
      rel="noreferrer"
      className="font-black underline underline-offset-2"
      style={{ color: accent }}
    >
      {label}
    </a>
  );
}

function SectionTitle({ title, noMargin = false }) {
  return (
    <h2 className={`${noMargin ? "" : "mb-4"} text-2xl font-black`}>
      {title}
    </h2>
  );
}

function Field({ label, value, onChange, help }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
      />

      {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}

function labelize(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function formatUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}