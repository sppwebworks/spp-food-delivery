/**
 * ============================================================
 * ADMIN ORDERS — Live Socket + Toast
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchAdminOrders,
  updateOrderStatus,
} from "../features/orders/adminOrdersSlice";
import StatusSelect from "../components/StatusSelect";
import { formatCurrency, formatDate } from "../utils/format";
import { connectSocket } from "../services/socket";
import { useToast } from "../context/ToastContext";

const STATUSES = [
  { key: "all", label: "All", icon: "📋" },
  { key: "pending", label: "Pending", icon: "⏳" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "out_for_delivery", label: "On the Way", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
  { key: "cancelled", label: "Cancelled", icon: "❌" },
];

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  confirmed: { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
  preparing: { bg: "#ede9fe", text: "#6d28d9", dot: "#8b5cf6" },
  out_for_delivery: { bg: "#cffafe", text: "#155e75", dot: "#06b6d4" },
  delivered: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

const Orders = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { items, loading, error, total } = useSelector((s) => s.adminOrders);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // 1. Initial fetch
  useEffect(() => {
    dispatch(fetchAdminOrders({ limit: 100 }));
  }, [dispatch]);

  // 2. ✅ Socket Listener
  useEffect(() => {
    const socket = connectSocket();

    const handleNewOrder = (data) => {
      console.log("🔔 LIVE ORDER RECEIVED:", data); // ✅ Debug log

      // Defensive: fallback strings in case payload is missing fields
      const name = data.customerName || "A customer";
      const amount = data.total ? `₹${data.total}` : "an order";

      showToast(`🔔 New Order from ${name} for ${amount}!`, "info");
      dispatch(fetchAdminOrders({ limit: 100 }));
    };

    const handleStatusUpdate = () => {
      dispatch(fetchAdminOrders({ limit: 100 }));
    };

    socket.on("order:created", handleNewOrder);
    socket.on("order:status", handleStatusUpdate);

    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:status", handleStatusUpdate);
    };
  }, [dispatch, showToast]);

  /* ---------- Status counts ---------- */
  const statusCounts = useMemo(() => {
    const counts = { all: items.length };
    items.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  /* ---------- Filter + sort ---------- */
  const filteredOrders = useMemo(() => {
    let result = [...items];

    if (activeFilter !== "all") {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          String(o._id).toLowerCase().includes(q) ||
          (o.user?.name || "").toLowerCase().includes(q) ||
          (o.user?.email || "").toLowerCase().includes(q) ||
          (o.phone || "").includes(q),
      );
    }

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "total":
          aVal = a.total;
          bVal = b.total;
          break;
        case "items":
          aVal = a.items?.length || 0;
          bVal = b.items?.length || 0;
          break;
        case "date":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [items, activeFilter, searchQuery, sortKey, sortDir]);

  const handleStatusChange = (id, status) => {
    dispatch(updateOrderStatus({ id, status }));
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span className="sort-icon-idle">⇅</span>;
    return (
      <span className="sort-icon-active">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>
            {total} order{total !== 1 ? "s" : ""} · Manage and track every order
          </p>
        </div>
      </header>

      <div className="admin-filter-tabs">
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`admin-filter-tab ${
              activeFilter === s.key ? "active" : ""
            }`}
            onClick={() => setActiveFilter(s.key)}
          >
            <span className="admin-filter-tab-icon">{s.icon}</span>
            <span>{s.label}</span>
            {statusCounts[s.key] > 0 && (
              <span className="admin-filter-tab-count">
                {statusCounts[s.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-search-wrap">
        <span className="admin-search-icon">🔍</span>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by order ID, customer name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {loading && items.length === 0 && (
        <div className="admin-loading">Loading orders...</div>
      )}
      {error && <div className="admin-error">{error}</div>}

      {!loading && filteredOrders.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : activeFilter !== "all"
                ? `No ${activeFilter.replace(/_/g, " ")} orders`
                : "Orders will appear here once placed"}
          </p>
        </div>
      )}

      {filteredOrders.length > 0 && (
        <>
          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th className="th-order">Order</th>
                  <th className="th-customer">Customer</th>
                  <th
                    className="th-items sortable"
                    onClick={() => handleSort("items")}
                  >
                    Items <SortIcon column="items" />
                  </th>
                  <th
                    className="th-total sortable"
                    onClick={() => handleSort("total")}
                  >
                    Total <SortIcon column="total" />
                  </th>
                  <th className="th-payment">Payment</th>
                  <th className="th-status">Status</th>
                  <th
                    className="th-date sortable"
                    onClick={() => handleSort("date")}
                  >
                    Date <SortIcon column="date" />
                  </th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => {
                  const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={o._id} className="admin-orders-row">
                      <td>
                        <Link
                          to={`/admin/orders/${o._id}`}
                          className="admin-order-id"
                        >
                          #{String(o._id).slice(-6).toUpperCase()}
                        </Link>
                      </td>

                      <td>
                        <div className="admin-customer-cell">
                          <div className="admin-customer-avatar">
                            {o.user?.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="admin-customer-info">
                            <strong>{o.user?.name || "Unknown"}</strong>
                            <small>{o.user?.email || "—"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-items-count">
                          {o.items?.length || 0}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-total">
                          {formatCurrency(o.total)}
                        </span>
                      </td>

                      <td>
                        <div className="admin-payment-cell">
                          <span
                            className={`admin-payment-badge pay-${
                              o.paymentStatus || "pending"
                            }`}
                          >
                            {(o.paymentMethod || "cod").toUpperCase()}
                          </span>
                          <small className="admin-payment-status">
                            {o.paymentStatus || "pending"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: sc.bg,
                            color: sc.text,
                          }}
                        >
                          <span
                            className="admin-status-dot"
                            style={{ background: sc.dot }}
                          />
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td>
                        <span className="admin-order-date">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>

                      <td>
                        <StatusSelect
                          value={o.status}
                          onChange={(status) =>
                            handleStatusChange(o._id, status)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-orders-cards">
            {filteredOrders.map((o) => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
              return (
                <div key={o._id} className="admin-order-card">
                  <div className="admin-order-card-header">
                    <Link
                      to={`/admin/orders/${o._id}`}
                      className="admin-order-id"
                    >
                      #{String(o._id).slice(-6).toUpperCase()}
                    </Link>
                    <span
                      className="admin-status-pill"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      <span
                        className="admin-status-dot"
                        style={{ background: sc.dot }}
                      />
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="admin-order-card-row">
                    <div className="admin-customer-cell">
                      <div className="admin-customer-avatar">
                        {o.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="admin-customer-info">
                        <strong>{o.user?.name || "Unknown"}</strong>
                        <small>{o.user?.email || "—"}</small>
                      </div>
                    </div>
                  </div>

                  <div className="admin-order-card-row admin-order-card-meta">
                    <span>
                      <strong>{o.items?.length || 0}</strong> items
                    </span>
                    <span className="admin-order-total">
                      {formatCurrency(o.total)}
                    </span>
                    <span className="admin-order-date">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>

                  <StatusSelect
                    value={o.status}
                    onChange={(status) => handleStatusChange(o._id, status)}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;
