import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowUp } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const DSDSchriftliche3View: React.FC = () => {
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
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          to="/german/dsd-tests"
          className={`inline-flex items-center gap-2 mb-8 ${isLight ? "text-amber-600 hover:text-amber-700" : "text-amber-400 hover:text-amber-600 dark:text-amber-300"}`}
        >
          <FaArrowLeft />
          DSD I Тестове
        </Link>

        <header className="mb-8">
          <h1 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>DSD I Modellsatz 3</h1>
          <p className={isLight ? "text-slate-600 mt-1" : "text-gray-400 mt-1"}>Schriftliche Kommunikation Aufgabe</p>
        </header>

        <section className="bg-white dark:bg-gray-800/40 rounded-xl p-8 border border-amber-500/30 shadow-sm dark:shadow-none">
          <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-6">Zu-spät-Kommen</h2>

          <p className="text-slate-900 dark:text-gray-200 leading-relaxed mb-8">
            In einem Internetforum gibt es eine Diskussion zum Thema „Zu-spät-Kommen“. Du findest hier dazu folgende Aussagen:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Kathrin</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Ich finde es total blöd, zu spät zu kommen. Daher bin ich selbst immer sehr pünktlich und ich finde, dass auch andere pünktlich sein sollen. Dann muss niemand warten.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20 rounded-bl-3xl">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Raphael</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Ich verpasse oft den Bus, weil ich zu spät an der Haltestelle bin. Dann komme ich zu spät zur Schule und meine Klassenlehrerin informiert meine Eltern. Das ist total peinlich!
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20 rounded-bl-3xl">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Christoph</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Früher bin ich oft zu spät gekommen. Meine Freunde haben sich damals darüber geärgert. Heute bin ich meistens pünktlich und wenn nicht, dann schreibe ich eine kurze Nachricht.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Ines</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Ich bin eigentlich immer zu spät, aber meine Freunde auch. Deswegen ist das nicht so schlimm. Meine Eltern aber mögen es überhaupt nicht und ärgern sich darüber.
              </p>
            </div>
          </div>

          <p className="text-amber-600 dark:text-amber-300 font-bold text-lg mb-4">
            Schreibe einen Beitrag für die Schülerzeitung deiner Schule.
          </p>
          <p className="text-slate-900 dark:text-gray-200 font-semibold mb-3">
            Bearbeite in deinem Beitrag die folgenden drei Punkte:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-900 dark:text-gray-200 mb-8 pl-2">
            <li>Gib alle vier Aussagen aus dem Internetforum <strong>mit eigenen Worten</strong> wieder.</li>
            <li>Kommst du oft zu spät? Berichte ausführlich.</li>
            <li>Sollte man immer pünktlich sein? Begründe deine Meinung ausführlich.</li>
          </ul>

          <div className="pt-6 border-t border-amber-500/30 text-slate-700 dark:text-gray-300">
            <p className="font-semibold">Du hast insgesamt <span className="text-amber-600 dark:text-amber-300 font-bold">75 Minuten</span> Zeit.</p>
            <p className="mt-2 font-semibold">Du brauchst die Wörter nicht zu zählen!</p>
          </div>
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

export default DSDSchriftliche3View;
