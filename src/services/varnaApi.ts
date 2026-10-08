import {
  VarnaLinePayload,
  VarnaStationPayload,
  VarnaStop,
  bestTerminusOnLine,
  sameStopFamily,
  stopBaseTitle,
  stopDistanceM,
  towardsFromName,
} from "../utils/varnaFormat";

const API_BASE = process.env.DEV_API_ORIGIN || "";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* keep the status */
    }
    throw new Error(message);
  }
  return res.json();
}

export function fetchVarnaStops(query = ""): Promise<VarnaStop[]> {
  const q = query.trim();
  return getJson(`/api/varna/stops${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export function fetchNearestStops(lat: number, lon: number): Promise<VarnaStop[]> {
  return getJson(`/api/varna/stops/nearest?lat=${lat}&lon=${lon}`);
}

export function fetchVarnaStation(stopId: number | string): Promise<VarnaStationPayload> {
  return getJson(`/api/varna/stops/${encodeURIComponent(stopId)}?fresh=1`);
}

export function fetchVarnaLines(): Promise<{ id: number; name: string }[]> {
  return getJson("/api/varna/lines");
}

export function fetchVarnaLine(lineId: number | string): Promise<VarnaLinePayload> {
  return getJson(`/api/varna/lines/${encodeURIComponent(lineId)}?fresh=1`);
}

export async function decorateStopDirections(
  stops: VarnaStop[],
  getLine: (lineId: number) => Promise<VarnaLinePayload>
): Promise<VarnaStop[]> {
  const list = stops || [];
  const groups: Record<string, VarnaStop[]> = {};
  list.forEach((stop) => {
    const key = stopBaseTitle(stop.name).toLocaleLowerCase("bg");
    if (!key) return;
    (groups[key] || (groups[key] = [])).push(stop);
  });

  await Promise.all(
    Object.values(groups).map(async (group) => {
      const nearby =
        group.length >= 2
          ? group.filter((stop) => group.some((other) => other !== stop && stopDistanceM(stop, other) < 450))
          : [];
      if (nearby.length < 2) {
        group.forEach((stop) => {
          const named = towardsFromName(stop.name);
          stop.towards = named && !sameStopFamily(named, stop.name) ? named : "";
        });
        return;
      }

      const details: Record<number, VarnaStationPayload> = {};
      await Promise.all(
        nearby.map(async (stop) => {
          try {
            details[stop.id] = await fetchVarnaStation(stop.id);
          } catch {
            /* keep the name hint */
          }
        })
      );

      const lineIds = [
        ...new Set(
          nearby.flatMap((stop) => {
            const detail = details[stop.id];
            return [
              ...(detail?.schedule || []).map((row) => row.line_id),
              ...(detail?.live || []).map((row) => row.line_id),
            ].filter((id): id is number => id != null);
          })
        ),
      ];

      let best: { score: number; labels: { stop: VarnaStop; label: string }[] } | null = null;
      for (const lineId of lineIds.slice(0, 6)) {
        try {
          const payload = await getLine(lineId);
          const labels = nearby.map((stop) => ({ stop, ...bestTerminusOnLine(payload, stop.id) }));
          const usable = labels.filter((item) => item.label);
          const unique = new Set(usable.map((item) => item.label.toLocaleLowerCase("bg")));
          if (unique.size < 2) continue;
          const score =
            usable.reduce((sum, item) => sum + item.remaining, 0) +
            (payload.directions || []).reduce((sum, dir) => sum + (dir.stations || []).length, 0);
          if (!best || score > best.score) best = { score, labels: usable };
        } catch {
          /* try the next shared line */
        }
      }
      if (best) {
        best.labels.forEach((item) => {
          item.stop.towards = item.label;
        });
      }
      nearby.forEach((stop) => {
        if (stop.towards) return;
        const named = towardsFromName(stop.name);
        stop.towards = named && !sameStopFamily(named, stop.name) ? named : "";
      });
    })
  );
  return list;
}

export function pickVehicleForStop(dir: VarnaDirection | undefined, stopId: number | null) {
  const stations = dir?.stations || [];
  const vehicles = dir?.vehicles || [];
  if (!vehicles.length) return null;
  const stopIdx = stations.findIndex((stop) => Number(stop.id) === Number(stopId));
  if (stopIdx < 0) return vehicles[0];
  const ranked = vehicles
    .map((bus) => ({
      bus,
      here: stations.findIndex((stop) => Number(stop.id) === Number(bus.stop_id)),
    }))
    .filter((item) => item.here >= 0);
  const approaching = ranked.filter((item) => item.here <= stopIdx);
  if (approaching.length) {
    approaching.sort((a, b) => b.here - a.here);
    return approaching[0].bus;
  }
  ranked.sort((a, b) => a.here - b.here);
  return (ranked[0] || { bus: vehicles[0] }).bus;
}

export function locateBus(
  linePayload: VarnaLinePayload | undefined,
  direction: number | null,
  device: string,
  stopId: number | null
) {
  const dirs = linePayload?.directions || [];
  let dir: VarnaDirection | null = null;
  let vehicle = null as VarnaLinePayload["directions"][number]["vehicles"][number] | null;
  if (device) {
    for (const item of dirs) {
      const found = (item.vehicles || []).find((bus) => String(bus.device) === String(device));
      if (found) {
        dir = item;
        vehicle = found;
        break;
      }
    }
  }
  if (!dir && stopId != null) {
    dir = dirs.find((item) => (item.stations || []).some((stop) => Number(stop.id) === Number(stopId))) || null;
  }
  if (!dir) {
    dir = dirs.find((item) => Number(item.direction) === Number(direction)) || dirs[0] || null;
  }
  if (!vehicle && dir) {
    vehicle = pickVehicleForStop(dir, stopId) || (dir.vehicles || [])[0] || null;
  }
  return { dir, vehicle };
}
