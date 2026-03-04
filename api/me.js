const { verifyToken } = require("./_auth");
const bcrypt = require("bcryptjs");
const { getSql, ensureUsersTable, findUserByUsername, updateUserPassword } = require("./_users");

const MIN_PASSWORD_LEN = 6;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (req.method === "GET") {
    return res.status(200).json({
      username: payload.sub,
      role: payload.role,
    });
  }
  // PATCH – change own password (body: { newPassword }); auth via JWT
  const body = typeof req.body === "object" ? req.body : {};
  const { newPassword } = body;
  if (!newPassword || typeof newPassword !== "string") {
    return res.status(400).json({ error: "Missing newPassword" });
  }
  if (newPassword.length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsername(sql, payload.sub);
    if (!user) {
      return res.status(403).json({ error: "Super admin password is managed in environment" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(sql, user.id, hash);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
