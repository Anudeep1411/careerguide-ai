import { useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { roles } from "../data/mockData";

export function InterviewPractice() {
  const [started, setStarted] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="AI Interview Practice"
        title="Practice interviews with AI feedback"
        desc="Choose role, level and type. Answer questions and get score, missing points and better answers."
        action={<Button onClick={() => setStarted(true)}>Start Interview</Button>}
      />

      {!started ? <StartInterview setStarted={setStarted} /> : <InterviewRoom />}
    </div>
  );
}

function StartInterview({ setStarted }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <h2 className="text-2xl font-black">Interview Setup</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Select label="Role" options={roles} />
          <Select label="Level" options={["Beginner", "Intermediate", "Advanced"]} />
          <Select label="Type" options={["Technical", "HR", "Resume Based", "Job Description Based", "Mixed"]} />
          <Select label="Questions" options={["5 Questions", "10 Questions", "15 Questions"]} />
        </div>
        <Button onClick={() => setStarted(true)} className="mt-5">Start AI Interview</Button>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">What AI checks</h2>
        <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
          <li>• Correctness of answer</li>
          <li>• Missing technical points</li>
          <li>• Communication clarity</li>
          <li>• Better answer format</li>
          <li>• Follow-up question readiness</li>
        </ul>
      </Card>
    </div>
  );
}

function InterviewRoom() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-bold text-indigo-600 dark:text-cyan-300">Question 1 of 5</span>
          <span className="text-sm text-slate-500">Timer: 02:00</span>
        </div>
        <h2 className="text-3xl font-black">Explain useEffect in React with one real example.</h2>
        <textarea
          placeholder="Type your answer here..."
          className="mt-5 h-72 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Button>Submit Answer</Button>
          <Button variant="soft">Skip</Button>
          <Button variant="soft">End Interview</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">AI Feedback</h2>
        <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4">
          <p className="font-black text-emerald-500">Score: 7/10</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Good explanation, but add cleanup function and dependency array details.
          </p>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p><b>Correct points:</b> Side effects, API calls, dependency array.</p>
          <p><b>Missing:</b> Cleanup function, infinite loop risk.</p>
          <p><b>Follow-up:</b> Difference between useEffect and useLayoutEffect?</p>
        </div>
      </Card>
    </div>
  );
}

function Select({ label, options }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
