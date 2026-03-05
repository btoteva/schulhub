import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const API_BASE = process.env.DEV_API_ORIGIN || "";

type DayItem = {
  time?: string;
  timeFrom?: string;
  timeTo?: string;
  title: string;
  description?: string;
};
type Day = { day: string; dayShort: string; items: DayItem[] };
type WeeklyProgramData = { days: Day[] };

const WeeklyProgram: React.FC = () => {
  const { user, token, loading } = useAuth();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [data, setData] = useState<WeeklyProgramData | null>(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token || !user?.school || !user?.class) {
      setLoadingProgram(false);
      setError(true);
      return;
    }
    setLoadingProgram(true);
    setError(false);
    fetch(`${API_BASE}/api/me/weekly-program`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("No program");
        return res.json();
      })
      .then((d) => {
        setData(d as WeeklyProgramData);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingProgram(false));
  }, [token, user?.school, user?.class]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loadingProgram) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <p className={isLight ? "text-slate-600" : "text-slate-400"}>...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 mb-6 font-semibold ${
              isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
            }`}
          >
            ← {t.home}
          </Link>
          <div className={`rounded-xl border p-6 ${isLight ? "bg-white border-slate-200" : "bg-slate-800 border-slate-700"}`}>
            <h1 className="text-xl font-bold mb-4">{t.weeklyProgramTitle}</h1>
            <p className={isLight ? "text-slate-600" : "text-slate-400"}>{t.weeklyProgramNoData}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-100"}`}>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 mb-6 font-semibold ${
            isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
          }`}
        >
          ← {t.home}
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <FaCalendarAlt className="text-4xl text-amber-500 dark:text-amber-400" />
          <h1 className="text-3xl font-bold">{t.weeklyProgramTitle}</h1>
        </div>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.days.map((d, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden flex flex-col min-w-0 ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-slate-800/60 border-slate-600"
              }`}
            >
              <div className="bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold px-4 py-3 border-b border-slate-200 dark:border-slate-600">
                <span className="hidden sm:inline">{d.day}</span>
                <span className="sm:hidden">{d.dayShort}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[4rem] flex-1">
                {d.items.length === 0 ? (
                  <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-500"}`}>—</p>
                ) : (
                  d.items.map((item, j) => (
                    <div
                      key={j}
                      className={`text-sm border-l-2 border-amber-500/50 pl-2 ${
                        isLight ? "text-slate-900" : "text-slate-300"
                      }`}
                    >
                      <span className={`flex items-center gap-1.5 flex-wrap ${isLight ? "text-amber-700" : "text-amber-200/90"}`}>
                        <span className="font-semibold tabular-nums">{j + 1}.</span>
                        <FaClock className="text-xs shrink-0" />
                        {item.timeFrom && item.timeTo
                          ? (language === "bg" ? `От ${item.timeFrom} до ${item.timeTo}` : item.timeFrom + " – " + item.timeTo)
                          : (item.time ?? "")}
                      </span>
                      <p className={`font-medium mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>{item.title}</p>
                      {item.description ? (
                        <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{item.description}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgram;
