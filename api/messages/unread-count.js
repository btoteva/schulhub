const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const { ensureMessagesTable, countUnread } = require("../_messages");

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
    const n = await countUnread(sql, me);
    return res.status(200).json({ unread: n });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
