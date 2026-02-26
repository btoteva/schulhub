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
  const [teil1Bilder, setTeil1Bilder] = useState<Record<number, string>>({});
  const [showTeil1CheckResult, setShowTeil1CheckResult] = useState(false);
  const [showTeil1Answers, setShowTeil1Answers] = useState(false);
  const teil1CorrectAnswers: Record<number, string> = { 1: "B", 2: "C", 3: "A", 4: "B", 5: "A" };
  const [teil2Answers, setTeil2Answers] = useState<Record<number, string>>({});
  const [showTeil2CheckResult, setShowTeil2CheckResult] = useState(false);
  const [showTeil2Answers, setShowTeil2Answers] = useState(false);
  const [teil3Answers, setTeil3Answers] = useState<Record<number, "richtig" | "falsch">>({});
  const [showTeil3CheckResult, setShowTeil3CheckResult] = useState(false);
  const [showTeil3Answers, setShowTeil3Answers] = useState(false);
  const [teil4Answers, setTeil4Answers] = useState<Record<number, string>>({});
  const [showTeil4CheckResult, setShowTeil4CheckResult] = useState(false);
  const [showTeil4Answers, setShowTeil4Answers] = useState(false);
  const [teil5Answers, setTeil5Answers] = useState<Record<number, string>>({});
  const [showTeil5CheckResult, setShowTeil5CheckResult] = useState(false);
  const [showTeil5Answers, setShowTeil5Answers] = useState(false);
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
        szenen: Array<{ id: number; bildA?: string; bildB?: string; bildC?: string }>;
      };
      teil2Exercise?: {
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        instruction5: string;
        tasks: Array<{
          id: number;
          prompt: string;
          options: Array<{ id: string; text: string }>;
          correct: string;
        }>;
      };
      teil3Exercise?: {
        intro: string;
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        tasks: Array<{ id: number; statement: string; correct: "richtig" | "falsch" }>;
      };
      teil4Exercise?: {
        intro: string;
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        tasks: Array<{
          id: number;
          prompt: string;
          options: Array<{ id: string; text: string }>;
          correct: string;
        }>;
      };
      teil5Exercise?: {
        intro: string;
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        instruction5: string;
        activities: Array<{ id: string; text: string }>;
        taskNumbers: number[];
        correctAnswers: Record<string, string>;
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
                      <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">{(teil as { itemLabel?: string }).itemLabel || "Aufgabe"} {aufgabe.id}</p>
                      <p className="text-slate-900 dark:text-gray-200 leading-relaxed whitespace-pre-line">{aufgabe.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {teil.scenes && teil.scenes.length > 0 && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                <div className="space-y-10">
                  {teil.scenes.map((scene) => (
                    <div key={scene.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                      <div className="space-y-3">
                        {scene.lines.map((line, i) => (
                          <p key={i} className="text-slate-900 dark:text-gray-200 leading-relaxed">
                            <span className="font-semibold text-amber-800 dark:text-amber-200">
                              {line.speaker}{line.text ? ": " : ""}
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

              {teil.id === "teil1" && teil.teil1Exercise && (
                <div className="mt-10 pt-10 border-t-2 border-amber-500/40">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil1Exercise.instruction1}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-bold my-3">{teil.teil1Exercise.question}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-1">{teil.teil1Exercise.instruction2}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-8">{teil.teil1Exercise.instruction3}</p>
                  <div className="space-y-10">
                    {teil.teil1Exercise.szenen.map((sz) => (
                      <div key={sz.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                        <p className="text-amber-800 dark:text-amber-200 font-semibold mb-2">Szene {sz.id}</p>
                        <p className="text-slate-800 dark:text-gray-400 text-sm mb-4">{teil.teil1Exercise!.bildInstruction}</p>
                        <div className="grid grid-cols-3 gap-6">
                          {(["A", "B", "C"] as const).map((opt) => (
                            <label
                              key={opt}
                              className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                teil1Bilder[sz.id] === opt
                                  ? "border-amber-400 bg-amber-900/20"
                                  : "border-slate-300 dark:border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              <div className="w-full aspect-[4/3] max-h-40 bg-slate-200 dark:bg-gray-700/50 rounded border border-slate-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                {(sz as { bildA?: string; bildB?: string; bildC?: string })[`bild${opt}` as "bildA" | "bildB" | "bildC"] ? (
                                  <img
                                    src={(sz as { bildA?: string; bildB?: string; bildC?: string })[`bild${opt}` as "bildA" | "bildB" | "bildC"]}
                                    alt={`Bild ${opt}`}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-slate-500 dark:text-gray-500 text-sm">Bild {opt}</span>
                                )}
                              </div>
                              <span className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`teil1-sz-${sz.id}`}
                                  value={opt}
                                  checked={teil1Bilder[sz.id] === opt}
                                  onChange={() => setTeil1Bilder((prev) => ({ ...prev, [sz.id]: opt }))}
                                  className="w-4 h-4 text-amber-500"
                                />
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTeil1CheckResult(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                      >
                        Проверка
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTeil1Answers((v) => !v)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                      >
                        {showTeil1Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                      </button>
                    </div>
                    {showTeil1CheckResult && (() => {
                      const results = [1, 2, 3, 4, 5].map((nr) => ({ nr, correct: teil1Bilder[nr] === teil1CorrectAnswers[nr] }));
                      const richtig = results.filter((r) => r.correct).length;
                      return (
                        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600">
                          <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">
                            {richtig} von 5 richtig
                          </p>
                          <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-1 text-sm">
                            {results.map(({ nr, correct }) => (
                              <li key={nr}>
                                Szene {nr}: {teil1Bilder[nr] ? `Deine Antwort: ${teil1Bilder[nr]}` : "keine Antwort"}
                                {!correct && teil1CorrectAnswers[nr] && ` → richtig: ${teil1CorrectAnswers[nr]}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                    {showTeil1Answers && (
                      <div className="mt-6">
                        <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">Teil 1: Ein Nachmittag in der Stadt – Lösungen</p>
                        <div className="overflow-x-auto inline-block">
                          <table className="border border-slate-300 dark:border-gray-600 rounded-lg overflow-hidden text-slate-900 dark:text-gray-200">
                            <thead>
                              <tr className="bg-slate-200 dark:bg-gray-700/70">
                                <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-16"></th>
                                <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-14">A</th>
                                <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-14">B</th>
                                <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-14">C</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1, 2, 3, 4, 5].map((nr) => (
                                <tr key={nr} className="bg-slate-100 dark:bg-gray-900/30">
                                  <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 bg-slate-200 dark:bg-gray-700/50 font-medium">{nr}</td>
                                  {(["A", "B", "C"] as const).map((opt) => (
                                    <td key={opt} className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-center w-14">
                                      {teil1CorrectAnswers[nr] === opt ? (
                                        <span className="text-amber-600 dark:text-amber-400 font-bold" aria-label="richtig">✓</span>
                                      ) : (
                                        <span className="text-gray-600">□</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {teil.id === "teil2" && teil.teil2Exercise && (
                <div className="mt-10 pt-10 border-t-2 border-amber-500/40">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil2Exercise.instruction1}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil2Exercise.instruction2}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil2Exercise.instruction3}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-bold my-3">{teil.teil2Exercise.instruction4}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-8">{teil.teil2Exercise.instruction5}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgaben 6–9</p>
                  <div className="space-y-8">
                    {teil.teil2Exercise.tasks.map((task) => (
                      <div key={task.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                        <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgabe {task.id}</p>
                        <p className="text-slate-900 dark:text-gray-200 mb-4">{task.prompt}</p>
                        <div className="space-y-2">
                          {task.options.map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                teil2Answers[task.id] === opt.id ? "bg-amber-900/20 border-2 border-amber-400" : "border border-slate-300 dark:border-gray-600 hover:border-amber-500/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`teil2-${task.id}`}
                                value={opt.id}
                                checked={teil2Answers[task.id] === opt.id}
                                onChange={() => setTeil2Answers((prev) => ({ ...prev, [task.id]: opt.id }))}
                                className="w-4 h-4 text-amber-500"
                              />
                              <span><strong>{opt.id}</strong> {opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTeil2CheckResult(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                      >
                        Проверка
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTeil2Answers((v) => !v)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                      >
                        {showTeil2Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                      </button>
                    </div>
                    {showTeil2CheckResult && (() => {
                      const tasks = teil.teil2Exercise!.tasks;
                      const results = tasks.map((t) => ({ id: t.id, correct: teil2Answers[t.id] === t.correct }));
                      const richtig = results.filter((r) => r.correct).length;
                      return (
                        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600">
                          <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">{richtig} von 4 richtig</p>
                          <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-1 text-sm">
                            {results.map(({ id, correct }) => {
                              const task = tasks.find((t) => t.id === id)!;
                              return (
                                <li key={id}>
                                  Aufgabe {id}: {teil2Answers[id] ? `Deine Antwort: ${teil2Answers[id]}` : "keine Antwort"}
                                  {!correct && ` → richtig: ${task.correct}`}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })()}
                    {showTeil2Answers && (
                      <div className="mt-6">
                        <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">Teil 2: Durchsagen in der Schule – Lösungen</p>
                        <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-2">
                          {teil.teil2Exercise.tasks.map((t) => (
                            <li key={t.id}>Aufgabe {t.id}: <strong>{t.correct}</strong></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {teil.id === "teil3" && teil.teil3Exercise && (
                <div className="mt-10 pt-10 border-t-2 border-amber-500/40">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                  <p className="text-slate-900 dark:text-gray-300 mb-4">{teil.teil3Exercise.intro}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil3Exercise.instruction1}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil3Exercise.instruction2}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-bold my-3">{teil.teil3Exercise.instruction3}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-8">{teil.teil3Exercise.instruction4}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgaben 10–14</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-300 dark:border-gray-600 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-slate-200 dark:bg-gray-700/70">
                          <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-16 text-left">Nr.</th>
                          <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold text-left">Satz</th>
                          <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-24 text-center">richtig</th>
                          <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold w-24 text-center">falsch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teil.teil3Exercise.tasks.map((task) => (
                          <tr key={task.id} className="bg-slate-100 dark:bg-gray-900/30">
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 font-medium">{task.id}</td>
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-slate-900 dark:text-gray-200">{task.statement}</td>
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-center">
                              <label className="flex items-center justify-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`teil3-${task.id}`}
                                  value="richtig"
                                  checked={teil3Answers[task.id] === "richtig"}
                                  onChange={() => setTeil3Answers((prev) => ({ ...prev, [task.id]: "richtig" }))}
                                  className="w-4 h-4 text-amber-500"
                                />
                                richtig
                              </label>
                            </td>
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-3 text-center">
                              <label className="flex items-center justify-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`teil3-${task.id}`}
                                  value="falsch"
                                  checked={teil3Answers[task.id] === "falsch"}
                                  onChange={() => setTeil3Answers((prev) => ({ ...prev, [task.id]: "falsch" }))}
                                  className="w-4 h-4 text-amber-500"
                                />
                                falsch
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTeil3CheckResult(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                      >
                        Проверка
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTeil3Answers((v) => !v)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                      >
                        {showTeil3Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                      </button>
                    </div>
                    {showTeil3CheckResult && (() => {
                      const tasks = teil.teil3Exercise!.tasks;
                      const results = tasks.map((t) => ({ id: t.id, correct: teil3Answers[t.id] === t.correct }));
                      const richtig = results.filter((r) => r.correct).length;
                      return (
                        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600">
                          <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">{richtig} von 5 richtig</p>
                          <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-1 text-sm">
                            {results.map(({ id, correct }) => {
                              const task = tasks.find((t) => t.id === id)!;
                              return (
                                <li key={id}>
                                  Aufgabe {id}: {teil3Answers[id] ? `Deine Antwort: ${teil3Answers[id]}` : "keine Antwort"}
                                  {!correct && ` → richtig: ${task.correct}`}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })()}
                    {showTeil3Answers && (
                      <div className="mt-6">
                        <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">Teil 3: Interview mit Wolfgang vom Schülerradio – Lösungen</p>
                        <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-2">
                          {teil.teil3Exercise.tasks.map((t) => (
                            <li key={t.id}>Aufgabe {t.id}: <strong>{t.correct}</strong></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {teil.id === "teil4" && teil.teil4Exercise && (
                <div className="mt-10 pt-10 border-t-2 border-amber-500/40">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                  <p className="text-slate-900 dark:text-gray-300 mb-4">{teil.teil4Exercise.intro}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil4Exercise.instruction1}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil4Exercise.instruction2}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-bold my-3">{teil.teil4Exercise.instruction3}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-8">{teil.teil4Exercise.instruction4}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgaben 15–20</p>
                  <div className="space-y-8">
                    {teil.teil4Exercise.tasks.map((task) => (
                      <div key={task.id} className="border border-slate-300 dark:border-gray-600 rounded-xl p-6 bg-slate-100 dark:bg-gray-900/30">
                        <p className="text-amber-800 dark:text-amber-200 font-semibold mb-4">Aufgabe {task.id}</p>
                        <p className="text-slate-900 dark:text-gray-200 mb-4">{task.prompt}</p>
                        <div className="space-y-2">
                          {task.options.map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                teil4Answers[task.id] === opt.id ? "bg-amber-900/20 border-2 border-amber-400" : "border border-slate-300 dark:border-gray-600 hover:border-amber-500/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`teil4-${task.id}`}
                                value={opt.id}
                                checked={teil4Answers[task.id] === opt.id}
                                onChange={() => setTeil4Answers((prev) => ({ ...prev, [task.id]: opt.id }))}
                                className="w-4 h-4 text-amber-500"
                              />
                              <span><strong>{opt.id}</strong> {opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTeil4CheckResult(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                      >
                        Проверка
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTeil4Answers((v) => !v)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                      >
                        {showTeil4Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                      </button>
                    </div>
                    {showTeil4CheckResult && (() => {
                      const tasks = teil.teil4Exercise!.tasks;
                      const results = tasks.map((t) => ({ id: t.id, correct: teil4Answers[t.id] === t.correct }));
                      const richtig = results.filter((r) => r.correct).length;
                      return (
                        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600">
                          <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">{richtig} von 6 richtig</p>
                          <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-1 text-sm">
                            {results.map(({ id, correct }) => {
                              const task = tasks.find((t) => t.id === id)!;
                              return (
                                <li key={id}>
                                  Aufgabe {id}: {teil4Answers[id] ? `Deine Antwort: ${teil4Answers[id]}` : "keine Antwort"}
                                  {!correct && ` → richtig: ${task.correct}`}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })()}
                    {showTeil4Answers && (
                      <div className="mt-6">
                        <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">Teil 4: Ein Jahr in Mexiko – Lösungen</p>
                        <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-2">
                          {teil.teil4Exercise.tasks.map((t) => (
                            <li key={t.id}>Aufgabe {t.id}: <strong>{t.correct}</strong></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {teil.id === "teil5" && teil.teil5Exercise && (
                <div className="mt-10 pt-10 border-t-2 border-amber-500/40">
                  <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                  <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                  <p className="text-slate-900 dark:text-gray-300 mb-4">{teil.teil5Exercise.intro}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil5Exercise.instruction1}</p>
                  <p className="text-amber-800 dark:text-amber-200 font-bold my-3">{teil.teil5Exercise.instruction2}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil5Exercise.instruction3}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-2">{teil.teil5Exercise.instruction4}</p>
                  <p className="text-slate-900 dark:text-gray-300 mb-8">{teil.teil5Exercise.instruction5}</p>
                  <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="flex-shrink-0">
                      <p className="text-amber-800 dark:text-amber-200 font-semibold mb-3">Aktivitäten A–H</p>
                      <ul className="space-y-2 text-slate-900 dark:text-gray-200 text-sm">
                        {teil.teil5Exercise.activities.map((a) => (
                          <li key={a.id} className={a.id === "Z" ? "bg-slate-200 dark:bg-gray-700/50 rounded px-2 py-1" : ""}>
                            <strong>({a.id})</strong> {a.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-800 dark:text-amber-200 font-semibold mb-3">Aufgaben 21–24</p>
                      <table className="w-full border-collapse border border-slate-300 dark:border-gray-600 rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-slate-200 dark:bg-gray-700/70">
                            <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold text-left w-20">Nr.</th>
                            <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-amber-800 dark:text-amber-200 font-semibold text-left">Buchstabe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-slate-100 dark:bg-gray-900/30">
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 font-medium">0</td>
                            <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-slate-600 dark:text-gray-400">Z</td>
                          </tr>
                          {teil.teil5Exercise.taskNumbers.map((nr) => (
                            <tr key={nr} className="bg-slate-100 dark:bg-gray-900/30">
                              <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 font-medium">{nr}</td>
                              <td className="border border-slate-300 dark:border-gray-600 px-4 py-2">
                                <select
                                  value={teil5Answers[nr] ?? ""}
                                  onChange={(e) => setTeil5Answers((prev) => ({ ...prev, [nr]: e.target.value }))}
                                  className="bg-slate-200 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded px-2 py-1 text-slate-900 dark:text-white w-14"
                                >
                                  <option value="">–</option>
                                  {(teil.teil5Exercise!.activities ?? []).filter((a) => a.id !== "Z").map((a) => (
                                    <option key={a.id} value={a.id}>{a.id}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTeil5CheckResult(true)}
                        className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                      >
                        Проверка
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTeil5Answers((v) => !v)}
                        className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                      >
                        {showTeil5Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                      </button>
                    </div>
                    {showTeil5CheckResult && (() => {
                      const taskNumbers = teil.teil5Exercise!.taskNumbers;
                      const correctAnswers = teil.teil5Exercise!.correctAnswers;
                      const results = taskNumbers.map((nr) => ({ nr, correct: teil5Answers[nr] === correctAnswers[String(nr)] }));
                      const richtig = results.filter((r) => r.correct).length;
                      return (
                        <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-gray-900/50 border border-slate-300 dark:border-gray-600">
                          <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">{richtig} von 4 richtig</p>
                          <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-1 text-sm">
                            {results.map(({ nr, correct }) => (
                              <li key={nr}>
                                Aufgabe {nr}: {teil5Answers[nr] ? `Deine Antwort: ${teil5Answers[nr]}` : "keine Antwort"}
                                {!correct && correctAnswers[String(nr)] && ` → richtig: ${correctAnswers[String(nr)]}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                    {showTeil5Answers && (
                      <div className="mt-6">
                        <p className="text-amber-800 dark:text-amber-200 font-bold mb-3">Teil 5: Berichte zur Projektwoche – Lösungen</p>
                        <ul className="list-disc list-inside text-slate-900 dark:text-gray-200 space-y-2">
                          {teil.teil5Exercise.taskNumbers.map((nr) => (
                            <li key={nr}>Aufgabe {nr}: <strong>{teil.teil5Exercise!.correctAnswers[String(nr)]}</strong></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
        <p className="mt-12 pt-8 border-t border-amber-500/30 text-center text-slate-900 dark:text-gray-200 font-medium">
          Du hast jetzt 10 Minuten Zeit, um deine Lösungen auf das Antwortblatt zu übertragen.
        </p>
        <div className="mt-12 flex justify-center pb-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 hover:border-amber-400 transition-colors"
            aria-label="Nach oben"
          >
            <FaArrowUp className="w-5 h-5" />
          </button>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DSDHorverstehen3View;
