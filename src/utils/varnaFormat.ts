export type VarnaStop = {
  id: number;
  name: string;
  lat: number | null;
  lon: number | null;
  distance_m?: number;
  schedule_time?: string;
  live_device?: string;
  towards?: string;
};

export type VarnaArrival = {
  device: string;
  line_id: number | null;
  line: string;
  arrive_time: string;
  arrive_in: string;
  delay: string;
  distance_left: string;
  direction: number | null;
  lat: number | null;
  lon: number | null;
  stop_id?: number | null;
  next_stop_id?: number | null;
};

export type VarnaScheduleRow = {
  line_id: number | null;
  line: string;
  times: string[];
};

export type VarnaDirection = {
  direction: number;
  origin: string;
  destination: string;
  stations: VarnaStop[];
  vehicles: VarnaArrival[];
};

export type VarnaStationPayload = {
  stop: VarnaStop;
  live: VarnaArrival[];
  schedule: VarnaScheduleRow[];
  source?: string;
  updated_at?: string;
};

export type VarnaLinePayload = {
  line_id: number;
  line: string;
  directions: VarnaDirection[];
  source?: string;
  updated_at?: string;
};

export type VarnaCopy = {
  towards: string;
  arriving: string;
  arriveIn: string;
  min: string;
  onTheWay: string;
  expected: string;
  meters: string;
};

export function splitStopName(name: string): { title: string; hint: string } {
  const raw = String(name || "").trim();
  const match = raw.match(/^(.*?)\s*\/\s*(.*?)\s*\/?\s*$/);
  if (match && match[1].trim()) {
    return { title: match[1].trim(), hint: match[2].replace(/\/+$/, "").trim() };
  }
  return { title: raw, hint: "" };
}

export function stopBaseTitle(name: string): string {
  return splitStopName(name).title.replace(/-\d+$/, "").trim();
}

export function shortPlaceName(name: string): string {
  return splitStopName(name).title.replace(/\s*\/.*$/, "").trim();
}

export function towardsFromName(name: string): string {
  const hint = splitStopName(name).hint;
  const match = hint.match(/^(за|към)\s+(.+)$/i);
  return match ? match[2].trim() : "";
}

export function stopTitleForSearch(name: string): string {
  return String(name || "").replace(/\s*\/\s*(за|към|до)\s+[^/]*\/?\s*$/i, "").trim();
}

export function publicPlaceLabel(name: string): string {
  const stripped = stopTitleForSearch(name);
  const parts = splitStopName(stripped);
  const inner = (parts.hint || "").replace(/^(за|до|към)\s+/i, "").replace(/\/+$/, "").trim();
  if (inner) return inner.replace(/-\d+$/, "").trim();
  return stopBaseTitle(parts.title);
}

export function sameStopFamily(a: string, b: string): boolean {
  const left = stopBaseTitle(a).toLocaleLowerCase("bg");
  const right = stopBaseTitle(b).toLocaleLowerCase("bg");
  return !!left && left === right;
}

export function stopHeading(name: string, towards: string | undefined, towardsWord: string) {
  const dest = String(towards || towardsFromName(name) || "").trim();
  return {
    title: dest ? stopBaseTitle(name) : splitStopName(name).title,
    direction: dest ? `${towardsWord} ${dest}` : "",
  };
}

export function stopDistanceM(a?: { lat?: number | null; lon?: number | null } | null, b?: { lat?: number | null; lon?: number | null } | null): number {
  if (a?.lat == null || a?.lon == null || b?.lat == null || b?.lon == null) return 0;
  const dlat = (Number(a.lat) - Number(b.lat)) * 111320;
  const dlon =
    (Number(a.lon) - Number(b.lon)) *
    111320 *
    Math.cos((((Number(a.lat) + Number(b.lat)) / 2) * Math.PI) / 180);
  return Math.hypot(dlat, dlon);
}

export function parseDistanceMeters(value?: string | null): number | null {
  const text = String(value || "").trim().replace(",", ".");
  if (!text || text === "-") return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(км|km|м|m)?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  const unit = (match[2] || "м").toLowerCase();
  return unit.startsWith("к") || unit.startsWith("k") ? amount * 1000 : amount;
}

