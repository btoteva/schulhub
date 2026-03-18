import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";
import englishLessonsData from "../data/english-lessons.json";

const EnglishLessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const lesson = englishLessonsData.find((l) => l.id === lessonId);
  const watched = token && lesson && watchedIds.includes(lesson.id);

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

  const toggleWatched = () => {
    if (!token || !lesson) return;
    const next = watched
      ? watchedIds.filter((id) => id !== lesson.id)
      : [...watchedIds, lesson.id];
    setWatchedIds(next);
    setUserProgress("schulhub-english-watched", { ids: next }, token);
  };

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/english/lessons"
            className={`inline-flex items-center gap-2 ${isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
          >
            <FaArrowLeft />
            {t.back}
          </Link>
        </div>

        {lesson ? (
          <div>
            <header className="mb-8">
              <h1
                className={`text-3xl font-bold ${isLight ? "text-blue-600" : "text-blue-400"}`}
              >
                {lesson.title}
              </h1>
              <p
                className={`mt-2 text-lg ${isLight ? "text-slate-600" : "text-gray-400"}`}
              >
                {t.englishVideoSource}
              </p>
            </header>
            <div className="w-full max-w-4xl mx-auto mb-8">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  data-testid="embed-iframe"
                  title={lesson.title}
                  style={{ borderRadius: "12px" }}
                  src={`https://www.youtube.com/embed/${lesson.id}`}
                  width="100%"
                  height="100%"
                  frameBorder={0}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="eager"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
            {token && (
              <div className="flex justify-center mb-8">
                <button
                  type="button"
                  onClick={toggleWatched}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-colors ${
                    watched
                      ? isLight
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                      : isLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                  title={watched ? t.markAsNotWatched : t.markAsWatched}
                >
                  <FaCheckCircle
                    className={`w-5 h-5 shrink-0 ${watched ? (isLight ? "text-green-600" : "text-green-400") : "opacity-40"}`}
                  />
                  <span>{watched ? t.watched : t.markAsWatched}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h2
              className={`text-2xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}
            >
              {t.courseNotFound}
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnglishLessonView;
