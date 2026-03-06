const { isAdmin } = require("../_auth");
const {
  getSql,
  ensureUserChildrenTable,
  findUserById,
  findUserByEmail,
  listUserChildrenWithGender,
  addUserChild,
  getUserChild,
  updateUserChild,
  deleteUserChild,
} = require("../_users");

async function resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam) {
  const emailVal = childEmailParam != null && String(childEmailParam).trim() ? String(childEmailParam).trim().toLowerCase() : null;
  const usernameVal = studentUsernameParam != null && String(studentUsernameParam).trim() ? String(studentUsernameParam).trim() : null;
  if (emailVal && emailVal.includes("@")) {
    const userByEmail = await findUserByEmail(sql, emailVal);
    return userByEmail ? userByEmail.username : null;
  }
  return usernameVal || null;
}

function getUserId(req) {
  const id = (req.query && req.query.userId) != null ? req.query.userId : (req.body && req.body.userId) != null ? req.body.userId : null;
  if (id == null || id === "") return null;
  const n = parseInt(id, 10);
  return Number.isInteger(n) && n >= 1 ? n : null;
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
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Admin only" });
  }
  const userId = getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "Database not configured" });
  }
  try {
    await ensureUserChildrenTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
  const target = await findUserById(sql, userId);
  if (!target) {
    return res.status(404).json({ error: "User not found" });
  }
  if (req.method === "GET") {
    try {
      const children = await listUserChildrenWithGender(sql, target.username);
      return res.status(200).json({
        children: children.map((c) => ({
          id: c.id,
          child_name: c.child_name,
          school: c.school,
          class: c.class_name,
          student_username: c.student_username ?? null,
          gender: c.student_gender ?? null,
          created_at: c.created_at,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method === "POST") {
    const body = typeof req.body === "object" ? req.body : {};
    const { child_name: childName, school: schoolParam, class: classParam, student_username: studentUsernameParam, child_email: childEmailParam } = body;
    const nameVal = childName != null && String(childName).trim() ? String(childName).trim() : "";
    const schoolVal = (schoolParam != null && String(schoolParam).trim()) ? String(schoolParam).trim() : null;
    const classVal = (classParam != null && String(classParam).trim()) ? String(classParam).trim() : null;
    if (!nameVal) {
      return res.status(400).json({ error: "child_name required" });
    }
    let studentUsernameVal = null;
    try {
      studentUsernameVal = await resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    try {
      const added = await addUserChild(sql, target.username, nameVal, schoolVal, classVal, studentUsernameVal);
      return res.status(201).json({
        id: added.id,
        child_name: added.child_name,
        school: added.school,
        class: added.class_name,
        student_username: added.student_username ?? null,
        created_at: added.created_at,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method === "PATCH") {
    const body = typeof req.body === "object" ? req.body : {};
    const { childId: childIdBody, child_name: childName, student_username: studentUsernameParam, child_email: childEmailParam } = body;
    const cid = (childIdBody != null ? parseInt(childIdBody, 10) : null) || (req.query && req.query.childId != null ? parseInt(req.query.childId, 10) : null);
    if (!cid || !Number.isInteger(cid) || cid < 1) return res.status(400).json({ error: "childId required" });
    try {
      const child = await getUserChild(sql, cid, target.username);
      if (!child) return res.status(404).json({ error: "Child not found" });
      const nameVal = childName != null ? String(childName).trim() : child.child_name;
      let newStudentUsername = undefined;
      if (childEmailParam !== undefined || studentUsernameParam !== undefined) {
        newStudentUsername = await resolveChildAccountToUsername(sql, childEmailParam, studentUsernameParam);
      }
      await updateUserChild(sql, cid, target.username, nameVal, child.school ?? null, child.class_name ?? null, newStudentUsername);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  if (req.method === "DELETE") {
    const childId = (req.query && req.query.childId) != null ? parseInt(req.query.childId, 10) : null;
    if (!childId || !Number.isInteger(childId) || childId < 1) {
      return res.status(400).json({ error: "childId required" });
    }
    try {
      await deleteUserChild(sql, childId, target.username);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
};
