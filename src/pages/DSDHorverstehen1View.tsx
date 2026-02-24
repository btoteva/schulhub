import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown, FaArrowUp } from "react-icons/fa";
import horverstehenData from "../data/dsd-horverstehen-1.json";

const DSDHorverstehen1View: React.FC = () => {
  const [teil1Bilder, setTeil1Bilder] = useState<Record<number, string>>({});
  const [teil2Answers, setTeil2Answers] = useState<Record<number, string>>({});
  const [teil3Answers, setTeil3Answers] = useState<Record<number, "richtig" | "falsch">>({});
  const [teil4Answers, setTeil4Answers] = useState<Record<number, string>>({});
  const [teil5Answers, setTeil5Answers] = useState<Record<number, string>>({});
  const [showTeil1Answers, setShowTeil1Answers] = useState(false);
  const [showTeil1CheckResult, setShowTeil1CheckResult] = useState(false);
  const teil1CorrectAnswers: Record<number, string> = { 1: "A", 2: "A", 3: "B", 4: "B", 5: "C" };
  const [showTeil2Answers, setShowTeil2Answers] = useState(false);
  const [showTeil2CheckResult, setShowTeil2CheckResult] = useState(false);
  const teil2CorrectAnswers: Record<number, string> = { 6: "A", 7: "C", 8: "B", 9: "B" };
  const [showTeil3Answers, setShowTeil3Answers] = useState(false);
  const [showTeil3CheckResult, setShowTeil3CheckResult] = useState(false);
  const teil3CorrectAnswers: Record<number, "richtig" | "falsch"> = { 10: "richtig", 11: "falsch", 12: "richtig", 13: "falsch", 14: "falsch" };
  const [showTeil4Answers, setShowTeil4Answers] = useState(false);
  const [showTeil4CheckResult, setShowTeil4CheckResult] = useState(false);
  const teil4CorrectAnswers: Record<number, string> = { 15: "B", 16: "A", 17: "C", 18: "B", 19: "A", 20: "C" };
  const [showTeil5Answers, setShowTeil5Answers] = useState(false);
  const [showTeil5CheckResult, setShowTeil5CheckResult] = useState(false);
  const teil5CorrectAnswers: Record<number, string> = { 21: "F", 22: "H", 23: "C", 24: "A" };
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
        }>;
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
        tasks: Array<{
          id: number;
          prompt: string;
          options: Array<{ id: string; text: string }>;
        }>;
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
          <h1 className="text-3xl font-bold text-amber-400">{data.title}</h1>
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

              {(teil as { intro?: string }).intro && (
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {(teil as { intro: string }).intro}
                </p>
              )}

              {(teil as { audioUrl?: string }).audioUrl && (
                <div className="mb-8 p-6 bg-gray-900/50 rounded-xl border border-amber-500/30">
                  <p className="text-amber-200 font-semibold mb-3">Audio – {teil.title}</p>
                  <audio
                    controls
                    className="w-full max-w-2xl"
                    src={(teil as { audioUrl: string }).audioUrl}
                  >
                    Вашият браузър не поддържа възпроизвеждане на аудио.
                  </audio>
                </div>
              )}

              {teil.scenes && (
                <div className="space-y-10">
                  {teil.scenes.map((scene) => (
                    <div key={scene.id}>
                      {teil.id !== "teil3" && (
                        <h4 className="text-lg font-bold text-amber-300 mb-4">
                          Szene {scene.id}
                        </h4>
                      )}
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

              {(teil as { aufgaben?: Array<{ id: number; text: string }>; itemLabel?: string }).aufgaben && (
                <div className="space-y-10">
                  {(teil as { aufgaben: Array<{ id: number; text: string }>; itemLabel?: string }).aufgaben.map((aufgabe) => (
                    <div key={aufgabe.id}>
                      <h4 className="text-lg font-bold text-amber-300 mb-4">
                        {((teil as { itemLabel?: string }).itemLabel || "Aufgabe")} {aufgabe.id}
                      </h4>
                      <p className="text-gray-200 leading-relaxed">{aufgabe.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {(teil as { content?: string }).content && (
                <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                  {(teil as { content: string }).content}
                </div>
              )}

              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold">
                Ende {teil.title}
              </p>

              {(teil as { teil1Exercise?: { instruction1: string; question: string; instruction2: string; instruction3: string; bildInstruction: string; szenen: Array<{ id: number; bildA?: string; bildB?: string; bildC?: string }> } }).teil1Exercise && (() => {
                const ex = (teil as { teil1Exercise: { instruction1: string; question: string; instruction2: string; instruction3: string; bildInstruction: string; szenen: Array<{ id: number; bildA?: string; bildB?: string; bildC?: string }> } }).teil1Exercise;
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
                          <p className="text-amber-200 font-semibold mb-2">Szene {sz.id}</p>
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
                                    return url ? (
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
                        const results = [1, 2, 3, 4, 5].map((nr) => ({ nr, correct: teil1Bilder[nr] === teil1CorrectAnswers[nr] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">
                              {richtig} von 5 richtig
                            </p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ nr, correct }) => (
                                <li key={nr} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>
                                    {correct ? "✓" : "✗"}
                                  </span>
                                  Szene {nr}: {teil1Bilder[nr] ? `Deine Antwort: ${teil1Bilder[nr]}` : "keine Antwort"} {!correct && teil1CorrectAnswers[nr] && ` → richtig: ${teil1CorrectAnswers[nr]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil1Answers && (
                        <div className="mt-6">
                          <p className="text-amber-200 font-bold mb-3">Teil 1: Straßenszenen – Lösungen</p>
                          <div className="overflow-x-auto inline-block">
                            <table className="border border-gray-600 rounded-lg overflow-hidden text-gray-200">
                              <thead>
                                <tr className="bg-gray-700/70">
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-16"></th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">A</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">B</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">C</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[1, 2, 3, 4, 5].map((nr) => (
                                  <tr key={nr} className="bg-gray-900/30">
                                    <td className="border border-gray-600 px-4 py-2 bg-gray-700/50 font-medium">{nr}</td>
                                    {(["A", "B", "C"] as const).map((opt) => (
                                      <td key={opt} className="border border-gray-600 px-4 py-2 text-center w-14">
                                        {teil1CorrectAnswers[nr] === opt ? (
                                          <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
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
                );
              })()}

              {(teil as { teil2Exercise?: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }> } }).teil2Exercise && (() => {
                const ex = (teil as { teil2Exercise: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }> } }).teil2Exercise;
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
                        const results = taskIds.map((id) => ({ id, correct: teil2Answers[id] === teil2CorrectAnswers[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">
                              {richtig} von 4 richtig
                            </p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>
                                    {correct ? "✓" : "✗"}
                                  </span>
                                  Aufgabe {id}: {teil2Answers[id] ? `Deine Antwort: ${teil2Answers[id]}` : "keine Antwort"} {!correct && teil2CorrectAnswers[id] && ` → richtig: ${teil2CorrectAnswers[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil2Answers && (
                        <div className="mt-6">
                          <p className="text-amber-200 font-bold mb-3">Teil 2: Nachrichten auf dem Anrufbeantworter – Lösungen</p>
                          <div className="overflow-x-auto inline-block">
                            <table className="border border-gray-600 rounded-lg overflow-hidden text-gray-200">
                              <thead>
                                <tr className="bg-gray-700/70">
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-16"></th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">A</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">B</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">C</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[6, 7, 8, 9].map((nr) => (
                                  <tr key={nr} className="bg-gray-900/30">
                                    <td className="border border-gray-600 px-4 py-2 bg-gray-700/50 font-medium">{nr}</td>
                                    {(["A", "B", "C"] as const).map((opt) => (
                                      <td key={opt} className="border border-gray-600 px-4 py-2 text-center w-14">
                                        {teil2CorrectAnswers[nr] === opt ? (
                                          <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
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
                );
              })()}

              {(teil as { teil3Exercise?: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; tasks: Array<{ id: number; statement: string }> } }).teil3Exercise && (() => {
                const ex = (teil as { teil3Exercise: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; tasks: Array<{ id: number; statement: string }> } }).teil3Exercise;
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction3}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction4}</p>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 10–14</p>
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
                        const results = taskIds.map((id) => ({ id, correct: teil3Answers[id] === teil3CorrectAnswers[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">
                              {richtig} von 5 richtig
                            </p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>
                                    {correct ? "✓" : "✗"}
                                  </span>
                                  Aufgabe {id}: {teil3Answers[id] ? `Deine Antwort: ${teil3Answers[id]}` : "keine Antwort"} {!correct && teil3CorrectAnswers[id] && ` → richtig: ${teil3CorrectAnswers[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil3Answers && (
                        <div className="mt-6">
                          <p className="text-amber-200 font-bold mb-3">Teil 3: Interview mit Hanna – Lösungen</p>
                          <div className="overflow-x-auto inline-block">
                            <table className="border border-gray-600 rounded-lg overflow-hidden text-gray-200">
                              <thead>
                                <tr className="bg-gray-700/70">
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-16"></th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-20">richtig</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-20">falsch</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[10, 11, 12, 13, 14].map((nr) => (
                                  <tr key={nr} className="bg-gray-900/30">
                                    <td className="border border-gray-600 px-4 py-2 bg-gray-700/50 font-medium">{nr}</td>
                                    <td className="border border-gray-600 px-4 py-2 text-center">
                                      {teil3CorrectAnswers[nr] === "richtig" ? (
                                        <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
                                      ) : (
                                        <span className="text-gray-600">□</span>
                                      )}
                                    </td>
                                    <td className="border border-gray-600 px-4 py-2 text-center">
                                      {teil3CorrectAnswers[nr] === "falsch" ? (
                                        <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
                                      ) : (
                                        <span className="text-gray-600">□</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {(teil as { teil4Exercise?: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }> } }).teil4Exercise && (() => {
                const ex = (teil as { teil4Exercise: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; tasks: Array<{ id: number; prompt: string; options: Array<{ id: string; text: string }> }> } }).teil4Exercise;
                return (
                  <div className="mt-12 pt-10 border-t-2 border-amber-500/40">
                    <h3 className="text-xl font-bold text-amber-400 mb-2">Hörverstehen – Aufgaben</h3>
                    <h4 className="text-lg font-semibold text-amber-200 mt-6 mb-4">{teil.title} – {teil.subtitle}</h4>
                    <p className="text-gray-300 mb-2">{ex.instruction1}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction2}</p>
                    <p className="text-gray-300 mb-2">{ex.instruction3}</p>
                    <p className="text-amber-200 font-bold my-3">{ex.instruction4}</p>
                    <p className="text-gray-300 mb-8">{ex.instruction5}</p>
                    <p className="text-amber-200 font-semibold mb-4">Aufgaben 15–20</p>
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
                        const results = taskIds.map((id) => ({ id, correct: teil4Answers[id] === teil4CorrectAnswers[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">
                              {richtig} von 6 richtig
                            </p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>
                                    {correct ? "✓" : "✗"}
                                  </span>
                                  Aufgabe {id}: {teil4Answers[id] ? `Deine Antwort: ${teil4Answers[id]}` : "keine Antwort"} {!correct && teil4CorrectAnswers[id] && ` → richtig: ${teil4CorrectAnswers[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil4Answers && (
                        <div className="mt-6">
                          <p className="text-amber-200 font-bold mb-3">Teil 4: Anna in Frankreich – Lösungen</p>
                          <div className="overflow-x-auto inline-block">
                            <table className="border border-gray-600 rounded-lg overflow-hidden text-gray-200">
                              <thead>
                                <tr className="bg-gray-700/70">
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-16"></th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">A</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">B</th>
                                  <th className="border border-gray-600 px-4 py-2 text-amber-200 font-semibold w-14">C</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[15, 16, 17, 18, 19, 20].map((nr) => (
                                  <tr key={nr} className="bg-gray-900/30">
                                    <td className="border border-gray-600 px-4 py-2 bg-gray-700/50 font-medium">{nr}</td>
                                    {(["A", "B", "C"] as const).map((opt) => (
                                      <td key={opt} className="border border-gray-600 px-4 py-2 text-center w-14">
                                        {teil4CorrectAnswers[nr] === opt ? (
                                          <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
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
                );
              })()}

              {(teil as { teil5Exercise?: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; instruction6: string; activities: Array<{ id: string; text: string }>; exampleNr: number; exampleLetter: string; taskNumbers: number[] } }).teil5Exercise && (() => {
                const ex = (teil as { teil5Exercise: { instruction1: string; instruction2: string; instruction3: string; instruction4: string; instruction5: string; instruction6: string; activities: Array<{ id: string; text: string }>; exampleNr: number; exampleLetter: string; taskNumbers: number[] } }).teil5Exercise;
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
                      <p className="text-amber-200 font-semibold mb-3">Aktivitäten</p>
                      <ul className="space-y-1">
                        {ex.activities.map((a) => (
                          <li key={a.id} className={a.id === "Z" ? "text-gray-400 bg-gray-800/50 rounded px-2 py-1" : "text-gray-200"}>
                            <span className="font-medium text-amber-300/90">({a.id})</span> {a.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-amber-200 font-semibold mb-4">Nr. / Buchstabe</p>
                    <div className="overflow-x-auto">
                      <table className="w-full max-w-md border border-gray-600 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-800/70">
                            <th className="border-b border-gray-600 px-4 py-3 text-left text-amber-200 font-semibold">Nr.</th>
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
                        const results = taskIds.map((id) => ({ id, correct: teil5Answers[id] === teil5CorrectAnswers[id] }));
                        const richtig = results.filter((r) => r.correct).length;
                        return (
                          <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-600">
                            <p className="text-amber-200 font-bold mb-3">
                              {richtig} von 4 richtig
                            </p>
                            <ul className="space-y-1 text-gray-200">
                              {results.map(({ id, correct }) => (
                                <li key={id} className="flex items-center gap-2">
                                  <span className={correct ? "text-green-400" : "text-red-400"}>
                                    {correct ? "✓" : "✗"}
                                  </span>
                                  Nr. {id}: {teil5Answers[id] ? `Deine Antwort: ${teil5Answers[id]}` : "keine Antwort"} {!correct && teil5CorrectAnswers[id] && ` → richtig: ${teil5CorrectAnswers[id]}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                      {showTeil5Answers && (
                        <div className="mt-6">
                          <p className="text-amber-200 font-bold mb-3">Teil 5: Wie war das Wochenende? – Lösungen</p>
                          <div className="overflow-x-auto inline-block">
                            <table className="border border-gray-600 rounded-lg overflow-hidden text-gray-200">
                              <thead>
                                <tr className="bg-gray-700/70">
                                  <th className="border border-gray-600 px-3 py-2 text-amber-200 font-semibold w-12"></th>
                                  {(["A", "B", "C", "D", "E", "F", "G", "H"] as const).map((letter) => (
                                    <th key={letter} className="border border-gray-600 px-3 py-2 text-amber-200 font-semibold text-center w-10">{letter}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {[21, 22, 23, 24].map((nr) => (
                                  <tr key={nr} className="bg-gray-900/30">
                                    <td className="border border-gray-600 px-3 py-2 bg-gray-700/50 font-medium">{nr}</td>
                                    {(["A", "B", "C", "D", "E", "F", "G", "H"] as const).map((opt) => (
                                      <td key={opt} className="border border-gray-600 px-3 py-2 text-center">
                                        {teil5CorrectAnswers[nr] === opt ? (
                                          <span className="text-amber-400 font-bold" aria-label="richtig">✗</span>
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
                );
              })()}
            </section>
          ))}
        </div>

        <section className="mt-12 p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/10">
          <p className="text-amber-400 font-bold text-lg text-left mb-4">
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

export default DSDHorverstehen1View;
