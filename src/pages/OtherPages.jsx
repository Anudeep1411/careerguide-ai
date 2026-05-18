import { useEffect, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";
import { load } from "../utils/storage";

export function History({ setPage }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
function navigateTo(nextPage) {
  localStorage.setItem("cg_current_page", nextPage);

  if (typeof setPage === "function") {
    setPage(nextPage);
  } else {
    window.location.reload();
  }
}
  async function fetchResumes() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/resumes", {
        method: "GET",
      });

      setResumes(Array.isArray(data.resumes) ? data.resumes : []);
    } catch (err) {
      setError(err.message || "Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  async function viewResume(id) {
    setViewLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(`/resumes/${id}`, {
        method: "GET",
      });

      setSelectedResume(data.resume);
    } catch (err) {
      setError(err.message || "Failed to open resume");
    } finally {
      setViewLoading(false);
    }
  }

  async function deleteResume(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmDelete) return;

    setError("");
    setMessage("");

    try {
      await apiRequest(`/resumes/${id}`, {
        method: "DELETE",
      });

      setMessage("Resume deleted successfully ✅");
      setSelectedResume(null);
      fetchResumes();
    } catch (err) {
      setError(err.message || "Failed to delete resume");
    }
  }
  function buildResumeTextFromData(resume) {
    const personal = resume.personalDetails || {};
    const career = resume.careerDetails || {};
    const skills = resume.skills || {};

    const education = Array.isArray(resume.education) ? resume.education : [];
    const projects = Array.isArray(resume.projects) ? resume.projects : [];
    const experience = Array.isArray(resume.experience) ? resume.experience : [];
    const certifications = Array.isArray(resume.certifications)
      ? resume.certifications
      : [];
    const achievements = Array.isArray(resume.achievements)
      ? resume.achievements
      : [];

    const skillText = [
      ...(skills.programmingLanguages || []),
      ...(skills.frontend || []),
      ...(skills.backend || []),
      ...(skills.databases || []),
      ...(skills.tools || []),
      ...(skills.softSkills || []),
    ].join(", ");

    const educationText = education
      .map((edu) =>
        [
          edu.degree,
          edu.college,
          edu.university,
          edu.year,
          edu.score,
          edu.coursework,
        ]
          .filter(Boolean)
          .join(" ")
      )
      .join("\n");

    const projectText = projects
      .map((project) =>
        [
          project.title,
          project.description,
          project.techStack,
          project.features,
          project.challenges,
          project.githubLink,
          project.liveLink,
        ]
          .filter(Boolean)
          .join(". ")
      )
      .join("\n");

    const experienceText = experience
      .map((item) =>
        [item.company, item.role, item.duration, item.description]
          .filter(Boolean)
          .join(". ")
      )
      .join("\n");

    const certificationText = certifications
      .map((cert) =>
        [cert.title, cert.issuer, cert.year, cert.link]
          .filter(Boolean)
          .join(" ")
      )
      .join("\n");

    const achievementText = achievements
      .map((item) => [item.title, item.description].filter(Boolean).join(" - "))
      .join("\n");

    return `
Name: ${personal.name || ""}
Email: ${personal.email || ""}
Phone: ${personal.phone || ""}
Location: ${personal.location || ""}
GitHub: ${personal.github || ""}
LinkedIn: ${personal.linkedin || ""}
Portfolio: ${personal.portfolio || ""}
LeetCode: ${personal.leetcode || ""}
HackerRank: ${personal.hackerrank || ""}
CodeChef: ${personal.codechef || ""}
GeeksforGeeks: ${personal.geeksforgeeks || ""}

Target Role: ${career.targetRole || ""}
Experience Level: ${career.experienceLevel || ""}

Professional Summary:
${career.professionalSummary || ""}

Career Objective:
${career.careerObjective || ""}

Skills:
${skillText}

Education:
${educationText}

Projects:
${projectText}

Experience:
${experienceText}

Certifications:
${certificationText}

Achievements:
${achievementText}

Languages:
${Array.isArray(resume.languages) ? resume.languages.join(", ") : ""}

Interests:
${Array.isArray(resume.interests) ? resume.interests.join(", ") : ""}
`;
  }

  async function editResume(id) {
    setViewLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(`/resumes/${id}`, {
        method: "GET",
      });

      localStorage.setItem("cg_edit_resume_id", data.resume._id);
      localStorage.setItem("cg_edit_resume_data", JSON.stringify(data.resume));

    navigateTo("builder");
    } catch (err) {
      setError(err.message || "Failed to edit resume");
    } finally {
      setViewLoading(false);
    }
  }

  async function analyzeSavedResume(id) {
    setViewLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest(`/resumes/${id}`, {
        method: "GET",
      });

      const resumeText = buildResumeTextFromData(data.resume);

      localStorage.setItem("cg_analyzer_resume_text", resumeText);
      localStorage.setItem(
        "cg_analyzer_target_role",
        data.resume?.careerDetails?.targetRole || ""
      );

  navigateTo("analyzer");
    } catch (err) {
      setError(err.message || "Failed to analyze resume");
    } finally {
      setViewLoading(false);
    }
  }
  return (
    <div>
      <PageHeader
        eyebrow="History"
        title="Saved resumes"
        desc="View and manage resumes saved from Resume Builder. Edit and download flow will be connected next."
        action={
          <Button onClick={fetchResumes} variant="soft">
            Refresh
          </Button>
        }
      />

      {message && (
        <div className="mb-5 rounded-2xl bg-emerald-500/10 p-4 font-bold text-emerald-500">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="font-bold text-slate-500 dark:text-slate-400">
            Loading saved resumes...
          </p>
        </Card>
      ) : resumes.length === 0 ? (
        <Card>
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600/10 text-3xl">
              📄
            </div>

            <h2 className="mt-4 text-2xl font-black">No resumes saved yet</h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Go to Resume Builder, create your resume and click Save Resume.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_430px]">
          <div className="grid gap-4">
            {resumes.map((resume) => {
              const name =
                resume?.personalDetails?.name || "Untitled Candidate";
              const email = resume?.personalDetails?.email || "";
              const role =
                resume?.careerDetails?.targetRole || "No target role";
              const template =
                resume?.template?.layout || resume?.template?.color
                  ? `${resume?.template?.layout || "Template"} ${
                      resume?.template?.color
                        ? `- ${resume.template.color}`
                        : ""
                    }`
                  : "Default Template";

              return (
                <Card key={resume._id}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-black">
                        {resume.title || `${role} Resume`}
                      </h2>

                      <p className="mt-1 font-bold text-slate-700 dark:text-slate-200">
                        {name}
                      </p>

                      {email && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {email}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-black text-indigo-600 dark:text-cyan-300">
                          {role}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {template}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          Updated {formatDate(resume.updatedAt)}
                        </span>
                      </div>
                    </div>

                  <div className="flex flex-wrap gap-2">
  <Button onClick={() => viewResume(resume._id)}>
    {viewLoading ? "Opening..." : "View"}
  </Button>

  <Button variant="soft" onClick={() => editResume(resume._id)}>
    Edit
  </Button>

  <Button variant="soft" onClick={() => analyzeSavedResume(resume._id)}>
    Analyze
  </Button>

  <Button variant="ghost" onClick={() => deleteResume(resume._id)}>
    Delete
  </Button>
</div>
                  </div>
                </Card>
              );
            })}
          </div>

          <ResumeDetails resume={selectedResume} />
        </div>
      )}
    </div>
  );
}

