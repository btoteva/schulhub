import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBook, FaGlobe } from "react-icons/fa";
import FontSettings from "./FontSettings";
import { useLanguage, Language } from "../contexts/LanguageContext";

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
        className="px-3 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
        title="Language"
      >
        <span className="text-lg">{currentLang?.flag}</span>
        <FaGlobe className="text-sm" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 py-2 z-[300]">
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
                  : "text-gray-300 hover:bg-gray-800"
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
  const { t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b border-slate-700/50 shadow-2xl backdrop-blur-sm relative z-[200]">
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
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              {t.home}
            </Link>

            <a
              href="#"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-semibold text-sm uppercase tracking-wider"
            >
              {t.aboutUs}
            </a>

            <div className="border-l border-gray-700 pl-4 flex items-center gap-2">
              <LanguageSelector />
              <FontSettings />
            </div>
          </nav>

          <button className="md:hidden text-white hover:text-yellow-400 transition-colors">
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
    </header>
  );
};

export default Header;
