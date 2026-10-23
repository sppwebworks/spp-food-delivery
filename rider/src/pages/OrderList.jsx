import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../features/orders/riderOrdersSlice";

const STATUS_COLORS = {
  ready_for_pickup: { bg: "#fef3c7", color: "#92400e" },
  out_for_delivery: { bg: "#cffafe", color: "#155e75" },
  delivered: { bg: "#d1fae5", color: "#065f46" },
};

const OrderList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.riderOrders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
        📦 My Orders
      </h1>

      {loading && items.length === 0 && <p>Loading…</p>}
      {!loading && items.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            background: "#fff",
            borderRadius: 12,
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <p>No orders assigned yet. Make sure you are Online.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((o) => {
          const c = STATUS_COLORS[o.status] || {
            bg: "#e5e7eb",
            color: "#374151",
          };
          return (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              style={{
                background: "#fff",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <strong>#{o._id.slice(-6).toUpperCase()}</strong>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: c.bg,
                    color: c.color,
                    textTransform: "uppercase",
                  }}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>
                📍 {o.address?.line1}, {o.address?.city}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>
                👤 {o.user?.name} · 📞 {o.user?.phone}
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                ₹{o.total}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OrderList;
