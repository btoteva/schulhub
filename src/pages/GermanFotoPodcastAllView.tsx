import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCamera, FaCheckCircle, FaSyncAlt } from "react-icons/fa";

import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  fotoPodcasts,
  FOTO_PODCAST_FEED_URL,
  FOTO_PODCAST_SUBTITLE,
} from "../data/foto-podcasts";
import type { GermanPodcastItem } from "../data/german-podcasts";
import { usePodcastFeed } from "../hooks/usePodcastFeed";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";

const GermanFotoPodcastAllView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { t, language } = useLanguage();
  const { token } = useAuth();
  const {
    items: feedItems,
    channel,
    loading,
    error,
    refetch,
  } = usePodcastFeed({
    feedUrl: FOTO_PODCAST_FEED_URL,
    subtitle: FOTO_PODCAST_SUBTITLE,
    defaultChannelTitle: "Fotografie für die Ohren",
  });

  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [podcastListenedIds, setPodcastListenedIds] = useState<string[]>([]);
  const pageSize = 10;

  useEffect(() => {
    if (!token) {
      setPodcastListenedIds([]);
      return;
    }
    let cancelled = false;
    getUserProgress("schulhub-podcast-listened", token).then((data) => {
      if (cancelled || !data || typeof data !== "object" || Array.isArray(data))
        return;
      const ids = (data as { ids?: string[] }).ids;
      setPodcastListenedIds(Array.isArray(ids) ? ids : []);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const episodesToShow: GermanPodcastItem[] = useMemo(() => {
    const list = feedItems.length > 0 ? feedItems : fotoPodcasts;
    const filterText = search.trim().toLowerCase();
    if (!filterText) return list;
    return list.filter((ep) => ep.title.toLowerCase().includes(filterText));
  }, [feedItems, search]);

  const totalPages = Math.max(1, Math.ceil(episodesToShow.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return episodesToShow.slice(start, start + pageSize);
  }, [episodesToShow, currentPage]);

  const fromFeed = feedItems.length > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fotoPodcastTitle =
    language === "bg"
      ? "Фото подкаст – всички епизоди"
      : language === "de"
        ? "Foto-Podcast – alle Episoden"
        : "Foto Podcast – all episodes";

  const fotoPodcastIntro =
    language === "bg"
      ? "Подкастът „Fotografie für die Ohren“ е чудесен за упражняване на немски (около ниво B1): кратки епизоди, бавно и ясно говорене, повтарящ се речник за фотография."
      : language === "de"
        ? "Der Podcast „Fotografie für die Ohren“ eignet sich gut zum Deutschlernen (etwa Niveau B1): kurze Episoden, klare Aussprache, wiederkehrender Foto-Wortschatz."
        : "The podcast \u201eFotografie f\u00fcr die Ohren\u201c is well-suited for German learners around B1: short episodes, clear narration, recurring photography vocabulary.";

  return (
    <div
      className={
        isLight
          ? "min-h-screen bg-slate-50 text-slate-900"
          : "min-h-screen bg-slate-900 text-slate-100"
      }
    >
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/lessons/1"
            className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        <div className="mb-6">
          {channel && fromFeed ? (
            <div
              className={`rounded-xl overflow-hidden border flex flex-col sm:flex-row gap-4 p-4 sm:p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800/50 border-slate-600"}`}
            >
              {channel.imageUrl && (
                <a
                  href={channel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <img
                    src={channel.imageUrl}
                    alt=""
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
                  />
                </a>
              )}
              <div className="flex-1 min-w-0">
                <h1
                  className={`text-2xl sm:text-3xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}
                >
                  {channel.title}
                </h1>
                {channel.description && (
                  <p
                    className={`text-sm mb-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}
                  >
                    {channel.description}
                  </p>
                )}
                {channel.link && (
                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium ${isLight ? "text-amber-600 hover:text-amber-700" : "text-amber-400 hover:text-amber-300"}`}
                  >
                    {channel.link
                      .replace(/^https?:\/\//, "")
                      .replace(/\/$/, "")}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <h1
                className={`flex items-center gap-3 text-3xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}
              >
                <FaCamera className="text-amber-500" />
                {fotoPodcastTitle}
              </h1>
              <p className={isLight ? "text-slate-600" : "text-slate-300"}>
                {fotoPodcastIntro}
              </p>
            </>
          )}
        </div>

        {loading && (
          <p
            className={`mb-4 flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}
          >
            <FaSyncAlt className="animate-spin" />
            {language === "bg"
              ? "Зареждане на списъка от feed..."
              : language === "de"
                ? "Feed wird geladen..."
                : "Loading feed..."}
          </p>
        )}
        {error && (
          <div
            className={`mb-4 flex flex-wrap items-center gap-2 ${isLight ? "text-amber-700" : "text-amber-300"}`}
          >
            <span>
              {language === "bg"
                ? "Feed не е наличен. Показваме подбрани епизоди."
                : language === "de"
                  ? "Feed nicht verfügbar. Ausgewählte Episoden werden angezeigt."
                  : "Feed unavailable. Showing selected episodes."}{" "}
              ({error})
            </span>
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-sm font-medium"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              {language === "bg"
                ? "Опитай отново"
                : language === "de"
                  ? "Erneut versuchen"
                  : "Retry"}
            </button>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              language === "bg"
                ? "Търси по заглавие..."
                : language === "de"
                  ? "Nach Titel suchen..."
                  : "Search by title..."
            }
            className={`w-full max-w-md rounded-lg px-3 py-2 text-sm border ${
              isLight
                ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                : "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500"
            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
          />
        </div>

        {!loading && episodesToShow.length === 0 && (
          <p className={isLight ? "text-slate-600" : "text-slate-300"}>
            {language === "bg"
              ? "Няма епизоди за показване."
              : language === "de"
                ? "Keine Episoden zum Anzeigen."
                : "No episodes to display."}
          </p>
        )}

        <div className="space-y-3 mt-4">
          {pagedEpisodes.map((ep) => {
            const episodeKey = ep.id;
            const listened = token && podcastListenedIds.includes(episodeKey);
            return (
              <div
                key={ep.id}
                className={`rounded-xl shadow-lg border overflow-hidden flex items-stretch ${isLight ? "bg-white border-slate-200 hover:border-amber-400/60" : "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 hover:border-amber-500/40"}`}
              >
                <Link
                  to={`/german/foto-podcast/${encodeURIComponent(episodeKey)}`}
                  state={{ fromAllList: true, episode: ep }}
                  className={`group flex items-center gap-6 p-6 flex-1 min-w-0 transition-all duration-300 hover:shadow-inner`}
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-amber-500 flex items-center justify-center text-white group-hover:bg-amber-400 transition-colors">
                    {ep.imageUrl ? (
                      <img
                        src={ep.imageUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <FaCamera className="w-8 h-8" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xl font-bold ${isLight ? "text-slate-800 group-hover:text-amber-700" : "text-white group-hover:text-amber-300"}`}
                    >
                      {ep.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-gray-400"}`}
                    >
                      {ep.subtitle} · {ep.duration}
                      {listened && (
                        <span
                          className={`inline-flex items-center gap-1 ml-2 ${isLight ? "text-amber-600" : "text-amber-400"}`}
                        >
                          <FaCheckCircle className="w-4 h-4" />
                          {t.podcastListened}
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 font-semibold text-sm ${isLight ? "text-amber-600" : "text-amber-400"}`}
                  >
                    {language === "bg"
                      ? "Слушай"
                      : language === "de"
                        ? "Anhören"
                        : "Listen"}
                  </span>
                </Link>
                {token && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const next = listened
                        ? podcastListenedIds.filter((id) => id !== episodeKey)
                        : [...podcastListenedIds, episodeKey];
                      setPodcastListenedIds(next);
                      setUserProgress(
                        "schulhub-podcast-listened",
                        { ids: next },
                        token,
                      );
                    }}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 border-l text-sm font-medium ${isLight ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700" : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"}`}
                    title={
                      listened
                        ? t.podcastMarkUnlistened
                        : t.podcastMarkListened
                    }
                  >
                    <FaCheckCircle
                      className={`w-5 h-5 shrink-0 ${listened ? (isLight ? "text-amber-600" : "text-amber-400") : "opacity-40"}`}
                    />
                    <span className="hidden sm:inline">
                      {listened
                        ? t.podcastMarkUnlistened
                        : t.podcastMarkListened}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {episodesToShow.length > pageSize && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              {language === "bg"
                ? `Показани ${Math.min(episodesToShow.length, (currentPage - 1) * pageSize + 1)}–${Math.min(
                    currentPage * pageSize,
                    episodesToShow.length,
                  )} от ${episodesToShow.length}`
                : language === "de"
                  ? `Angezeigt ${Math.min(episodesToShow.length, (currentPage - 1) * pageSize + 1)}–${Math.min(
                      currentPage * pageSize,
                      episodesToShow.length,
                    )} von ${episodesToShow.length}`
                  : `Showing ${Math.min(episodesToShow.length, (currentPage - 1) * pageSize + 1)}–${Math.min(
                      currentPage * pageSize,
                      episodesToShow.length,
                    )} of ${episodesToShow.length}`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded-md border text-xs font-medium ${
                  currentPage <= 1
                    ? "opacity-40 cursor-default"
                    : isLight
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "border-slate-600 text-slate-100 hover:bg-slate-800"
                }`}
              >
                {language === "bg"
                  ? "Първа"
                  : language === "de"
                    ? "Erste"
                    : "First"}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded-md border text-xs font-medium ${
                  currentPage <= 1
                    ? "opacity-40 cursor-default"
                    : isLight
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "border-slate-600 text-slate-100 hover:bg-slate-800"
                }`}
              >
                {language === "bg"
                  ? "Назад"
                  : language === "de"
                    ? "Zurück"
                    : "Prev"}
              </button>
              <span className="text-xs tabular-nums">
                {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded-md border text-xs font-medium ${
                  currentPage >= totalPages
                    ? "opacity-40 cursor-default"
                    : isLight
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "border-slate-600 text-slate-100 hover:bg-slate-800"
                }`}
              >
                {language === "bg"
                  ? "Напред"
                  : language === "de"
                    ? "Weiter"
                    : "Next"}
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded-md border text-xs font-medium ${
                  currentPage >= totalPages
                    ? "opacity-40 cursor-default"
                    : isLight
                      ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                      : "border-slate-600 text-slate-100 hover:bg-slate-800"
                }`}
              >
                {language === "bg"
                  ? "Последна"
                  : language === "de"
                    ? "Letzte"
                    : "Last"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GermanFotoPodcastAllView;
