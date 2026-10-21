import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTicketById,
  replyToTicket,
} from "../features/support/supportSlice";
import { connectSocket } from "../services/socket"; // ✅ Import socket
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import { formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

const STATUS_STYLE = {
  open: { bg: "#fef3c7", color: "#92400e", label: "Open" },
  in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
  resolved: { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
  closed: { bg: "#e5e7eb", color: "#4b5563", label: "Closed" },
};

const TicketDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { current: ticket, loading } = useSelector((s) => s.support);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(fetchTicketById(id));
  }, [dispatch, id]);

  // ✅ Socket Listener for live updates
  useEffect(() => {
    const socket = connectSocket();

    const handleLiveUpdate = () => {
      dispatch(fetchTicketById(id)); // Refetch when admin replies
    };

    socket.on("ticket:replied", handleLiveUpdate);
    socket.on("ticket:status", handleLiveUpdate);

    return () => {
      socket.off("ticket:replied", handleLiveUpdate);
      socket.off("ticket:status", handleLiveUpdate);
    };
  }, [id, dispatch]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const result = await dispatch(replyToTicket({ id, message: reply.trim() }));
    setSending(false);
    if (replyToTicket.fulfilled.match(result)) {
      setReply("");
      showToast("Reply sent", "success");
    } else {
      showToast(result.payload || "Failed to send reply", "error");
    }
  };

  if (loading && !ticket) {
    return (
      <div
        className="container"
        style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}
      >
        <Skeleton type="text" width="40%" height={30} />
        <div style={{ marginTop: 20 }}>
          <Skeleton type="menuItem" count={3} />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div
        className="container"
        style={{ padding: "60px 20px", maxWidth: 800, margin: "0 auto" }}
      >
        <EmptyState
          icon="🎧"
          title="Ticket not found"
          message="This ticket may have been deleted."
          actionLabel="Back to Support"
          actionLink="/support"
        />
      </div>
    );
  }

  const status = STATUS_STYLE[ticket.status] || STATUS_STYLE.open;

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}
    >
      <Link
        to="/support"
        className="btn-ghost"
        style={{
          marginBottom: 20,
          display: "inline-block",
          textDecoration: "none",
        }}
      >
        ← Back to Support
      </Link>

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
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
                marginBottom: 4,
              }}
            >
              {ticket.ticketNumber}
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              {ticket.subject}
            </h1>
          </div>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: 12,
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
        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
          Opened {formatDate(ticket.createdAt)} ·{" "}
          {ticket.category.replace(/_/g, " ")}
          {ticket.order && (
            <>
              {" "}
              ·{" "}
              <Link
                to={`/orders/${ticket.order._id}`}
                style={{ color: "var(--primary)" }}
              >
                View related order
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {ticket.messages.map((msg, i) => {
          const isAdmin = msg.sender === "admin";
          return (
            <div
              key={i}
              style={{
                background: isAdmin ? "var(--bg-2)" : "var(--primary-light)",
                border: `1px solid ${isAdmin ? "var(--border)" : "rgba(252,128,25,0.2)"}`,
                borderRadius: 12,
                padding: 16,
                maxWidth: "85%",
                alignSelf: isAdmin ? "flex-start" : "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isAdmin ? "var(--text-2)" : "var(--primary)",
                  marginBottom: 6,
                }}
              >
                {isAdmin ? "🎧 Support Team" : "👤 You"}
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--text-3)",
                    marginLeft: 8,
                  }}
                >
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--text)",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {ticket.status !== "closed" && (
        <form
          onSubmit={handleReply}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
            Reply
          </h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your message..."
            rows={4}
            required
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1.5px solid var(--border)",
              fontSize: 14,
              fontFamily: "inherit",
              background: "var(--bg)",
              color: "var(--text)",
              resize: "vertical",
              marginBottom: 12,
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={sending || !reply.trim()}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </form>
      )}

      {ticket.status === "closed" && (
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-2)",
          }}
        >
          This ticket is closed. Need more help?{" "}
          <Link
            to="/orders"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            Open a new ticket from your order
          </Link>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
