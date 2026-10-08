/**
 * Thin cached proxy over the public JSON endpoints used by varnatraffic.com.
 * Varna has no official GTFS feed; this mirrors the client in bulgarian-vector-search.
 */

const BASE_URL = "https://varnatraffic.com";
const SOURCE_NAME = "varnatraffic.com";
const USER_AGENT =
  "schulhub/varna-traffic (https://github.com/schulhub)";

const STOPS_TTL_SEC = 30 * 60;
const LINES_TTL_SEC = 60 * 60;
const NEAREST_TTL_SEC = 30;
const STATION_TTL_SEC = 10;
const LINE_TTL_SEC = 12;

const FALLBACK_LINES = [
  [1, "1"], [7, "7"], [9, "9"], [10, "10"], [12, "12"], [13, "13"],
  [14, "14"], [114, "14a"], [17, "17"], [117, "17a"], [18, "18"],
  [1018, "18a"], [20, "20"], [22, "22"], [23, "23"], [29, "29"],
  [30, "30"], [31, "31"], [131, "31a"], [32, "32"], [36, "36"],
  [37, "37"], [39, "39"], [40, "40"], [41, "41"], [46, "46"],
  [55, "55"], [60, "60"], [82, "82"], [83, "83"], [88, "88"],
  [109, "109"], [118, "118"], [1118, "118a"], [122, "122"], [148, "148"],
  [209, "209"], [219, "209b"], [409, "409"],
];

const LINE_HREF_RE = /href="[^"]*?\/Line\/Routes\/(\d+)"[^>]*>([^<]+)</gi;
const DIRECTION_HINT_RE = /\s*\/\s*(за|към|до)\s+[^/]*\/?\s*$/i;

class VarnaTrafficError extends Error {
  constructor(message) {
    super(message);
    this.name = "VarnaTrafficError";
  }
}

const cache = new Map();
let lineLabels = Object.fromEntries(FALLBACK_LINES);

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function cacheGet(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function cacheSet(key, value, ttlSec) {
  cache.set(key, { expiresAt: Date.now() + Math.max(1, ttlSec) * 1000, value });
}

function cleanText(value) {
  return String(value || "").replace(/\u00a0/g, " ").trim();
}

function lineLabel(lineId) {
  const numeric = Number(lineId);
  if (!Number.isFinite(numeric)) return cleanText(lineId);
  return lineLabels[numeric] || String(numeric);
}

async function fetchText(path, params) {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) url.searchParams.set(key, String(value));
    });
  }
  let response;
  try {
    const signal = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(12000)
      : undefined;
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json,text/html" },
      signal,
    });
  } catch (err) {
    throw new VarnaTrafficError(`Няма връзка с ${SOURCE_NAME}: ${err.message || err}`);
  }
  if (!response.ok) {
    throw new VarnaTrafficError(`VarnaTraffic върна HTTP ${response.status} за ${path}.`);
  }
  return response.text();
}

async function fetchJson(path, params) {
  const text = await fetchText(path, params);
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new VarnaTrafficError(`Невалиден JSON от ${SOURCE_NAME} (${path}).`);
  }
}

function stopSearchName(name) {
  return String(name || "").replace(DIRECTION_HINT_RE, "").trim();
}

function stopSearchRank(name, needle) {
  const title = stopSearchName(name).toLocaleLowerCase("bg");
  const n = (needle || "").toLocaleLowerCase("bg");
  const base = title.replace(/-\d+$/, "").trim();
  if (title === n || base === n) return 0;
  if (title.startsWith(n) || base.startsWith(n)) return 1;
  return 2;
}

function filterStopsByQuery(stops, needle) {
  const n = (needle || "").trim().toLocaleLowerCase("bg");
  if (!n) return stops;
  return stops
    .filter((stop) => stopSearchName(stop.name).toLocaleLowerCase("bg").includes(n))
    .sort((a, b) => stopSearchRank(a.name, n) - stopSearchRank(b.name, n));
}

