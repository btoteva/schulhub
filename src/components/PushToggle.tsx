import React, { useEffect, useState } from "react";
import { FaBell, FaBellSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  isPushSupported,
  getCurrentSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  fetchPublicKey,
} from "../services/pushApi";

const PushToggle: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [supported, setSupported] = useState<boolean>(true);
  const [serverConfigured, setServerConfigured] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [working, setWorking] = useState<boolean>(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const ok = isPushSupported();
    setSupported(ok);
    if (!ok) return;

    let cancelled = false;
    (async () => {
      const [sub, key] = await Promise.all([getCurrentSubscription(), fetchPublicKey()]);
      if (cancelled) return;
      setSubscribed(!!sub);
      setServerConfigured(!!key);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) return null;
  if (!supported) {
    return (
      <p className="text-xs text-slate-500 dark:text-slate-400">
        <FaBellSlash className="mr-1 inline-block" />
        {t.messagesPushNotSupported}
      </p>
    );
  }
  if (!serverConfigured) return null;

  const handleClick = async () => {
    if (working || !token) return;
    setWorking(true);
    setHint(null);
    try {
      if (subscribed) {
        await unsubscribeFromPush(token);
        setSubscribed(false);
      } else {
        const res = await subscribeToPush(token);
        if (res.ok) {
          setSubscribed(true);
        } else {
          setHint(res.error || null);
        }
      }
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={working}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
          subscribed
            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {subscribed ? <FaBell /> : <FaBellSlash />}
        <span>
          {subscribed ? t.messagesPushEnabled : t.messagesEnablePush}
        </span>
      </button>
      {hint && (
        <p className="text-[10px] text-red-500 dark:text-red-400">{hint}</p>
      )}
    </div>
  );
};

export default PushToggle;
