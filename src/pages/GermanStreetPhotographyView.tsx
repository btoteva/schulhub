import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaStreetView,
  FaYoutube,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";
import streetData from "../data/street-photography.json";

const STORAGE_KEY = "schulhub-street-photography-watched";

type Lang = "bg" | "de" | "en";

interface ChannelMeta {
  id: string;
  name: string;
  fullName?: string;
  channelUrl: string;
  websiteUrl?: string;
  description: { bg: string; de: string; en: string };
}

interface VideoMeta {
  id: string;
  channel: string;
  title: string;
  duration: string;
  playlist_index: number;
}

const GermanStreetPhotographyView: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const { section, channels, videos } = streetData as {
    section: {
      title: { bg: string; de: string; en: string };
      description: { bg: string; de: string; en: string };
    };
    channels: ChannelMeta[];
    videos: VideoMeta[];
  };

  const lang: Lang = (language as Lang) ?? "en";
  const pickLang = (obj: { bg: string; de: string; en: string }) =>
    obj[lang] ?? obj.en;

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

  const toggleWatched = (videoId: string) => {
    if (!token) return;
    const next = watchedIds.includes(videoId)
      ? watchedIds.filter((id) => id !== videoId)
      : [...watchedIds, videoId];
    setWatchedIds(next);
    setUserProgress(STORAGE_KEY, { ids: next }, token);
  };

  const renderVideoCard = (video: VideoMeta) => {
    const watched = token && watchedIds.includes(video.id);
    return (
      <div
        key={video.id}
        className={`group relative rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] ${isLight ? "bg-white border border-slate-200 hover:border-indigo-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 hover:border-transparent"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />

        <div className="relative p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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
            <Link to={`/german/street-photography/${video.id}`}>
              <button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-5 sm:px-6 py-3 rounded-l-lg font-semibold">
                {t.start}
              </button>
            </Link>
            {token && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleWatched(video.id);
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
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-lg ${isLight ? "bg-indigo-50" : "bg-indigo-900/40"}`}
              >
                <FaStreetView
                  className={`text-6xl ${isLight ? "text-indigo-500" : "text-indigo-300"}`}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className={`text-4xl sm:text-5xl font-bold mb-2 ${isLight ? "text-slate-800" : "text-white"}`}
              >
                {pickLang(section.title)}
              </h1>
              <p
                className={`text-base sm:text-lg mb-3 ${isLight ? "text-slate-600" : "text-gray-300"}`}
              >
                {pickLang(section.description)}
              </p>
              <div
                className={`mt-4 flex items-center gap-6 ${isLight ? "text-slate-500" : "text-gray-400"}`}
              >
                <span className="flex items-center gap-2">
                  <FaBook />
                  {videos.length} {t.lessonsCount}
                </span>
                <span className="flex items-center gap-2">
                  <FaYoutube
                    className={isLight ? "text-red-500" : "text-red-400"}
                  />
                  {channels.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels overview */}
      <section className="container mx-auto px-4 py-8">
        <h2
          className={`text-2xl font-bold mb-6 ${isLight ? "text-slate-800" : "text-white"}`}
        >
          {language === "bg"
            ? "Канали в подборката"
            : language === "de"
              ? "Kanäle in der Auswahl"
              : "Channels in the selection"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-5xl">
          {channels.map((c) => (
            <div
              key={c.id}
              className={`rounded-xl p-5 border ${isLight ? "bg-white border-slate-200" : "bg-gray-900/60 border-gray-700"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3
                    className={`text-lg font-bold truncate ${isLight ? "text-slate-800" : "text-white"}`}
                  >
                    {c.name}
                  </h3>
                  {c.fullName && (
                    <p
                      className={`text-sm ${isLight ? "text-slate-500" : "text-gray-400"}`}
                    >
                      {c.fullName}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold flex-shrink-0 ${isLight ? "bg-indigo-50 text-indigo-700" : "bg-indigo-900/40 text-indigo-300"}`}
                >
                  {videos.filter((v) => v.channel === c.id).length}
                </span>
              </div>
              <p
                className={`text-sm mb-3 ${isLight ? "text-slate-600" : "text-gray-300"}`}
              >
                {pickLang(c.description)}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={c.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isLight ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200" : "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700/50"}`}
                >
                  <FaYoutube className="w-4 h-4" />
                  YouTube
                  <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-70" />
                </a>
                {c.websiteUrl && (
                  <a
                    href={c.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isLight ? "border border-slate-300 text-slate-700 hover:bg-slate-100" : "border border-slate-600 text-slate-200 hover:bg-slate-800"}`}
                  >
                    {c.websiteUrl
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                    <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Videos grouped per channel */}
      <section className="container mx-auto px-4 pb-12 pt-4">
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
          {channels
            .map((c) => ({
              channel: c,
              vids: videos.filter((v) => v.channel === c.id),
            }))
            .filter((g) => g.vids.length > 0)
            .map(({ channel, vids }) => {
              const watchedInGroup = vids.filter((v) =>
                watchedIds.includes(v.id),
              ).length;
              return (
                <section
                  key={channel.id}
                  aria-labelledby={`channel-${channel.id}`}
                >
                  <div
                    className={`flex items-center justify-between flex-wrap gap-3 mb-4 pb-2 border-b ${isLight ? "border-indigo-200" : "border-indigo-900/40"}`}
                  >
                    <h3
                      id={`channel-${channel.id}`}
                      className={`text-2xl font-bold ${isLight ? "text-indigo-700" : "text-indigo-300"}`}
                    >
                      {channel.name}
                    </h3>
                    <span
                      className={`text-sm ${isLight ? "text-slate-500" : "text-gray-400"}`}
                    >
                      {token && watchedInGroup > 0
                        ? `${watchedInGroup} / ${vids.length}`
                        : `${vids.length}`}
                    </span>
                  </div>
                  <div className="space-y-4">{vids.map(renderVideoCard)}</div>
                </section>
              );
            })}
        </div>

        <p
          className={`mt-8 text-sm max-w-4xl ${isLight ? "text-slate-500" : "text-gray-400"}`}
        >
          {language === "bg"
            ? "Списъкът се обновява периодично. Натисни името на канал, за да видиш всички видеа в YouTube."
            : language === "de"
              ? "Die Liste wird regelmäßig erweitert. Klicke auf einen Kanalnamen, um alle Videos auf YouTube zu sehen."
              : "The list is curated and growing. Click a channel name to see all videos on YouTube."}
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

export default GermanStreetPhotographyView;
