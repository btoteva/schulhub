import React, { useState } from "react";
import { useFont, FontFamily, FontSize } from "../contexts/FontContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

const FontSettings: React.FC = () => {
  const {
    settings,
    germanSettings,
    setFontFamily,
    setFontSize,
    setGermanFontFamily,
    setGermanFontSize,
  } = useFont();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [isOpen, setIsOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<"bg" | "de">("bg");

  const fontFamilies: { value: FontFamily; label: string; desc: string }[] = [
    { value: "roboto", label: "Roboto", desc: "Модерен шрифт" },
    { value: "lexend", label: "Lexend", desc: "За дислексия" },
    { value: "atkinson", label: "Atkinson Hyperlegible", desc: "За слабо зрение" },
    { value: "opensans", label: "Open Sans", desc: "Четлив шрифт" },
    { value: "sourcesans", label: "Source Sans", desc: "Adobe шрифт" },
    { value: "nunito", label: "Nunito", desc: "Заоблен шрифт" },
    { value: "lato", label: "Lato", desc: "Топъл шрифт" },
    { value: "poppins", label: "Poppins", desc: "Модерен дизайн" },
    { value: "merriweather", label: "Merriweather", desc: "Сериф шрифт" },
    { value: "comic", label: "Comic Neue", desc: "Неформален стил" },
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: "small", label: t.small },
    { value: "normal", label: t.normal },
    { value: "large", label: t.large },
    { value: "xlarge", label: t.veryLarge },
  ];

  const panelBg = isLight ? "bg-white border-slate-200" : "bg-gray-900 border-gray-700";
  const textMuted = isLight ? "text-slate-600" : "text-gray-400";
  const textMain = isLight ? "text-slate-800" : "text-gray-300";
  const tabInactive = isLight ? "text-slate-500 hover:text-slate-700" : "text-gray-400 hover:text-gray-300";
  const cardBg = isLight ? "bg-slate-100" : "bg-gray-800";
  const cardHover = isLight ? "hover:bg-slate-200" : "hover:bg-gray-700";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 transition-colors flex items-center gap-2 ${
          isLight ? "text-slate-700 hover:text-slate-900" : "text-gray-300 hover:text-white"
        }`}
        title="Настройки на шрифта"
      >
        <span className="text-lg">⚙️</span>
        <span className="text-sm font-semibold">{t.font}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop on mobile: tap outside to close */}
          <div
            className="fixed inset-0 bg-black/40 z-[299] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div
            className={`
            z-[300] mt-2 rounded-xl border p-6 shadow-2xl overflow-y-auto
            fixed left-4 right-4 top-4 max-h-[calc(100dvh-2rem)]
            md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-96 md:max-h-96
          ${panelBg}`}
          >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className={`absolute top-2 right-2 text-2xl ${textMuted} ${isLight ? "hover:text-slate-900" : "hover:text-white"}`}
          >
            ×
          </button>

          <h3 className={`text-lg font-bold mb-4 ${isLight ? "text-green-600" : "text-green-400"}`}>
            {t.fontSettings}
          </h3>

          {/* Language Tabs */}
          <div className={`flex mb-4 border-b ${isLight ? "border-slate-200" : "border-gray-700"}`}>
            <button
              onClick={() => setActiveLanguage("bg")}
              className={`flex-1 py-2 text-sm font-semibold transition-all ${
                activeLanguage === "bg"
                  ? isLight ? "text-green-600 border-b-2 border-green-600" : "text-green-400 border-b-2 border-green-400"
                  : tabInactive
              }`}
            >
              🇧🇬 {t.bulgarian}
            </button>
            <button
              onClick={() => setActiveLanguage("de")}
              className={`flex-1 py-2 text-sm font-semibold transition-all ${
                activeLanguage === "de"
                  ? isLight ? "text-blue-600 border-b-2 border-blue-600" : "text-blue-400 border-b-2 border-blue-400"
                  : tabInactive
              }`}
            >
              🇩🇪 {t.german}
            </button>
          </div>

          {/* Bulgarian Settings */}
          {activeLanguage === "bg" && (
            <>
              <div className="mb-6">
                <h4 className={`text-sm font-semibold mb-2 ${textMain}`}>{t.fontType}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setFontFamily(font.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all font-${font.value} ${
                        settings.family === font.value
                          ? "bg-green-600 text-white"
                          : `${cardBg} ${textMain} ${cardHover}`
                      }`}
                    >
                      <div className="font-semibold">{font.label}</div>
                      <div className="text-xs opacity-75">{font.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className={`text-sm font-semibold mb-2 ${textMain}`}>{t.fontSize}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm ${
                        settings.size === size.value
                          ? "bg-green-600 text-white font-semibold"
                          : `${cardBg} ${textMain} ${cardHover}`
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${isLight ? "border-slate-200" : "border-gray-700"}`}>
                <p className={`text-sm mb-2 ${textMuted}`}>{t.preview}</p>
                <p
                  className={`font-${settings.family} ${
                    settings.size === "small" ? "text-sm" : settings.size === "normal" ? "text-base" : settings.size === "large" ? "text-lg" : "text-xl"
                  } p-3 rounded ${isLight ? "bg-slate-100 text-slate-800" : "bg-gray-800 text-gray-200"}`}
                >
                  Гордост и предубеждение
                </p>
              </div>
            </>
          )}

          {/* German Settings */}
          {activeLanguage === "de" && (
            <>
              <div className="mb-6">
                <h4 className={`text-sm font-semibold mb-2 ${textMain}`}>{t.fontType}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setGermanFontFamily(font.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all font-${font.value} ${
                        germanSettings.family === font.value
                          ? "bg-blue-600 text-white"
                          : `${cardBg} ${textMain} ${cardHover}`
                      }`}
                    >
                      <div className="font-semibold">{font.label}</div>
                      <div className="text-xs opacity-75">{font.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className={`text-sm font-semibold mb-2 ${textMain}`}>{t.fontSize}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setGermanFontSize(size.value)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm ${
                        germanSettings.size === size.value
                          ? "bg-blue-600 text-white font-semibold"
                          : `${cardBg} ${textMain} ${cardHover}`
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t ${isLight ? "border-slate-200" : "border-gray-700"}`}>
                <p className={`text-sm mb-2 ${textMuted}`}>{t.preview}</p>
                <p
                  className={`font-${germanSettings.family} ${
                    germanSettings.size === "small" ? "text-sm" : germanSettings.size === "normal" ? "text-base" : germanSettings.size === "large" ? "text-lg" : "text-xl"
                  } p-3 rounded ${isLight ? "bg-slate-100 text-slate-800" : "bg-gray-800 text-gray-200"}`}
                >
                  Stolz und Vorurteil
                </p>
              </div>
            </>
          )}
          </div>
        </>
      )}
    </div>
  );
};

export default FontSettings;
