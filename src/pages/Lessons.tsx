import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaBook, FaClock, FaCheckCircle } from 'react-icons/fa';
import { MdLanguage, MdScience, MdPublic } from 'react-icons/md';
import coursesData from '../data/courses.json';

// Lesson section interface
interface LessonSection {
  sectionTitle: string;
  lessons: Array<{ id: number; title: string; duration: string; completed: boolean }>;
}

// Sample lessons data organized by sections
const lessonsData: { [key: number]: LessonSection[] } = {
  1: [ // German
    {
      sectionTitle: 'Grundlagen',
      lessons: [
        { id: 1, title: 'Урок 1: Азбука и произношение', duration: '15 мин', completed: false },
        { id: 2, title: 'Урок 2: Приветствия и представяне', duration: '20 мин', completed: false },
        { id: 3, title: 'Урок 3: Числа и цифри', duration: '18 мин', completed: false },
        { id: 4, title: 'Урок 4: Основни глаголи', duration: '25 мин', completed: false },
        { id: 5, title: 'Урок 5: Съществителни имена и членове', duration: '22 мин', completed: false },
      ]
    }
  ],
  2: [ // Biology
    {
      sectionTitle: 'HERZ-KREISLAUF-SYSTEM.',
      lessons: [
        { id: 1, title: '5.3 HERZTÄTIGKEIT. BLUTKREISLAUF', duration: '25 мин', completed: false },
        { id: 2, title: 'Урок 2: Тъкани и органи', duration: '22 мин', completed: false },
        { id: 3, title: 'Урок 3: Храносмилателна система', duration: '25 мин', completed: false },
        { id: 4, title: 'Урок 4: Дихателна система', duration: '20 мин', completed: false },
        { id: 5, title: 'Урок 5: Кръвоносна система', duration: '24 мин', completed: false },
      ]
    }
  ],
  3: [ // Geography
    {
      sectionTitle: 'География - Основи',
      lessons: [
        { id: 1, title: 'Урок 1: Континенти и океани', duration: '18 мин', completed: false },
        { id: 2, title: 'Урок 2: Климатични зони', duration: '22 мин', completed: false },
        { id: 3, title: 'Урок 3: Релеф и форми на земята', duration: '20 мин', completed: false },
        { id: 4, title: 'Урок 4: Реки и езера', duration: '19 мин', completed: false },
        { id: 5, title: 'Урок 5: Население и градове', duration: '21 мин', completed: false },
      ]
    }
  ],
};

const Lessons: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const course = coursesData.find(c => c.id === Number(courseId));
  const sections = lessonsData[Number(courseId)] || [];

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Курсът не е намерен</h2>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Върнете се към началната страница
          </Link>
        </div>
      </div>
    );
  }

  const getSubjectIcon = () => {
    if (course.title.includes('Немски')) {
      return <MdLanguage className="text-7xl text-yellow-400" />;
    }
    if (course.title.includes('Биология')) {
      return <MdScience className="text-7xl text-green-400" />;
    }
    return <MdPublic className="text-7xl text-blue-400" />;
  };

  const getSubjectGradient = () => {
    if (course.title.includes('Немски')) {
      return 'from-yellow-500 to-orange-600';
    }
    if (course.title.includes('Биология')) {
      return 'from-green-500 to-emerald-600';
    }
    return 'from-blue-500 to-indigo-600';
  };

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
              <span>Назад</span>
            </Link>
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Начало
            </Link>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className="flex-shrink-0">
              {getSubjectIcon()}
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-4">{course.description}</p>
              <div className="flex items-center gap-6 text-gray-400">
                <span className="flex items-center gap-2">
                  <FaBook />
                  {course.lessons} урока
                </span>
                <span className="flex items-center gap-2">
                  <FaClock />
                  {course.duration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons List Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-white mb-8">Изберете урок</h2>

        <div className="max-w-4xl space-y-12">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6 uppercase">
                {section.sectionTitle}
              </h3>

              {/* Lessons in this section */}
              <div className="grid gap-4">
                {section.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-transparent transform hover:scale-[1.02] cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient()} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`}></div>

                    <div className="relative p-6 flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSubjectGradient()} flex items-center justify-center text-white text-2xl font-bold`}>
                          {lesson.id}
                        </div>

                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-white mb-2">{lesson.title}</h4>
                          <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaClock className="text-sm" />
                              {lesson.duration}
                            </span>
                            {lesson.completed && (
                              <span className="flex items-center gap-1 text-green-400">
                                <FaCheckCircle className="text-sm" />
                                Завършен
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link to={`/lessons/${courseId}/${lesson.id}`}>
                        <button className={`bg-gradient-to-r ${getSubjectGradient()} text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105`}>
                          Започни
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
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. Всички права запазени.</p>
        </div>
      </footer>
    </div>
  );
};

export default Lessons;
