import { useEffect, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

function buildResumeText(resume) {
  const personal = resume.personalDetails || {};
  const career = resume.careerDetails || {};
  const skills = resume.skills || {};
  const join = (value) => Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";

  return `
Name: ${personal.name || ""}
Email: ${personal.email || ""}
Phone: ${personal.phone || ""}
Location: ${personal.location || ""}
LinkedIn: ${personal.linkedin || ""}
GitHub: ${personal.github || ""}
Portfolio: ${personal.portfolio || ""}
LeetCode: ${personal.leetcode || ""}

Target Role: ${career.targetRole || ""}
Experience Level: ${career.experienceLevel || ""}

Professional Summary:
${career.professionalSummary || ""}

Career Objective:
${career.careerObjective || ""}

Skills:
Programming: ${join(skills.programmingLanguages)}
Frontend: ${join(skills.frontend)}
Backend: ${join(skills.backend)}
Databases: ${join(skills.databases)}
Tools: ${join(skills.tools)}
Soft Skills: ${join(skills.softSkills)}

Education:
${(resume.education || []).map((item) => `${item.degree || ""} ${item.college || ""} ${item.university || ""} ${item.year || ""} ${item.score || ""} ${item.coursework || ""}`).join("\n")}

Projects:
${(resume.projects || []).map((item) => `${item.title || ""}\n${item.description || ""}\nTech Stack: ${item.techStack || ""}\nFeatures: ${item.features || ""}\nChallenges: ${item.challenges || ""}\nGitHub: ${item.githubLink || ""}\nLive: ${item.liveLink || ""}`).join("\n\n")}

Experience:
${(resume.experience || []).map((item) => `${item.role || ""} at ${item.company || ""} ${item.duration || ""}\n${item.description || ""}`).join("\n\n")}

Certifications:
${(resume.certifications || []).map((item) => `${item.title || ""} ${item.issuer || ""} ${item.year || ""} ${item.link || ""}`).join("\n")}

Achievements:
${(resume.achievements || []).map((item) => `${item.title || ""}: ${item.description || ""}`).join("\n")}

Languages: ${join(resume.languages)}
Interests: ${join(resume.interests)}
`.trim();
}

function openResumePrint(resume) {
  const html = buildPrintableResume(resume);
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return alert("Popup blocked. Please allow popups and try again.");
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function safe(value = "") {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function link(label, url) {
  if (!url) return "";
  const href = url.startsWith("http") ? url : `https://${url}`;
  return `<a href="${safe(href)}" target="_blank">${safe(label)}</a>`;
}

function buildPrintableResume(resume) {
  const personal = resume.personalDetails || {};
  const career = resume.careerDetails || {};
  const skills = resume.skills || {};
  const custom = resume.customization || {};
  const color = custom.themeColor || "#4f46e5";
  const titles = custom.sectionTitles || {};
  const show = custom.showSections || {};
  const showSection = (key) => show[key] !== false;
  const join = (value) => Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";

  const section = (title, body) => body ? `<section><h2>${safe(title)}</h2>${body}</section>` : "";

  return `<!doctype html>
<html>
<head>
  <title>${safe(personal.name || "Resume")}</title>
  <style>
    body{font-family:Arial, sans-serif;background:#f1f5f9;margin:0;padding:24px;color:#111827}
    .page{max-width:850px;margin:0 auto;background:#fff;padding:34px;box-shadow:0 20px 60px rgba(15,23,42,.12)}
    h1{margin:0;color:${color};font-size:32px;letter-spacing:-.04em}
    .role{font-size:15px;font-weight:700;margin-top:4px;color:#334155}
    .contact{font-size:12px;margin-top:12px;color:#475569;line-height:1.7}
    .links a{color:${color};font-weight:700;text-decoration:none;margin-right:10px;font-size:12px}
    section{margin-top:20px;break-inside:avoid}
    h2{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:${color};border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:0 0 10px}
    h3{font-size:15px;margin:0 0 4px;color:#111827}
    p,li{font-size:12.5px;line-height:1.55;color:#334155}
    ul{margin:6px 0 0 18px;padding:0}
    .meta{font-size:12px;color:#64748b}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .print-note{margin:20px auto 0;max-width:850px;text-align:center;color:#64748b;font-size:12px}
    @media print{body{background:#fff;padding:0}.page{box-shadow:none}.print-note{display:none}}
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>${safe(personal.name || "Your Name")}</h1>
      <div class="role">${safe(career.targetRole || "Target Role")}</div>
      <div class="contact">${[personal.email, personal.phone, personal.location].filter(Boolean).map(safe).join(" | ")}</div>
      <div class="links">${[
        link("LinkedIn", personal.linkedin), link("GitHub", personal.github), link("Portfolio", personal.portfolio), link("LeetCode", personal.leetcode), link("HackerRank", personal.hackerrank), link("CodeChef", personal.codechef), link("GFG", personal.geeksforgeeks),
      ].filter(Boolean).join("")}</div>
    </header>

    ${showSection("summary") ? section(titles.summary || "Profile Summary", career.professionalSummary ? `<p>${safe(career.professionalSummary)}</p>` : "") : ""}
    ${showSection("objective") ? section(titles.objective || "Career Objective", career.careerObjective ? `<p>${safe(career.careerObjective)}</p>` : "") : ""}
    ${showSection("skills") ? section(titles.skills || "Technical Skills", `
      <p><b>Programming:</b> ${safe(join(skills.programmingLanguages))}</p>
      <p><b>Frontend:</b> ${safe(join(skills.frontend))}</p>
      <p><b>Backend:</b> ${safe(join(skills.backend))}</p>
      <p><b>Databases:</b> ${safe(join(skills.databases))}</p>
      <p><b>Tools:</b> ${safe(join(skills.tools))}</p>
      <p><b>Soft Skills:</b> ${safe(join(skills.softSkills))}</p>
    `) : ""}
    ${showSection("education") ? section(titles.education || "Education", (resume.education || []).map((edu) => `<div><h3>${safe(edu.degree)}</h3><p>${safe([edu.college, edu.university, edu.year, edu.score].filter(Boolean).join(" | "))}</p>${edu.coursework ? `<p><b>Coursework:</b> ${safe(edu.coursework)}</p>` : ""}</div>`).join("")) : ""}
    ${showSection("projects") ? section(titles.projects || "Projects", (resume.projects || []).map((project) => `<div><h3>${safe(project.title)}</h3><p class="meta">${safe(project.techStack)}</p><ul>${[project.description, project.features, project.challenges].filter(Boolean).map((text) => `<li>${safe(text)}</li>`).join("")}</ul><p>${link("View Code", project.githubLink)} ${link("Live Demo", project.liveLink)}</p></div>`).join("")) : ""}
    ${showSection("experience") ? section(titles.experience || "Experience / Internship", (resume.experience || []).map((exp) => `<div><h3>${safe(exp.role || exp.company)}</h3><p class="meta">${safe([exp.company, exp.duration].filter(Boolean).join(" | "))}</p><p>${safe(exp.description)}</p></div>`).join("")) : ""}
    ${showSection("certifications") ? section(titles.certifications || "Certifications", (resume.certifications || []).map((cert) => `<p><b>${safe(cert.title)}</b> ${safe([cert.issuer, cert.year].filter(Boolean).join(" | "))} ${link("View Certificate", cert.link)}</p>`).join("")) : ""}
    ${showSection("achievements") ? section(titles.achievements || "Achievements", (resume.achievements || []).map((item) => `<p><b>${safe(item.title)}</b>${item.description ? ` - ${safe(item.description)}` : ""}</p>`).join("")) : ""}
    <div class="two">
      ${showSection("languages") ? section(titles.languages || "Languages", join(resume.languages) ? `<p>${safe(join(resume.languages))}</p>` : "") : ""}
      ${showSection("interests") ? section(titles.interests || "Interests", join(resume.interests) ? `<p>${safe(join(resume.interests))}</p>` : "") : ""}
    </div>
    ${showSection("customSections") ? (resume.customSections || []).map((customSection) => section(customSection.heading || titles.customSections || "Additional Information", customSection.content ? `<p>${safe(customSection.content)}</p>` : "")).join("") : ""}
  </div>
  <div class="print-note">Press Ctrl + P → Save as PDF</div>
</body>
</html>`;
}

export function History({ setPage }) {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [viewResume, setViewResume] = useState(null);

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const [resumeData, analysisData] = await Promise.allSettled([
        apiRequest("/resumes"),
        apiRequest("/analysis"),
      ]);

      if (resumeData.status === "fulfilled") setResumes(resumeData.value.resumes || []);
      if (analysisData.status === "fulfilled") setAnalyses(analysisData.value.analyses || []);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function getFullResume(id) {
    const data = await apiRequest(`/resumes/${id}`);
    return data.resume;
  }

  async function editResume(resume) {
    try {
      const fullResume = await getFullResume(resume._id);
      localStorage.setItem("cg_edit_resume_id", fullResume._id);
      localStorage.setItem("cg_edit_resume_data", JSON.stringify(fullResume));
      setPage?.("builder");
    } catch (err) {
      setError(err.message || "Failed to open resume for editing");
    }
  }

  async function analyzeResume(resume) {
    try {
      const fullResume = await getFullResume(resume._id);
      localStorage.setItem("cg_analyzer_resume_text", buildResumeText(fullResume));
      localStorage.setItem("cg_analyzer_target_role", fullResume?.careerDetails?.targetRole || "Frontend Developer");
      setPage?.("analyzer");
    } catch (err) {
      setError(err.message || "Failed to send resume to analyzer");
    }
  }

  async function viewSavedResume(resume) {
    try {
      const fullResume = await getFullResume(resume._id);
      setViewResume(fullResume);
    } catch (err) {
      setError(err.message || "Failed to view resume");
    }
  }

  async function downloadResume(resume) {
    try {
      const fullResume = await getFullResume(resume._id);
      openResumePrint(fullResume);
    } catch (err) {
      setError(err.message || "Failed to download resume");
    }
  }

  async function deleteResume(id) {
    const confirmDelete = window.confirm("Delete this resume permanently?");
    if (!confirmDelete) return;

    try {
      await apiRequest(`/resumes/${id}`, { method: "DELETE" });
      setMessage("Resume deleted successfully.");
      setResumes((prev) => prev.filter((resume) => resume._id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete resume");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="History"
        title="Your Career Activity"
        desc="Manage saved resumes, analyze old resumes and download PDFs."
        action={<Button onClick={() => setPage?.("builder")}>Create Resume</Button>}
      />

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Saved Resumes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">View, edit, analyze, download or delete your resumes.</p>
          </div>
          <Button variant="soft" onClick={loadHistory}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {resumes.length ? resumes.map((resume) => (
            <div key={resume._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{resume.title || resume?.personalDetails?.name || "Untitled Resume"}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{resume?.careerDetails?.targetRole || "Target role not set"}</p>
                  <p className="mt-1 text-xs text-slate-500">Updated: {resume.updatedAt ? new Date(resume.updatedAt).toLocaleString() : ""}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {resume?.template?.layout || "Minimal ATS"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="soft" onClick={() => viewSavedResume(resume)}>View</Button>
                <Button variant="soft" onClick={() => editResume(resume)}>Edit</Button>
                <Button variant="soft" onClick={() => analyzeResume(resume)}>Analyze</Button>
                <Button variant="soft" onClick={() => downloadResume(resume)}>Download</Button>
                <Button variant="outline" onClick={() => deleteResume(resume._id)}>Delete</Button>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10 lg:col-span-2">
              <p className="font-bold">No saved resumes yet.</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Create your first resume from Resume Builder.</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-black">Resume Analysis History</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {analyses.length ? analyses.slice(0, 9).map((analysis) => (
            <div key={analysis._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="font-black">{analysis.targetRole}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">ATS Score: {analysis.atsScore}/100</p>
              <p className="mt-1 text-xs text-slate-500">{analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : ""}</p>
            </div>
          )) : <p className="text-sm text-slate-500 dark:text-slate-300">No analysis history yet.</p>}
        </div>
      </Card>

      {viewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{viewResume?.personalDetails?.name || "Resume Preview"}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">{viewResume?.careerDetails?.targetRole}</p>
              </div>
              <Button variant="soft" onClick={() => setViewResume(null)}>Close</Button>
            </div>
            <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 dark:bg-white/5">{buildResumeText(viewResume)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function Notice({ tone, children }) {
  const styles = tone === "success"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";
  return <div className={`rounded-3xl border p-4 text-sm font-semibold ${styles}`}>{children}</div>;
}

export function Templates() {
  const templates = [
    "Minimal ATS", "Modern Developer", "Corporate Blue", "Sidebar Pro", "Two Column", "Frontend Specialist", "Full Stack Pro", "Product Company", "Service Company", "Elegant Fresher",
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Templates" title="Resume Templates" desc="10 stable professional templates are available in Resume Builder." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template}>
            <div className="h-40 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-4 dark:border-white/10 dark:from-white/5 dark:to-indigo-500/10">
              <div className="h-4 w-2/3 rounded bg-indigo-500" />
              <div className="mt-4 space-y-2">
                <div className="h-2 w-full rounded bg-slate-300 dark:bg-white/20" />
                <div className="h-2 w-5/6 rounded bg-slate-300 dark:bg-white/20" />
                <div className="h-2 w-4/6 rounded bg-slate-300 dark:bg-white/20" />
              </div>
            </div>
            <h3 className="mt-4 font-black">{template}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Use this layout from Resume Builder.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile() {
  const user = JSON.parse(localStorage.getItem("cg_user") || "{}");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title="Your Profile" desc="Account details used across CareerGuide AI." />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Name" value={user.name || "Not set"} />
          <Info label="Email" value={user.email || "Not set"} />
          <Info label="Target Role" value={user.targetRole || "Fresher"} />
          <Info label="Password Status" value={user.forcePasswordChange ? "Temporary password active" : "Normal"} />
        </div>
      </Card>
    </div>
  );
}

export function Settings({ theme, setTheme, setPage }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Settings" title="App Settings" desc="Personalize your app and account security." />
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Switch to Light" : "Switch to Dark"}</Button>
          <Button variant="soft" onClick={() => setPage?.("change-password")}>Change Password</Button>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
