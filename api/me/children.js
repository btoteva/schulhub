const { verifyToken } = require("../_auth");
const { getSql, ensureUserChildrenTable, findUserByEmail, listUserChildren, addUserChild, getUserChild, updateUserChild, deleteUserChild } = require("../_users");

async function resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam) {
  const emailVal = childEmailParam != null && String(childEmailParam).trim() ? String(childEmailParam).trim().toLowerCase() : null;
  const usernameVal = studentUsernameParam != null && String(studentUsernameParam).trim() ? String(studentUsernameParam).trim() : null;
  if (emailVal && emailVal.includes("@")) {
    const userByEmail = await findUserByEmail(sql, emailVal);
    return userByEmail ? userByEmail.username : null;
  }
  return usernameVal || null;
}

function getIdParam(req) {
  const id = (req.query && req.query.id) || (req.query && req.query.childId);
  if (id != null && id !== "") {
    const n = parseInt(id, 10);
    if (Number.isInteger(n) && n >= 1) return n;
  }
  return null;
}

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
  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (payload.role === "superadmin") {
    if (req.method === "GET") return res.status(200).json({ children: [] });
    return res.status(403).json({ error: "Not allowed" });
  }
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });
  try {
    await ensureUserChildrenTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  if (req.method === "GET") {
    try {
      const children = await listUserChildren(sql, payload.sub);
      return res.status(200).json({
        children: children.map((c) => ({ id: c.id, child_name: c.child_name, school: c.school, class: c.class_name, student_username: c.student_username ?? null, created_at: c.created_at })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method === "POST") {
    const body = typeof req.body === "object" ? req.body : {};
    const { child_name: childName, school: schoolParam, class: classParam, student_username: studentUsernameParam, child_email: childEmailParam } = body;
    const nameVal = childName != null && String(childName).trim() ? String(childName).trim() : null;
    const schoolVal = (schoolParam != null && String(schoolParam).trim()) ? String(schoolParam).trim() : null;
    const classVal = (classParam != null && String(classParam).trim()) ? String(classParam).trim() : null;
    if (!nameVal) return res.status(400).json({ error: "child_name required" });
    let studentUsernameVal = null;
    try {
      studentUsernameVal = await resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    try {
      const row = await addUserChild(sql, payload.sub, nameVal, schoolVal, classVal, studentUsernameVal);
      return res.status(201).json({ id: row.id, child_name: row.child_name, school: row.school, class: row.class_name, student_username: row.student_username ?? null, created_at: row.created_at });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  const childId = getIdParam(req);
  if (!childId) return res.status(400).json({ error: "id or childId required for PATCH/DELETE" });
  if (req.method === "PATCH") {
    const body = typeof req.body === "object" ? req.body : {};
    const { child_name: childName, school: schoolParam, class: classParam, student_username: studentUsernameParam, child_email: childEmailParam } = body;
    try {
      const child = await getUserChild(sql, childId, payload.sub);
      if (!child) return res.status(404).json({ error: "Child not found" });
      const nameVal = childName != null ? String(childName).trim() : child.child_name;
      const schoolVal = schoolParam !== undefined ? (schoolParam != null && String(schoolParam).trim() ? String(schoolParam).trim() : null) : (child.school ?? null);
      const classVal = classParam !== undefined ? (classParam != null && String(classParam).trim() ? String(classParam).trim() : null) : (child.class_name ?? null);
      let studentUsernameVal = undefined;
      if (childEmailParam !== undefined || studentUsernameParam !== undefined) {
        studentUsernameVal = await resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam);
      }
      await updateUserChild(sql, childId, payload.sub, nameVal, schoolVal, classVal, studentUsernameVal);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method === "DELETE") {
    try {
      const child = await getUserChild(sql, childId, payload.sub);
      if (!child) return res.status(404).json({ error: "Child not found" });
      await deleteUserChild(sql, childId, payload.sub);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
};
