import { useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

function join(value) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";
}

function buildResumeText(resume) {
  const personal = resume.personalDetails || {};
  const career = resume.careerDetails || {};
  const skills = resume.skills || {};

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

function openResumePrint(resume) {
  const personal = resume.personalDetails || {};
  const career = resume.careerDetails || {};
  const skills = resume.skills || {};
  const roleHtml = career.targetRole?.trim() ? `<div class="role">${safe(career.targetRole)}</div>` : "";
  const html = `<!doctype html><html><head><title>${safe(personal.name || "Resume")}</title><style>body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;color:#111827}.page{max-width:850px;margin:0 auto;background:#fff;padding:34px;box-shadow:0 20px 60px rgba(15,23,42,.12)}h1{margin:0;color:#4f46e5;font-size:32px}.role{font-size:15px;font-weight:700;margin-top:4px;color:#334155}.contact{font-size:12px;margin-top:12px;color:#475569;line-height:1.7}.links a{color:#4f46e5;font-weight:700;text-decoration:none;margin-right:10px;font-size:12px}section{margin-top:20px;break-inside:avoid}h2{font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#4f46e5;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:0 0 10px}h3{font-size:15px;margin:0 0 4px}p,li{font-size:12.5px;line-height:1.55;color:#334155}ul{margin:6px 0 0 18px;padding:0}@media print{body{background:#fff;padding:0}.page{box-shadow:none}.print-note{display:none}}</style></head><body><div class="page"><header><h1>${safe(personal.name || "Your Name")}</h1>${roleHtml}<div class="contact">${[personal.email,personal.phone,personal.location].filter(Boolean).map(safe).join(" | ")}</div><div class="links">${[link("LinkedIn",personal.linkedin),link("GitHub",personal.github),link("Portfolio",personal.portfolio),link("LeetCode",personal.leetcode)].filter(Boolean).join("")}</div></header>${career.professionalSummary ? `<section><h2>Profile Summary</h2><p>${safe(career.professionalSummary)}</p></section>` : ""}<section><h2>Technical Skills</h2><p><b>Programming:</b> ${safe(join(skills.programmingLanguages))}</p><p><b>Frontend:</b> ${safe(join(skills.frontend))}</p><p><b>Backend:</b> ${safe(join(skills.backend))}</p><p><b>Databases:</b> ${safe(join(skills.databases))}</p><p><b>Tools:</b> ${safe(join(skills.tools))}</p></section><section><h2>Projects</h2>${(resume.projects || []).map((project) => `<div><h3>${safe(project.title)}</h3><p>${safe(project.description)}</p><p><b>Tech:</b> ${safe(project.techStack)}</p></div>`).join("")}</section><section><h2>Education</h2>${(resume.education || []).map((edu) => `<p><b>${safe(edu.degree)}</b><br/>${safe([edu.college, edu.university, edu.year, edu.score].filter(Boolean).join(" | "))}</p>`).join("")}</section></div><div class="print-note" style="text-align:center;margin-top:16px;color:#64748b;font-size:12px">Press Ctrl + P → Save as PDF</div></body></html>`;
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return alert("Popup blocked. Please allow popups and try again.");
  win.document.open();
  win.document.write(html);
  win.document.close();
}

export function History({ setPage }) {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const [resumeData, analysisData, jobMatchData, interviewData] = await Promise.allSettled([
        apiRequest("/resumes"),
        apiRequest("/analysis"),
        apiRequest("/job-match"),
        apiRequest("/interviews"),
      ]);
      if (resumeData.status === "fulfilled") setResumes(resumeData.value.resumes || []);
      if (analysisData.status === "fulfilled") setAnalyses(analysisData.value.analyses || []);
      if (jobMatchData.status === "fulfilled") setJobMatches(jobMatchData.value.matches || jobMatchData.value.jobMatches || []);
      if (interviewData.status === "fulfilled") setInterviews(interviewData.value.interviews || []);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  const totals = useMemo(() => ({ resumes: resumes.length, analyses: analyses.length, jobs: jobMatches.length, interviews: interviews.length }), [resumes, analyses, jobMatches, interviews]);

  async function getFullResume(id) {
    const data = await apiRequest(`/resumes/${id}`);
    return data.resume;
  }

  async function editResume(resume) {
    setError("");
    setMessage("Opening resume in builder...");
    try {
      localStorage.setItem("cg_edit_resume_id", resume._id);
      localStorage.setItem("cg_edit_resume_data", JSON.stringify(resume));
      const fullResume = await getFullResume(resume._id);
      localStorage.setItem("cg_edit_resume_id", fullResume?._id || resume._id);
      localStorage.setItem("cg_edit_resume_data", JSON.stringify(fullResume || resume));
      localStorage.removeItem("cg_resume_builder_draft_v2");
      window.dispatchEvent(new CustomEvent("cg:resume-edit", { detail: { resume: fullResume || resume, resumeId: fullResume?._id || resume._id } }));
      setPage?.("builder");
    } catch (err) {
      setError(err.message || "Failed to open resume for editing");
    }
  }

  async function analyzeResume(resume) {
    try {
      const fullResume = await getFullResume(resume._id);
      localStorage.setItem("cg_analyzer_resume_text", buildResumeText(fullResume));
      localStorage.setItem("cg_analyzer_target_role", fullResume?.careerDetails?.targetRole || "");
      setPage?.("analyzer");
    } catch (err) {
      setError(err.message || "Failed to send resume to analyzer");
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
    if (!window.confirm("Delete this resume permanently?")) return;
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
      <PageHeader eyebrow="History" title="Career Report Center" desc="View resumes, analysis reports, job match reports and interview practice history." action={<Button onClick={() => setPage?.("builder")}>Create Resume</Button>} />
      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Resumes" value={totals.resumes} />
        <Metric label="Analyses" value={totals.analyses} />
        <Metric label="Job Matches" value={totals.jobs} />
        <Metric label="Interviews" value={totals.interviews} />
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {["all", "resumes", "analysis", "jobs", "interviews"].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>{tab === "all" ? "All" : tab === "jobs" ? "Job Matches" : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
          <Button variant="soft" onClick={loadHistory}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </Card>

      {(activeTab === "all" || activeTab === "resumes") && <ResumeSection resumes={resumes} editResume={editResume} analyzeResume={analyzeResume} downloadResume={downloadResume} deleteResume={deleteResume} setReport={setReport} />}
      {(activeTab === "all" || activeTab === "analysis") && <AnalysisSection analyses={analyses} setReport={setReport} />}
      {(activeTab === "all" || activeTab === "jobs") && <JobMatchSection jobMatches={jobMatches} setReport={setReport} />}
      {(activeTab === "all" || activeTab === "interviews") && <InterviewSection interviews={interviews} setReport={setReport} />}

      {report && <ReportModal report={report} onClose={() => setReport(null)} />}
    </div>
  );
}

function ResumeSection({ resumes, editResume, analyzeResume, downloadResume, deleteResume, setReport }) {
  return (
    <Card>
      <h2 className="text-xl font-black">📄 Saved Resumes</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {resumes.length ? resumes.map((resume) => (
          <div key={resume._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-lg font-black">{resume.title || resume?.personalDetails?.name || "Untitled Resume"}</h3><p className="text-sm text-slate-500 dark:text-slate-300">{resume?.careerDetails?.targetRole || "Target role not set"}</p><p className="mt-1 text-xs text-slate-500">Updated: {formatDate(resume.updatedAt)}</p></div>
              <Badge label={resume?.template?.layout || "Resume"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Button variant="soft" onClick={() => setReport({ type: "resume", title: resume?.personalDetails?.name || "Resume", data: resume })}>View</Button><Button variant="soft" onClick={() => editResume(resume)}>Edit</Button><Button variant="soft" onClick={() => analyzeResume(resume)}>Analyze</Button><Button variant="soft" onClick={() => downloadResume(resume)}>Download</Button><Button variant="outline" onClick={() => deleteResume(resume._id)}>Delete</Button></div>
          </div>
        )) : <Empty message="No saved resumes yet." />}
      </div>
    </Card>
  );
}

function AnalysisSection({ analyses, setReport }) {
  return (
    <Card>
      <h2 className="text-xl font-black">🔍 Resume Analysis History</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {analyses.length ? analyses.map((analysis) => (
          <div key={analysis._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{analysis.targetRole || "Resume Analysis"}</h3><p className="text-xs text-slate-500">{formatDate(analysis.createdAt)}</p></div><Score value={analysis.atsScore} suffix="/100" /></div>
            <PreviewList title="Skills Found" items={analysis.skillsFound} />
            <PreviewList title="Missing Skills" items={analysis.missingSkills} tone="amber" />
            <PreviewList title="Weak Sections" items={analysis.weakSections} tone="red" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Suggestions: {(analysis.suggestions || []).length}</p>
            <div className="mt-4"><Button variant="soft" onClick={() => setReport({ type: "analysis", title: "Resume Analysis Report", data: analysis })}>View Report</Button></div>
          </div>
        )) : <Empty message="No resume analysis history yet." />}
      </div>
    </Card>
  );
}

function JobMatchSection({ jobMatches, setReport }) {
  return (
    <Card>
      <h2 className="text-xl font-black">🎯 Job Match Reports</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobMatches.length ? jobMatches.map((match) => (
          <div key={match._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{match.companyName || "Company not set"}</h3><p className="text-sm text-slate-500 dark:text-slate-300">{match.targetRole || "Target role not set"}</p><p className="text-xs text-slate-500">{formatDate(match.createdAt)}</p></div><Score value={match.matchScore} suffix="%" /></div>
            <Badge label={`Shortlist: ${match.shortlistChance || "N/A"}`} />
            <PreviewList title="Matched" items={match.matchedSkills} tone="green" />
            <PreviewList title="Missing" items={match.missingSkills} tone="amber" />
            <div className="mt-4"><Button variant="soft" onClick={() => setReport({ type: "job", title: "Job Match Report", data: match })}>View Report</Button></div>
          </div>
        )) : <Empty message="No job match reports yet. Go to Job Match and analyze your resume against a job description." />}
      </div>
    </Card>
  );
}

function InterviewSection({ interviews, setReport }) {
  return (
    <Card>
      <h2 className="text-xl font-black">🎤 Interview Practice History</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {interviews.length ? interviews.map((interview) => (
          <div key={interview._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-black">{interview.role}</h3><p className="text-sm text-slate-500 dark:text-slate-300">{interview.type} • {interview.level}</p><p className="text-xs text-slate-500">{formatDate(interview.createdAt)}</p></div><Score value={interview.score || 0} suffix="%" /></div>
            <PreviewList title="Weak Areas" items={interview.weakAreas} tone="amber" />
            <div className="mt-4"><Button variant="soft" onClick={() => setReport({ type: "interview", title: "Interview Feedback", data: interview })}>View Feedback</Button></div>
          </div>
        )) : <Empty message="No interview practice yet." />}
      </div>
    </Card>
  );
}

function ReportModal({ report, onClose }) {
  const data = report.data || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-cyan-300">{report.type}</p><h2 className="text-2xl font-black">{report.title}</h2></div><Button variant="soft" onClick={onClose}>Close</Button></div>
        {report.type === "resume" && <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 dark:bg-white/5">{buildResumeText(data)}</pre>}
        {report.type === "analysis" && <ReportGrid rows={[["ATS Score", `${data.atsScore || 0}/100`], ["Skills Found", join(data.skillsFound)], ["Missing Skills", join(data.missingSkills)], ["Weak Sections", join(data.weakSections)], ["Suggestions", (data.suggestions || []).join("\n")], ["Improved Summary", data.improvedSummary || "Not available"]]} />}
        {report.type === "job" && <ReportGrid rows={[["Company", data.companyName || "Not set"], ["Role", data.targetRole || "Not set"], ["Match Score", `${data.matchScore || 0}%`], ["Shortlist Chance", data.shortlistChance || "N/A"], ["Matched Skills", join(data.matchedSkills)], ["Missing Skills", join(data.missingSkills)], ["Required Keywords", join(data.requiredKeywords)], ["Resume Improvements", (data.resumeImprovements || []).join("\n")], ["Interview Questions", (data.expectedInterviewQuestions || []).join("\n")], ["Roadmap", (data.preparationRoadmap || []).join("\n")]]} />}
        {report.type === "interview" && <ReportGrid rows={[["Role", data.role], ["Type", data.type], ["Score", `${data.score || 0}%`], ["Weak Areas", join(data.weakAreas)], ["Questions", (data.questions || []).map((q) => q.question || q).join("\n")]]} />}
      </div>
    </div>
  );
}

function ReportGrid({ rows }) { return <div className="grid gap-4">{rows.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-7">{value || "Not available"}</p></div>)}</div>; }
function Metric({ label, value }) { return <Card><p className="text-sm font-bold text-slate-500 dark:text-slate-300">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></Card>; }
function Badge({ label }) { return <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{label}</span>; }
function Score({ value, suffix }) { return <span className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-black text-white dark:bg-white dark:text-slate-900">{value || 0}{suffix}</span>; }
function PreviewList({ title, items = [], tone = "slate" }) { const colors = tone === "green" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : tone === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : tone === "red" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"; return <div className="mt-3"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p><div className="mt-2 flex flex-wrap gap-2">{items?.length ? items.slice(0, 5).map((item) => <span key={item} className={`rounded-full px-2 py-1 text-xs font-bold ${colors}`}>{item}</span>) : <span className="text-xs text-slate-500">Not available</span>}</div></div>; }
function Empty({ message }) { return <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-sm font-bold text-slate-500 dark:border-white/10">{message}</div>; }
function Notice({ tone, children }) { const styles = tone === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20"; return <div className={`rounded-3xl border p-4 text-sm font-semibold ${styles}`}>{children}</div>; }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "Not available"; }

export function Templates() {
  const templates = ["Minimal ATS", "Modern Developer", "Corporate Blue", "Sidebar Pro", "Two Column", "Frontend Specialist", "Full Stack Pro", "Product Company", "Service Company", "Elegant Fresher"];
  return <div className="space-y-6"><PageHeader eyebrow="Templates" title="Resume Templates" desc="10 stable professional templates are available in Resume Builder." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <Card key={template}><div className="h-40 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-4 dark:border-white/10 dark:from-white/5 dark:to-indigo-500/10"><div className="h-4 w-2/3 rounded bg-indigo-500" /><div className="mt-4 space-y-2"><div className="h-2 w-full rounded bg-slate-300 dark:bg-white/20" /><div className="h-2 w-5/6 rounded bg-slate-300 dark:bg-white/20" /><div className="h-2 w-4/6 rounded bg-slate-300 dark:bg-white/20" /></div></div><h3 className="mt-4 font-black">{template}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Use this layout from Resume Builder.</p></Card>)}</div></div>;
}

export function Profile() {
  const user = JSON.parse(localStorage.getItem("cg_user") || "{}");
  return <div className="space-y-6"><PageHeader eyebrow="Profile" title="Your Profile" desc="Account details used across CareerGuide AI." /><Card><div className="grid gap-4 md:grid-cols-2"><Info label="Name" value={user.name || "Not set"} /><Info label="Email" value={user.email || "Not set"} /><Info label="Target Role" value={user.targetRole || "Fresher"} /><Info label="Password Status" value={user.forcePasswordChange ? "Temporary password active" : "Normal"} /></div></Card></div>;
}

export function Settings({ theme, setTheme, setPage }) {
  return <div className="space-y-6"><PageHeader eyebrow="Settings" title="App Settings" desc="Personalize your app and account security." /><Card><div className="flex flex-wrap gap-3"><Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Switch to Light" : "Switch to Dark"}</Button><Button variant="soft" onClick={() => setPage?.("change-password")}>Change Password</Button></div></Card></div>;
}

function Info({ label, value }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-black">{value}</p></div>; }
