import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import dsdData from "../data/dsd-modellsatz-3.json";

const STORAGE_KEY = "schulhub-dsd-modellsatz-3";

interface DSDState {
  teil1?: Record<number, string>;
  teil1_aufgabe5?: string;
  teil2?: Record<number, string>;
  teil3?: Record<number, string>;
  teil4?: Record<number, string>;
  teil5?: Record<number, string>;
}

const DSDModellsatz3View: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"test" | "dictionary">("test");
  const [vocabularyCellExpanded, setVocabularyCellExpanded] = useState<{ row: number; col: "synonyms" | "explanation" } | null>(null);
  const [answers, setAnswers] = useState<DSDState>({});
  const [showResults, setShowResults] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const skipSaveRef = useRef(true);
  const { t } = useLanguage();
  const data = dsdData as {
    title: string;
    titleBg: string;
    subtitle: string;
    subtitleBg: string;
    leseverstehenInstructions?: string;
    vocabulary?: Array<{ word: string; synonyms?: string; explanation?: string; synonymsOrExplanation?: string; synonymsBg?: string; explanationBg?: string; synonymsOrExplanationBg?: string; wordBg: string }>;
    teile: Array<{
      id: string;
      title: string;
      titleBg: string;
      subtitle?: string;
      intro?: string;
      text?: string;
      wordList?: Array<{ id: string; word: string; wordBg: string }>;
      tasks?: Array<{ id: number; gap?: number; correct: string; question: string } | { id: number; statement: string; correct: string }>;
      aufgabe5?: { question: string; questionBg: string; intro?: string; options: Array<{ id: string; text: string; correct: boolean }> };
      instruction?: string;
      instructionBg?: string;
      persons?: Array<{ id: string; label: string }>;
      emails?: Array<{ id: number; text: string; correct: string }>;
      tableTitle?: string;
      optionsHeading?: string;
      summaries?: Array<{ id: number; text: string; correct: string; isExample?: boolean }>;
      emailOptions?: Array<{ id: string; text: string }>;
      headlineOptions?: Array<{ id: string; text: string }>;
      questions?: Array<{ id: number; question: string; options: Array<{ id: string; text: string; correct: boolean }> }>;
    }>;
  };

  useEffect(() => {
    skipSaveRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DSDState;
        setAnswers(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  const updateAnswer = (teil: keyof DSDState, taskId: number | "aufgabe5", value: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (taskId === "aufgabe5") {
        next.teil1_aufgabe5 = value;
      } else {
        const key = teil as "teil1" | "teil2" | "teil3" | "teil4" | "teil5";
        next[key] = { ...(next[key] || {}), [taskId]: value };
      }
      return next;
    });
  };

  const clearProgress = () => {
    setAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const teil1 = data.teile.find((t) => t.id === "teil1");
  const teil2 = data.teile.find((t) => t.id === "teil2");
  const teil3 = data.teile.find((t) => t.id === "teil3");
  const teil4 = data.teile.find((t) => t.id === "teil4");
  const teil5 = data.teile.find((t) => t.id === "teil5");

  const getScore = () => {
    let correct = 0;
    let total = 0;
    if (teil1) {
      teil1.tasks?.forEach((t) => {
        total++;
        if (answers.teil1?.[t.id] === t.correct) correct++;
      });
      if (teil1.aufgabe5) {
        total++;
        const opt = teil1.aufgabe5.options.find((o) => o.correct);
        if (opt && answers.teil1_aufgabe5 === opt.id) correct++;
      }
    }
    if (teil2?.summaries) {
      teil2.summaries.forEach((s) => {
        if (s.isExample) return;
        total++;
        if (answers.teil2?.[s.id] === s.correct) correct++;
      });
    }
    if (teil3?.tasks) {
      teil3.tasks.forEach((t) => {
        total++;
        if (answers.teil3?.[t.id] === (t as { correct: string }).correct) correct++;
      });
    }
    if (teil4?.questions) {
      teil4.questions.forEach((q) => {
        total++;
        const opt = q.options.find((o) => o.correct);
        if (opt && answers.teil4?.[q.id] === opt.id) correct++;
      });
    }
    if (teil5?.summaries) {
      teil5.summaries.forEach((s) => {
        if ((s as { isExample?: boolean }).isExample) return;
        total++;
        if (answers.teil5?.[s.id] === s.correct) correct++;
      });
    }
    return { correct, total };
  };

  const { correct, total } = getScore();
  const hasOnlyTeil1 = data.teile.length === 1;
  const hasTeil2 = !!teil2?.summaries;
  const hasTeil3 = !!teil3?.tasks;
  const hasTeil4 = !!teil4?.questions;
  const hasTeil5 = !!teil5?.summaries;
  const { theme } = useTheme();
  const isLight = theme === "light";

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
          DSD I Тестове
        </Link>

        <header className="mb-8">
          <h1 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>{data.title}</h1>
          <p className={isLight ? "text-slate-600 mt-1" : "text-slate-800 dark:text-gray-400 mt-1"}>{data.subtitle}</p>
        </header>

        <div className="flex gap-2 mb-6 border-b border-amber-500/30">
          <button type="button" onClick={() => setActiveTab("test")} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "test" ? "bg-amber-600 text-white" : isLight ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{t.vocabularyTestTab}</button>
          <button type="button" onClick={() => setActiveTab("dictionary")} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === "dictionary" ? "bg-amber-600 text-white" : isLight ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{t.dictionary}</button>
        </div>

        {activeTab === "dictionary" && (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-amber-500/30 overflow-hidden">
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
        {data.leseverstehenInstructions && (
          <p className="mb-8 text-slate-900 dark:text-gray-300 leading-relaxed max-w-3xl">
            {data.leseverstehenInstructions.split(/\*\*(.*?)\*\*/g).map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="font-bold text-amber-700 dark:text-amber-200">{part}</strong> : part
            )}
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-amber-500/30">
          <p className="text-slate-900 dark:text-gray-300 text-sm">
            Напредъкът се запазва автоматично. Можеш да продължиш по-късно.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowResults((prev) => !prev)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg"
            >
              {showResults ? "Скрий отговорите" : "Провери отговори"}
            </button>
            <button
              type="button"
              onClick={clearProgress}
              className="px-4 py-2 text-amber-700 dark:text-amber-200 bg-amber-900/50 hover:bg-amber-800/50 border border-amber-600/50 rounded-lg"
            >
              Изчисти напредъка
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
              className="px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-slate-900 dark:text-white font-semibold rounded-lg inline-flex items-center gap-2"
              title="Надолу"
            >
              <FaArrowDown />
              Надолу
            </button>
          </div>
        </div>

        {showResults && (
          <div className="mb-8 p-6 bg-amber-900/20 border-2 border-amber-500 rounded-xl">
            <p className="text-xl font-bold text-amber-300">
              Резултат: {correct} / {total}
            </p>
          </div>
        )}

        <div className="space-y-12">
          {/* Teil 1 */}
          {teil1 && (
            <section className="bg-white dark:bg-gray-800/50 rounded-xl p-8 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">{teil1.title}</h2>
              {(teil1 as { instruction?: string }).instruction && (
                <p className="text-slate-900 dark:text-gray-300 mb-4 whitespace-pre-line">{(teil1 as { instruction: string }).instruction}</p>
              )}
              <p className="text-slate-900 dark:text-gray-300 leading-relaxed mb-6">
                {(() => {
                  const sortedTasks = [...(teil1.tasks || [])].sort(
                    (a, b) => (a as { gap: number }).gap - (b as { gap: number }).gap
                  );
                  const segments: Array<string | { type: "gap"; task: { id: number; correct: string } }> = [];
                  let rest = teil1.text || "";
                  for (const task of sortedTasks) {
                    const t = task as { id: number; gap: number; correct: string };
                    const ph = `(${t.gap}) ________`;
                    const idx = rest.indexOf(ph);
                    if (idx === -1) continue;
                    segments.push(rest.slice(0, idx));
                    segments.push({ type: "gap", task: t });
                    rest = rest.slice(idx + ph.length);
                  }
                  segments.push(rest);
                  return segments.map((seg, i) =>
                    typeof seg === "string" ? (
                      <React.Fragment key={i}>
                        {seg.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                          j % 2 === 1 ? <strong key={j} className="text-amber-700 dark:text-amber-200 font-medium">{part}</strong> : part
                        )}
                      </React.Fragment>
                    ) : (
                      <span key={i} className="inline-flex items-center align-baseline gap-1 mx-0.5">
                        <span className="text-amber-700 dark:text-amber-200/80 font-medium">({seg.task.id})</span>
                        <select
                          value={answers.teil1?.[seg.task.id] || ""}
                          onChange={(e) => updateAnswer("teil1", seg.task.id, e.target.value)}
                          className={`inline-block min-w-[10rem] bg-slate-200 dark:bg-gray-700 border rounded px-2 py-1 text-slate-900 dark:text-white text-base align-middle ${
                            showResults && answers.teil1?.[seg.task.id] === seg.task.correct
                              ? "border-green-500"
                              : showResults && answers.teil1?.[seg.task.id]
                                ? "border-red-500"
                                : "border-slate-300 dark:border-gray-600"
                          }`}
                        >
                          <option value="">--</option>
                          {teil1.wordList?.map((w) => (
                            <option key={w.id} value={w.id}>
                              ({w.id}) {w.word}
                            </option>
                          ))}
                        </select>
                        {showResults && answers.teil1?.[seg.task.id] && (
                          <span
                            className={
                              answers.teil1?.[seg.task.id] === seg.task.correct
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {answers.teil1?.[seg.task.id] === seg.task.correct ? "✓" : "✗"}
                          </span>
                        )}
                      </span>
                    )
                  );
                })()}
              </p>
              {teil1.aufgabe5 && teil1.aufgabe5.intro && (
                <p className="font-bold text-amber-700 dark:text-amber-200 mt-6 mb-2 whitespace-pre-line">{teil1.aufgabe5.intro}</p>
              )}
              {teil1.aufgabe5 && (
                <div className="mt-4 p-6 bg-slate-100 dark:bg-slate-200 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-amber-700 dark:text-amber-200 mb-4">{teil1.aufgabe5.question}</p>
                  <div className="space-y-2">
                    {teil1.aufgabe5.options.map((opt) => {
                      const selected = answers.teil1_aufgabe5 === opt.id;
                      const isCorrect = showResults && opt.correct;
                      const isWrong = showResults && selected && !opt.correct;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                            isCorrect ? "bg-green-900/30" : isWrong ? "bg-red-900/30" : "hover:bg-slate-300 dark:hover:bg-gray-600/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="aufgabe5"
                            value={opt.id}
                            checked={selected}
                            onChange={() => updateAnswer("teil1", "aufgabe5", opt.id)}
                            className="w-4 h-4"
                          />
                          <span>{opt.id}) {opt.text}</span>
                          {showResults && selected && (
                            <span className={opt.correct ? "text-green-400" : "text-red-400"}>
                              {opt.correct ? "✓" : "✗"}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende Teil 1
              </p>
            </section>
          )}

          {/* Teil 2–5: rendered when present in data */}
          {teil2 && teil2.summaries && teil2.emailOptions && (
            <section className="bg-white dark:bg-gray-800/50 rounded-xl p-8 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                {teil2.title}
                {teil2.subtitle && `: ${teil2.subtitle}`}
              </h2>
              {teil2.intro && (
                <p className="text-slate-900 dark:text-gray-300 mb-6 whitespace-pre-line">
                  {teil2.intro.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-amber-700 dark:text-amber-200 font-semibold">{part}</strong> : part
                  )}
                </p>
              )}
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-200 mb-3">{teil2.optionsHeading || "E-Mails A–H"}</h3>
              <div className="mb-8 space-y-3 text-slate-900 dark:text-gray-300 text-sm">
                {teil2.emailOptions.map((em) => (
                  <p key={em.id}><strong>{em.id}</strong>: {em.text}</p>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-200 mb-3">{teil2.tableTitle || "Aufgaben 6–9"}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-200 dark:bg-gray-700/50">
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200 w-16">Nr.</th>
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200">Zusammenfassung</th>
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200 w-24">Buchstabe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teil2.summaries.map((row) => {
                      const isExample = row.isExample === true;
                      const selected = answers.teil2?.[row.id];
                      const isCorrect = showResults && !isExample && selected === row.correct;
                      const isWrong = showResults && !isExample && selected && selected !== row.correct;
                      return (
                        <tr
                          key={row.id}
                          className={isCorrect ? "bg-green-900/20" : isWrong ? "bg-red-900/20" : ""}
                        >
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-slate-900 dark:text-gray-200">{row.id}</td>
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-slate-900 dark:text-gray-200">{row.text}</td>
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2">
                            {isExample ? (
                              <span className="text-amber-300 font-semibold">{row.correct}</span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <select
                                  value={selected || ""}
                                  onChange={(e) => updateAnswer("teil2", row.id, e.target.value)}
                                  className={`bg-slate-200 dark:bg-gray-700 border rounded px-2 py-1 text-slate-900 dark:text-white w-14 ${
                                    isCorrect ? "border-green-500" : isWrong ? "border-red-500" : "border-slate-300 dark:border-gray-600"
                                  }`}
                                >
                                  <option value="">–</option>
                                  {teil2.emailOptions!.filter((em) => em.id !== "Z").map((em) => (
                                    <option key={em.id} value={em.id}>{em.id}</option>
                                  ))}
                                </select>
                                {showResults && selected && (
                                  <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                                    {isCorrect ? "✓" : "✗"}
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende Teil 2
              </p>
            </section>
          )}

          {teil3 && teil3.tasks && (
            <section className="bg-white dark:bg-gray-800/50 rounded-xl p-8 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                {teil3.title}
                {teil3.subtitle && `: ${teil3.subtitle}`}
              </h2>
              {teil3.intro && (
                <p className="text-slate-900 dark:text-gray-300 mb-4 whitespace-pre-line">{teil3.intro}</p>
              )}
              {teil3.text && (
                <div className="text-slate-900 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{teil3.text}</div>
              )}
              <div className="space-y-4">
                {teil3.tasks.map((t) => {
                  const task = t as { id: number; statement: string; correct: string };
                  const selected = answers.teil3?.[task.id];
                  const isCorrect = showResults && selected === task.correct;
                  const isWrong = showResults && selected && selected !== task.correct;
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect ? "border-green-500 bg-green-900/20" : isWrong ? "border-red-500 bg-red-900/20" : "border-slate-300 dark:border-gray-600"
                      }`}
                    >
                      <p className="text-slate-900 dark:text-gray-200 mb-3">{task.id}. {task.statement}</p>
                      <div className="flex gap-4">
                        {(["richtig", "falsch"] as const).map((val) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`teil3-${task.id}`}
                              value={val}
                              checked={selected === val}
                              onChange={() => updateAnswer("teil3", task.id, val)}
                              className="w-4 h-4"
                            />
                            <span>{val}</span>
                          </label>
                        ))}
                      </div>
                      {showResults && selected && (
                        <span className={`mt-2 block font-semibold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                          {isCorrect ? "✓ Верен отговор" : "✗ Грешен отговор"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende Teil 3
              </p>
            </section>
          )}

          {teil4 && teil4.questions && (
            <section className="bg-white dark:bg-gray-800/50 rounded-xl p-8 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                {teil4.title}
                {teil4.subtitle && `: ${teil4.subtitle}`}
              </h2>
              {teil4.intro && (
                <p className="text-slate-900 dark:text-gray-300 mb-4 whitespace-pre-line">{teil4.intro}</p>
              )}
              {teil4.text && (
                <div className="text-slate-900 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line">{teil4.text}</div>
              )}
              <div className="space-y-6">
                {teil4.questions.map((q) => {
                  const selected = answers.teil4?.[q.id];
                  const correctOpt = q.options.find((o) => o.correct);
                  const isCorrect = showResults && selected === correctOpt?.id;
                  const isWrong = showResults && selected && selected !== correctOpt?.id;
                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-xl border ${
                        isCorrect ? "border-green-500 bg-green-900/20" : isWrong ? "border-red-500 bg-red-900/20" : "border-slate-300 dark:border-gray-600"
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-white mb-4">{q.id}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                              !showResults ? "hover:bg-slate-100 dark:bg-slate-200 dark:bg-gray-700/50" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name={`teil4-${q.id}`}
                              value={opt.id}
                              checked={selected === opt.id}
                              onChange={() => updateAnswer("teil4", q.id, opt.id)}
                              className="w-4 h-4"
                            />
                            <span>{opt.id}) {opt.text}</span>
                            {showResults && selected === opt.id && (
                              <span className={opt.correct ? "text-green-400" : "text-red-400"}>
                                {opt.correct ? "✓" : "✗"}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende Teil 4
              </p>
            </section>
          )}

          {teil5 && teil5.summaries && teil5.headlineOptions && (
            <section className="bg-white dark:bg-gray-800/50 rounded-xl p-8 border border-amber-500/30">
              <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">
                {teil5.title}
                {teil5.subtitle && `: ${teil5.subtitle}`}
              </h2>
              {teil5.intro && (
                <p className="text-slate-900 dark:text-gray-300 mb-6 whitespace-pre-line">{teil5.intro}</p>
              )}
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-200 mb-3">Überschriften A–H</h3>
              <div className="mb-8 space-y-2 text-slate-900 dark:text-gray-300 text-sm">
                {teil5.headlineOptions.map((h) => (
                  <p key={h.id}><strong>{h.id}</strong>: {h.text}</p>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-200 mb-3">{teil5.tableTitle || "Aufgaben 21–24"}</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-200 dark:bg-gray-700/50">
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200 w-16">Nr.</th>
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200">Text</th>
                      <th className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-left text-amber-700 dark:text-amber-200 w-24">Buchstabe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teil5.summaries.map((row) => {
                      const isExample = (row as { isExample?: boolean }).isExample === true;
                      const selected = answers.teil5?.[row.id];
                      const isCorrect = showResults && !isExample && selected === row.correct;
                      const isWrong = showResults && !isExample && selected && selected !== row.correct;
                      return (
                        <tr
                          key={row.id}
                          className={isCorrect ? "bg-green-900/20" : isWrong ? "bg-red-900/20" : ""}
                        >
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-slate-900 dark:text-gray-200">{row.id}</td>
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2 text-slate-900 dark:text-gray-200">{row.text}</td>
                          <td className="border border-slate-300 dark:border-gray-600 px-4 py-2">
                            {isExample ? (
                              <span className="text-amber-300 font-semibold">{row.correct}</span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <select
                                  value={selected || ""}
                                  onChange={(e) => updateAnswer("teil5", row.id, e.target.value)}
                                  className={`bg-slate-200 dark:bg-gray-700 border rounded px-2 py-1 text-slate-900 dark:text-white w-14 ${
                                    isCorrect ? "border-green-500" : isWrong ? "border-red-500" : "border-slate-300 dark:border-gray-600"
                                  }`}
                                >
                                  <option value="">–</option>
                                  {(teil5.headlineOptions ?? []).filter((h) => h.id !== "Z").map((h) => (
                                    <option key={h.id} value={h.id}>{h.id}</option>
                                  ))}
                                </select>
                                {showResults && selected && (
                                  <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                                    {isCorrect ? "✓" : "✗"}
                                  </span>
                                )}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende Teil 5
              </p>
            </section>
          )}

          {/* Ende Leseverstehen */}
          <section className="mt-12 p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/10">
            <p className="text-amber-700 dark:text-amber-200 font-medium whitespace-pre-line text-center mb-6">
              {hasOnlyTeil1 && !hasTeil2
                ? "Bitte übertrage nun deine Lösungen (1–5) auf das Antwortblatt."
                : "Bitte übertrage nun deine Lösungen (1–24) auf das Antwortblatt."}
              {"\n"}
              Ende Prüfungsteil Leseverstehen
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const next = !showAnswerKey;
                  setShowAnswerKey(next);
                  if (next) setShowResults(true);
                  else setShowResults(false);
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg"
              >
                {showAnswerKey ? "Скрий отговорите" : "Покажи отговорите"}
              </button>
              <button
                type="button"
                onClick={clearProgress}
                className="px-6 py-3 text-amber-700 dark:text-amber-200 bg-amber-900/50 hover:bg-amber-800/50 border border-amber-600/50 rounded-lg font-semibold"
              >
                Изчисти напредъка
              </button>
              </div>

            {showAnswerKey && (
              <div className="mt-8 p-6 bg-slate-200 dark:bg-gray-900/80 rounded-xl border border-amber-500/30 text-left">
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mb-6">Deutsches Sprachdiplom der KMK DSD I – Leseverstehen Lösungsschlüssel (Modellsatz 3)</h3>
                <div className="space-y-5 text-slate-900 dark:text-gray-300 text-sm leading-relaxed">
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-200 mb-1">Teil 1</p>
                    <p>1 D &nbsp;&nbsp; 2 A &nbsp;&nbsp; 3 B &nbsp;&nbsp; 4 F &nbsp;&nbsp; 5 A</p>
                  </div>
                  {hasTeil2 && (
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-200 mb-1">Teil 2: Wer macht mit?</p>
                      <p>6 B &nbsp;&nbsp; 7 H &nbsp;&nbsp; 8 E &nbsp;&nbsp; 9 G</p>
                    </div>
                  )}
                  {hasTeil3 && (
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-200 mb-1">Teil 3: Kreativer Unterricht – Wo spielt die Musik?</p>
                      <p>10 richtig &nbsp;&nbsp; 11 falsch &nbsp;&nbsp; 12 richtig &nbsp;&nbsp; 13 richtig &nbsp;&nbsp; 14 falsch</p>
                    </div>
                  )}
                  {hasTeil4 && (
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-200 mb-1">Teil 4: Ein Schuljahr in Australien</p>
                      <p>15 B &nbsp;&nbsp; 16 B &nbsp;&nbsp; 17 A &nbsp;&nbsp; 18 B &nbsp;&nbsp; 19 C &nbsp;&nbsp; 20 A</p>
                    </div>
                  )}
                  {hasTeil5 && (
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-200 mb-1">Teil 5: Welche Überschrift passt?</p>
                      <p>21 A &nbsp;&nbsp; 22 C &nbsp;&nbsp; 23 F &nbsp;&nbsp; 24 D</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
          </>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default DSDModellsatz3View;
