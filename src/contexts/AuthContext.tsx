import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "schulhub-auth-token";
// In dev, webpack DefinePlugin sets process.env.DEV_API_ORIGIN so API calls go to localhost:3001
const API_BASE = process.env.DEV_API_ORIGIN || "";

export interface AuthUser {
  username: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
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
        if (!cancelled) setUser({ username: data.username, role: data.role });
      })
      .catch(() => {
        if (!cancelled) logout();
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
      setUser(u);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "Network error (is the server running?)" };
    }
  }, []);

  const value: AuthContextType = {
    token,
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
