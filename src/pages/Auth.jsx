import { useState } from "react";
import { apiRequest } from "../utils/api";

const ADMIN_EMAIL = "carrerguideai@gmail.com";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  targetRole: "",
};

export function Auth({ mode = "login", setPage, setUser }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = activeMode === "login";
  const isSignup = activeMode === "signup";
  const isForgot = activeMode === "forgot";

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function switchMode(nextMode) {
    setActiveMode(nextMode);
    setMessage("");
    setError("");
    setForm((prev) => ({
      ...initialForm,
      email: prev.email || "",
    }));

    if (typeof setPage === "function") {
      setPage(nextMode === "signup" ? "signup" : "login");
    }
  }

  function clearPrivateSessionData() {
    localStorage.removeItem("cg_edit_resume_id");
    localStorage.removeItem("cg_edit_resume_data");
    localStorage.removeItem("cg_edit_resume");
    localStorage.removeItem("cg_analyzer_resume_text");
    localStorage.removeItem("cg_analyzer_target_role");
  }

  function saveLogin(data) {
    clearPrivateSessionData();

    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user;

    if (token) localStorage.setItem("cg_token", token);

    if (user) {
      localStorage.setItem("cg_user", JSON.stringify(user));
      setUser(user);
    } else {
      const fallbackUser = {
        name: form.name || "User",
        email: form.email,
        targetRole: form.targetRole || "",
        forcePasswordChange: data?.mustChangePassword || false,
      };
      localStorage.setItem("cg_user", JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    }

    localStorage.setItem(
      "cg_current_page",
      data?.mustChangePassword || user?.forcePasswordChange
        ? "change-password"
        : "dashboard"
    );
  }

  async function login() {
    setError("");
    setMessage("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function signup() {
    setError("");
    setMessage("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          targetRole: form.targetRole || "Fresher",
        }),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function noteForgotRequest() {
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Registered email is required.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/auth/forgot-password/contact-admin", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
    } catch (err) {
      // Even if request save fails, user can still contact admin manually.
      console.warn("Forgot request note failed:", err.message);
    } finally {
      setLoading(false);
      setMessage(
        `Please email ${ADMIN_EMAIL} from your registered email address. Admin will verify your account and share a temporary password.`
      );
    }
  }

  async function continueWithDemo() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/demo", {
        method: "POST",
        body: JSON.stringify({}),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold">
            CareerGuide AI
          </p>

          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Build Resume.
            <br />
            Match Jobs.
            <br />
            Practice Interviews.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Secure career guidance platform for resumes, analysis, job matching
            and interview preparation.
          </p>

          <div className="mt-4 max-w-xl rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            Forgot password? Contact admin at <strong>{ADMIN_EMAIL}</strong>.
            Admin will share a temporary password after verification.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white">
          <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-white/10">
            <TabButton active={isLogin} onClick={() => switchMode("login")} label="Login" />
            <TabButton active={isSignup} onClick={() => switchMode("signup")} label="Signup" />
            <TabButton active={isForgot} onClick={() => switchMode("forgot")} label="Forgot" />
          </div>

          <h2 className="text-2xl font-black">
            {isLogin && "Welcome Back"}
            {isSignup && "Create Account"}
            {isForgot && "Forgot Password"}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {isLogin && "Login with your email and password."}
            {isSignup && "Create your account directly. No signup OTP needed."}
            {isForgot && "Contact admin to receive a temporary password manually."}
          </p>

          {message && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            {isLogin && (
              <>
                <Input value={form.email} onChange={(value) => update("email", value)} placeholder="Email" type="email" name="login-email" autoComplete="email" />
                <Input value={form.password} onChange={(value) => update("password", value)} placeholder="Password" type="password" name="login-password" autoComplete="current-password" />
                <ActionButton onClick={login} loading={loading}>Login</ActionButton>
                <button type="button" onClick={() => switchMode("forgot")} className="font-bold text-indigo-600 dark:text-cyan-300">
                  Forgot password?
                </button>
              </>
            )}

            {isSignup && (
              <>
                <Input value={form.name} onChange={(value) => update("name", value)} placeholder="Full Name" name="signup-name" autoComplete="name" />
                <Input value={form.email} onChange={(value) => update("email", value)} placeholder="Email" type="email" name="signup-email" autoComplete="email" />
                <Input value={form.targetRole} onChange={(value) => update("targetRole", value)} placeholder="Target Role optional" name="signup-target-role" />
                <Input value={form.password} onChange={(value) => update("password", value)} placeholder="Create Password" type="password" name="signup-password" autoComplete="new-password" />
                <Input value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} placeholder="Confirm Password" type="password" name="signup-confirm-password" autoComplete="new-password" />
                <ActionButton onClick={signup} loading={loading}>Create Account</ActionButton>
              </>
            )}

            {isForgot && (
              <>
                <div className="rounded-2xl border border-amber-300/40 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                  Send your registered email address to:
                  <div className="mt-2 rounded-xl bg-white p-3 font-black text-slate-900 dark:bg-slate-950 dark:text-white">
                    {ADMIN_EMAIL}
                  </div>
                  Admin will verify your account and send a temporary password.
                  After login with temporary password, you must create a new password.
                </div>

                <Input value={form.email} onChange={(value) => update("email", value)} placeholder="Registered Email optional" type="email" name="forgot-email" autoComplete="email" />

                <ActionButton onClick={noteForgotRequest} loading={loading}>
                  Show Admin Contact
                </ActionButton>
              </>
            )}

            <button type="button" onClick={continueWithDemo} className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10">
              Continue with Demo Account
            </button>

            {isLogin && (
              <button type="button" onClick={() => switchMode("signup")} className="font-bold text-indigo-600 dark:text-cyan-300">
                New user? Create account
              </button>
            )}

            {isSignup && (
              <button type="button" onClick={() => switchMode("login")} className="font-bold text-indigo-600 dark:text-cyan-300">
                Already have account? Login
              </button>
            )}

            {isForgot && (
              <button type="button" onClick={() => switchMode("login")} className="font-bold text-indigo-600 dark:text-cyan-300">
                Back to Login
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${active ? "bg-white text-indigo-700 shadow dark:bg-slate-950 dark:text-cyan-300" : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>
      {label}
    </button>
  );
}

function ActionButton({ children, onClick, loading }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="w-full rounded-2xl bg-indigo-600 px-4 py-4 font-black text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70">
      {loading ? "Please wait..." : children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled = false, autoComplete = "off", name, inputMode }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} disabled={disabled} autoComplete={autoComplete} name={name} inputMode={inputMode} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5" />
  );
}
