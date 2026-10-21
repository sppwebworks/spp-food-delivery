/**
 * ============================================================
 * TOAST CONTEXT
 * ============================================================
 *
 * Global toast notifications.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast("Added to cart", "success");
 *   showToast("Failed to save", "error");
 *   showToast("Note", "info");      // default
 *
 * Types: "success" | "error" | "info"
 * Auto-dismiss after 2.5s. Click to dismiss early.
 * ============================================================
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ToastContext = createContext();

const ICONS = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 2500) => {
      if (!message) return;

      // Limit concurrent toasts to 4
      const id = Date.now() + Math.random();
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.length > 4 ? next.slice(next.length - 4) : next;
      });

      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            <span className="toast-icon" aria-hidden="true">
              {ICONS[t.type] || ICONS.info}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

export default ToastContext;
