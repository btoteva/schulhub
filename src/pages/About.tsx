import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";

const ABOUT_STORAGE_KEY = "schulhub-about";

export interface AboutContentLang {
  title: string;
  body: string;
}

export interface AboutContent {
  bg?: AboutContentLang;
  en?: AboutContentLang;
  de?: AboutContentLang;
}

const defaultContent: AboutContent = {
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

function getLangContent(content: AboutContent | null, lang: Language): AboutContentLang | null {
  if (!content) return null;
  const langContent = content[lang];
  if (langContent?.title && langContent?.body) return langContent;
  return content.bg ?? content.en ?? content.de ?? null;
}

const API_BASE = process.env.DEV_API_ORIGIN || "";

type LangKey = keyof AboutContent;

const About: React.FC = () => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { token, isAdmin } = useAuth();
  const isLight = theme === "light";
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<AboutContent>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/progress?key=${encodeURIComponent(ABOUT_STORAGE_KEY)}`)
      .then((res) => (res.ok ? res.json() : { value: null }))
      .then((data) => {
        if (cancelled) return;
        if (data?.value && typeof data.value === "object") {
          setContent(data.value as AboutContent);
          setEditDraft(data.value as AboutContent);
        } else {
          setContent(null);
          setEditDraft({});
        }
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveAbout = async () => {
    if (!token) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`${API_BASE}/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key: ABOUT_STORAGE_KEY, value: editDraft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(data.error || "Save failed");
        return;
      }
      setContent({ ...editDraft });
      setEditing(false);
    } catch (e) {
      setSaveError((e as Error).message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const langContent = getLangContent(content, language) ?? defaultContent[language] ?? defaultContent.bg!;
  const paragraphs = langContent.body.split(/\n\n+/).filter(Boolean);

  const langKeys: LangKey[] = ["bg", "en", "de"];

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 font-semibold ${
              isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
            }`}
          >
            ← {language === "bg" ? "Начало" : language === "de" ? "Start" : "Home"}
          </Link>
          {isAdmin && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium"
            >
              {language === "bg" ? "Редактирай" : language === "de" ? "Bearbeiten" : "Edit"}
            </button>
          )}
        </div>

        {loading ? (
          <p className={isLight ? "text-slate-600" : "text-slate-400"}>{language === "bg" ? "Зареждане..." : language === "de" ? "Laden..." : "Loading..."}</p>
        ) : editing ? (
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
            <h2 className="text-lg font-bold mb-4">{language === "bg" ? "Редактиране на „За нас“" : language === "de" ? "Über uns bearbeiten" : "Edit About us"}</h2>
            {langKeys.map((lang) => (
              <div key={lang} className="mb-6">
                <h3 className="text-sm font-semibold mb-2 uppercase opacity-80">
                  {lang === "bg" ? "Български" : lang === "de" ? "Deutsch" : "English"}
                </h3>
                <input
                  type="text"
                  value={editDraft[lang]?.title ?? ""}
                  onChange={(e) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      [lang]: { ...(prev[lang] || { title: "", body: "" }), title: e.target.value },
                    }))
                  }
                  placeholder="Title"
                  className={`w-full px-3 py-2 rounded-lg border mb-2 ${
                    isLight ? "border-slate-300 bg-slate-50 text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                  }`}
                />
                <textarea
                  value={editDraft[lang]?.body ?? ""}
                  onChange={(e) =>
                    setEditDraft((prev) => ({
                      ...prev,
                      [lang]: { ...(prev[lang] || { title: "", body: "" }), body: e.target.value },
                    }))
                  }
                  placeholder="Body (paragraphs separated by blank line)"
                  rows={5}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isLight ? "border-slate-300 bg-slate-50 text-slate-900" : "border-slate-600 bg-slate-700 text-white"
                  }`}
                />
              </div>
            ))}
            {saveError && <p className="text-red-500 text-sm mb-2">{saveError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveAbout}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
              >
                {saving ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setSaveError(""); setEditDraft(content || {}); }}
                className="px-4 py-2 rounded-lg border border-slate-400 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">{langContent.title}</h1>
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className={isLight ? "text-slate-700" : "text-slate-300"}>{p}</p>
              ))}
            </div>
          </>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default About;
