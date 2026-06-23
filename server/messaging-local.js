import { createRequire } from "module";

const require = createRequire(import.meta.url);
const messagingHandler = require("../api/messaging.js");

const ROUTED_PATHS = [
  ["/api/messages/threads", "threads"],
  ["/api/messages/contacts", "contacts"],
  ["/api/messages/unread-count", "unread-count"],
  ["/api/messages/read", "read"],
  ["/api/messages/spaces/search", "spaces-search"],
  ["/api/messages/spaces/create", "spaces-create"],
  ["/api/messages/spaces/detail", "space-detail"],
  ["/api/messages/spaces/messages", "space-messages"],
  ["/api/messages/spaces/send", "space-send"],
  ["/api/messages/spaces/read", "space-read"],
  ["/api/push/public-key", "push-public-key"],
  ["/api/push/subscribe", "push-subscribe"],
];

async function invokeMessaging(req, res, route) {
  if (route) {
    req.query = { ...req.query, route };
  }
  try {
    await messagingHandler(req, res);
  } catch (e) {
    if (!res.headersSent) {
      res.status(500).json({ error: e.message || "Messaging handler failed" });
    }
  }
}

/** Mount messaging + push routes (same URLs as Vercel rewrites). */
export function mountMessagingRoutes(app) {
  for (const [path, route] of ROUTED_PATHS) {
    app.all(path, (req, res) => invokeMessaging(req, res, route));
  }
  app.all("/api/messages", (req, res) => invokeMessaging(req, res, null));
  app.all("/api/messaging", (req, res) => invokeMessaging(req, res, null));
}
