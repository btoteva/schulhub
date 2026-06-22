const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const {
  ensureMessagesTable,
  canMessage,
  listMessagesBetween,
  insertMessage,
  markThreadRead,
} = require("../_messages");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Database not configured" });

  try {
    await ensureMessagesTable(sql);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  const me = String(payload.sub || "").trim();
  if (!me) return res.status(401).json({ error: "Invalid token" });

  if (req.method === "GET") {
    const partner = String((req.query && req.query.partner) || "").trim();
    if (!partner) return res.status(400).json({ error: "partner required" });
    try {
      const perm = await canMessage(sql, me, partner);
      if (!perm.allowed) return res.status(403).json({ error: "Not allowed", reason: perm.reason });
      const rows = await listMessagesBetween(sql, me, partner, req.query?.limit);
      try {
        await markThreadRead(sql, me, partner);
      } catch {
        /* best-effort */
      }
      return res.status(200).json({
        partner,
        messages: rows.map((r) => ({
          id: String(r.id),
          from: r.sender_username,
          to: r.recipient_username,
          body: r.body,
          created_at: r.created_at,
          read_at: r.read_at,
          mine: r.sender_username === me,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST: send a message
  try {
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const recipient = String(body.recipient || "").trim();
    const text = String(body.body || "").trim();
    if (!recipient) return res.status(400).json({ error: "recipient required" });
    if (!text) return res.status(400).json({ error: "body required" });

    const perm = await canMessage(sql, me, recipient);
    if (!perm.allowed) return res.status(403).json({ error: "Not allowed", reason: perm.reason });

    const msg = await insertMessage(sql, me, perm.recipient.username, text);
    if (!msg) return res.status(400).json({ error: "Empty body" });

    try {
      const pushNotify = require("../_push-notify");
      if (typeof pushNotify === "function") {
        pushNotify(sql, perm.recipient.username, {
          title: me,
          body: text.slice(0, 140),
          url: `/messages/${encodeURIComponent(me)}`,
        }).catch(() => undefined);
      }
    } catch {
      // _push-notify not configured; skip silently
    }

    return res.status(201).json({
      message: {
        id: String(msg.id),
        from: msg.sender_username,
        to: msg.recipient_username,
        body: msg.body,
        created_at: msg.created_at,
        read_at: msg.read_at,
        mine: true,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
