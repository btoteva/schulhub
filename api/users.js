const bcrypt = require("bcryptjs");
const { isAdmin } = require("./_auth");
const { getSql, ensureUsersTable, findUserByUsername, findUserByEmail, createUser, listUsers, updateUserRole, updateUserPassword, updateUserEmail, updateUserSchoolClass, updateUserProfileType, updateUserGender, deleteUser } = require("./_users");

const MIN_USERNAME_LEN = 2;
const MAX_USERNAME_LEN = 50;
const MIN_PASSWORD_LEN = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET" && req.method !== "POST" && req.method !== "PATCH" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Admin only" });
  }
  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    await ensureUsersTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (req.method === "GET") {
    try {
      const users = await listUsers(sql);
      res.status(200).json({ users });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === "POST") {
    const { username, password, email: emailParam, role, profile_type: profileTypeParam } = req.body || {};
    const u = (username || "").trim();
    const p = (password || "").trim();
    const emailVal = typeof emailParam === "string" ? emailParam.trim().toLowerCase() : "";
    const r = role === "admin" ? "admin" : "user";
    const profileTypeVal = profileTypeParam === "student" || profileTypeParam === "parent" ? profileTypeParam : null;
    if (!u || !p) return res.status(400).json({ error: "Missing username or password" });
    if (!emailVal) return res.status(400).json({ error: "Email is required" });
    if (!EMAIL_REGEX.test(emailVal)) return res.status(400).json({ error: "Invalid email format" });
    if (u.length < MIN_USERNAME_LEN || u.length > MAX_USERNAME_LEN) return res.status(400).json({ error: "Username must be 2–50 characters" });
    if (p.length < MIN_PASSWORD_LEN) return res.status(400).json({ error: "Password must be at least 6 characters" });
    try {
      const existingUsername = await findUserByUsername(sql, u);
      if (existingUsername) return res.status(400).json({ error: "Username already taken" });
      const existingEmail = await findUserByEmail(sql, emailVal);
      if (existingEmail) return res.status(400).json({ error: "Email already registered" });
      const hash = await bcrypt.hash(p, 10);
      await createUser(sql, u, hash, r, emailVal, null, null, profileTypeVal, null);
      res.status(201).json({ ok: true });
    } catch (e) {
      if (e.code === "23505") return res.status(400).json({ error: "Email already registered" });
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === "PATCH") {
    const body = typeof req.body === "object" ? req.body : {};
    const { id, role, email, password, profile_type: profileTypeParam, school, class: classParam, gender: genderParam } = body;
    const uid = typeof id === "number" ? id : parseInt(id, 10);
    if (!Number.isInteger(uid) || uid < 1) return res.status(400).json({ error: "Invalid id" });
    const hasRole = role === "user" || role === "admin";
    const hasPassword = typeof password === "string" && password.length >= MIN_PASSWORD_LEN;
    const emailVal = typeof email === "string" ? email.trim().toLowerCase() : "";
    const hasEmail = emailVal.length > 0;
    const profileTypeVal = profileTypeParam === "student" || profileTypeParam === "parent" ? profileTypeParam : (profileTypeParam === null || profileTypeParam === "" ? null : undefined);
    const hasProfileType = profileTypeVal !== undefined;
    const genderVal = genderParam === "male" || genderParam === "female" ? genderParam : (genderParam === null || genderParam === "" ? null : undefined);
    const hasGender = genderVal !== undefined;
    const schoolVal = school === undefined ? undefined : (typeof school === "string" ? school.trim() || null : null);
    const classVal = classParam === undefined ? undefined : (typeof classParam === "string" ? classParam.trim() || null : null);
    const hasSchoolClass = schoolVal !== undefined || classVal !== undefined;
    if (hasEmail && !EMAIL_REGEX.test(emailVal)) return res.status(400).json({ error: "Invalid email format" });
    if (!hasRole && !hasPassword && !hasEmail && !hasProfileType && !hasSchoolClass && !hasGender) return res.status(400).json({ error: "Provide role, email, profile_type, school/class, gender and/or password" });
    try {
      if (hasEmail) {
        const existing = await findUserByEmail(sql, emailVal);
        if (existing && existing.id !== uid) return res.status(400).json({ error: "Email already registered" });
        await updateUserEmail(sql, uid, emailVal);
      }
      if (hasRole) await updateUserRole(sql, uid, role);
      if (hasProfileType) await updateUserProfileType(sql, uid, profileTypeVal);
      if (hasPassword) {
        const hash = await bcrypt.hash(password, 10);
        await updateUserPassword(sql, uid, hash);
      }
      if (hasSchoolClass) await updateUserSchoolClass(sql, uid, schoolVal ?? null, classVal ?? null);
      if (hasGender) await updateUserGender(sql, uid, genderVal ?? null);
      res.status(200).json({ ok: true });
    } catch (e) {
      if (e.code === "23505") return res.status(400).json({ error: "Email already registered" });
      res.status(500).json({ error: e.message });
    }
    return;
  }
  if (req.method === "DELETE") {
    const { id } = req.body || {};
    const uid = typeof id === "number" ? id : parseInt(id, 10);
    if (!Number.isInteger(uid) || uid < 1) {
      return res.status(400).json({ error: "Invalid id" });
    }
    try {
      await deleteUser(sql, uid);
      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};
