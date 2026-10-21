/**
 * ============================================================
 * TOAST CONTEXT — Admin notifications
 * ============================================================
 * Usage:
 *   const { showToast } = useToast();
 *   showToast("Restaurant created", "success");
 *   showToast("Failed to save", "error");
 *   showToast("Note", "info");
 *
 * Toast types: "success" | "error" | "info"
 * Auto-dismiss after 2.5s.
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
      const id = Date.now() + Math.random();

      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        // Keep max 4 toasts
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
      <div
        className="admin-toast-container"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`admin-toast admin-toast-${t.type}`}
            onClick={() => removeToast(t.id)}
            role="alert"
          >
            <span className="admin-toast-icon" aria-hidden="true">
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
