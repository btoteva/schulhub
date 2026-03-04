import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isLight = theme === "light";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username.trim(), password);
    setSubmitting(false);
    if (result.ok) {
      navigate("/about");
    } else {
      setError(result.error || (language === "bg" ? "Грешка при вход" : language === "de" ? "Anmeldung fehlgeschlagen" : "Login failed"));
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${isLight ? "bg-slate-100" : "bg-slate-900"}`}>
      <div className={`w-full max-w-sm rounded-2xl shadow-xl p-6 ${isLight ? "bg-white border border-slate-200" : "bg-slate-800 border border-slate-700"}`}>
        <h1 className="text-xl font-bold mb-4 text-center">{t.login}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              {t.usernameOrEmail}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className={`w-full px-3 py-2 rounded-lg border ${
                isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"
              }`}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              {t.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
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
            {submitting ? "..." : t.loginButton}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/register" className={isLight ? "text-cyan-600 hover:underline" : "text-cyan-400 hover:underline"}>
            {t.register}
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/" className={isLight ? "text-slate-500 hover:underline" : "text-slate-400 hover:underline"}>
            ← {t.home}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
