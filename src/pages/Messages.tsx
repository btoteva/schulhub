import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  fetchContacts,
  fetchThreads,
  createSpace,
  Contact,
  Thread,
} from "../services/messagesApi";
import PushToggle from "../components/PushToggle";

const THREADS_POLL_MS = 20_000;

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
  const [spaceOpen, setSpaceOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaceSearch, setSpaceSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [spaceError, setSpaceError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  const loadThreads = useCallback(
    async (showLoading = false) => {
      if (!token || offline) return;
      if (showLoading) setLoadingThreads(true);
      try {
        const res = await fetchThreads(token);
        setThreads(res.threads || []);
        setError(null);
      } catch (e) {
        if (showLoading) setError((e as Error).message);
      } finally {
        if (showLoading) setLoadingThreads(false);
      }
    },
    [token, offline],
  );

  useEffect(() => {
    if (!token || offline) return;
    loadThreads(true);
  }, [token, offline, loadThreads]);

  useEffect(() => {
    if (!token || offline) return;
    let cancelled = false;
    let timer: number | null = null;

    const schedule = () => {
      if (timer != null) window.clearTimeout(timer);
      const interval = document.hidden ? THREADS_POLL_MS * 4 : THREADS_POLL_MS;
      timer = window.setTimeout(async () => {
        if (!cancelled && !document.hidden) await loadThreads(false);
        if (!cancelled) schedule();
      }, interval);
    };

    schedule();

    const onVisibility = () => {
      if (!document.hidden) loadThreads(false);
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      if (timer != null) window.clearTimeout(timer);
    };
  }, [token, offline, loadThreads]);

  useEffect(() => {
    if (!token || contacts !== null) return;
    if (!pickerOpen && !spaceOpen) return;
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
  }, [pickerOpen, spaceOpen, token, contacts]);

  const filterContactsByQuery = useCallback((list: Contact[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = (c.display_name || "").toLowerCase();
      const uname = (c.username || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      return name.includes(q) || uname.includes(q) || email.includes(q);
    });
  }, []);

  const filteredContacts = useMemo(
    () => filterContactsByQuery(contacts || [], pickerQuery),
    [contacts, pickerQuery, filterContactsByQuery],
  );

  const spaceResultsFiltered = useMemo(() => {
    const q = spaceSearch.trim();
    if (!q) return [];
    return filterContactsByQuery(contacts || [], q).filter(
      (c) => !selectedMembers.some((m) => m.username === c.username),
    );
  }, [contacts, spaceSearch, selectedMembers, filterContactsByQuery]);

  const openContact = (username: string) => {
    setPickerOpen(false);
    navigate(`/messages/${encodeURIComponent(username)}`);
  };

  const addSpaceMember = (c: Contact) => {
    if (selectedMembers.some((m) => m.username === c.username)) return;
    setSelectedMembers((prev) => [...prev, c]);
    setSpaceSearch("");
  };

  const removeSpaceMember = (username: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.username !== username));
  };

  const handleCreateSpace = async () => {
    if (!token || creatingSpace) return;
    const name = spaceName.trim();
    if (!name) return;
    if (selectedMembers.length < 1) {
      setSpaceError(t.messagesSpaceMembersRequired);
      return;
    }
    setCreatingSpace(true);
    setSpaceError(null);
    try {
      const res = await createSpace(
        token,
        name,
        selectedMembers.map((m) => m.username),
      );
      setSpaceOpen(false);
      setSpaceName("");
      setSelectedMembers([]);
      setSpaceSearch("");
      navigate(`/messages/space/${encodeURIComponent(res.space.id)}`);
    } catch (e) {
      setSpaceError((e as Error).message);
    } finally {
      setCreatingSpace(false);
    }
  };

  const threadKey = (th: Thread) =>
    th.type === "space" && th.space_id ? `space-${th.space_id}` : `direct-${th.partner}`;

  const threadLink = (th: Thread) =>
    th.type === "space" && th.space_id
      ? `/messages/space/${encodeURIComponent(th.space_id)}`
      : `/messages/${encodeURIComponent(th.partner || "")}`;

  const threadTitle = (th: Thread) =>
    th.type === "space" && th.space_name ? th.space_name : th.partner || "";

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSpaceOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm transition-transform hover:scale-105 active:scale-95 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200"
          >
            <FaUsers />
            <span className="hidden sm:inline">{t.messagesNewSpace}</span>
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 px-3 py-2 text-sm font-bold text-slate-900 shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <FaPlus />
            <span className="hidden sm:inline">{t.messagesNewMessage}</span>
          </button>
        </div>
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
            <li key={threadKey(th)}>
              <Link
                to={threadLink(th)}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold uppercase text-white ${
                    th.type === "space"
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                      : "bg-gradient-to-br from-blue-400 to-purple-500"
                  }`}
                >
                  {th.type === "space" ? (
                    <FaUsers className="text-sm" />
                  ) : (
                    (th.partner || "").slice(0, 2)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-bold text-slate-900 dark:text-white">
                      {threadTitle(th)}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      {formatRelativeTime(th.last_at, language)}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {th.type === "space" ? t.messagesSpaceType : t.messagesNewMessage}
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

      {spaceOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.messagesNewSpace}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSpaceOpen(false);
                  setSpaceError(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto px-4 py-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t.messagesSpaceName}
                </label>
                <input
                  type="text"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  placeholder={t.messagesSpaceNamePlaceholder}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t.messagesAddByEmail}
                </label>
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={spaceSearch}
                    onChange={(e) => setSpaceSearch(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                {contacts === null && spaceSearch.trim() && (
                  <p className="mt-1 text-xs text-slate-500">{t.messagesLoading}</p>
                )}
                {contacts !== null && spaceSearch.trim() && spaceResultsFiltered.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">{t.messagesNoSearchResults}</p>
                )}
                {spaceResultsFiltered.length > 0 && (
                  <ul className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    {spaceResultsFiltered.map((c) => (
                        <li key={c.username}>
                          <button
                            type="button"
                            onClick={() => addSpaceMember(c)}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {c.display_name}
                              </span>
                              {c.email && (
                                <span className="ml-2 text-xs text-slate-500">{c.email}</span>
                              )}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">
                              {t.messagesAddMember}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              {selectedMembers.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {t.messagesSpaceMembers} ({selectedMembers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((m) => (
                      <span
                        key={m.username}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                      >
                        {m.display_name}
                        <button
                          type="button"
                          onClick={() => removeSpaceMember(m.username)}
                          className="ml-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                          aria-label={t.messagesRemoveMember}
                        >
                          <FaTimes className="text-[10px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {spaceError && (
                <p className="text-sm text-red-600 dark:text-red-400">{spaceError}</p>
              )}
            </div>
            <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
              <button
                type="button"
                onClick={handleCreateSpace}
                disabled={creatingSpace || !spaceName.trim() || selectedMembers.length < 1}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingSpace ? t.messagesCreatingSpace : t.messagesCreateSpace}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
