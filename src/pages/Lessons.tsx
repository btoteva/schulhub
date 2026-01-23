import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { MdLanguage, MdScience, MdPublic } from "react-icons/md";
import coursesData from "../data/courses.json";
import { useLanguage } from "../contexts/LanguageContext";

// Lesson section interface
interface LessonSection {
  sectionTitle: string;
  lessons: Array<{
    id: number;
    title: string;
    duration: string;
    completed: boolean;
  }>;
}

// Band (volume) interface
interface Band {
  bandTitle: string;
  sections: LessonSection[];
}

// Sample lessons data organized by bands and sections
const lessonsData: { [key: number]: Band[] } = {
  1: [
    // German
    {
      bandTitle: "Band 1",
      sections: [
        {
          sectionTitle: "Grundlagen",
          lessons: [
            {
              id: 1,
              title: "Урок 1: Азбука и произношение",
              duration: "15 мин",
              completed: false,
            },
            {
              id: 2,
              title: "Урок 2: Приветствия и представяне",
              duration: "20 мин",
              completed: false,
            },
            {
              id: 3,
              title: "Урок 3: Числа и цифри",
              duration: "18 мин",
              completed: false,
            },
            {
              id: 4,
              title: "Урок 4: Основни глаголи",
              duration: "25 мин",
              completed: false,
            },
            {
              id: 5,
              title: "Урок 5: Съществителни имена и членове",
              duration: "22 мин",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
  2: [
    // Biology
    {
      bandTitle: "Band 1",
      sections: [
        {
          sectionTitle: "HERZ-KREISLAUF-SYSTEM",
          lessons: [
            {
              id: 1,
              title: "5.3 HERZTÄTIGKEIT. BLUTKREISLAUF",
              duration: "25 мин",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      bandTitle: "Band 2",
      sections: [
        {
          sectionTitle: "BEWEGUNG UND STÜTZE DES KÖRPERS",
          lessons: [
            {
              id: 2,
              title: "III-1 AUFBAU DER KNOCHEN UND GELENKE. DER SCHÄDEL",
              duration: "22 мин",
              completed: false,
            },
            {
              id: 3,
              title: "III-2 WIRBELSÄULE, BRUSTKORB UND GLIEDMABEN",
              duration: "22 мин",
              completed: false,
            },
            {
              id: 4,
              title: "III-3 BEWEGUNGS- UND STÜTZSYSTEM. MUSKELN",
              duration: "25 мин",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
  3: [
    // Geography
    {
      bandTitle: "Band 1",
      sections: [
        {
          sectionTitle: "География - Основи",
          lessons: [
            {
              id: 1,
              title: "Урок 1: Континенти и океани",
              duration: "18 мин",
              completed: false,
            },
            {
              id: 2,
              title: "Урок 2: Климатични зони",
              duration: "22 мин",
              completed: false,
            },
            {
              id: 3,
              title: "Урок 3: Релеф и форми на земята",
              duration: "20 мин",
              completed: false,
            },
            {
              id: 4,
              title: "Урок 4: Реки и езера",
              duration: "19 мин",
              completed: false,
            },
            {
              id: 5,
              title: "Урок 5: Население и градове",
              duration: "21 мин",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};

const Lessons: React.FC = () => {
  const { t } = useLanguage();
  const { courseId } = useParams<{ courseId: string }>();
  const course = coursesData.find((c) => c.id === Number(courseId));
  const bands = lessonsData[Number(courseId)] || [];

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {t.courseNotFound}
          </h2>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            {t.returnToHome}
          </Link>
        </div>
      </div>
    );
  }

  const getSubjectIcon = () => {
    if (course.id === 1) {
      return <MdLanguage className="text-7xl text-yellow-400" />;
    }
    if (course.id === 2) {
      return <MdScience className="text-7xl text-green-400" />;
    }
    return <MdPublic className="text-7xl text-blue-400" />;
  };

  const getSubjectGradient = () => {
    if (course.id === 1) {
      return "from-yellow-500 to-orange-600";
    }
    if (course.id === 2) {
      return "from-green-500 to-emerald-600";
    }
    return "from-blue-500 to-indigo-600";
  };

  const getCourseTitle = () => {
    if (course.id === 1) return t.germanCourseTitle;
    if (course.id === 2) return t.biologyCourseTitle;
    return t.geographyCourseTitle;
  };

  const getCourseDesc = () => {
    if (course.id === 1) return t.germanCourseDesc;
    if (course.id === 2) return t.biologyCourseDesc;
    return t.geographyCourseDesc;
  };

  const getCourseLevel = () => {
    if (course.level === "beginner") return t.beginnerLevel;
    if (course.level === "grade8") return t.grade8;
    return course.level;
  };

  // Calculate actual lesson count from all bands and sections
  const actualLessonCount = bands.reduce(
    (total, band) =>
      total +
      band.sections.reduce(
        (sectionTotal, section) => sectionTotal + section.lessons.length,
        0,
      ),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span>{t.back}</span>
            </Link>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">{getSubjectIcon()}</div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-3">
                {getCourseTitle()}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{getCourseDesc()}</p>
              <div className="flex items-center gap-6 text-gray-400">
                <span className="flex items-center gap-2">
                  <FaBook />
                  {actualLessonCount} {t.lessonsCount}
                </span>
                <span className="flex items-center gap-2">
                  <FaGraduationCap />
                  {getCourseLevel()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons List Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-8">{t.selectLesson}</h2>

        <div className="max-w-4xl space-y-16">
          {bands.map((band, bandIndex) => (
            <div key={bandIndex}>
              {/* Band Title */}
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-white border-b-2 border-yellow-500 pb-3 inline-block">
                  {band.bandTitle}
                </h2>
              </div>

              {/* Sections in this band */}
              <div className="space-y-12">
                {band.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Section Title */}
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6 uppercase">
                      {section.sectionTitle}
                    </h3>

                    {/* Lessons in this section */}
                    <div className="grid gap-4">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-transparent transform hover:scale-[1.02] cursor-pointer"
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient()} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}
                          ></div>

                          <div className="relative p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6 flex-1">
                              <div
                                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSubjectGradient()} flex items-center justify-center text-white text-2xl font-bold`}
                              >
                                {lesson.id}
                              </div>

                              <div className="flex-1">
                                <h4 className="text-2xl font-bold text-white mb-2">
                                  {lesson.title}
                                </h4>
                                <div className="flex items-center gap-4 text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <FaClock className="text-sm" />
                                    {lesson.duration}
                                  </span>
                                  {lesson.completed && (
                                    <span className="flex items-center gap-1 text-green-400">
                                      <FaCheckCircle className="text-sm" />
                                      {t.completed}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Link to={`/lessons/${courseId}/${lesson.id}`}>
                              <button
                                className={`bg-gradient-to-r ${getSubjectGradient()} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105`}
                              >
                                {t.start}
                              </button>
                            </Link>
                          </div>

                          {/* Shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl">
                            <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
};

export default Lessons;
