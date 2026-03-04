const { neon } = require("@neondatabase/serverless");
const { verifyToken } = require("../_auth");

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_user_progress (
      username TEXT NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (username, key)
    )
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const username = payload.sub;
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    await ensureTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (req.method === "GET") {
    let key = req.query && req.query.key;
    if ((!key || typeof key !== "string") && req.url) {
      try {
        const u = new URL(req.url, "http://localhost");
        key = u.searchParams.get("key");
      } catch (_) {}
    }
    if (!key || typeof key !== "string") {
      return res.status(400).json({ error: "Missing key" });
    }
    try {
      const rows = await sql`
        SELECT value FROM schulhub_user_progress WHERE username = ${username} AND key = ${key} LIMIT 1
      `;
      return res.status(200).json({ value: rows[0]?.value ?? null });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  const body = typeof req.body === "object" ? req.body : {};
  const { key, value } = body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Missing key or value" });
  }
  try {
    await sql`
      INSERT INTO schulhub_user_progress (username, key, value)
      VALUES (${username}, ${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (username, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
