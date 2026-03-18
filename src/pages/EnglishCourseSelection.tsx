import React from "react";
import { useNavigate } from "react-router-dom";
import { FaYoutube, FaPencilAlt } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const EnglishCourseSelection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <span className="mr-2 text-xl">←</span> {t.back}
        </button>

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-800 dark:text-blue-400 mb-4">
          {t.englishCourseTitle}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          {t.englishCourseDesc}
        </p>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Lessons Option */}
          <button
            type="button"
            onClick={() => navigate("/english/lessons")}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-t-8 border-blue-500 group"
          >
            <div className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <FaYoutube className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {t.lessons}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t.englishLessonsDesc}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t.englishVideoSource}
              </p>
              <span className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors">
                {t.start}
              </span>
            </div>
          </button>

          {/* Grammar Option (New) */}
          <button
            type="button"
            onClick={() => navigate("/english/grammar")}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-t-8 border-green-500 group"
          >
            <div className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <FaPencilAlt className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {t.englishGrammarTitle}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2 font-medium">
                {t.englishGrammarSubtitle}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow text-sm">
                {t.englishGrammarSource}
              </p>
              <span className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors">
                {t.start}
              </span>
            </div>
          </button>

          {/* Podcast Option */}
          <button
            type="button"
            onClick={() => navigate("/english/podcasts")}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border-t-8 border-purple-500 group"
          >
            <div className="p-8 flex flex-col items-center text-center h-full">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                {/* Headphones Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                {t.podcast}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                {t.englishPodcastsDesc}
              </p>
              <span className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition-colors">
                {t.listen}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnglishCourseSelection;
