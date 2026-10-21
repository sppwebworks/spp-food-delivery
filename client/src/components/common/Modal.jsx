/**
 * ============================================================
 * MODAL
 * ============================================================
 *
 * Features:
 * - Close on ESC key
 * - Close on backdrop click
 * - Locks body scroll when open
 * - Focus trap friendly
 * ============================================================
 */

import { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  children,
  className = "",
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = originalOverflow;
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
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div ref={modalRef} className={`modal ${className}`}>
        {showCloseButton && (
          <button
            className="icon-btn-sm"
            style={{ position: "absolute", top: 12, right: 12 }}
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
