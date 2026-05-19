import { useState } from "react";
import { Button, Card, PageHeader } from "../components/Layout";
import { apiRequest } from "../utils/api";

export function ChangePassword({ setPage, setUser, user }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleChangePassword() {
    setMessage("");
    setError("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const updatedUser = {
        ...(user || {}),
        ...(data.user || {}),
        forcePasswordChange: false,
      };

      localStorage.setItem("cg_user", JSON.stringify(updatedUser));
      localStorage.setItem("cg_current_page", "dashboard");

      setUser(updatedUser);
      setMessage(data.message || "Password changed successfully.");

      setTimeout(() => setPage("dashboard"), 700);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account Security"
        title="Change Password"
        desc="Update your password. If admin shared a temporary password, enter it as current password."
      />

      <div className="mx-auto max-w-2xl">
        {user?.forcePasswordChange && (
          <div className="mb-5 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-700 dark:text-amber-200">
            You are using a temporary password. Please create your own password
            before continuing.
          </div>
        )}

        <Card>
          {message && (
            <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <PasswordInput label="Current Password / Temporary Password" value={form.currentPassword} onChange={(value) => update("currentPassword", value)} />
            <PasswordInput label="New Password" value={form.newPassword} onChange={(value) => update("newPassword", value)} />
            <PasswordInput label="Confirm New Password" value={form.confirmPassword} onChange={(value) => update("confirmPassword", value)} />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleChangePassword}>
                {loading ? "Updating..." : "Change Password"}
              </Button>

              {!user?.forcePasswordChange && (
                <Button variant="soft" onClick={() => setPage("settings")}>
                  Back to Settings
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <input type="password" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/5" />
    </label>
  );
}
