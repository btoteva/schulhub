import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowDown, FaArrowUp, FaHeadphones } from "react-icons/fa";
import horverstehenData from "../data/dsd-horverstehen-3.json";

const DSDHorverstehen3View: React.FC = () => {
  const data = horverstehenData as {
    title: string;
    titleBg: string;
    subtitle: string;
    horverstehenInstructions?: string;
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

              {teil.aufgaben && teil.aufgaben.length > 0 && (
                <div className="space-y-8">
                  {teil.aufgaben.map((aufgabe) => (
                    <div key={aufgabe.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30">
                      <p className="text-amber-200 font-semibold mb-4">Aufgabe {aufgabe.id}</p>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-line">{aufgabe.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {teil.scenes && teil.scenes.length > 0 && (
                <div className="space-y-10">
                  {teil.scenes.map((scene) => (
                    <div key={scene.id} className="border border-gray-600 rounded-xl p-6 bg-gray-900/30">
                      <p className="text-amber-200 font-semibold mb-4">Szene {scene.id}</p>
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

              <p className="mt-8 pt-6 border-t border-amber-500/30 text-amber-400 font-semibold text-center">
                Ende {teil.title}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DSDHorverstehen3View;
