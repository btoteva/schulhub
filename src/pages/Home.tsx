import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBook,
  FaGlobeAmericas,
  FaMicroscope,
  FaGraduationCap,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import { MdScience, MdLanguage, MdPublic } from "react-icons/md";
import coursesData from "../data/courses.json";
import weeklyProgramData from "../data/weekly-program.json";
import { Course } from "../types/Course";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { weeklyProgramAuth } from "../utils/weekly-program-auth";

// Lesson counts based on actual data in Lessons.tsx
const actualLessonCounts: { [key: number]: number } = {
  1: 0, // German - 0 lessons
  2: 10, // Biology – HERZ, III (3), Summary, IV (3), V NERVENSYSTEM (2)
  3: 5, // Geography - 5 lessons (3-1 … 3-5)
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
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Deutsch</h3>
            <p className="text-xl text-slate-800 dark:text-gray-300">Sprechen Sie Deutsch?</p>
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
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Биология</h3>
            <p className="text-xl text-slate-800 dark:text-gray-300">Изучаване на живота</p>
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
          <h3 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">География</h3>
          <p className="text-xl text-slate-800 dark:text-gray-300">Откривайте света</p>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const courses = coursesData as Course[];
  const subjects = ["german", "biology", "geography"];
  const [currentSubject, setCurrentSubject] = useState(0);
  const [programUnlocked, setProgramUnlocked] = useState(false);
  const [programPassword, setProgramPassword] = useState("");
  const [programRemember, setProgramRemember] = useState(false);
  const [programError, setProgramError] = useState("");

  useEffect(() => {
    setProgramUnlocked(weeklyProgramAuth.isUnlocked());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubject((prev) => (prev + 1) % subjects.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleProgramUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setProgramError("");
    const ok = await weeklyProgramAuth.checkPassword(programPassword);
    if (ok) {
      weeklyProgramAuth.setUnlocked(programRemember);
      setProgramUnlocked(true);
      setProgramPassword("");
    } else {
      setProgramError(t.weeklyProgramWrongPassword);
    }
  };

  const handleProgramLock = () => {
    weeklyProgramAuth.clearUnlocked();
    setProgramUnlocked(false);
  };

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

  const getCourseLevel = (level: string) => {
    if (level === "beginner") return t.beginnerLevel;
    if (level === "grade8") return t.grade8;
    if (level === "b1") return t.b1Level;
    return level;
  };

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-200 via-slate-100 to-white"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      }
    >
      {/* Hero Section with Animated Illustrations */}
      <section
        className={
          isLight
            ? "relative bg-gradient-to-br from-slate-100/80 via-slate-50/80 to-white/80 text-slate-900 py-20 border-b border-slate-200 overflow-hidden"
            : "relative bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 text-white py-20 border-b border-gray-800/50 overflow-hidden"
        }
      >
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
            <p className="text-lg text-slate-800 dark:text-gray-300 mt-4">
              <span className="text-yellow-400 font-semibold">
                {t.germanSubject}
              </span>{" "}
              •{" "}
              <span className="text-green-400 font-semibold">
                {t.biologySubject}
              </span>{" "}
              •{" "}
              <span className="text-blue-400 font-semibold">
                {t.geographySubject}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-5xl font-bold text-slate-800 dark:text-white mb-4 text-center">
          {t.selectSubject}
        </h3>
        <p className="text-slate-800 dark:text-gray-400 text-center mb-16 text-lg">
          {t.discoverPath}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group relative bg-gradient-to-b from-white to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-gray-700 hover:border-transparent transform hover:scale-105"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient(
                  course.id,
                )} opacity-0 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative p-8">
                <div className="mb-6">{getSubjectIcon(course.id)}</div>

                <div className="flex items-center justify-end mb-4">
                  <span className="text-slate-700 dark:text-gray-400 text-sm flex items-center gap-1">
                    <FaBook className="text-sm" />
                    {actualLessonCounts[course.id] ?? course.lessons}{" "}
                    {t.lessonsCount}
                  </span>
                </div>

                <h4 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                  {getCourseTitle(course.id)}
                </h4>

                <p className="text-slate-800 dark:text-gray-400 mb-6 leading-relaxed">
                  {getCourseDesc(course.id)}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="text-orange-400 font-semibold flex items-center gap-2">
                    <FaGraduationCap className="text-sm" />
                    {getCourseLevel(course.level)}
                  </span>
                  <div className="flex gap-2">
                    {course.id === 1 && (
                      <Link to="/german/dsd-tests">
                        <button
                          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm"
                        >
                          {t.dsdTests}
                        </button>
                      </Link>
                    )}
                    <Link to={`/lessons/${course.id}`}>
                      <button
                        className={`bg-gradient-to-r ${getSubjectGradient(
                          course.id,
                        )} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
                      >
                        {t.seeMore}
                      </button>
                    </Link>
                  </div>
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

      {/* Weekly Program Section */}
      <section className="w-full px-4 py-16 border-t border-slate-200 dark:border-gray-800/50">
        <div className="container mx-auto flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-4xl text-amber-500 dark:text-amber-400" />
            <h3 className="text-4xl font-bold text-slate-800 dark:text-white">
              {t.weeklyProgramTitle}
            </h3>
          </div>
          {programUnlocked && (
            <button
              type="button"
              onClick={handleProgramLock}
              className="text-sm text-slate-700 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              {t.weeklyProgramLock}
            </button>
          )}
        </div>

        {programUnlocked ? (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(weeklyProgramData as { days: Array<{ day: string; dayShort: string; items: Array<{ time?: string; timeFrom?: string; timeTo?: string; title: string; description?: string }> }> }).days.map((d, i) => (
              <div
                key={i}
                className="bg-slate-100 dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-600 overflow-hidden flex flex-col min-w-0"
              >
                <div className="bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold px-4 py-3 border-b border-slate-200 dark:border-gray-600">
                  <span className="hidden sm:inline">{d.day}</span>
                  <span className="sm:hidden">{d.dayShort}</span>
                </div>
                <div className="p-3 space-y-2 min-h-[4rem] flex-1">
                  {d.items.length === 0 ? (
                    <p className="text-slate-700 dark:text-gray-500 text-sm">—</p>
                  ) : (
                    d.items.map((item, j) => (
                      <div
                        key={j}
                        className="text-sm text-slate-900 dark:text-gray-300 border-l-2 border-amber-500/50 pl-2"
                      >
                        <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-200/90 flex-wrap">
                          <span className="font-semibold text-amber-600 dark:text-amber-300 tabular-nums">{j + 1}.</span>
                          <FaClock className="text-xs shrink-0" />
                          {item.timeFrom && item.timeTo
                            ? `От ${item.timeFrom} до ${item.timeTo}`
                            : (item.time ?? "")}
                        </span>
                        <p className="font-medium text-slate-900 dark:text-white mt-0.5">{item.title}</p>
                        {item.description ? (
                          <p className="text-slate-700 dark:text-gray-400 text-xs mt-0.5">{item.description}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleProgramUnlock}
            className="max-w-sm flex flex-col gap-4 p-6 bg-slate-100 dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-600"
          >
            <label className="text-slate-900 dark:text-gray-300 text-sm">
              {t.weeklyProgramEnterPassword}
            </label>
            <input
              type="password"
              value={programPassword}
              onChange={(e) => setProgramPassword(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="••••••••"
              autoComplete="off"
            />
            <label className="flex items-center gap-2 text-slate-800 dark:text-gray-400 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={programRemember}
                onChange={(e) => setProgramRemember(e.target.checked)}
                className="rounded border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-amber-500 focus:ring-amber-500/50"
              />
              {t.weeklyProgramRememberMe}
            </label>
            {programError && (
              <p className="text-red-400 text-sm">{programError}</p>
            )}
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {t.weeklyProgramUnlock}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-slate-200/80 dark:bg-black/50 text-slate-800 dark:text-gray-500 py-8 border-t border-slate-300 dark:border-gray-800/50">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
