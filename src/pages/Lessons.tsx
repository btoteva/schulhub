import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaGraduationCap,
  FaCheckCircle,
  FaClock,
  FaVideo,
  FaTasks,
  FaSpotify,
  FaThLarge,
} from "react-icons/fa";
import { MdLanguage, MdScience, MdPublic } from "react-icons/md";
import coursesData from "../data/courses.json";
import { getLessonById } from "../data/lessons";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import DSDTestsListContent from "../components/DSDTestsListContent";
import { germanPodcasts } from "../data/german-podcasts";
import { isPodcastListened, togglePodcastListened } from "../utils/podcast-listened";

// Lesson section interface
interface LessonSection {
  sectionTitle: string;
  lessons: Array<{
    id: number | string;
    number?: string; // display number in section (e.g. "1")
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
              id: "1-1",
              number: "1",
              title: "Verben, Adjektive und Wortgruppen mit Präpositionen",
              duration: "—",
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
          sectionTitle: "III BEWEGUNG UND STÜTZE DES KÖRPERS",
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
        {
          sectionTitle: "Обобщение (III-1, III-2, III-3)",
          lessons: [
            {
              id: "2-summary",
              number: "Тест",
              title: "Kontrolle und Bewertung – Multiple Choice",
              duration: "15 мин",
              completed: false,
            },
          ],
        },
        {
          sectionTitle: "IV GESCHLECHTSSYSTEM",
          lessons: [
            {
              id: "5-1",
              number: "5",
              title: "IV-1 GESCHLECHTSORGANE DES MANNES",
              duration: "20 мин",
              completed: false,
            },
            {
              id: "5-2",
              number: "6",
              title: "IV-2 GESCHLECHTSORGANE DER FRAU",
              duration: "20 мин",
              completed: false,
            },
            {
              id: "5-3",
              number: "7",
              title: "IV-3 DIE BEFRUCHTUNG.",
              duration: "20 мин",
              completed: false,
            },
          ],
        },
        {
          sectionTitle: "V NERVENSYSTEM",
          lessons: [
            {
              id: "5-4",
              number: "8",
              title: "V-1 RÜCKENMARK",
              duration: "25 мин",
              completed: false,
            },
            {
              id: "5-5",
              number: "9",
              title: "V-2 GEHIRN",
              duration: "20 мин",
              completed: false,
            },
            {
              id: "5-6",
              number: "10",
              title: "V-3 DAS VEGETATIVE NERVENSYSTEM",
              duration: "20 мин",
              completed: false,
            },
          ],
        },
        {
          sectionTitle: "VI DAS ENDOKRINE SYSTEM",
          lessons: [
            {
              id: "6-1",
              number: "11",
              title: "VI-1 HYPOPHYSE, SCHILDDRÜSE UND NEBENSCHILDDRÜSEN",
              duration: "25 мин",
              completed: false,
            },
          ],
        },
        {
          sectionTitle: "VII SINNESSYSTEM",
          lessons: [
            {
              id: "7-1",
              number: "12",
              title: "VII-1 VISUELLES SINNESSYSTEM",
              duration: "—",
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
          sectionTitle: " ",
          lessons: [
            {
              id: 1,
              title:
                "14 LITHOSPHÄRE. ZUSAMMENSETZUNG DER ERDKRUSTE. TEKTONIK DER PLATTEN",
              duration: "18 мин",
              completed: false,
            },
            {
              id: 2,
              title: "15. ENDOGENE RELIEFBILDENDE PROZESSE",
              duration: "18 мин",
              completed: false,
            },
            {
              id: 3,
              title: "16. EXOGENE RELIEFBILDENDE PROZESSE",
              duration: "18 мин",
              completed: false,
            },
            {
              id: 4,
              title: "19 DAS NATURRESSOURCEN-POTENTIAL DER ERDE - 1",
              duration: "— мин",
              completed: false,
            },
            {
              id: 5,
              title: "20. DAS NATURRESSOURCEN-POTENTIAL DER ERDE-2",
              duration: "— мин",
              completed: false,
            },
            {
              id: 6,
              title: "17. DIE PEDOSPHÄRE. DIE BIOSPHÄRE",
              duration: "— мин",
              completed: false,
            },
            {
              id: 7,
              title: "18. NATURKOMPONENTEN UND NATURKOMPLEXE. NATURZONEN",
              duration: "— мин",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};

type GermanTab = "lessons" | "podcast" | "dsd";

const Lessons: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { courseId } = useParams<{ courseId: string }>();
  const course = coursesData.find((c) => c.id === Number(courseId));
  const bands = lessonsData[Number(courseId)] || [];
  const [germanTab, setGermanTab] = useState<GermanTab>("lessons");
  const [podcastListenedVersion, setPodcastListenedVersion] = useState(0);

  if (!course) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100" : "bg-gradient-to-b from-gray-900 via-gray-950 to-black"}`}>
        <div className="text-center">
          <h2 className={`text-4xl font-bold mb-4 ${isLight ? "text-slate-800" : "text-white"}`}>
            {t.courseNotFound}
          </h2>
          <Link to="/" className={isLight ? "text-amber-600 hover:text-amber-700" : "text-blue-400 hover:text-blue-300"}>
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
    if (course.level === "b1") return t.b1Level;
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
    <div className={isLight ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900" : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black"}>
      {/* Header Section */}
      <section className={isLight ? "bg-white/80 border-b border-slate-200 shadow-sm" : "bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 border-b border-gray-800/50"}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-300 hover:text-white"}`}
            >
              <FaArrowLeft />
              <span>{t.back}</span>
            </Link>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">{getSubjectIcon()}</div>
            <div>
              <h1 className={`text-5xl font-bold mb-3 ${isLight ? "text-slate-800" : "text-white"}`}>
                {getCourseTitle()}
              </h1>
              <p className={`text-xl mb-4 ${isLight ? "text-slate-600" : "text-gray-300"}`}>{getCourseDesc()}</p>
              <div className={`flex items-center gap-6 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
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

      {/* Tabs: only for German (course 1) – Уроци | Подкаст */}
      {course.id === 1 && (
        <section className="container mx-auto px-4 pt-6">
          <div className="max-w-4xl flex gap-2 border-b border-slate-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setGermanTab("lessons")}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                germanTab === "lessons"
                  ? isLight
                    ? "bg-amber-500/20 text-amber-700 border-b-2 border-amber-500 -mb-[2px]"
                    : "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 -mb-[2px]"
                  : isLight
                    ? "text-slate-600 hover:bg-slate-100"
                    : "text-gray-400 hover:bg-gray-800/50"
              }`}
            >
              {t.lessons}
            </button>
            <button
              type="button"
              onClick={() => setGermanTab("podcast")}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                germanTab === "podcast"
                  ? isLight
                    ? "bg-green-500/20 text-green-700 border-b-2 border-green-500 -mb-[2px]"
                    : "bg-green-500/20 text-green-300 border-b-2 border-green-400 -mb-[2px]"
                  : isLight
                    ? "text-slate-600 hover:bg-slate-100"
                    : "text-gray-400 hover:bg-gray-800/50"
              }`}
            >
              {t.podcast}
            </button>
            <button
              type="button"
              onClick={() => setGermanTab("dsd")}
              className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
                germanTab === "dsd"
                  ? isLight
                    ? "bg-amber-500/20 text-amber-700 border-b-2 border-amber-500 -mb-[2px]"
                    : "bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 -mb-[2px]"
                  : isLight
                    ? "text-slate-600 hover:bg-slate-100"
                    : "text-gray-400 hover:bg-gray-800/50"
              }`}
            >
              {t.dsdTests}
            </button>
          </div>
        </section>
      )}

      {/* Tab content: DSD tests (only for German when dsd tab active) */}
      {course.id === 1 && germanTab === "dsd" && (
        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <DSDTestsListContent isLight={isLight} language={language} />
        </section>
      )}

      {/* Tab content: Podcast list (only for German when podcast tab active) */}
      {course.id === 1 && germanTab === "podcast" && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl space-y-4">
            {germanPodcasts.map((podcast) => {
              const listened = isPodcastListened(podcast.spotifyEpisodeId);
              return (
                <div
                  key={podcast.id}
                  className={`rounded-xl shadow-lg border overflow-hidden flex items-stretch ${isLight ? "bg-white border-slate-200 hover:border-green-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/40"}`}
                >
                  <Link
                    to={`/german/podcast/${podcast.spotifyEpisodeId}`}
                    className={`group flex items-center gap-6 p-6 flex-1 min-w-0 transition-all duration-300 hover:shadow-inner`}
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-green-600 flex items-center justify-center text-white group-hover:bg-green-500 transition-colors">
                      <FaSpotify className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl font-bold ${isLight ? "text-slate-800 group-hover:text-green-700" : "text-white group-hover:text-green-300"}`}>
                        {podcast.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                        {podcast.subtitle} · {podcast.duration}
                        {listened && (
                          <span className={`inline-flex items-center gap-1 ml-2 ${isLight ? "text-green-600" : "text-green-400"}`}>
                            <FaCheckCircle className="w-4 h-4" />
                            {t.podcastListened}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 font-semibold text-sm ${isLight ? "text-green-600" : "text-green-400"}`}>
                      {language === "bg" ? "Слушай" : language === "de" ? "Anhören" : "Listen"}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      togglePodcastListened(podcast.spotifyEpisodeId);
                      setPodcastListenedVersion((v) => v + 1);
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 border-l text-sm font-medium ${isLight ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700" : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"}`}
                    title={listened ? t.podcastMarkUnlistened : t.podcastMarkListened}
                  >
                    <FaCheckCircle className={`w-5 h-5 shrink-0 ${listened ? (isLight ? "text-green-600" : "text-green-400") : "opacity-40"}`} />
                    <span className="hidden sm:inline">{listened ? t.podcastMarkUnlistened : t.podcastMarkListened}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Lessons List Section – shown when no tabs (other courses) or German + lessons tab */}
      {(!(course.id === 1) || germanTab === "lessons") && (
      <section className="container mx-auto px-4 py-16">
        <h2 className={`text-4xl font-bold mb-8 ${isLight ? "text-slate-800" : "text-white"}`}>{t.selectLesson}</h2>

        <div className="max-w-4xl space-y-16">
          {bands.map((band, bandIndex) => (
            <div key={bandIndex}>
              {/* Band Title */}
              <div className="mb-8">
                <h2 className={`text-4xl font-bold border-b-2 pb-3 inline-block ${isLight ? "text-slate-800 border-amber-500" : "text-white border-yellow-500"}`}>
                  {band.bandTitle}
                </h2>
              </div>

              {/* Sections in this band */}
              <div className="space-y-12">
                {band.sections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {/* Section Title */}
                    <h3 className={`text-2xl font-bold mb-6 uppercase ${course.id === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500" : course.id === 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500" : "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500"}`}>
                      {section.sectionTitle}
                    </h3>

                    {/* Lessons in this section */}
                    <div className="grid gap-4">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`group relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${isLight ? "bg-white border border-slate-200 hover:border-amber-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 hover:border-transparent"}`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient()} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}
                          ></div>

                          <div className="relative p-6 flex items-center justify-between">
                            <div className="flex items-center gap-6 flex-1">
                              <div
                                className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSubjectGradient()} flex items-center justify-center text-white text-2xl font-bold`}
                              >
                                {lesson.number ?? lesson.id}
                              </div>

                              <div className="flex-1">
                                <h4 className={`text-2xl font-bold mb-2 ${isLight ? "text-slate-800" : "text-white"}`}>
                                  {lesson.title}
                                </h4>
                                <div className={`flex items-center gap-4 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                                  <span className="flex items-center gap-1">
                                    <FaClock className="text-sm" />
                                    {lesson.duration}
                                  </span>
                                  {(() => {
                                    const lessonContent = getLessonById(
                                      Number(courseId),
                                      String(lesson.id),
                                    );
                                    const hasVideo =
                                      lessonContent?.resources?.some(
                                        (r: { type?: string }) =>
                                          r.type === "youtube-video",
                                      );
                                    const hasPodcast =
                                      lessonContent?.resources?.some(
                                        (r: { type?: string }) =>
                                          r.type === "spotify-podcast",
                                      );
                                    const hasExercises =
                                      (lessonContent?.exercises?.length ?? 0) >
                                      0;
                                    const hasFlashcards =
                                      (lessonContent?.dictionary?.flatMap(
                                        (s: { words?: unknown[] }) =>
                                          s.words ?? [],
                                      ).length ?? 0) > 0;
                                    return (
                                      <>
                                        {hasVideo && (
                                          <span
                                            className="flex items-center gap-1"
                                            title={
                                              language === "bg"
                                                ? "Видео"
                                                : "Video"
                                            }
                                          >
                                            <FaVideo className="text-sm text-red-400" />
                                          </span>
                                        )}
                                        {hasPodcast && (
                                          <span
                                            className="flex items-center gap-1"
                                            title={
                                              language === "bg"
                                                ? "Подкаст (Spotify)"
                                                : "Podcast (Spotify)"
                                            }
                                          >
                                            <FaSpotify className="text-sm text-green-500" />
                                          </span>
                                        )}
                                        {hasExercises && (
                                          <span
                                            className="flex items-center gap-1"
                                            title={
                                              language === "bg"
                                                ? "Упражнения"
                                                : "Übungen"
                                            }
                                          >
                                            <FaTasks className="text-sm text-amber-400" />
                                          </span>
                                        )}
                                        {hasFlashcards && (
                                          <span
                                            className="flex items-center gap-1"
                                            title={
                                              language === "bg"
                                                ? "Флаш-карти"
                                                : "Lernkarten"
                                            }
                                          >
                                            <FaThLarge className="text-sm text-cyan-400" />
                                          </span>
                                        )}
                                      </>
                                    );
                                  })()}
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
      )}

      {/* Footer */}
      <footer className={isLight ? "bg-slate-100 text-slate-500 py-8 border-t border-slate-200 mt-16" : "bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16"}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
};

export default Lessons;
