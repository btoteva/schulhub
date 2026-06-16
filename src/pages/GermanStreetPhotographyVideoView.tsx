import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";
import streetData from "../data/street-photography.json";

const STORAGE_KEY = "schulhub-street-photography-watched";

const GermanStreetPhotographyVideoView: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const { channels, videos } = streetData;
  const video = videos.find((v) => v.id === videoId);
  const channel = video
    ? channels.find((c) => c.id === video.channel)
    : undefined;
  const watched = token && video && watchedIds.includes(video.id);

  useEffect(() => {
    if (!token) {
      setWatchedIds([]);
      return;
    }
    let cancelled = false;
    getUserProgress(STORAGE_KEY, token).then((data) => {
      if (cancelled || !data || typeof data !== "object" || Array.isArray(data))
        return;
      const ids = (data as { ids?: string[] }).ids;
      setWatchedIds(Array.isArray(ids) ? ids : []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggleWatched = () => {
    if (!token || !video) return;
    const next = watched
      ? watchedIds.filter((id) => id !== video.id)
      : [...watchedIds, video.id];
    setWatchedIds(next);
    setUserProgress(STORAGE_KEY, { ids: next }, token);
  };

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/german/street-photography"
            className={`inline-flex items-center gap-2 ${isLight ? "text-indigo-600 hover:text-indigo-700" : "text-indigo-300 hover:text-indigo-200"}`}
          >
            <FaArrowLeft />
            {t.back}
          </Link>
        </div>

        {video ? (
          <div>
            <header className="mb-8">
              <h1
                className={`text-2xl sm:text-3xl font-bold ${isLight ? "text-indigo-700" : "text-indigo-300"}`}
              >
                {video.title}
              </h1>
              <p
                className={`mt-2 text-base sm:text-lg ${isLight ? "text-slate-600" : "text-gray-400"}`}
              >
                {channel ? channel.name : ""} · {video.duration}
              </p>
            </header>

            <div className="w-full max-w-4xl mx-auto mb-6">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  data-testid="street-photography-iframe"
                  title={video.title}
                  style={{ borderRadius: "12px" }}
                  src={`https://www.youtube.com/embed/${video.id}`}
                  width="100%"
                  height="100%"
                  frameBorder={0}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="eager"
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                  isLight
                    ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                    : "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700/50"
                }`}
              >
                <FaYoutube className="w-5 h-5" />
                {language === "bg"
                  ? "Отвори в YouTube"
                  : language === "de"
                    ? "In YouTube öffnen"
                    : "Open in YouTube"}
                <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
              </a>
              {channel && (
                <a
                  href={channel.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
                    isLight
                      ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "border border-slate-600 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {language === "bg"
                    ? "Канал на автора"
                    : language === "de"
                      ? "Kanal des Autors"
                      : "Author's channel"}
                  <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
                </a>
              )}
              {token && (
                <button
                  type="button"
                  onClick={toggleWatched}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-colors ${
                    watched
                      ? isLight
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-green-900/50 text-green-300 hover:bg-green-900/70"
                      : isLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                  title={watched ? t.markAsNotWatched : t.markAsWatched}
                >
                  <FaCheckCircle
                    className={`w-5 h-5 shrink-0 ${watched ? (isLight ? "text-green-600" : "text-green-400") : "opacity-40"}`}
                  />
                  <span>{watched ? t.watched : t.markAsWatched}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2
              className={`text-2xl font-bold ${isLight ? "text-slate-800" : "text-white"}`}
            >
              {t.courseNotFound}
            </h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default GermanStreetPhotographyVideoView;