function normalizeStop(raw) {
  if (!raw || typeof raw !== "object") return null;
  const stopId = Number(raw.id);
  if (!Number.isFinite(stopId)) return null;
  const position = raw.position && typeof raw.position === "object" ? raw.position : {};
  const lat = position.lat != null ? Number(position.lat) : null;
  const lon = position.lon != null ? Number(position.lon) : null;
  const stop = {
    id: stopId,
    name: cleanText(raw.text || raw.name),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
  if (raw.distance != null) {
    const distance = Number(raw.distance);
    stop.distance_m = Number.isFinite(distance) ? distance : raw.distance;
  }
  return stop;
}

function normalizeArrival(raw) {
  if (!raw || typeof raw !== "object") return null;
  const lineId = Number(raw.line);
  const position = raw.position && typeof raw.position === "object" ? raw.position : {};
  const lat = position.lat != null ? Number(position.lat) : null;
  const lon = position.lon != null ? Number(position.lon) : null;
  const direction = raw.direction == null ? null : Number(raw.direction);
  return {
    device: cleanText(raw.device),
    line_id: Number.isFinite(lineId) ? lineId : null,
    line: lineLabel(Number.isFinite(lineId) ? lineId : raw.line),
    arrive_time: cleanText(raw.arriveTime),
    arrive_in: cleanText(raw.arriveIn),
    delay: cleanText(raw.delay),
    distance_left: cleanText(raw.distanceLeft),
    direction: Number.isFinite(direction) ? direction : null,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
}

function normalizeVehicle(raw, lineId) {
  if (!raw || typeof raw !== "object") return null;
  const position = raw.position && typeof raw.position === "object" ? raw.position : {};
  const lat = position.lat != null ? Number(position.lat) : null;
  const lon = position.lon != null ? Number(position.lon) : null;
  const direction = raw.direction == null ? null : Number(raw.direction);
  return {
    device: cleanText(raw.device),
    line_id: lineId,
    line: lineLabel(lineId),
    stop_id: raw.stationId ?? null,
    next_stop_id: raw.nextStationId ?? null,
    arrive_time: cleanText(raw.arriveTime),
    delay: cleanText(raw.delay),
    distance_left: cleanText(raw.distanceLeft),
    direction: Number.isFinite(direction) ? direction : null,
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
}

function normalizeLineStation(raw) {
  const stop = normalizeStop(raw);
  if (!stop) return null;
  const timeInfo = raw.time && typeof raw.time === "object" ? raw.time : {};
  stop.schedule_time = cleanText(timeInfo.schedule);
  stop.live_device = cleanText(timeInfo.device);
  return stop;
}

function refreshLineLabels(catalog) {
  const labels = Object.fromEntries(FALLBACK_LINES);
  catalog.forEach((item) => {
    const id = Number(item.id);
    if (Number.isFinite(id) && item.name) labels[id] = String(item.name);
  });
  lineLabels = labels;
}

async function getStops(query = "") {
  const needle = String(query || "").trim();
  if (needle) {
    const cached = cacheGet(`search:${needle.toLocaleLowerCase("bg")}`);
    if (cached) return cached;
    const raw = (await fetchJson("/Ajax/FindStation", { query: needle })) || [];
    let matched = filterStopsByQuery(
      raw.map(normalizeStop).filter(Boolean),
      needle
    );
    if (!matched.length) matched = filterStopsByQuery(await getStops(), needle);
    matched = matched.slice(0, 12);
    cacheSet(`search:${needle.toLocaleLowerCase("bg")}`, matched, 60);
    return matched;
  }

  const cached = cacheGet("stops");
  if (cached) return cached;
  const raw = (await fetchJson("/Ajax/GetStations")) || [];
  const stops = raw
    .map(normalizeStop)
    .filter(Boolean)
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", "bg"));
  cacheSet("stops", stops, STOPS_TTL_SEC);
  return stops;
}

async function getNearestStops(lat, lon) {
  const cacheKey = `nearest:${Number(lat).toFixed(5)}:${Number(lon).toFixed(5)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const raw = (await fetchJson("/Ajax/FindNearestStations", { lat, lon })) || [];
  const stops = raw.map(normalizeStop).filter(Boolean);
  cacheSet(cacheKey, stops, NEAREST_TTL_SEC);
  return stops;
}

async function getLines() {
  const cached = cacheGet("lines");
  if (cached) return cached;
  const catalog = [];
  const seen = new Set();
  try {
    const html = await fetchText("/");
    for (const match of html.matchAll(LINE_HREF_RE)) {
      const lineId = Number(match[1]);
      const name = cleanText(match[2]);
      if (!name || seen.has(lineId)) continue;
      seen.add(lineId);
      catalog.push({ id: lineId, name });
    }
  } catch {
    /* fall back to the known catalog */
  }
  const lines = catalog.length
    ? catalog
    : FALLBACK_LINES.map(([id, name]) => ({ id, name }));
  refreshLineLabels(lines);
  cacheSet("lines", lines, LINES_TTL_SEC);
  return lines;
}

async function getStation(stopId, force = false) {
  const cacheKey = `station:${stopId}`;
  if (!force) {
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
  }
  await getLines();
  const raw = (await fetchJson("/Ajax/FindStationDevices", { stationId: stopId })) || {};
  const liveRaw = Array.isArray(raw.liveData) ? raw.liveData : [];
  const scheduleRaw = Array.isArray(raw.schedule) ? raw.schedule : [];
  const live = liveRaw.map(normalizeArrival).filter(Boolean);
  const schedule = scheduleRaw
    .filter((row) => row && typeof row === "object")
    .map((row) => {
      const times = [];
      const data = Array.isArray(row.data) ? row.data : [];
      data.forEach((entry) => {
        const text = entry && typeof entry === "object" ? cleanText(entry.text) : "";
        if (text) times.push(text);
      });
      return {
        line_id: row.line ?? null,
        line: lineLabel(row.line),
        times,
      };
    });
  const known = (await getStops()).find((item) => item.id === Number(stopId));
  const stop = known || { id: Number(stopId), name: `Спирка ${stopId}`, lat: null, lon: null };
  const payload = {
    stop,
    live,
    schedule,
    source: SOURCE_NAME,
    updated_at: nowIso(),
  };
  cacheSet(cacheKey, payload, STATION_TTL_SEC);
  return payload;
}

async function getLineState(lineId, direction = null, force = false) {
  await getLines();
  const directions = direction === 0 || direction === 1 ? [direction] : [0, 1];
  const cacheKey = `line:${lineId}:${directions.join(",")}`;
  if (!force) {
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
  }
  const collected = await Promise.all(
    directions.map(async (dirValue) => {
      let raw = {};
      try {
        raw = (await fetchJson("/Ajax/GetLineState", { line: lineId, direction: dirValue })) || {};
      } catch {
        raw = {};
      }
      if (!raw || typeof raw !== "object") raw = {};
      const stations = (Array.isArray(raw.stations) ? raw.stations : [])
        .map(normalizeLineStation)
        .filter(Boolean);
      const vehicles = (Array.isArray(raw.devices) ? raw.devices : [])
        .map((row) => normalizeVehicle(row, Number(lineId)))
        .filter(Boolean);
      return {
        direction: dirValue,
        origin: stations[0]?.name || "",
        destination: stations[stations.length - 1]?.name || "",
        stations,
        vehicles,
      };
    })
  );
  const payload = {
    line_id: Number(lineId),
    line: lineLabel(lineId),
    directions: collected,
    source: SOURCE_NAME,
    updated_at: nowIso(),
  };
  cacheSet(cacheKey, payload, LINE_TTL_SEC);
  return payload;
}

module.exports = {
  VarnaTrafficError,
  getStops,
  getNearestStops,
  getLines,
  getStation,
  getLineState,
};
