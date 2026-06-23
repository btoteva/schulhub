const { verifyToken } = require("./_auth");
const { getSql, ensureUsersTable, ensureUserChildrenTable, findUserByUsername, getUserChild } = require("./_users");
const {
  ensureMessagesTable,
  ensurePushSubscriptionsTable,
  ensureSpacesTables,
  canMessage,
  listAllowedContacts,
  searchAllowedContacts,
  createSpace,
  getSpaceForMember,
  listSpaceMembers,
  listSpaceMessages,
  insertSpaceMessage,
  markSpaceRead,
  listSpaceMemberUsernames,
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
        type: t.type || "direct",
        partner: t.partner,
        space_id: t.space_id,
        space_name: t.space_name,
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
          email: c.email ?? null,
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

  if (route === "spaces-search") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const q = String((req.query && req.query.q) || "").trim();
    try {
      const results = await searchAllowedContacts(sql, me, q);
      return res.status(200).json({
        contacts: results.map((c) => ({
          username: c.username,
          display_name: c.display_name || c.username,
          email: c.email ?? null,
          profile_type: c.profile_type ?? null,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (route === "spaces-create") {
    setCors(res, "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const name = String(body.name || "").trim();
    const members = Array.isArray(body.members) ? body.members : [];
    try {
      await ensureSpacesTables(sql);
      const result = await createSpace(sql, me, name, members);
      if (result.error) {
        const status = result.error === "not-allowed" ? 403 : 400;
        return res.status(status).json({ error: result.error, username: result.username });
      }
      return res.status(201).json({
        space: {
          id: String(result.space.id),
          name: result.space.name,
          created_by: result.space.created_by,
          created_at: result.space.created_at,
          member_count: result.member_count,
        },
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (route === "space-detail") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const spaceId = parseInt(String((req.query && req.query.spaceId) || ""), 10);
    if (!Number.isInteger(spaceId) || spaceId < 1) {
      return res.status(400).json({ error: "spaceId required" });
    }
    try {
      await ensureSpacesTables(sql);
      const space = await getSpaceForMember(sql, spaceId, me);
      if (!space) return res.status(404).json({ error: "Space not found" });
      const members = await listSpaceMembers(sql, spaceId);
      return res.status(200).json({
        space: {
          id: String(space.id),
          name: space.name,
          created_by: space.created_by,
          created_at: space.created_at,
        },
        members: members.map((m) => ({
          username: m.username,
          display_name: m.display_name || m.username,
          email: m.email ?? null,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (route === "space-messages") {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const spaceId = parseInt(String((req.query && req.query.spaceId) || ""), 10);
    if (!Number.isInteger(spaceId) || spaceId < 1) {
      return res.status(400).json({ error: "spaceId required" });
    }
    try {
      await ensureSpacesTables(sql);
      const space = await getSpaceForMember(sql, spaceId, me);
      if (!space) return res.status(403).json({ error: "Not allowed" });
      const rows = await listSpaceMessages(sql, spaceId, req.query?.limit);
      await markSpaceRead(sql, spaceId, me);
      return res.status(200).json({
        space_id: String(spaceId),
        space_name: space.name,
        messages: rows.map((r) => ({
          id: String(r.id),
          from: r.sender_username,
          body: r.body,
          created_at: r.created_at,
          mine: r.sender_username === me,
        })),
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (route === "space-send") {
    setCors(res, "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const spaceId = parseInt(String(body.space_id || ""), 10);
    const text = String(body.body || "").trim();
    if (!Number.isInteger(spaceId) || spaceId < 1) {
      return res.status(400).json({ error: "space_id required" });
    }
    if (!text) return res.status(400).json({ error: "body required" });
    try {
      await ensureSpacesTables(sql);
      const space = await getSpaceForMember(sql, spaceId, me);
      if (!space) return res.status(403).json({ error: "Not allowed" });
      const msg = await insertSpaceMessage(sql, spaceId, me, text);
      if (!msg) return res.status(400).json({ error: "Empty body" });
      try {
        const pushNotify = require("./_push-notify");
        const recipients = await listSpaceMemberUsernames(sql, spaceId, me);
        if (typeof pushNotify === "function") {
          for (const recipient of recipients) {
            pushNotify(sql, recipient, {
              title: space.name,
              body: `${me}: ${text.slice(0, 120)}`,
              url: `/messages/space/${spaceId}`,
            }).catch(() => undefined);
          }
        }
      } catch {
        /* push optional */
      }
      return res.status(201).json({
        message: {
          id: String(msg.id),
          from: msg.sender_username,
          body: msg.body,
          created_at: msg.created_at,
          mine: true,
        },
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (route === "space-read") {
    setCors(res, "POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const payload = verifyToken(req);
    if (!payload) return res.status(401).json({ error: "Unauthorized" });
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Database not configured" });
    const me = String(payload.sub || "").trim();
    const body = typeof req.body === "object" && req.body ? req.body : {};
    const spaceId = parseInt(String(body.space_id || ""), 10);
    if (!Number.isInteger(spaceId) || spaceId < 1) {
      return res.status(400).json({ error: "space_id required" });
    }
    try {
      await ensureSpacesTables(sql);
      const space = await getSpaceForMember(sql, spaceId, me);
      if (!space) return res.status(403).json({ error: "Not allowed" });
      await markSpaceRead(sql, spaceId, me);
      return res.status(200).json({ ok: true });
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
