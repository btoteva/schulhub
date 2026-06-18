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

// Register PWA service worker in production builds only.
// In development the dev-server (HMR) is incompatible with caching and the SW
// would mask file changes.
if (
  "serviceWorker" in navigator &&
  process.env.NODE_ENV === "production" &&
  window.location.protocol === "https:"
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
  });
}
