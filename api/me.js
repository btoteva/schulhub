const { verifyToken } = require("./_auth");
const bcrypt = require("bcryptjs");
const { getSql, ensureUsersTable, ensureUserChildrenTable, findUserByUsername, getUserChild, updateUserPassword, updateUserSchoolClass, updateUserProfileType, updateUserGender, getParentInfoForStudent } = require("./_users");

const MIN_PASSWORD_LEN = 6;

async function ensureWeeklyProgramTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS schulhub_weekly_program (
      school TEXT NOT NULL,
      class_name TEXT NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (school, class_name)
    )
  `;
}

function getChildIdFromQuery(req) {
  const id = req.query && req.query.childId;
  if (id != null && id !== "") {
    const n = parseInt(id, 10);
    if (Number.isInteger(n) && n >= 1) return n;
  }
  return null;
}

async function handleWeeklyProgram(req, res, payload) {
  if (payload.role === "superadmin") {
    return res.status(404).json({ error: "No program" });
  }
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    await ensureUsersTable(sql);
    await ensureUserChildrenTable(sql);
    await ensureWeeklyProgramTable(sql);
    let school = null;
    let className = null;
    const childId = getChildIdFromQuery(req);
    if (childId != null) {
      const child = await getUserChild(sql, childId, payload.sub);
      if (!child) return res.status(404).json({ error: "Child not found" });
      if (child.school && child.class_name) {
        school = child.school;
        className = child.class_name;
      } else if (child.student_username) {
        const linkedUser = await findUserByUsername(sql, child.student_username);
        if (linkedUser && linkedUser.school && linkedUser.class_name) {
          school = linkedUser.school;
          className = linkedUser.class_name;
        }
      }
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
    return res.status(200).json(rows[0].data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

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
    if (req.query && req.query.resource === "weekly-program") {
      return handleWeeklyProgram(req, res, payload);
    }
    if (payload.role === "superadmin") {
      return res.status(200).json({
        username: payload.sub,
        role: payload.role,
        profile_type: null,
        school: null,
        class: null,
        gender: null,
      });
    }
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      await ensureUserChildrenTable(sql);
      const parentInfo = await getParentInfoForStudent(sql, user.username);
      return res.status(200).json({
        username: user.username,
        role: user.role,
        profile_type: user.profile_type ?? null,
        school: user.school ?? null,
        class: user.class_name ?? null,
        gender: user.gender ?? null,
        parent_username: parentInfo?.parent_username ?? null,
        parent_gender: parentInfo?.parent_gender ?? null,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  // PATCH – change own password, profile_type, school, class, gender
  const body = typeof req.body === "object" ? req.body : {};
  const { newPassword, profile_type: profileTypeParam, school, class: classParam, gender: genderParam } = body;
  const profileTypeVal = profileTypeParam === "student" || profileTypeParam === "parent" ? profileTypeParam : (profileTypeParam === null || profileTypeParam === "" ? null : undefined);
  const hasProfileType = profileTypeVal !== undefined;
  const genderVal = genderParam === "male" || genderParam === "female" ? genderParam : (genderParam === null || genderParam === "" ? null : undefined);
  const hasGender = genderVal !== undefined;
  const schoolVal = school === undefined ? undefined : (typeof school === "string" ? school.trim() || null : null);
  const classVal = classParam === undefined ? undefined : (typeof classParam === "string" ? classParam.trim() || null : null);
  const hasSchoolClass = schoolVal !== undefined || classVal !== undefined;
  if (hasProfileType && payload.role !== "superadmin") {
    const sql = getSql();
    if (sql) {
      try {
        await ensureUsersTable(sql);
        const user = await findUserByUsername(sql, payload.sub);
        if (user) await updateUserProfileType(sql, user.id, profileTypeVal);
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  }
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
  if (hasGender && payload.role !== "superadmin") {
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    try {
      await ensureUsersTable(sql);
      const user = await findUserByUsername(sql, payload.sub);
      if (!user) return res.status(401).json({ error: "User not found" });
      await updateUserGender(sql, user.id, genderVal ?? null);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(200).json({ ok: true });
};
