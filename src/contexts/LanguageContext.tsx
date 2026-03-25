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
  englishSubject: string;
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
  watched: string;
  markAsWatched: string;
  markAsNotWatched: string;

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
  mindmaps: string;
  exercises: string;
  clearExerciseProgress: string;
  clearDsdProgress: string;
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
  login: string;
  logout: string;
  username: string;
  email: string;
  usernameOrEmail: string;
  emailAlreadyRegistered: string;
  invalidEmail: string;
  password: string;
  loginButton: string;
  register: string;
  registerButton: string;
  profile: string;
  roleUser: string;
  roleAdmin: string;
  loggedInAs: string;
  manageUsers: string;
  edit: string;
  deleteUser: string;
  changeRole: string;
  roleUpdated: string;
  emailUpdated: string;
  changePassword: string;
  createUser: string;
  newPassword: string;
  createdAt: string;
  editProfile: string;
  currentPassword: string;
  confirmPassword: string;
  saveProfile: string;
  profileSaved: string;
  passwordChanged: string;
  passwordMinLength: string;
  passwordsDoNotMatch: string;
  invalidUser: string;
  roleSuperAdmin: string;
  superUser: string;
  school: string;
  class: string;
  parallel: string;
  weeklyProgram: string;
  weeklyProgramNoData: string;
  editWeeklyProgram: string;
  addWeeklyProgram: string;
  newProgram: string;
  editAbout: string;
  saveAbout: string;
  cancel: string;
  resources: string;
  audioResources: string;
  relaxationAudioDesc: string;
  relaxationAudioTitle: string;
  additionalResources: string;
  comingSoon: string;
  englishVideoSource: string;
  englishGrammarTitle: string;
  englishGrammarSubtitle: string;
  englishGrammarSource: string;
  viewOnYoutubePlaylist: string;

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
  englishCourseTitle: string;
  englishCourseDesc: string;
  englishLessonsDesc: string;
  englishPodcastsDesc: string;

  // Course levels/grades
  grade8: string;
  beginnerLevel: string;
  b1Level: string;

  // Profile type & children
  profileType: string;
  profileTypeStudent: string;
  profileTypeParent: string;
  profileTypeNone: string;
  myChildren: string;
  addChild: string;
  childName: string;
  weeklyProgramForChild: string;
  noChildrenYet: string;
  deleteChild: string;
  gender: string;
  genderMale: string;
  genderFemale: string;
  genderNone: string;
  momIsHere: string;
  dadIsHere: string;
  parentIsHere: string;
  studentUsernameInPlatform: string;
  personalSection: string;
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
    englishSubject: "Английски",
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
    watched: "Изгледан",
    markAsWatched: "Маркирай като изгледан",
    markAsNotWatched: "Премахни маркировката",

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
    mindmaps: "Мисловни карти",
    exercises: "Упражнения",
    clearExerciseProgress: "Изчисти напредъка за този урок",
    clearDsdProgress: "Изчисти напредъка",
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
    flashcardPrepositionHint:
      "От едната страна – глаголът, от другата – предлог и падеж",
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
    login: "Вход",
    logout: "Изход",
    username: "Потребител",
    email: "Имейл",
    usernameOrEmail: "Потребител или имейл",
    emailAlreadyRegistered: "Този имейл вече е регистриран.",
    invalidEmail: "Невалиден формат на имейл.",
    password: "Парола",
    loginButton: "Вход",
    register: "Регистрация",
    registerButton: "Регистрирай се",
    profile: "Профил",
    roleUser: "Потребител",
    roleAdmin: "Администратор",
    loggedInAs: "Влязъл като",
    manageUsers: "Потребители",
    edit: "Редактирай",
    deleteUser: "Изтрий",
    changeRole: "Роля",
    roleUpdated: "Ролята е обновена.",
    emailUpdated: "Имейлът е обновен.",
    changePassword: "Промени парола",
    createUser: "Нов потребител",
    newPassword: "Нова парола",
    createdAt: "Регистрация",
    editProfile: "Редактирай профил",
    currentPassword: "Текуща парола",
    confirmPassword: "Потвърди новата парола",
    saveProfile: "Запази",
    profileSaved: "Профилът е запазен.",
    passwordChanged: "Паролата е сменена успешно.",
    passwordMinLength: "Паролата трябва да е поне 6 символа.",
    passwordsDoNotMatch: "Паролите не съвпадат.",
    invalidUser: "Невалиден потребител.",
    roleSuperAdmin: "Супер администратор",
    superUser: "Суперпотребител",
    school: "Училище",
    class: "Клас",
    parallel: "Паралелка",
    weeklyProgram: "Седмична програма",
    weeklyProgramNoData: "Няма програма за твоето училище и клас.",
    editWeeklyProgram: "Редактирай седмични програми",
    addWeeklyProgram: "Добави седмична програма",
    newProgram: "Нова програма",
    editAbout: "Редактирай „За нас“",
    saveAbout: "Запази",
    cancel: "Отказ",
    resources: "Ресурси",
    audioResources: "Аудио материали",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "Медитативна аудиозапис на немски език за релаксация и подготовка преди учене. Помага за концентрация и спокойствие.",
    additionalResources: "Допълнителни ресурси",
    comingSoon: "Очаквайте скоро още полезни материали!",
    englishVideoSource: "Видео уроци от YouTube канала Easy English",
    englishGrammarTitle: "Lessong",
    englishGrammarSubtitle: "Grammar & Vocabulary",
    englishGrammarSource: "Video lessons from Easy English YouTube channel",
    viewOnYoutubePlaylist: "Виж целия плейлист в YouTube",

    profileType: "Тип профил",
    profileTypeStudent: "Ученик",
    profileTypeParent: "Родител",
    profileTypeNone: "— не е избрано",
    myChildren: "Моите деца",
    addChild: "Добави дете",
    childName: "Име на детето",
    weeklyProgramForChild: "Седмична програма",
    noChildrenYet: "Все още нямате добавени деца.",
    deleteChild: "Изтрий",
    gender: "Пол",
    genderMale: "Мъжки",
    genderFemale: "Женски",
    genderNone: "— не е избрано",
    momIsHere: "Мама е тук",
    dadIsHere: "Тато е тук",
    parentIsHere: "Родител е тук",
    personalSection: "Лична секция",
    studentUsernameInPlatform:
      "Потребителско име или email в платформата (за свързване с профила на детето)",

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
    englishCourseTitle: "Английски език",
    englishCourseDesc: "Учете английски език с интерактивни уроци и подкасти.",
    englishLessonsDesc: "Super Easy English",
    englishPodcastsDesc: "Аудио записи за слушане и упражняване на слуха.",

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
    englishSubject: "English",
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
    watched: "Watched",
    markAsWatched: "Mark as watched",
    markAsNotWatched: "Mark as not watched",

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
    mindmaps: "Mind maps",
    exercises: "Exercises",
    clearExerciseProgress: "Clear progress for this lesson",
    clearDsdProgress: "Clear progress",
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
    flashcardPrepositionHint:
      "One side: the verb; other side: preposition and case",
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
    login: "Login",
    logout: "Logout",
    username: "Username",
    email: "Email",
    usernameOrEmail: "Username or email",
    emailAlreadyRegistered: "This email is already registered.",
    invalidEmail: "Invalid email format.",
    password: "Password",
    loginButton: "Log in",
    register: "Register",
    registerButton: "Sign up",
    profile: "Profile",
    roleUser: "User",
    roleAdmin: "Administrator",
    loggedInAs: "Logged in as",
    manageUsers: "Users",
    edit: "Edit",
    deleteUser: "Delete",
    changeRole: "Role",
    roleUpdated: "Role updated.",
    emailUpdated: "Email updated.",
    changePassword: "Change password",
    createUser: "Create user",
    newPassword: "New password",
    createdAt: "Created",
    editProfile: "Edit profile",
    currentPassword: "Current password",
    confirmPassword: "Confirm new password",
    saveProfile: "Save",
    profileSaved: "Profile saved.",
    passwordChanged: "Password changed successfully.",
    passwordMinLength: "Password must be at least 6 characters.",
    passwordsDoNotMatch: "Passwords do not match.",
    invalidUser: "Invalid user.",
    roleSuperAdmin: "Super administrator",
    superUser: "Super user",
    school: "School",
    class: "Class",
    parallel: "Section",
    weeklyProgram: "Weekly program",
    weeklyProgramNoData: "No program for your school and class.",
    editWeeklyProgram: "Edit weekly programs",
    addWeeklyProgram: "Add weekly program",
    newProgram: "New program",
    editAbout: "Edit About us",
    saveAbout: "Save",
    cancel: "Cancel",
    resources: "Resources",
    audioResources: "Audio Materials",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "A meditative audio recording in German for relaxation and preparation before learning. Helps with concentration and calmness.",
    additionalResources: "Additional Resources",
    comingSoon: "More useful materials coming soon!",
    englishVideoSource: "Video lessons from Easy English YouTube channel",
    englishGrammarTitle: "Lessong",
    englishGrammarSubtitle: "Grammar & Vocabulary",
    englishGrammarSource: "Video lessons from Easy English YouTube channel",
    viewOnYoutubePlaylist: "View full playlist on YouTube",

    profileType: "Profile type",
    profileTypeStudent: "Student",
    profileTypeParent: "Parent",
    profileTypeNone: "— not selected",
    myChildren: "My children",
    addChild: "Add child",
    childName: "Child's name",
    weeklyProgramForChild: "Weekly program",
    noChildrenYet: "You have not added any children yet.",
    deleteChild: "Delete",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderNone: "— not selected",
    momIsHere: "Mom is here",
    dadIsHere: "Dad is here",
    parentIsHere: "Parent is here",
    personalSection: "Personal section",
    studentUsernameInPlatform:
      "Username or email (to link with the child's account)",

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
    englishCourseTitle: "English Language",
    englishCourseDesc: "Learn English with interactive lessons and podcasts.",
    englishLessonsDesc: "Super Easy English",
    englishPodcastsDesc:
      "Audio recordings for listening and practicing hearing.",

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
    englishSubject: "Englisch",
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
    watched: "Angesehen",
    markAsWatched: "Als angesehen markieren",
    markAsNotWatched: "Markierung entfernen",

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
    mindmaps: "Mindmaps",
    exercises: "Übungen",
    clearExerciseProgress: "Fortschritt für diese Lektion zurücksetzen",
    clearDsdProgress: "Fortschritt zurücksetzen",
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
    flashcardPrepositionHint:
      "Eine Seite: das Verb; andere Seite: Präposition und Kasus",
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
    login: "Anmelden",
    logout: "Abmelden",
    username: "Benutzername",
    email: "E-Mail",
    usernameOrEmail: "Benutzername oder E-Mail",
    emailAlreadyRegistered: "Diese E-Mail ist bereits registriert.",
    invalidEmail: "Ungültiges E-Mail-Format.",
    password: "Passwort",
    loginButton: "Anmelden",
    register: "Registrierung",
    registerButton: "Registrieren",
    profile: "Profil",
    roleUser: "Benutzer",
    roleAdmin: "Administrator",
    loggedInAs: "Angemeldet als",
    manageUsers: "Benutzer",
    edit: "Bearbeiten",
    deleteUser: "Löschen",
    changeRole: "Rolle",
    roleUpdated: "Rolle aktualisiert.",
    emailUpdated: "E-Mail aktualisiert.",
    changePassword: "Passwort ändern",
    createUser: "Benutzer anlegen",
    newPassword: "Neues Passwort",
    createdAt: "Registriert",
    editProfile: "Profil bearbeiten",
    currentPassword: "Aktuelles Passwort",
    confirmPassword: "Neues Passwort bestätigen",
    saveProfile: "Speichern",
    profileSaved: "Profil gespeichert.",
    passwordChanged: "Passwort erfolgreich geändert.",
    passwordMinLength: "Das Passwort muss mindestens 6 Zeichen haben.",
    passwordsDoNotMatch: "Die Passwörter stimmen nicht überein.",
    invalidUser: "Ungültiger Benutzer.",
    roleSuperAdmin: "Superadministrator",
    superUser: "Supernutzer",
    school: "Schule",
    class: "Klasse",
    parallel: "Parallelklasse",
    weeklyProgram: "Wochenprogramm",
    weeklyProgramNoData: "Kein Programm für deine Schule und Klasse.",
    editWeeklyProgram: "Wochenprogramme bearbeiten",
    addWeeklyProgram: "Wochenprogramm hinzufügen",
    newProgram: "Neues Programm",
    editAbout: "Über uns bearbeiten",
    saveAbout: "Speichern",
    cancel: "Abbrechen",
    resources: "Ressourcen",
    audioResources: "Audiomaterialien",
    relaxationAudioTitle: "Entspannung - Kurt Tepperwein",
    relaxationAudioDesc:
      "Eine meditative Audioaufnahme auf Deutsch zur Entspannung und Vorbereitung vor dem Lernen. Hilft bei Konzentration und Ruhe.",
    additionalResources: "Zusätzliche Ressourcen",
    comingSoon: "Weitere nützliche Materialien folgen bald!",
    englishVideoSource: "Videolektionen vom YouTube-Kanal Easy English",
    englishGrammarTitle: "Lessong",
    englishGrammarSubtitle: "Grammar & Vocabulary",
    englishGrammarSource: "Video lessons from Easy English YouTube channel",
    viewOnYoutubePlaylist: "Ganze Playlist auf YouTube ansehen",

    profileType: "Profiltyp",
    profileTypeStudent: "Schüler",
    profileTypeParent: "Elternteil",
    profileTypeNone: "— nicht ausgewählt",
    myChildren: "Meine Kinder",
    addChild: "Kind hinzufügen",
    childName: "Name des Kindes",
    weeklyProgramForChild: "Wochenprogramm",
    noChildrenYet: "Sie haben noch keine Kinder hinzugefügt.",
    deleteChild: "Löschen",
    gender: "Geschlecht",
    genderMale: "Männlich",
    genderFemale: "Weiblich",
    genderNone: "— nicht ausgewählt",
    momIsHere: "Mama ist da",
    dadIsHere: "Papa ist da",
    parentIsHere: "Elternteil ist da",
    personalSection: "Persönlicher Bereich",
    studentUsernameInPlatform:
      "Benutzername oder E-Mail (um mit dem Konto des Kindes zu verknüpfen)",

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
    englishCourseTitle: "Englische Sprache",
    englishCourseDesc:
      "Lernen Sie Englisch mit interaktiven Lektionen und Podcasts.",
    englishLessonsDesc: "Super Easy English",
    englishPodcastsDesc:
      "Audioaufnahmen zum Zuhören und Üben des Hörverstehens.",

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
