import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown, FaArrowUp } from "react-icons/fa";
import horverstehenData from "../data/dsd-horverstehen-1.json";

const DSDHorverstehen1View: React.FC = () => {
  const [teil1Bilder, setTeil1Bilder] = useState<Record<number, string>>({});
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
                      <h4 className="text-lg font-bold text-amber-300 mb-4">
                        Szene {scene.id}
                      </h4>
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
                  </div>
                );
              })()}
            </section>
          ))}
        </div>

        <section className="mt-12 p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/10">
          <p className="text-amber-400 font-semibold text-center">
            Ende Prüfungsteil Hörverstehen
          </p>
        </section>
      </main>
    </div>
  );
};

export default DSDHorverstehen1View;
