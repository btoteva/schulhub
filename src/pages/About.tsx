import React from "react";
import { Link } from "react-router-dom";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import ScrollToTopButton from "../components/ScrollToTopButton";

export interface AboutContentLang {
  title: string;
  body: string;
}

const staticContent: Record<Language, AboutContentLang> = {
  bg: {
    title: "За нас",
    body: "ShulHub е образователна платформа за немски език, биология и география.\n\nТук ще намерите уроци, материали и тестове, подредени по теми. Платформата поддържа различни езици на интерфейса (български, английски, немски) и настройки за шрифт за по-добра четливост.",
  },
  en: {
    title: "About Us",
    body: "ShulHub is an educational platform for German language, biology and geography.\n\nHere you will find lessons, materials and tests organised by topic. The platform supports multiple interface languages (Bulgarian, English, German) and font settings for better readability.",
  },
  de: {
    title: "Über uns",
    body: "ShulHub ist eine Bildungsplattform für Deutsch, Biologie und Geographie.\n\nHier finden Sie Lektionen, Materialien und Tests nach Themen. Die Plattform unterstützt mehrere Sprachen (Bulgarisch, Englisch, Deutsch) und Schrifteinstellungen für bessere Lesbarkeit.",
  },
};

const About: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const langContent = staticContent[language] ?? staticContent.bg;
  const paragraphs = langContent.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 font-semibold ${
              isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
            }`}
          >
            ← {language === "bg" ? "Начало" : language === "de" ? "Start" : "Home"}
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">{langContent.title}</h1>
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className={isLight ? "text-slate-700" : "text-slate-300"}>{p}</p>
          ))}
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default About;
