import { Button, Card, PageHeader, ScoreCard, UploadBox } from "../components/Layout";
import { roles } from "../data/mockData";

export function ResumeAnalyzer({ setPage }) {
  return (
    <div>
      <PageHeader
        eyebrow="AI Resume Analyzer"
        title="Analyze resume quality and ATS readiness"
        desc="Upload resume or paste resume text to get score, missing skills and improvement suggestions."
        action={<Button>Analyze Resume</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <UploadBox title="Upload Resume PDF" desc="Drag and drop your PDF resume here, or browse from your device." />

          <Card>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Target Role</span>
              <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <textarea
              placeholder="Or paste resume text here..."
              className="mt-4 h-40 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
            />
            <Button className="mt-4 w-full">Run AI Analysis</Button>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ScoreCard title="ATS Score" value={82} label="Good" tone="success" trend="+12%" />
            <ScoreCard title="Grammar" value={88} label="Strong" tone="success" trend="+7%" />
            <ScoreCard title="Skills Match" value={71} label="Average" tone="warning" trend="+9%" />
            <ScoreCard title="Projects" value={65} label="Improve" tone="danger" trend="+5%" />
          </div>

          <Card>
            <h2 className="text-2xl font-black">AI Suggestions</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Suggestion title="Missing Skills" items={["Node.js", "REST APIs", "MongoDB", "JWT Auth"]} />
              <Suggestion title="Weak Sections" items={["Project impact", "Quantified results", "Backend skills"]} />
              <Suggestion title="Improve Bullet" items={["Built an interactive DSA Visualizer using React, Vite and Tailwind CSS."]} />
              <Suggestion title="ATS Keywords" items={["React", "JavaScript", "API", "Git", "Deployment"]} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Save Analysis</Button>
              <Button variant="soft">Download Report</Button>
              <Button onClick={() => setPage("interview")} variant="soft">Practice Interview</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Suggestion({ title, items }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
