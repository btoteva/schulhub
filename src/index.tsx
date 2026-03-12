import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { FontProvider } from "./contexts/FontContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider, getInitialTheme, applyThemeToDocument } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AudioVolumeProvider } from "./contexts/AudioVolumeContext";

// Apply saved theme before first paint so background is correct immediately
applyThemeToDocument(getInitialTheme());

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AudioVolumeProvider>
            <FontProvider>
              <App />
            </FontProvider>
          </AudioVolumeProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
