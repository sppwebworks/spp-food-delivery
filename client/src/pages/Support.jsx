/**
 * ============================================================
 * CUSTOMER SUPPORT PAGE (/support)
 * ============================================================
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyTickets } from "../features/support/supportSlice";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import { formatDate } from "../utils/format";

const STATUS_STYLE = {
  open: { bg: "#fef3c7", color: "#92400e", label: "Open" },
  in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
  resolved: { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
  closed: { bg: "#e5e7eb", color: "#4b5563", label: "Closed" },
};

const Support = () => {
  const dispatch = useDispatch();
  const { tickets, loading } = useSelector((s) => s.support);

  useEffect(() => {
    dispatch(fetchMyTickets());
  }, [dispatch]);

  if (loading && tickets.length === 0) {
    return (
      <div
        className="container"
        style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}
      >
        <Skeleton type="text" width="30%" height={30} />
        <div style={{ marginTop: 20 }}>
          <Skeleton type="menuItem" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          🎧 Support Center
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 15 }}>
          View your support tickets and chat with our team.
        </p>
      </div>

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No support tickets"
          message="You haven't opened any support tickets yet. If you need help with an order, go to your orders and click 'Get Help'."
          actionLabel="Go to My Orders"
          actionLink="/orders"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tickets.map((ticket) => {
            const status = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;
            const lastMessage = ticket.messages[ticket.messages.length - 1];

            return (
              <Link
                key={ticket._id}
                to={`/support/${ticket._id}`}
                style={{
                  display: "block",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                  textDecoration: "none",
                  color: "inherit",
                  transition:
                    "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-3)",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {ticket.ticketNumber} ·{" "}
                      {ticket.category.replace(/_/g, " ")}
                    </div>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: 0,
                      }}
                    >
                      {ticket.subject}
                    </h3>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: status.bg,
                      color: status.color,
                      whiteSpace: "nowrap",
                      textTransform: "uppercase",
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Last Message Preview */}
                {lastMessage && (
                  <div
                    style={{
                      background: "var(--bg-2)",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 12,
                      fontSize: 13,
                      color: "var(--text-2)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <strong style={{ color: "var(--text)", fontWeight: 600 }}>
                      {lastMessage.sender === "admin" ? "Support Team" : "You"}:
                    </strong>{" "}
                    {lastMessage.message}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 12,
                    color: "var(--text-3)",
                  }}
                >
                  <span>Opened {formatDate(ticket.createdAt)}</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>
                    View Conversation →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Support;
