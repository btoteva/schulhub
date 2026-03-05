const { verifyToken } = require("./_auth");
const bcrypt = require("bcryptjs");
const { getSql, ensureUsersTable, findUserByUsername, updateUserPassword, updateUserSchoolClass } = require("./_users");

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
    if (payload.role === "superadmin") {
      return res.status(200).json({
        username: payload.sub,
        role: payload.role,
        school: null,
        class: null,
      });
    }
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      return res.status(200).json({
        username: user.username,
        role: user.role,
        school: user.school ?? null,
        class: user.class_name ?? null,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  // PATCH – change own password and/or school, class
  const body = typeof req.body === "object" ? req.body : {};
  const { newPassword, school, class: classParam } = body;
  const schoolVal = typeof school === "string" ? school.trim() || null : undefined;
  const classVal = typeof classParam === "string" ? classParam.trim() || null : undefined;
  const hasSchoolClass = schoolVal !== undefined || classVal !== undefined;
  if (newPassword != null && typeof newPassword === "string") {
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
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (hasSchoolClass && payload.role !== "superadmin") {
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      await updateUserSchoolClass(sql, user.id, schoolVal ?? null, classVal ?? null);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(200).json({ ok: true });
};
