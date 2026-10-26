import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

declare global {
  interface Window {
    BALIGO_APP?: { scope?: "admin" | "agent"; initialRoute?: string; version?: string; demo?: boolean };
  }
}

// WP-admin submenus deep-link into the SPA via initialRoute.
if (!window.location.hash && window.BALIGO_APP?.initialRoute) {
  window.location.hash = window.BALIGO_APP.initialRoute;
}

ReactDOM.createRoot(document.getElementById("baligo-app-root") ?? document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
