import { useMemo, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { companyCategories, companyDirectory } from "../data/companyDirectory";

function normalize(value = "") {
  return String(value || "").toLowerCase();
}

function scoreCompany(company, skillText) {
  const userSkills = normalize(skillText);
  const matched = company.skills.filter((skill) => userSkills.includes(normalize(skill)));
  const missing = company.skills.filter((skill) => !userSkills.includes(normalize(skill)));
  const base = company.fresherFriendly.includes("High") ? 18 : company.fresherFriendly === "Medium" ? 10 : 5;
  const score = Math.min(100, Math.round((matched.length / Math.max(company.skills.length, 1)) * 75 + base));
  const chance = score >= 80 ? "High" : score >= 60 ? "Medium-High" : score >= 40 ? "Medium" : "Low-Medium";

  return { score, chance, matched, missing };
}

export function JobOffers() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [skillText, setSkillText] = useState("React, JavaScript, Node.js, MongoDB, SQL, Git");

  const filteredCompanies = useMemo(() => {
    return companyDirectory.filter((company) => {
      const matchesQuery = !query || normalize(company.name).includes(normalize(query)) || normalize(company.category).includes(normalize(query)) || company.roles.some((role) => normalize(role).includes(normalize(query)));
      const matchesCategory = category === "All" || company.category === category;
      const matchesDifficulty = difficulty === "All" || company.difficulty === difficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [query, category, difficulty]);

  const readiness = selectedCompany ? scoreCompany(selectedCompany, skillText) : null;
  const difficulties = ["All", "Easy-Medium", "Medium", "Medium-High", "High", "Very High"];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Company Directory"
        title="Job Offers & Company Readiness"
        desc="Explore 100 fresher-focused companies, understand their selection process and check your readiness."
      />

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Search company or role</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search TCS, Zoho, React, Analyst..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none dark:border-white/10 dark:bg-slate-950">
              {companyCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none dark:border-white/10 dark:bg-slate-950">
              {difficulties.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCompanies.map((company) => (
          <button
            key={company.id}
            type="button"
            onClick={() => setSelectedCompany(company)}
            className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">{company.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{company.category}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">#{company.rank}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge label={`Fresher: ${company.fresherFriendly}`} />
              <Badge label={`Difficulty: ${company.difficulty}`} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Best for: {company.focus}</p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Roles: {company.roles.slice(0, 3).join(", ")}</p>
          </button>
        ))}
      </div>

      {!filteredCompanies.length && (
        <Card>
          <p className="text-center font-bold text-slate-500 dark:text-slate-300">No companies found. Try another search or filter.</p>
        </Card>
      )}

      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-3xl bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-indigo-600 dark:text-cyan-300">{selectedCompany.category}</p>
                <h2 className="text-3xl font-black">{selectedCompany.name}</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-300">{selectedCompany.overview}</p>
              </div>
              <Button variant="soft" onClick={() => setSelectedCompany(null)}>Close</Button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <DetailSection title="Common Fresher Roles" items={selectedCompany.roles} />
                <DetailSection title="Required Skills" items={selectedCompany.skills} />
                <DetailSection title="Resume Keywords" items={selectedCompany.resumeKeywords} />
                <DetailSection title="Selection Process" items={selectedCompany.rounds} numbered />
                <DetailSection title="Common Interview Questions" items={selectedCompany.questions} numbered />
                <DetailSection title="Projects to Build" items={selectedCompany.projects} numbered />
                <DetailSection title="30-Day Preparation Roadmap" items={selectedCompany.roadmap} numbered />
              </div>

              <Card>
                <h3 className="text-xl font-black">Company Readiness Checker</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Enter your current skills to estimate how ready you are for {selectedCompany.name}.</p>

                <textarea
                  value={skillText}
                  onChange={(event) => setSkillText(event.target.value)}
                  rows={5}
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
                />

                <div className="mt-5 rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-300">Readiness Score</p>
                      <p className="text-4xl font-black text-indigo-600 dark:text-cyan-300">{readiness.score}%</p>
                    </div>
                    <Badge label={`Chance: ${readiness.chance}`} />
                  </div>

                  <MiniList title="Matched Skills" items={readiness.matched} empty="No direct matches yet." tone="green" />
                  <MiniList title="Missing Skills" items={readiness.missing} empty="You cover most required skills." tone="amber" />

                  <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm font-semibold text-indigo-800 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200">
                    Resume tip: Add 2-3 company-relevant keywords and one project that proves your role skills before applying.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ label }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-white/10 dark:text-slate-200">{label}</span>;
}

function DetailSection({ title, items, numbered = false }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
      <h3 className="font-black">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => numbered ? (
          <div key={item} className="w-full rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
            {index + 1}. {item}
          </div>
        ) : <Badge key={item} label={item} />)}
      </div>
    </div>
  );
}

function MiniList({ title, items, empty, tone }) {
  const toneClass = tone === "green" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";

  return (
    <div className="mt-4">
      <p className="text-sm font-black">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-xs font-bold ${toneClass}`}>{item}</span>) : <p className="text-xs text-slate-500 dark:text-slate-300">{empty}</p>}
      </div>
    </div>
  );
}
