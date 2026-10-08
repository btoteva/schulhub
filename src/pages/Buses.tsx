import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBus, FaLocationArrow } from "react-icons/fa";
import RouteSpine from "../components/RouteSpine";
import { useLanguage } from "../contexts/LanguageContext";
import {
  decorateStopDirections,
  fetchNearestStops,
  fetchVarnaLine,
  fetchVarnaLines,
  fetchVarnaStation,
  fetchVarnaStops,
  locateBus,
} from "../services/varnaApi";
import {
  VarnaArrival,
  VarnaCopy,
  VarnaLinePayload,
  VarnaScheduleRow,
  VarnaStationPayload,
  VarnaStop,
  delayTone,
  formatDelay,
  formatEta,
  formatLiveDistance,
  formatVehicleWhen,
  parseClockMinutes,
  scheduleTimesWithoutLive,
  shortPlaceName,
  stopHeading,
  stopTitleForSearch,
  stopsUntil,
} from "../utils/varnaFormat";

const RECENT_KEY = "schulhub-varna-recent";
const VARNA_CENTER = { lat: 43.2146, lon: 27.9148 };

const copy = {
  bg: {
    city: "Варна",
    title: "Автобуси",
    live: "на живо",
    stop: "Спирка",
    line: "Линия",
    stopPlaceholder: "Спирка, напр. Катедралата",
    linePlaceholder: "Номер, напр. 14",
    near: "Близо до мен",
    nearLoading: "Търся…",
    nearFallback: "Няма местоположение. Показани са спирки около центъра.",
    typeMore: "Още една буква.",
    noStops: "Няма такава спирка.",
    emptyStop: "Напиши спирка или натисни бутона за местоположение.",
    emptyLine: "Избери номер.",
    none: "В момента няма автобус до тази спирка.",
    noBuses: "Няма автобус в тази посока.",
    schedule: "Разписание",
    nextTrip: "следващ",
    towards: "към",
    arriving: "идва",
    arriveIn: "след",
    min: "мин",
    onTheWay: "в движение",
    expected: "очакван",
    meters: "м",
    here: "тук",
    next: "следва",
    yours: "твоята",
    back: "Назад",
    updated: "обновено",
    refresh: "обнови",
    loading: "Зарежда…",
    source: "данни от varnatraffic.com",
    stops: (n: number) => `${n} спирки`,
    untilYou: (n: number) => (n === 1 ? "още 1 спирка до теб" : `още ${n} спирки до теб`),
    showAll: "целият маршрут",
    showBrief: "накратко",
    recent: "Скорошни",
    geoDenied: "Местоположението е отказано. Напиши името на спирката.",
  },
  en: {
    city: "Varna",
    title: "Buses",
    live: "live",
    stop: "Stop",
    line: "Line",
    stopPlaceholder: "A stop, e.g. Cathedral",
    linePlaceholder: "Number, e.g. 14",
    near: "Near me",
    nearLoading: "Looking…",
    nearFallback: "Location is off. Showing stops around the center.",
    typeMore: "Type one more letter.",
    noStops: "No stop with that name.",
    emptyStop: "Type a stop or use the location button.",
    emptyLine: "Choose a number.",
    none: "No bus to this stop right now.",
    noBuses: "No bus in this direction.",
    schedule: "Timetable",
    nextTrip: "next",
    towards: "to",
    arriving: "due",
    arriveIn: "in",
    min: "min",
    onTheWay: "on the way",
    expected: "expected",
    meters: "m",
    here: "here",
    next: "next",
    yours: "yours",
    back: "Back",
    updated: "updated",
    refresh: "refresh",
    loading: "Loading…",
    source: "data from varnatraffic.com",
    stops: (n: number) => `${n} stops`,
    untilYou: (n: number) => (n === 1 ? "1 stop away" : `${n} stops away`),
    showAll: "full route",
    showBrief: "brief",
    recent: "Recent",
    geoDenied: "Location is blocked. Type the stop name.",
  },
  de: {
    city: "Warna",
    title: "Busse",
    live: "live",
    stop: "Haltestelle",
    line: "Linie",
    stopPlaceholder: "Haltestelle, z. B. Kathedrale",
    linePlaceholder: "Nummer, z. B. 14",
    near: "In der Nähe",
    nearLoading: "Suche…",
    nearFallback: "Kein Standort. Haltestellen um das Zentrum.",
    typeMore: "Noch ein Buchstabe.",
    noStops: "Keine passende Haltestelle.",
    emptyStop: "Haltestelle tippen oder den Standortknopf nutzen.",
    emptyLine: "Nummer wählen.",
    none: "Gerade kein Bus zu dieser Haltestelle.",
    noBuses: "Kein Bus in dieser Richtung.",
    schedule: "Fahrplan",
    nextTrip: "nächste",
    towards: "nach",
    arriving: "kommt",
    arriveIn: "in",
    min: "Min",
    onTheWay: "unterwegs",
    expected: "erwartet",
    meters: "m",
    here: "hier",
    next: "nächste",
    yours: "deine",
    back: "Zurück",
    updated: "aktualisiert",
    refresh: "aktualisieren",
    loading: "Lädt…",
    source: "Daten von varnatraffic.com",
    stops: (n: number) => `${n} Haltestellen`,
    untilYou: (n: number) => (n === 1 ? "noch 1 Haltestelle" : `noch ${n} Haltestellen`),
    showAll: "ganze Linie",
    showBrief: "kurz",
    recent: "Zuletzt",
    geoDenied: "Standort blockiert. Namen eintippen.",
  },
} as const;

