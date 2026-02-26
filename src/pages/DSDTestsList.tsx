import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import ScrollToTopButton from "../components/ScrollToTopButton";
import DSDTestsListContent from "../components/DSDTestsListContent";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const DSDTestsList: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const navigate = useNavigate();

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className={`inline-flex items-center gap-2 mb-8 ${isLight ? "text-amber-600 hover:text-amber-700" : "text-amber-400 hover:text-amber-300"}`}
        >
          <FaArrowLeft />
          {language === "bg" ? "Начало" : language === "de" ? "Start" : "Home"}
        </button>

        <DSDTestsListContent isLight={isLight} language={language} />
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default DSDTestsList;
