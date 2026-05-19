import { useMemo, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

const QUESTION_BANK = {
  technical: [
    "Explain your strongest project architecture and your contribution.",
    "What is the difference between var, let and const in JavaScript?",
    "How do REST APIs work in a full-stack application?",
    "Explain authentication flow using JWT.",
    "How do you optimize a React application?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain OOPs concepts with examples.",
    "How do you debug a production issue?",
    "What is Git and how do you use branches?",
    "Explain one data structure you use frequently.",
    "How would you design a simple login system?",
    "What is the difference between frontend and backend validation?",
    "Explain promises and async/await.",
    "How do you handle errors in APIs?",
    "What makes your resume suitable for this role?",
  ],
  hr: [
    "Tell me about yourself.",
    "Why should we hire you?",
    "Why do you want this role?",
    "What are your strengths and weaknesses?",
    "Tell me about a challenge you faced and how you solved it.",
    "Where do you see yourself in 3 years?",
    "Why do you want to join our company?",
    "How do you handle feedback?",
    "Describe a time you worked in a team.",
    "Are you comfortable learning new technologies quickly?",
  ],
  behavioral: [
    "Tell me about a time you took ownership of a task.",
    "Describe a situation where you had to learn something quickly.",
    "How do you manage deadlines?",
    "Tell me about a mistake you made and what you learned.",
    "How do you handle conflict in a team?",
    "Give an example of problem solving from your project.",
    "How do you prioritize tasks when multiple things are pending?",
    "Tell me about a time you improved something.",
    "How do you communicate technical issues to non-technical people?",
    "What motivates you as a fresher?",
  ],
};

function buildQuestions(type, count, role) {
  const base = type === "mixed"
    ? [...QUESTION_BANK.technical, ...QUESTION_BANK.hr, ...QUESTION_BANK.behavioral]
    : QUESTION_BANK[type] || QUESTION_BANK.technical;

  return base.slice(0, Number(count || 5)).map((question, index) => ({
    id: index + 1,
    question: question.replace("this role", role || "this role"),
    answer: "",
    feedback: null,
  }));
}

function evaluateAnswer(answer = "", question = "") {
  const text = answer.trim();
  let score = 3;
  const strengths = [];
  const improvements = [];

  if (text.length > 80) {
    score += 2;
    strengths.push("Answer has enough detail.");
  } else {
    improvements.push("Add more details and avoid one-line answers.");
  }

  if (/project|built|implemented|created|developed|designed/i.test(text)) {
    score += 2;
    strengths.push("You connected your answer with practical work.");
  } else {
    improvements.push("Add one project or practical example.");
  }

  if (/result|impact|improved|reduced|increased|learned/i.test(text)) {
    score += 1;
    strengths.push("You mentioned result or learning.");
  } else {
    improvements.push("Mention outcome, impact or what you learned.");
  }

  if (/team|communication|collabor/i.test(text)) score += 1;
  if (/because|therefore|for example|first|second/i.test(text)) score += 1;

  score = Math.min(10, score);

  return {
    score,
    strengths: strengths.length ? strengths : ["You attempted the answer clearly."],
    improvements: improvements.length ? improvements : ["Make it more concise and structured using Situation, Task, Action, Result."],
    betterAnswer: `A stronger answer should explain the concept, connect it to your project, mention your exact contribution and end with the result. For this question: "${question}" prepare a 45-60 second answer with one project example.`,
  };
}

export function InterviewPractice() {
  const [form, setForm] = useState({ role: "Frontend Developer", level: "Fresher", type: "technical", count: 5 });
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const overallScore = useMemo(() => {
    const scored = questions.filter((item) => item.feedback);
    if (!scored.length) return 0;
    return Math.round((scored.reduce((sum, item) => sum + item.feedback.score, 0) / (scored.length * 10)) * 100);
  }, [questions]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generateQuestions() {
    setMessage("");
    setError("");
    setLoading(true);

    const localQuestions = buildQuestions(form.type, form.count, form.role);

    try {
      const data = await apiRequest("/interviews/start", {
        method: "POST",
        body: JSON.stringify({
          role: form.role,
          level: form.level,
          type: form.type,
          questionCount: Number(form.count),
        }),
      });

      const serverQuestions = data?.interview?.questions || data?.questions;
      setQuestions((serverQuestions?.length ? serverQuestions : localQuestions).map((item, index) => ({
        id: item.id || index + 1,
        question: item.question || item,
        answer: item.answer || "",
        feedback: item.feedback || null,
      })));
    } catch {
      setQuestions(localQuestions);
    } finally {
      setLoading(false);
    }
  }

  function updateAnswer(id, answer) {
    setQuestions((prev) => prev.map((item) => item.id === id ? { ...item, answer } : item));
  }

  function getFeedback(id) {
    setQuestions((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, feedback: evaluateAnswer(item.answer, item.question) };
    }));
  }

  async function saveInterview() {
    setError("");
    setMessage("");

    try {
      await apiRequest("/interviews/answer", {
        method: "POST",
        body: JSON.stringify({
          role: form.role,
          level: form.level,
          type: form.type,
          questions,
          score: overallScore,
          weakAreas: buildWeakAreas(questions),
        }),
      });
      setMessage("Interview practice saved to history.");
    } catch (err) {
      setError(err.message || "Could not save interview. You can still practice locally.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interview Practice"
        title="Practice Like a Real Interview"
        desc="Generate fresher-friendly technical, HR and behavioral questions, write answers and get structured feedback."
      />

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Target Role">
            <input value={form.role} onChange={(event) => update("role", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950" />
          </Field>
          <Field label="Level">
            <select value={form.level} onChange={(event) => update("level", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"><option>Fresher</option><option>Intermediate</option></select>
          </Field>
          <Field label="Interview Type">
            <select value={form.type} onChange={(event) => update("type", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"><option value="technical">Technical</option><option value="hr">HR</option><option value="behavioral">Behavioral</option><option value="mixed">Mixed</option></select>
          </Field>
          <Field label="Questions">
            <select value={form.count} onChange={(event) => update("count", event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-slate-950"><option value="5">5</option><option value="10">10</option><option value="15">15</option></select>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={generateQuestions}>{loading ? "Generating..." : "Generate Questions"}</Button>
          {questions.length > 0 && <Button variant="soft" onClick={saveInterview}>Save Practice</Button>}
        </div>
      </Card>

      {questions.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {questions.map((item) => (
              <Card key={item.id}>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">{item.id}</span>
                  <div className="flex-1">
                    <h3 className="font-black">{item.question}</h3>
                    <textarea value={item.answer} onChange={(event) => updateAnswer(item.id, event.target.value)} rows={5} placeholder="Write your answer here..." className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5" />
                    <div className="mt-3 flex gap-2"><Button variant="soft" onClick={() => getFeedback(item.id)}>Get Feedback</Button></div>

                    {item.feedback && <Feedback feedback={item.feedback} />}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">Overall Score</p>
            <p className="mt-2 text-5xl font-black text-indigo-600 dark:text-cyan-300">{overallScore}%</p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">Answer all questions and get feedback to improve your score.</p>
            <Mini title="Weak Areas" items={buildWeakAreas(questions)} />
            <Mini title="Next Steps" items={["Add project examples", "Use STAR format", "Keep answers under 60 seconds", "Practice one mock daily"]} />
          </Card>
        </div>
      )}
    </div>
  );
}

function buildWeakAreas(questions) {
  const weak = [];
  questions.forEach((item) => {
    if (!item.feedback) return;
    if (item.feedback.score < 7) weak.push("Answer depth");
    if (!/project|built|implemented|created/i.test(item.answer || "")) weak.push("Project examples");
    if ((item.answer || "").length < 80) weak.push("Detailed explanation");
  });
  return [...new Set(weak)].slice(0, 5);
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>{children}</label>;
}

function Feedback({ feedback }) {
  return (
    <div className="mt-4 rounded-3xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
      <p className="font-black text-indigo-700 dark:text-cyan-300">Score: {feedback.score}/10</p>
      <Mini title="Good" items={feedback.strengths} tone="green" />
      <Mini title="Improve" items={feedback.improvements} tone="amber" />
      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200"><b>Better answer direction:</b> {feedback.betterAnswer}</p>
    </div>
  );
}

function Mini({ title, items = [], tone = "slate" }) {
  const color = tone === "green" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : tone === "amber" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
  return <div className="mt-4"><p className="text-sm font-black">{title}</p><div className="mt-2 flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>{item}</span>) : <span className={`rounded-full px-3 py-1 text-xs font-bold ${color}`}>No weak areas yet</span>}</div></div>;
}

function Notice({ tone, children }) {
  const styles = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300";
  return <div className={`rounded-3xl border p-4 text-sm font-bold ${styles}`}>{children}</div>;
}
