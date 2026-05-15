import { navItems } from "../data/mockData";

export function AppShell({ page, setPage, theme, setTheme, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition dark:bg-slate-950 dark:text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-slate-200 bg-white/90 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:block">
        <button onClick={() => setPage("landing")} className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 font-black text-white shadow-lg shadow-indigo-600/30">
            CG
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black">CareerGuide AI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI career guidance</p>
          </div>
        </button>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                page === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage("landing")} className="flex items-center gap-2 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 font-black text-white">CG</div>
              <span className="font-black">CareerGuide AI</span>
            </button>

            <div className="ml-auto hidden max-w-md flex-1 md:block">
              <input
                placeholder="Search tools, resumes, jobs..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:scale-[1.02] dark:border-white/10 dark:bg-white/10"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">
              A
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`min-w-max rounded-2xl px-4 py-2 text-xs font-bold ${
                  page === item.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, action }) {
  return (
    <section className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      {eyebrow && <p className="font-bold text-indigo-600 dark:text-cyan-300">{eyebrow}</p>}
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">{desc}</p>
        </div>
        {action}
      </div>
    </section>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition dark:border-white/10 dark:bg-white/[0.04] ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", className = "" }) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
      : variant === "soft"
      ? "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
      : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/10";

  return (
    <button onClick={onClick} className={`rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function ScoreCard({ title, value, label, tone, trend }) {
  const toneClass = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-rose-500",
  }[tone];

  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-black">{value}</span>
        <span className="pb-1 text-sm text-slate-500">/100</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs font-bold ${toneClass}`}>{label}</span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">{trend}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </Card>
  );
}

export function UploadBox({ title, desc }) {
  return (
    <div className="rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">📤</div>
      <h3 className="mt-4 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{desc}</p>
      <Button className="mt-5">Browse File</Button>
    </div>
  );
}
