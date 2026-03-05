import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaCalendarAlt, FaUserPlus, FaTrashAlt, FaEdit } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

type ChildRow = { id: number; child_name: string; school?: string | null; class?: string | null; student_username?: string | null; created_at?: string };

const MyChildren: React.FC = () => {
  const { user, token, loading } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [childName, setChildName] = useState("");
  const [studentUsername, setStudentUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [savingEditId, setSavingEditId] = useState<number | null>(null);

  const fetchChildren = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/me/children`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { children: [] }))
      .then((data) => setChildren(data.children || []))
      .catch(() => setChildren([]))
      .finally(() => setLoadingList(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    fetchChildren();
  }, [token, fetchChildren]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameVal = childName.trim();
    if (!nameVal) {
      setError(language === "bg" ? "Въведете име на детето." : language === "de" ? "Name des Kindes eingeben." : "Enter child name.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/me/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          child_name: nameVal,
          ...(studentUsername.trim()
            ? studentUsername.trim().includes("@")
              ? { child_email: studentUsername.trim() }
              : { student_username: studentUsername.trim() }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setChildName("");
        setStudentUsername("");
        fetchChildren();
      } else {
        setError(data.error || "Error");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: ChildRow) => {
    setEditingId(c.id);
    setEditName(c.child_name);
    setEditUsername(c.student_username || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditUsername("");
  };

  const handleSaveEdit = async (childId: number) => {
    setSavingEditId(childId);
    setError("");
    try {
      const body: { child_name: string; child_email?: string; student_username?: string } = { child_name: editName.trim() };
      if (editUsername.trim()) {
        if (editUsername.trim().includes("@")) body.child_email = editUsername.trim();
        else body.student_username = editUsername.trim();
      } else {
        body.student_username = "";
      }
      const res = await fetch(`${API_BASE}/api/me/children?id=${childId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        cancelEdit();
        fetchChildren();
      } else {
        setError(data.error || "Error");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSavingEditId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/me/children?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchChildren();
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>{language === "bg" ? "Зареждане..." : "Loading..."}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profile_type !== "parent") {
    return (
      <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Link to="/profile" className={`inline-flex items-center gap-2 mb-6 font-semibold ${isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}>
            ← {t.profile}
          </Link>
          <p className={isLight ? "text-slate-600" : "text-slate-400"}>
            {language === "bg" ? "Тази страница е за профил „Родител“. Изберете „Родител“ в редакция на профила." : "This page is for Parent profile. Select Parent in profile edit."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
        >
          ← {t.home}
        </Link>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaUserPlus className="text-cyan-500" />
          {t.myChildren}
        </h1>

        <div className={`rounded-xl border p-4 mb-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h2 className="font-semibold mb-3">{t.addChild}</h2>
          <form onSubmit={handleAddChild} className="space-y-3">
            {error && !editingId && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1">{t.childName}</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                placeholder={language === "bg" ? "Име" : "Name"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.studentUsernameInPlatform}</label>
              <input
                type="text"
                value={studentUsername}
                onChange={(e) => setStudentUsername(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                placeholder={language === "bg" ? "напр. angori или email@example.com" : "e.g. angori or email@example.com"}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
              aria-label={t.addChild}
            >
              <FaUserPlus className="w-4 h-4 shrink-0" aria-hidden />
              <span>{submitting ? "..." : t.addChild}</span>
            </button>
          </form>
        </div>

        <div className={`rounded-xl border ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h2 className="font-semibold p-4 border-b border-slate-200 dark:border-slate-600">{t.myChildren}</h2>
          {loadingList ? (
            <p className="p-4 text-slate-500">...</p>
          ) : children.length === 0 ? (
            <p className={`p-4 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{t.noChildrenYet}</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-600">
              {children.map((c) => (
                <li key={c.id} className="p-4">
                  {editingId === c.id ? (
                    <div className="space-y-3">
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <div>
                        <label className="block text-sm font-medium mb-1">{t.childName}</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">{t.studentUsernameInPlatform}</label>
                        <input
                          type="text"
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                          placeholder={language === "bg" ? "напр. angori или email" : "e.g. angori or email"}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(c.id)}
                          disabled={savingEditId === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm disabled:opacity-50"
                        >
                          <FaEdit className="w-4 h-4 shrink-0" />
                          {savingEditId === c.id ? "..." : (language === "bg" ? "Запази" : "Save")}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-400 text-slate-600 dark:text-slate-300 text-sm"
                        >
                          {language === "bg" ? "Отказ" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-medium">{c.child_name}</span>
                          {(c.school && c.class) && (
                            <span className={`ml-2 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                              {c.school} · {c.class}
                            </span>
                          )}
                          {c.student_username && (
                            <span className={`ml-2 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                              ({language === "bg" ? "свързан: " : "linked: "}{c.student_username})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-400 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
                            aria-label={language === "bg" ? "Редактирай" : "Edit"}
                          >
                            <FaEdit className="w-4 h-4 shrink-0" />
                            <span>{language === "bg" ? "Редактирай" : "Edit"}</span>
                          </button>
                          <Link
                            to={`/weekly-program?childId=${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-500/30"
                          >
                            <FaCalendarAlt /> {t.weeklyProgramForChild}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            disabled={deletingId === c.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50 text-sm"
                            aria-label={t.deleteChild}
                          >
                            <FaTrashAlt className="w-4 h-4 shrink-0" aria-hidden />
                            <span>{t.deleteChild}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyChildren;
