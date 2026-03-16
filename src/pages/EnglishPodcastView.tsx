import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useAudioVolume } from "../contexts/AudioVolumeContext";
import ControlledAudio from "../components/ControlledAudio";
import ScrollToTopButton from "../components/ScrollToTopButton";

interface EnglishPodcastEpisode {
  id: string;
  title: string;
  link: string | null;
  audioUrl: string;
  pubDate: string | null;
  duration?: string | null;
  description?: string | null;
}

interface LocationState {
  episode?: EnglishPodcastEpisode;
}

const EnglishPodcastView: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { language, t } = useLanguage();
   const { token } = useAuth();
  const { volume, setVolume } = useAudioVolume();
  const location = useLocation();
  const state = (location.state as LocationState | undefined) || {};

  const episode = state.episode;
  const [podcastListenedIds, setPodcastListenedIds] = useState<string[]>([]);

  const volumeLabel =
    language === "bg" ? "Сила на звука" : language === "de" ? "Lautstärke" : "Volume";

  useEffect(() => {
    if (!token) {
      setPodcastListenedIds([]);
      return;
    }
    let cancelled = false;
    import("../utils/userProgressApi").then(({ getUserProgress }) => {
      getUserProgress("schulhub-podcast-listened", token).then((data) => {
        if (cancelled || !data || typeof data !== "object" || Array.isArray(data)) return;
        const ids = (data as { ids?: string[] }).ids;
        setPodcastListenedIds(Array.isArray(ids) ? ids : []);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!episode) {
    return (
      <div className={isLight ? "min-h-screen bg-slate-50 text-slate-900" : "min-h-screen bg-slate-900 text-slate-100"}>
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="mb-6">
            <Link
              to="/english/podcasts/all"
              className={`inline-flex items-center gap-2 transition-colors ${
                isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
              }`}
            >
              <FaArrowLeft />
              <span>{t.back}</span>
            </Link>
          </div>
          <p className={isLight ? "text-slate-700" : "text-slate-300"}>
            {language === "bg"
              ? "Епизодът не беше намерен. Моля, върнете се към списъка."
              : language === "de"
              ? "Episode nicht gefunden. Bitte kehren Sie zur Liste zurück."
              : "Episode not found. Please go back to the list."}
          </p>
        </main>
      </div>
    );
  }

  const listened = token && podcastListenedIds.includes(episode.id);

  return (
    <div className={isLight ? "min-h-screen bg-slate-50 text-slate-900" : "min-h-screen bg-slate-900 text-slate-100"}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to="/english/podcasts/all"
            className={`inline-flex items-center gap-2 transition-colors ${
              isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
            }`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden shadow-xl mb-8">
          <div className="bg-[#10233e] py-8 px-6 flex flex-col sm:flex-row items-center gap-6 min-h-[140px]">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                {episode.title}
              </h1>
              {episode.pubDate && (
                <p className="text-white/80 text-sm mt-2">{episode.pubDate}</p>
              )}
              {episode.duration && (
                <p className="text-white/75 text-xs mt-1">{episode.duration}</p>
              )}
              {episode.link && (
                <p className="text-white/70 text-xs mt-1 truncate">
                  {episode.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </p>
              )}
            </div>
          </div>
        </div>

        {episode.audioUrl && (
          <div
            className={`rounded-xl overflow-hidden shadow-xl p-4 sm:p-6 mb-6 ${
              isLight ? "bg-slate-100 border border-slate-200" : "bg-slate-800/50 border border-slate-600"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <label className="text-sm font-medium shrink-0" htmlFor="english-podcast-volume">
                {volumeLabel}
              </label>
              <input
                id="english-podcast-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 min-w-0 h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-600 accent-emerald-600"
              />
              <span className="text-sm tabular-nums shrink-0 w-10">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <ControlledAudio
              src={episode.audioUrl}
              className="w-full"
              controlsList="nodownload"
            >
              {language === "bg"
                ? "Браузърът ви не поддържа аудио."
                : language === "de"
                ? "Ihr Browser unterstützt kein Audio."
                : "Your browser does not support audio."}
            </ControlledAudio>
          </div>
        )}

        {episode.description && (
          <div
            className={`mt-6 text-base leading-relaxed ${
              isLight ? "text-slate-700" : "text-slate-300"
            } [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2`}
            dangerouslySetInnerHTML={{ __html: episode.description }}
          />
        )}

        {token && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                import("../utils/userProgressApi").then(({ setUserProgress }) => {
                  const next = listened
                    ? podcastListenedIds.filter((id) => id !== episode.id)
                    : [...podcastListenedIds, episode.id];
                  setPodcastListenedIds(next);
                  setUserProgress("schulhub-podcast-listened", { ids: next }, token);
                });
              }}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                listened
                  ? isLight
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                  : isLight
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                  : "bg-amber-900/40 text-amber-200 hover:bg-amber-800/50 border border-amber-600/50"
              }`}
            >
              <FaArrowLeft className="hidden" />
              <span>{listened ? t.podcastMarkUnlistened : t.podcastMarkListened}</span>
            </button>
          </div>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default EnglishPodcastView;

