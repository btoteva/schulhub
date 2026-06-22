const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const { ensureMessagesTable, listAllowedContacts } = require("../_messages");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });

  const me = String(payload.sub || "").trim();
  if (!me) return res.status(401).json({ error: "Invalid token" });

  try {
    await ensureMessagesTable(sql);
    const contacts = await listAllowedContacts(sql, me);
    return res.status(200).json({
      contacts: contacts.map((c) => ({
        username: c.username,
        display_name: c.display_name || c.username,
        role: c.role,
        profile_type: c.profile_type ?? null,
        school: c.school ?? null,
        class: c.class_name ?? null,
        gender: c.gender ?? null,
      })),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
