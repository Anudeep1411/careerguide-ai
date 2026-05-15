import { Button, Card, PageHeader, ScoreCard, UploadBox } from "../components/Layout";

export function JobMatch({ setPage }) {
  return (
    <div>
      <PageHeader
        eyebrow="AI Job Match Analyzer"
        title="Compare your resume with any job description"
        desc="Get match score, shortlist chance estimate, missing keywords and expected interview questions."
        action={<Button>Analyze Match</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <div className="space-y-5">
          <UploadBox title="Select / Upload Resume" desc="Use a saved resume or upload a new PDF." />
          <Card>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Job Description</span>
              <textarea
                placeholder="Paste company job notification here..."
                className="h-64 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </label>
            <Button className="mt-4 w-full">Analyze Job Match</Button>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard title="Job Match" value={76} label="Moderate" tone="warning" trend="+11%" />
            <ScoreCard title="Shortlist Chance" value={68} label="Estimate" tone="warning" trend="+8%" />
            <ScoreCard title="Keyword Match" value={72} label="Good" tone="success" trend="+9%" />
          </div>

          <Card>
            <h2 className="text-2xl font-black">Job Readiness Report</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Report title="Matched Skills" items={["React", "JavaScript", "Git", "Responsive UI"]} />
              <Report title="Missing Skills" items={["Node.js", "Express", "MongoDB", "JWT"]} />
              <Report title="Resume Improvements" items={["Add backend project", "Mention API integration", "Add deployment links"]} />
              <Report title="Expected Interview Questions" items={["Explain React hooks", "How JWT works?", "Explain your project architecture"]} />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Improve Resume for This Job</Button>
              <Button onClick={() => setPage("interview")} variant="soft">Generate Interview</Button>
              <Button variant="soft">Save Match</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Report({ title, items }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
      <h3 className="font-black">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
