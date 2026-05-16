import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { Button, Card } from "../components/Layout";

export function Auth({ mode, setPage, setUser }) {
  const [flow, setFlow] = useState(mode === "signup" ? "signup" : "login");
  const [otpSent, setOtpSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    otp: "",
    targetRole: "Frontend Developer",
  });

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFlow(mode === "signup" ? "signup" : "login");
    setOtpSent(false);
    setMessage("");
    setError("");
  }, [mode]);

  function update(key, value) {
    setForm({ ...form, [key]: value });
  }

  function saveLogin(data) {
    localStorage.setItem("cg_token", data.token);
    localStorage.setItem("cg_user", JSON.stringify(data.user));
    setUser(data.user);
    setPage("dashboard");
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function loginUser(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!validEmail(form.email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      if (!form.password.trim()) {
        throw new Error("Password is required");
      }

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
        }),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendSignupOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error("Name is required");
      }

      if (!validEmail(form.email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      const data = await apiRequest("/auth/send-signup-otp", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          targetRole: form.targetRole,
        }),
      });

      setOtpSent(true);
      setMessage(data.message || "OTP sent successfully. Check backend terminal or email.");
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifySignupOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!form.otp.trim()) {
        throw new Error("OTP is required");
      }

      if (form.password.trim().length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const data = await apiRequest("/auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password.trim(),
          targetRole: form.targetRole,
          otp: form.otp.trim(),
        }),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendForgotOtp(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!validEmail(form.email.trim())) {
        throw new Error("Please enter a valid email address");
      }

      const data = await apiRequest("/auth/forgot-password/send-otp", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
        }),
      });

      setOtpSent(true);
      setMessage(data.message || "Reset OTP sent successfully.");
    } catch (err) {
      setError(err.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!form.otp.trim()) {
        throw new Error("OTP is required");
      }

      if (form.newPassword.trim().length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      const data = await apiRequest("/auth/forgot-password/reset", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: form.otp.trim(),
          newPassword: form.newPassword.trim(),
        }),
      });

      setMessage(data.message || "Password reset successful. Please login.");
      setFlow("login");
      setOtpSent(false);
      update("password", "");
      update("otp", "");
      update("newPassword", "");
    } catch (err) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithDemo() {
    setDemoLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiRequest("/auth/demo", {
        method: "POST",
        body: JSON.stringify({}),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Demo login failed. Check backend server.");
    } finally {
      setDemoLoading(false);
    }
  }

  function switchFlow(nextFlow) {
    setFlow(nextFlow);
    setOtpSent(false);
    setError("");
    setMessage("");
    setForm({
      name: "",
      email: "",
      password: "",
      newPassword: "",
      otp: "",
      targetRole: "Frontend Developer",
    });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_460px]">
        <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8 dark:border-white/10 dark:from-indigo-950/40 dark:via-slate-950 dark:to-cyan-950/30">
          <p className="font-black text-indigo-600 dark:text-cyan-300">
            CareerGuide AI
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            Build Resume. Match Jobs. Practice Interviews.
          </h1>

          <p className="mt-5 max-w-2xl leading-8 text-slate-600 dark:text-slate-300">
            Secure login with OTP verification, resume privacy, job matching and
            interview practice in one platform.
          </p>

          <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-slate-600 dark:bg-white/10 dark:text-slate-300">
            Development mode lo OTP backend terminal lo print avuthundi. Real
            email setup later SMTP tho connect cheyyachu.
          </div>
        </section>

        <Card>
          <div className="mb-5 flex gap-2 rounded-2xl bg-slate-100 p-2 dark:bg-white/10">
            <button
              type="button"
              onClick={() => switchFlow("login")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-black ${
                flow === "login" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchFlow("signup")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-black ${
                flow === "signup" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Signup
            </button>

            <button
              type="button"
              onClick={() => switchFlow("forgot")}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-black ${
                flow === "forgot" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Forgot
            </button>
          </div>

          <h2 className="text-3xl font-black">
            {flow === "login" && "Welcome Back"}
            {flow === "signup" && "Create Account"}
            {flow === "forgot" && "Reset Password"}
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {flow === "login" && "Login with your verified email and password."}
            {flow === "signup" && "Verify email with OTP and create password."}
            {flow === "forgot" && "Get OTP and reset your password."}
          </p>

          {message && (
            <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3 text-sm font-bold text-emerald-500">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-bold text-red-500">
              {error}
            </div>
          )}

          {flow === "login" && (
            <form onSubmit={loginUser} className="mt-6 space-y-4">
              <Input
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="Email"
                type="email"
              />

              <Input
                value={form.password}
                onChange={(value) => update("password", value)}
                placeholder="Password"
                type="password"
              />

              <Button className="w-full" type="submit">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {flow === "signup" && (
            <form
              onSubmit={otpSent ? verifySignupOtp : sendSignupOtp}
              className="mt-6 space-y-4"
            >
              <Input
                value={form.name}
                onChange={(value) => update("name", value)}
                placeholder="Full Name"
                disabled={otpSent}
              />

              <Input
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="Email"
                type="email"
                disabled={otpSent}
              />

              <select
                value={form.targetRole}
                onChange={(e) => update("targetRole", e.target.value)}
                disabled={otpSent}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
              >
                <option>Frontend Developer</option>
                <option>Full Stack Developer</option>
                <option>Java Developer</option>
                <option>MERN Stack Developer</option>
                <option>Data Analyst</option>
              </select>

              {otpSent && (
                <>
                  <Input
                    value={form.otp}
                    onChange={(value) => update("otp", value)}
                    placeholder="Enter OTP"
                  />

                  <Input
                    value={form.password}
                    onChange={(value) => update("password", value)}
                    placeholder="Create Password"
                    type="password"
                  />
                </>
              )}

              <Button className="w-full" type="submit">
                {loading
                  ? "Please wait..."
                  : otpSent
                  ? "Verify OTP & Create Account"
                  : "Send OTP"}
              </Button>

              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-sm font-bold text-indigo-600 dark:text-cyan-300"
                >
                  Change email / resend OTP
                </button>
              )}
            </form>
          )}

          {flow === "forgot" && (
            <form
              onSubmit={otpSent ? resetPassword : sendForgotOtp}
              className="mt-6 space-y-4"
            >
              <Input
                value={form.email}
                onChange={(value) => update("email", value)}
                placeholder="Registered Email"
                type="email"
                disabled={otpSent}
              />

              {otpSent && (
                <>
                  <Input
                    value={form.otp}
                    onChange={(value) => update("otp", value)}
                    placeholder="Enter OTP"
                  />

                  <Input
                    value={form.newPassword}
                    onChange={(value) => update("newPassword", value)}
                    placeholder="New Password"
                    type="password"
                  />
                </>
              )}

              <Button className="w-full" type="submit">
                {loading
                  ? "Please wait..."
                  : otpSent
                  ? "Reset Password"
                  : "Send Reset OTP"}
              </Button>
            </form>
          )}

          <button
            type="button"
            onClick={continueWithDemo}
            disabled={demoLoading}
            className="mt-3 w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
          >
            {demoLoading ? "Creating demo..." : "Continue with Demo Account"}
          </button>
        </Card>
      </div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
    />
  );
}