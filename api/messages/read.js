const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const { ensureMessagesTable, markThreadRead } = require("../_messages");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });

  const me = String(payload.sub || "").trim();
  if (!me) return res.status(401).json({ error: "Invalid token" });

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const partner = String(body.partner || "").trim();
  if (!partner) return res.status(400).json({ error: "partner required" });

  try {
    await ensureMessagesTable(sql);
    const marked = await markThreadRead(sql, me, partner);
    return res.status(200).json({ ok: true, marked });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
