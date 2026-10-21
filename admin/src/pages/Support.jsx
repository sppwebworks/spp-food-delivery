import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";
import { connectSocket } from "../services/socket";

const STATUS_STYLE = {
  open: { bg: "#fef3c7", color: "#92400e", label: "Open" },
  in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
  resolved: { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
  closed: { bg: "#e5e7eb", color: "#4b5563", label: "Closed" },
};

const AdminSupport = () => {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ Use ref to track the currently selected ticket ID without triggering re-renders
  const activeTicketIdRef = useRef(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const url = statusFilter
        ? `/admin/support?status=${statusFilter}`
        : "/admin/support";
      const { data } = await api.get(url);
      setTickets(data.tickets || []);
    } catch (err) {
      if (!silent)
        showToast(
          err.response?.data?.message || "Failed to load tickets",
          "error",
        );
    } finally {
      setLoading(false);
    }
  };

  // Load initial tickets
  useEffect(() => {
    load();
  }, [statusFilter]);

  // ✅ Setup Socket Listeners ONCE
  useEffect(() => {
    const socket = connectSocket();

    const handleNewTicket = () => {
      showToast("New support ticket received!", "info");
      load(true);
    };

    const handleCustomerReply = (data) => {
      load(true); // Refresh the list silently

      // If the admin is currently viewing this specific ticket, refresh the chat
      if (activeTicketIdRef.current === data.ticketId) {
        api
          .get(`/admin/support/${data.ticketId}`)
          .then((res) => setSelected(res.data));
      }
    };

    // Bind listeners
    socket.on("ticket:created", handleNewTicket);
    socket.on("ticket:replied", handleCustomerReply);

    // Cleanup
    return () => {
      socket.off("ticket:created", handleNewTicket);
      socket.off("ticket:replied", handleCustomerReply);
    };
  }, []); // Empty dependency array = setup only once

  const openTicket = async (id) => {
    activeTicketIdRef.current = id; // Track the ID
    try {
      const { data } = await api.get(`/admin/support/${id}`);
      setSelected(data);
    } catch {
      showToast("Failed to load ticket", "error");
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/admin/support/${selected._id}/reply`, {
        message: reply.trim(),
      });
      setSelected(data.ticket);
      setReply("");
      showToast("Reply sent", "success");
      load(true);
    } catch {
      showToast("Failed to reply", "error");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status) => {
    try {
      const { data } = await api.put(`/admin/support/${selected._id}/status`, {
        status,
      });
      setSelected(data.ticket);
      showToast(`Status updated to ${status}`, "success");
      load(true);
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", gap: 24 }}>
      {/* LEFT PANEL: TICKET LIST */}
      <div
        style={{
          width: 380,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          border: "1px solid #e9e9eb",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e9e9eb",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: "0 0 16px 0",
              color: "#282c3f",
            }}
          >
            🎧 Support Inbox
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["", "open", "in_progress", "resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  border: "1px solid",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderColor: statusFilter === s ? "#fc8019" : "#e9e9eb",
                  background:
                    statusFilter === s
                      ? "rgba(252, 128, 25, 0.1)"
                      : "transparent",
                  color: statusFilter === s ? "#fc8019" : "#686b78",
                }}
              >
                {s ? s.replace(/_/g, " ") : "All"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#93959f" }}>
              Loading...
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#93959f" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>No tickets
              found.
            </div>
          ) : (
            tickets.map((t) => {
              const status = STATUS_STYLE[t.status] || STATUS_STYLE.open;
              const isSelected = selected?._id === t._id;
              return (
                <button
                  key={t._id}
                  onClick={() => openTicket(t._id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "16px 20px",
                    border: "none",
                    borderBottom: "1px solid #e9e9eb",
                    background: isSelected
                      ? "rgba(252, 128, 25, 0.05)"
                      : "#fff",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    gap: 14,
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background: "#f0f0f5",
                      color: "#686b78",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(t.user?.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#282c3f",
                        }}
                      >
                        {t.user?.name || "User"}
                      </span>
                      <span style={{ fontSize: 12, color: "#93959f" }}>
                        {formatDate(t.createdAt).split(",")[0]}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isSelected ? "#fc8019" : "#282c3f",
                        marginBottom: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t.subject}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#93959f",
                          fontWeight: 600,
                        }}
                      >
                        {t.ticketNumber}
                      </span>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 10,
                          background: status.bg,
                          color: status.color,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANEL: CHAT */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          border: "1px solid #e9e9eb",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          overflow: "hidden",
        }}
      >
        {selected ? (
          <>
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e9e9eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#282c3f",
                    margin: "0 0 4px 0",
                  }}
                >
                  {selected.subject}
                </h3>
                <div style={{ fontSize: 13, color: "#93959f" }}>
                  {selected.ticketNumber} · {selected.user?.name} (
                  {selected.user?.email})
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {["open", "in_progress", "resolved", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "1px solid",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      borderColor:
                        selected.status === s ? "#fc8019" : "#e9e9eb",
                      background: selected.status === s ? "#fc8019" : "#fff",
                      color: selected.status === s ? "#fff" : "#686b78",
                      textTransform: "capitalize",
                    }}
                  >
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 24,
                background: "#f9f9f9",
              }}
            >
              {selected.messages.map((m, i) => {
                const isAdmin = m.sender === "admin";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: isAdmin ? "row-reverse" : "row",
                      gap: 12,
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: isAdmin ? "#fc8019" : "#f0f0f5",
                        color: isAdmin ? "#fff" : "#686b78",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {isAdmin ? "A" : getInitials(selected.user?.name)}
                    </div>
                    <div
                      style={{
                        maxWidth: "70%",
                        background: "#fff",
                        border: `1px solid ${isAdmin ? "rgba(252,128,25,0.3)" : "#e9e9eb"}`,
                        padding: "14px 18px",
                        borderRadius: 16,
                        borderBottomRightRadius: isAdmin ? 4 : 16,
                        borderBottomLeftRadius: isAdmin ? 16 : 4,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isAdmin ? "#fc8019" : "#93959f",
                          marginBottom: 6,
                          textAlign: isAdmin ? "right" : "left",
                        }}
                      >
                        {isAdmin ? "You" : selected.user?.name} ·{" "}
                        {formatDate(m.createdAt).split(",")[1]}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: "#282c3f",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                padding: 20,
                borderTop: "1px solid #e9e9eb",
                background: "#fff",
              }}
            >
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                rows={3}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 10,
                  border: "1.5px solid #e9e9eb",
                  fontFamily: "inherit",
                  fontSize: 14,
                  resize: "none",
                  outline: "none",
                  marginBottom: 12,
                  color: "#282c3f",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#fc8019")}
                onBlur={(e) => (e.target.style.borderColor = "#e9e9eb")}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="btn-primary"
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    fontWeight: 700,
                    background: "#fc8019",
                    color: "#fff",
                    border: "none",
                    cursor: reply.trim() ? "pointer" : "not-allowed",
                    opacity: reply.trim() ? 1 : 0.5,
                  }}
                >
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#93959f",
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.3 }}>
              💬
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#282c3f",
                marginBottom: 8,
              }}
            >
              No ticket selected
            </h3>
            <p style={{ fontSize: 15 }}>
              Choose a ticket from the left to view the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;
