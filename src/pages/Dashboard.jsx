import { useEffect, useState } from "react";
import { quickActions } from "../data/mockData";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function Dashboard({ setPage }) {
  const [stats, setStats] = useState({
    savedResumes: 0,
    resumeScore: 0,
    jobMatchScore: 0,
    interviewScore: 0,
    profileStrength: 0,
  });

  const [weakAreas, setWeakAreas] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/dashboard/stats");

      setStats(data.stats || {});
      setWeakAreas(data.weakAreas || []);
      setRecentActivities(data.recentActivities || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      title: "Resume Score",
      value: stats.resumeScore || 0,
      label:
        stats.resumeScore >= 80
          ? "Good"
          : stats.resumeScore >= 60
          ? "Average"
          : "Improve",
      tone:
        stats.resumeScore >= 80
          ? "success"
          : stats.resumeScore >= 60
          ? "warning"
          : "danger",
      trend: "Real",
    },
    {
      title: "Interview Score",
      value: Math.min((stats.interviewScore || 0) * 10, 100),
      label: `${stats.interviewScore || 0}/10`,
      tone:
        stats.interviewScore >= 8
          ? "success"
          : stats.interviewScore >= 6
          ? "warning"
          : "danger",
      trend: "Real",
    },
    {
      title: "Job Match Score",
      value: stats.jobMatchScore || 0,
      label:
        stats.jobMatchScore >= 80
          ? "High"
          : stats.jobMatchScore >= 60
          ? "Moderate"
          : "Low",
      tone:
        stats.jobMatchScore >= 80
          ? "success"
          : stats.jobMatchScore >= 60
          ? "warning"
          : "danger",
      trend: "Real",
    },
    {
      title: "Profile Strength",
      value: stats.profileStrength || 0,
      label:
        stats.profileStrength >= 80
          ? "Excellent"
          : stats.profileStrength >= 60
          ? "Good"
          : "Build",
      tone:
        stats.profileStrength >= 80
          ? "success"
          : stats.profileStrength >= 60
          ? "warning"
          : "danger",
      trend: "Real",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back 👋"
        desc="Your real career readiness stats from saved resumes, resume analyses, job matches and interview practice."
        action={
          <Button onClick={fetchDashboardStats} variant="soft">
            Refresh Dashboard
          </Button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <div className="grid min-h-[300px] place-items-center text-center">
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">
                📊
              </div>
              <p className="mt-4 font-black">Loading dashboard data...</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Saved Resumes
              </p>
              <p className="mt-3 text-4xl font-black">{stats.savedResumes || 0}</p>
              <p className="mt-2 text-xs font-bold text-indigo-600 dark:text-cyan-300">
                Stored in MongoDB
              </p>
            </Card>

            {dashboardCards.map((card) => (
              <ScoreCard key={card.title} {...card} />
            ))}
          </div>

          <section className="mt-6">
            <h2 className="mb-4 text-2xl font-black">Quick Actions</h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setPage(action.id)}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
                    {action.icon}
                  </div>

                  <h3 className="mt-4 text-lg font-black">{action.title}</h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {action.desc}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
            <Card>
              <h2 className="mb-4 text-2xl font-black">Recent Activity</h2>

              {recentActivities.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center dark:bg-white/5">
                  <p className="font-bold">No activity yet</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Save a resume, analyze resume, match a job or practice interview.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5"
                    >
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600/10">
                        📌
                      </div>

                      <div className="mr-auto">
                        <p className="font-bold">{item.type}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.title}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black">{item.score}</p>
                        <p className="text-xs text-slate-500">
                          {item.date
                            ? new Date(item.date).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="mb-4 text-2xl font-black">Weak Areas</h2>

              {weakAreas.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-white/5">
                  <p className="font-bold">No weak areas detected</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Run resume analysis, job match or interview to detect weak areas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weakAreas.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5"
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="font-semibold">{area}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setPage("interview")}
                className="mt-5 w-full"
                variant="soft"
              >
                Practice Weak Areas
              </Button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}