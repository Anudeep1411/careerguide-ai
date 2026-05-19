import { useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function Dashboard({ setPage }) {
  const user = useMemo(() => JSON.parse(localStorage.getItem("cg_user") || "{}"), []);
  const [state, setState] = useState({
    savedResumes: 0,
    analyses: [],
    jobMatches: [],
    interviews: [],
    weakAreas: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [dash, resumes, analysis, jobs, interviews] = await Promise.allSettled([
          apiRequest("/dashboard/stats"),
          apiRequest("/resumes"),
          apiRequest("/analysis"),
          apiRequest("/job-match"),
          apiRequest("/interviews"),
        ]);

        const dashboard = dash.status === "fulfilled" ? dash.value : {};
        const resumeList = resumes.status === "fulfilled" ? resumes.value.resumes || [] : [];
        const analyses = analysis.status === "fulfilled" ? analysis.value.analyses || [] : [];
        const jobMatches = jobs.status === "fulfilled" ? jobs.value.matches || jobs.value.jobMatches || [] : [];
        const interviewList = interviews.status === "fulfilled" ? interviews.value.interviews || [] : [];

        setState({
          savedResumes: resumeList.length || dashboard?.stats?.savedResumes || 0,
          analyses,
          jobMatches,
          interviews: interviewList,
          weakAreas: buildWeakAreas(analyses, jobMatches, interviewList, dashboard.weakAreas || []),
          recentActivities: buildRecentActivities(resumeList, analyses, jobMatches, interviewList, dashboard.recentActivities || []),
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const latestAts = state.analyses?.[0]?.atsScore || 0;
  const bestMatch = Math.max(0, ...state.jobMatches.map((item) => Number(item.matchScore || 0)));
  const latestInterview = state.interviews?.[0]?.score || 0;
  const activityCount = state.savedResumes + state.analyses.length + state.jobMatches.length + state.interviews.length;

  const quickActions = [
    { id: "builder", title: "Build Resume", desc: "Create or update your ATS-friendly resume", icon: "📝" },
    { id: "analyzer", title: "Analyze Resume", desc: "Check ATS score, missing skills and weak sections", icon: "📊" },
    { id: "jobmatch", title: "Match Job", desc: "Compare resume with job description or PDF", icon: "🎯" },
    { id: "interview", title: "Practice Interview", desc: "Generate questions and get feedback", icon: "🎤" },
    { id: "joboffers", title: "Company Guide", desc: "Explore 100 fresher-friendly companies", icon: "🏢" },
    { id: "history", title: "View History", desc: "Open reports, resumes and interviews", icon: "🗂️" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        desc="Track resumes, analyses, job matches, interview practice and company readiness in one place."
        action={<Button onClick={() => setPage?.("builder")}>Build Resume</Button>}
      />

      {user?.forcePasswordChange && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-700 dark:text-amber-200">
          You are using a temporary password. Please change it from the Change Password page before continuing.
        </div>
      )}

      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Latest ATS" value={latestAts} label={`${state.analyses.length} analyses`} tone={latestAts >= 75 ? "success" : latestAts >= 50 ? "warning" : "danger"} trend={loading ? "Loading..." : ""} />
        <ScoreCard title="Best Job Match" value={bestMatch} label={`${state.jobMatches.length} reports`} tone={bestMatch >= 75 ? "success" : bestMatch >= 50 ? "warning" : "danger"} />
        <ScoreCard title="Interview Score" value={latestInterview} label={`${state.interviews.length} attempts`} tone={latestInterview >= 75 ? "success" : latestInterview >= 50 ? "warning" : "danger"} />
        <ScoreCard title="Activity" value={Math.min(100, activityCount * 15)} label={`${state.savedResumes} resumes saved`} tone={activityCount >= 4 ? "success" : "warning"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="text-xl font-black">Quick Actions</h2><p className="text-sm text-slate-500 dark:text-slate-300">Choose your next career preparation step.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <button key={action.id} type="button" onClick={() => setPage?.(action.id)} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="text-2xl">{action.icon}</div><h3 className="mt-3 text-lg font-black">{action.title}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{action.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Weak Areas</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Combined from analysis, job match and interview feedback.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {state.weakAreas?.length ? state.weakAreas.map((area) => <span key={area} className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">{area}</span>) : <p className="text-sm text-slate-500 dark:text-slate-300">No weak areas yet. Analyze your resume or practice an interview.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-xl font-black">Recent Activity</h2><p className="text-sm text-slate-500 dark:text-slate-300">Latest actions across CareerGuide AI.</p></div>
          <Button variant="soft" onClick={() => setPage?.("history")}>View History</Button>
        </div>
        <div className="space-y-3">
          {state.recentActivities.length ? state.recentActivities.slice(0, 8).map((activity, index) => (
            <div key={`${activity.title}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div><p className="font-bold">{activity.title}</p><p className="text-sm text-slate-500 dark:text-slate-300">{activity.desc}</p></div><span className="text-xs font-bold text-slate-500">{activity.date}</span>
            </div>
          )) : <p className="text-sm text-slate-500 dark:text-slate-300">No activity yet. Start by building a resume.</p>}
        </div>
      </Card>
    </div>
  );
}

function buildWeakAreas(analyses, jobMatches, interviews, existing = []) {
  const values = [
    ...existing,
    ...analyses.flatMap((item) => item.weakSections || []),
    ...jobMatches.flatMap((item) => item.missingSkills || []).slice(0, 8),
    ...interviews.flatMap((item) => item.weakAreas || []),
  ];
  return [...new Set(values.filter(Boolean))].slice(0, 10);
}

function buildRecentActivities(resumes, analyses, jobMatches, interviews, existing = []) {
  const items = [
    ...existing.map((item) => ({ title: item.title || "Activity", desc: item.desc || item.description || "Recent activity", date: item.date || "" })),
    ...resumes.map((item) => ({ title: "Resume saved", desc: item?.personalDetails?.name || item.title || "Saved resume", date: formatDate(item.updatedAt || item.createdAt) })),
    ...analyses.map((item) => ({ title: "Resume analyzed", desc: `${item.targetRole || "Resume"} • ATS ${item.atsScore || 0}/100`, date: formatDate(item.createdAt) })),
    ...jobMatches.map((item) => ({ title: "Job match created", desc: `${item.companyName || "Company"} • ${item.matchScore || 0}% match`, date: formatDate(item.createdAt) })),
    ...interviews.map((item) => ({ title: "Interview practiced", desc: `${item.role || "Role"} • ${item.score || 0}% score`, date: formatDate(item.createdAt) })),
  ];
  return items.filter(Boolean).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "";
}
