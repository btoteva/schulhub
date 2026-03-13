import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaSpotify } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAudioVolume } from "../contexts/AudioVolumeContext";
import ControlledAudio from "../components/ControlledAudio";
import { germanPodcasts, GermanPodcastItem } from "../data/german-podcasts";

const GermanPodcastAllView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { t, language } = useLanguage();
  const { volume, setVolume } = useAudioVolume();

  const [search, setSearch] = useState<string>("");

  const volumeLabel =
    language === "bg" ? "Сила на звука" : language === "de" ? "Lautstärke" : "Volume";

  const filterText = search.trim().toLowerCase();
  const filteredEpisodes: GermanPodcastItem[] = germanPodcasts.filter((ep) => {
    if (!filterText) return true;
    const haystack = ep.title.toLowerCase();
    return haystack.includes(filterText);
  });

  return (
    <div className={isLight ? "min-h-screen bg-slate-50 text-slate-900" : "min-h-screen bg-slate-900 text-slate-100"}>
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            to="/lessons/1/section/podcast"
            className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            {language === "bg"
              ? "Easy German Podcast – всички епизоди"
              : language === "de"
              ? "Easy German Podcast – alle Episoden"
              : "Easy German Podcast – all episodes"}
          </h1>
          <p className={isLight ? "text-slate-600" : "text-slate-300"}>
            {language === "bg"
              ? "Тук виждаш подбрани епизоди от подкаста Easy German. Можеш да слушаш с нашия плеър със собствен контрол на звука или да отвориш епизода в Spotify."
              : language === "de"
              ? "Hier siehst du ausgewählte Episoden des Easy German Podcasts. Du kannst mit unserem Player mit eigener Lautstärkeregelung hören oder die Episode in Spotify öffnen."
              : "Here you can browse selected episodes of the Easy German podcast. Listen with our player (with shared volume control) or open the episode in Spotify."}
          </p>
        </div>

        {/* Tabs / chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/lessons/1/section/podcast"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
              isLight
                ? "border-green-500/70 text-green-700 bg-green-50 hover:bg-green-100"
                : "border-green-400/70 text-green-200 bg-green-900/40 hover:bg-green-800/60"
            }`}
          >
            <FaSpotify className="w-4 h-4" />
            {language === "bg"
              ? "Подбрани епизоди (курс)"
              : language === "de"
              ? "Ausgewählte Episoden (Kurs)"
              : "Selected episodes (course)"}
          </Link>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
              isLight
                ? "border-emerald-500 text-emerald-800 bg-emerald-50"
                : "border-emerald-400 text-emerald-100 bg-emerald-900/60"
            }`}
          >
            {language === "bg"
              ? "Подбрани епизоди"
              : language === "de"
              ? "Ausgewählte Episoden"
              : "Selected episodes"}
          </span>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                language === "bg"
                  ? "Търси по заглавие..."
                  : language === "de"
                  ? "Nach Titel suchen..."
                  : "Search by title..."
              }
              className={`w-full rounded-lg px-3 py-2 text-sm border ${
                isLight
                  ? "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                  : "border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500"
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-medium" htmlFor="all-podcast-volume">
              {volumeLabel}
            </label>
            <input
              id="all-podcast-volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-600 accent-emerald-600 w-32"
            />
            <span className="text-xs tabular-nums w-10 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {filteredEpisodes.length === 0 && (
          <p className={isLight ? "text-slate-600" : "text-slate-300"}>
            {language === "bg"
              ? "Няма епизоди за показване."
              : language === "de"
              ? "Keine Episoden zum Anzeigen."
              : "No episodes to display."}
          </p>
        )}

        <div className="space-y-4 mt-4">
          {filteredEpisodes.map((ep) => (
            <div
              key={ep.id}
              className={`rounded-xl shadow-lg border overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700"}`}
            >
              <div className="p-4 sm:p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className={`text-lg font-semibold mb-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                      {ep.title}
                    </h2>
                    {ep.pubDate && (
                      <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        {formatDate(ep.pubDate)}
                      </p>
                    )}
                  </div>
                  {ep.link && (
                    <a
                      href={ep.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                        isLight
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-green-900/60 text-green-100 hover:bg-green-800/80"
                      }`}
                    >
                      <FaSpotify className="w-3 h-3" />
                      {language === "bg"
                        ? "Отвори в Spotify"
                        : language === "de"
                        ? "In Spotify öffnen"
                        : "Open in Spotify"}
                    </a>
                  )}
                </div>

                <ControlledAudio
                  src={ep.audioUrl}
                  className="w-full mt-1"
                  controlsList="nodownload"
                >
                  {language === "bg"
                    ? "Браузърът ви не поддържа аудио."
                    : language === "de"
                    ? "Ihr Browser unterstützt kein Audio."
                    : "Your browser does not support audio."}
                </ControlledAudio>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default GermanPodcastAllView;

