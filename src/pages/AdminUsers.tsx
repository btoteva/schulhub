import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

export interface UserRow {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  profile_type?: string | null;
  school?: string | null;
  class_name?: string | null;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newSchool, setNewSchool] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [newGrade, setNewGrade] = useState("");
  const [newParallel, setNewParallel] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/schools`)
      .then((res) => (res.ok ? res.json() : { schools: [] }))
      .then((data) => setSchools(data.schools || []))
      .catch(() => setSchools([]));
  }, []);

  const fetchUsers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "Forbidden" : "Failed to load");
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (token && isAdmin) fetchUsers();
    else setLoading(false);
  }, [token, isAdmin, fetchUsers]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newUsername.trim() || newPassword.length < 6) {
      setError("Username and password (min 6) required");
      return;
    }
    setCreating(true);
    setError("");
    fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        username: newUsername.trim(),
        password: newPassword,
        role: newRole,
        school: newSchool.trim() || null,
        class:
          newGrade.trim() || newParallel.trim()
            ? `${newGrade.trim()}${newParallel.trim() ? ` ${newParallel.trim()}` : ""}`
            : null,
      }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setNewUsername("");
          setNewPassword("");
          setNewRole("user");
          setNewSchool("");
          setNewGrade("");
          setNewParallel("");
          fetchUsers();
        } else {
          setError(data.error || "Create failed");
        }
      })
      .catch(() => setError("Create failed"))
      .finally(() => setCreating(false));
  };

  if (authLoading || (token && !user)) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString();
    } catch {
      return s;
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to="/profile"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.profile}
        </Link>
        <h1 className="text-2xl font-bold mb-4">{t.manageUsers}</h1>
        {error && (
          <p className="mb-4 text-red-500 text-sm">{error}</p>
        )}
        <div className={`mb-6 rounded-xl border p-4 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h2 className="text-lg font-semibold mb-3">{t.createUser}</h2>
          <form onSubmit={handleCreateUser} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">{t.username}</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                minLength={2}
                maxLength={50}
                className={`w-40 rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.password}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                className={`w-40 rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.school}</label>
              <select
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                className={`w-40 rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              >
                <option value="">—</option>
                {schools.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.class}</label>
              <input
                type="number"
                min={1}
                max={12}
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className={`w-20 rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.parallel}</label>
              <input
                type="text"
                value={newParallel}
                onChange={(e) => setNewParallel(e.target.value)}
                maxLength={2}
                className={`w-16 rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.changeRole}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                className={`rounded border px-3 py-2 text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              >
                <option value="user">{t.roleUser}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
            >
              {creating ? "..." : t.createUser}
            </button>
          </form>
        </div>
        {loading ? (
          <p className={isLight ? "text-slate-600" : "text-slate-400"}>...</p>
        ) : users.length === 0 ? (
          <p className={isLight ? "text-slate-600" : "text-slate-400"}>No users.</p>
        ) : (
          <div className={`rounded-xl border overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
            <table className="w-full text-left">
              <thead>
                <tr className={isLight ? "border-b border-slate-200 bg-slate-50" : "border-b border-slate-700 bg-slate-800"}>
                  <th className="px-4 py-3 font-semibold">{t.username}</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">{t.email}</th>
                  <th className="px-4 py-3 font-semibold">{t.school}</th>
                  <th className="px-4 py-3 font-semibold">{t.class}</th>
                  <th className="px-4 py-3 font-semibold">{t.changeRole}</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">{t.createdAt}</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={isLight ? "border-b border-slate-100" : "border-b border-slate-700"}>
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-sm opacity-90 hidden sm:table-cell">{u.email || "—"}</td>
                    <td className="px-4 py-3 text-sm">{u.school || "—"}</td>
                    <td className="px-4 py-3 text-sm">{u.class_name || "—"}</td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? t.roleAdmin : t.roleUser}
                    </td>
                    <td className="px-4 py-3 text-sm opacity-80 hidden sm:table-cell">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/users/edit/${u.id}`}
                        state={{ username: u.username, email: u.email, role: u.role, profile_type: u.profile_type, school: u.school, class: u.class_name }}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm font-medium"
                      >
                        {t.edit}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
