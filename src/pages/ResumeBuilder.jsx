import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

const RESUME_DRAFT_KEY = "cg_resume_builder_draft_v2";

const templates = [
  { layout: "Minimal ATS", color: "Indigo", accent: "#4f46e5", variant: "Classic" },
  { layout: "Modern Developer", color: "Blue", accent: "#2563eb", variant: "Modern" },
  { layout: "Corporate Blue", color: "Navy", accent: "#0f4c81", variant: "Corporate" },
  { layout: "Sidebar Pro", color: "Slate", accent: "#0f172a", variant: "Sidebar" },
  { layout: "Two Column", color: "Purple", accent: "#7c3aed", variant: "Two Column" },
  { layout: "Frontend Specialist", color: "Emerald", accent: "#047857", variant: "Developer" },
  { layout: "Full Stack Pro", color: "Cyan", accent: "#0891b2", variant: "Developer" },
  { layout: "Product Company", color: "Rose", accent: "#be123c", variant: "Product" },
  { layout: "Service Company", color: "Amber", accent: "#b45309", variant: "Service" },
  { layout: "Elegant Fresher", color: "Black", accent: "#111827", variant: "Elegant" },
];

const emptyEducation = { degree: "", college: "", university: "", year: "", score: "", coursework: "" };
const emptyProject = { title: "", description: "", techStack: "", features: "", challenges: "", githubLink: "", liveLink: "" };
const emptyExperience = { company: "", role: "", duration: "", description: "" };
const emptyCertification = { title: "", issuer: "", year: "", link: "" };
const emptyAchievement = { title: "", description: "" };
const emptyCustomSection = { heading: "", content: "" };

const defaultCustomization = {
  themeColor: "#4f46e5",
  fontSize: "normal",
  spacing: "normal",
  showSections: {
    summary: true,
    objective: true,
    skills: true,
    education: true,
    projects: true,
    experience: true,
    certifications: true,
    achievements: true,
    languages: true,
    interests: true,
    customSections: true,
  },
  sectionTitles: {
    summary: "Profile Summary",
    objective: "Career Objective",
    skills: "Technical Skills",
    education: "Education",
    projects: "Projects",
    experience: "Experience / Internship",
    certifications: "Certifications",
    achievements: "Achievements",
    languages: "Languages",
    interests: "Interests",
    customSections: "Additional Information",
  },
};

function getDefaultResume() {
  const loggedUser = JSON.parse(localStorage.getItem("cg_user") || "{}");

  return {
    title: `${loggedUser?.name || "My"} Resume`,
    personalDetails: {
      name: loggedUser?.name || "",
      email: loggedUser?.email || "",
      phone: "",
      location: "India",
      linkedin: "",
      github: "",
      portfolio: "",
      leetcode: "",
      hackerrank: "",
      codechef: "",
      geeksforgeeks: "",
    },
    careerDetails: {
      targetRole: loggedUser?.targetRole || "Frontend Developer",
      experienceLevel: "Fresher",
      careerObjective: "To begin my career as a software developer and build useful, user-friendly real-world applications.",
      professionalSummary: "Motivated fresher with hands-on project experience, strong fundamentals and interest in building clean, responsive and scalable web applications.",
    },
    education: [{ ...emptyEducation }],
    skills: {
      programmingLanguages: ["JavaScript", "Java"],
      frontend: ["HTML", "CSS", "React", "Tailwind CSS"],
      backend: ["Node.js", "Express"],
      databases: ["MongoDB", "SQL"],
      tools: ["Git", "GitHub", "VS Code", "Vercel"],
      softSkills: ["Communication", "Problem Solving", "Teamwork"],
    },
    projects: [{ ...emptyProject }],
    experience: [],
    certifications: [],
    achievements: [],
    languages: ["English", "Telugu"],
    interests: ["Web Development", "Problem Solving", "AI Tools"],
    customSections: [],
    template: templates[0],
    customization: { ...defaultCustomization },
  };
}

