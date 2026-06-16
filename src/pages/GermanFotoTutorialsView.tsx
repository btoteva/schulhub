import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";
import fotoTutorialsData from "../data/foto-tutorials.json";

const GermanFotoTutorialsView: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const { channel, videos, groups } = fotoTutorialsData as typeof fotoTutorialsData & {
    groups?: Array<{
      id: string;
      titles: { bg: string; de: string; en: string };
    }>;
  };

  const groupedVideos = (groups ?? []).map((g) => ({
    ...g,
    videos: videos.filter((v) => (v as { group?: string }).group === g.id),
  }));
  const ungroupedVideos = videos.filter(
    (v) =>
      !(v as { group?: string }).group ||
      !(groups ?? []).some(
        (g) => g.id === (v as { group?: string }).group,
      ),
  );

  const groupTitle = (titles: { bg: string; de: string; en: string }) =>
    language === "bg" ? titles.bg : language === "de" ? titles.de : titles.en;

  const renderVideoCard = (video: (typeof videos)[number]) => {
    const watched = token && watchedIds.includes(video.id);
    return (
      <div
        key={video.id}
        className={`group relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${isLight ? "bg-white border border-slate-200 hover:border-amber-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 hover:border-transparent"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />

        <div className="relative p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {video.playlist_index}
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className={`text-xl font-bold mb-2 ${isLight ? "text-slate-800" : "text-white"}`}
              >
                {video.title}
              </h4>
              <div
                className={`flex flex-wrap items-center gap-4 ${isLight ? "text-slate-500" : "text-gray-400"}`}
              >
                <span className="flex items-center gap-1">
                  <FaClock className="text-sm" />
                  {video.duration}
                </span>
                {watched && (
                  <span
                    className={`inline-flex items-center gap-1 ${isLight ? "text-green-600" : "text-green-400"}`}
                  >
                    <FaCheckCircle className="w-4 h-4" />
                    {t.watched}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0">
            <Link to={`/german/foto-tutorial/${video.id}`}>
              <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 sm:px-6 py-3 rounded-l-lg font-semibold">
                {t.start}
              </button>
            </Link>
            {token && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const next = watched
                    ? watchedIds.filter((id) => id !== video.id)
                    : [...watchedIds, video.id];
                  setWatchedIds(next);
                  setUserProgress(
                    "schulhub-foto-tutorials-watched",
                    { ids: next },
                    token,
                  );
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-r-lg text-sm font-medium ${isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-700" : "bg-gray-800/50 hover:bg-gray-800 text-gray-300"}`}
                title={watched ? t.markAsNotWatched : t.markAsWatched}
              >
                <FaCheckCircle
                  className={`w-5 h-5 shrink-0 ${watched ? (isLight ? "text-green-600" : "text-green-400") : "opacity-40"}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!token) {
      setWatchedIds([]);
      return;
    }
    let cancelled = false;
    getUserProgress("schulhub-foto-tutorials-watched", token).then((data) => {
      if (cancelled || !data || typeof data !== "object" || Array.isArray(data))
        return;
      const ids = (data as { ids?: string[] }).ids;
      setWatchedIds(Array.isArray(ids) ? ids : []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-900"
          : "min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      }
    >
      {/* Header Section */}
      <section
        className={
          isLight
            ? "bg-white/80 border-b border-slate-200 shadow-sm"
            : "bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-950/50 border-b border-gray-800/50"
        }
      >
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/lessons/1"
              className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-300 hover:text-white"}`}
            >
              <FaArrowLeft />
              <span>{t.back}</span>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 mb-6">
            <div className="flex-shrink-0">
              {channel.imageUrl ? (
                <img
                  src={channel.imageUrl}
                  alt={channel.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <FaYoutube className="text-7xl text-red-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-4xl sm:text-5xl font-bold mb-2 ${isLight ? "text-slate-800" : "text-white"}`}
              >
                {channel.name}
              </h1>
              <p
                className={`text-base sm:text-lg mb-3 ${isLight ? "text-slate-600" : "text-gray-300"}`}
              >
                {channel.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={channel.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isLight
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700/50"
                  }`}
                >
                  <FaYoutube className="w-5 h-5" />
                  {language === "bg"
                    ? "Отвори канала в YouTube"
                    : language === "de"
                      ? "Kanal auf YouTube öffnen"
                      : "Open channel on YouTube"}
                  <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
                </a>
                {channel.websiteUrl && (
                  <a
                    href={channel.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isLight
                        ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                        : "border border-slate-600 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {channel.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <FaExternalLinkAlt className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
              <div
                className={`mt-4 flex items-center gap-6 ${isLight ? "text-slate-500" : "text-gray-400"}`}
              >
                <span className="flex items-center gap-2">
                  <FaBook />
                  {videos.length} {t.lessonsCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos List */}
      <section className="container mx-auto px-4 py-12">
        <h2
          className={`text-3xl font-bold mb-8 ${isLight ? "text-slate-800" : "text-white"}`}
        >
          {language === "bg"
            ? "Избрани епизоди"
            : language === "de"
              ? "Ausgewählte Episoden"
              : "Selected episodes"}
        </h2>

        <div className="max-w-4xl space-y-10">
          {groupedVideos
            .filter((g) => g.videos.length > 0)
            .map((g) => {
              const watchedInGroup = g.videos.filter((v) =>
                watchedIds.includes(v.id),
              ).length;
              return (
                <section key={g.id} aria-labelledby={`group-${g.id}`}>
                  <div
                    className={`flex items-center justify-between flex-wrap gap-3 mb-4 pb-2 border-b ${isLight ? "border-amber-200" : "border-amber-900/40"}`}
                  >
                    <h3
                      id={`group-${g.id}`}
                      className={`text-2xl font-bold ${isLight ? "text-amber-700" : "text-amber-300"}`}
                    >
                      {groupTitle(g.titles)}
                    </h3>
                    <span
                      className={`text-sm ${isLight ? "text-slate-500" : "text-gray-400"}`}
                    >
                      {token && watchedInGroup > 0
                        ? `${watchedInGroup} / ${g.videos.length}`
                        : `${g.videos.length}`}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {g.videos.map(renderVideoCard)}
                  </div>
                </section>
              );
            })}

          {ungroupedVideos.length > 0 && (
            <section aria-label="other-videos">
              <div className="space-y-4">
                {ungroupedVideos.map(renderVideoCard)}
              </div>
            </section>
          )}
        </div>

        <p
          className={`mt-8 text-sm max-w-4xl ${isLight ? "text-slate-500" : "text-gray-400"}`}
        >
          {language === "bg"
            ? "Списъкът се разширява постепенно. За още съдържание отвори канала директно в YouTube."
            : language === "de"
              ? "Die Liste wird laufend erweitert. Für weitere Inhalte öffne den Kanal direkt auf YouTube."
              : "The list is curated and growing. For more content, open the channel directly on YouTube."}
        </p>
      </section>

      <footer
        className={
          isLight
            ? "bg-slate-100 text-slate-500 py-8 border-t border-slate-200 mt-16"
            : "bg-black/50 text-gray-500 py-8 border-t border-gray-800/50 mt-16"
        }
      >
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 SchulHub. {t.allRightsReserved}</p>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
  );
};

export default GermanFotoTutorialsView;
