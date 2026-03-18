import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaPencilAlt,
  FaCheckCircle,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { getUserProgress } from "../utils/userProgressApi";
import englishGrammarData from "../data/english-grammar-lessons.json";

const EnglishGrammarLessons: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setWatchedIds([]);
      return;
    }
    let cancelled = false;
    getUserProgress("schulhub-english-grammar-watched", token).then((data) => {
      if (cancelled || !data || typeof data !== "object" || Array.isArray(data))
        return;
      const ids = (data as { ids?: string[] }).ids;
      setWatchedIds(Array.isArray(ids) ? ids : []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      }
    >
      {/* Header Section */}
      <section
        className={
          isLight
            ? "bg-white/80 border-b border-slate-200 shadow-sm"
            : "bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 border-b border-gray-800/50"
        }
      >
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/english"
              className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-300 hover:text-white"}`}
            >
              <FaArrowLeft />
              <span>{t.back}</span>
            </Link>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">
              <FaPencilAlt className="text-7xl text-green-500" />
            </div>
            <div>
              <h1
                className={`text-5xl font-bold mb-3 ${isLight ? "text-slate-800" : "text-white"}`}
              >
                {t.englishGrammarTitle}
              </h1>
              <p
                className={`text-xl mb-2 ${isLight ? "text-slate-600" : "text-gray-300"}`}
              >
                {t.englishGrammarSubtitle}
              </p>
              <p
                className={`text-lg mb-4 ${isLight ? "text-slate-500" : "text-gray-400"}`}
              >
                {t.englishGrammarSource}
              </p>
              <a
                href="https://youtube.com/playlist?list=PLUiFeF9KuaPacPIXMTPliOTZJi3jvK0oh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
              >
                <FaYoutube className="text-xl" />
                <span>{t.viewOnYoutubePlaylist}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons List */}
      <section className="container mx-auto px-4 py-16">
        <h2
          className={`text-4xl font-bold mb-8 ${isLight ? "text-slate-800" : "text-white"}`}
        >
          {t.selectLesson}
        </h2>

        <div className="max-w-4xl space-y-4">
          {englishGrammarData.map((lesson) => {
            const watched = token && watchedIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className={`group relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${isLight ? "bg-white border border-slate-200 hover:border-green-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 hover:border-transparent"}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"></div>

                <div className="relative p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                      {lesson.playlist_index}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-xl font-bold mb-2 ${isLight ? "text-slate-800" : "text-white"}`}
                      >
                        {lesson.title}
                      </h4>
                      <div
                        className={`flex items-center gap-4 ${isLight ? "text-slate-500" : "text-gray-400"}`}
                      >
                        {watched && (
                          <span
                            className={`inline-flex items-center gap-1 ml-2 ${isLight ? "text-green-600" : "text-green-400"}`}
                          >
                            <FaCheckCircle className="w-4 h-4" />
                            {t.watched}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Link to={`/english/grammar/${lesson.id}`}>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
                        {t.start}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        className={
          isLight
            ? "bg-slate-100 text-slate-500 py-8 border-t border-slate-200 mt-16"
            : "bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16"
        }
      >
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
};

export default EnglishGrammarLessons;
