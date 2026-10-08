const {
  VarnaTrafficError,
  getStops,
  getNearestStops,
  getLines,
  getStation,
  getLineState,
} = require("./_varna-traffic.cjs");

function freshFlag(value) {
  return value === "1" || value === "true" || value === true;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const resource = String(req.query.resource || "");
  const id = req.query.id != null ? Number(req.query.id) : null;
  const fresh = freshFlag(req.query.fresh);

  try {
    if (resource === "stops") return res.json(await getStops(req.query.q || ""));
    if (resource === "nearest") {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return res.status(400).json({ error: "lat and lon required" });
      }
      return res.json(await getNearestStops(lat, lon));
    }
    if (resource === "stop") {
      if (!Number.isFinite(id)) return res.status(400).json({ error: "stop id required" });
      return res.json(await getStation(id, fresh));
    }
    if (resource === "lines") return res.json(await getLines());
    if (resource === "line") {
      if (!Number.isFinite(id)) return res.status(400).json({ error: "line id required" });
      const direction = req.query.direction == null || req.query.direction === ""
        ? null
        : Number(req.query.direction);
      return res.json(await getLineState(id, direction, fresh));
    }
    return res.status(404).json({ error: "Unknown varna resource" });
  } catch (err) {
    const status = err instanceof VarnaTrafficError ? 502 : 500;
    return res.status(status).json({ error: err.message || "Varna traffic error" });
  }
};
