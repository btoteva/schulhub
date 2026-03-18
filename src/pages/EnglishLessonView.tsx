import React from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import englishLessonsData from "../data/english-lessons.json";

const EnglishLessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const lesson = englishLessonsData.find((l) => l.id === lessonId);

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/english/lessons"
          className={`inline-flex items-center gap-2 mb-8 ${isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
        >
          <FaArrowLeft />
          {t.backToLessons}
        </Link>

        {lesson ? (
          <div>
            <header className="mb-8">
              <h1 className={`text-3xl font-bold ${isLight ? "text-blue-600" : "text-blue-400"}`}>{lesson.title}</h1>
            </header>
            <div className="w-full max-w-4xl mx-auto">
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
          </div>
        ) : (
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{t.lessonNotFound}</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default EnglishLessonView;
