import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaTimes,
} from "react-icons/fa";
import { getLessonById, type LessonContent, type TestQuestion } from "../data/lessons";
import { SkeletonDiagram } from "../components/SkeletonDiagram";
import { useFont } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";

// Helper function to insert highlight span at specific index in HTML string
// Maps plain text index (from speech synthesis) to HTML string index
const insertHighlight = (html: string, start: number, length: number) => {
  let p = 0; // plain text index
  let h = 0; // html string index
  let startH = -1;
  let endH = -1;

  while (h < html.length) {
    // Found start position
    if (p === start && startH === -1) startH = h;
    // Found end position
    if (p === start + length && endH === -1) endH = h;

    if (endH !== -1) break;

    if (html[h] === "<") {
      // Skip tags
      while (h < html.length && html[h] !== ">") h++;
      h++;
    } else if (html[h] === "&") {
      // Handle entities (assume length 1 in plain text like &nbsp; -> ' ')
      const semi = html.indexOf(";", h);
      if (semi !== -1) {
        h = semi + 1;
        p++;
      } else {
        h++;
        p++;
      }
    } else {
      h++;
      p++;
    }
  }

  if (startH !== -1) {
    if (endH === -1) endH = h;
    return (
      html.slice(0, startH) +
      `<span style="background-color: #facc15; color: black; border-radius: 3px; padding: 0 2px;">` +
      html.slice(startH, endH) +
      `</span>` +
      html.slice(endH)
    );
  }
  return html;
};

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
  const { t, language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "dictionary" | "flashcards" | "resources" | "exercises" | "test"
  >("content");
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [currentSpeaking, setCurrentSpeaking] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayAllIndex, setCurrentPlayAllIndex] = useState(0);
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(
    new Set(),
  );
  const [highlightInfo, setHighlightInfo] = useState<{
    word: string;
    index: number;
    length: number;
  } | null>(null);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRights, setSelectedRights] = useState<Set<number>>(new Set());
  const [matchingFeedback, setMatchingFeedback] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [revealedExerciseIds, setRevealedExerciseIds] = useState<Set<number>>(
    new Set(),
  );
  /** exerciseId -> questionId -> optionId for quiz-type exercises */
  const [exerciseQuizAnswers, setExerciseQuizAnswers] = useState<
    Record<number, Record<number, string>>
  >({});
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

  // When opening a test-only lesson, show only Test tab (no other tabs)
  const isTestOnlyLesson = !!(
    lessonData &&
    ((lessonData as LessonContent).testOnly === true ||
      ((lessonData as LessonContent).test && (lessonData as LessonContent).id === "2-2-summary"))
  );
  useEffect(() => {
    if (isTestOnlyLesson) {
      setActiveTab("test");
      setTestSubmitted(false);
      setTestAnswers({});
    }
  }, [lessonId, isTestOnlyLesson]);

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
    word: string,
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

  // Render sentence as word-by-word spans so words from dictionary show tooltip on hover
  // Preserves <strong>...</strong> and renders it in green
  const renderSentenceWithWordTooltips = (
    text: string,
    index: number,
  ): React.ReactNode => {
    const isHighlighting =
      currentSpeaking === index && highlightInfo !== null;
    if (isHighlighting && highlightInfo) {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: insertHighlight(
              text,
              highlightInfo.index,
              highlightInfo.length,
            ),
          }}
        />
      );
    }
    const strongRegex = /(<strong>.*?<\/strong>)/g;
    const segments = text.split(strongRegex);
    return (
      <>
        {segments.map((segment, segIdx) => {
          const strongMatch = segment.match(/^<strong>(.*?)<\/strong>$/s);
          if (strongMatch) {
            return (
              <strong
                key={segIdx}
                className="font-bold text-green-400"
              >
                {strongMatch[1]}
              </strong>
            );
          }
          const plainText = segment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (!plainText) return <span key={segIdx}>{segment}</span>;
          const tokens = plainText.split(/(\s+)/);
          return (
            <React.Fragment key={segIdx}>
              {tokens.map((token, i) => {
                if (/^\s+$/.test(token)) return <span key={`${segIdx}-${i}`}>{token}</span>;
                const hasTranslation = findWordTranslation(token) !== null;
                return hasTranslation ? (
                  <span
                    key={`${segIdx}-${i}`}
                    onMouseEnter={(e) => handleWordHover(e, token)}
                    onMouseLeave={handleWordLeave}
                    className="border-b border-dotted border-cyan-400/70 cursor-help hover:bg-cyan-900/30 rounded px-0.5"
                  >
                    {token}
                  </span>
                ) : (
                  <span key={`${segIdx}-${i}`}>{token}</span>
                );
              })}
            </React.Fragment>
          );
        })}
      </>
    );
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
    setCurrentSpeaking(null); // Disables sentence highlighting
    setSpeakingText(text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        const charLength = event.charLength || 0;
        const word = text.substring(charIndex, charIndex + charLength);
        setHighlightInfo({
          word: word.trim(),
          index: charIndex,
          length: charLength,
        });
      }
    };

    utterance.onend = () => {
      setHighlightInfo(null);
      setSpeakingText(null);
    };

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
    autoPlay: boolean = false,
  ) => {
    // If already speaking this sentence and not auto-playing, stop it
    if (currentSpeaking === index && !autoPlay) {
      window.speechSynthesis.cancel();
      setCurrentSpeaking(null);
      setHighlightInfo(null);
      isPlayingAllRef.current = false;
      setIsPlayingAll(false);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    // Strip HTML tags for speech synthesis
    const plainText =
      new DOMParser().parseFromString(sentenceObj.text, "text/html").body
        .textContent || "";
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "de-DE"; // German language
    utterance.rate = 0.9; // Slightly slower for better comprehension

    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        const charLength = event.charLength || 0;
        const word = plainText.substring(charIndex, charIndex + charLength);
        setHighlightInfo({
          word: word.trim(),
          index: charIndex,
          length: charLength,
        });
      }
    };

    utterance.onend = () => {
      setCurrentSpeaking(null);
      setHighlightInfo(null);

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
              <h3 className="text-xl font-bold text-green-400 mb-4">
                {t.menu.toUpperCase()}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="block text-gray-300 hover:text-white py-2"
                  >
                    {t.home.toUpperCase()}
                  </Link>
                </li>
                <li className="text-green-400 italic">
                  {t.biologyCourseTitle}
                </li>
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

          {/* Tab Navigation – при test-only урок табовете са винаги видими но неактивни */}
          <div
            className={`flex gap-4 mb-8 border-b border-gray-700 flex-wrap ${
              isTestOnlyLesson ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <button
              type="button"
              disabled={isTestOnlyLesson}
              onClick={() => !isTestOnlyLesson && setActiveTab("content")}
              className={`px-6 py-3 font-semibold transition-all ${
                isTestOnlyLesson ? "cursor-not-allowed" : ""
              } ${
                activeTab === "content"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.lessonContent}
            </button>
            <button
              type="button"
              disabled={isTestOnlyLesson}
              onClick={() => !isTestOnlyLesson && setActiveTab("dictionary")}
              className={`px-6 py-3 font-semibold transition-all ${
                isTestOnlyLesson ? "cursor-not-allowed" : ""
              } ${
                activeTab === "dictionary"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.dictionary}
            </button>
            <button
              type="button"
              disabled={isTestOnlyLesson}
              onClick={() => !isTestOnlyLesson && setActiveTab("flashcards")}
              className={`px-6 py-3 font-semibold transition-all ${
                isTestOnlyLesson ? "cursor-not-allowed" : ""
              } ${
                activeTab === "flashcards"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.flashcards}
            </button>
            <button
              type="button"
              disabled={isTestOnlyLesson}
              onClick={() => !isTestOnlyLesson && setActiveTab("resources")}
              className={`px-6 py-3 font-semibold transition-all ${
                isTestOnlyLesson ? "cursor-not-allowed" : ""
              } ${
                activeTab === "resources"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.resources}
            </button>
            <button
              type="button"
              disabled={isTestOnlyLesson}
              onClick={() => !isTestOnlyLesson && setActiveTab("exercises")}
              className={`px-6 py-3 font-semibold transition-all ${
                isTestOnlyLesson ? "cursor-not-allowed" : ""
              } ${
                activeTab === "exercises"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {t.exercises}
            </button>
          </div>

          {/* Test content – показва се винаги когато урокът има test (без табове при test-only) */}
          {(lessonData as LessonContent).test && (
            <div className="space-y-8">
              {(() => {
                const testData = (lessonData as LessonContent).test!;
                return (
                  <>
                    <div className="bg-gradient-to-r from-violet-700 to-purple-800 text-white rounded-xl px-6 py-4 mb-8">
                      <h3 className="text-2xl font-bold">{testData.title}</h3>
                      {testData.titleBg && (
                        <p className="text-violet-200 text-sm mt-1">{testData.titleBg}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {testData.questions.map((q) => {
                        const selected = testAnswers[q.id];
                        const correctOption = q.options.find((o) => o.correct);
                        const isAnswered = selected !== undefined;
                        const isCorrect = selected && correctOption && selected === correctOption.id;
                        return (
                          <div
                            key={q.id}
                            className={`p-6 rounded-xl border-2 ${
                              isAnswered
                                ? isCorrect
                                  ? "bg-green-900/20 border-green-600"
                                  : "bg-red-900/20 border-red-600"
                                : "bg-gray-800/50 border-gray-600"
                            }`}
                          >
                            {(q as TestQuestion).image && (
                              <div className="mb-4 rounded-lg overflow-hidden border border-gray-600 bg-gray-900">
                                <img
                                  src={(q as TestQuestion).image}
                                  alt=""
                                  className="w-full max-h-64 object-contain cursor-pointer"
                                  title="Отвори в нов прозорец"
                                  onClick={() =>
                                    window.open((q as TestQuestion).image!, "_blank")
                                  }
                                />
                              </div>
                            )}
                            <div className="flex items-start gap-2 mb-1">
                              <p className="font-bold text-lg text-white">
                                {q.id}. {q.question}
                              </p>
                              <button
                                type="button"
                                onClick={() => speakWord(q.question)}
                                className="flex-shrink-0 p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                                title="Чети въпрос на глас"
                              >
                                <FaVolumeUp className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {q.questionBg && (
                              <p className="text-gray-400 text-sm mb-4">{q.questionBg}</p>
                            )}
                            <div className="space-y-2">
                              {q.options.map((opt) => (
                                <label
                                  key={opt.id}
                                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                    isAnswered && selected === opt.id && !opt.correct
                                      ? "bg-red-700/30"
                                      : !isAnswered
                                        ? "hover:bg-gray-700/50"
                                        : ""
                                  } ${selected === opt.id ? "ring-2 ring-cyan-400" : ""}`}
                                >
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={opt.id}
                                    checked={selected === opt.id}
                                    onChange={() =>
                                      setTestAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                                    }
                                    className="mt-1"
                                  />
                                  <span className="text-gray-200 flex-1">
                                    {opt.id}) {opt.text}
                                    {opt.textBg && (
                                      <span className="text-gray-500 text-sm block">{opt.textBg}</span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      speakWord(opt.text);
                                    }}
                                    className="flex-shrink-0 p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                                    title="Чети отговор на глас"
                                  >
                                    <FaVolumeUp className="w-3.5 h-3.5" />
                                  </button>
                                </label>
                              ))}
                            </div>
                            {isAnswered && (
                              <p
                                className={`mt-3 text-sm font-semibold ${
                                  isCorrect ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {isCorrect ? "✓ Верен отговор" : "✗ Грешен отговор"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center mt-8 p-4 bg-gray-800 rounded-xl">
                      <p className="text-xl text-white">
                        Резултат:{" "}
                        {
                          testData.questions.filter(
                            (q) => testAnswers[q.id] === q.options.find((o) => o.correct)?.id,
                          ).length
                        }{" "}
                        / {testData.questions.length}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Content Tab */}
          {!isTestOnlyLesson && activeTab === "content" && lessonData.content && (
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
                <div className="prose prose-invert max-w-none space-y-1">
                  {(() => {
                    const wichtigsteIndex = sentences.findIndex((s) =>
                      s.text.includes("📘 Das Wichtigste."),
                    );
                    const regularSentences =
                      wichtigsteIndex === -1
                        ? sentences
                        : sentences.slice(0, wichtigsteIndex);
                    const wichtigsteSentences =
                      wichtigsteIndex === -1
                        ? []
                        : sentences.slice(wichtigsteIndex);

                    const shownFigures = new Set<string>();
                    const renderSentence = (
                      sentenceObj: { text: string; translation: string },
                      index: number,
                    ) => {
                      const figureMatches = [
                        ...sentenceObj.text.matchAll(
                          /\(Abb\.\s*(\d+)\)/g,
                        ),
                      ];
                      const figureKeys = [
                        ...new Set(
                          figureMatches.map((m) => `Abb. ${m[1]}`),
                        ),
                      ].filter((key) => {
                        if (shownFigures.has(key)) return false;
                        shownFigures.add(key);
                        return true;
                      });

                      const isSectionHeading = /^[📘💡]/.test(
                        sentenceObj.text.trim(),
                      );
                      const isKeyQuestion = sentenceObj.text
                        .trim()
                        .endsWith("?");
                      const isDefinition =
                        /heißt\s+\w+\.|wird.*genannt|bezeichnet\s+man\s+als/i.test(
                          sentenceObj.text,
                        );
                      const isImportant = isKeyQuestion || isDefinition;

                      return (
                        <div key={index} className="space-y-1">
                          <div
                            className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                              currentSpeaking === index
                                ? "bg-green-900/30 border-l-4 border-green-500"
                                : isSectionHeading
                                  ? "bg-gradient-to-r from-emerald-900/50 to-teal-900/40 border-b-2 border-emerald-500 mt-6 mb-2"
                                  : isImportant
                                    ? "bg-gradient-to-r from-amber-900/40 to-yellow-900/30 border-2 border-amber-500/50 shadow-lg"
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
                              title={
                                currentSpeaking === index ? t.stop : t.listen
                              }
                            >
                              {currentSpeaking === index ? (
                                <FaPause className="text-white text-sm" />
                              ) : (
                                <FaVolumeUp className="text-white text-sm" />
                              )}
                            </button>
                            <div className="flex-1">
                              <p
                                className={`leading-relaxed ${getGermanFontFamilyClass()} ${
                                  isSectionHeading
                                    ? "text-2xl text-emerald-400 font-bold"
                                    : getGermanFontSizeValue()
                                } ${
                                  isImportant && !isSectionHeading
                                    ? "text-amber-200 font-semibold"
                                    : !isSectionHeading
                                      ? "text-gray-300"
                                      : ""
                                } [&_strong]:font-bold [&_strong]:text-green-400`}
                              >
                                {renderSentenceWithWordTooltips(
                                  sentenceObj.text,
                                  index,
                                )}
                              </p>
                            </div>
                          </div>

                          {expandedSentences.has(index) &&
                            sentenceObj.translation && (
                              <div className="ml-14 pl-4 border-l-2 border-green-500 bg-green-900/20 p-4 rounded-lg animate-in">
                                <p
                                  className={`text-gray-200 ${getFontFamilyClass()} ${getFontSizeValue()} [&_strong]:font-black [&_strong]:text-green-400 [&_strong]:text-lg`}
                                  dangerouslySetInnerHTML={{
                                    __html: sentenceObj.translation,
                                  }}
                                ></p>
                              </div>
                            )}

                          {figureKeys.map(
                            (figureKey) =>
                              lessonData.images?.[figureKey]?.length > 0 && (
                                <div
                                  key={figureKey}
                                  className="ml-14 mt-4 mb-6"
                                >
                                  <p className="text-green-400 font-semibold mb-3">
                                    {figureKey}:
                                  </p>
                                  <div className="flex gap-4 flex-wrap">
                                    {lessonData.images[figureKey].map(
                                      (imgUrl: string, imgIndex: number) => (
                                        <img
                                          key={imgIndex}
                                          src={imgUrl}
                                          alt={`${figureKey} - Схема ${imgIndex + 1}`}
                                          className="max-w-[48%] h-auto rounded-lg border border-gray-600 shadow-lg hover:border-green-500 transition-colors cursor-pointer"
                                          onClick={() =>
                                            window.open(imgUrl, "_blank")
                                          }
                                        />
                                      ),
                                    )}
                                  </div>
                                </div>
                              ),
                          )}
                        </div>
                      );
                    };

                    return (
                      <>
                        {regularSentences.map((sentence, index) =>
                          renderSentence(sentence, index),
                        )}

                        {wichtigsteSentences.length > 0 && (
                          <div className="mt-8 p-6 bg-sky-900/30 border-2 border-sky-700 rounded-xl shadow-lg">
                            {wichtigsteSentences.map((sentence, i) => {
                              const index = i + wichtigsteIndex;
                              if (i === 0) {
                                return (
                                  <h3
                                    key={index}
                                    className="text-2xl font-bold text-sky-300 mb-4"
                                  >
                                    {sentence.text}
                                  </h3>
                                );
                              }
                              return renderSentence(sentence, index);
                            })}
                          </div>
                        )}

                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Dictionary Tab */}
          {!isTestOnlyLesson && activeTab === "dictionary" && (
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
                                  {(() => {
                                    if (
                                      currentSpeaking === null &&
                                      highlightInfo &&
                                      speakingText === wordData.word
                                    ) {
                                      return (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: insertHighlight(
                                              wordData.word,
                                              highlightInfo.index,
                                              highlightInfo.length,
                                            ),
                                          }}
                                        />
                                      );
                                    }
                                    return wordData.word;
                                  })()}
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
                                  {(() => {
                                    if (
                                      currentSpeaking === null &&
                                      highlightInfo &&
                                      speakingText === wordData.example
                                    ) {
                                      return (
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: insertHighlight(
                                              wordData.example,
                                              highlightInfo.index,
                                              highlightInfo.length,
                                            ),
                                          }}
                                        />
                                      );
                                    }
                                    return wordData.example;
                                  })()}
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
          {!isTestOnlyLesson && activeTab === "flashcards" && (
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

          {/* Resources Tab */}
          {!isTestOnlyLesson && activeTab === "resources" && (
            <div className="space-y-8">
              {lessonData.resources && lessonData.resources.length > 0 ? (
                <>
                  {lessonData.resources.map((resource: any) => (
                    <div
                      key={resource.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700"
                    >
                      <h3 className="text-2xl font-bold text-green-400 mb-2">
                        {resource.title}
                      </h3>
                      {resource.titleBg && (
                        <p className="text-lg text-gray-400 mb-4">
                          {resource.titleBg}
                        </p>
                      )}

                      <p className="text-gray-300 mb-2 leading-relaxed">
                        {resource.description}
                      </p>
                      {resource.descriptionBg && (
                        <p className="text-gray-400 mb-6 leading-relaxed">
                          {resource.descriptionBg}
                        </p>
                      )}

                      {resource.type === "spotify-podcast" &&
                        resource.embedUrl && (
                          <div className="w-full min-h-[352px]">
                            <iframe
                              data-testid="embed-iframe"
                              title={resource.title || "Spotify Podcast"}
                              style={{ borderRadius: "12px" }}
                              src={resource.embedUrl}
                              width="100%"
                              height="352"
                              frameBorder={0}
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="eager"
                            ></iframe>
                            <a
                              href={resource.embedUrl.replace("/embed/", "/").replace(/\?.*$/, "")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-sm text-green-400 hover:text-green-300 underline"
                            >
                              {language === "bg" ? "Отвори в Spotify" : language === "de" ? "In Spotify öffnen" : "Open in Spotify"}
                            </a>
                          </div>
                        )}
                      {resource.type === "youtube-video" &&
                        resource.embedUrl && (
                          <div className="w-full max-w-4xl">
                            <iframe
                              data-testid="embed-iframe"
                              title={resource.title || "YouTube Video"}
                              style={{ borderRadius: "12px" }}
                              src={resource.embedUrl}
                              width="100%"
                              height="315"
                              className="w-full"
                              frameBorder={0}
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              loading="eager"
                            ></iframe>
                            <a
                              href={`https://www.youtube.com/watch?v=${resource.embedUrl.split("/embed/")[1]?.split("?")[0] || ""}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-3 text-sm text-green-400 hover:text-green-300 underline"
                            >
                              {language === "bg" ? "Отвори в YouTube" : language === "de" ? "Auf YouTube öffnen" : "Open on YouTube"}
                            </a>
                          </div>
                        )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 border-dashed">
                  <h3 className="text-2xl font-bold text-gray-500 mb-4">
                    {t.resources}
                  </h3>
                  <p className="text-gray-500 italic">{t.comingSoon}</p>
                </div>
              )}
            </div>
          )}

          {/* Exercises Tab */}
          {!isTestOnlyLesson && activeTab === "exercises" && lessonData.exercises && (
            <div className="space-y-8">
              {lessonData.exercises.map((exercise) => (
                <div key={exercise.id}>
                  {exercise.type === "section" ? (
                    <div className="bg-gradient-to-r from-violet-700 to-purple-800 text-white rounded-t-xl px-6 py-4 border-2 border-violet-800 border-b-0 shadow-lg">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{exercise.title}</h3>
                        <button
                          type="button"
                          onClick={() => speakWord(exercise.title)}
                          className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white"
                          title="Чети на глас"
                        >
                          <FaVolumeUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {exercise.titleBg && (
                        <p className="text-violet-200 text-sm mt-1">
                          {exercise.titleBg}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-blue-300">
                          {exercise.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => speakWord(exercise.title)}
                          className="p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                          title="Чети заглавие на глас"
                        >
                          <FaVolumeUp className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {exercise.titleBg && (
                        <p className="text-gray-400 mb-4 text-sm">
                          {exercise.titleBg}
                        </p>
                      )}

                      {exercise.type === "skeleton" &&
                        exercise.skeletonParts &&
                        exercise.skeletonParts.length > 0 && (
                          <SkeletonDiagram
                            imageUrl={exercise.skeletonImageUrl}
                            parts={exercise.skeletonParts}
                          />
                        )}

                      {exercise.type === "question" && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setRevealedExerciseIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(exercise.id)) next.delete(exercise.id);
                                else next.add(exercise.id);
                                return next;
                              });
                            }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
                          >
                            {revealedExerciseIds.has(exercise.id)
                              ? "Скрий отговор"
                              : "Покажи отговор"}
                          </button>
                          {revealedExerciseIds.has(exercise.id) &&
                            (exercise.answer || exercise.answerBg) && (
                              <div className="mt-4 p-4 bg-green-900/30 border border-green-600/50 rounded-lg space-y-2">
                                {exercise.answer && (
                                  <p className="text-gray-200 flex items-center gap-2">
                                    <span className="text-cyan-400 font-semibold">
                                      DE:{" "}
                                    </span>
                                    {exercise.answer}
                                    <button
                                      type="button"
                                      onClick={() => speakWord(exercise.answer!)}
                                      className="p-1 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                                      title="Чети отговор на глас"
                                    >
                                      <FaVolumeUp className="w-3 h-3" />
                                    </button>
                                  </p>
                                )}
                                {exercise.answerBg && (
                                  <p className="text-gray-300 text-sm">
                                    <span className="text-green-400 font-semibold">
                                      БГ:{" "}
                                    </span>
                                    {exercise.answerBg}
                                  </p>
                                )}
                              </div>
                            )}
                        </div>
                      )}

                      {exercise.type === "quiz" &&
                        exercise.questions &&
                        exercise.questions.length > 0 && (
                          <div className="mt-6 space-y-6">
                            {exercise.questions.map((q) => {
                              const selected =
                                exerciseQuizAnswers[exercise.id]?.[q.id];
                              const correctOption = q.options.find(
                                (o) => o.correct,
                              );
                              const isAnswered = selected !== undefined;
                              const isCorrect =
                                selected &&
                                correctOption &&
                                selected === correctOption.id;
                              return (
                                <div
                                  key={q.id}
                                  className={`p-5 rounded-xl border-2 ${
                                    isAnswered
                                      ? isCorrect
                                        ? "bg-green-900/20 border-green-600"
                                        : "bg-red-900/20 border-red-600"
                                      : "bg-gray-800/50 border-gray-600"
                                  }`}
                                >
                                  <div className="flex items-start gap-2 mb-1">
                                    <p className="font-bold text-lg text-white">
                                      {q.id}. {q.question}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => speakWord(q.question)}
                                      className="flex-shrink-0 p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                                      title="Чети въпрос на глас"
                                    >
                                      <FaVolumeUp className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {q.questionBg && (
                                    <p className="text-gray-400 text-sm mb-4">
                                      {q.questionBg}
                                    </p>
                                  )}
                                  <div className="space-y-2">
                                    {q.options.map((opt) => (
                                      <label
                                        key={opt.id}
                                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                          isAnswered &&
                                          selected === opt.id &&
                                          !opt.correct
                                            ? "bg-red-700/30"
                                            : !isAnswered
                                              ? "hover:bg-gray-700/50"
                                              : ""
                                        } ${selected === opt.id ? "ring-2 ring-cyan-400" : ""}`}
                                      >
                                        <input
                                          type="radio"
                                          name={`quiz-${exercise.id}-q-${q.id}`}
                                          value={opt.id}
                                          checked={selected === opt.id}
                                          onChange={() =>
                                            setExerciseQuizAnswers((prev) => ({
                                              ...prev,
                                              [exercise.id]: {
                                                ...(prev[exercise.id] || {}),
                                                [q.id]: opt.id,
                                              },
                                            }))
                                          }
                                          className="mt-1"
                                        />
                                        <span className="text-gray-200 flex-1">
                                          {opt.id}) {opt.text}
                                          {opt.textBg && (
                                            <span className="text-gray-500 text-sm block">
                                              {opt.textBg}
                                            </span>
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            speakWord(opt.text);
                                          }}
                                          className="flex-shrink-0 p-1.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white"
                                          title="Чети отговор на глас"
                                        >
                                          <FaVolumeUp className="w-3.5 h-3.5" />
                                        </button>
                                      </label>
                                    ))}
                                  </div>
                                  {isAnswered && (
                                    <p
                                      className={`mt-3 text-sm font-semibold ${
                                        isCorrect
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {isCorrect
                                        ? "✓ Верен отговор"
                                        : "✗ Грешен отговор"}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            <div className="text-center p-4 bg-gray-800/80 rounded-xl">
                              <p className="text-lg text-white">
                                Резултат:{" "}
                                {exercise.questions.filter(
                                  (q) =>
                                    exerciseQuizAnswers[exercise.id]?.[q.id] ===
                                    q.options.find((o) => o.correct)?.id,
                                ).length}{" "}
                                / {exercise.questions.length}
                              </p>
                            </div>
                          </div>
                        )}

                      {exercise.type === "matching" && (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                        {/* Left Items */}
                        <div className="space-y-3">
                          <p className="text-gray-300 font-semibold mb-3">
                            Граници на плочи:
                          </p>
                          {exercise.leftItems?.map((item) => {
                            const isSelected = selectedLeft === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedLeft(isSelected ? null : item.id);
                                  setSelectedRights(new Set());
                                  setMatchingFeedback(null);
                                }}
                                className={`relative px-6 py-4 pr-12 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                                  isSelected
                                    ? "bg-yellow-600 border-2 border-yellow-300 scale-105"
                                    : "bg-blue-600 hover:bg-blue-500 border border-transparent"
                                } text-white`}
                              >
                                <p className="font-semibold">{item.text}</p>
                                {item.textBg && (
                                  <p className="text-sm text-blue-100">
                                    {item.textBg}
                                  </p>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakWord(item.text);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white"
                                  title="Чети на глас"
                                >
                                  <FaVolumeUp className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Right Items */}
                        <div className="space-y-3">
                          <p className="text-gray-300 font-semibold mb-3">
                            Процеси:
                          </p>
                          {exercise.rightItems?.map((item) => {
                            const isSelected = selectedRights.has(item.id);
                            const correspondingPair =
                              exercise.correctPairs?.find(
                                (p) => p.leftId === selectedLeft,
                              );
                            const isCorrect =
                              correspondingPair?.rightIds.includes(item.id);

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (!selectedLeft) return;

                                  const newSet = new Set(selectedRights);
                                  if (newSet.has(item.id)) {
                                    newSet.delete(item.id);
                                  } else {
                                    newSet.add(item.id);
                                  }
                                  setSelectedRights(newSet);

                                  // Check if all correct matches are selected
                                  if (
                                    newSet.size ===
                                      correspondingPair?.rightIds.length &&
                                    Array.from(newSet).every((id) =>
                                      correspondingPair?.rightIds.includes(id),
                                    )
                                  ) {
                                    setMatchingFeedback("correct");
                                  } else {
                                    setMatchingFeedback(null);
                                  }
                                }}
                                className={`relative px-6 py-4 pr-12 rounded-lg transition-all transform ${
                                  !selectedLeft
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer hover:scale-105"
                                } ${
                                  isSelected
                                    ? isCorrect
                                      ? "bg-green-600 border-2 border-green-300 scale-105"
                                      : "bg-red-600 border-2 border-red-300 scale-105"
                                    : "bg-emerald-600 hover:bg-emerald-500 border border-transparent"
                                } text-white`}
                              >
                                <p className="font-semibold">{item.text}</p>
                                {item.textBg && (
                                  <p className="text-sm text-emerald-100">
                                    {item.textBg}
                                  </p>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speakWord(item.text);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white"
                                  title="Чети на глас"
                                >
                                  <FaVolumeUp className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {matchingFeedback === "correct" && (
                        <div className="bg-green-900/30 border-2 border-green-500 text-green-300 p-4 rounded-lg text-center font-semibold">
                          ✅ Правилно! Тази граница съответства на избраните
                          процеси.
                        </div>
                      )}

                      {selectedLeft &&
                        matchingFeedback !== "correct" &&
                        selectedRights.size > 0 && (
                          <div className="text-gray-400 text-center p-4">
                            Кликнете на процесите които съответстват на "
                            {
                              exercise.leftItems?.find(
                                (i) => i.id === selectedLeft,
                              )?.textBg
                            }
                            "
                          </div>
                        )}

                      <button
                        onClick={() => {
                          setSelectedLeft(null);
                          setSelectedRights(new Set());
                          setMatchingFeedback(null);
                        }}
                        className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Нова задача
                      </button>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Word Hover Tooltip – балонче с превод при посочване на дума от речника */}
      {hoveredWord &&
        wordTranslation &&
        createPortal(
          <div
            className="fixed bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-2xl pointer-events-none text-sm font-semibold whitespace-nowrap border-2 border-cyan-400"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-cyan-100 font-normal">{hoveredWord}</span>
              <span className="text-white">→</span>
              <span>{wordTranslation}</span>
            </div>
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 transform rotate-45"
              style={{ width: "8px", height: "8px", marginTop: "-4px" }}
            />
          </div>,
          document.body,
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
