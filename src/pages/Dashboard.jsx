import { activities, quickActions, scoreCards, weakAreas } from "../data/mockData";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";

export function Dashboard({ setPage }) {
  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back, Anudeep 👋"
        desc="Let’s improve your resume, job readiness and interview performance today."
        action={<Button onClick={() => setPage("interview")}>Start Practice</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreCards.map((card) => <ScoreCard key={card.title} {...card} />)}
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
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">{action.icon}</div>
              <h3 className="mt-4 text-lg font-black">{action.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <h2 className="mb-4 text-2xl font-black">Recent Activity</h2>
          <div className="space-y-3">
            {activities.map((item) => (
              <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600/10">📌</div>
                <div className="mr-auto">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{item.score}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-2xl font-black">Weak Areas</h2>
          <div className="space-y-3">
            {weakAreas.map((area) => (
              <div key={area} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-semibold">{area}</span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" variant="soft">View Improvement Plan</Button>
        </Card>
      </div>
    </div>
  );
}
