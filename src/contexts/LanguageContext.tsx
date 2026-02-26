import React, { createContext, useState, useContext, ReactNode } from "react";

export type Language = "bg" | "en" | "de";

// Translation keys
interface Translations {
  // Header
  home: string;
  lessons: string;
  aboutUs: string;
  contacts: string;
  font: string;

  // Font Settings
  fontSettings: string;
  fontType: string;
  fontSize: string;
  preview: string;
  bulgarian: string;
  german: string;
  small: string;
  normal: string;
  large: string;
  veryLarge: string;

  // Home page
  platformTitle: string;
  germanSubject: string;
  biologySubject: string;
  geographySubject: string;
  selectSubject: string;
  discoverPath: string;
  weeklyProgramTitle: string;
  weeklyProgramEnterPassword: string;
  weeklyProgramRememberMe: string;
  weeklyProgramUnlock: string;
  weeklyProgramWrongPassword: string;
  weeklyProgramLock: string;
  lessonsCount: string;
  seeMore: string;
  podcast: string;
  podcastListened: string;
  podcastMarkListened: string;
  podcastMarkUnlistened: string;
  allRightsReserved: string;

  // Lessons page
  back: string;
  selectLesson: string;
  courseNotFound: string;
  returnToHome: string;
  start: string;
  completed: string;

  // Lesson View
  lessonContent: string;
  dictionary: string;
  flashcards: string;
  exercises: string;
  clearExerciseProgress: string;
  dsdTests: string;
  test: string;
  playAll: string;
  pause: string;
  showAllTranslations: string;
  hideAllTranslations: string;
  listen: string;
  stop: string;
  clickForTranslation: string;
  translationToBulgarian: string;
  verb: string;
  flashcardPrepositionHint: string;
  prepositionAndCase: string;
  showTranslation: string;
  readWord: string;
  readExample: string;
  noWordsInDictionary: string;
  vocabularyTableWord: string;
  vocabularyTableSynonyms: string;
  vocabularyTableExplanation: string;
  vocabularyTableTranslation: string;
  vocabularyTestTab: string;
  showTeacherText: string;
  hideTeacherText: string;
  forward: string;
  menu: string;
  resources: string;
  audioResources: string;
  relaxationAudioDesc: string;
  relaxationAudioTitle: string;
  additionalResources: string;
  comingSoon: string;

  // Hero descriptions
  biologyDesc: string;
  geographyDesc: string;
  germanQuestion: string;

  // Course titles and descriptions
  germanCourseTitle: string;
  germanCourseDesc: string;
  biologyCourseTitle: string;
  biologyCourseDesc: string;
  geographyCourseTitle: string;
  geographyCourseDesc: string;

  // Course levels/grades
  grade8: string;
  beginnerLevel: string;
  b1Level: string;
}

