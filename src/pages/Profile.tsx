import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Profile: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>{language === "bg" ? "Зареждане..." : language === "de" ? "Laden..." : "Loading..."}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleLabel =
    user.role === "superadmin" ? t.roleSuperAdmin : user.role === "admin" ? t.roleAdmin : t.roleUser;

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.home}
        </Link>
        <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
          <h1 className="text-xl font-bold mb-4">{t.profile}</h1>
          <p className={`mb-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            {t.loggedInAs} <strong className={isLight ? "text-slate-900" : "text-white"}>{user.username}</strong>
          </p>
          <p className={`text-sm mb-6 ${isLight ? "text-slate-500" : "text-slate-500"}`}>{roleLabel}</p>
          <Link
            to="/profile/edit"
            className={`inline-block mb-4 mr-3 px-4 py-2 rounded-lg font-medium ${
              isLight ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            {t.editProfile}
          </Link>
          {isAdmin && (
            <Link
              to="/admin/users"
              className={`inline-block mb-4 px-4 py-2 rounded-lg font-medium ${
                isLight ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"
              }`}
            >
              {t.manageUsers}
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-medium"
          >
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
