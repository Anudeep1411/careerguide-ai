import { useEffect, useState } from "react";
import { AppShell } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ResumeBuilder } from "./pages/ResumeBuilder";
import { ResumeAnalyzer } from "./pages/Analyzer";
import { JobMatch } from "./pages/JobMatch";
import { JobOffers } from "./pages/JobOffers";
import { InterviewPractice } from "./pages/Interview";
import { History, Profile, Settings, Templates } from "./pages/OtherPages";
import { Auth } from "./pages/Auth";
import { load, save } from "./utils/storage";

export default function App() {
  const [theme, setTheme] = useState(() => load("cg_theme", "dark"));
  const [user, setUser] = useState(() => load("cg_user", null));

  const [page, setPage] = useState(() => {
    const savedUser = load("cg_user", null);
    const savedPage = load("cg_current_page", "dashboard");

    if (savedUser) {
      return savedPage === "login" || savedPage === "signup"
        ? "dashboard"
        : savedPage;
    }

    return "login";
  });

  useEffect(() => {
    save("cg_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (user && page !== "login" && page !== "signup") {
      save("cg_current_page", page);
    }
  }, [page, user]);

  function handleSetPage(nextPage) {
    if (!user && nextPage !== "login" && nextPage !== "signup") {
      setPage("login");
      return;
    }

    setPage(nextPage);
  }

  function handleSetUser(nextUser) {
    setUser(nextUser);

    if (nextUser) {
      save("cg_user", nextUser);
      setPage("dashboard");
    }
  }

  function handleLogout() {
    localStorage.removeItem("cg_token");
    localStorage.removeItem("cg_user");
    localStorage.removeItem("cg_current_page");

    setUser(null);
    setPage("login");
  }

  function renderPage() {
    if (page === "dashboard") {
      return <Dashboard setPage={handleSetPage} />;
    }

    if (page === "builder") {
      return <ResumeBuilder setPage={handleSetPage} />;
    }

    if (page === "analyzer") {
      return <ResumeAnalyzer setPage={handleSetPage} />;
    }

    if (page === "jobmatch") {
      return <JobMatch setPage={handleSetPage} />;
    }

    if (page === "joboffers") {
      return <JobOffers />;
    }

    if (page === "interview") {
      return <InterviewPractice />;
    }

    if (page === "history") {
      return <History />;
    }

    if (page === "templates") {
      return <Templates />;
    }

    if (page === "profile") {
      return <Profile />;
    }

    if (page === "settings") {
      return <Settings theme={theme} setTheme={setTheme} />;
    }

    return <Dashboard setPage={handleSetPage} />;
  }

  if (!user) {
    return (
      <Auth
        mode={page === "signup" ? "signup" : "login"}
        setPage={setPage}
        setUser={handleSetUser}
      />
    );
  }

  return (
    <AppShell
      page={page}
      setPage={handleSetPage}
      theme={theme}
      setTheme={setTheme}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AppShell>
  );
}