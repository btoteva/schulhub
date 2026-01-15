import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaGlobeAmericas,
  FaMicroscope,
  FaClock,
} from "react-icons/fa";
import { MdScience, MdLanguage, MdPublic } from "react-icons/md";
import coursesData from "../data/courses.json";
import { Course } from "../types/Course";
import { useLanguage } from "../contexts/LanguageContext";

// Lesson counts based on actual data in Lessons.tsx
const actualLessonCounts: { [key: number]: number } = {
  1: 5, // German - 5 lessons in Grundlagen section
  2: 5, // Biology - 5 lessons in HERZ-KREISLAUF-SYSTEM section
  3: 5, // Geography - 5 lessons in География - Основи section
};

const HeroIllustration: React.FC<{ subject: string }> = ({ subject }) => {
  if (subject === "german") {
    return (
      <div className="relative w-full h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-red-500/20 to-gray-900/20 rounded-3xl blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <MdLanguage className="text-white text-6xl" />
          </div>
          <div className="text-left">
            <h3 className="text-4xl font-bold text-white mb-2">Deutsch</h3>
            <p className="text-xl text-gray-300">Sprechen Sie Deutsch?</p>
          </div>
        </div>
      </div>
    );
  }

  if (subject === "biology") {
    return (
      <div className="relative w-full h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 rounded-3xl blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-8">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <FaMicroscope className="text-white text-6xl" />
          </div>
          <div className="text-left">
            <h3 className="text-4xl font-bold text-white mb-2">Биология</h3>
            <p className="text-xl text-gray-300">Изучаване на живота</p>
          </div>
        </div>
      </div>
    );
  }

  // Geography
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-cyan-500/20 to-indigo-600/20 rounded-3xl blur-2xl"></div>
      <div className="relative z-10 flex items-center gap-8">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
          <FaGlobeAmericas className="text-white text-6xl" />
        </div>
        <div className="text-left">
          <h3 className="text-4xl font-bold text-white mb-2">География</h3>
          <p className="text-xl text-gray-300">Откривайте света</p>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { t } = useLanguage();
  const courses: Course[] = coursesData;
  const subjects = ["german", "biology", "geography"];
  const [currentSubject, setCurrentSubject] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubject((prev) => (prev + 1) % subjects.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getSubjectIcon = (id: number) => {
    if (id === 1) {
      return <MdLanguage className="text-6xl text-yellow-400 mx-auto mb-4" />;
    }
    if (id === 2) {
      return <MdScience className="text-6xl text-green-400 mx-auto mb-4" />;
    }
    return <MdPublic className="text-6xl text-blue-400 mx-auto mb-4" />;
  };

  const getSubjectGradient = (id: number) => {
    if (id === 1) {
      return "from-yellow-500 to-orange-600";
    }
    if (id === 2) {
      return "from-green-500 to-emerald-600";
    }
    return "from-blue-500 to-indigo-600";
  };

  const getCourseTitle = (id: number) => {
    if (id === 1) return t.germanCourseTitle;
    if (id === 2) return t.biologyCourseTitle;
    return t.geographyCourseTitle;
  };

  const getCourseDesc = (id: number) => {
    if (id === 1) return t.germanCourseDesc;
    if (id === 2) return t.biologyCourseDesc;
    return t.geographyCourseDesc;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      {/* Hero Section with Animated Illustrations */}
      <section className="relative bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 text-white py-20 border-b border-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              {t.platformTitle}
            </h2>
            <p className="text-lg text-gray-300 mt-4">
              <span className="text-yellow-400 font-semibold">{t.germanSubject}</span> •{" "}
              <span className="text-green-400 font-semibold">{t.biologySubject}</span> •{" "}
              <span className="text-blue-400 font-semibold">{t.geographySubject}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-5xl font-bold text-white mb-4 text-center">
          {t.selectSubject}
        </h3>
        <p className="text-gray-400 text-center mb-16 text-lg">
          {t.discoverPath}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 hover:border-transparent transform hover:scale-105"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient(
                  course.id
                )} opacity-0 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative p-8">
                <div className="mb-6">{getSubjectIcon(course.id)}</div>

                <div className="flex items-center justify-end mb-4">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <FaBook className="text-sm" />
                    {actualLessonCounts[course.id] || course.lessons} {t.lessonsCount}
                  </span>
                </div>

                <h4 className="text-3xl font-bold text-white mb-4">
                  {getCourseTitle(course.id)}
                </h4>

                <p className="text-gray-400 mb-6 leading-relaxed">
                  {getCourseDesc(course.id)}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-orange-400 font-semibold flex items-center gap-2">
                    <FaClock className="text-sm" />
                    {course.duration}
                  </span>
                  <Link to={`/lessons/${course.id}`}>
                    <button
                      className={`bg-gradient-to-r ${getSubjectGradient(
                        course.id
                      )} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
                    >
                      {t.seeMore}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-500 py-8 border-t border-gray-800/50">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
