import { useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";

export function ResumeBuilder({ setPage }) {
  const [form, setForm] = useState({
    name: "Anudeep",
    role: "Frontend Developer",
    email: "anudeep@email.com",
    skills: "React, JavaScript, Tailwind CSS, DSA, GitHub",
    project: "DSA Visualizer - Interactive learning platform for Data Structures and Algorithms",
  });

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI Resume Builder"
        title="Create an ATS-friendly resume"
        desc="Enter your details, select a template and generate polished resume content with AI."
        action={<Button>Generate with AI</Button>}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_480px]">
        <Card>
          <div className="mb-5 flex flex-wrap gap-2">
            {["Personal", "Education", "Skills", "Projects", "Template"].map((step, index) => (
              <span key={step} className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-bold text-indigo-600 dark:text-cyan-300">
                {index + 1}. {step}
              </span>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="Target Role" value={form.role} onChange={(v) => update("role", v)} />
            <Field label="Email" value={form.email} onChange={(v) => update("email", v)} />
            <Field label="Skills" value={form.skills} onChange={(v) => update("skills", v)} />
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Project Description</span>
            <textarea
              value={form.project}
              onChange={(e) => update("project", e.target.value)}
              className="h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button>Improve Project Bullet</Button>
            <Button variant="soft">Suggest Skills</Button>
            <Button variant="soft">Rewrite Summary</Button>
          </div>
        </Card>

        <Card>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-inner dark:border-white/10">
            <h2 className="text-3xl font-black">{form.name}</h2>
            <p className="text-indigo-600">{form.role}</p>
            <p className="mt-1 text-sm text-slate-500">{form.email}</p>

            <hr className="my-5" />
            <h3 className="font-black">Professional Summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Motivated {form.role} with strong foundation in frontend development, DSA and modern web technologies.
            </p>

            <h3 className="mt-5 font-black">Skills</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{form.skills}</p>

            <h3 className="mt-5 font-black">Projects</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{form.project}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button>Save Resume</Button>
            <Button variant="soft">Download PDF</Button>
            <Button onClick={() => setPage("analyzer")} variant="soft">Analyze</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}
