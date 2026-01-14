import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface DictionaryWord {
  word: string;
  translation: string;
  example: string;
  example_translation: string;
}

interface DictionarySection {
  id: string;
  headingId: string;
  title: string;
  words: DictionaryWord[];
}

const LessonView: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Dictionary data for lesson 5.3
  const dictionaryData: DictionarySection[] = [
    {
      id: "nomen",
      headingId: "nomen-heading",
      title: "🟩 Съществителни (Nomen)",
      words: [
        { word: "die Pumpe, -n", translation: "помпа", example: "Das Herz erfüllt die Funktion einer 'Pumpe'...", example_translation: "Сърцето изпълнява функцията на 'помпа'..." },
        { word: "das Leben, -", translation: "живот", example: "...während des ganzen Lebens des Menschen...", example_translation: "...през целия живот на човека..." },
        { word: "der Mensch, -en", translation: "човек", example: "...des ganzen Lebens des Menschen...", example_translation: "...на целия живот на човека..." },
        { word: "das Herz-Kreislauf-System, -e", translation: "сърдечно-съдова система", example: "Das Herz-Kreislauf-System ist eine Verbindung von Organen...", example_translation: "Сърдечно-съдовата система е съвкупност от органи..." },
        { word: "das Organ, -e", translation: "орган", example: "...eine Verbindung von Organen...", example_translation: "...съвкупност от органи..." },
        { word: "der Fluss, Flüsse", translation: "поток", example: "...die den Fluss des Bluts gewährleisten.", example_translation: "...които осигуряват потока на кръв." },
        { word: "die Lymphe", translation: "лимфа", example: "...den Fluss des Bluts und der Lymphe...", example_translation: "...потока на кръв и лимфа..." },
        { word: "der Organismus, -men", translation: "организъм", example: "...im Organismus gewährleisten.", example_translation: "...осигуряват в организма." },
        { word: "das Blutgefäß, -e", translation: "кръвоносен съд", example: "...aus Blut- und Lymphgefäßen...", example_translation: "...от кръвоносни и лимфни съдове..." },
        { word: "die Arterie, -n", translation: "артерия", example: "Das Blutkreislaufsystem besteht aus Herz, Arterien...", example_translation: "Кръвоносната система се състои от сърце, артерии..." },
        { word: "die Kapillare, -n", translation: "капиляр", example: "...besteht aus Herz, Arterien, Kapillaren und Venen.", example_translation: "...състои се от сърце, артерии, капиляри и вени." },
        { word: "die Vene, -n", translation: "вена", example: "...besteht aus Herz, Arterien, Kapillaren und Venen.", example_translation: "...състои се от сърце, артерии, капиляри и вени." },
        { word: "das Herz, -en", translation: "сърце", example: "Das Herz ist ein muskuläres Hohlorgan...", example_translation: "Сърцето е мускулест кух орган..." },
        { word: "der Vorhof, Vorhöfe", translation: "предсърдие", example: "...zwei Vorhöfen und zwei Kammern.", example_translation: "...две предсърдия и две камери." },
        { word: "die Kammer, -n", translation: "камера (на сърцето)", example: "...zwei Vorhöfen und zwei Kammern.", example_translation: "...две предсърдия и две камери." },
        { word: "die Aorta", translation: "аорта", example: "...das größte Blutgefäß ab die Aorta.", example_translation: "...най-големият кръвоносен съд - аортата." }
      ]
    },
    {
      id: "verben",
      headingId: "verben-heading",
      title: "🟦 Глаголи (Verben)",
      words: [
        { word: "arbeiten", translation: "работя", example: "...die während des ganzen Lebens... arbeitet?", example_translation: "...която работи през целия живот...?" },
        { word: "aufhören", translation: "спирам, преставам", example: "...ohne aufzuhören arbeitet?", example_translation: "...работи без да спира?" },
        { word: "pumpen", translation: "помпам", example: "...die das Blut... hinein-pumpt...", example_translation: "...която изпомпва кръвта..." },
        { word: "fließen", translation: "тека", example: "Durch die linke Herzhälfte fließt Arterienblut...", example_translation: "През лявата половина на сърцето тече артериална кръв..." },
        { word: "verhindern", translation: "предотвратявам", example: "...und den Rückfluss zu den Kammern verhindern.", example_translation: "...и предотвратяват връщането в камерите." }
      ]
    },
    {
      id: "adj",
      headingId: "adj-heading",
      title: "🟨 Прилагателни / наречия (Adjektive & Adverbien)",
      words: [
        { word: "muskulär", translation: "мускулен", example: "Das Herz ist ein muskuläres Hohlorgan...", example_translation: "Сърцето е мускулест кух орган..." },
        { word: "rhythmisch", translation: "ритмичен", example: "...das rhythmisch kontrahiert...", example_translation: "...който се съкращава ритмично..." },
        { word: "menschlich", translation: "човешки", example: "Das menschliche Herz besteht aus vier Teilen...", example_translation: "Човешкото сърце се състои от четири части..." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* Navigation Header */}
      <header className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/lessons/${courseId}`}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span>Назад</span>
            </Link>

            <button
              onClick={toggleMenu}
              className="md:hidden bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Меню
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu - Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={toggleMenu}>
          <nav className="fixed top-0 left-0 h-full w-80 bg-gray-900 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-green-400 mb-4">MENÜ</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="block text-gray-300 hover:text-white py-2">
                    HOME
                  </Link>
                </li>
                <li className="text-green-400 italic">Biologie</li>
                <li>
                  <a href="#" className="block text-gray-300 hover:text-white py-2 text-sm">
                    2.1. VERDAUUNGSSYSTEM. ERNÄHRUNG
                  </a>
                </li>
                <li>
                  <a href="#" className="block text-gray-300 hover:text-white py-2 text-sm">
                    5.3 HERZ-KREISLAUF-SYSTEM. HERZTÄTIGKEIT. BLUTKREISLAUF
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Lesson Title */}
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            5.3 BLUTKREISLAUF
          </h1>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-300">
            HERZ-KREISLAUF-SYSTEM. HERZTÄTIGKEIT.
          </h2>

          {/* Dictionary Sections */}
          {dictionaryData.map((section) => (
            <div key={section.id} className="mb-16">
              <h3 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                {section.title}
              </h3>

              <div className="space-y-6">
                {section.words.map((wordData, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-green-400">{wordData.word}</span>
                          <span className="text-xl text-gray-400 ml-3">→ {wordData.translation}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-300 italic">
                            <span className="text-blue-400 font-semibold">DE:</span> {wordData.example}
                          </p>
                          <p className="text-gray-400">
                            <span className="text-green-400 font-semibold">BG:</span> {wordData.example_translation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. Всички права запазени.</p>
        </div>
      </footer>
    </div>
  );
};

export default LessonView;
