import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCommentDots,
  FaPaperPlane,
  FaSearch,
  FaPlus,
  FaTimes,
  FaUserGraduate,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  fetchContacts,
  fetchThreads,
  Contact,
  Thread,
} from "../services/messagesApi";
import PushToggle from "../components/PushToggle";

function formatRelativeTime(iso: string, language: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return "";
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) {
    return language === "bg" ? "сега" : language === "de" ? "gerade" : "just now";
  }
  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute);
    return `${m} ${language === "bg" ? "мин" : "min"}`;
  }
  if (diffMs < day) {
    const h = Math.floor(diffMs / hour);
    return `${h} ${language === "bg" ? "ч" : language === "de" ? "Std" : "h"}`;
  }
  const days = Math.floor(diffMs / day);
  if (days < 7) {
    return `${days} ${language === "bg" ? "дни" : language === "de" ? "Tg" : "d"}`;
  }
  return date.toLocaleDateString(
    language === "bg" ? "bg-BG" : language === "de" ? "de-DE" : "en-GB",
    { day: "2-digit", month: "2-digit" },
  );
}

function roleLabel(t: ReturnType<typeof useLanguage>["t"], contact: Contact): string {
  if (contact.role === "admin" || contact.role === "superadmin") {
    return t.messagesContactRoleTeacher;
  }
  if (contact.profile_type === "parent") return t.messagesContactRoleParent;
  if (contact.profile_type === "student") return t.messagesContactRoleStudent;
  return "";
}

function ContactIcon({ contact }: { contact: Contact }) {
  if (contact.role === "admin" || contact.role === "superadmin") {
    return <FaUserTie className="text-cyan-500" />;
  }
  if (contact.profile_type === "parent") {
    return <FaUserFriends className="text-amber-500" />;
  }
  return <FaUserGraduate className="text-emerald-500" />;
}

const Messages: React.FC = () => {
  const { t, language } = useLanguage();
  const { token, user, offline } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || offline) return;
    let cancelled = false;
    setLoadingThreads(true);
    fetchThreads(token)
      .then((res) => {
        if (cancelled) return;
        setThreads(res.threads || []);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoadingThreads(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, offline]);

  useEffect(() => {
    if (!pickerOpen || !token || contacts !== null) return;
    let cancelled = false;
    fetchContacts(token)
      .then((res) => {
        if (!cancelled) setContacts(res.contacts || []);
      })
      .catch(() => {
        if (!cancelled) setContacts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pickerOpen, token, contacts]);

  const filteredContacts = useMemo(() => {
    const list = contacts || [];
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = (c.display_name || "").toLowerCase();
      const uname = (c.username || "").toLowerCase();
      return name.includes(q) || uname.includes(q);
    });
  }, [contacts, pickerQuery]);

  const openContact = (username: string) => {
    setPickerOpen(false);
    navigate(`/messages/${encodeURIComponent(username)}`);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-yellow-500 dark:text-slate-300 dark:hover:text-yellow-400"
        >
          <FaArrowLeft />
          {t.back}
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
          <FaCommentDots className="text-blue-500" />
          {t.messages}
        </h1>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 px-3 py-2 text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <FaPlus />
          <span className="hidden sm:inline">{t.messagesNewMessage}</span>
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <PushToggle />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      {loadingThreads ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          {t.messagesLoading}
        </div>
      ) : threads && threads.length > 0 ? (
        <ul className="space-y-2">
          {threads.map((th) => (
            <li key={th.partner}>
              <Link
                to={`/messages/${encodeURIComponent(th.partner)}`}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-base font-bold uppercase text-white">
                  {th.partner.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-bold text-slate-900 dark:text-white">
                      {th.partner}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(th.last_at, language)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="line-clamp-1 truncate text-sm text-slate-600 dark:text-slate-300">
                      {th.last_from_me && (
                        <span className="text-slate-400 dark:text-slate-500">
                          {t.messagesYou}:{" "}
                        </span>
                      )}
                      {th.last_message}
                    </p>
                    {th.unread_count > 0 && (
                      <span className="flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                        {th.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
          <FaCommentDots className="mx-auto mb-3 text-4xl text-slate-300 dark:text-slate-600" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {t.messagesEmpty}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.messagesEmptyHint}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <FaPaperPlane />
            {t.messagesNewMessage}
          </button>
        </div>
      )}

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.messagesSelectContact}
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder={t.messagesSelectRecipient}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {contacts === null ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t.messagesLoading}
                </p>
              ) : filteredContacts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {t.messagesNoContacts}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t.messagesNoContactsHint}
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredContacts.map((c) => (
                    <li key={c.username}>
                      <button
                        type="button"
                        onClick={() => openContact(c.username)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/60"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-700">
                          <ContactIcon contact={c} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {c.display_name}
                          </div>
                          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {roleLabel(t, c)}
                            {c.username !== c.display_name && (
                              <span className="text-slate-400"> · @{c.username}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
