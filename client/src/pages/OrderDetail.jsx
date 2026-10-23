import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById, cancelOrder } from "../features/orders/ordersSlice";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";
import api, { downloadInvoice } from "../services/api";
import HelpModal from "../components/support/HelpModal";
import { io } from "socket.io-client";

// ✅ Map Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// ✅ Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Forces the map to recalculate its size
const MapSizeInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
};

// ✅ Smoothly pans to the new location
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

const STATUS_STEPS = [
  { key: "pending", label: "Placed", icon: "📝" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready_for_pickup", label: "Ready", icon: "📦" },
  { key: "out_for_delivery", label: "On the way", icon: "🛵" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { current: order, loading, error } = useSelector((s) => s.orders);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [riderOtp, setRiderOtp] = useState(null);

  const [riderPos, setRiderPos] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (order?.deliveryOtp) setRiderOtp(order.deliveryOtp);
  }, [order]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("paid") !== "1" || params.get("gateway") !== "stripe")
      return;
    let cancelled = false;
    const verify = async () => {
      try {
        const { data } = await api.post("/payments/verify-stripe", {
          orderId: id,
        });
        if (!cancelled && data.success) dispatch(fetchOrderById(id));
      } catch (err) {
        console.warn(
          "[verify-stripe]",
          err.response?.data?.message || err.message,
        );
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [id, location.search, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("paid") !== "1" || params.get("gateway") !== "phonepe")
      return;
    let cancelled = false;
    const verify = async () => {
      try {
        const { data } = await api.post("/payments/verify-phonepe", {
          orderId: id,
        });
        if (!cancelled && data.success) dispatch(fetchOrderById(id));
      } catch (err) {
        console.warn(
          "[verify-phonepe]",
          err.response?.data?.message || err.message,
        );
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [id, location.search, dispatch]);

  useEffect(() => {
    if (!order) return;
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      },
    );
    socket.emit("order:track", order._id);

    socket.on("order:rider-assigned", (payload) => setRiderOtp(payload.otp));
    socket.on("rider:location", ({ lat, lng }) => setRiderPos({ lat, lng }));
    socket.on("order:status", ({ status }) => {
      if (status) dispatch(fetchOrderById(order._id));
    });

    return () => socket.disconnect();
  }, [order?._id, dispatch]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order?\n\nAny payment made will be refunded.",
      )
    )
      return;
    const result = await dispatch(cancelOrder(order._id));
    if (cancelOrder.fulfilled.match(result)) {
      showToast(
        result.payload.message || "Order cancelled successfully",
        "success",
      );
    } else {
      showToast(result.payload || "Failed to cancel", "error");
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      await downloadInvoice(order._id);
      showToast("Invoice downloaded", "success");
    } catch (err) {
      showToast(err.message || "Failed to download invoice", "error");
    } finally {
      setDownloading(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) return showToast("Please select a rating", "error");
    setSubmitting(true);
    try {
      await api.post("/reviews", { orderId: order._id, rating, comment });
      showToast("Review submitted! Thank you.", "success");
      setHasReviewed(true);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to submit review",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <Skeleton type="text" width="40%" height={30} />
        <div style={{ marginTop: 20 }}>
          <Skeleton type="menuItem" count={3} />
        </div>
      </div>
    );
  }

  if (error || (!loading && !order)) {
    return (
      <div className="container" style={{ padding: "60px 20px" }}>
        <EmptyState
          icon="📦"
          title="Order not found"
          message={error || "We couldn't find this order."}
          actionLabel="Back to Orders"
          actionLink="/orders"
        />
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status,
  );
  const isCancelled = order.status === "cancelled";
  const canDownloadInvoice =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "refunded" ||
    order.status === "delivered";

  return (
    <div
      className="container order-detail-page"
      style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <Link
        to="/orders"
        className="btn-ghost"
        style={{
          marginBottom: 20,
          display: "inline-block",
          textDecoration: "none",
        }}
      >
        ← Back to Orders
      </Link>

      <div className="order-detail-header" style={{ marginBottom: 30 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>
              Order #{order._id.slice(-6).toUpperCase()}
            </h1>
            <p style={{ color: "var(--text-3)", marginTop: 8 }}>
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className={`status-badge status-${order.status}`}
            style={{ fontSize: 14, padding: "8px 16px" }}
          >
            {order.status.replace(/_/g, " ").toUpperCase()}
          </span>
        </div>
      </div>

      {!isCancelled && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "var(--bg-2)",
            padding: "30px 20px",
            borderRadius: 12,
            marginBottom: 30,
            position: "relative",
          }}
        >
          {STATUS_STEPS.map((step, index) => {
            const isDone = index <= currentStepIndex;
            return (
              <div
                key={step.key}
                style={{
                  textAlign: "center",
                  flex: 1,
                  opacity: isDone ? 1 : 0.4,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isDone ? "var(--primary)" : "var(--bg-3)",
                    color: isDone ? "#fff" : "var(--text-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    margin: "0 auto 10px",
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isDone ? "var(--text)" : "var(--text-3)",
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isCancelled && (
        <div
          style={{
            background: "var(--danger-bg, #fee2e2)",
            color: "var(--danger, #991b1b)",
            padding: 20,
            borderRadius: 12,
            marginBottom: 30,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          This order was cancelled.
          {order.refundAmount > 0 && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              💰 Refund of {formatCurrency(order.refundAmount)} initiated
              {order.refundStatus === "processed" && " and processed"}
              {order.refundedAt && ` on ${formatDate(order.refundedAt)}`}. It
              should appear in your account within 5–7 business days.
            </div>
          )}
        </div>
      )}

      {/* 🛵 RIDER TRACKING & OTP & MAP */}
      {order.deliveryPartner && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #86efac",
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            🛵 Your Delivery Partner
          </h3>

          {riderOtp && (
            <p style={{ margin: "8px 0 16px", fontSize: 14 }}>
              Share this OTP with the rider:{" "}
              <strong
                style={{ fontSize: 22, letterSpacing: 4, color: "#065f46" }}
              >
                {riderOtp}
              </strong>
            </p>
          )}

          {/* ✅ MAP WITH LOADER */}
          {riderPos ? (
            <div
              style={{
                width: "100%",
                height: 350,
                borderRadius: 12,
                overflow: "hidden",
                marginTop: 16,
                border: "1px solid #86efac",
                position: "relative",
              }}
            >
              {/* Loader Overlay */}
              {!mapLoaded && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ecfdf5",
                    zIndex: 10,
                    color: "#065f46",
                    fontWeight: 600,
                    gap: 12,
                  }}
                >
                  <div
                    className="spinner-sm"
                    style={{ width: 24, height: 24, borderWidth: 3 }}
                  />
                  Loading Live Map...
                </div>
              )}

              <MapContainer
                center={[riderPos.lat, riderPos.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                scrollWheelZoom={false}
                whenReady={() => setMapLoaded(true)}
              >
                {/* ✅ FREE OpenStreetMap Tiles */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[riderPos.lat, riderPos.lng]}>
                  <Popup>Rider is here 🛵</Popup>
                </Marker>
                <MapSizeInvalidator />
                <MapUpdater position={[riderPos.lat, riderPos.lng]} />
              </MapContainer>
            </div>
          ) : order.status === "out_for_delivery" ? (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#065f46" }}>
              Rider is on the way. Waiting for live location... 📡
            </p>
          ) : (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#065f46" }}>
              Rider has been assigned to your order.
            </p>
          )}
        </div>
      )}

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Items
        </h2>
        {order.items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr auto",
              gap: 16,
              alignItems: "center",
              padding: "12px 0",
              borderBottom:
                i < order.items.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
              <div
                style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}
              >
                Qty: {item.quantity}
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Delivery Address
        </h2>
        <p style={{ fontWeight: 600 }}>{order.address.label}</p>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 4 }}>
          {order.address.line1}
          {order.address.line2 && `, ${order.address.line2}`}
          <br />
          {order.address.city} — {order.address.pincode}
        </p>
        <p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>
          📞 {order.phone}
        </p>
      </div>

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Bill Details
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 14,
            color: "var(--text-2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Delivery Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          {order.packagingFee > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Packaging Fee</span>
              <span>{formatCurrency(order.packagingFee)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tax</span>
            <span>{formatCurrency(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--success)",
              }}
            >
              <span>
                Discount {order.couponCode && `(${order.couponCode})`}
              </span>
              <span>− {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text)",
              borderTop: "1px solid var(--border)",
              paddingTop: 16,
              marginTop: 4,
            }}
          >
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {canDownloadInvoice && (
          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="btn-outline"
            style={{
              width: "100%",
              marginTop: 20,
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontWeight: 600,
            }}
          >
            {downloading ? "Generating..." : "📥 Download Invoice (PDF)"}
          </button>
        )}
      </div>

      {["pending", "confirmed"].includes(order.status) && (
        <button
          onClick={handleCancel}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "14px",
            background: "var(--bg-2)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Cancel Order
        </button>
      )}

      <button
        onClick={() => setShowHelp(true)}
        className="btn-outline"
        style={{
          width: "100%",
          marginTop: 24,
          padding: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        🎧 Get Help With This Order
      </button>

      {order.status === "delivered" && !hasReviewed && (
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 24,
            marginTop: 20,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
            Rate your order
          </h2>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              fontSize: 30,
              cursor: "pointer",
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setRating(star)}>
                {star <= rating ? "⭐" : "☆"}
              </span>
            ))}
          </div>
          <textarea
            placeholder="Tell us what you liked or disliked..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid var(--border)",
              minHeight: 80,
              marginBottom: 16,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <button
            onClick={submitReview}
            disabled={submitting || rating === 0}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {hasReviewed && (
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "var(--success)",
            fontWeight: 600,
          }}
        >
          ✅ Thank you for your review!
        </div>
      )}

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        orderId={order._id}
        orderLabel={`Order #${order._id.slice(-6).toUpperCase()}`}
      />
    </div>
  );
};

export default OrderDetail;
