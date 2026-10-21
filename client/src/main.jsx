/**
 * ============================================================
 * MAIN — React 19 entry point
 * ============================================================
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { store } from "./app/store";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { LocationProvider } from "./context/LocationContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import App from "./App";
import "./index.css";

// ✅ EXPOSE STORE FOR DEBUGGING (fixes the "window.store is undefined" issue)
if (typeof window !== "undefined") window.store = store;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <LocationProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </LocationProvider>
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
