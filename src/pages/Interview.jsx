import { useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { roles } from "../data/mockData";
import { apiRequest } from "../utils/api";

export function InterviewPractice() {
  const [setup, setSetup] = useState({
    role: "Frontend Developer",
    level: "Intermediate",
    type: "Technical",
    questionCount: 5,
  });

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateSetup(key, value) {
    setSetup({ ...setup, [key]: value });
  }

  async function startInterview() {
    setLoading(true);
    setError("");
    setFeedback(null);
    setAnswer("");
    setCurrentIndex(0);

    try {
      const data = await apiRequest("/interviews/start", {
        method: "POST",
        body: JSON.stringify(setup),
      });

      setInterview(data.interview);
    } catch (err) {
      setError(err.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      setError("Please type your answer before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/interviews/answer", {
        method: "POST",
        body: JSON.stringify({
          interviewId: interview._id,
          questionIndex: currentIndex,
          answer,
        }),
      });

      setFeedback(data.feedback);
      setInterview(data.interview);
    } catch (err) {
      setError(err.message || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (!interview) return;

    if (currentIndex < interview.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer(interview.questions[currentIndex + 1]?.userAnswer || "");
      setFeedback(null);
      setError("");
    }
  }

  function restartInterview() {
    setInterview(null);
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setError("");
  }

  const currentQuestion = interview?.questions?.[currentIndex];
  const isLastQuestion = interview
    ? currentIndex === interview.questions.length - 1
    : false;

  return (
    <div>
      <PageHeader
        eyebrow="AI Interview Practice"
        title="Practice interviews with AI feedback"
        desc="Choose role, level and type. Answer questions and get score, missing points, better answer and weak area."
        action={
          interview ? (
            <Button onClick={restartInterview} variant="soft">
              New Interview
            </Button>
          ) : (
            <Button onClick={startInterview}>
              {loading ? "Starting..." : "Start Interview"}
            </Button>
          )
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      {!interview ? (
        <StartInterview
          setup={setup}
          updateSetup={updateSetup}
          startInterview={startInterview}
          loading={loading}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-bold text-indigo-600 dark:text-cyan-300">
                Question {currentIndex + 1} of {interview.questions.length}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                Overall Score: {interview.overallScore || 0}/10
              </span>
            </div>

            <h2 className="text-3xl font-black leading-tight">
              {currentQuestion?.question}
            </h2>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="mt-5 h-72 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={submitAnswer}>
                {loading ? "Checking..." : "Submit Answer"}
              </Button>

              {!isLastQuestion && (
                <Button onClick={nextQuestion} variant="soft">
                  Next Question
                </Button>
              )}

              <Button onClick={restartInterview} variant="soft">
                End Interview
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-black">AI Feedback</h2>

            {!feedback ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center dark:bg-white/5">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-indigo-600/10 text-2xl">
                  🎤
                </div>
                <p className="mt-3 font-bold">No feedback yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Type your answer and click Submit Answer to get AI-style
                  feedback.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-emerald-500/10 p-4">
                  <p className="text-xl font-black text-emerald-500">
                    Score: {feedback.score}/10
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Weak Area: {feedback.weakArea}
                  </p>
                </div>

                <FeedbackBox
                  title="Correct Points"
                  items={feedback.correctPoints || []}
                  empty="No correct points detected"
                />

                <FeedbackBox
                  title="Missing Points"
                  items={feedback.missingPoints || []}
                  empty="No missing points detected"
                />

                <div className="rounded-2xl bg-indigo-600/10 p-4">
                  <h3 className="font-black text-indigo-600 dark:text-cyan-300">
                    Better Answer
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {feedback.betterAnswer}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-500/10 p-4">
                  <h3 className="font-black text-amber-500">
                    Follow-up Question
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {feedback.followUpQuestion}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="xl:col-span-2">
            <h2 className="text-2xl font-black">Interview Progress</h2>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {interview.questions.map((q, index) => (
                <button
                  key={`${q.question}-${index}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setAnswer(q.userAnswer || "");
                    setFeedback(q.score ? q : null);
                    setError("");
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    index === currentIndex
                      ? "border-indigo-500 bg-indigo-600/10"
                      : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <p className="font-black">Q{index + 1}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {q.userAnswer ? `Score: ${q.score}/10` : "Not answered"}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StartInterview({ setup, updateSetup, startInterview, loading }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Card>
        <h2 className="text-2xl font-black">Interview Setup</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Select
            label="Role"
            value={setup.role}
            onChange={(value) => updateSetup("role", value)}
            options={roles}
          />

          <Select
            label="Level"
            value={setup.level}
            onChange={(value) => updateSetup("level", value)}
            options={["Beginner", "Intermediate", "Advanced"]}
          />

          <Select
            label="Type"
            value={setup.type}
            onChange={(value) => updateSetup("type", value)}
            options={[
              "Technical",
              "HR",
              "Resume Based",
              "Job Description Based",
              "Mixed",
            ]}
          />

          <Select
            label="Questions"
            value={setup.questionCount}
            onChange={(value) => updateSetup("questionCount", Number(value))}
            options={[5, 10, 15]}
          />
        </div>

        <Button onClick={startInterview} className="mt-5">
          {loading ? "Starting..." : "Start AI Interview"}
        </Button>
      </Card>

      <Card>
        <h2 className="text-2xl font-black">What feedback includes</h2>

        <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
          <li>• Score out of 10</li>
          <li>• Correct points</li>
          <li>• Missing points</li>
          <li>• Better answer format</li>
          <li>• Follow-up question</li>
          <li>• Weak area detection</li>
        </ul>
      </Card>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FeedbackBox({ title, items, empty }) {
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