function ResumeDetails({ resume }) {
  if (!resume) {
    return (
      <Card className="h-fit">
        <h2 className="text-2xl font-black">Resume details</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Select a saved resume to preview its important details.
        </p>
      </Card>
    );
  }

  const personal = resume.personalDetails || {};
  const career = resume.careerDetails || {};
  const skills = resume.skills || {};
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const education = Array.isArray(resume.education) ? resume.education : [];
  const certifications = Array.isArray(resume.certifications)
    ? resume.certifications
    : [];

  return (
    <Card className="h-fit">
      <h2 className="text-2xl font-black">
        {resume.title || "Saved Resume"}
      </h2>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
        <p className="font-black">{personal.name || "No name"}</p>

        {career.targetRole && (
          <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-cyan-300">
            {career.targetRole}
          </p>
        )}

        {personal.email && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {personal.email}
          </p>
        )}
      </div>

      {career.professionalSummary && (
        <DetailSection title="Summary">
          <p>{career.professionalSummary}</p>
        </DetailSection>
      )}

      <DetailSection title="Skills">
        {renderSkillLine("Programming", skills.programmingLanguages)}
        {renderSkillLine("Frontend", skills.frontend)}
        {renderSkillLine("Backend", skills.backend)}
        {renderSkillLine("Databases", skills.databases)}
        {renderSkillLine("Tools", skills.tools)}
      </DetailSection>

      {education.length > 0 && (
        <DetailSection title="Education">
          {education.map((edu, index) => (
            <div key={index} className="mb-3">
              <p className="font-black">{edu.degree || "Education"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {[edu.college, edu.university, edu.year, edu.score]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            </div>
          ))}
        </DetailSection>
      )}

      {projects.length > 0 && (
        <DetailSection title="Projects">
          {projects.map((project, index) => (
            <div key={index} className="mb-3">
              <p className="font-black">{project.title || "Project"}</p>

              {project.techStack && (
                <p className="text-sm font-bold text-indigo-600 dark:text-cyan-300">
                  {project.techStack}
                </p>
              )}

              {project.description && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {project.description}
                </p>
              )}
            </div>
          ))}
        </DetailSection>
      )}

      {certifications.length > 0 && (
        <DetailSection title="Certifications">
          {certifications.map((cert, index) => (
            <p key={index}>
              <b>{cert.title || "Certification"}</b>{" "}
              {[cert.issuer, cert.year].filter(Boolean).join(" • ")}
            </p>
          ))}
        </DetailSection>
      )}
    </Card>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
      <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>

      <div className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

function renderSkillLine(label, items) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <p>
      <b>{label}:</b> {items.join(", ")}
    </p>
  );
}