function normalizeResume(resume) {
  const base = getDefaultResume();

  return {
    ...base,
    ...resume,
    personalDetails: { ...base.personalDetails, ...(resume?.personalDetails || {}) },
    careerDetails: { ...base.careerDetails, ...(resume?.careerDetails || {}) },
    education: Array.isArray(resume?.education) && resume.education.length ? resume.education : base.education,
    projects: Array.isArray(resume?.projects) && resume.projects.length ? resume.projects : base.projects,
    experience: Array.isArray(resume?.experience) ? resume.experience : base.experience,
    certifications: Array.isArray(resume?.certifications) ? resume.certifications : base.certifications,
    achievements: Array.isArray(resume?.achievements) ? resume.achievements : base.achievements,
    customSections: Array.isArray(resume?.customSections) ? resume.customSections : base.customSections,
    languages: Array.isArray(resume?.languages) ? resume.languages : splitText(resume?.languages || base.languages.join(", ")),
    interests: Array.isArray(resume?.interests) ? resume.interests : splitText(resume?.interests || base.interests.join(", ")),
    skills: {
      programmingLanguages: toArray(resume?.skills?.programmingLanguages || base.skills.programmingLanguages),
      frontend: toArray(resume?.skills?.frontend || base.skills.frontend),
      backend: toArray(resume?.skills?.backend || base.skills.backend),
      databases: toArray(resume?.skills?.databases || base.skills.databases),
      tools: toArray(resume?.skills?.tools || base.skills.tools),
      softSkills: toArray(resume?.skills?.softSkills || base.skills.softSkills),
    },
    template: { ...base.template, ...(resume?.template || {}) },
    customization: {
      ...defaultCustomization,
      ...(resume?.customization || {}),
      showSections: { ...defaultCustomization.showSections, ...(resume?.customization?.showSections || {}) },
      sectionTitles: { ...defaultCustomization.sectionTitles, ...(resume?.customization?.sectionTitles || {}) },
    },
  };
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return splitText(value || "");
}

