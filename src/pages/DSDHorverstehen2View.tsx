import React, { useState } from "react";

type Teil1Exercise = {
  instruction1: string;
  question: string;
  instruction2: string;
  instruction3: string;
  bildInstruction: string;
  szenen: Array<{ id: number; bildA?: string; bildB?: string; bildC?: string }>;
};
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown, FaArrowUp, FaHeadphones } from "react-icons/fa";
import horverstehenData from "../data/dsd-horverstehen-2.json";

const TEIL1_CORRECT: Record<number, string> = { 1: "B", 2: "A", 3: "A", 4: "C", 5: "B" };
const TEIL2_CORRECT: Record<number, string> = { 6: "A", 7: "B", 8: "C", 9: "C" };
const TEIL3_CORRECT: Record<number, "richtig" | "falsch"> = { 10: "falsch", 11: "falsch", 12: "richtig", 13: "richtig", 14: "falsch" };
const TEIL4_CORRECT: Record<number, string> = { 15: "B", 16: "A", 17: "A", 18: "C", 19: "C", 20: "B" };
const TEIL5_CORRECT: Record<number, string> = { 21: "E", 22: "C", 23: "F", 24: "G" };

const DSDHorverstehen2View: React.FC = () => {
  const [teil1Bilder, setTeil1Bilder] = useState<Record<number, string>>({});
  const [showTeil1Answers, setShowTeil1Answers] = useState(false);
  const [showTeil1CheckResult, setShowTeil1CheckResult] = useState(false);
  const [teil2Answers, setTeil2Answers] = useState<Record<number, string>>({});
  const [showTeil2Answers, setShowTeil2Answers] = useState(false);
  const [showTeil2CheckResult, setShowTeil2CheckResult] = useState(false);
  const [teil3Answers, setTeil3Answers] = useState<Record<number, "richtig" | "falsch">>({});
  const [showTeil3Answers, setShowTeil3Answers] = useState(false);
  const [showTeil3CheckResult, setShowTeil3CheckResult] = useState(false);
  const [teil4Answers, setTeil4Answers] = useState<Record<number, string>>({});
  const [showTeil4Answers, setShowTeil4Answers] = useState(false);
  const [showTeil4CheckResult, setShowTeil4CheckResult] = useState(false);
  const [teil5Answers, setTeil5Answers] = useState<Record<number, string>>({});
  const [showTeil5Answers, setShowTeil5Answers] = useState(false);
  const [showTeil5CheckResult, setShowTeil5CheckResult] = useState(false);
  const data = horverstehenData as {
    title: string;
    titleBg: string;
    subtitle: string;
    horverstehenInstructions?: string;
    teile: Array<{
      id: string;
      title: string;
      subtitle: string;
      intro?: string;
      audioUrl?: string;
      content?: string;
      scenes?: Array<{
        id: number;
        lines: Array<{ speaker: string; text: string }>;
      }>;
      aufgaben?: Array<{ id: number; text: string }>;
      itemLabel?: string;
      teil1Exercise?: Teil1Exercise;
      teil2Exercise?: {
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        instruction5: string;
        tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }>;
      };
      teil3Exercise?: {
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        tasks: Array<{ id: number; statement: string }>;
      };
      teil4Exercise?: {
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        instruction5: string;
        tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }>;
      };
      teil5Exercise?: {
        instruction1: string;
        instruction2: string;
        instruction3: string;
        instruction4: string;
        instruction5: string;
        instruction6: string;
        activities: Array<{ id: string; text: string }>;
        exampleNr: number;
        exampleLetter: string;
        taskNumbers: number[];
      };
    }>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/german/dsd-tests"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-8"
        >
          <FaArrowLeft />
          DSD I Тестове
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-amber-600/80 flex items-center justify-center">
              <FaHeadphones className="text-white text-xl" />
            </div>
            <h1 className="text-3xl font-bold text-amber-400">{data.title}</h1>
          </div>
          <p className="text-gray-400 mt-1">{data.subtitle}</p>
          {data.horverstehenInstructions && (
            <p className="text-gray-300 mt-6 leading-relaxed max-w-3xl">
              {data.horverstehenInstructions}
            </p>
          )}
        </header>

        <div className="flex gap-3 mb-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg inline-flex items-center gap-2"
          >
            <FaArrowDown />
            Надолу
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg inline-flex items-center gap-2"
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
              <h2 className="text-2xl font-bold text-amber-400 mb-2">
                {teil.title}
              </h2>
              <h3 className="text-xl font-semibold text-amber-200 mb-4">
                {teil.subtitle}
              </h3>

              {teil.intro && (
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {teil.intro}
                </p>
              )}

              {teil.audioUrl && (
                <div className="mb-8 p-6 bg-gray-900/50 rounded-xl border border-amber-500/30">
                  <p className="text-amber-200 font-semibold mb-3 flex items-center gap-2">
                    <FaHeadphones className="text-amber-400" />
                    Audio – {teil.title}
                  </p>
                  <audio
                    controls
                    className="w-full max-w-2xl"
                    src={teil.audioUrl}
                  >
                    Вашият браузър не поддържа възпроизвеждане на аудио.
                  </audio>
                </div>
              )}

              {teil.aufgaben && (
                <div className="space-y-10">
                  {teil.aufgaben.map((aufgabe) => (
                    <div key={aufgabe.id}>
                      <h4 className="text-lg font-bold text-amber-300 mb-4">
                        {teil.itemLabel || "Aufgabe"} {aufgabe.id}
                      </h4>
                      <p className="text-gray-200 leading-relaxed">{aufgabe.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {teil.scenes && (
                <div className="space-y-10">
                  {teil.scenes.map((scene) => (
                    <div key={scene.id}>
                      <div className="space-y-3">
                        {scene.lines.map((line, i) => (
                          <p key={i} className="text-gray-200 leading-relaxed">
                            <span className="font-semibold text-amber-200">
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

              {teil.content && (
                <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                  {teil.content}
                </div>
              )}

              {teil.teil1Exercise && (() => {
                const ex = teil.teil1Exercise;
                const defaultBilder = { A: "https://i.imgur.com/FhxWjQy.png", B: "https://i.imgur.com/jCGQlwH.png", C: "https://i.imgur.com/fsuHMC2.png" };
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.question}</p>
                    <p className="text-gray-300 mb-1">{ex.instruction2}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction3}</p>
                    <div className="space-y-10">
                      {ex.szenen.map((sz) => (
                        <div key={sz.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30">
                          <p className="text-gray-400 text-sm mb-4">{ex.bildInstruction}</p>
                          <div className="grid grid-cols-3 gap-6">
                            {(["A", "B", "C"] as const).map((opt) => (
                              <label
                                key={opt}
                                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                  teil1Bilder[sz.id] === opt
                                    ? "border-amber-400 bg-amber-900/20"
                                    : "border-gray-600 hover:border-gray-500"
                                }`}
                              >
                                <div className="w-full aspect-[4/3] max-h-32 bg-gray-700/50 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
                                  {(() => {
                                    const url = (sz as { bildA?: string; bildB?: string; bildC?: string })[`bild${opt}` as "bildA" | "bildB" | "bildC"] ?? defaultBilder[opt];
                                    return typeof url === "string" ? (
                                      <img src={url} alt={`Bild ${opt}`} className="w-full h-full object-contain" />
                                    ) : (
                                      <span className="text-gray-500 text-sm">Bild {opt}</span>
                                    );
                                  })()}
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
                          className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                        >
                          {showTeil1Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil1CheckResult && (() => {
                        const results = [1, 2, 3, 4, 5].map((nr) => ({ nr, correct: teil1Bilder[nr] === TEIL1_CORRECT[nr] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-semibold mb-2">
                              {richtig} von 5 richtig
                            </p>
                            {results.map((r) => (
                              <p key={r.nr} className={r.correct ? "text-emerald-300" : "text-red-300"}>
                                {r.nr}: {r.correct ? "✓" : `✗ (richtig: ${TEIL1_CORRECT[r.nr]})`}
                              </p>
                            ))}
                          </div>
                        );
                      })()}
                      {showTeil1Answers && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-amber-500/30">
                          <p className="text-amber-200 font-semibold mb-2">Lösungen:</p>
                          {[1, 2, 3, 4, 5].map((nr) => (
                            <p key={nr} className="text-gray-200">{nr}: {TEIL1_CORRECT[nr]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {teil.teil2Exercise && (() => {
                const ex = teil.teil2Exercise;
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction3}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction4}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction5}</p>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 6-9</p>
                    <div className="space-y-8">
                      {ex.tasks.map((task) => (
                        <div key={task.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30">
                          <p className="text-amber-200 font-semibold mb-4">Aufgabe {task.id}</p>
                          <p className="text-gray-200 mb-4">{task.prompt}</p>
                          <div className="space-y-2">
                            {task.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  teil2Answers[task.id] === opt.id
                                    ? "border-amber-400 bg-amber-900/20"
                                    : "border-gray-600 hover:border-gray-500"
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
                                <span className="text-gray-200">{opt.id}. {opt.text}</span>
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
                          className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                        >
                          {showTeil2Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil2CheckResult && (() => {
                        const taskIds = [6, 7, 8, 9];
                        const results = taskIds.map((id) => ({ id, correct: teil2Answers[id] === TEIL2_CORRECT[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">{richtig} von 4 richtig</p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>{correct ? "✓" : "✗"}</span>
                                  Aufgabe {id}: {teil2Answers[id] ? `Deine Antwort: ${teil2Answers[id]}` : "keine Antwort"}{" "}
                                  {!correct && TEIL2_CORRECT[id] && ` → richtig: ${TEIL2_CORRECT[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil2Answers && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-amber-500/30">
                          <p className="text-amber-200 font-semibold mb-2">Lösungen:</p>
                          {[6, 7, 8, 9].map((id) => (
                            <p key={id} className="text-gray-200">Aufgabe {id}: {TEIL2_CORRECT[id]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {teil.teil3Exercise && (() => {
                const ex = teil.teil3Exercise;
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction3}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction4}</p>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 10-14</p>
                    <div className="space-y-6">
                      {ex.tasks.map((task) => (
                        <div key={task.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30 flex flex-col sm:flex-row sm:items-center gap-4">
                          <p className="text-gray-200 font-semibold sm:min-w-[2.5rem]">Aufgabe {task.id}</p>
                          <p className="text-gray-200 flex-1">{task.statement}</p>
                          <div className="flex gap-6 flex-shrink-0">
                            <label className={`flex items-center gap-2 cursor-pointer ${teil3Answers[task.id] === "richtig" ? "text-green-400" : "text-gray-400"}`}>
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
                            <label className={`flex items-center gap-2 cursor-pointer ${teil3Answers[task.id] === "falsch" ? "text-red-400" : "text-gray-400"}`}>
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
                          </div>
                        </div>
                      ))}
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
                          className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                        >
                          {showTeil3Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil3CheckResult && (() => {
                        const taskIds = [10, 11, 12, 13, 14];
                        const results = taskIds.map((id) => ({ id, correct: teil3Answers[id] === TEIL3_CORRECT[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">{richtig} von 5 richtig</p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>{correct ? "✓" : "✗"}</span>
                                  Aufgabe {id}: {teil3Answers[id] ? `Deine Antwort: ${teil3Answers[id]}` : "keine Antwort"}{" "}
                                  {!correct && TEIL3_CORRECT[id] && ` → richtig: ${TEIL3_CORRECT[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil3Answers && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-amber-500/30">
                          <p className="text-amber-200 font-semibold mb-2">Lösungen:</p>
                          {[10, 11, 12, 13, 14].map((id) => (
                            <p key={id} className="text-gray-200">Aufgabe {id}: {TEIL3_CORRECT[id]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {teil.teil4Exercise && (() => {
                const ex = teil.teil4Exercise;
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction3}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction4}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction5}</p>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 15-20</p>
                    <div className="space-y-8">
                      {ex.tasks.map((task) => (
                        <div key={task.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30">
                          <p className="text-amber-200 font-semibold mb-4">Aufgabe {task.id}</p>
                          <p className="text-gray-200 mb-4">{task.prompt}</p>
                          <div className="space-y-2">
                            {task.options.map((opt) => (
                              <label
                                key={opt.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  teil4Answers[task.id] === opt.id
                                    ? "border-amber-400 bg-amber-900/20"
                                    : "border-gray-600 hover:border-gray-500"
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
                                <span className="text-gray-200">{opt.id}. {opt.text}</span>
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
                          className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                        >
                          {showTeil4Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil4CheckResult && (() => {
                        const taskIds = [15, 16, 17, 18, 19, 20];
                        const results = taskIds.map((id) => ({ id, correct: teil4Answers[id] === TEIL4_CORRECT[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">{richtig} von 6 richtig</p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>{correct ? "✓" : "✗"}</span>
                                  Aufgabe {id}: {teil4Answers[id] ? `Deine Antwort: ${teil4Answers[id]}` : "keine Antwort"}{" "}
                                  {!correct && TEIL4_CORRECT[id] && ` → richtig: ${TEIL4_CORRECT[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil4Answers && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-amber-500/30">
                          <p className="text-amber-200 font-semibold mb-2">Lösungen:</p>
                          {[15, 16, 17, 18, 19, 20].map((id) => (
                            <p key={id} className="text-gray-200">Aufgabe {id}: {TEIL4_CORRECT[id]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {teil.teil5Exercise && (() => {
                const ex = teil.teil5Exercise;
                const letterOptions = ex.activities.filter((a) => a.id !== "Z");
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction3}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction4}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction5}</p>
                    <p className="text-gray-300 mb-6">{ex.instruction6}</p>
                    <div className="mb-8 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                      <p className="text-amber-200 font-semibold mb-3">Titel A-H</p>
                      <ul className="space-y-1">
                        {ex.activities.map((a) => (
                          <li key={a.id} className={a.id === "Z" ? "text-gray-400 bg-gray-800/50 rounded px-2 py-1" : "text-gray-200"}>
                            <span className="font-medium text-amber-300/90">({a.id})</span> {a.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 21-24</p>
                    <div className="overflow-x-auto">
                      <table className="w-full max-w-md border border-gray-600 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-800/70">
                            <th className="border-b border-gray-600 px-4 py-3 text-left text-amber-200 font-semibold">Aufgabe</th>
                            <th className="border-b border-gray-600 px-4 py-3 text-left text-amber-200 font-semibold">Buchstabe</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-200">
                          <tr className="border-b border-gray-600 bg-gray-900/30">
                            <td className="px-4 py-3">{ex.exampleNr}</td>
                            <td className="px-4 py-3 text-amber-300 font-medium">{ex.exampleLetter}</td>
                          </tr>
                          {ex.taskNumbers.map((nr) => (
                            <tr key={nr} className="border-b border-gray-600 bg-gray-900/30">
                              <td className="px-4 py-3">{nr}</td>
                              <td className="px-4 py-2">
                                <select
                                  value={teil5Answers[nr] ?? ""}
                                  onChange={(e) => setTeil5Answers((prev) => ({ ...prev, [nr]: e.target.value }))}
                                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 min-w-[4rem]"
                                >
                                  <option value="">–</option>
                                  {letterOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.id}</option>
                                  ))}
                                </select>
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
                          onClick={() => setShowTeil5CheckResult(true)}
                          className="px-4 py-2 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-200 font-semibold hover:bg-emerald-600/50 transition-colors"
                        >
                          Проверка
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowTeil5Answers((v) => !v)}
                          className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 font-semibold hover:bg-amber-500/30 transition-colors"
                        >
                          {showTeil5Answers ? "Lösungen verbergen" : "Lösungen anzeigen"}
                        </button>
                      </div>
                      {showTeil5CheckResult && (() => {
                        const taskIds = [21, 22, 23, 24];
                        const results = taskIds.map((id) => ({ id, correct: teil5Answers[id] === TEIL5_CORRECT[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">{richtig} von 4 richtig</p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>{correct ? "✓" : "✗"}</span>
                                  Nr. {id}: {teil5Answers[id] ? `Deine Antwort: ${teil5Answers[id]}` : "keine Antwort"}{" "}
                                  {!correct && TEIL5_CORRECT[id] && ` → richtig: ${TEIL5_CORRECT[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil5Answers && (
                        <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-amber-500/30">
                          <p className="text-amber-200 font-semibold mb-2">Lösungen:</p>
                          {[21, 22, 23, 24].map((id) => (
                            <p key={id} className="text-gray-200">Nr. {id}: {TEIL5_CORRECT[id]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold">
                Ende {teil.title}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-12 p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/10">
          <p className="text-gray-300 text-center mb-4">
            Du hast jetzt 10 Minuten Zeit, um deine Lösungen auf das Antwortblatt zu übertragen.
          </p>
          <p className="text-amber-400 font-semibold text-center">
            Ende Prüfungsteil Hörverstehen
          </p>
        </section>

        <div className="mt-12 flex justify-center pb-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-400 transition-colors"
            aria-label="Nach oben"
          >
            <FaArrowUp className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default DSDHorverstehen2View;
