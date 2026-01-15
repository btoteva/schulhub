import React, { useState } from "react";
import { useFont, FontFamily, FontSize } from "../contexts/FontContext";

const FontSettings: React.FC = () => {
  const {
    settings,
    germanSettings,
    setFontFamily,
    setFontSize,
    setGermanFontFamily,
    setGermanFontSize,
  } = useFont();
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
    { value: "small", label: "Малък" },
    { value: "normal", label: "Нормален" },
    { value: "large", label: "Голям" },
    { value: "xlarge", label: "Много голям" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
        title="Настройки на шрифта"
      >
        <span className="text-lg">⚙️</span>
        <span className="text-sm font-semibold">Шрифт</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 z-[300]">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>

          <h3 className="text-lg font-bold text-green-400 mb-4">
            Настройки на шрифта
          </h3>

          {/* Language Tabs */}
          <div className="flex mb-4 border-b border-gray-700">
            <button
              onClick={() => setActiveLanguage("bg")}
              className={`flex-1 py-2 text-sm font-semibold transition-all ${
                activeLanguage === "bg"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              🇧🇬 Български
            </button>
            <button
              onClick={() => setActiveLanguage("de")}
              className={`flex-1 py-2 text-sm font-semibold transition-all ${
                activeLanguage === "de"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              🇩🇪 Немски
            </button>
          </div>

          {/* Bulgarian Settings */}
          {activeLanguage === "bg" && (
            <>
              {/* Font Family Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Тип на шрифта:
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setFontFamily(font.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all font-${font.value} ${
                        settings.family === font.value
                          ? "bg-green-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="font-semibold">{font.label}</div>
                      <div className="text-xs opacity-75">{font.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selection */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Размер на шрифта:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm ${
                        settings.size === size.value
                          ? "bg-green-600 text-white font-semibold"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Преглед:</p>
                <p
                  className={`font-${settings.family} ${
                    settings.size === "small"
                      ? "text-sm"
                      : settings.size === "normal"
                      ? "text-base"
                      : settings.size === "large"
                      ? "text-lg"
                      : "text-xl"
                  } p-3 bg-gray-800 rounded text-gray-200`}
                >
                  Гордост и предубеждение
                </p>
              </div>
            </>
          )}

          {/* German Settings */}
          {activeLanguage === "de" && (
            <>
              {/* Font Family Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Тип на шрифта:
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {fontFamilies.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => setGermanFontFamily(font.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all font-${font.value} ${
                        germanSettings.family === font.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="font-semibold">{font.label}</div>
                      <div className="text-xs opacity-75">{font.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Selection */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">
                  Размер на шрифта:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setGermanFontSize(size.value)}
                      className={`px-3 py-2 rounded-lg transition-all text-sm ${
                        germanSettings.size === size.value
                          ? "bg-blue-600 text-white font-semibold"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Преглед:</p>
                <p
                  className={`font-${germanSettings.family} ${
                    germanSettings.size === "small"
                      ? "text-sm"
                      : germanSettings.size === "normal"
                      ? "text-base"
                      : germanSettings.size === "large"
                      ? "text-lg"
                      : "text-xl"
                  } p-3 bg-gray-800 rounded text-gray-200`}
                >
                  Stolz und Vorurteil
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FontSettings;
