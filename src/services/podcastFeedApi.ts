/**
 * Fetches and parses the Easy German podcast RSS feed.
 * GET request to the feed URL; returns channel info and list of episodes.
 */

import type { GermanPodcastItem } from "../data/german-podcasts";

export interface PodcastChannelInfo {
  title: string;
  link: string;
  description: string;
  imageUrl: string;
}

const EASY_GERMAN_FEED_URL = "https://proxyfeed.svmaudio.com/feeds/easygerman/feed.xml";

function parseDuration(itunesDuration: string | null): string {
  if (!itunesDuration || !itunesDuration.trim()) return "";
  const s = itunesDuration.trim();
  const parts = s.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return s;
  if (parts.length === 1) return `${parts[0]} min`;
  if (parts.length === 2) return `${parts[0]}:${String(parts[1]).padStart(2, "0")} min`;
  const [h, m, sec] = parts;
  if (h > 0) return `${h} h ${m} min`;
  return `${m}:${String(sec).padStart(2, "0")} min`;
}

function getText(el: Element | null): string {
  if (!el) return "";
  const first = el.childNodes[0];
  return (first && first.nodeType === Node.TEXT_NODE ? first.textContent : el.textContent)?.trim() ?? "";
}

function getEnclosureUrl(item: Element): string {
  const enc = item.getElementsByTagName("enclosure")[0];
  if (!enc) return "";
  const url = enc.getAttribute("url");
  return url ?? "";
}

function getDuration(item: Element): string {
  const byLocal = item.getElementsByTagName("duration")[0];
  if (byLocal) return parseDuration(getText(byLocal));
  const itunes = item.getElementsByTagName("itunes:duration")[0];
  if (itunes) return parseDuration(getText(itunes));
  return "";
}

function getImageUrl(item: Element): string {
  const itunesImage = item.getElementsByTagName("itunes:image")[0];
  if (itunesImage) {
    const href = itunesImage.getAttribute("href");
    if (href) return href;
  }
  return "";
}

function getDescription(item: Element): string {
  const desc = item.getElementsByTagName("description")[0];
  if (desc) {
    const text = getText(desc);
    if (text) return text;
  }
  const summary = item.getElementsByTagName("itunes:summary")[0];
  if (summary) {
    const text = getText(summary);
    if (text) return text;
  }
  return "";
}

/** Find any Spotify URL in the item (link, guid, or any attribute/text). */
function getSpotifyUrl(item: Element, guid: string, linkFromFirst: string): string {
  const spotifyRegex = /https?:\/\/[^\s"']*open\.spotify\.com\/episode\/[^\s"')]+/i;
  const match = (s: string) => {
    const m = s.match(spotifyRegex);
    return m ? m[0] : "";
  };
  if (guid && (guid.includes("spotify.com") || guid.startsWith("http"))) {
    const u = match(guid);
    if (u) return u;
  }
  const linkEls = item.getElementsByTagName("link");
  for (let j = 0; j < linkEls.length; j++) {
    const href = getText(linkEls[j]) || linkEls[j].getAttribute("href") || "";
    if (href.includes("spotify.com")) return href.trim();
  }
  if (linkFromFirst && linkFromFirst.includes("spotify.com")) return linkFromFirst;
  const all = item.innerHTML || "";
  const fromHtml = match(all);
  if (fromHtml) return fromHtml;
  return "";
}

function getChannelInfo(channel: Element): PodcastChannelInfo {
  const titleEl = channel.getElementsByTagName("title")[0];
  const linkEl = channel.getElementsByTagName("link")[0];
  const descEl = channel.getElementsByTagName("description")[0];
  const summaryEl = channel.getElementsByTagName("itunes:summary")[0];
  const imageEl = channel.getElementsByTagName("image")[0];
  const itunesImageEl = channel.getElementsByTagName("itunes:image")[0];

  let description = "";
  if (descEl) description = getText(descEl);
  if (!description && summaryEl) description = getText(summaryEl);

  let imageUrl = "";
  if (itunesImageEl) imageUrl = itunesImageEl.getAttribute("href") ?? "";
  if (!imageUrl && imageEl) {
    const urlEl = imageEl.getElementsByTagName("url")[0];
    if (urlEl) imageUrl = (getText(urlEl) || urlEl.getAttribute("href")) ?? "";
  }

  return {
    title: titleEl ? getText(titleEl) : "Easy German Podcast",
    link: linkEl ? getText(linkEl) : "https://www.easygerman.fm",
    description: description || "",
    imageUrl: imageUrl || "",
  };
}

export interface PodcastFeedResult {
  channel: PodcastChannelInfo;
  items: GermanPodcastItem[];
}

/**
 * Fetches the RSS feed via GET and parses channel + items.
 */
export async function fetchPodcastFeed(): Promise<PodcastFeedResult> {
  const res = await fetch(EASY_GERMAN_FEED_URL, {
    method: "GET",
    headers: { Accept: "application/xml, text/xml, */*" },
  });

  if (!res.ok) {
    throw new Error(`Feed request failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const channelEl = doc.querySelector("channel");
  if (!channelEl) {
    throw new Error("Invalid feed: no channel");
  }

  const channel = getChannelInfo(channelEl);
  const items = channelEl.getElementsByTagName("item");
  const result: GermanPodcastItem[] = [];
  const subtitle = "Easy German";

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Element;
    const titleEl = item.getElementsByTagName("title")[0];
    const linkEls = item.getElementsByTagName("link");
    const pubDateEl = item.getElementsByTagName("pubDate")[0];
    const guidEl = item.getElementsByTagName("guid")[0];

    const title = getText(titleEl);
    const pubDate = getText(pubDateEl);
    const guid = getText(guidEl);
    const audioUrl = getEnclosureUrl(item);
    const duration = getDuration(item);
    const imageUrl = getImageUrl(item);
    const description = getDescription(item);

    let link: string | undefined;
    let firstLink = "";
    for (let j = 0; j < linkEls.length; j++) {
      const href = (getText(linkEls[j]) || linkEls[j].getAttribute("href") || "").trim();
      if (!href) continue;
      if (firstLink === "") firstLink = href;
      if (!href.includes("spotify.com") && link === undefined) link = href;
    }
    if (link === undefined && firstLink && !firstLink.includes("spotify.com")) link = firstLink;

    const spotifyUrl = getSpotifyUrl(item, guid, firstLink);

    if (!title) continue;

    const id = guid || `feed-${i}`;

    result.push({
      id,
      title,
      subtitle,
      duration: duration || "—",
      spotifyEpisodeId: undefined,
      spotifyUrl: spotifyUrl || undefined,
      audioUrl: audioUrl || undefined,
      pubDate: pubDate || undefined,
      link: link || undefined,
      imageUrl: imageUrl || undefined,
      description: description || undefined,
    });
  }

  return { channel, items: result };
}
