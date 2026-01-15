import React, { createContext, useState, useContext, ReactNode } from "react";

export type FontFamily =
  | "roboto"
  | "lexend"
  | "opensans"
  | "lato"
  | "poppins"
  | "nunito"
  | "merriweather"
  | "sourcesans"
  | "atkinson"
  | "comic";
export type FontSize = "small" | "normal" | "large" | "xlarge";

interface FontSettings {
  family: FontFamily;
  size: FontSize;
}

interface FontContextType {
  settings: FontSettings;
  germanSettings: FontSettings;
  setFontFamily: (family: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setGermanFontFamily: (family: FontFamily) => void;
  setGermanFontSize: (size: FontSize) => void;
  getFontSizeValue: () => string;
  getFontFamilyClass: () => string;
  getGermanFontSizeValue: () => string;
  getGermanFontFamilyClass: () => string;
}

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<FontSettings>({
    family: "roboto",
    size: "normal",
  });

  const [germanSettings, setGermanSettings] = useState<FontSettings>({
    family: "roboto",
    size: "normal",
  });

  const setFontFamily = (family: FontFamily) => {
    setSettings((prev) => ({ ...prev, family }));
  };

  const setFontSize = (size: FontSize) => {
    setSettings((prev) => ({ ...prev, size }));
  };

  const setGermanFontFamily = (family: FontFamily) => {
    setGermanSettings((prev) => ({ ...prev, family }));
  };

  const setGermanFontSize = (size: FontSize) => {
    setGermanSettings((prev) => ({ ...prev, size }));
  };

  const getFontSizeValue = (): string => {
    switch (settings.size) {
      case "small":
        return "text-sm";
      case "normal":
        return "text-base";
      case "large":
        return "text-lg";
      case "xlarge":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const getFontFamilyClass = (): string => {
    return `font-${settings.family}`;
  };

  const getGermanFontSizeValue = (): string => {
    switch (germanSettings.size) {
      case "small":
        return "text-sm";
      case "normal":
        return "text-base";
      case "large":
        return "text-lg";
      case "xlarge":
        return "text-xl";
      default:
        return "text-base";
    }
  };

  const getGermanFontFamilyClass = (): string => {
    return `font-${germanSettings.family}`;
  };

  return (
    <FontContext.Provider
      value={{
        settings,
        germanSettings,
        setFontFamily,
        setFontSize,
        setGermanFontFamily,
        setGermanFontSize,
        getFontSizeValue,
        getFontFamilyClass,
        getGermanFontSizeValue,
        getGermanFontFamilyClass,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useFont must be used within FontProvider");
  }
  return context;
};
