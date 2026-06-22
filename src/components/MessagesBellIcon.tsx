import React from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUnreadCount } from "../hooks/useUnreadCount";

interface Props {
  size?: "sm" | "md";
}

const MessagesBellIcon: React.FC<Props> = ({ size = "md" }) => {
  const { user, offline } = useAuth();
  const { t } = useLanguage();
  const { count } = useUnreadCount();

  if (!user || offline) return null;

  const iconSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";
  const containerPadding = size === "sm" ? "p-2" : "p-2";

  return (
    <Link
      to="/messages"
      className={`relative ${containerPadding} rounded-lg text-slate-600 hover:text-blue-500 hover:bg-slate-200 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-slate-700 transition-colors`}
      aria-label={t.messages}
      title={t.messages}
    >
      <FaBell className={iconSize} />
      {count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-md ring-2 ring-white dark:ring-slate-800"
          aria-label={`${count} ${t.messagesUnreadCount}`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default MessagesBellIcon;
