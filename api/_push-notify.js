/**
 * Fire-and-forget push notification helper.
 * Loaded conditionally from api/messages.js. If env vars or `web-push` are
 * not configured, this module exports a no-op so messaging still works.
 */
const { ensurePushSubscriptionsTable } = require("./_messages");

let webpush = null;
let configured = false;
try {
  if (
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush = require("web-push");
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@schulhub.local",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
    configured = true;
  }
} catch (e) {
  configured = false;
}

async function sendPushToUser(sql, recipientUsername, payload) {
  if (!configured || !webpush) return;
  if (!sql) return;
  try {
    await ensurePushSubscriptionsTable(sql);
  } catch {
    return;
  }
  let subs = [];
  try {
    subs = await sql`
      SELECT id, endpoint, p256dh, auth FROM schulhub_push_subscriptions
      WHERE username = ${recipientUsername}
    `;
  } catch {
    return;
  }
  if (!subs.length) return;

  const body = JSON.stringify({
    title: payload.title || "SchulHub",
    body: payload.body || "",
    url: payload.url || "/messages",
    tag: payload.tag || `msg-${payload.title || ""}`,
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { TTL: 3600 },
        );
      } catch (err) {
        const status = err && err.statusCode;
        if (status === 404 || status === 410) {
          try {
            await sql`DELETE FROM schulhub_push_subscriptions WHERE id = ${sub.id}`;
          } catch {
            /* ignore */
          }
        }
      }
    }),
  );
}

module.exports = sendPushToUser;
