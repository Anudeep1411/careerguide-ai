import { useState } from "react";
import { Button, Card, PageHeader, ScoreCard } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function JobOffers() {
  const [resumeText, setResumeText] = useState(
    "Skills: HTML CSS JavaScript React Tailwind Git GitHub DSA OOP Java SQL. Project: DSA Visualizer and CareerGuide AI full stack project with MongoDB Express React Node.js JWT authentication."
  );

  const [keyword, setKeyword] = useState("Developer");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState("companies");
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [error, setError] = useState("");

  async function checkCompanyReadiness() {
    setLoadingCompanies(true);
    setError("");

    try {
      const data = await apiRequest("/job-offers/company-readiness", {
        method: "POST",
        body: JSON.stringify({ resumeText }),
      });

      setCompanies(data.companies || []);
      setActiveTab("companies");
    } catch (err) {
      setError(err.message || "Failed to calculate company readiness");
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function fetchJobOffers() {
    setLoadingJobs(true);
    setError("");

    try {
      const data = await apiRequest("/job-offers/offers", {
        method: "POST",
        body: JSON.stringify({
          keyword,
          location,
          resumeText,
          limit: 8,
        }),
      });

      setJobs(data.jobs || []);
      setActiveTab("jobs");
    } catch (err) {
      setError(err.message || "Failed to fetch job offers");
    } finally {
      setLoadingJobs(false);
    }
  }

  const bestCompany = companies[0];

  return (
    <div>
      <PageHeader
        eyebrow="Real Job Offers"
        title="Find real jobs and check company readiness"
        desc="Compare your resume skills with company expectations and real job listings. This gives an estimate, not a guarantee."
        action={
          <div className="flex flex-wrap gap-3">
            <Button onClick={checkCompanyReadiness}>
              {loadingCompanies ? "Checking..." : "Check Companies"}
            </Button>
            <Button onClick={fetchJobOffers} variant="soft">
              {loadingJobs ? "Fetching..." : "Fetch Jobs"}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-2xl font-black">Your Resume Skills</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Paste your resume text or skills. We will compare it with company
              expectations and real job descriptions.
            </p>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="mt-4 h-64 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
              placeholder="Paste resume text / skills here..."
            />

            <Button onClick={checkCompanyReadiness} className="mt-4 w-full">
              {loadingCompanies ? "Checking..." : "Check Company Readiness"}
            </Button>
          </Card>

          <Card>
            <h2 className="text-2xl font-black">Real Job Search</h2>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">Keyword</span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
                placeholder="Developer, React, Node, Java..."
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-bold">
                Location optional
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5"
                placeholder="Remote, India, Germany..."
              />
            </label>

            <Button onClick={fetchJobOffers} className="mt-4 w-full">
              {loadingJobs ? "Fetching Jobs..." : "Fetch Real Job Offers"}
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl font-black">Important Note</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Company readiness and shortlist chance are only estimates based on
              skills, common company expectations and job descriptions. Actual
              shortlisting depends on company, recruiter, competition and role.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard
              title="Best Company Match"
              value={bestCompany?.readinessScore || 0}
              label={bestCompany?.company || "Check now"}
              tone={
                (bestCompany?.readinessScore || 0) >= 80
                  ? "success"
                  : (bestCompany?.readinessScore || 0) >= 60
                  ? "warning"
                  : "danger"
              }
              trend="Estimate"
            />

            <ScoreCard
              title="Real Jobs Found"
              value={Math.min(jobs.length * 10, 100)}
              label={`${jobs.length} jobs`}
              tone={jobs.length > 0 ? "success" : "warning"}
              trend="Live"
            />

            <ScoreCard
              title="Companies Checked"
              value={Math.min(companies.length * 15, 100)}
              label={`${companies.length} companies`}
              tone={companies.length > 0 ? "success" : "warning"}
              trend="Ready"
            />
          </div>

          <Card>
            <div className="mb-5 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("companies")}
                className={`rounded-2xl px-4 py-2 text-sm font-black ${
                  activeTab === "companies"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                Company Readiness ({companies.length})
              </button>

              <button
                onClick={() => setActiveTab("jobs")}
                className={`rounded-2xl px-4 py-2 text-sm font-black ${
                  activeTab === "jobs"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                }`}
              >
                Real Jobs ({jobs.length})
              </button>
            </div>

            {activeTab === "companies" && (
              <CompanyReadinessList companies={companies} />
            )}

            {activeTab === "jobs" && <JobOffersList jobs={jobs} />}
          </Card>
        </div>
      </div>
    </div>
  );
}

function CompanyReadinessList({ companies }) {
  if (companies.length === 0) {
    return (
      <EmptyState
        icon="🏢"
        title="No company readiness yet"
        desc="Click Check Company Readiness to compare your skills with TCS, Accenture, Wipro, Google, Amazon and more."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <div
          key={company.company}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              🏢
            </div>

            <div className="mr-auto">
              <h3 className="text-xl font-black">{company.company}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Type: {company.type} | Chance: {company.chanceEstimate}
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{ width: `${company.readinessScore}%` }}
                />
              </div>

              <p className="mt-2 text-sm font-bold">
                Readiness Score: {company.readinessScore}/100
              </p>

              <MiniList title="Matched Skills" items={company.matchedSkills} />
              <MiniList title="Missing Skills" items={company.missingSkills} />
              <MiniList
                title="Expected Questions"
                items={company.expectedQuestions}
              />
              <MiniList
                title="Preparation Plan"
                items={company.preparationPlan}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobOffersList({ jobs }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon="💼"
        title="No real jobs loaded yet"
        desc="Click Fetch Real Job Offers to load current job listings from a public job source."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job, index) => (
        <div
          key={`${job.title}-${job.company}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600/10 text-2xl">
              💼
            </div>

            <div className="mr-auto">
              <h3 className="text-xl font-black">{job.title}</h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {job.company} | {job.location}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {job.description || "No description available"}
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{ width: `${job.matchScore}%` }}
                />
              </div>

              <p className="mt-2 text-sm font-bold">
                Match Score: {job.matchScore}/100 | Chance:{" "}
                {job.chanceEstimate}
              </p>

              <MiniList title="Required Skills" items={job.requiredSkills} />
              <MiniList title="Matched Skills" items={job.matchedSkills} />
              <MiniList title="Missing Skills" items={job.missingSkills} />
              <MiniList
                title="Expected Interview Questions"
                items={job.expectedInterviewQuestions}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-black text-white"
                  >
                    Apply / View Job
                  </a>
                )}

                <button className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-black text-slate-800 dark:bg-white/10 dark:text-white">
                  Analyze Match
                </button>

                <button className="rounded-2xl bg-slate-200 px-4 py-2 text-sm font-black text-slate-800 dark:bg-white/10 dark:text-white">
                  Practice Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniList({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-sm font-black text-indigo-600 dark:text-cyan-300">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {items.slice(0, 8).map((item) => (
          <span
            key={item}
            className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="grid min-h-[420px] place-items-center text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">
          {icon}
        </div>
        <h2 className="mt-4 text-2xl font-black">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          {desc}
        </p>
      </div>
    </div>
  );
}