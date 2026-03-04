/**
 * User-scoped progress: load/save only when user is logged in (token provided).
 * Used for DSD test answers, lesson exercise progress, podcast listened list.
 */

const API_BASE = process.env.DEV_API_ORIGIN || "";

export async function getUserProgress(key: string, token: string): Promise<unknown> {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/api/me/progress?key=${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (data == null) return null;
    let val = data.value;
    if (val === undefined) return null;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {
        return null;
      }
    }
    return val;
  } catch {
    return null;
  }
}

export async function setUserProgress(key: string, value: unknown, token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE}/api/me/progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ key, value }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
