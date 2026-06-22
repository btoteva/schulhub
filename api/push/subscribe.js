const { verifyToken } = require("../_auth");
const { getSql } = require("../_users");
const { ensurePushSubscriptionsTable } = require("../_messages");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
    if (!p256dh || !auth) {
      return res.status(400).json({ error: "p256dh and auth required" });
    }

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
};
