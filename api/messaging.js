const { verifyToken } = require("./_auth");
const { getSql, ensureUsersTable, ensureUserChildrenTable, findUserByUsername, getUserChild } = require("./_users");
const {
  ensureMessagesTable,
  ensurePushSubscriptionsTable,
  canMessage,
  listAllowedContacts,
  listThreads,
  listMessagesBetween,
  insertMessage,
  markThreadRead,
  countUnread,
} = require("./_messages");

function setCors(res, methods) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function routeName(req) {
  return String((req.query && req.query.route) || "").trim();
}

module.exports = async function handler(req, res) {
  const route = routeName(req);

  if (route === "push-public-key") {
    setCors(res, "GET, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const key = process.env.VAPID_PUBLIC_KEY || null;
    return res.status(200).json({ publicKey: key, configured: !!key });
  }

  if (route === "push-subscribe") {
    setCors(res, "POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST" && req.method !== "DELETE") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    if (!me) return res.status(401).json({ error: "Invalid token" });
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const endpoint = String(body.endpoint || "").trim();
    if (!endpoint) return res.status(400).json({ error: "endpoint required" });
    try {
      await ensurePushSubscriptionsTable(sql);
      if (req.method === "DELETE") {
        await sql`
          DELETE FROM schulhub_push_subscriptions
          WHERE endpoint = ${endpoint} AND username = ${me}
        `;
        return res.status(200).json({ ok: true });
      }
      const p256dh = String(body.p256dh || "").trim();
      const auth = String(body.auth || "").trim();
      const userAgent = typeof body.user_agent === "string" ? body.user_agent.slice(0, 500) : null;
      if (!p256dh || !auth) return res.status(400).json({ error: "p256dh and auth required" });
      await sql`
        INSERT INTO schulhub_push_subscriptions (username, endpoint, p256dh, auth, user_agent)
        VALUES (${me}, ${endpoint}, ${p256dh}, ${auth}, ${userAgent})
        ON CONFLICT (endpoint) DO UPDATE
          SET username = EXCLUDED.username,
              p256dh = EXCLUDED.p256dh,
              auth = EXCLUDED.auth,
              user_agent = EXCLUDED.user_agent
      `;
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  setCors(res, "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (route === "threads") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
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
  }

  if (route === "contacts") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
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
  }

  if (route === "read") {
    setCors(res, "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
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
  }

  if (route === "unread-count") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    try {
      await ensureMessagesTable(sql);
      const n = await countUnread(sql, me);
      return res.status(200).json({ unread: n });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Default: GET history (?partner=) or POST send
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
      const pushNotify = require("./_push-notify");
      if (typeof pushNotify === "function") {
        pushNotify(sql, perm.recipient.username, {
          title: me,
          body: text.slice(0, 140),
          url: `/messages/${encodeURIComponent(me)}`,
        }).catch(() => undefined);
      }
    } catch {
      /* push optional */
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
