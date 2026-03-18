import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaSyncAlt, FaPlay, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";

interface EnglishPodcastEpisode {
  id: string;
  title: string;
  link: string | null;
  audioUrl: string;
  pubDate: string | null;
  duration?: string | null;
  description?: string | null;
}

const EnglishPodcastAllView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { language, t } = useLanguage();
  const { token } = useAuth();

  const [episodes, setEpisodes] = useState<EnglishPodcastEpisode[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [podcastListenedIds, setPodcastListenedIds] = useState<string[]>([]);

  const pageSize = 10;
  const [page, setPage] = useState(1);

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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://feeds.fireside.fm/easyenglish/rss", {
        method: "GET",
        headers: { Accept: "application/xml, text/xml, */*" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const xml = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");
      const channelEl = doc.querySelector("channel");
      if (!channelEl) {
        throw new Error("Invalid Easy English feed");
      }
      const items = Array.from(channelEl.getElementsByTagName("item"));
      const parsed: EnglishPodcastEpisode[] = items.map((item, index) => {
        const getText = (tag: string) => {
          const el = item.getElementsByTagName(tag)[0];
          return el && el.textContent ? el.textContent.trim() : "";
        };
        const getAttr = (tag: string, attr: string) => {
          const el = item.getElementsByTagName(tag)[0];
          return el ? (el.getAttribute(attr) ?? "") : "";
        };
        const title = getText("title") || `Episode ${index + 1}`;
        const link = getText("link") || "";
        const pubDate = getText("pubDate") || "";
        const audioUrl = getAttr("enclosure", "url") || "";
        const duration =
          getText("itunes:duration") || getText("duration") || "";
        const description =
          getText("description") ||
          getText("content:encoded") ||
          getText("itunes:summary") ||
          "";
        return {
          id: link || audioUrl || `easyenglish-${index}`,
          title,
          link: link || null,
          audioUrl,
          pubDate: pubDate || null,
          duration: duration || null,
          description: description || null,
        };
      });
      setEpisodes(parsed);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load Easy English RSS",
      );
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const episodesToShow = useMemo(() => {
    const filterText = search.trim().toLowerCase();
    if (!filterText) return episodes;
    return episodes.filter((ep) => ep.title.toLowerCase().includes(filterText));
  }, [episodes, search]);

  const totalPages = Math.max(1, Math.ceil(episodesToShow.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return episodesToShow.slice(start, start + pageSize);
  }, [episodesToShow, currentPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const titleText =
    language === "bg"
      ? "Easy English Podcast – всички епизоди"
      : language === "de"
        ? "Easy English Podcast – alle Episoden"
        : "Easy English Podcast – all episodes";

  const descriptionText =
    language === "bg"
      ? "Тук виждаш епизоди от Easy English – подкаст за учене на английски с ежедневни разговори."
      : language === "de"
        ? "Hier findest du Episoden von Easy English – ein Podcast zum Englischlernen mit Alltagsgesprächen."
        : "Here you can browse episodes of Easy English – a podcast for learning English with everyday conversations.";

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
            to="/english"
            className={`inline-flex items-center gap-2 transition-colors ${
              isLight
                ? "text-slate-600 hover:text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1
            className={`text-3xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}
          >
            {titleText}
          </h1>
          <p className={isLight ? "text-slate-600" : "text-slate-300"}>
            {descriptionText}
          </p>
        </div>

        {loading && (
          <p
            className={`mb-4 flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}
          >
            <FaSyncAlt className="animate-spin" />
            {language === "bg"
              ? "Зареждане на списъка от RSS..."
              : language === "de"
                ? "RSS-Feed wird geladen..."
                : "Loading RSS feed..."}
          </p>
        )}
        {error && (
          <div
            className={`mb-4 flex flex-wrap items-center gap-2 ${isLight ? "text-amber-700" : "text-amber-300"}`}
          >
            <span>
              {language === "bg"
                ? "Feed не е наличен."
                : language === "de"
                  ? "Feed nicht verfügbar."
                  : "Feed unavailable."}{" "}
              ({error})
            </span>
            <button
              type="button"
              onClick={load}
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
            } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
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

        {episodesToShow.length > pageSize && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
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

        <div className="space-y-3 mt-4">
          {pagedEpisodes.map((ep) => (
            <div
              key={ep.id}
              className={`rounded-xl shadow-lg border overflow-hidden flex items-stretch ${
                isLight
                  ? "bg-white border-slate-200 hover:border-blue-400/60"
                  : "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/40"
              }`}
            >
              <Link
                to="/english/podcast"
                state={{ episode: ep }}
                className="group flex items-center gap-6 p-4 sm:p-6 flex-1 min-w-0 transition-all duration-300 hover:shadow-inner"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-500 transition-colors">
                  <FaPlay className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-xl font-bold mb-1 group-hover:text-blue-600 ${
                      isLight ? "text-slate-800" : "text-white"
                    }`}
                  >
                    {ep.title}
                  </h3>
                  {ep.pubDate && (
                    <p
                      className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {ep.pubDate}
                    </p>
                  )}
                  {ep.link && (
                    <p
                      className={`text-[11px] mt-0.5 ${isLight ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {ep.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </p>
                  )}
                  {token && podcastListenedIds.includes(ep.id) && (
                    <p
                      className={`mt-1 text-xs inline-flex items-center gap-1 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
                    >
                      <FaCheckCircle className="w-4 h-4" />
                      {t.podcastListened}
                    </p>
                  )}
                </div>
              </Link>
              {token && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const listened = podcastListenedIds.includes(ep.id);
                    const next = listened
                      ? podcastListenedIds.filter((id) => id !== ep.id)
                      : [...podcastListenedIds, ep.id];
                    setPodcastListenedIds(next);
                    setUserProgress(
                      "schulhub-podcast-listened",
                      { ids: next },
                      token,
                    );
                  }}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 border-l text-sm font-medium ${
                    isLight
                      ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
                      : "border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                  }`}
                  title={
                    podcastListenedIds.includes(ep.id)
                      ? t.podcastMarkUnlistened
                      : t.podcastMarkListened
                  }
                >
                  <FaCheckCircle
                    className={`w-5 h-5 shrink-0 ${
                      podcastListenedIds.includes(ep.id)
                        ? isLight
                          ? "text-emerald-600"
                          : "text-emerald-400"
                        : "opacity-40"
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {podcastListenedIds.includes(ep.id)
                      ? t.podcastMarkUnlistened
                      : t.podcastMarkListened}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EnglishPodcastAllView;
