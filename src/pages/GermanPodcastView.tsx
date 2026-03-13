import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaSpotify } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useAudioVolume } from "../contexts/AudioVolumeContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import ControlledAudio from "../components/ControlledAudio";
import { germanPodcasts, type GermanPodcastItem } from "../data/german-podcasts";
import { usePodcastFeed } from "../hooks/usePodcastFeed";
import { getUserProgress, setUserProgress } from "../utils/userProgressApi";

const GermanPodcastView: React.FC = () => {
  const { episodeId } = useParams<{ episodeId?: string }>();
  const { theme } = useTheme();
  const { token } = useAuth();
  const isLight = theme === "light";
  const { t, language } = useLanguage();
  const { volume, setVolume } = useAudioVolume();
  const location = useLocation();
  const { items: feedItems, channel } = usePodcastFeed();
  const fromState = (location.state as { fromSection?: string; fromAllList?: boolean; episode?: GermanPodcastItem } | undefined) || undefined;

  const volumeLabel =
    language === "bg" ? "Сила на звука" : language === "de" ? "Lautstärke" : "Volume";

  const episode: GermanPodcastItem =
    fromState?.episode ??
    germanPodcasts.find((p) => p.spotifyEpisodeId === episodeId || p.id === episodeId) ??
    (episodeId ? feedItems.find((p) => p.spotifyEpisodeId === episodeId || p.id === episodeId) : undefined) ??
    germanPodcasts[0];
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

  const episodeKey = episode.spotifyEpisodeId ?? episode.id;
  const listened = token && podcastListenedIds.includes(episodeKey);

  const title = episode.title;
  const description =
    episode.description ||
    (language === "bg"
      ? "В тази епизод Лиза и Мануел говорят за пътуване за по-дълго време: Какви гаджети наистина са нужни? Как да спестите пари по пътя? Easy German – 31 мин."
      : language === "de"
        ? "In dieser Episode sprechen Lisa und Manuel über das Reisen für längere Zeit: Welche Gadgets braucht man wirklich? Wie spart man unterwegs Geld? Easy German – 31 min."
        : "In this episode Lisa and Manuel talk about long-term travel: Which gadgets do you really need? How to save money on the road? Easy German – 31 min.");
  const spotifyHref =
    episode.spotifyUrl ??
    (episode.spotifyEpisodeId ? `https://open.spotify.com/episode/${episode.spotifyEpisodeId}` : undefined);

  return (
    <div className={isLight ? "min-h-screen bg-slate-50 text-slate-900" : "min-h-screen bg-slate-900 text-slate-100"}>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            to={
              fromState?.fromAllList || fromState?.fromSection === "podcast"
                ? "/german/podcasts/all"
                : "/lessons/1"
            }
            className={`inline-flex items-center gap-2 transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"}`}
          >
            <FaArrowLeft />
            <span>{t.back}</span>
          </Link>
        </div>

        {/* Title banner with optional image (episode or channel fallback) */}
        <div className="rounded-xl overflow-hidden shadow-xl mb-8">
          <div className="bg-[#0d2818] py-8 px-6 flex flex-col sm:flex-row items-center gap-6 min-h-[140px]">
            {(episode.imageUrl || channel?.imageUrl) && (
              <img
                src={episode.imageUrl || channel?.imageUrl}
                alt=""
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                {title}
              </h1>
              {episode.subtitle && (
                <p className="text-white/80 text-sm mt-1">{episode.subtitle}</p>
              )}
              {episode.duration && (
                <p className="text-white/70 text-xs mt-0.5">{episode.duration}</p>
              )}
            </div>
          </div>
        </div>

        {episode.audioUrl ? (
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
        ) : (
          !spotifyHref && (
            <p className={`text-sm mb-4 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              {language === "bg"
                ? "Вграденият плеър няма регулатор за звук. За да намалите силата на звука, използвайте тонколоните на устройството или отворете епизода в Spotify (бутон по-долу)."
                : language === "de"
                  ? "Der eingebettete Player hat keine Lautstärkeregelung. Stellen Sie die Lautstärke am Gerät ein oder öffnen Sie die Episode in Spotify (Button unten)."
                  : "The embedded player has no volume control. Use your device volume or open the episode in Spotify (button below)."}
            </p>
          )
        )}

        {/* Spotify embed – only when we have episode id */}
        {episode.spotifyEpisodeId && (
          <div className="rounded-xl overflow-hidden shadow-xl bg-[#1a1a1a] p-4 sm:p-6 mb-6">
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
        )}

        {spotifyHref && (
          <p className={`text-sm mb-2 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
            {language === "bg" ? "Или пусни в Spotify:" : language === "de" ? "Oder in Spotify abspielen:" : "Or play in Spotify:"}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {spotifyHref && (
            <a
              href={spotifyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-green-600 hover:bg-green-500 text-white transition-all"
            >
              <FaSpotify className="w-5 h-5" />
              {language === "bg" ? "Отвори в Spotify" : language === "de" ? "In Spotify öffnen" : "Open in Spotify"}
            </a>
          )}
          {episode.link && (
            <a
              href={episode.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all border ${isLight ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800" : "border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-100"}`}
            >
              {language === "bg" ? "Отвори връзка" : language === "de" ? "Link öffnen" : "Open link"}
            </a>
          )}
          {token && (
          <button
            type="button"
            onClick={() => {
              const next = listened
                ? podcastListenedIds.filter((id) => id !== episodeKey)
                : [...podcastListenedIds, episodeKey];
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

        {/* Description below buttons */}
        {episode.description ? (
          <div
            className={`podcast-description text-base ${isLight ? "text-slate-700" : "text-slate-300"} [&_a]:text-emerald-600 [&_a]:underline [&_a:hover]:text-emerald-500 [&_p]:mb-2 [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:mb-1`}
            dangerouslySetInnerHTML={{ __html: episode.description }}
          />
        ) : (
          <p className={`text-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>{description}</p>
        )}
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default GermanPodcastView;
