import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation, Navigate as Redirect } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

interface LocationState {
  username?: string;
  email?: string | null;
  role?: string;
}

const AdminUserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [currentEmail, setCurrentEmail] = useState(state?.email ?? "");
  const [currentRole, setCurrentRole] = useState<"user" | "admin">(
    (state?.role === "admin" ? "admin" : "user") as "user" | "admin"
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const id = userId ? parseInt(userId, 10) : NaN;
  const username = state?.username ?? (isNaN(id) ? "" : `#${id}`);

  useEffect(() => {
    if (state?.role === "admin" || state?.role === "user") setCurrentRole(state.role);
    setCurrentEmail(state?.email ?? "");
  }, [state?.role, state?.email, userId]);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isNaN(id)) return;
    setError("");
    setSuccess("");
    if (newPassword.length < 6) {
      setError(t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(t.passwordChanged);
        setShowPasswordForm(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Update failed");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = () => {
    if (!token || isNaN(id)) return;
    const emailVal = currentEmail.trim().toLowerCase();
    if (!emailVal) {
      setError(t.invalidEmail);
      return;
    }
    setSavingEmail(true);
    setError("");
    setSuccess("");
    fetch(`${API_BASE}/api/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, email: emailVal }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) setSuccess(t.emailUpdated);
        else setError(data.error === "Email already registered" ? t.emailAlreadyRegistered : data.error || "Update failed");
      })
      .catch(() => setError("Update failed"))
      .finally(() => setSavingEmail(false));
  };

  const handleRoleChange = (newRole: "user" | "admin") => {
    if (!token || isNaN(id)) return;
    setSavingRole(true);
    setError("");
    setSuccess("");
    fetch(`${API_BASE}/api/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, role: newRole }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        setCurrentRole(newRole);
        setSuccess(t.roleUpdated);
      })
      .catch(() => setError("Update failed"))
      .finally(() => setSavingRole(false));
  };

  const handleDelete = () => {
    if (!token || isNaN(id)) return;
    if (!window.confirm(`${t.deleteUser} "${username}"?`)) return;
    setDeleting(true);
    setError("");
    fetch(`${API_BASE}/api/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        navigate("/admin/users", { replace: true });
      })
      .catch((e) => {
        setError((e as Error).message || "Delete failed");
      })
      .finally(() => setDeleting(false));
  };

  if (authLoading || (token && !user)) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Redirect to="/" replace />;
  }

  if (!userId || isNaN(id)) {
    return (
      <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Link to="/admin/users" className={`font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
            ← {t.manageUsers}
          </Link>
          <p className="mt-4 text-red-500">{t.invalidUser}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Link
          to="/admin/users"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.manageUsers}
        </Link>
        <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h1 className="text-xl font-bold mb-2">{t.edit} – {username}</h1>
          {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
          {success && <p className="mb-4 text-green-600 dark:text-green-400 text-sm">{success}</p>}
          <div className="mb-4">
            <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
              {t.email}
            </label>
            <input
              id="edit-email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border mb-2 ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            />
            <button
              type="button"
              onClick={handleSaveEmail}
              disabled={savingEmail}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {savingEmail ? "..." : t.saveProfile}
            </button>
          </div>
          <div className="mb-6">
            <label htmlFor="edit-role" className="block text-sm font-medium mb-1">
              {t.changeRole}
            </label>
            <select
              id="edit-role"
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as "user" | "admin")}
              disabled={savingRole}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            >
              <option value="user">{t.roleUser}</option>
              <option value="admin">{t.roleAdmin}</option>
            </select>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handleSavePassword} className="space-y-4 mb-6">
              <div>
                <label htmlFor="new-pwd" className="block text-sm font-medium mb-1">{t.newPassword}</label>
                <input
                  id="new-pwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                />
              </div>
              <div>
                <label htmlFor="confirm-pwd" className="block text-sm font-medium mb-1">{t.confirmPassword}</label>
                <input
                  id="confirm-pwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                >
                  {saving ? "..." : t.saveProfile}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setError(""); setNewPassword(""); setConfirmPassword(""); }}
                  className={`px-4 py-2 rounded-lg border font-medium ${isLight ? "border-slate-300 text-slate-700" : "border-slate-600 text-slate-300"}`}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setShowPasswordForm(true); setError(""); setSuccess(""); }}
              className={`w-full py-3 px-4 rounded-lg font-semibold border-2 mb-6 ${
                isLight ? "border-cyan-600 text-cyan-600 bg-white hover:bg-cyan-50" : "border-cyan-400 text-cyan-400 bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {t.changePassword}
            </button>
          )}

          <hr className={`mb-4 ${isLight ? "border-slate-200" : "border-slate-700"}`} />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50"
          >
            {deleting ? "..." : t.deleteUser}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserEdit;
