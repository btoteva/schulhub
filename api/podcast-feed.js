/**
 * Fetches Easy German podcast RSS and returns episode titles + direct audio URLs.
 * Used so the podcast page can play via our HTML5 player (with volume control).
 */
const EASY_GERMAN_RSS = "https://easygerman.libsyn.com/rss";

function parseRssItems(xmlText) {
  const episodes = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const titleRegex = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/title>/i;
  const enclosureRegex = /<enclosure[^>]+url=["']([^"']+)["'][^>]*>/i;
  let m;
  while ((m = itemRegex.exec(xmlText)) !== null) {
    const block = m[1];
    const titleMatch = block.match(titleRegex);
    const enclosureMatch = block.match(enclosureRegex);
    const title = titleMatch
      ? (titleMatch[1] || titleMatch[2] || "").trim()
      : "";
    const audioUrl = enclosureMatch ? enclosureMatch[1].trim() : "";
    if (title && audioUrl) episodes.push({ title, audioUrl });
  }
  return episodes;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const r = await fetch(EASY_GERMAN_RSS, { headers: { "User-Agent": "SchulHub/1.0" } });
    if (!r.ok) throw new Error(`RSS fetch ${r.status}`);
    const xml = await r.text();
    const episodes = parseRssItems(xml);
    return res.status(200).json({ episodes });
  } catch (e) {
    console.error("podcast-feed:", e.message);
    return res.status(502).json({ error: "Feed unavailable", episodes: [] });
  }
};