function projectRatio(a: VarnaStop, b: VarnaStop, lat: number, lon: number): number | null {
  if (a.lat == null || a.lon == null || b.lat == null || b.lon == null) return null;
  const cos = Math.cos((((Number(a.lat) + Number(b.lat)) / 2) * Math.PI) / 180);
  const abx = (Number(b.lon) - Number(a.lon)) * cos;
  const aby = Number(b.lat) - Number(a.lat);
  const apx = (lon - Number(a.lon)) * cos;
  const apy = lat - Number(a.lat);
  const denom = abx * abx + aby * aby;
  if (denom < 1e-12) return null;
  return (apx * abx + apy * aby) / denom;
}

export function routeCursor(
  stations: VarnaStop[],
  vehicle: VarnaArrival | null
): { hereIdx: number; nextIdx: number; progress: number } {
  const none = { hereIdx: -1, nextIdx: -1, progress: 0 };
  if (!vehicle || !stations.length) return none;
  const hereIdx = stations.findIndex((stop) => Number(stop.id) === Number(vehicle.stop_id));
  if (hereIdx < 0) return none;
  let nextIdx =
    vehicle.next_stop_id != null
      ? stations.findIndex((stop) => Number(stop.id) === Number(vehicle.next_stop_id))
      : -1;
  if (nextIdx <= hereIdx && hereIdx < stations.length - 1) nextIdx = hereIdx + 1;
  const from = stations[hereIdx];
  const to = nextIdx > hereIdx ? stations[nextIdx] : null;
  if (!to) return { hereIdx, nextIdx: -1, progress: 0 };

  let progress: number | null = null;
  if (vehicle.lat != null && vehicle.lon != null) {
    const ratio = projectRatio(from, to, vehicle.lat, vehicle.lon);
    if (ratio != null) {
      const clamped = Math.min(1, Math.max(0, ratio));
      const lat = Number(from.lat) + (Number(to.lat) - Number(from.lat)) * clamped;
      const lon = Number(from.lon) + (Number(to.lon) - Number(from.lon)) * clamped;
      const offRoad = stopDistanceM(from.lat == null ? null : { lat, lon }, { lat: vehicle.lat, lon: vehicle.lon });
      if (offRoad < 220 && ratio > -0.2 && ratio < 1.35) progress = ratio;
    }
  }
  if (progress == null) {
    const left = parseDistanceMeters(vehicle.distance_left);
    const span = stopDistanceM(from, to);
    if (left != null && span > 40) progress = 1 - left / span;
  }
  return {
    hereIdx,
    nextIdx,
    progress: Math.min(0.98, Math.max(0, progress ?? 0)),
  };
}

export function parseClockMinutes(value?: string | null): number | null {
  const match = String(value || "").trim().match(/^([+-])?(\d+):(\d+)$/);
  if (!match) return null;
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const total = minutes + (seconds >= 30 ? 1 : 0);
  if (match[1] === "-") return -total;
  if (match[1] === "+") return total;
  return total;
}

export function minutesUntilClock(hhmm?: string | null): number | null {
  const match = String(hhmm || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    Number(match[1]),
    Number(match[2]),
    0,
    0
  );
  let mins = Math.round((target.getTime() - now.getTime()) / 60000);
  if (mins < -12 * 60) mins += 24 * 60;
  if (mins > 12 * 60) mins -= 24 * 60;
  return mins;
}

function withClock(label: string, hhmm?: string | null): string {
  const clock = String(hhmm || "").trim();
  const text = String(label || "").trim();
  if (!clock) return text;
  const mins = minutesUntilClock(clock);
  if (mins != null && mins < -1) return text;
  if (!text) return clock;
  if (text.includes(clock)) return text;
  return `${text} · ${clock}`;
}

export function formatRelativeClock(hhmm: string | undefined, pastFallback: string, copy: VarnaCopy): string {
  const mins = minutesUntilClock(hhmm);
  if (mins == null) return pastFallback || "";
  if (mins < -1) return pastFallback || "";
  if (mins <= 0) return withClock(copy.arriving, hhmm);
  return withClock(`${copy.arriveIn} ${mins} ${copy.min}`, hhmm);
}

export function formatEta(item: VarnaArrival, copy: VarnaCopy): string {
  const mins = parseClockMinutes(item?.arrive_in);
  if (mins != null) {
    if (mins <= 0) return withClock(copy.arriving, item?.arrive_time);
    return withClock(`${copy.arriveIn} ${mins} ${copy.min}`, item?.arrive_time);
  }
  return formatRelativeClock(item?.arrive_time, copy.onTheWay, copy);
}

