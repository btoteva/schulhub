const { getSql } = require("./_users");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    const rows = await sql`
      SELECT DISTINCT school FROM schulhub_weekly_program WHERE school IS NOT NULL AND school != ''
      UNION
      SELECT DISTINCT school FROM schulhub_users WHERE school IS NOT NULL AND school != ''
      ORDER BY school
    `;
    res.status(200).json({ schools: rows.map((r) => r.school) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
