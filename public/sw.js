/* SchulHub service worker
 * - Network-first for navigations (HTML), with offline fallback to cached index.html.
 * - Cache-first (with background refresh) for icons, manifest and static assets.
 * Bump CACHE_VERSION when you want to invalidate previously cached files.
 */

const CACHE_VERSION = "schulhub-v2";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/icon-180.png",
  "/icons/favicon-32.png",
  "/icons/favicon-16.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico" ||
    /\.(?:png|jpg|jpeg|svg|gif|webp|woff2?|ttf|otf)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't intercept cross-origin or API requests.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigation (HTML pages): network-first, fall back to cached index.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put("/index.html", copy))
            .catch(() => undefined);
          return response;
        })
        .catch(() =>
          caches
            .match("/index.html")
            .then((r) => r || new Response("Offline", { status: 503 })),
        ),
    );
    return;
  }

  // Static assets: cache-first, then refresh in background (stale-while-revalidate).
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches
                .open(CACHE_VERSION)
                .then((cache) => cache.put(request, copy))
                .catch(() => undefined);
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      }),
    );
  }
});

// Push notifications for messages
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    try {
      payload = { title: "SchulHub", body: event.data.text() };
    } catch {
      payload = { title: "SchulHub", body: "" };
    }
  }
  const title = payload.title || "SchulHub";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "schulhub-message",
    renotify: true,
    data: { url: payload.url || "/messages" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/messages";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          try {
            const u = new URL(client.url);
            if (u.origin === self.location.origin) {
              client.focus();
              if ("navigate" in client) {
                return client.navigate(targetUrl);
              }
              return client.postMessage({ type: "navigate", url: targetUrl });
            }
          } catch {
            // ignore parse errors
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      }),
  );
});
