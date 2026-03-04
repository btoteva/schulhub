import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

const ProfileEdit: React.FC = () => {
  const { user, token, loading } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>
          {language === "bg" ? "Зареждане..." : language === "de" ? "Laden..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPassword.length < 6) {
      setError(language === "bg" ? "Новата парола трябва да е поне 6 символа." : language === "de" ? "Das neue Passwort muss mindestens 6 Zeichen haben." : "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(language === "bg" ? "Новата парола и потвърждението не съвпадат." : language === "de" ? "Neues Passwort und Bestätigung stimmen nicht überein." : "New password and confirmation do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
        setShowPasswordForm(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || (res.status === 403 ? (language === "bg" ? "Паролата на супер администратора се сменя в настройките." : language === "de" ? "Superadministrator-Passwort wird in den Einstellungen geändert." : "Super admin password is managed in environment.") : "Error"));
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Link
          to="/profile"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.profile}
        </Link>
        <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h1 className="text-xl font-bold mb-4">{t.editProfile}</h1>

          {showPasswordForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && <p className="text-green-600 dark:text-green-400 text-sm">{t.passwordChanged}</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-1">{t.newPassword}</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">{t.confirmPassword}</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? "..." : t.saveProfile}
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
            <>
              {success && <p className="mb-4 text-green-600 dark:text-green-400 text-sm">{t.passwordChanged}</p>}
              {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
              <p className={`mb-4 text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {language === "bg" ? "За да смените паролата си, натиснете бутона по-долу." : language === "de" ? "Um Ihr Passwort zu ändern, klicken Sie auf die Schaltfläche unten." : "To change your password, click the button below."}
              </p>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(true); setError(""); setSuccess(false); }}
                className={`w-full py-3 px-4 rounded-lg font-semibold border-2 ${isLight ? "border-cyan-600 text-cyan-600 bg-white hover:bg-cyan-50" : "border-cyan-400 text-cyan-400 bg-slate-800 hover:bg-slate-700"}`}
              >
                {t.changePassword}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
