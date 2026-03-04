const bcrypt = require("bcryptjs");
const { createAdminToken, createToken, checkAdminCredentials, hasAuthConfigured } = require("./_auth");
const { getSql, ensureUsersTable, findUserByUsername } = require("./_users");

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
  if (!hasAuthConfigured) {
    return res.status(503).json({ error: "Login not configured (set JWT_SECRET and ADMIN_PASSWORD)" });
  }
  const { username, password } = req.body || {};
  const u = (username || "").trim();
  const p = (password || "").trim();
  if (!u || !p) {
    return res.status(400).json({ error: "Missing username or password" });
  }
  if (checkAdminCredentials(u, p)) {
    const token = createAdminToken(u);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    return res.status(200).json({ token, user: { username: u, role: "admin" } });
  }
  const sql = getSql();
  if (!sql) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsername(sql, u);
    if (!user || !(await bcrypt.compare(p, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken(user.username, user.role);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    res.status(200).json({ token, user: { username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
};
