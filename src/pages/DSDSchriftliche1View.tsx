import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import ScrollToTopButton from "../components/ScrollToTopButton";

const DSDSchriftliche1View: React.FC = () => {
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
          <h1 className={`text-3xl font-bold ${isLight ? "text-amber-600" : "text-amber-400"}`}>DSD I Modellsatz 1</h1>
          <p className={isLight ? "text-slate-600 mt-1" : "text-gray-400 mt-1"}>Schriftliche Kommunikation – Hausaufgaben</p>
        </header>

        <section className="bg-white dark:bg-gray-800/40 rounded-xl p-8 border border-amber-500/30 shadow-sm dark:shadow-none">
          <h1 className="text-2xl font-bold text-amber-400 mb-6">Hausaufgaben</h1>

          <p className="text-slate-900 dark:text-gray-200 leading-relaxed mb-8">
            In einem Internetforum gibt es eine Diskussion zum Thema „Hausaufgaben“. Du findest hier dazu folgende Aussagen:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Tim</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Ich finde Hausaufgaben sehr wichtig. Da kann ich zu Hause noch einmal in Ruhe üben und sehen, ob ich alles gut kann. Das ist eine gute Kontrolle.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20 rounded-bl-3xl">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Laura</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Hausaufgaben sind sinnlos. Wenn ich im Unterricht etwas nicht verstanden habe, lerne ich es auch nicht, wenn ich es zu Hause nur wiederhole. Wir sollten in der Schule mehr üben.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20 rounded-bl-3xl">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Klara</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                Nach der Schule habe ich überhaupt keine Lust mehr auf Hausaufgaben und Lernen. Ich bin müde und brauche Zeit zur Erholung und für meine Freunde und Hobbys.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-100 dark:bg-gray-900/60 border border-amber-500/20">
              <p className="text-amber-600 dark:text-amber-300 font-semibold mb-2">Peter</p>
              <p className="text-slate-900 dark:text-gray-200 text-sm leading-relaxed">
                An unserer Schule machen wir unsere Hausaufgaben in der Schule. Es gibt dafür spezielle Übungsstunden am Nachmittag. Da kann auch ein Lehrer helfen. Das finde ich gut.
              </p>
            </div>
          </div>

          <p className="text-amber-200 font-bold text-lg mb-4">
            Schreibe einen Beitrag für die Schülerzeitung deiner Schule.
          </p>
          <p className="text-slate-900 dark:text-gray-200 font-semibold mb-3">
            Bearbeite in deinem Beitrag die folgenden drei Punkte:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-900 dark:text-gray-200 mb-8 pl-2">
            <li>Gib alle vier Aussagen aus dem Internetforum mit eigenen Worten wieder.</li>
            <li>Wie sieht es an deiner Schule mit Hausaufgaben aus? Berichte ausführlich.</li>
            <li>Sind Hausaufgaben sinnvoll? Begründe deine Meinung ausführlich.</li>
          </ul>

          <div className="pt-6 border-t border-amber-500/30 text-gray-300">
            <p className="font-semibold">Du hast insgesamt <span className="text-amber-600 dark:text-amber-300 font-bold">75 Minuten</span> Zeit.</p>
            <p className="mt-2">Du brauchst die Wörter nicht zu zählen!</p>
          </div>
        </section>
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default DSDSchriftliche1View;
