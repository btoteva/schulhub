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
  type?: "direct" | "space";
  partner: string | null;
  space_id: string | null;
  space_name: string | null;
  last_message: string;
  last_at: string;
  last_from_me: boolean;
  unread_count: number;
}

export interface Contact {
  username: string;
  display_name: string;
  email?: string | null;
  role: string;
  profile_type: string | null;
  school: string | null;
  class: string | null;
  gender: string | null;
}

export interface SpaceInfo {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface SpaceMember {
  username: string;
  display_name: string;
  email?: string | null;
}

export interface SpaceMessageItem {
  id: string;
  from: string;
  body: string;
  created_at: string;
  mine: boolean;
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

export async function searchSpaceContacts(
  token: string,
  q: string,
): Promise<{ contacts: Contact[] }> {
  const query = encodeURIComponent(q.trim());
  return request(`/api/messages/spaces/search?q=${query}`, token);
}

export async function createSpace(
  token: string,
  name: string,
  members: string[],
): Promise<{ space: SpaceInfo }> {
  return request("/api/messages/spaces/create", token, {
    method: "POST",
    body: JSON.stringify({ name, members }),
  });
}

export async function fetchSpaceDetail(
  token: string,
  spaceId: string,
): Promise<{ space: SpaceInfo; members: SpaceMember[] }> {
  return request(
    `/api/messages/spaces/detail?spaceId=${encodeURIComponent(spaceId)}`,
    token,
  );
}

export async function fetchSpaceMessages(
  token: string,
  spaceId: string,
): Promise<{ space_id: string; space_name: string; messages: SpaceMessageItem[] }> {
  return request(
    `/api/messages/spaces/messages?spaceId=${encodeURIComponent(spaceId)}`,
    token,
  );
}

export async function sendSpaceMessage(
  token: string,
  spaceId: string,
  body: string,
): Promise<{ message: SpaceMessageItem }> {
  return request("/api/messages/spaces/send", token, {
    method: "POST",
    body: JSON.stringify({ space_id: spaceId, body }),
  });
}
