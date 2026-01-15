import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaTimes,
} from "react-icons/fa";
import { getLessonById } from "../data/lessons";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";

const LessonView: React.FC = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const {
    getFontSizeValue,
    getFontFamilyClass,
    getGermanFontSizeValue,
    getGermanFontFamilyClass,
  } = useFont();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "dictionary" | "flashcards"
  >("content");
  const [currentSpeaking, setCurrentSpeaking] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayAllIndex, setCurrentPlayAllIndex] = useState(0);
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(
    new Set()
  );
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
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
  const lessonData = getLessonById(Number(courseId), lessonId || "");

  // If lesson not found, redirect back
  if (!lessonData) {
    return <Navigate to={`/lessons/${courseId}`} replace />;
  }

  const dictionaryData = lessonData.dictionary;

  // Combine all words from all dictionary sections
  const allWords = dictionaryData.flatMap((section) => section.words);

  // Flashcard state
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleFlashcard = (index: number) => {
    const newSet = new Set(flippedCards);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setFlippedCards(newSet);
  };

  // Tooltip state for word hover
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [wordTranslation, setWordTranslation] = useState<string | null>(null);

  // Function to find word translation in dictionary
  const findWordTranslation = (word: string): string | null => {
    const cleanWord = word
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:\u2014\-()]+$/g, "");

    for (const section of dictionaryData) {
      const found = section.words.find((w) => {
        // Extract base word from dictionary entry (remove article, commas, and declension info)
        // E.g., "die Pumpe, -n" -> "pumpe"
        const dictWord = w.word
          .toLowerCase()
          .replace(/^(der|die|das|ein|eine|einen|einem|eines)\s+/i, "") // Remove articles
          .replace(/[,\-].*$/, "") // Remove declension info after comma or dash
          .trim();

        // Check for exact match or if it's a compound word
        if (dictWord === cleanWord) return true;

        // Also check if the dictionary word is part of a compound
        if (cleanWord.includes(dictWord) && dictWord.length > 3) return true;

        return false;
      });

      if (found) return found.translation;
    }
    return null;
  };

  // Handle word hover
  const handleWordHover = (
    e: React.MouseEvent<HTMLSpanElement>,
    word: string
  ) => {
    const translation = findWordTranslation(word);
    if (translation) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredWord(word);
      setWordTranslation(translation);
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  // Handle word mouse leave
  const handleWordLeave = () => {
    setHoveredWord(null);
    setWordTranslation(null);
  };

  // Use sentences from lessonData if available, otherwise split content
  const sentences =
    lessonData.sentences ||
    (lessonData.content
      ? lessonData.content
          .split("\n\n")
          .filter((s) => s.trim().length > 0)
          .map((text) => ({ text, translation: "" }))
      : []);

  // Speak individual word or example
  const speakWord = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle expanded sentences (allow multiple open)
  const toggleExpandedSentence = (index: number) => {
    const newSet = new Set(expandedSentences);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedSentences(newSet);
  };

  // Function to speak a single sentence with word highlighting
  const speakSentence = (
    sentenceObj: { text: string; translation: string },
    index: number,
    autoPlay: boolean = false
  ) => {
    // If already speaking this sentence and not auto-playing, stop it
    if (currentSpeaking === index && !autoPlay) {
      window.speechSynthesis.cancel();
      setCurrentSpeaking(null);
      setHighlightedWord(null);
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const text = sentenceObj.text;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE"; // German language
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        const word = text.substring(
          event.charIndex,
          event.charIndex + (event.charLength || 0)
        );
        setHighlightedWord(word.trim());
      }
    };

    utterance.onend = () => {
      setCurrentSpeaking(null);
      setHighlightedWord(null);

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
              <span>{t.back}</span>
            </Link>

            <button
              onClick={toggleMenu}
              className="md:hidden bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              {t.menu}
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu - Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={toggleMenu}>
          <nav
            className="fixed top-0 left-0 h-full w-80 bg-gray-900 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-green-400 mb-4">{t.menu.toUpperCase()}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="block text-gray-300 hover:text-white py-2"
                  >
                    {t.home.toUpperCase()}
                  </Link>
                </li>
                <li className="text-green-400 italic">{t.biologyCourseTitle}</li>
                <li>
                  <a
                    href="#"
                    className="block text-gray-300 hover:text-white py-2 text-sm"
                  >
                    2.1. VERDAUUNGSSYSTEM. ERNÄHRUNG
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block text-gray-300 hover:text-white py-2 text-sm"
                  >
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
          <div className="flex gap-4 mb-8 border-b border-gray-700 flex-wrap">
            <button
              onClick={() => setActiveTab("content")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "content"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.lessonContent}
            </button>
            <button
              onClick={() => setActiveTab("dictionary")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "dictionary"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.dictionary}
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "flashcards"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.flashcards}
            </button>
          </div>

          {/* Content Tab */}
          {activeTab === "content" && lessonData.content && (
            <div>
              {/* Play All Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={togglePlayAll}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    isPlayingAll
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
                  }`}
                >
                  {isPlayingAll ? (
                    <>
                      <FaPause />
                      <span>{t.pause}</span>
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      <span>{t.playAll}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Content with individual sentence buttons */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
                <div className="prose prose-invert max-w-none space-y-4">
                  {sentences.map((sentenceObj, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer ${
                          currentSpeaking === index
                            ? "bg-green-900/30 border-l-4 border-green-500"
                            : "hover:bg-gray-800/50"
                        }`}
                        onClick={() => toggleExpandedSentence(index)}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSentence(sentenceObj, index);
                          }}
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
                            currentSpeaking === index
                              ? "bg-red-600 hover:bg-red-700 animate-pulse"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg"
                          }`}
                          title={currentSpeaking === index ? t.stop : t.listen}
                        >
                          {currentSpeaking === index ? (
                            <FaPause className="text-white text-sm" />
                          ) : (
                            <FaVolumeUp className="text-white text-sm" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p
                            className={`text-gray-300 leading-relaxed ${getGermanFontFamilyClass()} ${getGermanFontSizeValue()}`}
                          >
                            {currentSpeaking === index && highlightedWord
                              ? sentenceObj.text
                                  .split(/(\s+)/)
                                  .map((word, i) => (
                                    <span
                                      key={i}
                                      className={
                                        word.trim() === highlightedWord.trim()
                                          ? "bg-yellow-400 text-black font-bold px-1 rounded"
                                          : ""
                                      }
                                    >
                                      {word}
                                    </span>
                                  ))
                              : sentenceObj.text.split(/(\s+)/).map((word, i) =>
                                  word.trim() ? (
                                    <span
                                      key={i}
                                      onMouseEnter={(e) =>
                                        handleWordHover(e, word)
                                      }
                                      onMouseLeave={handleWordLeave}
                                      className={`relative cursor-help transition-colors ${
                                        findWordTranslation(word)
                                          ? "text-cyan-300 hover:text-cyan-100 hover:underline"
                                          : ""
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  ) : (
                                    <span key={i}>{word}</span>
                                  )
                                )}
                          </p>
                        </div>
                      </div>

                      {/* Expanded Translation */}
                      {expandedSentences.has(index) &&
                        sentenceObj.translation && (
                          <div className="ml-14 pl-4 border-l-2 border-green-500 bg-green-900/20 p-4 rounded-lg animate-in">
                            <p
                              className={`text-gray-200 ${getFontFamilyClass()} ${getFontSizeValue()}`}
                            >
                              {sentenceObj.translation}
                            </p>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dictionary Tab */}
          {activeTab === "dictionary" && (
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
                            <div className="mb-3 flex items-center justify-between">
                              <div>
                                <span
                                  className={`text-2xl font-bold text-green-400 ${getGermanFontFamilyClass()}`}
                                >
                                  {wordData.word}
                                </span>
                                <span
                                  className={`text-xl text-gray-400 ml-3 ${getFontFamilyClass()}`}
                                >
                                  → {wordData.translation}
                                </span>
                              </div>
                              <button
                                onClick={() => speakWord(wordData.word)}
                                className="flex-shrink-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all"
                                title={t.readWord}
                              >
                                <FaVolumeUp className="text-white text-sm" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <p
                                  className={`text-gray-300 italic flex-1 ${getGermanFontFamilyClass()} ${getGermanFontSizeValue()}`}
                                >
                                  <span className="text-blue-400 font-semibold">
                                    DE:
                                  </span>{" "}
                                  {wordData.example}
                                </p>
                                <button
                                  onClick={() => speakWord(wordData.example)}
                                  className="flex-shrink-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all"
                                  title={t.readExample}
                                >
                                  <FaVolumeUp className="text-white text-xs" />
                                </button>
                              </div>
                              <p
                                className={`text-gray-400 ${getFontFamilyClass()} ${getFontSizeValue()}`}
                              >
                                <span className="text-green-400 font-semibold">
                                  BG:
                                </span>{" "}
                                {wordData.example_translation}
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

          {/* Flashcards Tab */}
          {activeTab === "flashcards" && (
            <div className="min-h-[500px] flex flex-col items-center justify-center">
              {allWords.length === 0 ? (
                <p className="text-gray-400 text-xl">{t.noWordsInDictionary}</p>
              ) : (
                <>
                  <div className="perspective w-full max-w-2xl mb-8">
                    <div
                      className="relative w-full h-80 cursor-pointer transition-transform duration-500 transform-gpu"
                      onClick={() => toggleFlashcard(currentFlashcardIndex)}
                      style={
                        {
                          transformStyle: "preserve-3d",
                          transform: flippedCards.has(currentFlashcardIndex)
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
                        } as React.CSSProperties
                      }
                    >
                      {/* Front of card - German word */}
                      <div
                        className="absolute w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-blue-400 shadow-2xl"
                        style={
                          {
                            backfaceVisibility: "hidden",
                          } as React.CSSProperties
                        }
                      >
                        <p className="text-gray-300 text-sm mb-4">{t.german}</p>
                        <p
                          className={`text-4xl font-bold text-white text-center ${getGermanFontFamilyClass()}`}
                        >
                          {allWords[currentFlashcardIndex]?.word}
                        </p>
                        <p className="text-gray-200 text-sm mt-8">
                          {t.clickForTranslation}
                        </p>
                      </div>

                      {/* Back of card - Bulgarian translation */}
                      <div
                        className="absolute w-full h-full bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-green-400 shadow-2xl"
                        style={
                          {
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          } as React.CSSProperties
                        }
                      >
                        <p className="text-gray-300 text-sm mb-4">
                          {t.translationToBulgarian}
                        </p>
                        <p
                          className={`text-4xl font-bold text-white text-center ${getFontFamilyClass()}`}
                        >
                          {allWords[currentFlashcardIndex]?.translation}
                        </p>
                        <p
                          className={`text-gray-200 text-sm mt-8 ${getGermanFontFamilyClass()}`}
                        >
                          {allWords[currentFlashcardIndex]?.example}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <button
                      onClick={() => {
                        const newIndex =
                          currentFlashcardIndex === 0
                            ? allWords.length - 1
                            : currentFlashcardIndex - 1;
                        setCurrentFlashcardIndex(newIndex);
                        setFlippedCards(new Set()); // Reset flip state
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      ← {t.back}
                    </button>

                    <div className="text-gray-400 font-semibold">
                      {currentFlashcardIndex + 1} / {allWords.length}
                    </div>

                    <button
                      onClick={() => {
                        const newIndex =
                          currentFlashcardIndex === allWords.length - 1
                            ? 0
                            : currentFlashcardIndex + 1;
                        setCurrentFlashcardIndex(newIndex);
                        setFlippedCards(new Set()); // Reset flip state
                      }}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {t.forward} →
                    </button>
                  </div>

                  {/* Audio Button */}
                  <button
                    onClick={() =>
                      speakWord(allWords[currentFlashcardIndex]?.word)
                    }
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                  >
                    <FaVolumeUp /> {t.readWord}
                  </button>

                  {/* Progress bar */}
                  <div className="w-full max-w-2xl mt-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          ((currentFlashcardIndex + 1) / allWords.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Word Hover Tooltip */}
      {hoveredWord && wordTranslation && (
        <div
          className="fixed bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-2xl z-50 pointer-events-none text-sm font-semibold whitespace-nowrap border border-cyan-400"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-cyan-200 font-normal">{hoveredWord}</span>
            <span className="text-white">→</span>
            <span>{wordTranslation}</span>
          </div>
          {/* Tooltip arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-cyan-600 to-blue-600 transform rotate-45"
            style={{
              width: "8px",
              height: "8px",
              marginTop: "-4px",
            }}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default LessonView;
