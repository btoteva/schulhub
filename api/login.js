const bcrypt = require("bcryptjs");
const { createSuperAdminToken, createToken, checkAdminCredentials, hasAuthConfigured } = require("./_auth");
const { getSql, ensureUsersTable, ensureUserChildrenTable, findUserByUsernameOrEmail, getParentInfoForStudent } = require("./_users");

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
    const token = createSuperAdminToken(u);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    return res.status(200).json({ token, user: { username: u, role: "superadmin", gender: null } });
  }
  const sql = getSql();
  if (!sql) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsernameOrEmail(sql, u);
    if (!user || !(await bcrypt.compare(p, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken(user.username, user.role);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    await ensureUserChildrenTable(sql);
    const parentInfo = await getParentInfoForStudent(sql, user.username);
    res.status(200).json({
      token,
      user: {
        username: user.username,
        role: user.role,
        profile_type: user.profile_type ?? null,
        school: user.school ?? null,
        class: user.class_name ?? null,
        gender: user.gender ?? null,
        parent_username: parentInfo?.parent_username ?? null,
        parent_gender: parentInfo?.parent_gender ?? null,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
};
