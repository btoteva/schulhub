const { verifyToken } = require("../_auth");
const { getSql, ensureUsersTable, ensureUserChildrenTable, findUserByUsername, getUserChild } = require("../_users");

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

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized" });
  }
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
    res.status(200).json(rows[0].data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
