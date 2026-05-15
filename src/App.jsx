import { useEffect, useState } from "react";
import { AppShell } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { ResumeBuilder } from "./pages/ResumeBuilder";
import { ResumeAnalyzer } from "./pages/Analyzer";
import { JobMatch } from "./pages/JobMatch";
import { InterviewPractice } from "./pages/Interview";
import { History, Profile, Settings, Templates } from "./pages/OtherPages";
import { load, save } from "./utils/storage";

export default function App() {
  const [page, setPage] = useState("landing");
  const [theme, setTheme] = useState(() => load("cg_theme", "dark"));

  useEffect(() => {
    save("cg_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function renderPage() {
    if (page === "landing") return <Landing setPage={setPage} />;
    if (page === "dashboard") return <Dashboard setPage={setPage} />;
    if (page === "builder") return <ResumeBuilder setPage={setPage} />;
    if (page === "analyzer") return <ResumeAnalyzer setPage={setPage} />;
    if (page === "jobmatch") return <JobMatch setPage={setPage} />;
    if (page === "interview") return <InterviewPractice />;
    if (page === "history") return <History />;
    if (page === "templates") return <Templates />;
    if (page === "profile") return <Profile />;
    if (page === "settings") return <Settings theme={theme} setTheme={setTheme} />;
    return <Dashboard setPage={setPage} />;
  }

  return (
    <AppShell page={page} setPage={setPage} theme={theme} setTheme={setTheme}>
      {renderPage()}
    </AppShell>
  );
}
