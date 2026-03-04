import "dotenv/config";
import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import {
  createAdminToken,
  createToken,
  checkAdminCredentials,
  hasAuthConfigured,
  verifyToken,
  isAdmin,
} from "./auth.js";
import { ensureUsersTable, findUserByUsername, createUser } from "./users-db.js";

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

// POST /api/register – username + password, role 'user'
const MIN_USERNAME_LEN = 2;
const MAX_USERNAME_LEN = 50;
const MIN_PASSWORD_LEN = 6;
app.post("/api/register", async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { username, password } = req.body || {};
  const u = (username || "").trim();
  const p = (password || "").trim();
  if (!u || !p) return res.status(400).json({ error: "Missing username or password" });
  if (u.length < MIN_USERNAME_LEN || u.length > MAX_USERNAME_LEN) {
    return res.status(400).json({ error: "Username must be 2–50 characters" });
  }
  if (p.length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    await ensureUsersTable(sql);
    const existing = await findUserByUsername(sql, u);
    if (existing) return res.status(400).json({ error: "Username already taken" });
    const hash = await bcrypt.hash(p, 10);
    await createUser(sql, u, hash, "user");
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Registration failed" });
  }
});

// POST /api/login – env admin or DB user
app.post("/api/login", async (req, res) => {
  if (!hasAuthConfigured) {
    return res.status(503).json({ error: "Login not configured (set JWT_SECRET and ADMIN_PASSWORD)" });
  }
  const { username, password } = req.body || {};
  const u = (username || "").trim();
  const p = (password || "").trim();
  if (!u || !p) return res.status(400).json({ error: "Missing username or password" });
  if (checkAdminCredentials(u, p)) {
    const token = createAdminToken(u);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    return res.json({ token, user: { username: u, role: "admin" } });
  }
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsername(sql, u);
    if (!user || !(await bcrypt.compare(p, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken(user.username, user.role);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
});

// GET /api/me – same as Vercel api/me.js
app.get("/api/me", (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  res.json({ username: payload.sub, role: payload.role });
});

// GET progress by key (e.g. ?key=schulhub-dsd-modellsatz-3)
app.get("/api/progress", async (req, res) => {
  const key = req.query.key;
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing key" });
  }
  try {
    let rows = await sql`SELECT value, updated_at FROM schulhub_progress WHERE key = ${key} LIMIT 1`;
    if (rows.length === 0 && key === "schulhub-about") {
      const defaultAbout = {
        bg: { title: "За нас", body: "ShulHub е образователна платформа за немски език, биология и география.\n\nТук ще намерите уроци, материали и тестове, подредени по теми. Платформата поддържа различни езици на интерфейса (български, английски, немски) и настройки за шрифт за по-добра четливост." },
        en: { title: "About Us", body: "ShulHub is an educational platform for German language, biology and geography.\n\nHere you will find lessons, materials and tests organised by topic. The platform supports multiple interface languages (Bulgarian, English, German) and font settings for better readability." },
        de: { title: "Über uns", body: "ShulHub ist eine Bildungsplattform für Deutsch, Biologie und Geographie.\n\nHier finden Sie Lektionen, Materialien und Tests nach Themen. Die Plattform unterstützt mehrere Sprachen (Bulgarisch, Englisch, Deutsch) und Schrifteinstellungen für bessere Lesbarkeit." },
      };
      await sql`INSERT INTO schulhub_progress (key, value) VALUES (${key}, ${JSON.stringify(defaultAbout)}::jsonb) ON CONFLICT (key) DO NOTHING`;
      rows = await sql`SELECT value, updated_at FROM schulhub_progress WHERE key = ${key} LIMIT 1`;
    }
    if (rows.length === 0) return res.json({ value: null });
    res.json({ value: rows[0].value, updated_at: rows[0].updated_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST save progress: body = { key, value } – admin required for schulhub-about
app.post("/api/progress", async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: "Missing key or value" });
  }
  if (key === "schulhub-about" && !isAdmin(req)) {
    return res.status(403).json({ error: "Admin only" });
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
