import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useAudioVolume } from "../contexts/AudioVolumeContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ControlledAudio from "../components/ControlledAudio";
import { germanPodcasts } from "../data/german-podcasts";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";

const GermanPodcastView: React.FC = () => {
  const { episodeId } = useParams<{ episodeId?: string }>();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const { t, language } = useLanguage();
  const { volume, setVolume } = useAudioVolume();
  const location = useLocation();
  const fromState = (location.state as { fromSection?: string } | undefined) || undefined;

  const volumeLabel =
    language === "bg" ? "Сила на звука" : language === "de" ? "Lautstärke" : "Volume";

  const episode =
    germanPodcasts.find((p) => p.spotifyEpisodeId === episodeId || p.id === episodeId) ?? germanPodcasts[0];
  const [podcastListenedIds, setPodcastListenedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setPodcastListenedIds([]);
      return;
    }
    let cancelled = false;
    getUserProgress("schulhub-podcast-listened", token).then((data) => {
      if (cancelled || !data || typeof data !== "object" || Array.isArray(data)) return;
      const ids = (data as { ids?: string[] }).ids;
      setPodcastListenedIds(Array.isArray(ids) ? ids : []);
    });
    return () => { cancelled = true; };
  }, [token]);

  const listened = token && podcastListenedIds.includes(episode.spotifyEpisodeId);

  const title = episode.title;
  const description =
    language === "bg"
      ? "В тази епизод Лиза и Мануел говорят за пътуване за по-дълго време: Какви гаджети наистина са нужни? Как да спестите пари по пътя? Easy German – 31 мин."
      : language === "de"
        ? "In dieser Episode sprechen Lisa und Manuel über das Reisen für längere Zeit: Welche Gadgets braucht man wirklich? Wie spart man unterwegs Geld? Easy German – 31 min."
        : "In this episode Lisa and Manuel talk about long-term travel: Which gadgets do you really need? How to save money on the road? Easy German – 31 min.";

  return (
    <div className={isLight ? "min-h-screen bg-slate-50 text-slate-900" : "min-h-screen bg-slate-900 text-slate-100"}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={
              fromState?.fromSection === "podcast"
                ? "/lessons/1/section/podcast"
                : "/lessons/1"
            }
            className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        {/* Title banner – same look as uploaded image (dark green, white text) */}
        <div className="rounded-xl overflow-hidden shadow-xl mb-8">
          <div className="bg-[#0d2818] py-12 px-6 flex items-center justify-center min-h-[140px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center drop-shadow-md">
              {title}
            </h1>
          </div>
        </div>

        <p className={`text-lg mb-6 ${isLight ? "text-slate-600" : "text-slate-300"}`}>{description}</p>

        {episode.audioUrl ? (
          <>
            <div className={`rounded-xl overflow-hidden shadow-xl p-4 sm:p-6 mb-6 ${isLight ? "bg-slate-100 border border-slate-200" : "bg-slate-800/50 border border-slate-600"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <label className="text-sm font-medium shrink-0" htmlFor="podcast-volume">
                  {volumeLabel}
                </label>
                <input
                  id="podcast-volume"
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
            <p className={`text-sm mb-3 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              {language === "bg" ? "Или пусни в Spotify:" : language === "de" ? "Oder in Spotify abspielen:" : "Or play in Spotify:"}
            </p>
          </>
        ) : (
          <p className={`text-sm mb-3 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
            {language === "bg"
              ? "Вграденият плеър няма регулатор за звук. За да намалите силата на звука, използвайте тонколоните на устройството или отворете епизода в Spotify (бутон по-долу)."
              : language === "de"
                ? "Der eingebettete Player hat keine Lautstärkeregelung. Stellen Sie die Lautstärke am Gerät ein oder öffnen Sie die Episode in Spotify (Button unten)."
                : "The embedded player has no volume control. Use your device volume or open the episode in Spotify (button below)."}
          </p>
        )}

        {/* Spotify embed */}
        <div className="rounded-xl overflow-hidden shadow-xl bg-[#1a1a1a] p-4 sm:p-6 mb-8">
          <iframe
            title="Easy German Podcast"
            src={`https://open.spotify.com/embed/episode/${episode.spotifyEpisodeId}?utm_source=generator&theme=0`}
            width="100%"
            height="232"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={episode.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-500 text-white transition-all"
          >
            {language === "bg" ? "Отвори в Spotify" : language === "de" ? "In Spotify öffnen" : "Open in Spotify"}
          </a>
          {token && (
          <button
            type="button"
            onClick={() => {
              const next = listened
                ? podcastListenedIds.filter((id) => id !== episode.spotifyEpisodeId)
                : [...podcastListenedIds, episode.spotifyEpisodeId];
              setPodcastListenedIds(next);
              setUserProgress("schulhub-podcast-listened", { ids: next }, token);
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
            <FaCheckCircle className={listened ? "w-5 h-5" : "w-5 h-5 opacity-70"} />
            {listened ? t.podcastMarkUnlistened : t.podcastMarkListened}
          </button>
        )}
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default GermanPodcastView;
