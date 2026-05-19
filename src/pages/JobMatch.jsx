import { useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

const emptyResult = null;

function arrayToText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function buildResumeText(resume) {
  if (!resume) return "";

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
Professional Summary: ${career.professionalSummary || ""}
Career Objective: ${career.careerObjective || ""}

Skills:
Programming: ${arrayToText(skills.programmingLanguages)}
Frontend: ${arrayToText(skills.frontend)}
Backend: ${arrayToText(skills.backend)}
Databases: ${arrayToText(skills.databases)}
Tools: ${arrayToText(skills.tools)}
Soft Skills: ${arrayToText(skills.softSkills)}

Education:
${(resume.education || [])
  .map((edu) => `${edu.degree || ""} ${edu.college || ""} ${edu.university || ""} ${edu.year || ""} ${edu.score || ""}`)
  .join("\n")}

Projects:
${(resume.projects || [])
  .map(
    (project) =>
      `${project.title || ""}\n${project.description || ""}\nTech Stack: ${project.techStack || ""}\nFeatures: ${project.features || ""}\nGitHub: ${project.githubLink || ""}\nLive: ${project.liveLink || ""}`
  )
  .join("\n\n")}

Experience:
${(resume.experience || [])
  .map((item) => `${item.role || ""} at ${item.company || ""} ${item.duration || ""}\n${item.description || ""}`)
  .join("\n\n")}

Certifications:
${(resume.certifications || []).map((item) => `${item.title || ""} ${item.issuer || ""} ${item.year || ""}`).join("\n")}
`.trim();
}

export function JobMatch() {
  const [mode, setMode] = useState("saved");
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("cg_analyzer_resume_text") || "");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(() => localStorage.getItem("cg_analyzer_target_role") || "");
  const [companyName, setCompanyName] = useState("");
  const [resumePdf, setResumePdf] = useState(null);
  const [jobPdf, setJobPdf] = useState(null);
  const [result, setResult] = useState(emptyResult);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadResumes();
    loadHistory();
  }, []);

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume._id === selectedResumeId),
    [resumes, selectedResumeId]
  );

  useEffect(() => {
    if (selectedResume) {
      setResumeText(buildResumeText(selectedResume));
      setTargetRole(selectedResume?.careerDetails?.targetRole || targetRole || "");
    }
  }, [selectedResumeId]);

  async function loadResumes() {
    try {
      const data = await apiRequest("/resumes");
      setResumes(data.resumes || []);
    } catch (err) {
      setMessage("Saved resumes not loaded. You can still paste/upload resume text.");
    }
  }

  async function loadHistory() {
    try {
      const data = await apiRequest("/job-match");
      setHistory(data.matches || []);
    } catch {
      setHistory([]);
    }
  }

  function clearResult() {
    setResult(null);
    setError("");
    setMessage("");
  }

  async function analyzeManual() {
    clearResult();

    if (!resumeText.trim() || resumeText.trim().length < 30) {
      setError("Please select/paste resume text before analysis.");
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError("Please paste job description or upload job notification PDF.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/job-match", {
        method: "POST",
        body: JSON.stringify({ resumeText, jobDescription, targetRole, companyName }),
      });

      setResult(data.result);
      setMessage("Detailed job match report generated ✅");
      loadHistory();
    } catch (err) {
      setError(err.message || "Job match analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function analyzePdf() {
    clearResult();

    if (!resumePdf && !resumeText.trim()) {
      setError("Upload resume PDF or paste/select resume text.");
      return;
    }

    if (!jobPdf && !jobDescription.trim()) {
      setError("Upload job notification PDF or paste job description.");
      return;
    }

    const formData = new FormData();
    formData.append("targetRole", targetRole || "");
    formData.append("companyName", companyName || "");
    formData.append("resumeText", resumeText || "");
    formData.append("jobDescription", jobDescription || "");
    if (resumePdf) formData.append("resumePdf", resumePdf);
    if (jobPdf) formData.append("jobPdf", jobPdf);

    setLoading(true);

    try {
      const data = await apiRequest("/job-match/pdf", {
        method: "POST",
        body: formData,
      });

      setResult(data.result);
      setMessage("PDF job match report generated ✅");
      loadHistory();
    } catch (err) {
      setError(err.message || "PDF analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function printReport() {
    window.print();
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Job Match"
        title="Resume + Job Match Analyzer"
        desc="Compare saved resume, uploaded resume PDF or manual resume text against a job notification PDF or job description."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-black">Input Mode</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <ModeButton active={mode === "saved"} onClick={() => setMode("saved")}>Saved</ModeButton>
              <ModeButton active={mode === "manual"} onClick={() => setMode("manual")}>Manual</ModeButton>
              <ModeButton active={mode === "pdf"} onClick={() => setMode("pdf")}>PDF</ModeButton>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-black">Job Details</h2>
            <div className="mt-4 space-y-3">
              <Input label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Example: TCS, Infosys, Google" />
              <Input label="Target Role" value={targetRole} onChange={setTargetRole} placeholder="Example: Frontend Developer" />
            </div>
          </Card>

          {mode === "saved" && (
            <Card>
              <h2 className="text-lg font-black">Select Saved Resume</h2>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none dark:border-white/10 dark:bg-white/5"
              >
                <option value="">Choose resume</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.title || resume.personalDetails?.name || "Untitled Resume"}
                  </option>
                ))}
              </select>
            </Card>
          )}

          {mode === "pdf" && (
            <Card>
              <h2 className="text-lg font-black">Upload PDFs</h2>
              <div className="mt-4 space-y-4">
                <FileInput label="Resume PDF" onChange={setResumePdf} file={resumePdf} />
                <FileInput label="Job Notification PDF" onChange={setJobPdf} file={jobPdf} />
              </div>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-black">Resume Text</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              placeholder="Paste resume text or select saved resume/upload PDF."
            />
          </Card>

          <Card>
            <h2 className="text-lg font-black">Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-white/10 dark:bg-white/5"
              placeholder="Paste job description here. If you upload job PDF, this is optional."
            />
          </Card>

          {message && <Alert type="success">{message}</Alert>}
          {error && <Alert type="error">{error}</Alert>}

          <div className="flex flex-wrap gap-3">
            <Button onClick={mode === "pdf" ? analyzePdf : analyzeManual}>
              {loading ? "Analyzing..." : "Generate Match Report"}
            </Button>
            {result && <Button variant="soft" onClick={printReport}>Print Report</Button>}
          </div>
        </div>

        <div className="space-y-5">
          {result ? <DetailedReport result={result} /> : <EmptyReport />}

          <Card>
            <h2 className="text-lg font-black">Recent Match Reports</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 && <p className="text-sm text-slate-500">No job match history yet.</p>}
              {history.slice(0, 5).map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setResult({ ...item, executiveSummary: `${item.companyName || "Job"} match score is ${item.matchScore}/100.` })}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-left hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.companyName || "Company"}</p>
                      <p className="text-sm text-slate-500">{item.targetRole}</p>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-black text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
                      {item.matchScore}/100
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailedReport({ result }) {
  return (
    <div className="space-y-5 print:bg-white print:text-black">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-500">Detailed Report</p>
            <h2 className="mt-2 text-2xl font-black">{result.companyName || "Job"} Match Report</h2>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{result.executiveSummary}</p>
          </div>
          <div className="rounded-3xl bg-indigo-600 p-5 text-center text-white shadow-lg shadow-indigo-500/25">
            <p className="text-sm font-bold">Match Score</p>
            <p className="text-4xl font-black">{result.matchScore}</p>
            <p className="text-xs font-bold">/100</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard title="Shortlist Chance" value={result.shortlistChance} />
        <MetricCard title="Matched Skills" value={result.matchedSkills?.length || 0} />
        <MetricCard title="Missing Skills" value={result.missingSkills?.length || 0} />
      </div>

      <ReportSection title="Matched Skills" items={result.matchedSkills} chip="success" />
      <ReportSection title="Missing Skills" items={result.missingSkills} chip="danger" />
      <ReportSection title="Required Keywords" items={result.requiredKeywords} chip="neutral" />
      <ReportSection title="Resume Changes Needed" items={result.resumeImprovements} numbered />
      <ReportSection title="Expected Interview Questions" items={result.expectedInterviewQuestions} numbered />
      <ReportSection title="30-Day Preparation Roadmap" items={result.preparationRoadmap} numbered />
    </div>
  );
}

function EmptyReport() {
  return (
    <Card>
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-100 text-3xl dark:bg-indigo-500/20">
          📄
        </div>
        <h2 className="text-2xl font-black">Your detailed report will appear here</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-300">
          Select a saved resume or upload PDFs, paste the job description and generate a professional match report.
        </p>
      </div>
    </Card>
  );
}

function MetricCard({ title, value }) {
  return (
    <Card>
      <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </Card>
  );
}

function ReportSection({ title, items = [], chip, numbered = false }) {
  return (
    <Card>
      <h3 className="text-lg font-black">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No items found.</p>
      ) : numbered ? (
        <ol className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              <span className="mr-2 font-black text-indigo-600">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span key={`${title}-${index}`} className={chipClass(chip)}>
              {item}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}

function chipClass(type) {
  const base = "rounded-full px-3 py-1 text-sm font-bold";
  if (type === "success") return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200`;
  if (type === "danger") return `${base} bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200`;
  return `${base} bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200`;
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
        active
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}

function FileInput({ label, file, onChange }) {
  return (
    <label className="block rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/20">
      <span className="block text-sm font-black">{label}</span>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="mt-3 block w-full text-sm"
      />
      {file && <span className="mt-2 block text-xs font-bold text-emerald-600">Selected: {file.name}</span>}
    </label>
  );
}

function Alert({ type, children }) {
  const cls =
    type === "success"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";

  return <div className={`rounded-2xl p-3 text-sm font-bold ${cls}`}>{children}</div>;
}
