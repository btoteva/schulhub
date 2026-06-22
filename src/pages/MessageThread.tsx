import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  fetchHistory,
  sendMessage,
  MessageItem,
} from "../services/messagesApi";

const POLL_INTERVAL_MS = 10_000;

function formatTime(iso: string, language: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(
    language === "bg" ? "bg-BG" : language === "de" ? "de-DE" : "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  );
}

function formatDateHeader(iso: string, language: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const isSameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isSameDay) {
    return language === "bg" ? "Днес" : language === "de" ? "Heute" : "Today";
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    return language === "bg"
      ? "Вчера"
      : language === "de"
        ? "Gestern"
        : "Yesterday";
  }
  return d.toLocaleDateString(
    language === "bg" ? "bg-BG" : language === "de" ? "de-DE" : "en-GB",
    { day: "2-digit", month: "long", year: "numeric" },
  );
}

const MessageThread: React.FC = () => {
  const { partner: partnerParam } = useParams<{ partner: string }>();
  const partner = (partnerParam || "").trim();
  const { token, user, offline } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const loadHistory = useCallback(async () => {
    const tok = tokenRef.current;
    if (!tok || !partner) return;
    try {
      const res = await fetchHistory(tok, partner);
      setMessages(res.messages || []);
      setError(null);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 403) {
        setError(t.messagesPermissionDenied);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [partner, t.messagesPermissionDenied]);

  useEffect(() => {
    if (!token || !partner || offline) return;
    setLoading(true);
    loadHistory();
  }, [token, partner, offline, loadHistory]);

  useEffect(() => {
    if (!token || !partner || offline || error) return;
    let cancelled = false;
    const id = window.setInterval(() => {
      if (!cancelled && !document.hidden) {
        loadHistory();
      }
    }, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token, partner, offline, error, loadHistory]);

  useEffect(() => {
    if (!listRef.current) return;
    const grew = messages.length > lastCountRef.current;
    lastCountRef.current = messages.length;
    if (grew) {
      const el = listRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || !token || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendMessage(token, partner, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      setDraft("");
    } catch (err) {
      const e2 = err as Error & { status?: number };
      if (e2.status === 403) {
        setError(t.messagesPermissionDenied);
      } else {
        setError(`${t.messagesSendFailed}: ${e2.message}`);
      }
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;
  if (!partner) {
    return <div className="container mx-auto px-4 py-6">Invalid partner</div>;
  }

  let lastDateLabel = "";

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="container mx-auto flex max-w-3xl items-center gap-3">
          <Link
            to="/messages"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200 hover:text-yellow-500 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-yellow-400"
            aria-label={t.messagesBackToList}
            title={t.messagesBackToList}
          >
            <FaArrowLeft />
          </Link>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold uppercase text-white">
            {partner.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-bold text-slate-900 dark:text-white">
              {partner}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4 dark:bg-slate-900"
      >
        <div className="container mx-auto max-w-3xl">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t.messagesLoading}
            </p>
          ) : error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t.messagesNoMessagesYet}
            </p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => {
                const dateLabel = formatDateHeader(m.created_at, language);
                const showDate = dateLabel !== lastDateLabel;
                lastDateLabel = dateLabel;
                return (
                  <React.Fragment key={m.id}>
                    {showDate && (
                      <li className="my-3 flex justify-center">
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {dateLabel}
                        </span>
                      </li>
                    )}
                    <li className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                          m.mine
                            ? "rounded-br-md bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "rounded-bl-md bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {m.body}
                        </p>
                        <p
                          className={`mt-1 text-right text-[10px] ${
                            m.mine ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {formatTime(m.created_at, language)}
                        </p>
                      </div>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-800"
      >
        <div className="container mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t.messagesTypeYourMessage}
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400"
            disabled={!!error && error === t.messagesPermissionDenied}
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending || (error === t.messagesPermissionDenied)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:hover:scale-100"
            aria-label={t.messagesSend}
            title={t.messagesSend}
          >
            <FaPaperPlane className={sending ? "animate-pulse" : ""} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
