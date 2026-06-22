const API_BASE = process.env.DEV_API_ORIGIN || "";

export interface MessageItem {
  id: string;
  from: string;
  to: string;
  body: string;
  created_at: string;
  read_at: string | null;
  mine: boolean;
}

export interface Thread {
  partner: string;
  last_message: string;
  last_at: string;
  last_from_me: boolean;
  unread_count: number;
}

export interface Contact {
  username: string;
  display_name: string;
  role: string;
  profile_type: string | null;
  school: string | null;
  class: string | null;
  gender: string | null;
}

interface ApiError extends Error {
  status: number;
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return {};
        }
      })()
    : {};
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`) as ApiError;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function fetchThreads(
  token: string,
): Promise<{ threads: Thread[]; total_unread: number }> {
  return request("/api/messages/threads", token);
}

export async function fetchContacts(token: string): Promise<{ contacts: Contact[] }> {
  return request("/api/messages/contacts", token);
}

export async function fetchUnreadCount(token: string): Promise<{ unread: number }> {
  return request("/api/messages/unread-count", token);
}

export async function fetchHistory(
  token: string,
  partner: string,
): Promise<{ partner: string; messages: MessageItem[] }> {
  return request(
    `/api/messages?partner=${encodeURIComponent(partner)}`,
    token,
  );
}

export async function sendMessage(
  token: string,
  recipient: string,
  body: string,
): Promise<{ message: MessageItem }> {
  return request("/api/messages", token, {
    method: "POST",
    body: JSON.stringify({ recipient, body }),
  });
}

export async function markThreadRead(
  token: string,
  partner: string,
): Promise<{ ok: true; marked: number }> {
  return request("/api/messages/read", token, {
    method: "POST",
    body: JSON.stringify({ partner }),
  });
}
