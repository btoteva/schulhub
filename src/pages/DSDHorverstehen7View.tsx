import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaHeadphones, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import horverstehenData from "../data/dsd-horverstehen-7.json";

type TeilData = {
  id: string;
  title: string;
  subtitle?: string;
  intro?: string;
  audioUrl?: string;
  scenes?: Array<{ id: number; lines: Array<{ speaker: string; text: string }> }>;
  aufgaben?: Array<{ id: number; text: string }>;
  content?: string;
  itemLabel?: string;
  teil1Exercise?: {
    instruction1: string;
    question: string;
    instruction2: string;
    instruction3: string;
    bildInstruction: string;
    correctAnswers?: Record<string, string>;
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
    instruction6?: string;
    activities: Array<{ id: string; text: string }>;
    taskNumbers: number[];
    correctAnswers: Record<string, string>;
  };
};

const DSDHorverstehen7View: React.FC = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const isLight = theme === "light";
  const data = horverstehenData as {
    title: string;
    titleBg: string;
    subtitle: string;
    subtitleBg: string;
    teile?: TeilData[];
  };

  const [showTeacherTextTeile, setShowTeacherTextTeile] = useState<Record<string, boolean>>({});
  const [teil1Bilder, setTeil1Bilder] = useState<Record<number, string>>({});
  const [showTeil1CheckResult, setShowTeil1CheckResult] = useState(false);
  const [showTeil1Answers, setShowTeil1Answers] = useState(false);
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
  const teile = data.teile ?? [];

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
          className={`inline-flex items-center gap-2 mb-8 ${isLight ? "text-amber-600 hover:text-amber-700" : "text-amber-400 hover:text-amber-300"}`}
        >
          <FaArrowLeft />
          {t.dsdTests}
        </Link>

        <header className="mb-8">
          <h1 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>{data.title}</h1>
          <p className={isLight ? "text-slate-600 mt-1" : "text-gray-400 mt-1"}>{data.subtitle}</p>
        </header>

        {teile.length > 0 ? (
          <>
          <div className="space-y-8">
            {teile.map((teil) => (
              <section
                key={teil.id}
                className={`rounded-xl border p-8 ${isLight ? "bg-white border-amber-500/30" : "bg-gray-800/50 border-amber-500/30"}`}
              >
                <h2 className={`text-2xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                  {teil.title}
                  {teil.subtitle && ` – ${teil.subtitle}`}
                </h2>
                {teil.intro && (
                  <p className={`mb-4 whitespace-pre-line ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.intro}</p>
                )}
                {teil.audioUrl && (
                  <div className={`mb-6 p-4 rounded-lg ${isLight ? "bg-amber-50 border border-amber-200" : "bg-amber-900/20 border border-amber-700/50"}`}>
                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                      <p className={`flex items-center gap-2 font-medium ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                        <FaHeadphones />
                        {language === "bg" ? "Аудио" : language === "de" ? "Audio" : "Audio"}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowTeacherTextTeile((prev) => ({ ...prev, [teil.id]: !prev[teil.id] }))}
                        className={`p-2 rounded-lg transition-colors ${isLight ? "bg-amber-600/20 hover:bg-amber-600/40 text-amber-800" : "bg-amber-600/20 hover:bg-amber-600/40 text-amber-200"}`}
                        title={showTeacherTextTeile[teil.id] ? t.hideTeacherText : t.showTeacherText}
                      >
                        {showTeacherTextTeile[teil.id] ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                      </button>
                    </div>
                    <audio controls className="w-full max-w-md" src={teil.audioUrl}>
                      {language === "bg" ? "Браузърът ви не поддържа аудио." : language === "de" ? "Ihr Browser unterstützt kein Audio." : "Your browser does not support audio."}
                    </audio>
                  </div>
                )}
                {teil.scenes && teil.scenes.length > 0 && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                  <div className="space-y-8">
                    {teil.scenes.map((scene) => (
                      <div key={scene.id}>
                        <h3 className={`font-semibold mb-3 ${isLight ? "text-amber-700" : "text-amber-300"}`}>Szene {scene.id}</h3>
                        <div className="space-y-2">
                          {scene.lines.map((line, idx) => (
                            <p key={idx} className={isLight ? "text-slate-800" : "text-gray-200"}>
                              <span className="font-medium text-amber-600 dark:text-amber-400">{line.speaker}:</span> {line.text}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {teil.content && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                  <div className={`mb-6 rounded-xl p-6 ${isLight ? "border border-amber-200 bg-amber-50/50" : "border border-amber-700/30 bg-amber-900/10"}`}>
                    <p className={`whitespace-pre-line leading-relaxed ${isLight ? "text-slate-800" : "text-gray-200"}`}>{teil.content}</p>
                  </div>
                )}
                {teil.aufgaben && teil.aufgaben.length > 0 && (showTeacherTextTeile[teil.id] || !teil.audioUrl) && (
                  <div className="space-y-6">
                    {teil.aufgaben.map((aufgabe) => (
                      <div
                        key={aufgabe.id}
                        className={`rounded-xl p-6 ${isLight ? "border border-amber-200 bg-amber-50/50" : "border border-amber-700/30 bg-amber-900/10"}`}
                      >
                        <h3 className={`font-semibold mb-3 ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                          {teil.itemLabel || "Aufgabe"} {aufgabe.id}
                        </h3>
                        <p className={`whitespace-pre-line ${isLight ? "text-slate-800" : "text-gray-200"}`}>{aufgabe.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                {teil.id === "teil2" && teil.teil2Exercise && (
                  <div className={`mt-10 pt-10 border-t-2 ${isLight ? "border-amber-500/40" : "border-amber-500/40"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                      {language === "bg" ? "Задачи" : "Aufgaben"}
                    </h3>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil2Exercise.instruction1}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil2Exercise.instruction2}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil2Exercise.instruction3}</p>
                    <p className={`font-bold my-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.teil2Exercise.instruction4}</p>
                    <p className={`mb-8 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil2Exercise.instruction5}</p>
                    <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgaben 6–9</p>
                    <div className="space-y-8">
                      {teil.teil2Exercise.tasks.map((task) => (
                        <div key={task.id} className={`rounded-xl p-6 ${isLight ? "border border-amber-200 bg-amber-50/30" : "border border-amber-700/30 bg-amber-900/10"}`}>
                          <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgabe {task.id}</p>
                          <p className={`mb-4 ${isLight ? "text-slate-800" : "text-gray-200"}`}>{task.prompt}</p>
                          <div className="space-y-2">
                            {task.options.map((opt) => {
                              const selected = teil2Answers[task.id] === opt.id;
                              const isCorrect = showTeil2CheckResult && selected && opt.id === task.correct;
                              const isWrong = showTeil2CheckResult && selected && opt.id !== task.correct;
                              return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                  isCorrect ? "border-2 border-green-500 bg-green-900/20" : isWrong ? "border-2 border-red-500 bg-red-900/20" : teil2Answers[task.id] === opt.id
                                    ? "border-2 border-amber-400 bg-amber-900/20"
                                    : isLight ? "border border-slate-300 hover:border-amber-500/50" : "border border-gray-600 hover:border-amber-500/50"
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
                                {showTeil2CheckResult && selected && (isCorrect ? <span className="text-green-500 font-bold"> ✓</span> : <span className="text-red-500 font-bold"> ✗</span>)}
                              </label>
                            );})}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-8 pt-6 border-t ${isLight ? "border-amber-500/30" : "border-amber-500/30"}`}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setShowTeil2CheckResult(true)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-800 hover:bg-emerald-600/50" : "bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/50"}`}
                        >
                          {language === "bg" ? "Проверка" : "Prüfen"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil2Answers((v) => !v)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-amber-500/20 border border-amber-500/50 text-amber-800 hover:bg-amber-500/30" : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"}`}
                        >
                          {showTeil2Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil2CheckResult && (() => {
                        const tasks = teil.teil2Exercise!.tasks;
                        const results = tasks.map((t) => ({ id: t.id, correct: teil2Answers[t.id] === t.correct }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className={`mt-6 p-4 rounded-xl ${isLight ? "bg-slate-100 border border-slate-300" : "bg-gray-900/50 border border-gray-600"}`}>
                            <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{richtig} von 4 richtig</p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                          <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Teil 2: Radiosendungen – Lösungen</p>
                          <ul className={`list-disc list-inside space-y-1 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                  <div className={`mt-10 pt-10 border-t-2 ${isLight ? "border-amber-500/40" : "border-amber-500/40"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                      {language === "bg" ? "Задачи" : "Aufgaben"}
                    </h3>
                    <h4 className={`text-lg font-semibold mt-6 mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.title} – {teil.subtitle}</h4>
                    <p className={`mb-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil3Exercise.intro}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil3Exercise.instruction1}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil3Exercise.instruction2}</p>
                    <p className={`font-bold my-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.teil3Exercise.instruction3}</p>
                    <p className={`mb-8 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil3Exercise.instruction4}</p>
                    <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgaben 10–14</p>
                    <div className="overflow-x-auto">
                      <table className={`w-full border-collapse rounded-xl overflow-hidden ${isLight ? "border border-slate-300" : "border border-gray-600"}`}>
                        <thead>
                          <tr className={isLight ? "bg-slate-200" : "bg-gray-700/70"}>
                            <th className={`px-4 py-2 w-16 text-left font-semibold ${isLight ? "border border-slate-300 text-amber-800" : "border border-gray-600 text-amber-200"}`}>Nr.</th>
                            <th className={`px-4 py-2 text-left font-semibold ${isLight ? "border border-slate-300 text-amber-800" : "border border-gray-600 text-amber-200"}`}>Satz</th>
                            <th className={`px-4 py-2 w-24 text-center font-semibold ${isLight ? "border border-slate-300 text-amber-800" : "border border-gray-600 text-amber-200"}`}>richtig</th>
                            <th className={`px-4 py-2 w-24 text-center font-semibold ${isLight ? "border border-slate-300 text-amber-800" : "border border-gray-600 text-amber-200"}`}>falsch</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teil.teil3Exercise.tasks.map((task) => {
                            const correct = showTeil3CheckResult && teil3Answers[task.id] === task.correct;
                            const wrong = showTeil3CheckResult && teil3Answers[task.id] && teil3Answers[task.id] !== task.correct;
                            return (
                            <tr key={task.id} className={correct ? "bg-green-900/20" : wrong ? "bg-red-900/20" : isLight ? "bg-slate-100" : "bg-gray-900/30"}>
                              <td className={`px-4 py-3 font-medium ${isLight ? "border border-slate-300" : "border border-gray-600"}`}>{task.id}</td>
                              <td className={`px-4 py-3 ${isLight ? "text-slate-800 border border-slate-300" : "text-gray-200 border border-gray-600"}`}>{task.statement}</td>
                              <td className={`px-4 py-3 text-center ${isLight ? "border border-slate-300" : "border border-gray-600"}`}>
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
                                  {showTeil3CheckResult && correct && <span className="text-green-500 font-bold ml-1">✓</span>}
                                  {showTeil3CheckResult && wrong && teil3Answers[task.id] === "richtig" && <span className="text-red-500 font-bold ml-1">✗</span>}
                                </label>
                              </td>
                              <td className={`px-4 py-3 text-center ${isLight ? "border border-slate-300" : "border border-gray-600"}`}>
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
                                  {showTeil3CheckResult && correct && teil3Answers[task.id] === "falsch" && <span className="text-green-500 font-bold ml-1">✓</span>}
                                  {showTeil3CheckResult && wrong && teil3Answers[task.id] === "falsch" && <span className="text-red-500 font-bold ml-1">✗</span>}
                                </label>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                    <div className={`mt-8 pt-6 border-t ${isLight ? "border-amber-500/30" : "border-amber-500/30"}`}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setShowTeil3CheckResult(true)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-800 hover:bg-emerald-600/50" : "bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/50"}`}
                        >
                          {language === "bg" ? "Проверка" : "Prüfen"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil3Answers((v) => !v)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-amber-500/20 border border-amber-500/50 text-amber-800 hover:bg-amber-500/30" : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"}`}
                        >
                          {showTeil3Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil3CheckResult && (() => {
                        const tasks = teil.teil3Exercise!.tasks;
                        const results = tasks.map((t) => ({ id: t.id, correct: teil3Answers[t.id] === t.correct }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className={`mt-6 p-4 rounded-xl ${isLight ? "bg-slate-100 border border-slate-300" : "bg-gray-900/50 border border-gray-600"}`}>
                            <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{richtig} von 5 richtig</p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                          <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Teil 3: Interview mit Luisa – Lösungen</p>
                          <ul className={`list-disc list-inside space-y-1 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                  <div className={`mt-10 pt-10 border-t-2 ${isLight ? "border-amber-500/40" : "border-amber-500/40"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>{language === "bg" ? "Задачи" : "Aufgaben"}</h3>
                    <h4 className={`text-lg font-semibold mt-6 mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.title} – {teil.subtitle}</h4>
                    <p className={`mb-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil4Exercise.intro}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil4Exercise.instruction1}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil4Exercise.instruction2}</p>
                    <p className={`font-bold my-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.teil4Exercise.instruction3}</p>
                    <p className={`mb-8 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil4Exercise.instruction4}</p>
                    <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgaben 15–20</p>
                    <div className="space-y-8">
                      {teil.teil4Exercise.tasks.map((task) => (
                        <div key={task.id} className={`rounded-xl p-6 ${isLight ? "border border-amber-200 bg-amber-50/30" : "border border-amber-700/30 bg-amber-900/10"}`}>
                          <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgabe {task.id}</p>
                          <p className={`mb-4 ${isLight ? "text-slate-800" : "text-gray-200"}`}>{task.prompt}</p>
                          <div className="space-y-2">
                            {task.options.map((opt) => {
                              const selected = teil4Answers[task.id] === opt.id;
                              const isCorrect = showTeil4CheckResult && selected && opt.id === task.correct;
                              const isWrong = showTeil4CheckResult && selected && opt.id !== task.correct;
                              return (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                  isCorrect ? "border-2 border-green-500 bg-green-900/20" : isWrong ? "border-2 border-red-500 bg-red-900/20" : teil4Answers[task.id] === opt.id
                                    ? "border-2 border-amber-400 bg-amber-900/20"
                                    : isLight ? "border border-slate-300 hover:border-amber-500/50" : "border border-gray-600 hover:border-amber-500/50"
                                }`}
                              >
                                <span className="font-bold min-w-[1.25rem]">{opt.id}</span>
                                <input
                                  type="radio"
                                  name={`teil4-${task.id}`}
                                  value={opt.id}
                                  checked={teil4Answers[task.id] === opt.id}
                                  onChange={() => setTeil4Answers((prev) => ({ ...prev, [task.id]: opt.id }))}
                                  className="w-4 h-4 text-amber-500 flex-shrink-0"
                                />
                                <span>{opt.text}</span>
                                {showTeil4CheckResult && selected && (isCorrect ? <span className="text-green-500 font-bold"> ✓</span> : <span className="text-red-500 font-bold"> ✗</span>)}
                              </label>
                            );})}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-8 pt-6 border-t ${isLight ? "border-amber-500/30" : "border-amber-500/30"}`}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setShowTeil4CheckResult(true)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-800 hover:bg-emerald-600/50" : "bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/50"}`}
                        >
                          {language === "bg" ? "Проверка" : "Prüfen"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil4Answers((v) => !v)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-amber-500/20 border border-amber-500/50 text-amber-800 hover:bg-amber-500/30" : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"}`}
                        >
                          {showTeil4Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil4CheckResult && (() => {
                        const tasks = teil.teil4Exercise!.tasks;
                        const results = tasks.map((t) => ({ id: t.id, correct: teil4Answers[t.id] === t.correct }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className={`mt-6 p-4 rounded-xl ${isLight ? "bg-slate-100 border border-slate-300" : "bg-gray-900/50 border border-gray-600"}`}>
                            <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{richtig} von 6 richtig</p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                          <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Teil 4: Keine Angst vor großen Zahlen – Lösungen</p>
                          <ul className={`list-disc list-inside space-y-1 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
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
                  <div className={`mt-10 pt-10 border-t-2 ${isLight ? "border-amber-500/40" : "border-amber-500/40"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>{language === "bg" ? "Задачи" : "Aufgaben"}</h3>
                    <h4 className={`text-lg font-semibold mt-6 mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.title} – {teil.subtitle}</h4>
                    <p className={`mb-4 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.intro}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.instruction1}</p>
                    <p className={`font-bold my-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.teil5Exercise.instruction2}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.instruction3}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.instruction4}</p>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.instruction5}</p>
                    {teil.teil5Exercise.instruction6 && <p className={`mb-8 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil5Exercise.instruction6}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Themen A–H</p>
                        <ul className={`space-y-2 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
                          {teil.teil5Exercise.activities.map((a) => (
                            <li key={a.id} className="flex gap-2">
                              <span className={`font-medium ${a.id === "Z" ? "bg-amber-200/50 dark:bg-amber-900/30 px-1 rounded" : ""}`}>({a.id})</span>
                              {a.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className={`font-semibold mb-4 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Aufgaben 0, 21–24</p>
                        <div className="space-y-4">
                          {teil.teil5Exercise.taskNumbers.map((nr) => {
                            const correctAnswers = teil.teil5Exercise!.correctAnswers;
                            const correct = showTeil5CheckResult && teil5Answers[nr] === correctAnswers[String(nr)];
                            const wrong = showTeil5CheckResult && teil5Answers[nr] && teil5Answers[nr] !== correctAnswers[String(nr)];
                            return (
                            <div key={nr} className={`flex items-center gap-3 ${correct ? "rounded-lg p-2 bg-green-900/20 border border-green-500" : wrong ? "rounded-lg p-2 bg-red-900/20 border border-red-500" : ""}`}>
                              <span className={`font-medium w-8 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{nr}</span>
                              <select
                                value={teil5Answers[nr] ?? ""}
                                onChange={(e) => setTeil5Answers((prev) => ({ ...prev, [nr]: e.target.value }))}
                                className={`flex-1 px-3 py-2 rounded-lg border ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-gray-800 border-gray-600 text-gray-200"}`}
                              >
                                <option value="">–</option>
                                {teil.teil5Exercise!.activities.filter((a) => a.id !== "Z" || nr === 0).map((a) => (
                                  <option key={a.id} value={a.id}>{a.id}</option>
                                ))}
                              </select>
                              {showTeil5CheckResult && teil5Answers[nr] && (correct ? <span className="text-green-500 font-bold">✓</span> : <span className="text-red-500 font-bold">✗</span>)}
                            </div>
                          );})}
                        </div>
                      </div>
                    </div>
                    <div className={`mt-8 pt-6 border-t ${isLight ? "border-amber-500/30" : "border-amber-500/30"}`}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setShowTeil5CheckResult(true)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-800 hover:bg-emerald-600/50" : "bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/50"}`}
                        >
                          {language === "bg" ? "Проверка" : "Prüfen"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil5Answers((v) => !v)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-amber-500/20 border border-amber-500/50 text-amber-800 hover:bg-amber-500/30" : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"}`}
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
                          <div className={`mt-6 p-4 rounded-xl ${isLight ? "bg-slate-100 border border-slate-300" : "bg-gray-900/50 border border-gray-600"}`}>
                            <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{richtig} von 5 richtig</p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${isLight ? "text-slate-800" : "text-gray-200"}`}>
                              {results.map(({ nr, correct }) => (
                                <li key={nr}>
                                  Aufgabe {nr}: {teil5Answers[nr] ? `Deine Antwort: ${teil5Answers[nr]}` : "keine Antwort"}
                                  {!correct && ` → richtig: ${correctAnswers[String(nr)]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil5Answers && (
                        <div className="mt-6">
                          <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Teil 5: Gäste in verschiedenen Fernsehsendungen – Lösungen</p>
                          <ul className={`list-disc list-inside space-y-1 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
                            {teil.teil5Exercise.taskNumbers.map((nr) => (
                              <li key={nr}>Aufgabe {nr}: <strong>{teil.teil5Exercise!.correctAnswers[String(nr)]}</strong></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {teil.id === "teil1" && teil.teil1Exercise && (
                  <div className={`mt-10 pt-10 border-t-2 ${isLight ? "border-amber-500/40" : "border-amber-500/40"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                      {language === "bg" ? "Задачи" : "Aufgaben"}
                    </h3>
                    <p className={`mb-2 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil1Exercise.instruction1}</p>
                    <p className={`font-bold my-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>{teil.teil1Exercise.question}</p>
                    <p className={`mb-1 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil1Exercise.instruction2}</p>
                    <p className={`mb-8 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{teil.teil1Exercise.instruction3}</p>
                    <div className="space-y-10">
                      {teil.teil1Exercise.szenen.map((sz) => (
                        <div key={sz.id} className={`rounded-xl p-6 ${isLight ? "border border-amber-200 bg-amber-50/30" : "border border-amber-700/30 bg-amber-900/10"}`}>
                          <p className={`font-semibold mb-2 ${isLight ? "text-amber-800" : "text-amber-200"}`}>Szene {sz.id}</p>
                          <p className={`text-sm mb-4 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{teil.teil1Exercise!.bildInstruction}</p>
                          <div className="grid grid-cols-3 gap-6">
                            {(["A", "B", "C"] as const).map((opt) => {
                              const correctAnswers = teil.teil1Exercise!.correctAnswers;
                              const selected = teil1Bilder[sz.id] === opt;
                              const isCorrect = showTeil1CheckResult && correctAnswers && selected && opt === correctAnswers[String(sz.id)];
                              const isWrong = showTeil1CheckResult && correctAnswers && selected && opt !== correctAnswers[String(sz.id)];
                              return (
                              <label
                                key={opt}
                                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  isCorrect ? "border-green-500 bg-green-900/20" : isWrong ? "border-red-500 bg-red-900/20" : teil1Bilder[sz.id] === opt
                                    ? "border-amber-400 bg-amber-900/20"
                                    : isLight ? "border-slate-300 hover:border-gray-500" : "border-gray-600 hover:border-gray-500"
                                }`}
                              >
                                <div className={`w-full aspect-[4/3] max-h-40 rounded border flex items-center justify-center overflow-hidden ${isLight ? "bg-slate-200 border-slate-300" : "bg-gray-700/50 border-gray-600"}`}>
                                  {sz[`bild${opt}` as keyof typeof sz] ? (
                                    <img
                                      src={sz[`bild${opt}` as keyof typeof sz] as string}
                                      alt={`Bild ${opt}`}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <span className={`text-sm ${isLight ? "text-slate-500" : "text-gray-500"}`}>Bild {opt}</span>
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
                                  {showTeil1CheckResult && selected && (isCorrect ? <span className="text-green-500 font-bold">✓</span> : isWrong ? <span className="text-red-500 font-bold">✗</span> : null)}
                                </span>
                              </label>
                            );})}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`mt-8 pt-6 border-t ${isLight ? "border-amber-500/30" : "border-amber-500/30"}`}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setShowTeil1CheckResult(true)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-emerald-600/30 border border-emerald-500/50 text-emerald-800 hover:bg-emerald-600/50" : "bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 hover:bg-emerald-600/50"}`}
                        >
                          {language === "bg" ? "Проверка" : "Prüfen"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil1Answers((v) => !v)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isLight ? "bg-amber-500/20 border border-amber-500/50 text-amber-800 hover:bg-amber-500/30" : "bg-amber-500/20 border border-amber-500/50 text-amber-200 hover:bg-amber-500/30"}`}
                        >
                          {showTeil1Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil1CheckResult && teil.teil1Exercise.correctAnswers && (() => {
                        const correctAnswers = teil.teil1Exercise!.correctAnswers!;
                        const results = [1, 2, 3, 4, 5].map((nr) => ({ nr, correct: teil1Bilder[nr] === correctAnswers[String(nr)] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className={`mt-6 p-4 rounded-xl ${isLight ? "bg-slate-100 border border-slate-300" : "bg-gray-900/50 border border-gray-600"}`}>
                            <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>
                              {richtig} von 5 richtig
                            </p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${isLight ? "text-slate-800" : "text-gray-200"}`}>
                              {results.map(({ nr, correct }) => (
                                <li key={nr}>
                                  Szene {nr}: {teil1Bilder[nr] ? `Deine Antwort: ${teil1Bilder[nr]}` : "keine Antwort"}
                                  {!correct && correctAnswers[String(nr)] && ` → richtig: ${correctAnswers[String(nr)]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil1Answers && teil.teil1Exercise.correctAnswers && (
                        <div className="mt-6">
                          <p className={`font-bold mb-3 ${isLight ? "text-amber-800" : "text-amber-200"}`}>
                            Teil 1 – Lösungen
                          </p>
                          <ul className={`list-disc list-inside space-y-1 ${isLight ? "text-slate-800" : "text-gray-200"}`}>
                            {[1, 2, 3, 4, 5].map((nr) => (
                              <li key={nr}>Szene {nr}: <strong>{teil.teil1Exercise!.correctAnswers![String(nr)]}</strong></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <p className={`mt-8 font-semibold ${isLight ? "text-amber-700" : "text-amber-300"}`}>
                  Ende {teil.title}
                </p>
              </section>
            ))}
          </div>
          <section className={`mt-12 p-6 rounded-xl border-2 ${isLight ? "border-amber-500/50 bg-amber-50/50" : "border-amber-500/50 bg-amber-900/10"}`}>
            <p className={`text-center mb-4 whitespace-pre-line ${isLight ? "text-slate-700" : "text-gray-300"}`}>
              Du hast jetzt 10 Minuten Zeit,{"\n"}um deine Lösungen auf das Antwortblatt zu übertragen.{"\n\n"}Ende Prüfungsteil Hörverstehen
            </p>
          </section>
          </>
        ) : (
          <div
            className={`p-8 rounded-xl border ${isLight ? "bg-white border-amber-500/30 text-slate-600" : "bg-gray-800/50 border-amber-500/30 text-gray-400"}`}
          >
            <p className="text-center">
              {language === "bg" ? "Съдържанието ще бъде добавено скоро." : language === "de" ? "Der Inhalt wird bald hinzugefügt." : "Content will be added soon."}
            </p>
          </div>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default DSDHorverstehen7View;
