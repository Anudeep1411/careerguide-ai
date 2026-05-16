import { useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { roles } from "../data/mockData";
import { apiRequest } from "../utils/api";

export function JobMatch({ setPage }) {
  const [targetRole, setTargetRole] = useState("Frontend Developer");
  const [companyName, setCompanyName] = useState("Demo Company");

  const [resumeText, setResumeText] = useState(
    "Anudeep Frontend Developer. Skills: HTML CSS JavaScript React Tailwind Git GitHub. Project: DSA Visualizer built using React and Tailwind CSS. Deployment on Vercel."
  );

  const [jobDescription, setJobDescription] = useState(
    "We are hiring a Frontend Developer with skills in HTML, CSS, JavaScript, React, Git, Responsive Design, Tailwind and deployment experience."
  );

  const [jobMatch, setJobMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeJobMatch() {
    setLoading(true);
    setError("");
    setJobMatch(null);

    try {
      const data = await apiRequest("/job-match", {
        method: "POST",
        body: JSON.stringify({
          targetRole,
          companyName,
          resumeText,
          jobDescription,
        }),
      });

      setJobMatch(data.jobMatch);
    } catch (err) {
      setError(err.message || "Job match analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const matchScore = jobMatch?.matchScore || 0;
  const keywordScore = jobMatch?.requiredKeywords?.length
    ? Math.round(
        (jobMatch.matchedSkills.length / jobMatch.requiredKeywords.length) * 100
      )
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="AI Job Match Analyzer"
        title="Compare your resume with any job description"
        desc="Paste your resume and job description to get match score, shortlist chance estimate, missing skills and expected interview questions."
        action={
          <Button onClick={analyzeJobMatch}>
            {loading ? "Analyzing..." : "Analyze Match"}
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
              <span className="mb-2 block text-sm font-bold">Company Name</span>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Example: TCS, Infosys, Demo Company"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">Resume Text</span>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste resume text here..."
                className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">Job Description</span>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste company job notification / job description here..."
                className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>

            <Button onClick={analyzeJobMatch} className="mt-4 w-full">
              {loading ? "Analyzing..." : "Analyze Job Match"}
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Important Note</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Shortlist chance is only an estimate based on resume-job keyword
              match. Actual shortlisting depends on recruiter, company, competition
              and experience.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard
              title="Job Match"
              value={matchScore}
              label={
                matchScore >= 80
                  ? "High"
                  : matchScore >= 60
                  ? "Moderate"
                  : "Low"
              }
              tone={
                matchScore >= 80
                  ? "success"
                  : matchScore >= 60
                  ? "warning"
                  : "danger"
              }
              trend="+"
            />

            <ScoreCard
              title="Shortlist Chance"
              value={
                jobMatch?.shortlistChance === "High"
                  ? 85
                  : jobMatch?.shortlistChance === "Moderate"
                  ? 65
                  : 40
              }
              label={jobMatch?.shortlistChance || "Estimate"}
              tone={
                jobMatch?.shortlistChance === "High"
                  ? "success"
                  : jobMatch?.shortlistChance === "Moderate"
                  ? "warning"
                  : "danger"
              }
              trend="+"
            />

            <ScoreCard
              title="Keyword Match"
              value={keywordScore}
              label={`${jobMatch?.matchedSkills?.length || 0} matched`}
              tone={keywordScore >= 70 ? "success" : "warning"}
              trend="+"
            />
          </div>

          {!jobMatch ? (
            <Card>
              <div className="grid min-h-[420px] place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">
                    🎯
                  </div>
                  <h2 className="mt-4 text-2xl font-black">No job match yet</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Paste your resume and job description, then click Analyze Job
                    Match to see score, missing skills and expected questions.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <h2 className="text-2xl font-black">Job Match Report</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ResultBox
                  title="Matched Skills"
                  items={jobMatch.matchedSkills || []}
                  empty="No matched skills found"
                />

                <ResultBox
                  title="Missing Skills"
                  items={jobMatch.missingSkills || []}
                  empty="No missing skills detected"
                />

                <ResultBox
                  title="Required Keywords"
                  items={jobMatch.requiredKeywords || []}
                  empty="No keywords detected from job description"
                />

                <ResultBox
                  title="Resume Improvements"
                  items={jobMatch.resumeImprovements || []}
                  empty="No improvements suggested"
                />

                <ResultBox
                  title="Expected Interview Questions"
                  items={jobMatch.expectedInterviewQuestions || []}
                  empty="No questions generated"
                />

                <ResultBox
                  title="Preparation Roadmap"
                  items={jobMatch.preparationRoadmap || []}
                  empty="No roadmap generated"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-indigo-600/10 p-4">
                <h3 className="font-black text-indigo-600 dark:text-cyan-300">
                  Shortlist Chance Estimate
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Your shortlist chance is currently{" "}
                  <b>{jobMatch.shortlistChance}</b> with a job match score of{" "}
                  <b>{jobMatch.matchScore}/100</b>. Improve missing skills and
                  resume keywords to increase your chances.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="soft">Save Match</Button>
                <Button variant="soft">Improve Resume</Button>
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
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {empty}
        </p>
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