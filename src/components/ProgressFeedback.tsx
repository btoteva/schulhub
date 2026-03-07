import React from "react";

type Props = {
  isLoading: boolean;
  savedText: string | null;
  isLight: boolean;
  language: string;
};

export const ProgressFeedback: React.FC<Props> = ({ isLoading, savedText, isLight, language }) => {
  if (!isLoading && !savedText) return null;
  const loadingMsg = language === "bg" ? "Зарежда…" : language === "de" ? "Lade…" : "Loading…";
  return (
    <div
      className={`mb-4 px-3 py-2 rounded-lg text-base font-medium ${
        isLight ? "bg-white/90 text-slate-800 shadow-sm" : "bg-black/50 text-white"
      }`}
    >
      {isLoading && <span>{loadingMsg}</span>}
      {savedText && (
        <span className={isLight ? "text-emerald-700" : "text-emerald-300"}>{savedText}</span>
      )}
    </div>
  );
};

export default ProgressFeedback;
