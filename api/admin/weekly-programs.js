const { isAdmin } = require("../_auth");
const { getSql } = require("../_users");

async function ensureWeeklyProgramTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_weekly_program (
      school TEXT NOT NULL,
      class_name TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (school, class_name)
    )
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Admin only" });
  }
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    await ensureWeeklyProgramTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT school, class_name, data, updated_at FROM schulhub_weekly_program ORDER BY school, class_name
      `;
      res.status(200).json({
        programs: rows.map((r) => ({ school: r.school, class: r.class_name, data: r.data, updated_at: r.updated_at })),
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  // PUT – upsert one program
  const body = typeof req.body === "object" ? req.body : {};
  const { school, class: classParam, data } = body;
  const schoolVal = school != null && String(school).trim() ? String(school).trim() : null;
  const classVal = classParam != null && String(classParam).trim() ? String(classParam).trim() : null;
  if (!schoolVal || !classVal) return res.status(400).json({ error: "school and class required" });
  if (data == null || typeof data !== "object") return res.status(400).json({ error: "data (object) required" });
  try {
    await sql`
      INSERT INTO schulhub_weekly_program (school, class_name, data)
      VALUES (${schoolVal}, ${classVal}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (school, class_name) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