const translations: Record<Language, Translations> = {
  bg: {
    // Header
    home: "Начало",
    lessons: "Уроци",
    aboutUs: "За нас",
    contacts: "Контакти",
    font: "Шрифт",

    // Font Settings
    fontSettings: "Настройки на шрифта",
    fontType: "Тип на шрифта:",
    fontSize: "Размер на шрифта:",
    preview: "Преглед:",
    bulgarian: "Български",
    german: "Немски",
    small: "Малък",
    normal: "Нормален",
    large: "Голям",
    veryLarge: "Много голям",

    // Home page
    platformTitle: "Платформа за интерактивно учене",
    germanSubject: "Немски",
    biologySubject: "Биология",
    geographySubject: "География",
    selectSubject: "Изберете предмет и тема за преглед",
    discoverPath: "Открийте своя път към знанието",
    weeklyProgramTitle: "Седмична програма",
    weeklyProgramEnterPassword: "Парола за достъп",
    weeklyProgramRememberMe: "Запомни ме",
    weeklyProgramUnlock: "Отключи",
    weeklyProgramWrongPassword: "Грешна парола",
    weeklyProgramLock: "Скрий програмата",
    lessonsCount: "урока",
    seeMore: "Виж повече",
    podcast: "Подкаст",
    podcastListened: "Изслушан",
    podcastMarkListened: "Маркирай като изслушан",
    podcastMarkUnlistened: "Премахни маркировката",
    allRightsReserved: "Всички права запазени.",

    // Lessons page
    back: "Назад",
    selectLesson: "Изберете урок",
    courseNotFound: "Курсът не е намерен",
    returnToHome: "Върнете се към началната страница",
    start: "Започни",
    completed: "Завършен",

    // Lesson View
    lessonContent: "Съдържание на урока",
    dictionary: "Речник",
    flashcards: "Флаш-карти",
    exercises: "Упражнения",
    clearExerciseProgress: "Изчисти напредъка за този урок",
    dsdTests: "DSD I Тестове",
    test: "Тест",
    playAll: "Пусни всички",
    pause: "Пауза",
    showAllTranslations: "Покажи всички преводи",
    hideAllTranslations: "Скрий всички преводи",
    listen: "Слушай",
    stop: "Спри",
    clickForTranslation: "Кликни за превод",
    translationToBulgarian: "Превод на Български",
    verb: "Глагол",
    flashcardPrepositionHint: "От едната страна – глаголът, от другата – предлог и падеж",
    prepositionAndCase: "Предлог и падеж",
    showTranslation: "Покажи превод",
    readWord: "Прочитай думата",
    readExample: "Прочитай примера",
    noWordsInDictionary: "Няма думи в речника",
    vocabularyTableWord: "Дума",
    vocabularyTableSynonyms: "Синоними",
    vocabularyTableExplanation: "Тълкуване",
    vocabularyTableTranslation: "Превод на български",
    vocabularyTestTab: "Тест",
    showTeacherText: "Покажи текст за учител",
    hideTeacherText: "Скрий текст за учител",
    forward: "Напред",
    menu: "Меню",
    resources: "Ресурси",
    audioResources: "Аудио материали",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "Медитативна аудиозапис на немски език за релаксация и подготовка преди учене. Помага за концентрация и спокойствие.",
    additionalResources: "Допълнителни ресурси",
    comingSoon: "Очаквайте скоро още полезни материали!",

    // Hero descriptions
    biologyDesc: "Изучаване на живота",
    geographyDesc: "Откривайте света",
    germanQuestion: "Sprechen Sie Deutsch?",

    // Course titles and descriptions
    germanCourseTitle: "Немски език",
    germanCourseDesc:
      "Научете основите на немския език с интерактивни уроци и упражнения.",
    biologyCourseTitle: "Биология",
    biologyCourseDesc:
      "Изследвайте света на живите организми и научете повече за човешкото тяло.",
    geographyCourseTitle: "География",
    geographyCourseDesc:
      "Опознайте света, континентите, климатите и географските особености.",

    // Course levels/grades
    grade8: "8 клас",
    beginnerLevel: "Начинаещи",
    b1Level: "Ниво B1",
  },
  en: {
    // Header
    home: "Home",
    lessons: "Lessons",
    aboutUs: "About Us",
    contacts: "Contacts",
    font: "Font",

    // Font Settings
    fontSettings: "Font Settings",
    fontType: "Font Type:",
    fontSize: "Font Size:",
    preview: "Preview:",
    bulgarian: "Bulgarian",
    german: "German",
    small: "Small",
    normal: "Normal",
    large: "Large",
    veryLarge: "Very Large",

    // Home page
    platformTitle: "Interactive Learning Platform",
    germanSubject: "German",
    biologySubject: "Biology",
    geographySubject: "Geography",
    selectSubject: "Select a subject and topic to review",
    discoverPath: "Discover your path to knowledge",
    weeklyProgramTitle: "Weekly program",
    weeklyProgramEnterPassword: "Password to view",
    weeklyProgramRememberMe: "Remember me",
    weeklyProgramUnlock: "Unlock",
    weeklyProgramWrongPassword: "Wrong password",
    weeklyProgramLock: "Hide program",
    lessonsCount: "lessons",
    seeMore: "See More",
    podcast: "Podcast",
    podcastListened: "Listened",
    podcastMarkListened: "Mark as listened",
    podcastMarkUnlistened: "Mark as not listened",
    allRightsReserved: "All rights reserved.",

    // Lessons page
    back: "Back",
    selectLesson: "Select a Lesson",
    courseNotFound: "Course not found",
    returnToHome: "Return to home page",
    start: "Start",
    completed: "Completed",

    // Lesson View
    lessonContent: "Lesson Content",
    dictionary: "Dictionary",
    flashcards: "Flashcards",
    exercises: "Exercises",
    clearExerciseProgress: "Clear progress for this lesson",
    dsdTests: "DSD I Tests",
    test: "Test",
    playAll: "Play All",
    pause: "Pause",
    showAllTranslations: "Show all translations",
    hideAllTranslations: "Hide all translations",
    listen: "Listen",
    stop: "Stop",
    clickForTranslation: "Click for translation",
    translationToBulgarian: "Bulgarian Translation",
    verb: "Verb",
    flashcardPrepositionHint: "One side: the verb; other side: preposition and case",
    prepositionAndCase: "Preposition and case",
    showTranslation: "Show translation",
    readWord: "Read word",
    readExample: "Read example",
    noWordsInDictionary: "No words in dictionary",
    vocabularyTableWord: "Word",
    vocabularyTableSynonyms: "Synonyms",
    vocabularyTableExplanation: "Explanation",
    vocabularyTableTranslation: "Bulgarian translation",
    vocabularyTestTab: "Test",
    showTeacherText: "Show text for teacher",
    hideTeacherText: "Hide text for teacher",
    forward: "Forward",
    menu: "Menu",
    resources: "Resources",
    audioResources: "Audio Materials",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "A meditative audio recording in German for relaxation and preparation before learning. Helps with concentration and calmness.",
    additionalResources: "Additional Resources",
    comingSoon: "More useful materials coming soon!",

    // Hero descriptions
    biologyDesc: "Study of life",
    geographyDesc: "Discover the world",
    germanQuestion: "Sprechen Sie Deutsch?",

    // Course titles and descriptions
    germanCourseTitle: "German Language",
    germanCourseDesc:
      "Learn the basics of German with interactive lessons and exercises.",
    biologyCourseTitle: "Biology",
    biologyCourseDesc:
      "Explore the world of living organisms and learn more about the human body.",
    geographyCourseTitle: "Geography",
    geographyCourseDesc:
      "Discover the world, continents, climates, and geographical features.",

    // Course levels/grades
    grade8: "Grade 8",
    beginnerLevel: "Beginner",
    b1Level: "Level B1",
  },
  de: {
    // Header
    home: "Startseite",
    lessons: "Lektionen",
    aboutUs: "Über uns",
    contacts: "Kontakt",
    font: "Schrift",

    // Font Settings
    fontSettings: "Schrifteinstellungen",
    fontType: "Schriftart:",
    fontSize: "Schriftgröße:",
    preview: "Vorschau:",
    bulgarian: "Bulgarisch",
    german: "Deutsch",
    small: "Klein",
    normal: "Normal",
    large: "Groß",
    veryLarge: "Sehr groß",

    // Home page
    platformTitle: "Interaktive Lernplattform",
    germanSubject: "Deutsch",
    biologySubject: "Biologie",
    geographySubject: "Geographie",
    selectSubject: "Wählen Sie ein Fach und Thema",
    discoverPath: "Entdecken Sie Ihren Weg zum Wissen",
    weeklyProgramTitle: "Wochenprogramm",
    weeklyProgramEnterPassword: "Passwort zum Anzeigen",
    weeklyProgramRememberMe: "Angemeldet bleiben",
    weeklyProgramUnlock: "Entsperren",
    weeklyProgramWrongPassword: "Falsches Passwort",
    weeklyProgramLock: "Programm ausblenden",
    lessonsCount: "Lektionen",
    seeMore: "Mehr sehen",
    podcast: "Podcast",
    podcastListened: "Gehört",
    podcastMarkListened: "Als gehört markieren",
    podcastMarkUnlistened: "Markierung entfernen",
    allRightsReserved: "Alle Rechte vorbehalten.",

    // Lessons page
    back: "Zurück",
    selectLesson: "Lektion auswählen",
    courseNotFound: "Kurs nicht gefunden",
    returnToHome: "Zurück zur Startseite",
    start: "Starten",
    completed: "Abgeschlossen",

    // Lesson View
    lessonContent: "Lektionsinhalt",
    dictionary: "Wörterbuch",
    flashcards: "Lernkarten",
    exercises: "Übungen",
    clearExerciseProgress: "Fortschritt für diese Lektion zurücksetzen",
    dsdTests: "DSD I Tests",
    test: "Test",
    playAll: "Alle abspielen",
    pause: "Pause",
    showAllTranslations: "Alle Übersetzungen anzeigen",
    hideAllTranslations: "Alle Übersetzungen ausblenden",
    listen: "Anhören",
    stop: "Stopp",
    clickForTranslation: "Klicken für Übersetzung",
    translationToBulgarian: "Bulgarische Übersetzung",
    verb: "Verb",
    flashcardPrepositionHint: "Eine Seite: das Verb; andere Seite: Präposition und Kasus",
    prepositionAndCase: "Präposition und Kasus",
    showTranslation: "Übersetzung anzeigen",
    readWord: "Wort vorlesen",
    readExample: "Beispiel vorlesen",
    noWordsInDictionary: "Keine Wörter im Wörterbuch",
    vocabularyTableWord: "Wort",
    vocabularyTableSynonyms: "Synonyme",
    vocabularyTableExplanation: "Erklärung",
    vocabularyTableTranslation: "Bulgarische Übersetzung",
    vocabularyTestTab: "Test",
    showTeacherText: "Text für Lehrkraft anzeigen",
    hideTeacherText: "Text für Lehrkraft ausblenden",
    forward: "Weiter",
    menu: "Menü",
    resources: "Ressourcen",
    audioResources: "Audiomaterialien",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "Eine meditative Audioaufnahme auf Deutsch zur Entspannung und Vorbereitung vor dem Lernen. Hilft bei Konzentration und Ruhe.",
    additionalResources: "Zusätzliche Ressourcen",
    comingSoon: "Weitere nützliche Materialien folgen bald!",

    // Hero descriptions
    biologyDesc: "Das Studium des Lebens",
    geographyDesc: "Entdecken Sie die Welt",
    germanQuestion: "Sprechen Sie Deutsch?",

    // Course titles and descriptions
    germanCourseTitle: "Deutsche Sprache",
    germanCourseDesc:
      "Lernen Sie die Grundlagen der deutschen Sprache mit interaktiven Lektionen und Übungen.",
    biologyCourseTitle: "Biologie",
    biologyCourseDesc:
      "Entdecken Sie die Welt der lebenden Organismen und erfahren Sie mehr über den menschlichen Körper.",
    geographyCourseTitle: "Geographie",
    geographyCourseDesc:
      "Entdecken Sie die Welt, Kontinente, Klimazonen und geografische Besonderheiten.",

    // Course levels/grades
    grade8: "Klasse 8",
    beginnerLevel: "Anfänger",
    b1Level: "Niveau B1",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage
    const saved = localStorage.getItem("schulhub-language");
    if (saved && (saved === "bg" || saved === "en" || saved === "de")) {
      return saved as Language;
    }
    return "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("schulhub-language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
