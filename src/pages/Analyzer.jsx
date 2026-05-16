import { useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { roles } from "../data/mockData";
import { apiRequest } from "../utils/api";

export function ResumeAnalyzer({ setPage }) {
 const [targetRole, setTargetRole] = useState(
  () => localStorage.getItem("cg_analyzer_target_role") || "Frontend Developer"
);
 const [resumeText, setResumeText] = useState(
  () =>
    localStorage.getItem("cg_analyzer_resume_text") ||
    "Anudeep Frontend Developer. Skills: HTML CSS JavaScript React Tailwind Git. Project: DSA Visualizer built using React and Tailwind CSS. GitHub: github.com/Anudeep1411. Deployment on Vercel."
);

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeResume() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const data = await apiRequest("/analysis", {
        method: "POST",
        body: JSON.stringify({
          targetRole,
          resumeText,
        }),
      });

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const atsScore = analysis?.atsScore || 0;
  const skillsFound = analysis?.skillsFound || [];
  const missingSkills = analysis?.missingSkills || [];
  const weakSections = analysis?.weakSections || [];
  const suggestions = analysis?.suggestions || [];

  return (
    <div>
      <PageHeader
        eyebrow="AI Resume Analyzer"
        title="Analyze resume quality and ATS readiness"
        desc="Paste your resume text and target role to get score, missing skills, weak sections and improvement suggestions."
        action={
          <Button onClick={analyzeResume}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </Button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <div className="space-y-5">
          <Card>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Target Role</span>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">Resume Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text here..."
                className="h-80 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <Button onClick={analyzeResume} className="mt-4 w-full">
              {loading ? "Analyzing..." : "Run Resume Analysis"}
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl font-black">How it works</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This version uses a rule-based analyzer. Later we will connect AI
              API to give more advanced ATS feedback, better project bullets and
              role-specific suggestions.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ScoreCard
              title="ATS Score"
              value={atsScore}
              label={atsScore >= 80 ? "Good" : atsScore >= 60 ? "Average" : "Improve"}
              tone={atsScore >= 80 ? "success" : atsScore >= 60 ? "warning" : "danger"}
              trend="+"
            />

            <ScoreCard
              title="Skills Found"
              value={Math.min(skillsFound.length * 15, 100)}
              label={`${skillsFound.length} found`}
              tone="success"
              trend="+"
            />

            <ScoreCard
              title="Missing Skills"
              value={Math.max(100 - missingSkills.length * 15, 0)}
              label={`${missingSkills.length} missing`}
              tone={missingSkills.length > 3 ? "danger" : "warning"}
              trend="+"
            />

            <ScoreCard
              title="Project Strength"
              value={weakSections.length === 0 ? 90 : 65}
              label={weakSections.length === 0 ? "Strong" : "Improve"}
              tone={weakSections.length === 0 ? "success" : "warning"}
              trend="+"
            />
          </div>

          {!analysis ? (
            <Card>
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">
                    🔍
                  </div>
                  <h2 className="mt-4 text-2xl font-black">No analysis yet</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Paste resume text and click Analyze Resume to see ATS score,
                    missing skills and improvement suggestions.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-2xl font-black">Resume Analysis Report</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ResultBox title="Skills Found" items={skillsFound} empty="No matching skills found" />
                <ResultBox title="Missing Skills" items={missingSkills} empty="No missing skills" />
                <ResultBox title="Weak Sections" items={weakSections} empty="No weak sections detected" />
                <ResultBox title="Suggestions" items={suggestions} empty="No suggestions" />
              </div>

              <div className="mt-5 rounded-2xl bg-indigo-600/10 p-4">
                <h3 className="font-black text-indigo-600 dark:text-cyan-300">
                  Improved Summary
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {analysis.improvedSummary}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="soft">Save Analysis</Button>
                <Button variant="soft">Download Report</Button>
                <Button onClick={() => setPage("interview")} variant="soft">
                  Practice Interview
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultBox({ title, items, empty }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <h3 className="font-black">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}