import "dotenv/config";
import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import {
  createSuperAdminToken,
  createToken,
  checkAdminCredentials,
  hasAuthConfigured,
  verifyToken,
  isAdmin,
  isSuperAdmin,
} from "./auth.js";
import { ensureUsersTable, ensureUserChildrenTable, findUserByUsername, findUserByEmail, findUserByUsernameOrEmail, createUser, listUsers, updateUserRole, updateUserPassword, updateUserEmail, updateUserSchoolClass, updateUserProfileType, deleteUser, listUserChildren, addUserChild, getUserChild, updateUserChild, deleteUserChild } from "./users-db.js";

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
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_user_progress (
      username TEXT NOT NULL,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (username, key)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_weekly_program (
      school TEXT NOT NULL,
      class_name TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (school, class_name)
    )
  `;
  await ensureUserChildrenTable(sql);
}

app.get("/api/health", async (req, res) => {
  try {
    const r = await sql`SELECT 1 as ok`;
    res.json({ status: "ok", db: r[0]?.ok === 1 ? "connected" : "error" });
  } catch (e) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// POST /api/register – username + email + password, role 'user'
const MIN_USERNAME_LEN = 2;
const MAX_USERNAME_LEN = 50;
const MIN_PASSWORD_LEN = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
app.post("/api/register", async (req, res) => {
  const sql = neon(process.env.DATABASE_URL);
  if (!sql) return res.status(503).json({ error: "Database not configured" });
  const { username, email, password, school, class: classParam } = req.body || {};
  const u = (username || "").trim();
  const e = (email || "").trim().toLowerCase();
  const p = (password || "").trim();
  const schoolVal = typeof school === "string" ? school.trim() || null : null;
  const classVal = typeof classParam === "string" ? classParam.trim() || null : null;
  if (!u || !p) return res.status(400).json({ error: "Missing username or password" });
  if (!e) return res.status(400).json({ error: "Email is required" });
  if (!EMAIL_REGEX.test(e)) return res.status(400).json({ error: "Invalid email format" });
  if (u.length < MIN_USERNAME_LEN || u.length > MAX_USERNAME_LEN) {
    return res.status(400).json({ error: "Username must be 2–50 characters" });
  }
  if (p.length < MIN_PASSWORD_LEN) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  try {
    await ensureUsersTable(sql);
    const existingUsername = await findUserByUsername(sql, u);
    if (existingUsername) return res.status(400).json({ error: "Username already taken" });
    const existingEmail = await findUserByEmail(sql, e);
    if (existingEmail) return res.status(400).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(p, 10);
    await createUser(sql, u, hash, "user", e, schoolVal, classVal);
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already registered" });
    res.status(500).json({ error: err.message || "Registration failed" });
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
    const token = createSuperAdminToken(u);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    return res.json({ token, user: { username: u, role: "superadmin" } });
  }
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsernameOrEmail(sql, u);
    if (!user || !(await bcrypt.compare(p, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createToken(user.username, user.role);
    if (!token) return res.status(500).json({ error: "Could not create token" });
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        profile_type: user.profile_type ?? null,
        school: user.school ?? null,
        class: user.class_name ?? null,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
});

// GET /api/users – list all users (admin only)
app.get("/api/users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  try {
    await ensureUsersTable(sql);
    const users = await listUsers(sql);
    res.json({ users });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users – create user (admin only), body: { username, password, role?, school?, class? }
app.post("/api/users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  const { username, password, role, school, class: classParam } = req.body || {};
  const u = (username || "").trim();
  const p = (password || "").trim();
  const r = role === "admin" ? "admin" : "user";
  const schoolVal = typeof school === "string" ? school.trim() || null : null;
  const classVal = typeof classParam === "string" ? classParam.trim() || null : null;
  if (!u || !p) return res.status(400).json({ error: "Missing username or password" });
  if (u.length < MIN_USERNAME_LEN || u.length > MAX_USERNAME_LEN) return res.status(400).json({ error: "Username must be 2–50 characters" });
  if (p.length < MIN_PASSWORD_LEN) return res.status(400).json({ error: "Password must be at least 6 characters" });
  try {
    await ensureUsersTable(sql);
    const existing = await findUserByUsername(sql, u);
    if (existing) return res.status(400).json({ error: "Username already taken" });
    const hash = await bcrypt.hash(p, 10);
    await createUser(sql, u, hash, r, null, schoolVal, classVal);
    res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/users – update role, email, profile_type, school, class and/or password (admin only)
app.patch("/api/users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  const { id, role, email, password, profile_type: profileTypeParam, school, class: classParam } = req.body || {};
  const uid = typeof id === "number" ? id : parseInt(id, 10);
  if (!Number.isInteger(uid) || uid < 1) return res.status(400).json({ error: "Invalid id" });
  const hasRole = role === "user" || role === "admin";
  const hasPassword = typeof password === "string" && password.length >= MIN_PASSWORD_LEN;
  const emailVal = typeof email === "string" ? email.trim().toLowerCase() : "";
  const hasEmail = emailVal.length > 0;
  const profileTypeVal = profileTypeParam === "student" || profileTypeParam === "parent" ? profileTypeParam : (profileTypeParam === null || profileTypeParam === "" ? null : undefined);
  const hasProfileType = profileTypeVal !== undefined;
  const schoolVal = school === undefined ? undefined : (typeof school === "string" ? school.trim() || null : null);
  const classVal = classParam === undefined ? undefined : (typeof classParam === "string" ? classParam.trim() || null : null);
  const hasSchoolClass = schoolVal !== undefined || classVal !== undefined;
  if (hasEmail && !EMAIL_REGEX.test(emailVal)) return res.status(400).json({ error: "Invalid email format" });
  if (!hasRole && !hasPassword && !hasEmail && !hasProfileType && !hasSchoolClass) return res.status(400).json({ error: "Provide role, email, profile_type, school/class and/or password" });
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
    res.json({ ok: true });
  } catch (e) {
    if (e.code === "23505") return res.status(400).json({ error: "Email already registered" });
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/users – delete user (admin only), body: { id }
app.delete("/api/users", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  const { id } = req.body || {};
  const uid = typeof id === "number" ? id : parseInt(id, 10);
  if (!Number.isInteger(uid) || uid < 1) return res.status(400).json({ error: "Invalid id" });
  try {
    await deleteUser(sql, uid);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/me – return username, role, profile_type, school, class
app.get("/api/me", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  if (payload.role === "superadmin") {
    return res.json({ username: payload.sub, role: payload.role, profile_type: null, school: null, class: null });
  }
  try {
    await ensureUsersTable(sql);
    const user = await findUserByUsername(sql, payload.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    res.json({
      username: user.username,
      role: user.role,
      profile_type: user.profile_type ?? null,
      school: user.school ?? null,
      class: user.class_name ?? null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH /api/me – change own password, profile_type, school, class (body: { newPassword?, profile_type?, school?, class? })
app.patch("/api/me", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const { newPassword, profile_type: profileTypeParam, school, class: classParam } = req.body || {};
  const profileTypeVal = profileTypeParam === "student" || profileTypeParam === "parent" ? profileTypeParam : (profileTypeParam === null || profileTypeParam === "" ? null : undefined);
  const hasProfileType = profileTypeVal !== undefined;
  const schoolVal = school === undefined ? undefined : (typeof school === "string" ? school.trim() || null : null);
  const classVal = classParam === undefined ? undefined : (typeof classParam === "string" ? classParam.trim() || null : null);
  const hasSchoolClass = schoolVal !== undefined || classVal !== undefined;
  if (newPassword != null && typeof newPassword === "string") {
    if (newPassword.length < MIN_PASSWORD_LEN) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
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
  if (hasProfileType && payload.role !== "superadmin") {
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      await updateUserProfileType(sql, user.id, profileTypeVal);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (hasSchoolClass && payload.role !== "superadmin") {
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      await updateUserSchoolClass(sql, user.id, schoolVal ?? null, classVal ?? null);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  res.json({ ok: true });
});

// GET /api/me/progress?key=xxx – current user's progress (auth required)
app.get("/api/me/progress", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const key = req.query.key;
  if (!key || typeof key !== "string") return res.status(400).json({ error: "Missing key" });
  const username = payload.sub;
  try {
    const rows = await sql`
      SELECT value FROM schulhub_user_progress WHERE username = ${username} AND key = ${key} LIMIT 1
    `;
    res.json({ value: rows[0]?.value ?? null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/me/progress – save current user's progress (auth required), body: { key, value }
app.post("/api/me/progress", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const { key, value } = req.body || {};
  if (!key || value === undefined) return res.status(400).json({ error: "Missing key or value" });
  const username = payload.sub;
  try {
    await sql`
      INSERT INTO schulhub_user_progress (username, key, value)
      VALUES (${username}, ${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (username, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/me/children – list current user's children (parent only)
app.get("/api/me/children", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  if (payload.role === "superadmin") return res.json({ children: [] });
  try {
    await ensureUserChildrenTable(sql);
    const children = await listUserChildren(sql, payload.sub);
    res.json({ children: children.map((c) => ({ id: c.id, child_name: c.child_name, school: c.school, class: c.class_name, created_at: c.created_at })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/me/children – add child (body: { child_name, school, class })
app.post("/api/me/children", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  if (payload.role === "superadmin") return res.status(403).json({ error: "Not allowed" });
  const { child_name: childName, school: schoolParam, class: classParam } = req.body || {};
  const nameVal = (childName != null && String(childName).trim()) ? String(childName).trim() : null;
  const schoolVal = (schoolParam != null && String(schoolParam).trim()) ? String(schoolParam).trim() : null;
  const classVal = (classParam != null && String(classParam).trim()) ? String(classParam).trim() : null;
  if (!nameVal || !schoolVal || !classVal) return res.status(400).json({ error: "child_name, school and class required" });
  try {
    await ensureUserChildrenTable(sql);
    const row = await addUserChild(sql, payload.sub, nameVal, schoolVal, classVal);
    res.status(201).json({ id: row.id, child_name: row.child_name, school: row.school, class: row.class_name, created_at: row.created_at });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function getChildIdFromReq(req) {
  const fromPath = req.params.id != null ? parseInt(req.params.id, 10) : NaN;
  const fromQuery = req.query.id != null ? parseInt(req.query.id, 10) : NaN;
  const id = Number.isInteger(fromPath) && fromPath >= 1 ? fromPath : (Number.isInteger(fromQuery) && fromQuery >= 1 ? fromQuery : null);
  return id;
}

// PATCH /api/me/children/:id or /api/me/children?id= – update child (body: { child_name?, school?, class? })
app.patch("/api/me/children/:id?", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const childId = getChildIdFromReq(req);
  if (!childId) return res.status(400).json({ error: "Invalid id" });
  const { child_name: childName, school: schoolParam, class: classParam } = req.body || {};
  const nameVal = childName != null ? String(childName).trim() : undefined;
  const schoolVal = schoolParam != null ? String(schoolParam).trim() : undefined;
  const classVal = classParam != null ? String(classParam).trim() : undefined;
  try {
    const child = await getUserChild(sql, childId, payload.sub);
    if (!child) return res.status(404).json({ error: "Child not found" });
    await updateUserChild(sql, childId, payload.sub, nameVal ?? child.child_name, schoolVal ?? child.school, classVal ?? child.class_name);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/me/children/:id or /api/me/children?id=
app.delete("/api/me/children/:id?", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const childId = getChildIdFromReq(req);
  if (!childId) return res.status(400).json({ error: "Invalid id" });
  try {
    const child = await getUserChild(sql, childId, payload.sub);
    if (!child) return res.status(404).json({ error: "Child not found" });
    await deleteUserChild(sql, childId, payload.sub);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/me/weekly-program – current user's weekly program (by school + class); or ?childId=X for parent viewing child's program
app.get("/api/me/weekly-program", async (req, res) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  if (payload.role === "superadmin") {
    return res.status(404).json({ error: "No program" });
  }
  const childIdParam = req.query.childId;
  try {
    await ensureUsersTable(sql);
    await ensureUserChildrenTable(sql);
    let school = null;
    let className = null;
    if (childIdParam != null && childIdParam !== "") {
      const childId = parseInt(childIdParam, 10);
      if (!Number.isInteger(childId) || childId < 1) return res.status(400).json({ error: "Invalid childId" });
      const child = await getUserChild(sql, childId, payload.sub);
      if (!child) return res.status(404).json({ error: "Child not found" });
      school = child.school;
      className = child.class_name;
    } else {
      const user = await findUserByUsername(sql, payload.sub);
      if (!user || !user.school || !user.class_name) {
        return res.status(404).json({ error: "No program" });
      }
      school = user.school;
      className = user.class_name;
    }
    if (!school || !className) return res.status(404).json({ error: "No program" });
    const rows = await sql`
      SELECT data FROM schulhub_weekly_program
      WHERE school = ${school} AND class_name = ${className}
      LIMIT 1
    `;
    if (rows.length === 0) return res.status(404).json({ error: "No program" });
    res.json(rows[0].data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/schools – distinct school names from weekly programs + users (for profile/register dropdown)
app.get("/api/schools", async (req, res) => {
  try {
    const rows = await sql`
      SELECT DISTINCT school FROM schulhub_weekly_program WHERE school IS NOT NULL AND school != ''
      UNION
      SELECT DISTINCT school FROM schulhub_users WHERE school IS NOT NULL AND school != ''
      ORDER BY school
    `;
    res.json({ schools: rows.map((r) => r.school) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/weekly-programs – list all (admin only)
app.get("/api/admin/weekly-programs", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  try {
    const rows = await sql`
      SELECT school, class_name, data, updated_at FROM schulhub_weekly_program ORDER BY school, class_name
    `;
    res.json({ programs: rows.map((r) => ({ school: r.school, class: r.class_name, data: r.data, updated_at: r.updated_at })) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/admin/weekly-programs – upsert one program (admin only), body: { school, class, data }
app.put("/api/admin/weekly-programs", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Admin only" });
  const { school, class: classParam, data } = req.body || {};
  const schoolVal = (school != null && String(school).trim()) ? String(school).trim() : null;
  const classVal = (classParam != null && String(classParam).trim()) ? String(classParam).trim() : null;
  if (!schoolVal || !classVal) return res.status(400).json({ error: "school and class required" });
  if (data == null || typeof data !== "object") return res.status(400).json({ error: "data (object) required" });
  try {
    await sql`
      INSERT INTO schulhub_weekly_program (school, class_name, data)
      VALUES (${schoolVal}, ${classVal}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (school, class_name) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
  if (key === "schulhub-about" && !isSuperAdmin(req)) {
    return res.status(403).json({ error: "Super admin only" });
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
