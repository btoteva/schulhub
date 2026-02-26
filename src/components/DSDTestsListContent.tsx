import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaHeadphones,
  FaPenFancy,
} from "react-icons/fa";
import type { Language } from "../contexts/LanguageContext";
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
const MODELLSATZ_3_IDS = ["7", "8", "9"];

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
  "9": FaPenFancy,
};

interface DSDTestsListContentProps {
  isLight: boolean;
  language: Language;
}

const DSDTestsListContent: React.FC<DSDTestsListContentProps> = ({ isLight, language }) => {
  const [modellsatz1Open, setModellsatz1Open] = useState(false);
  const [modellsatz2Open, setModellsatz2Open] = useState(false);
  const [modellsatz3Open, setModellsatz3Open] = useState(false);
  const tests = testsListData as TestItem[];
  const modellsatz1Tests = tests.filter((item) => MODELLSATZ_1_IDS.includes(item.id));
  const modellsatz2Tests = tests.filter((item) => MODELLSATZ_2_IDS.includes(item.id));
  const modellsatz3Tests = tests.filter((item) => MODELLSATZ_3_IDS.includes(item.id));
  const otherTests = tests.filter(
    (test) =>
      !MODELLSATZ_1_IDS.includes(test.id) &&
      !MODELLSATZ_2_IDS.includes(test.id) &&
      !MODELLSATZ_3_IDS.includes(test.id)
  );

  const renderTestLink = (test: TestItem, iconComponent?: React.ComponentType<{ className?: string }>) => {
    const Icon = iconComponent ?? FaFileAlt;
    const linkClass = isLight
      ? "flex items-start gap-4 p-4 pl-6 rounded-lg bg-slate-100 border border-amber-500/30 hover:border-amber-400/50 hover:bg-slate-200 transition-all group"
      : "flex items-start gap-4 p-4 pl-6 rounded-lg bg-gray-800/50 border border-amber-500/20 hover:border-amber-400/40 hover:bg-gray-800/70 transition-all group";
    return (
      <Link to={`/german/${test.route}`} className={linkClass}>
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-600/80 group-hover:bg-amber-500 flex items-center justify-center">
          <Icon className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold group-hover:text-amber-600 ${isLight ? "text-slate-800" : "text-white group-hover:text-amber-200"}`}>
            {language === "bg" ? test.titleBg : test.title}
          </h3>
          {(test.description || test.descriptionBg) && (
            <p className={isLight ? "text-slate-800 text-sm mt-0.5" : "text-gray-400 text-sm mt-0.5"}>
              {language === "bg" ? test.descriptionBg : test.description}
            </p>
          )}
        </div>
        <span className={`flex-shrink-0 font-semibold text-sm ${isLight ? "text-amber-600 group-hover:text-amber-700" : "text-amber-400 group-hover:text-amber-300"}`}>
          {language === "bg" ? "Започни" : language === "de" ? "Starten" : "Start"}
        </span>
      </Link>
    );
  };

  const renderTestRow = (test: TestItem) =>
    test.available ? (
      renderTestLink(test)
    ) : (
      <div
        className={
          isLight
            ? "flex items-start gap-4 p-6 rounded-xl bg-slate-100 border border-slate-300 opacity-90"
            : "flex items-start gap-4 p-6 rounded-xl bg-gray-800/30 border border-gray-600 opacity-75"
        }
      >
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isLight ? "bg-slate-400" : "bg-gray-600"}`}>
          <FaFileAlt className={isLight ? "text-slate-800 text-xl" : "text-gray-400 text-xl"} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-800" : "text-gray-400"}`}>
            {language === "bg" ? test.titleBg : test.title}
          </h2>
          <p className={isLight ? "text-slate-500 text-sm mt-1" : "text-gray-500 text-sm mt-1"}>
            {language === "bg" ? test.descriptionBg : test.description}
          </p>
          <p className={isLight ? "text-amber-600/90 text-sm mt-2" : "text-amber-400/80 text-sm mt-2"}>
            {language === "bg" ? "Скоро" : language === "de" ? "Demnächst" : "Coming soon"}
          </p>
        </div>
      </div>
    );

  return (
    <>
      <header className="mb-8">
        <h2 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>
          {language === "bg" ? "DSD I – Тестове за подготовка" : language === "de" ? "DSD I – Prüfungsvorbereitung" : "DSD I – Exam practice"}
        </h2>
        <p className={isLight ? "text-slate-600 mt-2" : "text-gray-400 mt-2"}>
          {language === "bg"
            ? "Избери моделен тест. След всеки тест има отговори за самопроверка."
            : language === "de"
              ? "Wähle einen Modellsatz. Nach jedem Test findest du die Lösungen zur Selbstkontrolle."
              : "Choose a practice test. After each test you can check the answers."}
        </p>
      </header>

      <ul className="space-y-4">
        <li>
          <div
            className={
              isLight
                ? "rounded-xl border border-amber-500/40 bg-white shadow-sm overflow-hidden"
                : "rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden"
            }
          >
            <button
              type="button"
              onClick={() => setModellsatz1Open((open) => !open)}
              className={`flex items-center gap-4 w-full p-6 text-left transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-gray-800/70"}`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                  {language === "bg" ? "DSD I Моделен тест 1" : "DSD I Modellsatz 1"}
                </h3>
                <p className={isLight ? "text-slate-800 text-sm mt-1" : "text-gray-400 text-sm mt-1"}>
                  {language === "bg"
                    ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                    : language === "de"
                      ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : "Parts of one exam: Reading, Listening, Written communication"}
                </p>
              </div>
              <span className={isLight ? "flex-shrink-0 text-amber-600" : "flex-shrink-0 text-amber-400"}>
                {modellsatz1Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {modellsatz1Open && (
              <div className={`px-4 pb-4 pt-0 space-y-2 border-t ${isLight ? "bg-white border-amber-500/30" : "bg-gray-800/50 border-amber-500/20"}`}>
                {modellsatz1Tests.map((test) => (
                  <div key={test.id}>{renderTestLink(test, MODELLSATZ_1_ICONS[test.id])}</div>
                ))}
              </div>
            )}
          </div>
        </li>
        <li>
          <div
            className={
              isLight
                ? "rounded-xl border border-amber-500/40 bg-white shadow-sm overflow-hidden"
                : "rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden"
            }
          >
            <button
              type="button"
              onClick={() => setModellsatz2Open((open) => !open)}
              className={`flex items-center gap-4 w-full p-6 text-left transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-gray-800/70"}`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                  {language === "bg" ? "DSD I Моделен тест 2" : "DSD I Modellsatz 2"}
                </h3>
                <p className={isLight ? "text-slate-800 text-sm mt-1" : "text-gray-400 text-sm mt-1"}>
                  {language === "bg"
                    ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                    : language === "de"
                      ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : "Parts of one exam: Reading, Listening, Written communication"}
                </p>
              </div>
              <span className={isLight ? "flex-shrink-0 text-amber-600" : "flex-shrink-0 text-amber-400"}>
                {modellsatz2Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {modellsatz2Open && (
              <div className={`px-4 pb-4 pt-0 space-y-2 border-t ${isLight ? "bg-white border-amber-500/30" : "bg-gray-800/50 border-amber-500/20"}`}>
                {modellsatz2Tests.map((test) => (
                  <div key={test.id}>{renderTestLink(test, MODELLSATZ_2_ICONS[test.id])}</div>
                ))}
              </div>
            )}
          </div>
        </li>
        <li>
          <div
            className={
              isLight
                ? "rounded-xl border border-amber-500/40 bg-white shadow-sm overflow-hidden"
                : "rounded-xl border border-amber-500/30 bg-gray-800/50 overflow-hidden"
            }
          >
            <button
              type="button"
              onClick={() => setModellsatz3Open((open) => !open)}
              className={`flex items-center gap-4 w-full p-6 text-left transition-colors ${isLight ? "hover:bg-slate-50" : "hover:bg-gray-800/70"}`}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center overflow-hidden">
                <img src="https://i.imgur.com/tf1QyRC.png" alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>
                  {language === "bg" ? "DSD I Моделен тест 3" : "DSD I Modellsatz 3"}
                </h3>
                <p className={isLight ? "text-slate-800 text-sm mt-1" : "text-gray-400 text-sm mt-1"}>
                  {language === "bg"
                    ? "Части от един изпит: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                    : language === "de"
                      ? "Teile einer Prüfung: Leseverstehen, Hörverstehen, Schriftliche Kommunikation"
                      : "Parts of one exam: Reading, Listening, Written communication"}
                </p>
              </div>
              <span className={isLight ? "flex-shrink-0 text-amber-600" : "flex-shrink-0 text-amber-400"}>
                {modellsatz3Open ? <FaChevronUp className="w-5 h-5" /> : <FaChevronDown className="w-5 h-5" />}
              </span>
            </button>
            {modellsatz3Open && (
              <div className={`px-4 pb-4 pt-0 space-y-2 border-t ${isLight ? "bg-white border-amber-500/30" : "bg-gray-800/50 border-amber-500/20"}`}>
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
    </>
  );
};

export default DSDTestsListContent;
