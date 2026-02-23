import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import testsListData from "../data/dsd-tests-list.json";

const DSDTestsList: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const tests = testsListData as Array<{
    id: string;
    title: string;
    titleBg: string;
    description: string;
    descriptionBg: string;
    available: boolean;
    route: string;
  }>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8"
        >
          <FaArrowLeft />
          {language === "bg" ? "Начало" : language === "de" ? "Start" : "Home"}
        </button>

        <header className="mb-12">
          <h1 className="text-3xl font-bold text-amber-400">
            {language === "bg" ? "DSD I – Тестове за подготовка" : language === "de" ? "DSD I – Prüfungsvorbereitung" : "DSD I – Exam practice"}
          </h1>
          <p className="text-gray-400 mt-2">
            {language === "bg"
              ? "Избери моделен тест. След всеки тест има отговори за самопроверка."
              : language === "de"
                ? "Wähle einen Modellsatz. Nach jedem Test findest du die Lösungen zur Selbstkontrolle."
                : "Choose a practice test. After each test you can check the answers."}
          </p>
        </header>

        <ul className="space-y-4">
          {tests.map((test) => (
            <li key={test.id}>
              {test.available ? (
                <Link
                  to={`/german/${test.route}`}
                  className="flex items-start gap-4 p-6 rounded-xl bg-gray-800/50 border border-amber-500/30 hover:border-amber-400/50 hover:bg-gray-800/70 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 group-hover:bg-amber-500 flex items-center justify-center">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white group-hover:text-amber-200">
                      {language === "bg" ? test.titleBg : test.title}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {language === "bg" ? test.descriptionBg : test.description}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-amber-400 font-semibold group-hover:text-amber-300">
                    {language === "bg" ? "Започни" : language === "de" ? "Starten" : "Start"}
                  </span>
                </Link>
              ) : (
                <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-800/30 border border-gray-600 opacity-75">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center">
                    <FaFileAlt className="text-gray-400 text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-400">
                      {language === "bg" ? test.titleBg : test.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {language === "bg" ? test.descriptionBg : test.description}
                    </p>
                    <p className="text-amber-400/80 text-sm mt-2">
                      {language === "bg" ? "Скоро" : language === "de" ? "Demnächst" : "Coming soon"}
                    </p>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default DSDTestsList;
