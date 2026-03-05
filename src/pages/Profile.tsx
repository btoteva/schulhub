import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaUser, FaUserCog, FaCrown } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const Profile: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
    user.role === "superadmin" ? t.superUser : user.role === "admin" ? t.roleAdmin : t.roleUser;
  const RoleIcon = user.role === "superadmin" ? FaCrown : user.role === "admin" ? FaUserCog : FaUser;
  const isSuperAdmin = user.role === "superadmin";

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
          <p className={`text-sm mb-1 flex items-center gap-2 ${isLight ? "text-slate-500" : "text-slate-500"}`}>
            <RoleIcon
              className={user.role === "superadmin" ? "text-amber-500" : user.role === "admin" ? "text-cyan-500" : "text-slate-500"}
              aria-hidden
            />
            <span>{roleLabel}</span>
          </p>
          {!isSuperAdmin && user.gender && (
            <p className={`text-sm mb-1 ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              {t.gender}: {user.gender === "female" ? t.genderFemale : user.gender === "male" ? t.genderMale : user.gender}
            </p>
          )}
          {!isSuperAdmin && user.profile_type && (
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              {t.profileType}: {user.profile_type === "student" ? t.profileTypeStudent : user.profile_type === "parent" ? t.profileTypeParent : user.profile_type}
            </p>
          )}
          {user.profile_type === "student" && (user.parent_username != null || user.parent_gender != null) && (
            <p className={`text-sm font-medium mt-2 mb-2 px-3 py-2 rounded-lg ${isLight ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-amber-900/20 text-amber-200 border border-amber-700"}`}>
              {user.parent_gender === "female" ? t.momIsHere : user.parent_gender === "male" ? t.dadIsHere : t.parentIsHere}
            </p>
          )}
          {!isSuperAdmin && user.profile_type === "student" && (user.school || user.class) && (
            <p className={`text-sm mb-6 ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              {t.school}: {user.school || "—"} · {t.class}: {user.class || "—"}
            </p>
          )}
          {!isSuperAdmin && user.profile_type === "parent" && (
            <p className="mb-6">
              <Link to="/my-children" className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline">
                {t.myChildren} →
              </Link>
            </p>
          )}
          {(!isSuperAdmin && (!user.profile_type || (user.profile_type === "student" && !user.school && !user.class))) && <div className="mb-6" />}
          {isSuperAdmin && <div className="mb-6" />}
          {!isSuperAdmin && (
            <Link
              to="/profile/edit"
              className={`inline-block mb-4 mr-3 px-4 py-2 rounded-lg font-medium ${
                isLight ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"
              }`}
            >
              {t.editProfile}
            </Link>
          )}
          {isAdmin && (
            <>
              <Link
                to="/admin/users"
                className={`inline-block mb-4 mr-3 px-4 py-2 rounded-lg font-medium ${
                  isLight ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white"
                }`}
              >
                {t.manageUsers}
              </Link>
              <Link
                to="/admin/weekly-programs"
                className={`inline-block mb-4 px-4 py-2 rounded-lg font-medium ${
                  isLight ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"
                }`}
              >
                {t.editWeeklyProgram}
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
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
