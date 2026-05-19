import { useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { apiRequest } from "../utils/api";

const roleOptions = [
  "Frontend Developer",
  "React Developer",
  "Full Stack Developer",
  "MERN Stack Developer",
  "Java Developer",
  "Data Analyst",
  "AI/ML Fresher",
];

export function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState(() => localStorage.getItem("cg_analyzer_resume_text") || "");
  const [targetRole, setTargetRole] = useState(() => localStorage.getItem("cg_analyzer_target_role") || "Frontend Developer");
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedResumeText = localStorage.getItem("cg_analyzer_resume_text");
    const savedTargetRole = localStorage.getItem("cg_analyzer_target_role");

    if (savedResumeText) setResumeText(savedResumeText);
    if (savedTargetRole) setTargetRole(savedTargetRole);
  }, []);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await apiRequest("/analysis");
        setHistory(data.analyses || []);
      } catch {
        setHistory([]);
      }
    }

    loadHistory();
  }, []);

  const wordCount = useMemo(() => resumeText.trim().split(/\s+/).filter(Boolean).length, [resumeText]);

  async function analyzeResume() {
    setError("");
    setMessage("");

    if (!resumeText.trim()) {
      setError("Resume text is required. Paste resume text or use Analyze This Resume from Resume Builder / History.");
      return;
    }

    if (!targetRole.trim()) {
      setError("Target role is required.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/analysis", {
        method: "POST",
        body: JSON.stringify({ resumeText, targetRole }),
      });

      setAnalysis(data.analysis);
      setHistory((prev) => [data.analysis, ...prev]);
      setMessage("Resume analyzed successfully ✅");
    } catch (err) {
      setError(err.message || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function clearAnalyzerData() {
    localStorage.removeItem("cg_analyzer_resume_text");
    localStorage.removeItem("cg_analyzer_target_role");
    setResumeText("");
    setTargetRole("Frontend Developer");
    setAnalysis(null);
    setMessage("Analyzer fields cleared.");
  }

  const score = analysis?.atsScore || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resume Analyzer"
        title="ATS Resume Analysis"
        desc="Paste resume text or analyze a resume from Resume Builder / History. Get score, missing skills and improvements."
        action={<Button onClick={analyzeResume}>{loading ? "Analyzing..." : "Analyze Resume"}</Button>}
      />

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Resume Input</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Words: {wordCount}</p>
            </div>
            <Button variant="soft" onClick={clearAnalyzerData}>Clear</Button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Target Role</span>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                list="role-options"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
                placeholder="Frontend Developer"
              />
              <datalist id="role-options">
                {roleOptions.map((role) => <option key={role} value={role} />)}
              </datalist>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Resume Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={16}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
                placeholder="Paste resume text here..."
              />
            </label>

            <Button onClick={analyzeResume}>{loading ? "Analyzing..." : "Analyze Resume"}</Button>
          </div>
        </Card>

        <div className="space-y-6">
          <ScoreCard
            title="ATS Score"
            value={score}
            label={score >= 75 ? "Strong" : score >= 50 ? "Needs polish" : "Needs improvement"}
            tone={score >= 75 ? "success" : score >= 50 ? "warning" : "danger"}
          />

          {analysis ? (
            <Card>
              <h2 className="text-xl font-black">Analysis Result</h2>
              <div className="mt-4 space-y-5">
                <ResultBlock title="Skills Found" items={analysis.skillsFound} empty="No required skills detected yet." tone="success" />
                <ResultBlock title="Missing Skills" items={analysis.missingSkills} empty="No major missing skills found." tone="warning" />
                <ResultBlock title="Weak Sections" items={analysis.weakSections} empty="No weak sections detected." tone="danger" />

                <div>
                  <h3 className="font-black">Suggestions</h3>
                  <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {(analysis.suggestions || []).map((suggestion) => <li key={suggestion}>• {suggestion}</li>)}
                  </ul>
                </div>

                {analysis.improvedSummary && (
                  <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
                    <p className="font-black">Improved Summary</p>
                    <p className="mt-1">{analysis.improvedSummary}</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-xl font-black">No analysis yet</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Analyze a resume to see ATS score, missing skills and improvements.</p>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-black">Recent Analyses</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {history.length ? history.slice(0, 6).map((item) => (
            <div key={item._id || item.createdAt} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="font-black">{item.targetRole}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Score: {item.atsScore}/100</p>
              <p className="mt-1 text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</p>
            </div>
          )) : <p className="text-sm text-slate-500 dark:text-slate-300">No analysis history yet.</p>}
        </div>
      </Card>
    </div>
  );
}

function Notice({ tone, children }) {
  const styles = tone === "success"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20"
    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";

  return <div className={`rounded-3xl border p-4 text-sm font-semibold ${styles}`}>{children}</div>;
}

function ResultBlock({ title, items = [], empty, tone }) {
  const toneClass = {
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  }[tone];

  return (
    <div>
      <h3 className="font-black">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items?.length ? items.map((item) => (
          <span key={item} className={`rounded-full px-3 py-2 text-xs font-bold ${toneClass}`}>{item}</span>
        )) : <p className="text-sm text-slate-500 dark:text-slate-300">{empty}</p>}
      </div>
    </div>
  );
}
