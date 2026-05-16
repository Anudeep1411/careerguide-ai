import { useEffect, useState } from "react";
import { templates } from "../data/mockData";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function History() {
  const [activeTab, setActiveTab] = useState("resumes");
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function fetchHistory() {
    try {
      setLoading(true);
      setMessage("");

      const [resumeData, analysisData, jobMatchData, interviewData] =
        await Promise.all([
          apiRequest("/resumes"),
          apiRequest("/analysis"),
          apiRequest("/job-match"),
          apiRequest("/interviews"),
        ]);

      setResumes(resumeData.resumes || []);
      setAnalyses(analysisData.analyses || []);
      setJobMatches(jobMatchData.jobMatches || []);
      setInterviews(interviewData.interviews || []);
    } catch (error) {
      setMessage(error.message || "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }

  async function deleteResume(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    try {
      await apiRequest(`/resumes/${id}`, {
        method: "DELETE",
      });

      setResumes(resumes.filter((resume) => resume._id !== id));
      setMessage("Resume deleted successfully ✅");
    } catch (error) {
      setMessage(error.message || "Failed to delete resume");
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const tabs = [
    { id: "resumes", label: "Saved Resumes", count: resumes.length },
    { id: "analyses", label: "Resume Analyses", count: analyses.length },
    { id: "jobMatches", label: "Job Matches", count: jobMatches.length },
    { id: "interviews", label: "Interviews", count: interviews.length },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="History"
        title="Your saved career activity"
        desc="Review saved resumes, resume analyses, job matches and interview practice history from MongoDB."
        action={
          <Button onClick={fetchHistory} variant="soft">
            Refresh
          </Button>
        }
      />

      {message && (
        <div className="mb-5 rounded-2xl bg-indigo-600/10 p-4 font-bold text-indigo-600 dark:text-cyan-300">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard title="Saved Resumes" value={resumes.length} icon="📄" />
        <StatCard title="Resume Analyses" value={analyses.length} icon="🔍" />
        <StatCard title="Job Matches" value={jobMatches.length} icon="🎯" />
        <StatCard title="Interviews" value={interviews.length} icon="🎤" />
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center font-bold text-slate-500 dark:bg-white/5">
            Loading history...
          </div>
        ) : (
          <>
            {activeTab === "resumes" && (
              <ResumeHistory resumes={resumes} deleteResume={deleteResume} />
            )}

            {activeTab === "analyses" && (
              <AnalysisHistory analyses={analyses} />
            )}

            {activeTab === "jobMatches" && (
              <JobMatchHistory jobMatches={jobMatches} />
            )}

            {activeTab === "interviews" && (
              <InterviewHistory interviews={interviews} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-4xl font-black">{value}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, desc }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-8 text-center dark:bg-white/5">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function ResumeHistory({ resumes, deleteResume }) {
  if (resumes.length === 0) {
    return (
      <EmptyState
        title="No resumes saved yet"
        desc="Go to Resume Builder and save your first resume."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {resumes.map((resume) => (
        <div
          key={resume._id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              📄
            </div>

            <div className="mr-auto">
              <h3 className="text-lg font-black">
                {resume.title || "Untitled Resume"}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Role: {resume.targetRole || "Not specified"}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Template: {resume.template || "Minimal ATS"}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Saved:{" "}
                {resume.createdAt
                  ? new Date(resume.createdAt).toLocaleString()
                  : "Recently"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="soft">View</Button>
              <Button variant="soft">Edit</Button>
              <Button onClick={() => deleteResume(resume._id)} variant="outline">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalysisHistory({ analyses }) {
  if (analyses.length === 0) {
    return (
      <EmptyState
        title="No resume analyses yet"
        desc="Go to Resume Analyzer and run your first analysis."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {analyses.map((analysis) => (
        <div
          key={analysis._id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              🔍
            </div>

            <div className="mr-auto">
              <h3 className="text-lg font-black">
                Resume Analysis - {analysis.targetRole}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                ATS Score: {analysis.atsScore}/100
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Skills Found: {analysis.skillsFound?.length || 0} | Missing:{" "}
                {analysis.missingSkills?.length || 0}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Date:{" "}
                {analysis.createdAt
                  ? new Date(analysis.createdAt).toLocaleString()
                  : "Recently"}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-600/10 px-4 py-3 text-center">
              <p className="text-2xl font-black text-indigo-600 dark:text-cyan-300">
                {analysis.atsScore}
              </p>
              <p className="text-xs font-bold text-slate-500">ATS</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobMatchHistory({ jobMatches }) {
  if (jobMatches.length === 0) {
    return (
      <EmptyState
        title="No job matches yet"
        desc="Go to Job Match Analyzer and compare your resume with a job description."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {jobMatches.map((job) => (
        <div
          key={job._id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              🎯
            </div>

            <div className="mr-auto">
              <h3 className="text-lg font-black">
                {job.companyName || "Company"} - {job.targetRole}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Match Score: {job.matchScore}/100
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Shortlist Chance: {job.shortlistChance}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Matched Skills: {job.matchedSkills?.length || 0} | Missing:{" "}
                {job.missingSkills?.length || 0}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Date:{" "}
                {job.createdAt
                  ? new Date(job.createdAt).toLocaleString()
                  : "Recently"}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-600/10 px-4 py-3 text-center">
              <p className="text-2xl font-black text-indigo-600 dark:text-cyan-300">
                {job.matchScore}
              </p>
              <p className="text-xs font-bold text-slate-500">MATCH</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InterviewHistory({ interviews }) {
  if (interviews.length === 0) {
    return (
      <EmptyState
        title="No interviews yet"
        desc="Go to Interview Practice and complete your first mock interview."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {interviews.map((interview) => (
        <div
          key={interview._id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              🎤
            </div>

            <div className="mr-auto">
              <h3 className="text-lg font-black">
                {interview.role} Interview
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Type: {interview.type} | Level: {interview.level}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Overall Score: {interview.overallScore}/10
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Status: {interview.status}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Date:{" "}
                {interview.createdAt
                  ? new Date(interview.createdAt).toLocaleString()
                  : "Recently"}
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-600/10 px-4 py-3 text-center">
              <p className="text-2xl font-black text-indigo-600 dark:text-cyan-300">
                {interview.overallScore}
              </p>
              <p className="text-xs font-bold text-slate-500">SCORE</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Templates() {
  return (
    <div>
      <PageHeader
        eyebrow="Templates"
        title="Resume templates"
        desc="Start with 10 polished templates. Future scope: 100 templates."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template}>
            <div className="mb-4 grid h-56 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-950 dark:to-cyan-950">
              <div className="h-44 w-32 rounded-xl bg-white p-3 shadow-xl">
                <div className="mb-2 h-3 w-20 rounded bg-slate-900" />
                <div className="mb-2 h-2 w-full rounded bg-slate-200" />
                <div className="mb-2 h-2 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-2 w-full rounded bg-indigo-200" />
                <div className="mt-2 h-2 w-20 rounded bg-indigo-200" />
              </div>
            </div>

            <h3 className="text-xl font-black">{template}</h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Best for freshers and entry-level job seekers.
            </p>

            <Button className="mt-4 w-full">Use Template</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile() {
  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Career profile"
        desc="Complete your profile to improve resume suggestions and job match results."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Name",
            "Email",
            "Target Role",
            "Experience Level",
            "GitHub",
            "LinkedIn",
          ].map((field) => (
            <label key={field}>
              <span className="mb-2 block text-sm font-bold">{field}</span>

              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                placeholder={field}
              />
            </label>
          ))}
        </div>

        <Button className="mt-5">Save Profile</Button>
      </Card>
    </div>
  );
}

export function Settings({ theme, setTheme }) {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Preferences"
        desc="Manage theme, AI response style and platform settings."
      />

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black">Theme</h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Switch between modern light and dark SaaS themes.
            </p>
          </div>

          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </Button>
        </div>
      </Card>
    </div>
  );
}