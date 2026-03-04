import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBook, FaGlobe, FaSun, FaMoon, FaUser, FaUserEdit, FaUsers, FaSignOutAlt } from "react-icons/fa";
import FontSettings from "./FontSettings";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; flag: string; name: string }[] = [
    { code: "bg", flag: "🇧🇬", name: "Български" },
    { code: "en", flag: "🇬🇧", name: "English" },
    { code: "de", flag: "🇩🇪", name: "Deutsch" },
  ];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center gap-2"
        title="Language"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <FaGlobe className="text-sm" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-slate-200 dark:border-gray-700 py-2 z-[300]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                language === lang.code
                  ? "bg-green-600 text-white"
                  : "text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border-b border-slate-300 dark:border-slate-700/50 shadow-2xl backdrop-blur-sm relative z-[200]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <img
              src="https://i.imgur.com/QSWSGYz.png"
              alt="ShulHub Logo"
              className="h-10 w-10 drop-shadow-lg group-hover:scale-110 transition-transform"
            />
            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              ShulHub
            </h1>
            <FaBook className="text-3xl text-blue-400 drop-shadow-lg group-hover:scale-110 transition-transform" />
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link
              to="/"
              className="text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              {t.home}
            </Link>

            <Link
              to="/about"
              className="text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              {t.aboutUs}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <FaUser className="w-5 h-5" />
                  <span>{user.username}</span>
                  <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[300]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FaUser className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                      {t.profile}
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FaUserEdit className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                      {t.editProfile}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaUsers className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                        {t.manageUsers}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FaSignOutAlt className="w-4 h-4 text-slate-500 dark:text-gray-400 shrink-0" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
              >
                {t.login}
              </Link>
            )}
            <a
              href="https://codepen.io/btoteva/full/xbOGgwE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider flex items-center"
              aria-label="Main Menu"
              title="Main Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-6 h-6 fill-current"
              >
                <path d="M100 34.2c-.4-2.6-3.3-4-5.3-5.3-3.6-2.4-7.1-4.7-10.7-7.1-8.5-5.7-17.1-11.4-25.6-17.1-2-1.3-4-2.7-6-4-1.4-1-3.3-1-4.8 0-5.7 3.8-11.5 7.7-17.2 11.5L5.2 29C3 30.4.1 31.8 0 34.8c-.1 3.3 0 6.7 0 10v16c0 2.9-.6 6.3 2.1 8.1 6.4 4.4 12.9 8.6 19.4 12.9 8 5.3 16 10.7 24 16 2.2 1.5 4.4 3.1 7.1 1.3 2.3-1.5 4.5-3 6.8-4.5 8.9-5.9 17.8-11.9 26.7-17.8l9.9-6.6c.6-.4 1.3-.8 1.9-1.3 1.4-1 2-2.4 2-4.1V37.3c.1-1.1.2-2.1.1-3.1 0-.1 0 .2 0 0zM54.3 12.3 88 34.8 73 44.9 54.3 32.4zm-8.6 0v20L27.1 44.8 12 34.8zM8.6 42.8 19.3 50 8.6 57.2zm37.1 44.9L12 65.2l15-10.1 18.6 12.5v20.1zM50 60.2 34.8 50 50 39.8 65.2 50zm4.3 27.5v-20l18.6-12.5 15 10.1zm37.1-30.5L80.7 50l10.8-7.2z"></path>
              </svg>
            </a>

            <div className="border-l border-slate-300 dark:border-gray-700 pl-4 flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 hover:text-amber-500 hover:bg-slate-200 dark:text-gray-300 dark:hover:text-amber-400 dark:hover:bg-slate-700 transition-colors"
                title={theme === "dark" ? "Светла тема" : "Тъмна тема"}
                aria-label={theme === "dark" ? "Светла тема" : "Тъмна тема"}
              >
                {theme === "dark" ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </button>
              <LanguageSelector />
              <FontSettings />
            </div>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-800 dark:text-white hover:text-yellow-500 dark:hover:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors touch-manipulation"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={t.menu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay + panel */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[210] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-0 right-0 w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl z-[220] md:hidden flex flex-col min-h-screen px-4 pt-14 pb-6 overflow-y-auto border-l border-slate-200 dark:border-slate-700"
            style={{ minHeight: "100dvh", height: "100dvh" }}
            aria-label={t.menu}
          >
            <button
              type="button"
              className="absolute top-3 right-3 p-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={language === "bg" ? "Затвори" : language === "de" ? "Schließen" : "Close"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Link
              to="/"
              className="py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              to="/about"
              className="py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.aboutUs}
            </Link>
            {user ? (
              <>
                <div className="flex items-center gap-2 py-3 border-b border-slate-200 dark:border-slate-700">
                  <FaUser className="w-5 h-5 text-slate-600 dark:text-gray-400" />
                  <span className="font-semibold text-slate-800 dark:text-white">{user.username}</span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser className="w-5 h-5 text-slate-500 dark:text-gray-400 shrink-0" />
                  {t.profile}
                </Link>
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-3 py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserEdit className="w-5 h-5 text-slate-500 dark:text-gray-400 shrink-0" />
                  {t.editProfile}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/users"
                    className="flex items-center gap-3 py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUsers className="w-5 h-5 text-slate-500 dark:text-gray-400 shrink-0" />
                    {t.manageUsers}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 py-3 text-left w-full text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
                >
                  <FaSignOutAlt className="w-5 h-5 text-slate-500 dark:text-gray-400 shrink-0" />
                  {t.logout}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.login}
              </Link>
            )}
            <a
              href="https://codepen.io/btoteva/full/xbOGgwE"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 text-slate-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-5 h-5 fill-current">
                <path d="M100 34.2c-.4-2.6-3.3-4-5.3-5.3-3.6-2.4-7.1-4.7-10.7-7.1-8.5-5.7-17.1-11.4-25.6-17.1-2-1.3-4-2.7-6-4-1.4-1-3.3-1-4.8 0-5.7 3.8-11.5 7.7-17.2 11.5L5.2 29C3 30.4.1 31.8 0 34.8c-.1 3.3 0 6.7 0 10v16c0 2.9-.6 6.3 2.1 8.1 6.4 4.4 12.9 8.6 19.4 12.9 8 5.3 16 10.7 24 16 2.2 1.5 4.4 3.1 7.1 1.3 2.3-1.5 4.5-3 6.8-4.5 8.9-5.9 17.8-11.9 26.7-17.8l9.9-6.6c.6-.4 1.3-.8 1.9-1.3 1.4-1 2-2.4 2-4.1V37.3c.1-1.1.2-2.1.1-3.1 0-.1 0 .2 0 0zM54.3 12.3 88 34.8 73 44.9 54.3 32.4zm-8.6 0v20L27.1 44.8 12 34.8zM8.6 42.8 19.3 50 8.6 57.2zm37.1 44.9L12 65.2l15-10.1 18.6 12.5v20.1zM50 60.2 34.8 50 50 39.8 65.2 50zm4.3 27.5v-20l18.6-12.5 15 10.1zm37.1-30.5L80.7 50l10.8-7.2z"></path>
              </svg>
              {t.menu}
            </a>
            <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { toggleTheme(); }}
                className="p-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                title={theme === "dark" ? "Светла тема" : "Тъмна тема"}
              >
                {theme === "dark" ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
              </button>
              <LanguageSelector />
              <FontSettings />
            </div>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
