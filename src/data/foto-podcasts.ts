import type { GermanPodcastItem } from "./german-podcasts";

/**
 * Foto-Podcast feed source.
 *
 * "Fotografie für die Ohren – Fotografieren lernen durch zuhören"
 * by Christoph Schoder. Hosted on podigee.io.
 *
 * The feed is suitable for German learners around B1 level: short episodes,
 * clear narration, recurring photography vocabulary (Blende, Belichtungszeit,
 * Sensor, Brennweite, Objektiv, ...).
 */
export const FOTO_PODCAST_FEED_URL =
  "https://fotografie-fuer-die-ohren.podigee.io/feed/mp3";

export const FOTO_PODCAST_SUBTITLE = "Fotografie für die Ohren";

export const FOTO_PODCAST_CHANNEL_LINK = "http://www.fotoerlebnis.eu";

export const FOTO_PODCAST_CHANNEL_IMAGE =
  "https://images.podigee-cdn.net/0x,sXRNlDArAX2w1QEg2knhi96lWV7_Ln3SWqzz8fkqRlUo=/https://main.podigee-cdn.net/uploads/u1204/5c3ab7d9-45d5-46c2-89cc-178b6978fe9e.png";

/**
 * Curated fallback list (5 most recent episodes at time of writing).
 *
 * Used when the live feed cannot be fetched (e.g. CORS issue or network error).
 * IDs match the `<guid>` values from the RSS so listened-state stays consistent
 * with the live feed.
 */
export const fotoPodcasts: GermanPodcastItem[] = [
  {
    id: "ef4a52b88f7f403cf3879e5d7eac7c61",
    title: "Handy vs. SLR",
    subtitle: FOTO_PODCAST_SUBTITLE,
    duration: "10 min",
    audioUrl:
      "https://audio.podigee-cdn.net/1859971-m-afcb7369c98fdd5b8fc83db327dd510b.mp3?source=feed",
    pubDate: "Sun, 06 Apr 2025 07:12:36 +0000",
    link: "https://fotografie-fuer-die-ohren.podigee.io/27-handy-vs-slr",
    imageUrl:
      "https://images.podigee-cdn.net/0x,sP_XItvyUaT_mJnoirp7oCkAjdHmfEp8Zh1d9TwQKGyI=/https://main.podigee-cdn.net/uploads/u1204/57def6dc-fe06-416c-91cd-35fcc1f3fb07.jpg",
    description:
      "„SLR oder Smartphone? Die große Kamera-Frage!“ In dieser Folge nehmen wir zwei Welten unter die Lupe: Die klassische Spiegelreflexkamera versus das Alltagswunder Smartphone.",
  },
  {
    id: "ad5fb28041cc76ddf8c0918656a1d85f",
    title: "Raw oder JPEG?",
    subtitle: FOTO_PODCAST_SUBTITLE,
    duration: "11 min",
    audioUrl:
      "https://audio.podigee-cdn.net/1848423-m-9a0e3b853c58cfb4ac95a49a8822bc27.mp3?source=feed",
    pubDate: "Thu, 27 Mar 2025 09:02:22 +0000",
    link: "https://fotografie-fuer-die-ohren.podigee.io/26-raw-oder-jpeg",
    description:
      "RAW vs. JPEG: Warum sehen RAW-Bilder so blass aus? Warum muss man sie nachbearbeiten? Welches Format ist für dich das richtige?",
  },
  {
    id: "98d521bda89a3ffe816f239eedd6480e",
    title: "Die perfekte Kamera für dich als Anfänger",
    subtitle: FOTO_PODCAST_SUBTITLE,
    duration: "10 min",
    audioUrl:
      "https://audio.podigee-cdn.net/1794328-m-777bc2dcd7bdb638fbe23b628b302c69.mp3?source=feed",
    pubDate: "Sat, 15 Feb 2025 13:47:48 +0000",
    link: "https://fotografie-fuer-die-ohren.podigee.io/25-welche-kamera",
    description:
      "Welche Kamera passt zu mir? Spiegelreflex vs. Spiegellos, Sensorgrößen, drei goldene Regeln für die perfekte Anfänger-Kamera.",
  },
  {
    id: "29e53738ba13957b4f657bc83e0b10ce",
    title: "Linsen aus Muranoglas",
    subtitle: FOTO_PODCAST_SUBTITLE,
    duration: "5 min",
    audioUrl:
      "https://audio.podigee-cdn.net/1463275-m-c161486028cc79c10f33248a00f68099.mp3?source=feed",
    pubDate: "Thu, 09 May 2024 08:05:00 +0000",
    link: "https://fotografie-fuer-die-ohren.podigee.io/24-linsen-aus-muranoglas",
    description:
      "Die Geschichte der Glas- und Glaslinsenproduktion für optische Geräte auf Murano.",
  },
  {
    id: "9f4011b2a6d66a4308d69fb3141ee63c",
    title: "Der Aufbau eines Objektivs",
    subtitle: FOTO_PODCAST_SUBTITLE,
    duration: "3 min",
    audioUrl:
      "https://audio.podigee-cdn.net/1463240-m-0c724bb6583814e2c744b9188b7ae7b7.mp3?source=feed",
    pubDate: "Wed, 08 May 2024 19:11:57 +0000",
    link: "https://fotografie-fuer-die-ohren.podigee.io/23-aufbau-objektiv",
    description:
      "Linsen, Blenden, Kameraanschluss und mehr – wie ein Objektiv aufgebaut ist und welche Funktionen die Hauptkomponenten haben.",
  },
];