function formatDate(date) {
  if (!date) return "recently";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "recently";
  }
}

export function Templates() {
  const templates = [
    "Minimal ATS",
    "Modern Developer",
    "Corporate Blue",
    "Sidebar Pro",
    "Two Column",
    "Frontend Specialist",
    "Full Stack Pro",
    "Product Company",
    "Service Company",
    "Elegant Fresher",
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Templates"
        title="Resume templates"
        desc="Templates are available inside Resume Builder. Choose layout and color while building your resume."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template}>
            <div className="mb-4 h-32 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div className="h-4 w-32 rounded bg-indigo-600" />
              <div className="mt-4 h-2 w-full rounded bg-slate-200" />
              <div className="mt-2 h-2 w-2/3 rounded bg-slate-200" />
              <div className="mt-5 grid grid-cols-[35%_65%] gap-3">
                <div className="space-y-2">
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 rounded bg-slate-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 rounded bg-slate-200" />
                  <div className="h-2 rounded bg-slate-200" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-black">{template}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Professional ATS-friendly resume layout.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile() {
  const user = load("cg_user", null);

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        desc="Your account details used across CareerGuide AI."
      />

      <Card>
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-indigo-600 text-2xl font-black text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 className="text-2xl font-black">{user?.name || "User"}</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {user?.email || "No email available"}
            </p>
            {user?.targetRole && (
              <p className="mt-1 font-bold text-indigo-600 dark:text-cyan-300">
                {user.targetRole}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function Settings({ theme, setTheme }) {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="App settings"
        desc="Manage appearance and project preferences."
      />

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black">Appearance</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Current theme: {theme === "dark" ? "Dark" : "Light"}
            </p>
          </div>

          <Button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-2xl font-black">Privacy</h2>
        <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
          Resume data is private to the logged-in user. Backend routes are
          protected with JWT authentication.
        </p>
      </Card>
    </div>
  );
}