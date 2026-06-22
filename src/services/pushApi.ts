const API_BASE = process.env.DEV_API_ORIGIN || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function bufToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    typeof Notification !== "undefined"
  );
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function fetchPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/push/public-key`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.publicKey || null;
  } catch {
    return null;
  }
}

export async function subscribeToPush(token: string): Promise<{
  ok: boolean;
  error?: string;
  subscription?: PushSubscription;
}> {
  if (!isPushSupported()) {
    return { ok: false, error: "unsupported" };
  }
  if (!navigator.serviceWorker.controller && !(await navigator.serviceWorker.getRegistration())) {
    return { ok: false, error: "sw-not-registered" };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    return { ok: false, error: "permission-denied" };
  }

  const publicKey = await fetchPublicKey();
  if (!publicKey) {
    return { ok: false, error: "no-server-key" };
  }

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return { ok: false, error: "sw-not-registered" };

  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    try {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    } catch (e) {
      return { ok: false, error: (e as Error).message || "subscribe-failed" };
    }
  }

  const p256dh = bufToBase64(subscription.getKey("p256dh"));
  const auth = bufToBase64(subscription.getKey("auth"));

  try {
    const res = await fetch(`${API_BASE}/api/push/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, subscription };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function unsubscribeFromPush(token: string): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) return { ok: false, error: "unsupported" };
  const sub = await getCurrentSubscription();
  if (!sub) return { ok: true };
  try {
    await fetch(`${API_BASE}/api/push/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    /* ignore */
  }
  try {
    await sub.unsubscribe();
  } catch {
    /* ignore */
  }
  return { ok: true };
}
