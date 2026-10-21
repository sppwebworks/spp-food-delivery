/**
 * ============================================================
 * EMPTY STATE
 * ============================================================
 *
 * Usage:
 *   <EmptyState
 *     icon="📦"
 *     title="No orders yet"
 *     message="Order something delicious!"
 *     actionLabel="Browse Restaurants"
 *     actionLink="/"
 *   />
 *
 * Or with a callback:
 *   <EmptyState
 *     icon="🛒"
 *     title="Your cart is empty"
 *     message="Add items to get started"
 *     actionLabel="View Restaurants"
 *     onAction={() => navigate("/")}
 *   />
 * ============================================================
 */

import { Link } from "react-router-dom";

const EmptyState = ({
  icon = "📭",
  title = "Nothing here yet",
  message = "",
  actionLabel = "",
  actionLink = "",
  onAction = null,
  compact = false,
}) => {
  return (
    <div
      className="empty-state"
      style={compact ? { padding: "24px 12px", gap: 8 } : {}}
    >
      <div
        className="empty-emoji"
        style={compact ? { fontSize: 40 } : {}}
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3>{title}</h3>

      {message && <p style={{ maxWidth: 320 }}>{message}</p>}

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary" style={{ marginTop: 8 }}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          className="btn-primary"
          onClick={onAction}
          style={{ marginTop: 8 }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
