import { useEffect, useMemo, useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function Dashboard({ setPage }) {
  const user = useMemo(() => JSON.parse(localStorage.getItem("cg_user") || "{}"), []);
  const [dashboard, setDashboard] = useState({
    stats: {
      savedResumes: 0,
      resumeScore: 0,
      jobMatchScore: 0,
      interviewScore: 0,
      profileStrength: 0,
    },
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
        const data = await apiRequest("/dashboard/stats");
        setDashboard({
          stats: {
            savedResumes: data?.stats?.savedResumes || 0,
            resumeScore: data?.stats?.resumeScore || 0,
            jobMatchScore: data?.stats?.jobMatchScore || 0,
            interviewScore: data?.stats?.interviewScore || 0,
            profileStrength: data?.stats?.profileStrength || 0,
          },
          weakAreas: data?.weakAreas || [],
          recentActivities: data?.recentActivities || [],
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const quickActions = [
    { id: "builder", title: "Build Resume", desc: "Create or update your ATS-friendly resume", icon: "📝" },
    { id: "analyzer", title: "Analyze Resume", desc: "Check ATS score, missing skills and weak sections", icon: "📊" },
    { id: "history", title: "Resume History", desc: "View, edit, analyze and download saved resumes", icon: "🗂️" },
    { id: "jobmatch", title: "Match Job", desc: "Compare your resume with a job description", icon: "🎯" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back${user?.name ? `, ${user.name}` : ""}`}
        desc="Track your resume progress, analysis results and career readiness in one place."
        action={<Button onClick={() => setPage?.("builder")}>Build Resume</Button>}
      />

      {user?.forcePasswordChange && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-700 dark:text-amber-200">
          You are using a temporary password. Please change it from the Change Password page before continuing.
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Resume Score" value={dashboard.stats.resumeScore} label="Latest ATS" tone={dashboard.stats.resumeScore >= 75 ? "success" : dashboard.stats.resumeScore >= 50 ? "warning" : "danger"} trend={loading ? "Loading..." : ""} />
        <ScoreCard title="Job Match" value={dashboard.stats.jobMatchScore} label="Latest match" tone={dashboard.stats.jobMatchScore >= 75 ? "success" : dashboard.stats.jobMatchScore >= 50 ? "warning" : "danger"} />
        <ScoreCard title="Interview" value={dashboard.stats.interviewScore * 10} label="Latest practice" tone={dashboard.stats.interviewScore >= 7 ? "success" : dashboard.stats.interviewScore >= 5 ? "warning" : "danger"} />
        <ScoreCard title="Profile Strength" value={dashboard.stats.profileStrength} label={`${dashboard.stats.savedResumes} saved resumes`} tone={dashboard.stats.profileStrength >= 75 ? "success" : "warning"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Quick Actions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Continue from where you left off.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setPage?.(action.id)}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="text-2xl">{action.icon}</div>
                <h3 className="mt-3 text-lg font-black">{action.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{action.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Weak Areas</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Based on your recent analysis and job matches.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {dashboard.weakAreas?.length ? (
              dashboard.weakAreas.map((area) => (
                <span key={area} className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                  {area}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-300">No weak areas yet. Analyze your resume to get insights.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Recent Activity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">Your latest resume, analysis, job match and interview activity.</p>
          </div>
          <Button variant="soft" onClick={() => setPage?.("history")}>View History</Button>
        </div>

        {dashboard.recentActivities?.length ? (
          <div className="space-y-3">
            {dashboard.recentActivities.slice(0, 6).map((item, index) => (
              <div key={`${item.type}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="font-black">{item.type}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600 dark:text-cyan-300">{item.score}</p>
                  <p className="text-xs text-slate-500">{item.date ? new Date(item.date).toLocaleString() : ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
            <p className="font-bold">No activity yet.</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Start by creating your first resume.</p>
            <div className="mt-4"><Button onClick={() => setPage?.("builder")}>Create Resume</Button></div>
          </div>
        )}
      </Card>
    </div>
  );
}
