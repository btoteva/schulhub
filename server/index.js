import "dotenv/config";
import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

// Ensure schema exists (run once)
async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_progress (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

app.get("/api/health", async (req, res) => {
  try {
    const r = await sql`SELECT 1 as ok`;
    res.json({ status: "ok", db: r[0]?.ok === 1 ? "connected" : "error" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// GET progress by key (e.g. ?key=schulhub-dsd-modellsatz-3)
app.get("/api/progress", async (req, res) => {
  const key = req.query.key;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key" });
  }
  try {
    const rows = await sql`
      SELECT value, updated_at FROM schulhub_progress WHERE key = ${key} LIMIT 1
    `;
    if (rows.length === 0) return res.json({ value: null });
    res.json({ value: rows[0].value, updated_at: rows[0].updated_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST save progress: body = { key, value }
app.post("/api/progress", async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Missing key or value" });
  }
  try {
    await sql`
      INSERT INTO schulhub_progress (key, value)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SchulHub API on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
