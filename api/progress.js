const { neon } = require("@neondatabase/serverless");

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_progress (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    return res.status(500).json({ error: "DATABASE_URL not set" });
  }
  const sql = neon(url);
  try {
    await ensureTable(sql);
  } catch (e) {
    return res.status(500).json({ error: "DB init: " + e.message });
  }
  if (req.method === "GET") {
    const key = req.query.key;
    if (!key || typeof key !== "string") {
      return res.status(400).json({ error: "Missing key" });
    }
    try {
      const rows = await sql`SELECT value, updated_at FROM schulhub_progress WHERE key = ${key} LIMIT 1`;
      if (rows.length === 0) return res.json({ value: null });
      res.json({ value: rows[0].value, updated_at: rows[0].updated_at });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === "POST") {
    const { key, value } = req.body || {};
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Missing key or value" });
    }
    try {
      await sql`INSERT INTO schulhub_progress (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};
