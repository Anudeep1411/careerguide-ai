import { activities, templates } from "../data/mockData";
import { Button, Card, PageHeader } from "../components/Layout";

export function History() {
  return (
    <div>
      <PageHeader eyebrow="History" title="Your saved career activity" desc="Review resumes, analyses, job matches and interview attempts." />
      <div className="grid gap-4">
        {activities.map((item) => (
          <Card key={item.title}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10">📌</div>
              <div className="mr-auto">
                <h3 className="font-black">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <p className="font-black">{item.score}</p>
              <Button variant="soft">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Templates() {
  return (
    <div>
      <PageHeader eyebrow="Templates" title="Resume templates" desc="Start with 10 polished templates. Future scope: 100 templates." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={template}>
            <div className="mb-4 grid h-56 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-950 dark:to-cyan-950">
              <div className="h-44 w-32 rounded-xl bg-white p-3 shadow-xl">
                <div className="mb-2 h-3 w-20 rounded bg-slate-900" />
                <div className="mb-2 h-2 w-full rounded bg-slate-200" />
                <div className="mb-2 h-2 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-2 w-full rounded bg-indigo-200" />
                <div className="mt-2 h-2 w-20 rounded bg-indigo-200" />
              </div>
            </div>
            <h3 className="text-xl font-black">{template}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Best for freshers and entry-level job seekers.</p>
            <Button className="mt-4 w-full">Use Template</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile() {
  return (
    <div>
      <PageHeader eyebrow="Profile" title="Career profile" desc="Complete your profile to improve resume suggestions and job match results." />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          {["Name", "Email", "Target Role", "Experience Level", "GitHub", "LinkedIn"].map((field) => (
            <label key={field}>
              <span className="mb-2 block text-sm font-bold">{field}</span>
              <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5" placeholder={field} />
            </label>
          ))}
        </div>
        <Button className="mt-5">Save Profile</Button>
      </Card>
    </div>
  );
}

export function Settings({ theme, setTheme }) {
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Preferences" desc="Manage theme, AI response style and platform settings." />
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black">Theme</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Switch between modern light and dark SaaS themes.</p>
          </div>
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
