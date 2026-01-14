import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { getLessonById } from '../data/lessons';

const LessonView: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'dictionary'>('content');
  const [currentSpeaking, setCurrentSpeaking] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayAllIndex, setCurrentPlayAllIndex] = useState(0);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingAllRef = useRef(false);
  const currentPlayAllIndexRef = useRef(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load lesson data dynamically
  const lessonData = getLessonById(Number(courseId), lessonId || '');

  // If lesson not found, redirect back
  if (!lessonData) {
    return <Navigate to={`/lessons/${courseId}`} replace />;
  }

  const dictionaryData = lessonData.dictionary;

  // Split content into sentences
  const sentences = lessonData.content
    ? lessonData.content
        .split('\n\n')
        .filter(s => s.trim().length > 0)
    : [];

  // Function to speak a single sentence
  const speakSentence = (text: string, index: number, autoPlay: boolean = false) => {
    // If already speaking this sentence and not auto-playing, stop it
    if (currentSpeaking === index && !autoPlay) {
      window.speechSynthesis.cancel();
      setCurrentSpeaking(null);
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE'; // German language
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onend = () => {
      setCurrentSpeaking(null);

      // If playing all, move to next sentence
      if (isPlayingAllRef.current) {
        const nextIndex = currentPlayAllIndexRef.current + 1;
        if (nextIndex < sentences.length) {
          currentPlayAllIndexRef.current = nextIndex;
          setCurrentPlayAllIndex(nextIndex);
          setTimeout(() => {
            speakSentence(sentences[nextIndex], nextIndex, true);
          }, 500); // Small pause between sentences
        } else {
          isPlayingAllRef.current = false;
          setIsPlayingAll(false);
          currentPlayAllIndexRef.current = 0;
          setCurrentPlayAllIndex(0);
        }
      }
    };

    speechSynthRef.current = utterance;
    setCurrentSpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  // Function to play all sentences sequentially
  const togglePlayAll = () => {
    if (isPlayingAll) {
      // Pause
      window.speechSynthesis.cancel();
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      setCurrentSpeaking(null);
    } else {
      // Start playing from the beginning or resume
      isPlayingAllRef.current = true;
      setIsPlayingAll(true);
      const startIndex = currentPlayAllIndex;
      currentPlayAllIndexRef.current = startIndex;
      if (sentences.length > 0) {
        speakSentence(sentences[startIndex], startIndex, true);
      }
    }
  };

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
            {lessonData.title}
          </h1>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-300">
            {lessonData.subtitle}
          </h2>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'content'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Съдържание на урока
            </button>
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'dictionary'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Речник
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === 'content' && lessonData.content && (
            <div>
              {/* Play All Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={togglePlayAll}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    isPlayingAll
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg'
                  }`}
                >
                  {isPlayingAll ? (
                    <>
                      <FaPause />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      <span>Пусни всички</span>
                    </>
                  )}
                </button>
              </div>

              {/* Content with individual sentence buttons */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
                <div className="prose prose-invert prose-lg max-w-none space-y-4">
                  {sentences.map((sentence, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
                        currentSpeaking === index
                          ? 'bg-green-900/30 border-l-4 border-green-500'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <button
                        onClick={() => speakSentence(sentence, index)}
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                          currentSpeaking === index
                            ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg'
                        }`}
                        title={currentSpeaking === index ? 'Спри' : 'Слушай'}
                      >
                        {currentSpeaking === index ? (
                          <FaPause className="text-white text-sm" />
                        ) : (
                          <FaVolumeUp className="text-white text-sm" />
                        )}
                      </button>
                      <p className="text-gray-300 leading-relaxed flex-1">
                        {sentence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dictionary Tab */}
          {activeTab === 'dictionary' && (
            <div>
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
          )}
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
