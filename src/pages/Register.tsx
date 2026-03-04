import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

const Register: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLight = theme === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), email: email.trim().toLowerCase(), password }),
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
