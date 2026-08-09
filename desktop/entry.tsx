import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./renderer";
import { I18nProvider } from "../app/i18n/provider";
import "./styles.css";
import "../app/legal/legal.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
