import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "schulhub-auth-token";
// In dev, webpack DefinePlugin sets process.env.DEV_API_ORIGIN so API calls go to localhost:3001
const API_BASE = process.env.DEV_API_ORIGIN || "";

export interface AuthUser {
  username: string;
  role: string;
  profile_type?: string | null;
  school?: string | null;
  class?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  offline: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
   const [offline, setOffline] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refetchUser = useCallback(async () => {
    const t = token;
    if (!t) return;
    try {
      const res = await fetch(`${API_BASE}/api/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (!res.ok) return;
      const data = await res.json();
      setUser({
        username: data.username,
        role: data.role,
        profile_type: data.profile_type ?? null,
        school: data.school ?? null,
        class: data.class ?? null,
      });
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      // When not logged in, detect if server is available so we can hide Login in offline mode
      let cancelled = false;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      fetch(`${API_BASE}/api/health`, { signal: controller.signal })
        .then((res) => {
          clearTimeout(timeoutId);
          if (!cancelled) setOffline(!res.ok);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          if (!cancelled) setOffline(true);
        });
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        controller.abort();
      };
    }
    let cancelled = false;
    fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setUser({
            username: data.username,
            role: data.role,
            profile_type: data.profile_type ?? null,
            school: data.school ?? null,
            class: data.class ?? null,
          });
          setOffline(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = (e as Error).message || "";
        if (msg === "Invalid token") {
          logout();
        } else {
          // Network or server unavailable – enter offline mode but keep UI usable
          setOffline(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
      if (!res.ok) {
        const msg = data.error || (res.status === 401 ? "Invalid credentials" : res.status === 503 ? "Login not configured" : `Error ${res.status}`);
        return { ok: false, error: msg };
      }
      const t = data.token;
      const u = data.user;
      if (!t || !u) return { ok: false, error: "Invalid response" };
      localStorage.setItem(STORAGE_KEY, t);
      setToken(t);
      setUser({
        username: u.username,
        role: u.role,
        profile_type: u.profile_type ?? null,
        school: u.school ?? null,
        class: u.class ?? null,
      });
      setOffline(false);
      return { ok: true };
    } catch (e) {
      setOffline(true);
      return { ok: false, error: (e as Error).message || "Network error (is the server running?)" };
    }
  }, []);

  const value: AuthContextType = {
    token,
    user,
    loading,
    offline,
    login,
    logout,
    refetchUser,
    isAdmin: user?.role === "admin" || user?.role === "superadmin",
    isSuperAdmin: user?.role === "superadmin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
