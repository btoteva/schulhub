import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileAlt, FaChevronDown, FaChevronUp, FaClipboardList, FaHeadphones, FaPenFancy } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import testsListData from "../data/dsd-tests-list.json";

type TestItem = {
  id: string;
  title: string;
  titleBg: string;
  description: string;
  descriptionBg: string;
  available: boolean;
  route: string;
};

const MODELLSATZ_1_IDS = ["1", "2", "3"];
const MODELLSATZ_2_IDS = ["4", "5", "6"];
const MODELLSATZ_3_IDS = ["7", "8"];

const MODELLSATZ_1_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "1": FaClipboardList,
  "2": FaHeadphones,
  "3": FaPenFancy,
};

const MODELLSATZ_2_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "4": FaClipboardList,
  "5": FaHeadphones,
  "6": FaPenFancy,
};

const MODELLSATZ_3_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "7": FaClipboardList,
  "8": FaHeadphones,
};

const DSDTestsList: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [modellsatz1Open, setModellsatz1Open] = useState(false);
  const [modellsatz2Open, setModellsatz2Open] = useState(false);
  const [modellsatz3Open, setModellsatz3Open] = useState(false);
  const tests = testsListData as TestItem[];
  const modellsatz1Tests = tests.filter((t) => MODELLSATZ_1_IDS.includes(t.id));
  const modellsatz2Tests = tests.filter((t) => MODELLSATZ_2_IDS.includes(t.id));
  const modellsatz3Tests = tests.filter((t) => MODELLSATZ_3_IDS.includes(t.id));
  const otherTests = tests.filter(
    (t) => !MODELLSATZ_1_IDS.includes(t.id) && !MODELLSATZ_2_IDS.includes(t.id) && !MODELLSATZ_3_IDS.includes(t.id)
  );

  const renderTestLink = (test: TestItem, iconComponent?: React.ComponentType<{ className?: string }>) => {
    const Icon = iconComponent ?? FaFileAlt;
    return (
    <Link
      to={`/german/${test.route}`}
      className="flex items-start gap-4 p-4 pl-6 rounded-lg bg-gray-800/50 border border-amber-500/20 hover:border-amber-400/40 hover:bg-gray-800/70 transition-all group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-600/80 group-hover:bg-amber-500 flex items-center justify-center">
        <Icon className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white group-hover:text-amber-200">
          {language === "bg" ? test.titleBg : test.title}
        </h3>
        {(test.description || test.descriptionBg) && (
          <p className="text-gray-400 text-sm mt-0.5">
            {language === "bg" ? test.descriptionBg : test.description}
          </p>
        )}
      </div>
      <span className="flex-shrink-0 text-amber-400 font-semibold text-sm group-hover:text-amber-300">
        {language === "bg" ? "Започни" : language === "de" ? "Starten" : "Start"}
      </span>
    </Link>
  );
  };

  const renderTestRow = (test: TestItem) =>
    test.available ? (
      renderTestLink(test)
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
    );

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
          <li>
            <div className="rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setModellsatz1Open((open) => !open)}
                className="flex items-center gap-4 w-full p-6 text-left hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                  <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {language === "bg" ? "DSD I Моделен тест 1" : "DSD I Modellsatz 1"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {language === "bg"
                      ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : language === "de"
                        ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                        : "Parts of one exam: Reading, Listening, Written communication"}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-400">
                  {modellsatz1Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                </span>
              </button>
              {modellsatz1Open && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-amber-500/20">
                  {modellsatz1Tests.map((test) => (
                    <div key={test.id}>{renderTestLink(test, MODELLSATZ_1_ICONS[test.id])}</div>
                  ))}
                </div>
              )}
            </div>
          </li>
          <li>
            <div className="rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setModellsatz2Open((open) => !open)}
                className="flex items-center gap-4 w-full p-6 text-left hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                  <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {language === "bg" ? "DSD I Моделен тест 2" : "DSD I Modellsatz 2"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {language === "bg"
                      ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : language === "de"
                        ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                        : "Parts of one exam: Reading, Listening, Written communication"}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-400">
                  {modellsatz2Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                </span>
              </button>
              {modellsatz2Open && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-amber-500/20">
                  {modellsatz2Tests.map((test) => (
                    <div key={test.id}>{renderTestLink(test, MODELLSATZ_2_ICONS[test.id])}</div>
                  ))}
                </div>
              )}
            </div>
          </li>
          <li>
            <div className="rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setModellsatz3Open((open) => !open)}
                className="flex items-center gap-4 w-full p-6 text-left hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                  <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">
                    {language === "bg" ? "DSD I Моделен тест 3" : "DSD I Modellsatz 3"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {language === "bg"
                      ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : language === "de"
                        ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                        : "Parts of one exam: Reading, Listening, Written communication"}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-400">
                  {modellsatz3Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
                </span>
              </button>
              {modellsatz3Open && (
                <div className="px-4 pb-4 pt-0 space-y-2 border-t border-amber-500/20">
                  {modellsatz3Tests.map((test) => (
                    <div key={test.id}>{renderTestLink(test, MODELLSATZ_3_ICONS[test.id])}</div>
                  ))}
                </div>
              )}
            </div>
          </li>
          {otherTests.map((test) => (
            <li key={test.id}>{renderTestRow(test)}</li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default DSDTestsList;
