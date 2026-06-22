import { useEffect, useState, useRef, useCallback } from "react";
import { fetchUnreadCount } from "../services/messagesApi";
import { useAuth } from "../contexts/AuthContext";

const POLL_INTERVAL_MS = 15_000;

/**
 * Polls the unread message count for the current user.
 * - Skips polling when offline or no token
 * - Slows down to once per 60s when the tab is hidden (saves battery)
 * - Exposes a manual refresh()
 */
export function useUnreadCount() {
  const { token, offline } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loaded, setLoaded] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const refresh = useCallback(async () => {
    const t = tokenRef.current;
    if (!t || offline) return;
    try {
      const res = await fetchUnreadCount(t);
      setCount(Math.max(0, res.unread || 0));
      setLoaded(true);
    } catch {
      // ignore network errors silently
    }
  }, [offline]);

  useEffect(() => {
    if (!token || offline) {
      setCount(0);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await refresh();
    };

    const schedule = () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
      const interval = document.hidden ? POLL_INTERVAL_MS * 4 : POLL_INTERVAL_MS;
      timerRef.current = window.setTimeout(async () => {
        await tick();
        schedule();
      }, interval);
    };

    tick();
    schedule();

    const onVisibilityChange = () => {
      if (!document.hidden) {
        tick();
      }
      schedule();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [token, offline, refresh]);

  return { count, loaded, refresh };
}
