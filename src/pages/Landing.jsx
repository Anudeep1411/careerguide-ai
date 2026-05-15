import { Button, Card } from "../components/Layout";

export function Landing({ setPage }) {
  const features = [
    ["📄", "AI Resume Builder", "Create fresher-friendly ATS resumes with AI-generated summaries and project bullets."],
    ["🔍", "Resume Analyzer", "Get resume score, missing skills, weak sections and improvement suggestions."],
    ["🎯", "Job Match Analyzer", "Compare your resume with a job description and get shortlist readiness insights."],
    ["🎤", "AI Interview Practice", "Practice technical, HR, resume-based and job-based interview questions."],
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 shadow-sm dark:border-white/10 dark:from-indigo-950/40 dark:via-slate-950 dark:to-cyan-950/30 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-black text-indigo-600 dark:text-cyan-300">CareerGuide AI</p>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-7xl">
              Build Resume. Match Jobs. Practice Interviews.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              An AI-powered career guidance platform for freshers and job seekers to create resumes,
              analyze ATS readiness, match job descriptions and prepare for interviews.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setPage("dashboard")}>Get Started</Button>
              <Button onClick={() => setPage("builder")} variant="soft">View Demo</Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/70 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-black">Career Readiness</h3>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">Live</span>
              </div>
              {[
                ["Resume Score", 82],
                ["Job Match", 76],
                ["Interview Score", 74],
                ["Profile Strength", 90],
              ].map(([label, value]) => (
                <div key={label} className="mb-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{label}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map(([icon, title, desc]) => (
          <Card key={title}>
            <div className="text-4xl">{icon}</div>
            <h3 className="mt-4 text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-3xl font-black">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {["Build Resume", "Analyze Resume", "Match Job", "Practice Interview", "Improve"].map((step, index) => (
            <div key={step} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 font-black text-white">{index + 1}</div>
              <p className="mt-3 font-bold">{step}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
