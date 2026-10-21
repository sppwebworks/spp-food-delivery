/**
 * ============================================================
 * STATUS SELECT — Custom dropdown for order status
 * ============================================================
 * Props:
 *   value      → current status string
 *   onChange   → (newStatus) => void
 *   options    → array of status strings
 *   disabled   → bool
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  out_for_delivery: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const StatusSelect = ({
  value,
  onChange,
  options = STATUSES,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Esc
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (status) => {
    if (status === value) {
      setOpen(false);
      return;
    }
    onChange(status);
    setOpen(false);
  };

  const currentColor = STATUS_COLORS[value] || "#94a3b8";

  return (
    <div className={`status-select ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className="status-select-btn"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-select-label">
          <span
            className="status-select-option-dot"
            style={{ background: currentColor }}
          />
          {value.replace(/_/g, " ")}
        </span>
        <span className="status-select-arrow">▾</span>
      </button>

      {open && (
        <div className="status-select-menu" role="listbox">
          {options.map((status) => {
            const color = STATUS_COLORS[status] || "#94a3b8";
            const active = status === value;
            return (
              <button
                key={status}
                type="button"
                className={`status-select-option ${active ? "active" : ""}`}
                onClick={() => handleSelect(status)}
                role="option"
                aria-selected={active}
              >
                <span
                  className="status-select-option-dot"
                  style={{ background: color }}
                />
                <span>{status.replace(/_/g, " ")}</span>
                {active && <span className="status-select-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusSelect;
