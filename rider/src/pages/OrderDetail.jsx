import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderById,
  updateOrderStatus,
} from "../features/orders/riderOrdersSlice";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { io } from "socket.io-client";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { current: order } = useSelector((s) => s.riderOrders);
  const { rider } = useSelector((s) => s.riderAuth);

  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [tracking, setTracking] = useState(false);

  const socketRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const startTracking = () => {
    if (!order || !rider) return;
    if (!navigator.geolocation) {
      showToast("Geolocation not supported by this browser", "error");
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(
        import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
        { transports: ["websocket"] },
      );
    }

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    trackingIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;

          try {
            await api.put("/rider/location", { lat, lng, orderId: order._id });
          } catch (_) {}

          try {
            socketRef.current.emit("rider:location", {
              riderId: rider._id,
              orderId: order._id,
              lat,
              lng,
            });
          } catch (_) {}
        },
        (err) => {
          console.warn("Location error:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    }, 5000);

    setTracking(true);
    showToast("Live location sharing started 📡", "success");
  };

  const stopTracking = () => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    if (socketRef.current) socketRef.current.disconnect();
    setTracking(false);
  };

  useEffect(() => {
    if (order && order.status === "out_for_delivery" && !tracking) {
      startTracking();
    }
    return () => stopTracking();
  }, [order?.status]);

  const markPickedUp = async () => {
    setSending(true);
    const res = await dispatch(
      updateOrderStatus({ id, status: "out_for_delivery" }),
    );
    setSending(false);

    if (updateOrderStatus.fulfilled.match(res)) {
      showToast("Marked as Picked Up ✅", "success");
      startTracking();
    } else {
      showToast(res.payload || "Failed to update status", "error");
    }
  };

  const markDelivered = async () => {
    if (!otp.trim()) return showToast("Enter customer OTP", "error");
    setSending(true);
    const res = await dispatch(
      updateOrderStatus({ id, status: "delivered", otp }),
    );
    setSending(false);

    if (updateOrderStatus.fulfilled.match(res)) {
      showToast("Order delivered! 🎉", "success");
      stopTracking();
      navigate("/");
    } else {
      showToast(res.payload || "Invalid OTP", "error");
    }
  };

  if (!order) return <p style={{ padding: 20 }}>Loading order details…</p>;

  return (
    <div>
      <Link
        to="/"
        style={{
          color: "#fc8019",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        ← Back to Orders
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0" }}>
        Order #{order._id.slice(-6).toUpperCase()}
      </h1>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          📍 Delivery Address
        </h3>
        <p style={{ margin: 0, fontSize: 14 }}>
          {order.address?.line1}
          {order.address?.line2 && `, ${order.address.line2}`}
          <br />
          {order.address?.city} — {order.address?.pincode}
        </p>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "#6b7280" }}>
          👤 {order.user?.name} · 📞 {order.user?.phone || order.phone}
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          🛒 Items
        </h3>
        {order.items.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #f3f4f6",
              fontSize: 14,
            }}
          >
            <span>
              {it.name} × {it.quantity}
            </span>
            <strong>₹{it.price * it.quantity}</strong>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 12,
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {order.status === "out_for_delivery" && !tracking && (
        <button
          onClick={startTracking}
          style={{
            width: "100%",
            padding: 14,
            background: "#fc8019",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          📡 Force Start Live Location
        </button>
      )}

      {["ready_for_pickup", "confirmed", "preparing"].includes(
        order.status,
      ) && (
        <button
          onClick={markPickedUp}
          disabled={sending}
          style={{
            width: "100%",
            padding: 14,
            background: "#fc8019",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? "Updating…" : "✅ Mark as Picked Up"}
        </button>
      )}

      {order.status === "out_for_delivery" && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            marginTop: 16,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            🔑 Customer OTP
          </h3>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 12px" }}>
            Ask the customer for their 4-digit code to complete delivery.
          </p>
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="Enter OTP"
            maxLength={4}
            style={{
              width: "100%",
              padding: 14,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 20,
              textAlign: "center",
              letterSpacing: 8,
              fontWeight: 700,
              marginBottom: 12,
            }}
          />
          <button
            onClick={markDelivered}
            disabled={sending || otp.length !== 4}
            style={{
              width: "100%",
              padding: 14,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              opacity: sending || otp.length !== 4 ? 0.6 : 1,
            }}
          >
            {sending ? "Verifying…" : "✅ Complete Delivery"}
          </button>
        </div>
      )}

      {tracking && (
        <div
          style={{
            marginTop: 16,
            background: "#ecfdf5",
            color: "#065f46",
            padding: 14,
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          📡 Live location sharing is ON
        </div>
      )}

      {order.status === "delivered" && (
        <div
          style={{
            marginTop: 16,
            background: "#d1fae5",
            color: "#065f46",
            padding: 14,
            borderRadius: 10,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          ✅ Delivered on {new Date(order.deliveredAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
