/**
 * ============================================================
 * MODAL — Reusable admin modal
 * ============================================================
 * Props:
 *   isOpen          → bool
 *   onClose         → () => void
 *   children        → modal body
 *   size            → "default" | "large"
 *   className       → extra classes
 *   closeOnBackdrop → bool (default true)
 *   showCloseButton → bool (default true)
 * ============================================================
 */

import { useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  size = "default",
  className = "",
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`admin-modal ${
          size === "large" ? "admin-modal-large" : ""
        } ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
