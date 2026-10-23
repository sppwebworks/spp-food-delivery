import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrder } from "../features/orders/adminOrdersSlice";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { current: order, loading } = useSelector((s) => s.adminOrders);

  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminOrder(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!order || order.deliveryPartner) return;
    if (
      !["pending", "confirmed", "preparing", "ready_for_pickup"].includes(
        order.status,
      )
    )
      return;

    const loadRiders = async () => {
      try {
        const { data } = await api.get(
          `/admin/orders/${order._id}/available-riders`,
        );
        setAvailableRiders(data.riders || []);
      } catch (_) {}
    };
    loadRiders();
  }, [order]);

  const handleAssignRider = async () => {
    if (!selectedRiderId) return;
    setAssigning(true);
    try {
      await api.put(`/admin/orders/${order._id}/assign-rider`, {
        riderId: selectedRiderId,
      });
      showToast("Rider assigned and OTP generated", "success");
      dispatch(fetchAdminOrder(id));
    } catch (err) {
      showToast(err.response?.data?.message || "Assignment failed", "error");
    } finally {
      setAssigning(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Link to="/admin/orders" className="admin-back-link">
        ← Back to Orders
      </Link>

      <header className="admin-page-header">
        <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
        <p>Placed on {formatDate(order.createdAt)}</p>
      </header>

      <div className="admin-detail-grid">
        <div className="admin-card">
          <h2>Customer</h2>
          <p>
            <strong>{order.user?.name || "Unknown"}</strong>
          </p>
          <p>{order.user?.email}</p>
          <p>📞 {order.phone}</p>
        </div>

        <div className="admin-card">
          <h2>Delivery Address</h2>
          <p>{order.address.line1}</p>
          {order.address.line2 && <p>{order.address.line2}</p>}
          <p>
            {order.address.city} — {order.address.pincode}
          </p>
        </div>

        <div className="admin-card">
          <h2>Payment</h2>
          <p>
            Method: <strong>{order.paymentMethod.toUpperCase()}</strong>
          </p>
          <p>
            Status:{" "}
            <span className={`pay-badge pay-${order.paymentStatus}`}>
              {order.paymentStatus}
            </span>
          </p>
        </div>
      </div>

      {/* RIDER ASSIGNMENT */}
      <div className="admin-card">
        <h2>🛵 Delivery Partner</h2>

        {order.deliveryPartner ? (
          <div>
            <p>
              <strong>{order.deliveryPartner.user?.name || "Assigned"}</strong>
            </p>
            <p>📞 {order.deliveryPartner.phone}</p>
            <p>Status: {order.status.replace(/_/g, " ")}</p>
            {order.deliveryOtp && (
              <p
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "#ecfdf5",
                  borderRadius: 8,
                }}
              >
                <strong>OTP for handover:</strong>{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 20,
                    letterSpacing: 4,
                    color: "#065f46",
                  }}
                >
                  {order.deliveryOtp}
                </span>
              </p>
            )}
          </div>
        ) : ["pending", "confirmed", "preparing", "ready_for_pickup"].includes(
            order.status,
          ) ? (
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #e9e9eb",
              }}
            >
              <option value="">Choose an available rider…</option>
              {availableRiders.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.user?.name} · {r.phone} · {r.totalDeliveries} deliveries
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignRider}
              disabled={!selectedRiderId || assigning}
              className="admin-btn-primary"
              style={{ padding: "10px 20px" }}
            >
              {assigning ? "Assigning…" : "Assign Rider"}
            </button>
          </div>
        ) : (
          <p style={{ color: "#93959f" }}>
            No rider assignable at this order stage.
          </p>
        )}
      </div>

      <div className="admin-card">
        <h2>Items</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td>{item.name}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h2>Bill Summary</h2>
        <div className="admin-bill">
          <div>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div>
            <span>Delivery</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div>
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="discount">
              <span>Discount</span>
              <span>− {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="total">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
