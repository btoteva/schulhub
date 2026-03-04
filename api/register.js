const bcrypt = require("bcryptjs");
const { getSql, ensureUsersTable, findUserByUsername, createUser } = require("./_users");

const MIN_USERNAME_LEN = 2;
const MAX_USERNAME_LEN = 50;
const MIN_PASSWORD_LEN = 6;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "Database not configured" });
  }
  const { username, password } = req.body || {};
  const u = (username || "").trim();
  const p = (password || "").trim();
  if (!u || !p) {
    return res.status(400).json({ error: "Missing username or password" });
  }
  if (u.length < MIN_USERNAME_LEN || u.length > MAX_USERNAME_LEN) {
    return res.status(400).json({ error: "Username must be 2–50 characters" });
  }
  if (p.length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    await ensureUsersTable(sql);
    const existing = await findUserByUsername(sql, u);
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hash = await bcrypt.hash(p, 10);
    await createUser(sql, u, hash, "user");
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Registration failed" });
  }
};
