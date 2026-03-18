import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBook, FaGraduationCap, FaClock, FaYoutube, FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";
import englishLessonsData from "../data/english-lessons.json";

const EnglishLessons: React.FC = () => {
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
    getUserProgress("schulhub-english-watched", token).then((data) => {
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
              <FaYoutube className="text-7xl text-red-500" />
            </div>
            <div>
              <h1
                className={`text-5xl font-bold mb-3 ${isLight ? "text-slate-800" : "text-white"}`}
              >
                {t.englishCourseTitle}
              </h1>
              <p
                className={`text-xl mb-4 ${isLight ? "text-slate-600" : "text-gray-300"}`}
              >
                {t.englishLessonsDesc}
              </p>
              <div
                className={`flex items-center gap-6 ${isLight ? "text-slate-500" : "text-gray-400"}`}
              >
                <span className="flex items-center gap-2">
                  <FaBook />
                  {englishLessonsData.length} {t.lessonsCount}
                </span>
                <span className="flex items-center gap-2">
                  <FaGraduationCap />
                  {t.beginnerLevel}
                </span>
              </div>
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
          {englishLessonsData.map((lesson) => {
            const watched = token && watchedIds.includes(lesson.id);
            return (
              <div
                key={lesson.id}
                className={`group relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${isLight ? "bg-white border border-slate-200 hover:border-blue-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 hover:border-transparent"}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}
                ></div>

                <div className="relative p-6 flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold`}
                    >
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
                        <span className="flex items-center gap-1">
                          <FaClock className="text-sm" />
                          {lesson.duration}
                        </span>
                        {watched && (
                          <span
                            className={`inline-flex items-center gap-1 ml-2 ${isLight ? "text-green-600" : "text-green-400"}`}
                          >
                            <FaCheckCircle className="w-4 h-4" />
                            {t.podcastListened}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Link to={`/english/lessons/${lesson.id}`}>
                      <button
                        className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-l-lg font-semibold`}
                      >
                        {t.start}
                      </button>
                    </Link>
                    {token && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const next = watched
                            ? watchedIds.filter((id) => id !== lesson.id)
                            : [...watchedIds, lesson.id];
                          setWatchedIds(next);
                          setUserProgress(
                            "schulhub-english-watched",
                            { ids: next },
                            token
                          );
                        }}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-r-lg text-sm font-medium ${isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-700" : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"}`}
                        title={watched ? 'Mark as not watched' : 'Mark as watched'}
                      >
                        <FaCheckCircle
                          className={`w-5 h-5 shrink-0 ${watched ? (isLight ? "text-green-600" : "text-green-400") : "opacity-40"}`}
                        />
                      </button>
                    )}
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

export default EnglishLessons;