export function formatVehicleWhen(item: VarnaArrival, copy: VarnaCopy): string {
  return formatRelativeClock(item?.arrive_time, copy.onTheWay, copy);
}

export function formatDelay(delay: string | undefined, minWord: string): string {
  const mins = parseClockMinutes(delay);
  if (mins == null || mins === 0) return "";
  const abs = Math.abs(mins);
  return `${mins > 0 ? "+" : "−"}${abs} ${minWord}`;
}

export function delayTone(delay?: string): "late" | "early" | "" {
  const mins = parseClockMinutes(delay);
  if (mins == null || mins === 0) return "";
  return mins > 0 ? "late" : "early";
}

export function formatLiveDistance(item?: { distance_left?: string } | null): string {
  if (!item?.distance_left || item.distance_left === "-") return "";
  const text = item.distance_left.replace("км.", " км").replace("м.", " м");
  if (text.trim().startsWith("-") || text.trim().startsWith("−")) return "";
  return text;
}

export function upcomingScheduleTimes(times?: string[]): string[] {
  return (times || [])
    .filter((clock) => {
      const mins = minutesUntilClock(clock);
      return mins != null && mins >= -1;
    })
    .slice(0, 8);
}

export function scheduleTimesWithoutLive(times: string[] | undefined, liveItems: VarnaArrival[]): string[] {
  const upcoming = upcomingScheduleTimes(times);
  if (!upcoming.length) return [];
  const liveMins = (liveItems || [])
    .map((item) => minutesUntilClock(item.arrive_time) ?? parseClockMinutes(item.arrive_in))
    .filter((mins): mins is number => mins != null);
  if (!liveMins.length) return upcoming;
  return upcoming.filter((clock) => {
    const mins = minutesUntilClock(clock);
    return mins == null || !liveMins.some((live) => Math.abs(live - mins) <= 2);
  });
}

export function directionTerminus(dir: VarnaDirection | undefined, stopId: number) {
  const stations = dir?.stations || [];
  const idx = stations.findIndex((item) => Number(item.id) === Number(stopId));
  if (idx < 0) return { label: "", remaining: 0 };
  const here = stations[idx].name;
  let lastPublic: VarnaStop | null = null;
  let remaining = 0;
  for (let i = idx + 1; i < stations.length; i += 1) {
    if (sameStopFamily(stations[i].name, here)) continue;
    lastPublic = stations[i];
    remaining += 1;
  }
  if (!lastPublic) return { label: "", remaining: 0 };
  const label = publicPlaceLabel(lastPublic.name);
  if (!label || sameStopFamily(label, here)) return { label: "", remaining: 0 };
  return { label, remaining };
}

export function bestTerminusOnLine(payload: VarnaLinePayload | undefined, stopId: number) {
  let best = { label: "", remaining: -1 };
  (payload?.directions || []).forEach((dir) => {
    const found = directionTerminus(dir, stopId);
    if (found.remaining > best.remaining) best = found;
  });
  return best;
}

export type StopDestination = { label: string; lineIds: number[] };

export function groupLinesByTerminus(
  stopId: number,
  entries: { lineId: number; payload: VarnaLinePayload }[]
): StopDestination[] {
  const groups = new Map<string, number[]>();
  entries.forEach(({ lineId, payload }) => {
    const label = bestTerminusOnLine(payload, stopId).label;
    if (!label) return;
    const list = groups.get(label) || [];
    if (!list.includes(lineId)) list.push(lineId);
    groups.set(label, list);
  });
  return [...groups.entries()]
    .map(([label, lineIds]) => ({ label, lineIds }))
    .sort((a, b) => a.label.localeCompare(b.label, "bg"));
}

export function stopsUntil(dir: VarnaDirection | undefined, fromStopId: number | null | undefined, toStopId: number | null | undefined): number | null {
  if (fromStopId == null || toStopId == null) return null;
  const stations = dir?.stations || [];
  const from = stations.findIndex((stop) => Number(stop.id) === Number(fromStopId));
  const to = stations.findIndex((stop) => Number(stop.id) === Number(toStopId));
  if (from < 0 || to < 0 || to < from) return null;
  return to - from;
}
