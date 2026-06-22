const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const { ensureMessagesTable, listThreads, countUnread } = require("../_messages");

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
    const [threads, unread] = await Promise.all([listThreads(sql, me), countUnread(sql, me)]);
    return res.status(200).json({
      threads: threads.map((t) => ({
        partner: t.partner,
        last_message: t.last_message,
        last_at: t.last_at,
        last_from_me: !!t.last_from_me,
        unread_count: t.unread_count || 0,
      })),
      total_unread: unread || 0,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
