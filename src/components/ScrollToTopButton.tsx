import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const ScrollToTopButton: React.FC = () => {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label = language === "bg" ? "Нагоре" : language === "de" ? "Nach oben" : "To top";

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
      title={label}
      aria-label={label}
    >
      <FaArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