type Lang = keyof typeof copy;
type OpenBus = { lineId: number; device: string };

function readRecent(): VarnaStop[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function writeRecent(stop: VarnaStop) {
  const next = [stop, ...readRecent().filter((item) => item.id !== stop.id)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next.map(({ id, name, lat, lon, towards }) => ({ id, name, lat, lon, towards }))));
  return next;
}

function busKey(lineId: number | null | undefined, device: string) {
  return `${Number(lineId)}::${device || ""}`;
}

function clockLabel(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const LineBadge: React.FC<{ line: string }> = ({ line }) => (
  <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-900 px-2 text-sm font-bold tabular-nums text-white dark:bg-white dark:text-slate-900">
    {line}
  </span>
);

const Buses: React.FC = () => {
  const { language } = useLanguage();
  const t = copy[(language as Lang) in copy ? (language as Lang) : "bg"];
  const etaCopy: VarnaCopy = t;

  const [mode, setMode] = useState<"stop" | "line">("stop");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<VarnaStop[]>([]);
  const [lines, setLines] = useState<{ id: number; name: string }[]>([]);
  const [suggestions, setSuggestions] = useState<VarnaStop[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [station, setStation] = useState<VarnaStationPayload | null>(null);
  const [lineState, setLineState] = useState<VarnaLinePayload | null>(null);
  const [lineDir, setLineDir] = useState(0);
  const [openBus, setOpenBus] = useState<OpenBus | null>(null);
  const [history, setHistory] = useState<VarnaStop[]>([]);
  const [recent, setRecent] = useState<VarnaStop[]>(() => readRecent());
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const lineCache = useRef<Record<string, VarnaLinePayload>>({});
  const searchTimer = useRef<number | null>(null);
  const requestId = useRef(0);
  const openBusRef = useRef<OpenBus | null>(null);
  openBusRef.current = openBus;

  const getLine = async (lineId: number, force = false) => {
    const key = String(lineId);
    if (!force && lineCache.current[key]) return lineCache.current[key];
    const payload = await fetchVarnaLine(lineId);
    lineCache.current[key] = payload;
    return payload;
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchVarnaStops(), fetchVarnaLines()])
      .then(([stops, lineList]) => {
        if (cancelled) return;
        setCatalog(stops);
        setLines(lineList);
      })
      .catch((err) => {
        if (!cancelled) setStatus(err.message || String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openStop = async (stopId: number, opts?: { fromHistory?: boolean; silent?: boolean }) => {
    const token = ++requestId.current;
    const prev = station?.stop;
    if (prev && prev.id !== stopId && !opts?.fromHistory) {
      setHistory((items) => [prev, ...items.filter((item) => item.id !== prev.id)].slice(0, 8));
    }
    if (!opts?.silent) {
      setLoading(true);
      setOpenBus(null);
    }
    setMode("stop");
    setNote("");
    try {
      const payload = await fetchVarnaStation(stopId);
      if (token !== requestId.current && opts?.silent) return;
      if (token !== requestId.current && !opts?.silent) return;
      setStation(payload);
      setLineState(null);
      setStatus("");
      if (!opts?.silent) {
        setSuggestions([]);
        setQuery("");
        const remembered =
          suggestions.find((item) => item.id === payload.stop.id) ||
          recent.find((item) => item.id === payload.stop.id);
        const stored = { ...payload.stop, towards: remembered?.towards || payload.stop.towards };
        setRecent(writeRecent(stored));
      }
      if (openBusRef.current) {
        try {
          await getLine(openBusRef.current.lineId, true);
        } catch {
          /* keep the last route */
        }
      }
    } catch (err) {
      if (token === requestId.current) setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      if (token === requestId.current) setLoading(false);
    }
  };

  const openLine = async (lineId: number, silent = false) => {
    const token = ++requestId.current;
    if (!silent) setLoading(true);
    setMode("line");
    setStation(null);
    setNote("");
    try {
      const payload = await getLine(lineId, true);
      if (token !== requestId.current) return;
      setLineState(payload);
      setLineDir((current) => {
        const dirs = payload.directions || [];
        if (dirs.some((dir) => dir.direction === current && (dir.stations || []).length)) return current;
        const withBus = dirs.find((dir) => (dir.vehicles || []).length);
        return (withBus || dirs[0])?.direction ?? 0;
      });
      setStatus("");
    } catch (err) {
      if (token === requestId.current) setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      if (token === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    const stopId = mode === "stop" ? station?.stop.id : null;
    const lineId = mode === "line" ? lineState?.line_id : null;
    if (stopId == null && lineId == null) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (stopId != null) openStop(stopId, { silent: true, fromHistory: true });
      else if (lineId != null) openLine(lineId, true);
    }, 12000);
    return () => window.clearInterval(timer);
    // loaders close over the latest open bus via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, station?.stop.id, lineState?.line_id]);

  const runSearch = async (value: string) => {
    const needle = value.trim().toLocaleLowerCase("bg");
    if (needle.length < 2) {
      setSuggestions([]);
      setStatus(value.trim() ? t.typeMore : "");
      return;
    }
    const local = catalog
      .filter((stop) => stopTitleForSearch(stop.name).toLocaleLowerCase("bg").includes(needle))
      .slice(0, 12);
    if (local.length) setSuggestions(local.map((stop) => ({ ...stop })));
    try {
      const found = await fetchVarnaStops(value.trim());
      const list = (found.length ? found : local).slice(0, 12).map((stop) => ({ ...stop }));
      if (!list.length) {
        setSuggestions([]);
        setStatus(t.noStops);
        return;
      }
      setStatus("");
      setHighlight(0);
      setSuggestions(list);
      const decorated = await decorateStopDirections(list.map((stop) => ({ ...stop })), (id) => getLine(id));
      setSuggestions(decorated);
    } catch (err) {
      if (!local.length) setStatus(err instanceof Error ? err.message : String(err));
    }
  };

  const onQuery = (value: string) => {
    setQuery(value);
    setHighlight(0);
    if (mode === "stop" && station && value.trim()) {
      setStation(null);
      setOpenBus(null);
    }
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (mode !== "stop") return;
    searchTimer.current = window.setTimeout(() => runSearch(value), 180);
  };

  const locate = () => {
    setMode("stop");
    setLocating(true);
    setStation(null);
    setOpenBus(null);
    setNote("");
    const finish = () => setLocating(false);
    const loadAt = async (lat: number, lon: number) => {
      const stops = (await fetchNearestStops(lat, lon)).slice(0, 6).map((stop) => ({ ...stop }));
      setSuggestions(stops);
      setQuery("");
      if (stops[0]) await openStop(stops[0].id);
      decorateStopDirections(stops.map((stop) => ({ ...stop })), (id) => getLine(id)).then(setSuggestions).catch(() => undefined);
    };
    const fallback = async (message: string) => {
      try {
        await loadAt(VARNA_CENTER.lat, VARNA_CENTER.lon);
        setNote(message);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : String(err));
      } finally {
        finish();
      }
    };
    if (!navigator.geolocation) {
      fallback(t.nearFallback);
      return;
    }
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      fallback(t.nearFallback);
    }, 7000);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        try {
          await loadAt(pos.coords.latitude, pos.coords.longitude);
        } catch (err) {
          setStatus(err instanceof Error ? err.message : String(err));
        } finally {
          finish();
        }
      },
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        fallback(t.geoDenied);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  const toggleBus = async (lineId: number | null, device: string) => {
    if (lineId == null || !Number.isFinite(Number(lineId))) return;
    const numericLine = Number(lineId);
    if (openBus && openBus.lineId === numericLine && openBus.device === device) {
      setOpenBus(null);
      return;
    }
    setLoading(true);
    try {
      await getLine(numericLine, true);
      setOpenBus({ lineId: numericLine, device });
      setStatus("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const live = useMemo(() => {
    return [...(station?.live || [])].sort((a, b) => {
      const am = parseClockMinutes(a.arrive_in);
      const bm = parseClockMinutes(b.arrive_in);
      if (am == null && bm == null) return 0;
      if (am == null) return 1;
      if (bm == null) return -1;
      return am - bm;
    });
  }, [station]);

  const scheduleRows = useMemo(() => {
    return [...(station?.schedule || [])]
      .sort((a, b) => Number(a.line_id) - Number(b.line_id))
      .map((row) => ({
        row,
        times: scheduleTimesWithoutLive(
          row.times,
          live.filter((item) => Number(item.line_id) === Number(row.line_id))
        ),
      }))
      .filter((item) => item.times.length);
  }, [station, live]);

  const currentDir = lineState?.directions.find((dir) => dir.direction === lineDir) || lineState?.directions[0];

  const filteredLines = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("bg");
    return [...lines]
      .filter((line) => !needle || line.name.toLocaleLowerCase("bg").includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name, "bg", { numeric: true }));
  }, [lines, query]);

  const chosen = station
    ? stopHeading(station.stop.name, suggestions.find((item) => item.id === station.stop.id)?.towards || recent.find((item) => item.id === station.stop.id)?.towards, t.towards)
    : null;
  const backStop = history.find((item) => item.id !== station?.stop.id);

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode !== "stop" || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((index) => Math.min(suggestions.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const pick = suggestions[highlight] || suggestions[0];
      if (pick) openStop(pick.id);
    }
  };

  const spineLabels = {
    here: t.here,
    next: t.next,
    yours: t.yours,
    stops: t.stops,
    showAll: t.showAll,
    showBrief: t.showBrief,
  };

  const renderRoute = (lineId: number | null, device: string, stopId: number | null) => {
    if (!openBus || lineId == null || busKey(openBus.lineId, openBus.device) !== busKey(lineId, device)) return null;
    const payload = lineCache.current[String(lineId)];
    const located = locateBus(payload, null, device, stopId);
    if (!located.dir) return null;
    const away = stopsUntil(located.dir, located.vehicle?.stop_id, stopId);
    return (
      <div>
        {away != null && away > 0 && (
          <p className="px-1 pt-1 text-xs font-medium text-teal-700 dark:text-teal-300">{t.untilYou(away)}</p>
        )}
        <RouteSpine
          stations={located.dir.stations}
          vehicle={located.vehicle}
          yourStopId={stopId}
          labels={spineLabels}
          onPickStop={(id) => openStop(id)}
        />
      </div>
    );
  };

  const renderArrival = (item: VarnaArrival, schedule?: { row: VarnaScheduleRow; times: string[] }) => {
    const lineId = schedule ? schedule.row.line_id : item.line_id;
    const device = schedule ? "" : item.device;
    const open = openBus != null && busKey(openBus.lineId, openBus.device) === busKey(lineId, device);
    const eta = schedule ? `${t.nextTrip} ${schedule.times[0]}` : formatEta(item, etaCopy);
    const sub = schedule ? schedule.times.slice(1).join("  ") : formatLiveDistance(item);
    const delay = schedule ? "" : formatDelay(item.delay, t.min);
    const tone = delayTone(item.delay);
    return (
      <div key={busKey(lineId, device)} className={open ? "rounded-2xl bg-slate-50 dark:bg-slate-900/40" : ""}>
        <button
          type="button"
          onClick={() => toggleBus(lineId, device)}
          className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-1 py-3 text-left"
        >
          <LineBadge line={schedule ? schedule.row.line : item.line} />
          <span className="min-w-0">
            <span className="block truncate text-lg font-semibold leading-tight tabular-nums text-slate-900 dark:text-white">
              {eta}
            </span>
            <span className={`block truncate text-xs ${schedule ? "text-slate-400" : "text-teal-600 dark:text-teal-400"}`}>
              {schedule ? t.schedule : t.live}
              {sub ? ` · ${sub}` : ""}
            </span>
          </span>
          {delay && (
            <span className={`text-sm font-semibold tabular-nums ${tone === "late" ? "text-rose-500" : "text-emerald-600"}`}>
              {delay}
            </span>
          )}
        </button>
        {renderRoute(lineId, device, station?.stop.id ?? null)}
      </div>
    );
  };

  const updated = clockLabel(mode === "line" ? lineState?.updated_at : station?.updated_at);
  const showRecent = mode === "stop" && !station && !query.trim() && !suggestions.length && recent.length > 0;
  const showEmpty =
    mode === "stop"
      ? !station && !suggestions.length && !query.trim()
      : !lineState && filteredLines.length === 0;

  return (
    <main className="px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{t.city}</p>
            <h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              <FaBus className="text-xl text-teal-600" aria-hidden />
              {t.title}
            </h1>
          </div>
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 motion-safe:animate-pulse" />
            {t.live}
          </p>
        </header>

        <div className="rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1 dark:bg-slate-900" role="tablist">
            {(["stop", "line"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => {
                  setMode(item);
                  setStatus("");
                  setNote("");
                  setQuery("");
                  setSuggestions([]);
                }}
                className={`rounded-full py-2 text-sm font-semibold transition-colors ${
                  mode === item
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500"
                }`}
              >
                {item === "stop" ? t.stop : t.line}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              onKeyDown={onSearchKey}
              placeholder={mode === "stop" ? t.stopPlaceholder : t.linePlaceholder}
              className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              autoComplete="off"
              aria-label={mode === "stop" ? t.stop : t.line}
            />
            {mode === "stop" && (
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                title={t.near}
                aria-label={t.near}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:border-teal-500 hover:text-teal-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
              >
                <FaLocationArrow className={locating ? "animate-pulse" : ""} />
              </button>
            )}
          </div>

          {mode === "line" && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {filteredLines.map((line) => {
                const active = lineState?.line_id === line.id;
                return (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => openLine(line.id)}
                    className={`h-9 shrink-0 rounded-full px-3 text-sm font-semibold tabular-nums ${
                      active
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {line.name}
                  </button>
                );
              })}
            </div>
          )}

          {mode === "stop" && chosen && (
            <div className="mt-4">
              {backStop && (
                <button
                  type="button"
                  onClick={() => openStop(backStop.id, { fromHistory: true })}
                  className="mb-1 text-sm font-medium text-teal-700 hover:underline dark:text-teal-300"
                >
                  ← {t.back} · {stopHeading(backStop.name, backStop.towards, t.towards).title}
                </button>
              )}
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{chosen.title}</h2>
              {chosen.direction && <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{chosen.direction}</p>}
            </div>
          )}

          {showRecent && (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t.recent}</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => openStop(stop.id)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {stopHeading(stop.name, stop.towards, t.towards).title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "stop" && suggestions.length > 0 && !station && (
            <ul className="mt-2">
              {suggestions.map((stop, index) => {
                const heading = stopHeading(stop.name, stop.towards, t.towards);
                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onClick={() => openStop(stop.id)}
                      className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left dark:border-slate-700 ${
                        index === highlight ? "text-teal-700 dark:text-teal-300" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-slate-900 dark:text-white">{heading.title}</span>
                        {heading.direction && <span className="block truncate text-sm text-teal-700 dark:text-teal-300">{heading.direction}</span>}
                      </span>
                      {stop.distance_m != null && (
                        <span className="shrink-0 text-xs text-slate-400">
                          {stop.distance_m} {t.meters}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {mode === "line" && lineState && (lineState.directions || []).length > 0 && (
            <div className="mt-3 flex gap-2">
              {lineState.directions.map((dir) => {
                const active = dir.direction === (currentDir?.direction ?? lineDir);
                const label = shortPlaceName(dir.destination || dir.origin || "");
                return (
                  <button
                    key={dir.direction}
                    type="button"
                    onClick={() => {
                      setLineDir(dir.direction);
                      setOpenBus(null);
                    }}
                    className={`min-w-0 flex-1 truncate rounded-2xl px-3 py-2 text-left text-sm font-medium ${
                      active
                        ? "bg-teal-50 text-teal-800 ring-1 ring-teal-600/30 dark:bg-teal-950/40 dark:text-teal-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {label ? `${t.towards} ${label}` : dir.direction}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-2" aria-live="polite">
            {loading && !station && !lineState && (
              <div className="space-y-3 py-4">
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
              </div>
            )}

            {mode === "stop" && station && (
              <div>
                {live.map((item) => renderArrival(item))}
                {scheduleRows.length > 0 && (
                  <div className="mt-2">
                    <p className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t.schedule}</p>
                    {scheduleRows.map((item) => renderArrival(item.row as unknown as VarnaArrival, item))}
                  </div>
                )}
                {!live.length && !scheduleRows.length && !loading && (
                  <p className="px-1 py-8 text-center text-sm text-slate-500">{t.none}</p>
                )}
              </div>
            )}

            {mode === "line" && currentDir && (
              <div>
                {(currentDir.vehicles || []).length ? (
                  currentDir.vehicles.map((item) => {
                    const open = openBus != null && busKey(openBus.lineId, openBus.device) === busKey(item.line_id, item.device);
                    const nextStop = currentDir.stations.find((stop) => Number(stop.id) === Number(item.next_stop_id));
                    const delay = formatDelay(item.delay, t.min);
                    const tone = delayTone(item.delay);
                    return (
                      <div key={item.device || item.line} className={open ? "rounded-2xl bg-slate-50 dark:bg-slate-900/40" : ""}>
                        <button
                          type="button"
                          onClick={() => toggleBus(item.line_id, item.device)}
                          className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 px-1 py-3 text-left"
                        >
                          <LineBadge line={item.line} />
                          <span className="min-w-0">
                            <span className="block truncate text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                              {formatVehicleWhen(item, etaCopy)}
                            </span>
                            <span className="block truncate text-xs text-teal-600 dark:text-teal-400">
                              {t.live}
                              {nextStop ? ` · ${shortPlaceName(nextStop.name)}` : formatLiveDistance(item) ? ` · ${formatLiveDistance(item)}` : ""}
                            </span>
                          </span>
                          {delay && (
                            <span className={`text-sm font-semibold tabular-nums ${tone === "late" ? "text-rose-500" : "text-emerald-600"}`}>
                              {delay}
                            </span>
                          )}
                        </button>
                        {open && (
                          <RouteSpine
                            stations={currentDir.stations}
                            vehicle={item}
                            labels={spineLabels}
                            onPickStop={(id) => openStop(id)}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="px-1 py-8 text-center text-sm text-slate-500">{t.noBuses}</p>
                )}
              </div>
            )}

            {showEmpty && !loading && !showRecent && (
              <p className="px-2 py-8 text-center text-sm leading-relaxed text-slate-500">
                {mode === "line" ? t.emptyLine : t.emptyStop}
              </p>
            )}
          </div>

          {(status || note || updated) && (
            <div className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-slate-400">
              <span className={status ? "text-rose-500" : ""}>{status || note}</span>
              {updated && (
                <button
                  type="button"
                  className="shrink-0 font-medium hover:text-slate-700 dark:hover:text-slate-200"
                  onClick={() => {
                    if (mode === "stop" && station) openStop(station.stop.id, { silent: true, fromHistory: true });
                    else if (mode === "line" && lineState) openLine(lineState.line_id, true);
                  }}
                >
                  {t.updated} {updated} · {t.refresh}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 px-2 text-center text-[11px] text-slate-400">{t.source}</p>
      </div>
    </main>
  );
};

export default Buses;
