import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { germanPodcasts } from "../data/german-podcasts";
import { isPodcastListened, togglePodcastListened } from "../utils/podcast-listened";

const GermanPodcastView: React.FC = () => {
  const { episodeId } = useParams<{ episodeId?: string }>();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const { t, language } = useLanguage();

  const episode =
    germanPodcasts.find((p) => p.spotifyEpisodeId === episodeId || p.id === episodeId) ?? germanPodcasts[0];
  const [listened, setListened] = useState(() => isPodcastListened(episode.spotifyEpisodeId));
  useEffect(() => {
    setListened(isPodcastListened(episode.spotifyEpisodeId));
  }, [episode.spotifyEpisodeId]);

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
            to="/lessons/1"
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

        {/* Spotify embed */}
        <div className="rounded-xl overflow-hidden shadow-xl bg-[#1a1a1a] p-4 sm:p-6 mb-8">
          <iframe
            title="Easy German: Mit dem Gewürzschlüsselanhänger um die Welt"
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
          <button
            type="button"
            onClick={() => setListened(togglePodcastListened(episode.spotifyEpisodeId))}
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
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default GermanPodcastView;
