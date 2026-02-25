import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown, FaArrowUp, FaHeadphones, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import horverstehenData from "../data/dsd-horverstehen-3.json";

const DSDHorverstehen3View: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<"test" | "dictionary">("test");
  const [vocabularyCellExpanded, setVocabularyCellExpanded] = useState<{ row: number; col: "synonyms" | "explanation" } | null>(null);
  const [showTeacherTextTeile, setShowTeacherTextTeile] = useState<Record<string, boolean>>({});
  const data = horverstehenData as {
    title: string;
    titleBg: string;
    subtitle: string;
    horverstehenInstructions?: string;
    vocabulary?: Array<{ word: string; synonyms?: string; explanation?: string; synonymsOrExplanation?: string; synonymsBg?: string; explanationBg?: string; synonymsOrExplanationBg?: string; wordBg: string }>;
    teile: Array<{
      id: string;
      title: string;
      subtitle: string;
      audioUrl?: string;
      aufgaben?: Array<{ id: number; text: string }>;
      teil1Exercise?: {
        instruction1: string;
        question: string;
        instruction2: string;
        instruction3: string;
        bildInstruction: string;
        szenen: Array<{ id: number }>;
      };
      scenes?: Array<{
        id: number;
        lines: Array<{ speaker: string; text: string }>;
      }>;
    }>;
  };

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/german/dsd-tests"
          className={`inline-flex items-center gap-2 mb-8 ${isLight ? "text-amber-600 hover:text-amber-700" : "text-amber-600 dark:text-amber-400 hover:text-amber-300"}`}
        >
          <FaArrowLeft />
          DSD I Тестове
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center">
              <FaHeadphones className="text-slate-800 dark:text-white text-xl" />
            </div>
            <h1 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-600 dark:text-amber-400"}`}>{data.title}</h1>
          </div>
          <p className="text-slate-800 dark:text-gray-400 mt-1">{data.subtitle}</p>
          {data.horverstehenInstructions && (
            <p className="text-slate-900 dark:text-gray-300 mt-6 leading-relaxed max-w-3xl">
              {data.horverstehenInstructions}
            </p>
          )}
        </header>

        <div className="flex gap-2 mb-6 border-b border-amber-500/30">
          <button type="button" onClick={() => setActiveTab("test")} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "test" ? "bg-amber-600 text-white" : isLight ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{t.vocabularyTestTab}</button>
          <button type="button" onClick={() => setActiveTab("dictionary")} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "dictionary" ? "bg-amber-600 text-white" : isLight ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{t.dictionary}</button>
        </div>

        {activeTab === "dictionary" && (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-amber-500/30 overflow-hidden mb-8">
            {(!data.vocabulary || data.vocabulary.length === 0) ? <p className="p-8 text-slate-600 dark:text-gray-400">{t.noWordsInDictionary}</p> : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead><tr className="bg-amber-600 text-white"><th className="border border-amber-500/50 px-4 py-3 text-left font-semibold">{t.vocabularyTableWord}</th><th className="border border-amber-500/50 px-4 py-3 text-left font-semibold">{t.vocabularyTableSynonyms}</th><th className="border border-amber-500/50 px-4 py-3 text-left font-semibold">{t.vocabularyTableExplanation}</th><th className="border border-amber-500/50 px-4 py-3 text-left font-semibold">{t.vocabularyTableTranslation}</th></tr></thead>
                  <tbody>
                    {data.vocabulary.map((row, idx) => (
                      <tr key={idx} className={isLight ? "bg-slate-50 hover:bg-slate-100" : "bg-gray-800/50 hover:bg-gray-700/50"}>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-slate-900 dark:text-gray-200 font-medium">{row.word}</td>
                        <td className={`border border-slate-300 dark:border-gray-600 px-4 py-3 text-slate-700 dark:text-gray-300 ${row.synonymsBg ? "cursor-pointer" : ""}`} onClick={() => row.synonymsBg && setVocabularyCellExpanded((v) => (v?.row === idx && v?.col === "synonyms" ? null : { row: idx, col: "synonyms" }))}>
                          <span>{row.synonyms ?? "—"}</span>
                          {row.synonymsBg && <span className="block text-xs mt-1 text-slate-500 dark:text-gray-500">{t.clickForTranslation}</span>}
                          {vocabularyCellExpanded?.row === idx && vocabularyCellExpanded?.col === "synonyms" && row.synonymsBg && <p className="mt-2 text-amber-700 dark:text-amber-300 font-medium">{row.synonymsBg}</p>}
                        </td>
                        <td className={`border border-slate-300 dark:border-gray-600 px-4 py-3 text-slate-700 dark:text-gray-300 ${(row.explanationBg ?? row.synonymsOrExplanationBg) ? "cursor-pointer" : ""}`} onClick={() => (row.explanationBg ?? row.synonymsOrExplanationBg) && setVocabularyCellExpanded((v) => (v?.row === idx && v?.col === "explanation" ? null : { row: idx, col: "explanation" }))}>
                          <span>{row.explanation ?? row.synonymsOrExplanation ?? "—"}</span>
                          {(row.explanationBg ?? row.synonymsOrExplanationBg) && <span className="block text-xs mt-1 text-slate-500 dark:text-gray-500">{t.clickForTranslation}</span>}
                          {vocabularyCellExpanded?.row === idx && vocabularyCellExpanded?.col === "explanation" && (row.explanationBg ?? row.synonymsOrExplanationBg) && <p className="mt-2 text-amber-700 dark:text-amber-300 font-medium">{row.explanationBg ?? row.synonymsOrExplanationBg}</p>}
                        </td>
                        <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-slate-800 dark:text-gray-200">{row.wordBg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "test" && (
          <>
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
            className="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-900 dark:text-white font-semibold rounded-lg inline-flex items-center gap-2"
          >
            <FaArrowDown />
            Надолу
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-900 dark:text-white font-semibold rounded-lg inline-flex items-center gap-2"
          >
            <FaArrowUp />
            Нагоре
          </button>
        </div>

        <div className="space-y-10">
          {data.teile.map((teil) => (
            <section
              key={teil.id}
              className="bg-gray-800/50 rounded-xl p-8 border border-amber-500/30"
            >
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                {teil.title}
              </h2>
              <h3 className="text-xl font-semibold text-amber-200 mb-4">
                {teil.subtitle}
              </h3>

              {teil.audioUrl && (
                <div className="mb-8 p-6 bg-slate-100 dark:bg-gray-900/50 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <p className="text-amber-200 font-semibold flex items-center gap-2">
                      <FaHeadphones className="text-amber-600 dark:text-amber-400" />
                      Audio – {teil.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTeacherTextTeile((prev) => ({ ...prev, [teil.id]: !prev[teil.id] }))}
                      className="p-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-800 dark:text-amber-200 transition-colors"
                      title={showTeacherTextTeile[teil.id] ? t.hideTeacherText : t.showTeacherText}
                    >
                      {showTeacherTextTeile[teil.id] ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                  </div>
                  <audio
                    controls
                    className="w-full max-w-2xl"
                    src={teil.audioUrl}
                  >
                    Вашият браузър не поддържа възпроизвеждане на аудио.
                  </audio>
                </div>
              )}

              {teil.aufgaben && teil.aufgaben.length > 0 && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                <div className="space-y-8">
                  {teil.aufgaben.map((aufgabe) => (
                    <div key={aufgabe.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                      <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgabe {aufgabe.id}</p>
                      <p className="text-slate-900 dark:text-gray-200 leading-relaxed whitespace-pre-line">{aufgabe.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {teil.scenes && teil.scenes.length > 0 && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                <div className="space-y-10">
                  {teil.scenes.map((scene) => (
                    <div key={scene.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                      <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Szene {scene.id}</p>
                      <div className="space-y-3">
                        {scene.lines.map((line, i) => (
                          <p key={i} className="text-slate-900 dark:text-gray-200 leading-relaxed">
                            <span className="font-semibold text-amber-800 dark:text-amber-200">
                              {line.speaker}:{" "}
                            </span>
                            {line.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-center">
                Ende {teil.title}
              </p>
            </section>
          ))}
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DSDHorverstehen3View;
