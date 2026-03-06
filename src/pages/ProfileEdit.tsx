import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaSave, FaKey, FaTimes, FaCrown } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

const ProfileEdit: React.FC = () => {
  const { user, token, loading, refetchUser } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [profileType, setProfileType] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [school, setSchool] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [grade, setGrade] = useState("");
  const [parallel, setParallel] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successType, setSuccessType] = useState<"profile" | "password" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // NOTE: Hooks must not be conditional. These effects are safe when user is null.
  useEffect(() => {
    if (!user) return;
    if (user.role === "superadmin") return;
    setProfileType(user.profile_type ?? "");
    setGender(user.gender ?? "");
    setSchool(user.school ?? "");
    const cls = user.class ?? "";
    if (cls) {
      const match = cls.match(/^(\d+)\s*(.*)$/);
      if (match) {
        setGrade(match[1]);
        setParallel(match[2] || "");
      } else {
        setGrade(cls);
        setParallel("");
      }
    } else {
      setGrade("");
      setParallel("");
    }
  }, [user?.role, user?.profile_type, user?.gender, user?.school, user?.class]);

  useEffect(() => {
    fetch(`${API_BASE}/api/schools`)
      .then((res) => (res.ok ? res.json() : { schools: [] }))
      .then((data) => setSchools(data.schools || []))
      .catch(() => setSchools([]));
  }, []);

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

  if (user.role === "superadmin") {
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
          <div className={`rounded-xl border p-6 flex flex-col items-center justify-center text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
            <FaCrown className={`w-16 h-16 mb-4 ${isLight ? "text-amber-500" : "text-amber-400"}`} aria-hidden />
            <h1 className="text-xl font-bold mb-2">{t.superUser}</h1>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {language === "bg"
                ? "Профилът на суперпотребителя не се редактира."
                : language === "de"
                  ? "Das Supernutzer-Profil wird nicht bearbeitet."
                  : "Super user profile is not editable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const schoolOptions = (() => {
    const list = [...schools];
    if (school && school.trim() && !list.includes(school.trim())) {
      list.push(school.trim());
      list.sort((a, b) => a.localeCompare(b));
    }
    return list;
  })();

  const handleSaveProfile = async () => {
    if (user?.role === "superadmin") return;
    setError("");
    setSuccessType(null);
    setSubmittingProfile(true);
    try {
      const combinedClass =
        grade.trim() || parallel.trim()
          ? `${grade.trim()}${parallel.trim() ? ` ${parallel.trim()}` : ""}`
          : "";
      const body: { profile_type?: string | null; school?: string | null; class?: string | null; gender?: string | null } = {
        profile_type: profileType === "student" || profileType === "parent" ? profileType : null,
        school: profileType === "student" ? (school.trim() || null) : null,
        class: profileType === "student" ? (combinedClass || null) : null,
        gender: gender === "male" || gender === "female" ? gender : null,
      };
      const res = await fetch(`${API_BASE}/api/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccessType("profile");
        refetchUser();
      } else {
        setError(data.error || "Error");
      }
    } catch (e) {
      setError((e as Error).message || "Network error");
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessType(null);
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
        setSuccessType("password");
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

          <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="profile-type" className="block text-sm font-medium mb-1">{t.profileType}</label>
                <select
                  id="profile-type"
                  value={profileType}
                  onChange={(e) => setProfileType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                >
                  <option value="">{t.profileTypeNone}</option>
                  <option value="student">{t.profileTypeStudent}</option>
                  <option value="parent">{t.profileTypeParent}</option>
                </select>
              </div>
              <div>
                <label htmlFor="profile-gender" className="block text-sm font-medium mb-1">{t.gender}</label>
                <select
                  id="profile-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                >
                  <option value="">{t.genderNone}</option>
                  <option value="male">{t.genderMale}</option>
                  <option value="female">{t.genderFemale}</option>
                </select>
              </div>
              {profileType === "student" && (
                <>
                  <div>
                    <label htmlFor="profile-school" className="block text-sm font-medium mb-1">{t.school}</label>
                    <select
                      id="profile-school"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                    >
                      <option value="">—</option>
                      {schoolOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="profile-grade" className="block text-sm font-medium mb-1">{t.class}</label>
                      <input
                        id="profile-grade"
                        type="number"
                        min={1}
                        max={12}
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-parallel" className="block text-sm font-medium mb-1">{t.parallel}</label>
                      <input
                        id="profile-parallel"
                        type="text"
                        value={parallel}
                        onChange={(e) => setParallel(e.target.value)}
                        maxLength={2}
                        className={`w-full px-3 py-2 rounded-lg border ${isLight ? "border-slate-300 bg-white text-slate-900" : "border-slate-600 bg-slate-700 text-white"}`}
                      />
                    </div>
                  </div>
                </>
              )}
              {profileType === "parent" && (
                <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                  {language === "bg" ? "Добавяйте и преглеждайте децата си от страницата „Моите деца“." : language === "de" ? "Fügen Sie Ihre Kinder hinzu und sehen Sie sie auf der Seite „Meine Kinder“." : "Add and view your children on the My children page."}
                  <Link to="/my-children?edit=1" className="ml-1 font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                    {t.myChildren} →
                  </Link>
                </p>
              )}
              {user.role !== "superadmin" && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={submittingProfile}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
                    aria-label={t.saveProfile}
                  >
                    <FaSave className="w-4 h-4 shrink-0" aria-hidden />
                    <span>{submittingProfile ? "..." : t.saveProfile}</span>
                  </button>
                  {successType === "profile" && <p className="mt-2 text-green-600 dark:text-green-400 text-sm">{t.profileSaved}</p>}
                </>
              )}
              {user.role === "superadmin" && (
                <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                  {language === "bg" ? "Типът профил и училище/клас се записват само за потребители от базата." : language === "de" ? "Profiltyp und Schule/Klasse werden nur für Benutzer in der Datenbank gespeichert." : "Profile type and school/class are saved only for database users."}
                </p>
              )}
            </div>

          {showPasswordForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {successType === "password" && <p className="text-green-600 dark:text-green-400 text-sm">{t.passwordChanged}</p>}
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
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                  aria-label={t.saveProfile}
                >
                  <FaSave className="w-4 h-4 shrink-0" aria-hidden />
                  <span>{submitting ? "..." : t.saveProfile}</span>
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
            <>
              {successType === "password" && <p className="mb-4 text-green-600 dark:text-green-400 text-sm">{t.passwordChanged}</p>}
              {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
              <p className={`mb-4 text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {language === "bg" ? "За да смените паролата си, натиснете бутона по-долу." : language === "de" ? "Um Ihr Passwort zu ändern, klicken Sie auf die Schaltfläche unten." : "To change your password, click the button below."}
              </p>
              <button
                type="button"
                onClick={() => { setShowPasswordForm(true); setError(""); setSuccessType(null); }}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold border-2 ${isLight ? "border-cyan-600 text-cyan-600 bg-white hover:bg-cyan-50" : "border-cyan-400 text-cyan-400 bg-slate-800 hover:bg-slate-700"}`}
                aria-label={t.changePassword}
              >
                <FaKey className="w-4 h-4 shrink-0" aria-hidden />
                <span>{t.changePassword}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
