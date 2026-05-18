import { useState } from "react";
import { apiRequest } from "../utils/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  newPassword: "",
  targetRole: "",
  otp: "",
};

export function Auth({ mode = "login", setPage, setUser }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState(initialForm);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function switchMode(nextMode) {
    setActiveMode(nextMode);
    setOtpSent(false);
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
  localStorage.removeItem("cg_analyzer_resume_text");
  localStorage.removeItem("cg_analyzer_target_role");
}
  function saveLogin(data) {
    clearPrivateSessionData();
    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user;

    if (token) {
      localStorage.setItem("cg_token", token);
    }

    if (user) {
      localStorage.setItem("cg_user", JSON.stringify(user));
      setUser(user);
    } else {
      const fallbackUser = {
        name: form.name || "User",
        email: form.email,
        targetRole: form.targetRole || "",
      };

      localStorage.setItem("cg_user", JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    }

    localStorage.setItem("cg_current_page", "dashboard");
  }

  async function tryApi(endpoints, options) {
    let lastError;

    for (const endpoint of endpoints) {
      try {
        return await apiRequest(endpoint, options);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
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

  async function sendSignupOtp() {
    setError("");
    setMessage("");

    if (!form.name || !form.email) {
      setError("Name and email are required.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/send-signup-otp", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          targetRole: form.targetRole,
        }),
      });

      setOtpSent(true);
      setForm((prev) => ({
        ...prev,
        otp: "",
        password: "",
        confirmPassword: "",
      }));
      setMessage(
        data.message || "Signup OTP sent successfully. Please check your email."
      );
    } catch (err) {
      setError(err.message || "Failed to send signup OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifySignupOtp() {
    setError("");
    setMessage("");

    if (!form.name || !form.email || !form.otp || !form.password) {
      setError("Name, email, OTP and password are required.");
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
      const data = await apiRequest("/auth/verify-signup-otp", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          targetRole: form.targetRole,
          otp: form.otp,
        }),
      });

      saveLogin(data);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function sendForgotOtp() {
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Registered email is required.");
      return;
    }

    setLoading(true);

    try {
      const data = await tryApi(
        [
          "/auth/forgot-password/send-otp",
          "/auth/forgot-password/send",
          "/auth/forgot-password",
          "/auth/send-reset-otp",
        ],
        {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
          }),
        }
      );

      setOtpSent(true);
      setForm((prev) => ({
        ...prev,
        otp: "",
        newPassword: "",
      }));
      setMessage(
        data.message || "Reset OTP sent successfully. Please check your email."
      );
    } catch (err) {
      setError(err.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    setMessage("");

    if (!form.email || !form.otp || !form.newPassword) {
      setError("Email, OTP and new password are required.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await tryApi(
        [
          "/auth/forgot-password/reset",
          "/auth/reset-password",
          "/auth/forgot-password/verify",
        ],
        {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            otp: form.otp,
            newPassword: form.newPassword,
            password: form.newPassword,
          }),
        }
      );

      setMessage(data.message || "Password reset successfully. Please login.");
      setOtpSent(false);
      setActiveMode("login");
      setForm((prev) => ({
        ...initialForm,
        email: prev.email,
      }));
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = activeMode === "login";
  const isSignup = activeMode === "signup";
  const isForgot = activeMode === "forgot";

  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-950 dark:bg-[#070b1a] dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-7xl items-center gap-8 lg:grid-cols-[1.1fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-cyan-50 p-8 shadow-sm dark:border-white/10 dark:from-[#0c1022] dark:via-[#0c1022] dark:to-[#06252b]">
          <p className="text-lg font-black text-indigo-600 dark:text-cyan-300">
            CareerGuide AI
          </p>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Build Resume.
            <br />
            Match Jobs.
            <br />
            Practice Interviews.
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-9 text-slate-600 dark:text-slate-300">
            Secure login with OTP verification, resume privacy, job matching and
            interview practice in one platform.
          </p>

          <div className="mt-8 rounded-3xl bg-white/80 p-5 text-sm leading-7 text-slate-600 shadow-sm dark:bg-white/5 dark:text-slate-300">
            OTP will be sent to your registered email. If it does not appear in
            Inbox, please check Spam folder.
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-[#0c1022]">
          <div className="mb-7 grid grid-cols-3 gap-2 rounded-3xl bg-slate-100 p-2 dark:bg-white/5">
            <TabButton
              active={isLogin}
              onClick={() => switchMode("login")}
              label="Login"
            />
            <TabButton
              active={isSignup}
              onClick={() => switchMode("signup")}
              label="Signup"
            />
            <TabButton
              active={isForgot}
              onClick={() => switchMode("forgot")}
              label="Forgot"
            />
          </div>

          <div className="px-2 pb-2">
            <h2 className="text-4xl font-black">
              {isLogin && "Welcome Back"}
              {isSignup && "Create Account"}
              {isForgot && "Reset Password"}
            </h2>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              {isLogin && "Login to continue your progress."}
              {isSignup && "Verify your email with OTP and create password."}
              {isForgot && "Get OTP and reset your password."}
            </p>

            {message && (
              <div className="mt-5 rounded-2xl bg-emerald-500/10 p-4 font-bold text-emerald-600 dark:text-emerald-400">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl bg-red-500/10 p-4 font-bold text-red-500">
                {error}
              </div>
            )}

            <div className="mt-7 space-y-4">
              {isLogin && (
                <>
                  <Input
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    placeholder="Email"
                    type="email"
                    name="login-email"
                    autoComplete="email"
                  />

                  <Input
                    value={form.password}
                    onChange={(value) => update("password", value)}
                    placeholder="Password"
                    type="password"
                    name="login-password"
                    autoComplete="current-password"
                  />

                  <ActionButton onClick={login} loading={loading}>
                    Login
                  </ActionButton>

                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="font-bold text-indigo-600 dark:text-cyan-300"
                  >
                    Forgot password?
                  </button>
                </>
              )}

              {isSignup && (
                <>
                  <Input
                    value={form.name}
                    onChange={(value) => update("name", value)}
                    placeholder="Full Name"
                    name="signup-name"
                    autoComplete="name"
                    disabled={otpSent}
                  />

                  <Input
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    placeholder="Email"
                    type="email"
                    name="signup-email"
                    autoComplete="email"
                    disabled={otpSent}
                  />

                  <Input
                    value={form.targetRole}
                    onChange={(value) => update("targetRole", value)}
                    placeholder="Target Role optional"
                    name="signup-target-role"
                    autoComplete="off"
                    disabled={otpSent}
                  />

                  {!otpSent ? (
                    <ActionButton onClick={sendSignupOtp} loading={loading}>
                      Send Signup OTP
                    </ActionButton>
                  ) : (
                    <>
                      <Input
                        value={form.otp}
                        onChange={(value) =>
                          update("otp", value.replace(/\D/g, ""))
                        }
                        placeholder="Enter OTP"
                        name="signup-otp-code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />

                      <Input
                        value={form.password}
                        onChange={(value) => update("password", value)}
                        placeholder="Create Password"
                        type="password"
                        name="signup-new-password"
                        autoComplete="new-password"
                      />

                      <Input
                        value={form.confirmPassword}
                        onChange={(value) => update("confirmPassword", value)}
                        placeholder="Confirm Password"
                        type="password"
                        name="signup-confirm-password"
                        autoComplete="new-password"
                      />

                      <ActionButton
                        onClick={verifySignupOtp}
                        loading={loading}
                      >
                        Verify OTP & Create Account
                      </ActionButton>

                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setForm((prev) => ({
                            ...prev,
                            otp: "",
                            password: "",
                            confirmPassword: "",
                          }));
                        }}
                        className="font-bold text-slate-500 dark:text-slate-300"
                      >
                        Change email
                      </button>
                    </>
                  )}
                </>
              )}

              {isForgot && (
                <>
                  <Input
                    value={form.email}
                    onChange={(value) => update("email", value)}
                    placeholder="Registered Email"
                    type="email"
                    disabled={otpSent}
                    name="forgot-email"
                    autoComplete="email"
                  />

                  {!otpSent ? (
                    <ActionButton onClick={sendForgotOtp} loading={loading}>
                      Send Reset OTP
                    </ActionButton>
                  ) : (
                    <>
                      <Input
                        value={form.otp}
                        onChange={(value) =>
                          update("otp", value.replace(/\D/g, ""))
                        }
                        placeholder="Enter OTP"
                        name="forgot-otp-code"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                      />

                      <Input
                        value={form.newPassword}
                        onChange={(value) => update("newPassword", value)}
                        placeholder="Create New Password"
                        type="password"
                        name="forgot-new-password"
                        autoComplete="new-password"
                      />

                      <ActionButton onClick={resetPassword} loading={loading}>
                        Reset Password
                      </ActionButton>

                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setForm((prev) => ({
                            ...prev,
                            otp: "",
                            newPassword: "",
                          }));
                        }}
                        className="font-bold text-slate-500 dark:text-slate-300"
                      >
                        Change email
                      </button>
                    </>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={continueWithDemo}
                disabled={loading}
                className="w-full rounded-2xl bg-slate-100 p-4 font-bold text-slate-800 transition hover:bg-slate-200 disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                Continue with Demo Account
              </button>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold text-indigo-600 dark:text-cyan-300"
                >
                  New user? Create account
                </button>
              )}

              {isSignup && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-indigo-600 dark:text-cyan-300"
                >
                  Already have account? Login
                </button>
              )}

              {isForgot && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-indigo-600 dark:text-cyan-300"
                >
                  Back to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 font-bold transition ${
        active
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({ children, onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-2xl bg-indigo-600 p-4 font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  autoComplete = "off",
  name,
  inputMode,
}) {
  return (
    <input
      name={name || placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
    />
  );
}