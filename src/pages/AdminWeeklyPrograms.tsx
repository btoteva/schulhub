import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

type ProgramRow = { school: string; class: string; data: { days: unknown[] }; updated_at?: string };

const AdminWeeklyPrograms: React.FC = () => {
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [school, setSchool] = useState("");
  const [classVal, setClassVal] = useState("");
  const [dataJson, setDataJson] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPrograms = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/api/admin/weekly-programs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => setPrograms(data.programs || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (token && isAdmin) fetchPrograms();
    else setLoading(false);
  }, [token, isAdmin, fetchPrograms]);

  useEffect(() => {
    if (!loading && programs.length === 0 && !dataJson) {
      setSchool("I Езикова гимназия");
      setClassVal("9 д");
      try {
        // Lazy load default data from existing JSON on the frontend side
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const weeklyData = require("../data/weekly-program.json");
        setDataJson(JSON.stringify(weeklyData, null, 2));
      } catch {
        // fallback – keep dataJson empty
      }
    }
  }, [loading, programs.length, dataJson]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const schoolVal = school.trim();
    const classValTrim = classVal.trim();
    if (!schoolVal || !classValTrim) {
      setError("School and class are required.");
      return;
    }
    let dataObj: unknown;
    try {
      dataObj = JSON.parse(dataJson || "{}");
    } catch {
      setError("Invalid JSON in program data.");
      return;
    }
    if (dataObj == null || typeof dataObj !== "object") {
      setError("Data must be a JSON object (e.g. { \"days\": [...] }).");
      return;
    }
    setSaving(true);
    fetch(`${API_BASE}/api/admin/weekly-programs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ school: schoolVal, class: classValTrim, data: dataObj }),
    })
      .then((res) => res.json().then((d) => ({ ok: res.ok, data: d })))
      .then(({ ok, data }) => {
        if (ok) {
          setSuccess("Saved.");
          fetchPrograms();
        } else {
          setError(data.error || "Save failed");
        }
      })
      .catch(() => setError("Save failed"))
      .finally(() => setSaving(false));
  };

  const loadForEdit = (p: ProgramRow) => {
    setSchool(p.school);
    setClassVal(p.class);
    setDataJson(JSON.stringify(p.data, null, 2));
    setError("");
    setSuccess("");
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

  const defaultDataJson = JSON.stringify(
    { days: [{ day: "Понеделник", dayShort: "Пн", items: [{ timeFrom: "08:00", timeTo: "08:45", title: "", description: "" }] }] },
    null,
    2
  );

  const handleNewProgram = () => {
    setSchool("");
    setClassVal("");
    setDataJson(defaultDataJson);
    setError("");
    setSuccess("");
  };

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/profile"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.profile}
        </Link>
        <h1 className="text-2xl font-bold mb-4">{t.editWeeklyProgram}</h1>
        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
        {success && <p className="mb-4 text-green-600 dark:text-green-400 text-sm">{success}</p>}

        <form onSubmit={handleSave} className={`rounded-xl border p-6 mb-8 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-lg font-semibold">{t.addWeeklyProgram}</h2>
            <button
              type="button"
              onClick={handleNewProgram}
              className={`px-4 py-2 rounded-lg border font-medium ${isLight ? "border-slate-300 text-slate-700 hover:bg-slate-50" : "border-slate-600 text-slate-300 hover:bg-slate-700"}`}
            >
              {t.newProgram}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.school}</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.class}</label>
              <input
                type="text"
                value={classVal}
                onChange={(e) => setClassVal(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">JSON data (days array with day, dayShort, items)</label>
            <textarea
              value={dataJson}
              onChange={(e) => setDataJson(e.target.value)}
              placeholder={defaultDataJson}
              rows={12}
              className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
          >
            {saving ? "..." : t.saveProfile}
          </button>
        </form>

        <div className={`rounded-xl border overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h2 className="text-lg font-semibold px-4 py-3 border-b border-slate-200 dark:border-slate-700">Existing programs</h2>
          {loading ? (
            <p className="p-4 text-slate-500">...</p>
          ) : programs.length === 0 ? (
            <p className="p-4 text-slate-500">No programs yet. Add one above.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {programs.map((p, i) => (
                <li key={`${p.school}-${p.class}-${i}`} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium">{p.school} · {p.class}</span>
                  <button
                    type="button"
                    onClick={() => loadForEdit(p)}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm font-medium"
                  >
                    {t.edit}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWeeklyPrograms;
