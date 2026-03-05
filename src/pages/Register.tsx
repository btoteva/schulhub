import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

const Register: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { offline } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [parallel, setParallel] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLight = theme === "light";

  useEffect(() => {
    if (offline) return;
    fetch(`${API_BASE}/api/schools`)
      .then((res) => (res.ok ? res.json() : { schools: [] }))
      .then((data) => setSchools(data.schools || []))
      .catch(() => setSchools([]));
  }, [offline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          school: school.trim() || null,
          class:
            grade.trim() || parallel.trim()
              ? `${grade.trim()}${parallel.trim() ? ` ${parallel.trim()}` : ""}`
              : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        navigate("/login");
        return;
      }
      const msg = data.error;
      if (msg === "Email already registered") setError(t.emailAlreadyRegistered);
      else if (msg === "Invalid email format") setError(t.invalidEmail);
      else setError(msg || (language === "bg" ? "Грешка при регистрация" : language === "de" ? "Registrierung fehlgeschlagen" : "Registration failed"));
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  if (offline) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
        <div className={`w-full max-w-sm rounded-2xl shadow-xl p-6 ${isLight ? "bg-white border border-slate-200" : "bg-slate-800 border border-slate-700"}`}>
          <h1 className="text-xl font-bold mb-4 text-center">{t.register}</h1>
          <p className={isLight ? "text-slate-700 mb-4" : "text-slate-300 mb-4"}>
            {language === "bg"
              ? "Офлайн режим – регистрацията не е налична без работещ сървър."
              : language === "de"
              ? "Offline-Modus – Registrierung ist ohne laufenden Server nicht verfügbar."
              : "Offline mode – registration is not available without a running server."}
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className={isLight ? "text-slate-500 hover:underline" : "text-slate-400 hover:underline"}>
              ← {t.home}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
      <div className={`w-full max-w-sm rounded-2xl shadow-xl p-6 ${isLight ? "bg-white border border-slate-200" : "bg-slate-800 border border-slate-700"}`}>
        <h1 className="text-xl font-bold mb-4 text-center">{t.register}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium mb-1">
              {t.username}
            </label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={2}
              maxLength={50}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1">
              {t.email}
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1">
              {t.password}
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            />
          </div>
          <div>
            <label htmlFor="reg-school" className="block text-sm font-medium mb-1">
              {t.school}
            </label>
            <select
              id="reg-school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            >
              <option value="">—</option>
              {schools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-grade" className="block text-sm font-medium mb-1">
                {t.class}
              </label>
              <input
                id="reg-grade"
                type="number"
                min={1}
                max={12}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                }`}
              />
            </div>
            <div>
              <label htmlFor="reg-parallel" className="block text-sm font-medium mb-1">
                {t.parallel}
              </label>
              <input
                id="reg-parallel"
                type="text"
                value={parallel}
                onChange={(e) => setParallel(e.target.value)}
                maxLength={2}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                }`}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
          >
            {submitting ? "..." : t.registerButton}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className={isLight ? "text-cyan-600 hover:underline" : "text-cyan-400 hover:underline"}>
            ← {t.login}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/" className={isLight ? "text-slate-500 hover:underline" : "text-slate-400 hover:underline"}>
            {t.home}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
