import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { FontProvider } from "./contexts/FontContext";
import { LanguageProvider } from "./contexts/LanguageContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <FontProvider>
        <App />
      </FontProvider>
    </LanguageProvider>
  </React.StrictMode>
);
