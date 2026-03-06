import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate, useLocation, Navigate as Redirect } from "react-router-dom";
import { FaSave, FaKey, FaTimes, FaTrashAlt, FaUserPlus, FaEdit, FaUserTie, FaHeart, FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

interface LocationState {
  username?: string;
  email?: string | null;
  role?: string;
  profile_type?: string | null;
  school?: string | null;
  class?: string | null;
  gender?: string | null;
}

const AdminUserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user, token, loading: authLoading, isAdmin, refetchUser } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [currentEmail, setCurrentEmail] = useState(state?.email ?? "");
  const [currentRole, setCurrentRole] = useState<"user" | "admin">(
    (state?.role === "admin" ? "admin" : "user") as "user" | "admin"
  );
  const [currentProfileType, setCurrentProfileType] = useState<string>(state?.profile_type ?? "");
  const [currentGender, setCurrentGender] = useState<string>(state?.gender ?? "");
  const [currentSchool, setCurrentSchool] = useState(state?.school ?? "");
  const [schools, setSchools] = useState<string[]>([]);
  const [currentGrade, setCurrentGrade] = useState("");
  const [currentParallel, setCurrentParallel] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingSchoolClass, setSavingSchoolClass] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [children, setChildren] = useState<{ id: number; child_name: string; school?: string | null; class?: string | null; student_username?: string | null; gender?: string | null }[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [childName, setChildName] = useState("");
  const [childStudentUsername, setChildStudentUsername] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState<number | null>(null);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editChildName, setEditChildName] = useState("");
  const [editChildUsername, setEditChildUsername] = useState("");
  const [savingEditChildId, setSavingEditChildId] = useState<number | null>(null);

  const id = userId ? parseInt(userId, 10) : NaN;
  const username = state?.username ?? (isNaN(id) ? "" : `#${id}`);

  useEffect(() => {
    if (state?.role === "admin" || state?.role === "user") setCurrentRole(state.role);
    setCurrentEmail(state?.email ?? "");
    setCurrentProfileType(state?.profile_type ?? "");
    setCurrentGender(state?.gender ?? "");
    setCurrentSchool(state?.school ?? "");
    const cls = state?.class ?? "";
    if (cls) {
      const match = cls.match(/^(\d+)\s*(.*)$/);
      if (match) {
        setCurrentGrade(match[1]);
        setCurrentParallel(match[2] || "");
      } else {
        setCurrentGrade(cls);
        setCurrentParallel("");
      }
    } else {
      setCurrentGrade("");
      setCurrentParallel("");
    }
  }, [state?.role, state?.email, state?.profile_type, state?.gender, state?.school, state?.class, userId]);

  useEffect(() => {
    fetch(`${API_BASE}/api/schools`)
      .then((res) => (res.ok ? res.json() : { schools: [] }))
      .then((data) => setSchools(data.schools || []))
      .catch(() => setSchools([]));
  }, []);

  const fetchChildren = useCallback(() => {
    if (!token || !id || isNaN(id)) return;
    setChildrenLoading(true);
    fetch(`${API_BASE}/api/users/children?userId=${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { children: [] }))
      .then((data) => setChildren(data.children || []))
      .catch(() => setChildren([]))
      .finally(() => setChildrenLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (currentProfileType === "parent" && token && id && !isNaN(id)) fetchChildren();
    else setChildren([]);
  }, [currentProfileType, token, id, fetchChildren]);

  const schoolOptions = (() => {
    const list = [...schools];
    if (currentSchool && currentSchool.trim() && !list.includes(currentSchool.trim())) {
      list.push(currentSchool.trim());
      list.sort((a, b) => a.localeCompare(b));
    }
    return list;
  })();

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
    const isEditingSelf = state?.username && user?.username && state.username === user.username;
    fetch(`${API_BASE}/api/users`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, role: newRole }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        setCurrentRole(newRole);
        setSuccess(t.roleUpdated);
        if (isEditingSelf) {
          refetchUser().then(() => {
            if (newRole === "user") navigate("/", { replace: true });
          });
        }
      })
      .catch(() => setError("Update failed"))
      .finally(() => setSavingRole(false));
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isNaN(id)) return;
    const nameVal = childName.trim();
    if (!nameVal) {
      setError(t.childName + " required");
      return;
    }
    setError("");
    setAddingChild(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: id,
          child_name: nameVal,
          ...(childStudentUsername.trim()
            ? childStudentUsername.trim().includes("@")
              ? { child_email: childStudentUsername.trim() }
              : { student_username: childStudentUsername.trim() }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setChildName("");
        setChildStudentUsername("");
        fetchChildren();
      } else {
        setError(data.error || "Failed to add child");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setAddingChild(false);
    }
  };

  const startEditChild = (c: { id: number; child_name: string; student_username?: string | null }) => {
    setEditingChildId(c.id);
    setEditChildName(c.child_name);
    setEditChildUsername(c.student_username || "");
  };

  const cancelEditChild = () => {
    setEditingChildId(null);
    setEditChildName("");
    setEditChildUsername("");
  };

  const handleSaveEditChild = async (childId: number) => {
    if (!token || isNaN(id)) return;
    setSavingEditChildId(childId);
    setError("");
    try {
      const body: { userId: number; childId: number; child_name: string; child_email?: string; student_username?: string } = {
        userId: id,
        childId,
        child_name: editChildName.trim(),
      };
      if (editChildUsername.trim()) {
        if (editChildUsername.trim().includes("@")) body.child_email = editChildUsername.trim();
        else body.student_username = editChildUsername.trim();
      } else {
        body.student_username = "";
      }
      const res = await fetch(`${API_BASE}/api/users/children`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        cancelEditChild();
        fetchChildren();
      } else {
        setError(data.error || "Failed to update child");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSavingEditChildId(null);
    }
  };

  const handleDeleteChild = async (childId: number) => {
    if (!token || isNaN(id)) return;
    setDeletingChildId(childId);
    try {
      const res = await fetch(`${API_BASE}/api/users/children?userId=${id}&childId=${childId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchChildren();
    } finally {
      setDeletingChildId(null);
    }
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
              aria-label={t.saveProfile}
            >
              <FaSave className="w-4 h-4 shrink-0" aria-hidden />
              <span>{savingEmail ? "..." : t.saveProfile}</span>
            </button>
          </div>
          <div className="mb-4">
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
          <div className="mb-4">
            <label htmlFor="edit-profile-type" className="block text-sm font-medium mb-1">
              {t.profileType}
            </label>
            <select
              id="edit-profile-type"
              value={currentProfileType}
              onChange={(e) => setCurrentProfileType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            >
              <option value="">{t.profileTypeNone}</option>
              <option value="student">{t.profileTypeStudent}</option>
              <option value="parent">{t.profileTypeParent}</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="edit-gender" className="block text-sm font-medium mb-1">{t.gender}</label>
            <select
              id="edit-gender"
              value={currentGender}
              onChange={(e) => setCurrentGender(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            >
              <option value="">{t.genderNone}</option>
              <option value="male">{t.genderMale}</option>
              <option value="female">{t.genderFemale}</option>
            </select>
          </div>
          {currentProfileType === "student" && (
            <div className="mb-6">
              <label htmlFor="edit-school" className="block text-sm font-medium mb-1">{t.school}</label>
              <select
                id="edit-school"
                value={currentSchool}
                onChange={(e) => setCurrentSchool(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border mb-2 ${
                  isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                }`}
              >
                <option value="">—</option>
                {schoolOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label htmlFor="edit-grade" className="block text-sm font-medium mb-1">{t.class}</label>
                  <input
                    id="edit-grade"
                    type="number"
                    min={1}
                    max={12}
                    value={currentGrade}
                    onChange={(e) => setCurrentGrade(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="edit-parallel" className="block text-sm font-medium mb-1">{t.parallel}</label>
                  <input
                    id="edit-parallel"
                    type="text"
                    value={currentParallel}
                    onChange={(e) => setCurrentParallel(e.target.value)}
                    maxLength={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                    }`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSavingSchoolClass(true);
                  setError("");
                  setSuccess("");
                  fetch(`${API_BASE}/api/users`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({
                    id,
                    profile_type: "student",
                    gender: currentGender === "male" || currentGender === "female" ? currentGender : null,
                    school: currentSchool.trim() || null,
                    class:
                        currentGrade.trim() || currentParallel.trim()
                          ? `${currentGrade.trim()}${currentParallel.trim() ? ` ${currentParallel.trim()}` : ""}`
                          : null,
                  }),
                  })
                    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                    .then(({ ok, data }) => {
                      if (ok) setSuccess(t.profileSaved);
                      else setError(data.error || "Update failed");
                    })
                    .catch(() => setError("Update failed"))
                    .finally(() => setSavingSchoolClass(false));
                }}
                disabled={savingSchoolClass}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
                aria-label={t.saveProfile}
              >
                <FaSave className="w-4 h-4 shrink-0" aria-hidden />
                <span>{savingSchoolClass ? "..." : t.saveProfile}</span>
              </button>
            </div>
          )}
          {currentProfileType === "parent" && (
            <>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSavingSchoolClass(true);
                    setError("");
                    setSuccess("");
                    fetch(`${API_BASE}/api/users`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({
                      id,
                      profile_type: "parent",
                      gender: currentGender === "male" || currentGender === "female" ? currentGender : null,
                      school: null,
                      class: null,
                    }),
                    })
                      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                      .then(({ ok, data }) => {
                        if (ok) setSuccess(t.profileSaved);
                        else setError(data.error || "Update failed");
                      })
                      .catch(() => setError("Update failed"))
                      .finally(() => setSavingSchoolClass(false));
                  }}
                  disabled={savingSchoolClass}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
                  aria-label={t.saveProfile}
                >
                  <FaSave className="w-4 h-4 shrink-0" aria-hidden />
                  <span>{savingSchoolClass ? "..." : t.saveProfile}</span>
                </button>
              </div>
              <div className={`mb-6 rounded-lg border p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-slate-700"}`}>
                <h3 className="text-sm font-semibold mb-3">{t.myChildren}</h3>
                {childrenLoading ? (
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>...</p>
                ) : (
                  <>
                    <ul className="space-y-2 mb-4">
                      {children.length === 0 ? (
                        <li className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          {t.noChildrenYet}
                        </li>
                      ) : (
                        children.map((c) => (
                          <li
                            key={c.id}
                            className={`py-2 px-3 rounded-lg ${isLight ? "bg-white border border-slate-200" : "bg-slate-700/50 border border-slate-600"}`}
                          >
                            {editingChildId === c.id ? (
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs font-medium mb-1">{t.childName}</label>
                                  <input
                                    type="text"
                                    value={editChildName}
                                    onChange={(e) => setEditChildName(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">{t.studentUsernameInPlatform}</label>
                                  <input
                                    type="text"
                                    value={editChildUsername}
                                    onChange={(e) => setEditChildUsername(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-lg border text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                                    placeholder={language === "bg" ? "напр. angori или email" : "e.g. angori or email"}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditChild(c.id)}
                                    disabled={savingEditChildId === c.id}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm disabled:opacity-50"
                                  >
                                    <FaEdit className="w-3.5 h-3.5" />
                                    {savingEditChildId === c.id ? "..." : (language === "bg" ? "Запази" : "Save")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditChild}
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-slate-400 text-sm"
                                  >
                                    {language === "bg" ? "Отказ" : "Cancel"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-sm flex items-center gap-2">
                                  {c.gender === "male" ? (
                                    <FaUserTie className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
                                  ) : c.gender === "female" ? (
                                    <FaHeart className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
                                  ) : (
                                    <FaUser className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
                                  )}
                                  <span className="font-medium">{c.child_name}</span>
                                  {(c.school && c.class) && (
                                    <span className={`ml-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                      {c.school} · {c.class}
                                    </span>
                                  )}
                                  {c.student_username && (
                                    <span className={`ml-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                      ({language === "bg" ? "свързан: " : "linked: "}{c.student_username})
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => startEditChild(c)}
                                    className="p-1.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                    aria-label={language === "bg" ? "Редактирай" : "Edit"}
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteChild(c.id)}
                                    disabled={deletingChildId === c.id}
                                    className="p-1.5 rounded text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                    aria-label={t.deleteChild}
                                  >
                                    <FaTrashAlt className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))
                      )}
                    </ul>
                    <form onSubmit={handleAddChild} className="space-y-3">
                      <div>
                        <label htmlFor="admin-child-name" className="block text-sm font-medium mb-1">{t.childName}</label>
                        <input
                          id="admin-child-name"
                          type="text"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                          }`}
                          placeholder={t.childName}
                        />
                      </div>
                      <div>
                        <label htmlFor="admin-child-student-username" className="block text-sm font-medium mb-1">{t.studentUsernameInPlatform}</label>
                        <input
                          id="admin-child-student-username"
                          type="text"
                          value={childStudentUsername}
                          onChange={(e) => setChildStudentUsername(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                          }`}
                          placeholder={language === "bg" ? "напр. angori или email@example.com" : "e.g. angori or email@example.com"}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingChild}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50"
                        aria-label={t.addChild}
                      >
                        <FaUserPlus className="w-4 h-4 shrink-0" aria-hidden />
                        <span>{addingChild ? "..." : t.addChild}</span>
                      </button>
                    </form>
                  </>
                )}
              </div>
            </>
          )}

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
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                  aria-label={t.saveProfile}
                >
                  <FaSave className="w-4 h-4 shrink-0" aria-hidden />
                  <span>{saving ? "..." : t.saveProfile}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setError(""); setNewPassword(""); setConfirmPassword(""); }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${isLight ? "border-slate-300 text-slate-700" : "border-slate-600 text-slate-300"}`}
                  aria-label={t.cancel}
                >
                  <FaTimes className="w-4 h-4 shrink-0" aria-hidden />
                  <span>{t.cancel}</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => { setShowPasswordForm(true); setError(""); setSuccess(""); }}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold border-2 mb-6 ${
                isLight ? "border-cyan-600 text-cyan-600 bg-white hover:bg-cyan-50" : "border-cyan-400 text-cyan-400 bg-slate-800 hover:bg-slate-700"
              }`}
              aria-label={t.changePassword}
            >
              <FaKey className="w-4 h-4 shrink-0" aria-hidden />
              <span>{t.changePassword}</span>
            </button>
          )}

          <hr className={`mb-4 ${isLight ? "border-slate-200" : "border-slate-700"}`} />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50"
            aria-label={t.deleteUser}
          >
            <FaTrashAlt className="w-4 h-4 shrink-0" aria-hidden />
            <span>{deleting ? "..." : t.deleteUser}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserEdit;