function splitText(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinText(value = []) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function hasAnyValue(obj) {
  return Object.values(obj || {}).some((value) => String(value || "").trim());
}

function safeUrl(url = "") {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export function ResumeBuilder({ setPage }) {
  const previewRef = useRef(null);
  const [resume, setResume] = useState(() => normalizeResume());
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeEditor, setActiveEditor] = useState("details");
  const [draftLoaded, setDraftLoaded] = useState(false);

  function loadResumeForEditing(rawResume, explicitId) {
    if (!rawResume) return false;

    const normalized = normalizeResume(rawResume);
    const resumeId = explicitId || rawResume._id || rawResume.id || null;

    setResume(normalized);
    setEditingResumeId(resumeId);
    localStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(normalized));
    setMessage("Saved resume loaded for editing ✅");
    return true;
  }

  function consumeEditResumeFromStorage() {
    const editData =
      localStorage.getItem("cg_edit_resume_data") ||
      localStorage.getItem("cg_edit_resume");
    const editId = localStorage.getItem("cg_edit_resume_id");

    if (!editData) return false;

    try {
      const parsed = JSON.parse(editData);
      const loaded = loadResumeForEditing(parsed, editId || parsed._id || parsed.id);
      localStorage.removeItem("cg_edit_resume_data");
      localStorage.removeItem("cg_edit_resume_id");
      localStorage.removeItem("cg_edit_resume");
      return loaded;
    } catch (err) {
      console.error("Failed to load resume for editing:", err);
      setError("Failed to load resume for editing");
      return false;
    }
  }

  useEffect(() => {
    const loadedEditResume = consumeEditResumeFromStorage();

    if (!loadedEditResume) {
      const savedDraft = localStorage.getItem(RESUME_DRAFT_KEY);
      if (savedDraft) {
        try {
          setResume(normalizeResume(JSON.parse(savedDraft)));
          setMessage("Draft restored from this browser ✅");
        } catch {
          localStorage.removeItem(RESUME_DRAFT_KEY);
        }
      }
    }

    setDraftLoaded(true);

    const handleEditResumeEvent = (event) => {
      if (event?.detail?.resume) {
        loadResumeForEditing(event.detail.resume, event.detail.resumeId);
        return;
      }

      consumeEditResumeFromStorage();
    };

    window.addEventListener("cg:resume-edit", handleEditResumeEvent);

    return () => {
      window.removeEventListener("cg:resume-edit", handleEditResumeEvent);
    };
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    localStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(resume));
  }, [resume, draftLoaded]);

  const selectedTemplate = useMemo(() => {
    return templates.find((item) => item.layout === resume.template?.layout && item.color === resume.template?.color) || templates[0];
  }, [resume.template]);

  const checklist = useMemo(() => {
    const personal = resume.personalDetails;
    const projects = resume.projects || [];
    const skills = resume.skills || {};
    const codingProfile = personal.leetcode || personal.hackerrank || personal.codechef || personal.geeksforgeeks;
    const hasStrongProjects = projects.some((project) => project.title && project.description && project.techStack && project.githubLink);

    return {
      hasGithub: Boolean(personal.github),
      hasLinkedin: Boolean(personal.linkedin),
      hasPortfolio: Boolean(personal.portfolio),
      hasLiveProject: projects.some((project) => project.liveLink),
      hasCodingProfile: Boolean(codingProfile),
      hasStrongProjects,
      hasAtsKeywords: Boolean(resume.careerDetails.targetRole && resume.careerDetails.professionalSummary && (skills.frontend?.length || skills.programmingLanguages?.length)),
    };
  }, [resume]);

  const strengthScore = useMemo(() => {
    return Math.round((Object.values(checklist).filter(Boolean).length / Object.values(checklist).length) * 100);
  }, [checklist]);

  function update(path, value) {
    setResume((prev) => {
      const keys = path.split(".");
      const next = structuredClone(prev);
      let current = next;
      keys.slice(0, -1).forEach((key) => {
        current[key] = current[key] || {};
        current = current[key];
      });
      current[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updateArray(section, index, key, value) {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  }

  function addItem(section, emptyItem) {
    setResume((prev) => ({ ...prev, [section]: [...(prev[section] || []), { ...emptyItem }] }));
  }

  function removeItem(section, index, emptyItem) {
    setResume((prev) => {
      const updated = (prev[section] || []).filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, [section]: updated.length ? updated : emptyItem ? [{ ...emptyItem }] : [] };
    });
  }

  function updateSkills(key, value) {
    update(`skills.${key}`, splitText(value));
  }

  function improveSummary() {
    const role = resume.careerDetails.targetRole || "Frontend Developer";
    const improved = `Detail-oriented ${role} with strong fundamentals, hands-on project experience and the ability to build responsive, user-friendly and maintainable applications. Passionate about solving real-world problems and continuously improving through practical development.`;
    update("careerDetails.professionalSummary", improved);
    setMessage("Professional summary improved ✅");
  }

  function improveProject(index) {
    const project = resume.projects[index] || {};
    const improved = `Built ${project.title || "a real-world project"} using ${project.techStack || "modern web technologies"}. Implemented ${project.features || "important user-focused features"} with a focus on responsive design, clean code structure and maintainability.`;
    updateArray("projects", index, "description", improved);
    setMessage("Project description improved ✅");
  }

  function buildPayload() {
    const payload = normalizeResume(resume);
    payload.title = payload.title || `${payload.careerDetails.targetRole || "CareerGuide"} Resume`;
    payload.template = {
      ...payload.template,
      accent: selectedTemplate.accent,
      variant: selectedTemplate.variant,
    };
    payload.customization = {
      ...payload.customization,
      themeColor: payload.customization.themeColor || selectedTemplate.accent,
    };
    payload.resumeChecklist = checklist;
    return payload;
  }

  async function saveResume() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = buildPayload();
      const endpoint = editingResumeId ? `/resumes/${editingResumeId}` : "/resumes";
      const method = editingResumeId ? "PUT" : "POST";
      const data = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (data?.resume?._id) setEditingResumeId(data.resume._id);
      localStorage.removeItem(RESUME_DRAFT_KEY);
      setMessage(editingResumeId ? "Resume updated successfully ✅" : "Resume saved successfully ✅");
    } catch (err) {
      setError(err.message || "Failed to save resume");
    } finally {
      setLoading(false);
    }
  }

  function buildResumeText() {
    const payload = buildPayload();
    const join = (value) => Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";
    return `
Name: ${payload.personalDetails.name}
Email: ${payload.personalDetails.email}
Phone: ${payload.personalDetails.phone}
Location: ${payload.personalDetails.location}
LinkedIn: ${payload.personalDetails.linkedin}
GitHub: ${payload.personalDetails.github}
Portfolio: ${payload.personalDetails.portfolio}
LeetCode: ${payload.personalDetails.leetcode}
HackerRank: ${payload.personalDetails.hackerrank}
CodeChef: ${payload.personalDetails.codechef}
GeeksforGeeks: ${payload.personalDetails.geeksforgeeks}

Target Role: ${payload.careerDetails.targetRole}
Experience Level: ${payload.careerDetails.experienceLevel}

Professional Summary:
${payload.careerDetails.professionalSummary}

Career Objective:
${payload.careerDetails.careerObjective}

Skills:
Programming: ${join(payload.skills.programmingLanguages)}
Frontend: ${join(payload.skills.frontend)}
Backend: ${join(payload.skills.backend)}
Databases: ${join(payload.skills.databases)}
Tools: ${join(payload.skills.tools)}
Soft Skills: ${join(payload.skills.softSkills)}

Education:
${payload.education.map((edu) => `${edu.degree} ${edu.college} ${edu.university} ${edu.year} ${edu.score} ${edu.coursework}`).join("\n")}

Projects:
${payload.projects.map((project) => `${project.title}\n${project.description}\nTech Stack: ${project.techStack}\nFeatures: ${project.features}\nChallenges: ${project.challenges}\nGitHub: ${project.githubLink}\nLive: ${project.liveLink}`).join("\n\n")}

Experience:
${payload.experience.map((item) => `${item.role} at ${item.company} ${item.duration}\n${item.description}`).join("\n\n")}

Certifications:
${payload.certifications.map((item) => `${item.title} ${item.issuer} ${item.year} ${item.link}`).join("\n")}

Achievements:
${payload.achievements.map((item) => `${item.title}: ${item.description}`).join("\n")}

Languages: ${join(payload.languages)}
Interests: ${join(payload.interests)}
`.trim();
  }

  function analyzeThisResume() {
    localStorage.setItem("cg_analyzer_resume_text", buildResumeText());
    localStorage.setItem("cg_analyzer_target_role", resume.careerDetails.targetRole || "Frontend Developer");
    setPage?.("analyzer");
  }

  function downloadResumePdf() {
    const html = buildPrintHtml(buildPayload());
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      setError("Popup blocked. Please allow popups and try again.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setMessage("Print page opened. Press Ctrl + P and choose Save as PDF ✅");
  }

  function clearDraft() {
    const ok = window.confirm("Clear current draft and start fresh?");
    if (!ok) return;
    localStorage.removeItem(RESUME_DRAFT_KEY);
    setEditingResumeId(null);
    setResume(normalizeResume());
    setMessage("Draft cleared.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resume Builder"
        title="Professional Resume Builder"
        desc="Build, customize, save, analyze and download your resume. Draft auto-save protects your work."
        action={<Button onClick={saveResume}>{loading ? "Saving..." : editingResumeId ? "Update Resume" : "Save Resume"}</Button>}
      />

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.78fr)]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap gap-2">
              {[
                ["details", "Details"],
                ["sections", "Sections"],
                ["customize", "Customize"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveEditor(id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold ${activeEditor === id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {activeEditor === "details" && (
            <div className="space-y-6">
              <Card>
                <SectionTitle title="Personal Details" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Full Name" value={resume.personalDetails.name} onChange={(v) => update("personalDetails.name", v)} />
                  <Input label="Email" value={resume.personalDetails.email} onChange={(v) => update("personalDetails.email", v)} />
                  <Input label="Phone" value={resume.personalDetails.phone} onChange={(v) => update("personalDetails.phone", v)} />
                  <Input label="Location" value={resume.personalDetails.location} onChange={(v) => update("personalDetails.location", v)} />
                  <Input label="LinkedIn" value={resume.personalDetails.linkedin} onChange={(v) => update("personalDetails.linkedin", v)} />
                  <Input label="GitHub" value={resume.personalDetails.github} onChange={(v) => update("personalDetails.github", v)} />
                  <Input label="Portfolio" value={resume.personalDetails.portfolio} onChange={(v) => update("personalDetails.portfolio", v)} />
                  <Input label="LeetCode" value={resume.personalDetails.leetcode} onChange={(v) => update("personalDetails.leetcode", v)} />
                  <Input label="HackerRank" value={resume.personalDetails.hackerrank} onChange={(v) => update("personalDetails.hackerrank", v)} />
                  <Input label="CodeChef" value={resume.personalDetails.codechef} onChange={(v) => update("personalDetails.codechef", v)} />
                  <Input label="GeeksforGeeks" value={resume.personalDetails.geeksforgeeks} onChange={(v) => update("personalDetails.geeksforgeeks", v)} />
                </div>
              </Card>

              <Card>
                <SectionTitle title="Career Details" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Target Role" value={resume.careerDetails.targetRole} onChange={(v) => update("careerDetails.targetRole", v)} />
                  <Input label="Experience Level" value={resume.careerDetails.experienceLevel} onChange={(v) => update("careerDetails.experienceLevel", v)} />
                </div>
                <div className="mt-4 space-y-4">
                  <Textarea label="Professional Summary" value={resume.careerDetails.professionalSummary} onChange={(v) => update("careerDetails.professionalSummary", v)} />
                  <Button variant="soft" onClick={improveSummary}>Improve Summary</Button>
                  <Textarea label="Career Objective" value={resume.careerDetails.careerObjective} onChange={(v) => update("careerDetails.careerObjective", v)} />
                </div>
              </Card>

              <Card>
                <SectionTitle title="Skills" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Programming Languages" value={joinText(resume.skills.programmingLanguages)} onChange={(v) => updateSkills("programmingLanguages", v)} />
                  <Input label="Frontend" value={joinText(resume.skills.frontend)} onChange={(v) => updateSkills("frontend", v)} />
                  <Input label="Backend" value={joinText(resume.skills.backend)} onChange={(v) => updateSkills("backend", v)} />
                  <Input label="Databases" value={joinText(resume.skills.databases)} onChange={(v) => updateSkills("databases", v)} />
                  <Input label="Tools" value={joinText(resume.skills.tools)} onChange={(v) => updateSkills("tools", v)} />
                  <Input label="Soft Skills" value={joinText(resume.skills.softSkills)} onChange={(v) => updateSkills("softSkills", v)} />
                </div>
              </Card>
            </div>
          )}

          {activeEditor === "sections" && (
            <div className="space-y-6">
              <ArrayEditor title="Education" items={resume.education} emptyItem={emptyEducation} section="education" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["degree", "college", "university", "year", "score", "coursework"]} />
              <ArrayEditor title="Projects" items={resume.projects} emptyItem={emptyProject} section="projects" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["title", "techStack", "description", "features", "challenges", "githubLink", "liveLink"]} extraAction={(index) => <Button variant="soft" onClick={() => improveProject(index)}>Improve Project</Button>} />
              <ArrayEditor title="Experience / Internship" items={resume.experience} emptyItem={emptyExperience} section="experience" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["company", "role", "duration", "description"]} />
              <ArrayEditor title="Certifications" items={resume.certifications} emptyItem={emptyCertification} section="certifications" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["title", "issuer", "year", "link"]} />
              <ArrayEditor title="Achievements" items={resume.achievements} emptyItem={emptyAchievement} section="achievements" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["title", "description"]} />
              <Card>
                <SectionTitle title="Languages & Interests" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Languages" value={joinText(resume.languages)} onChange={(v) => update("languages", splitText(v))} />
                  <Input label="Interests" value={joinText(resume.interests)} onChange={(v) => update("interests", splitText(v))} />
                </div>
              </Card>
              <ArrayEditor title="Custom Sections" items={resume.customSections} emptyItem={emptyCustomSection} section="customSections" addItem={addItem} removeItem={removeItem} updateArray={updateArray} fields={["heading", "content"]} />
            </div>
          )}

          {activeEditor === "customize" && (
            <div className="space-y-6">
              <Card>
                <SectionTitle title="Templates" />
                <div className="grid gap-3 md:grid-cols-2">
                  {templates.map((template) => (
                    <button
                      key={`${template.layout}-${template.color}`}
                      type="button"
                      onClick={() => {
                        update("template", template);
                        update("customization.themeColor", template.accent);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${selectedTemplate.layout === template.layout ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"}`}
                    >
                      <div className="h-2 w-20 rounded" style={{ background: template.accent }} />
                      <p className="mt-3 font-black">{template.layout}</p>
                      <p className="text-xs text-slate-500">{template.variant} • {template.color}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionTitle title="Preview Customization" />
                <div className="grid gap-4 md:grid-cols-3">
                  <Input label="Theme Color" value={resume.customization.themeColor} onChange={(v) => update("customization.themeColor", v)} type="color" />
                  <Select label="Font Size" value={resume.customization.fontSize} onChange={(v) => update("customization.fontSize", v)} options={["small", "normal", "large"]} />
                  <Select label="Spacing" value={resume.customization.spacing} onChange={(v) => update("customization.spacing", v)} options={["compact", "normal", "spacious"]} />
                </div>
              </Card>

              <Card>
                <SectionTitle title="Show / Hide Sections" />
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.keys(defaultCustomization.showSections).map((key) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold dark:border-white/10 dark:bg-white/5">
                      <span>{resume.customization.sectionTitles[key] || key}</span>
                      <input
                        type="checkbox"
                        checked={resume.customization.showSections[key] !== false}
                        onChange={(e) => update(`customization.showSections.${key}`, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionTitle title="Rename Section Titles" />
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.keys(defaultCustomization.sectionTitles).map((key) => (
                    <Input key={key} label={key} value={resume.customization.sectionTitles[key] || ""} onChange={(v) => update(`customization.sectionTitles.${key}`, v)} />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-5 xl:self-start">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Live Resume Preview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">{selectedTemplate.layout} • {resume.customization.fontSize} • {resume.customization.spacing}</p>
              </div>
            </div>
            <div ref={previewRef} className="overflow-auto rounded-2xl bg-slate-200 p-2 dark:bg-slate-950/60">
              <ResumePreview resume={resume} checklist={checklist} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Resume Strength</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300">Complete these checks to improve your profile.</p>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-cyan-300">{strengthScore}%</div>
            </div>
            <div className="mt-4 grid gap-2">
              {Object.entries({
                hasGithub: "GitHub link added",
                hasLinkedin: "LinkedIn link added",
                hasPortfolio: "Portfolio link added",
                hasLiveProject: "Live project link added",
                hasCodingProfile: "Coding profile added",
                hasStrongProjects: "Strong project details added",
                hasAtsKeywords: "ATS keywords added",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs font-bold dark:bg-white/5">
                  <span>{label}</span>
                  <span>{checklist[key] ? "✅" : "⚪"}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-black">Resume Actions</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button onClick={saveResume}>{loading ? "Saving..." : editingResumeId ? "Update Resume" : "Save Resume"}</Button>
              <Button variant="soft" onClick={analyzeThisResume}>Analyze This Resume</Button>
              <Button variant="soft" onClick={downloadResumePdf}>Download PDF</Button>
              <Button variant="outline" onClick={clearDraft}>Clear Draft</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ resume }) {
  const custom = resume.customization || defaultCustomization;
  const show = custom.showSections || defaultCustomization.showSections;
  const titles = custom.sectionTitles || defaultCustomization.sectionTitles;
  const color = custom.themeColor || "#4f46e5";
  const fontSize = custom.fontSize === "small" ? "text-[10.8px]" : custom.fontSize === "large" ? "text-[12.6px]" : "text-[11.6px]";
  const spacing = custom.spacing === "compact" ? "space-y-2" : custom.spacing === "spacious" ? "space-y-5" : "space-y-3";
  const section = (key) => show[key] !== false;
  const linkButton = (label, url) => url ? <a href={safeUrl(url)} target="_blank" rel="noreferrer" className="font-bold" style={{ color }}>{label}</a> : null;

  return (
    <div className={`mx-auto min-h-[720px] w-full max-w-[620px] bg-white p-5 text-slate-900 shadow-lg ${fontSize}`}>
      <header className="border-b pb-3" style={{ borderColor: color }}>
        <h1 className="text-2xl font-black tracking-tight" style={{ color }}>{resume.personalDetails.name || "Your Name"}</h1>
        <p className="mt-1 font-bold text-slate-700">{resume.careerDetails.targetRole || "Target Role"}</p>
        <p className="mt-2 text-xs text-slate-500">{[resume.personalDetails.email, resume.personalDetails.phone, resume.personalDetails.location].filter(Boolean).join(" | ")}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {linkButton("LinkedIn", resume.personalDetails.linkedin)}
          {linkButton("GitHub", resume.personalDetails.github)}
          {linkButton("Portfolio", resume.personalDetails.portfolio)}
          {linkButton("LeetCode", resume.personalDetails.leetcode)}
          {linkButton("HackerRank", resume.personalDetails.hackerrank)}
          {linkButton("CodeChef", resume.personalDetails.codechef)}
          {linkButton("GFG", resume.personalDetails.geeksforgeeks)}
        </div>
      </header>

      <div className={`mt-4 ${spacing}`}>
        {section("summary") && resume.careerDetails.professionalSummary && <PreviewSection title={titles.summary} color={color}><p>{resume.careerDetails.professionalSummary}</p></PreviewSection>}
        {section("objective") && resume.careerDetails.careerObjective && <PreviewSection title={titles.objective} color={color}><p>{resume.careerDetails.careerObjective}</p></PreviewSection>}
        {section("skills") && <PreviewSection title={titles.skills} color={color}><SkillRows skills={resume.skills} /></PreviewSection>}
        {section("education") && <PreviewSection title={titles.education} color={color}>{resume.education.filter(hasAnyValue).map((edu, index) => <div key={index} className="mb-2"><p className="font-black">{edu.degree}</p><p className="text-slate-600">{[edu.college, edu.university, edu.year, edu.score].filter(Boolean).join(" | ")}</p>{edu.coursework && <p className="text-slate-600">Coursework: {edu.coursework}</p>}</div>)}</PreviewSection>}
        {section("projects") && <PreviewSection title={titles.projects} color={color}>{resume.projects.filter(hasAnyValue).map((project, index) => <div key={index} className="mb-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-black">{project.title}</p><div className="flex gap-3 text-xs">{linkButton("View Code", project.githubLink)}{linkButton("Live Demo", project.liveLink)}</div></div>{project.techStack && <p className="text-xs font-bold text-slate-500">Tech Stack: {project.techStack}</p>}<ul className="mt-1 list-disc pl-5 text-slate-700">{[project.description, project.features, project.challenges].filter(Boolean).map((point) => <li key={point}>{point}</li>)}</ul></div>)}</PreviewSection>}
        {section("experience") && resume.experience.some(hasAnyValue) && <PreviewSection title={titles.experience} color={color}>{resume.experience.filter(hasAnyValue).map((exp, index) => <div key={index} className="mb-2"><p className="font-black">{exp.role || exp.company}</p><p className="text-slate-600">{[exp.company, exp.duration].filter(Boolean).join(" | ")}</p><p>{exp.description}</p></div>)}</PreviewSection>}
        {section("certifications") && resume.certifications.some(hasAnyValue) && <PreviewSection title={titles.certifications} color={color}>{resume.certifications.filter(hasAnyValue).map((cert, index) => <p key={index}>• <b>{cert.title}</b> {[cert.issuer, cert.year].filter(Boolean).join(" | ")} {linkButton("View Certificate", cert.link)}</p>)}</PreviewSection>}
        {section("achievements") && resume.achievements.some(hasAnyValue) && <PreviewSection title={titles.achievements} color={color}>{resume.achievements.filter(hasAnyValue).map((item, index) => <p key={index}>• <b>{item.title}</b>{item.description ? ` - ${item.description}` : ""}</p>)}</PreviewSection>}
        {section("languages") && resume.languages?.length > 0 && <PreviewSection title={titles.languages} color={color}><p>{resume.languages.join(", ")}</p></PreviewSection>}
        {section("interests") && resume.interests?.length > 0 && <PreviewSection title={titles.interests} color={color}><p>{resume.interests.join(", ")}</p></PreviewSection>}
        {section("customSections") && resume.customSections.filter(hasAnyValue).map((item, index) => <PreviewSection key={index} title={item.heading || titles.customSections} color={color}><p>{item.content}</p></PreviewSection>)}
      </div>
    </div>
  );
}

function PreviewSection({ title, color, children }) {
  return (
    <section>
      <h2 className="mb-1.5 border-b pb-1 text-[10px] font-black uppercase tracking-[0.16em]" style={{ color, borderColor: `${color}55` }}>{title}</h2>
      <div className="leading-5">{children}</div>
    </section>
  );
}

function SkillRows({ skills }) {
  const rows = [
    ["Programming", skills.programmingLanguages],
    ["Frontend", skills.frontend],
    ["Backend", skills.backend],
    ["Databases", skills.databases],
    ["Tools", skills.tools],
    ["Soft Skills", skills.softSkills],
  ];

  return (
    <div className="space-y-1">
      {rows.filter(([, value]) => value?.length).map(([label, value]) => <p key={label}><b>{label}:</b> {value.join(", ")}</p>)}
    </div>
  );
}

function ArrayEditor({ title, items, emptyItem, section, addItem, removeItem, updateArray, fields, extraAction }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionTitle title={title} />
        <Button variant="soft" onClick={() => addItem(section, emptyItem)}>+ Add</Button>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-black">{title} #{index + 1}</p>
              <Button variant="outline" onClick={() => removeItem(section, index, emptyItem)}>Remove</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {fields.map((field) => field === "description" || field === "features" || field === "challenges" || field === "content" ? (
                <Textarea key={field} label={labelize(field)} value={item[field] || ""} onChange={(v) => updateArray(section, index, field, v)} />
              ) : (
                <Input key={field} label={labelize(field)} value={item[field] || ""} onChange={(v) => updateArray(section, index, field, v)} />
              ))}
            </div>
            {extraAction && <div className="mt-3">{extraAction(index)}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SectionTitle({ title }) {
  return <h2 className="text-lg font-black">{title}</h2>;
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${type === "color" ? "h-[46px]" : ""} w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5`}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5" />
    </label>
  );
}

function Notice({ tone, children }) {
  const styles = tone === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20";
  return <div className={`rounded-3xl border p-4 text-sm font-semibold ${styles}`}>{children}</div>;
}

function labelize(field) {
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function buildPrintHtml(resume) {
  const clean = (value = "") => String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const color = resume.customization?.themeColor || "#4f46e5";
  const show = resume.customization?.showSections || defaultCustomization.showSections;
  const titles = resume.customization?.sectionTitles || defaultCustomization.sectionTitles;
  const section = (key) => show[key] !== false;
  const join = (value) => Array.isArray(value) ? value.filter(Boolean).join(", ") : value || "";
  const href = (label, url) => url ? `<a href="${clean(safeUrl(url))}" target="_blank">${clean(label)}</a>` : "";
  const block = (title, body) => body ? `<section><h2>${clean(title)}</h2>${body}</section>` : "";

  return `<!doctype html><html><head><title>${clean(resume.personalDetails.name || "Resume")}</title><style>
    body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:24px;color:#111827}.page{max-width:850px;margin:0 auto;background:#fff;padding:36px;box-shadow:0 20px 60px rgba(15,23,42,.16)}h1{margin:0;color:${color};font-size:32px;letter-spacing:-.04em}.role{font-weight:700;color:#334155;margin-top:4px}.contact{font-size:12px;color:#475569;margin-top:10px;line-height:1.7}.links a{color:${color};font-weight:700;text-decoration:none;margin-right:10px;font-size:12px}section{margin-top:19px;break-inside:avoid}h2{font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:${color};border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin:0 0 10px}h3{font-size:15px;margin:0 0 4px}p,li{font-size:12.5px;line-height:1.55;color:#334155}ul{margin:6px 0 0 18px;padding:0}.note{max-width:850px;margin:18px auto;text-align:center;font-size:12px;color:#64748b}@media print{body{background:#fff;padding:0}.page{box-shadow:none}.note{display:none}}
  </style></head><body><div class="page">
    <header><h1>${clean(resume.personalDetails.name || "Your Name")}</h1><div class="role">${clean(resume.careerDetails.targetRole || "Target Role")}</div><div class="contact">${[resume.personalDetails.email,resume.personalDetails.phone,resume.personalDetails.location].filter(Boolean).map(clean).join(" | ")}</div><div class="links">${[href("LinkedIn",resume.personalDetails.linkedin),href("GitHub",resume.personalDetails.github),href("Portfolio",resume.personalDetails.portfolio),href("LeetCode",resume.personalDetails.leetcode)].filter(Boolean).join("")}</div></header>
    ${section("summary") ? block(titles.summary, resume.careerDetails.professionalSummary ? `<p>${clean(resume.careerDetails.professionalSummary)}</p>` : "") : ""}
    ${section("objective") ? block(titles.objective, resume.careerDetails.careerObjective ? `<p>${clean(resume.careerDetails.careerObjective)}</p>` : "") : ""}
    ${section("skills") ? block(titles.skills, `<p><b>Programming:</b> ${clean(join(resume.skills.programmingLanguages))}</p><p><b>Frontend:</b> ${clean(join(resume.skills.frontend))}</p><p><b>Backend:</b> ${clean(join(resume.skills.backend))}</p><p><b>Databases:</b> ${clean(join(resume.skills.databases))}</p><p><b>Tools:</b> ${clean(join(resume.skills.tools))}</p><p><b>Soft Skills:</b> ${clean(join(resume.skills.softSkills))}</p>`) : ""}
    ${section("education") ? block(titles.education, resume.education.filter(hasAnyValue).map((edu) => `<div><h3>${clean(edu.degree)}</h3><p>${clean([edu.college,edu.university,edu.year,edu.score].filter(Boolean).join(" | "))}</p>${edu.coursework ? `<p><b>Coursework:</b> ${clean(edu.coursework)}</p>` : ""}</div>`).join("")) : ""}
    ${section("projects") ? block(titles.projects, resume.projects.filter(hasAnyValue).map((project) => `<div><h3>${clean(project.title)}</h3><p><b>Tech Stack:</b> ${clean(project.techStack)}</p><ul>${[project.description,project.features,project.challenges].filter(Boolean).map((point) => `<li>${clean(point)}</li>`).join("")}</ul><p>${href("View Code",project.githubLink)} ${href("Live Demo",project.liveLink)}</p></div>`).join("")) : ""}
    ${section("experience") ? block(titles.experience, resume.experience.filter(hasAnyValue).map((exp) => `<div><h3>${clean(exp.role || exp.company)}</h3><p>${clean([exp.company,exp.duration].filter(Boolean).join(" | "))}</p><p>${clean(exp.description)}</p></div>`).join("")) : ""}
    ${section("certifications") ? block(titles.certifications, resume.certifications.filter(hasAnyValue).map((cert) => `<p><b>${clean(cert.title)}</b> ${clean([cert.issuer,cert.year].filter(Boolean).join(" | "))} ${href("View Certificate",cert.link)}</p>`).join("")) : ""}
    ${section("achievements") ? block(titles.achievements, resume.achievements.filter(hasAnyValue).map((item) => `<p><b>${clean(item.title)}</b>${item.description ? ` - ${clean(item.description)}` : ""}</p>`).join("")) : ""}
    ${section("languages") ? block(titles.languages, resume.languages?.length ? `<p>${clean(join(resume.languages))}</p>` : "") : ""}
    ${section("interests") ? block(titles.interests, resume.interests?.length ? `<p>${clean(join(resume.interests))}</p>` : "") : ""}
    ${section("customSections") ? resume.customSections.filter(hasAnyValue).map((item) => block(item.heading || titles.customSections, item.content ? `<p>${clean(item.content)}</p>` : "")).join("") : ""}
  </div><div class="note">Press Ctrl + P → Save as PDF</div></body></html>`;
}
