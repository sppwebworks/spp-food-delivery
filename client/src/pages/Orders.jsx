/**
 * ============================================================
 * ORDERS PAGE  (/orders) — Premium pagination design + Invoice
 * ============================================================
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrders,
  archiveOrder,
  unarchiveOrder,
  reorderOrder,
} from "../features/orders/ordersSlice";
import { replaceCart } from "../features/cart/cartSlice";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";
import Modal from "../components/common/Modal";
import HelpModal from "../components/support/HelpModal";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";
import { downloadInvoice } from "../services/api";

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  confirmed: { bg: "#dbeafe", color: "#1e40af", label: "Confirmed" },
  preparing: { bg: "#ede9fe", color: "#6d28d9", label: "Preparing" },
  out_for_delivery: { bg: "#cffafe", color: "#155e75", label: "On the way" },
  delivered: { bg: "#d1fae5", color: "#065f46", label: "Delivered" },
  cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-wrap">
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <span className="pagination-arrow">‹</span>
          <span className="pagination-btn-label">Prev</span>
        </button>

        <div className="pagination-pages">
          {pageNumbers.map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="pagination-dots">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`pagination-num ${p === currentPage ? "active" : ""}`}
                onClick={() => onPageChange(p)}
                disabled={p === currentPage}
                aria-label={`Go to page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span className="pagination-btn-label">Next</span>
          <span className="pagination-arrow">›</span>
        </button>
      </div>
    </div>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { items, loading, page, pages, total, archived } = useSelector(
    (s) => s.orders,
  );
  const currentCart = useSelector((s) => s.cart);

  const [viewArchived, setViewArchived] = useState(false);
  const [reorderData, setReorderData] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [helpOrderId, setHelpOrderId] = useState(null); // ✅ Added

  const safePages = Math.max(1, Number(pages) || 1);
  const safePage = Math.max(1, Number(page) || 1);
  const limit = 10;

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit, archived: viewArchived }));
  }, [dispatch, viewArchived]);

  useEffect(() => {
    if (!loading && items.length === 0 && safePage > 1) {
      dispatch(
        fetchOrders({ page: safePage - 1, limit, archived: viewArchived }),
      );
    }
  }, [loading, items.length, safePage, viewArchived, dispatch]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > safePages || newPage === safePage) return;
    dispatch(fetchOrders({ page: newPage, limit, archived: viewArchived }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleArchivedView = () => setViewArchived((v) => !v);

  const handleArchive = async (orderId) => {
    if (
      !window.confirm(
        "Archive this order?\n\nIt will be hidden from your active orders list but not deleted. You can restore it from 'View Archived'.",
      )
    )
      return;
    const result = await dispatch(archiveOrder(orderId));
    if (archiveOrder.fulfilled.match(result)) {
      showToast("Order archived. Find it under 'View Archived'.", "success");
      await dispatch(
        fetchOrders({ page: safePage, limit, archived: viewArchived }),
      );
    } else {
      showToast(result.payload || "Failed to archive", "error");
    }
  };

  const handleRestore = async (orderId) => {
    const result = await dispatch(unarchiveOrder(orderId));
    if (unarchiveOrder.fulfilled.match(result)) {
      showToast("Order restored to active orders", "success");
      await dispatch(
        fetchOrders({ page: safePage, limit, archived: viewArchived }),
      );
    } else {
      showToast(result.payload || "Failed to restore", "error");
    }
  };

  const handleReorder = async (orderId) => {
    setReordering(true);
    const result = await dispatch(reorderOrder(orderId));
    setReordering(false);
    if (reorderOrder.fulfilled.match(result)) {
      setReorderData(result.payload);
    } else {
      showToast(result.payload || "Failed to reorder", "error");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId);
    try {
      await downloadInvoice(orderId);
      showToast("Invoice downloaded", "success");
    } catch (err) {
      showToast(err.message || "Failed to download invoice", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmReorder = () => {
    if (!reorderData) return;
    const currentCartRestaurant = currentCart?.restaurant?._id;
    const newRestaurant = reorderData.restaurant._id;

    if (
      currentCartRestaurant &&
      currentCartRestaurant !== newRestaurant &&
      currentCart?.items?.length > 0
    ) {
      if (
        !window.confirm(
          `Your cart has items from a different restaurant. Replace with items from "${reorderData.restaurant.name}"?`,
        )
      )
        return;
    }

    dispatch(
      replaceCart({
        restaurant: reorderData.restaurant,
        items: reorderData.items,
      }),
    );
    showToast(
      `${reorderData.items.length} item${reorderData.items.length !== 1 ? "s" : ""} added to cart`,
      "success",
    );
    setReorderData(null);
    navigate("/checkout");
  };

  if (loading && items.length === 0) {
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

  if (!loading && items.length === 0) {
    return (
      <div
        className="container"
        style={{ padding: "60px 20px", maxWidth: 800, margin: "0 auto" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            {viewArchived ? "Archived Orders" : "My Orders"}
          </h1>
          <button
            onClick={toggleArchivedView}
            className="btn-ghost"
            style={{ fontSize: 13, border: "1px solid var(--border)" }}
          >
            {viewArchived ? "← View Active Orders" : "📁 View Archived"}
          </button>
        </div>
        <EmptyState
          icon={viewArchived ? "📁" : "📦"}
          title={viewArchived ? "No archived orders" : "No orders yet"}
          message={
            viewArchived
              ? "You haven't archived any orders yet. Archive a delivered or cancelled order to move it here."
              : "Your order history will appear here once you place your first order."
          }
          actionLabel={
            viewArchived ? "Back to Active Orders" : "Browse Restaurants"
          }
          onAction={
            viewArchived
              ? () => setViewArchived(false)
              : () => navigate("/restaurants")
          }
        />
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            {viewArchived ? "Archived Orders" : "My Orders"}
          </h1>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginTop: 4 }}>
            {total} {viewArchived ? "archived" : ""} order
            {total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={toggleArchivedView}
          className="btn-ghost"
          style={{ fontSize: 13, border: "1px solid var(--border)" }}
        >
          {viewArchived ? "← View Active Orders" : "📁 View Archived"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((order) => {
          const statusInfo =
            STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          const isArchivable = ["delivered", "cancelled"].includes(
            order.status,
          );
          const isActive = [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
          ].includes(order.status);
          const canDownloadInvoice =
            order.paymentStatus === "paid" ||
            order.paymentStatus === "refunded" ||
            order.status === "delivered";

          return (
            <div
              key={order._id}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-3)",
                      marginTop: 4,
                      marginBottom: 0,
                    }}
                  >
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700,
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  {statusInfo.label}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {order.items.slice(0, 3).map((item, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "5px 12px",
                      background: "var(--bg-2)",
                      borderRadius: 20,
                      fontSize: 13,
                      color: "var(--text-2)",
                    }}
                  >
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span
                    style={{
                      padding: "5px 12px",
                      background: "var(--bg-2)",
                      borderRadius: 20,
                      fontSize: 13,
                      color: "var(--text-3)",
                    }}
                  >
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 14,
                  borderTop: "1px solid var(--border)",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <strong style={{ fontSize: 16 }}>
                  {formatCurrency(order.total)}
                </strong>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-outline"
                    style={{ padding: "8px 14px", fontSize: 13 }}
                  >
                    View Details
                  </Link>

                  {isActive && (
                    <Link
                      to={`/orders/${order._id}`}
                      className="btn-primary"
                      style={{ padding: "8px 14px", fontSize: 13 }}
                    >
                      🛵 Track
                    </Link>
                  )}

                  {canDownloadInvoice && (
                    <button
                      onClick={() => handleDownloadInvoice(order._id)}
                      disabled={downloadingId === order._id}
                      className="btn-ghost"
                      style={{
                        padding: "8px 14px",
                        fontSize: 13,
                        border: "1px solid var(--border)",
                        opacity: downloadingId === order._id ? 0.6 : 1,
                        cursor:
                          downloadingId === order._id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {downloadingId === order._id
                        ? "⏳ Downloading..."
                        : "📥 Invoice"}
                    </button>
                  )}

                  {["delivered", "cancelled"].includes(order.status) &&
                    !viewArchived && (
                      <button
                        onClick={() => handleReorder(order._id)}
                        disabled={reordering}
                        className="btn-primary"
                        style={{ padding: "8px 14px", fontSize: 13 }}
                      >
                        {reordering ? "Loading..." : "🔁 Reorder"}
                      </button>
                    )}

                  {/* ✅ Get Help button */}
                  {!viewArchived && (
                    <button
                      onClick={() => setHelpOrderId(order._id)}
                      className="btn-ghost"
                      style={{
                        padding: "8px 14px",
                        fontSize: 13,
                        border: "1px solid var(--border)",
                      }}
                    >
                      🎧 Help
                    </button>
                  )}

                  {isArchivable && !viewArchived && (
                    <button
                      onClick={() => handleArchive(order._id)}
                      className="btn-ghost"
                      style={{
                        padding: "8px 14px",
                        fontSize: 13,
                        border: "1px solid var(--border)",
                      }}
                    >
                      🗄️ Archive
                    </button>
                  )}

                  {viewArchived && (
                    <button
                      onClick={() => handleRestore(order._id)}
                      className="btn-ghost"
                      style={{
                        padding: "8px 14px",
                        fontSize: 13,
                        border: "1px solid var(--border)",
                      }}
                    >
                      ♻️ Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={safePages}
        onPageChange={goToPage}
      />

      {/* Reorder Modal */}
      <Modal isOpen={!!reorderData} onClose={() => setReorderData(null)}>
        {reorderData && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              🔁 Reorder from {reorderData.restaurant.name}
            </h2>
            <p
              style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20 }}
            >
              These items will be added to your cart.
            </p>

            <div
              style={{
                background: "var(--bg-2)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-2)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 12,
                }}
              >
                ✅ Available ({reorderData.items.length})
              </h3>
              {reorderData.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom:
                      i < reorderData.items.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        marginTop: 2,
                      }}
                    >
                      ₹{item.price} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {reorderData.unavailableItems.length > 0 && (
              <div
                style={{
                  background: "rgba(226, 55, 68, 0.06)",
                  border: "1px solid rgba(226, 55, 68, 0.2)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--danger)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 12,
                  }}
                >
                  ⚠️ Unavailable ({reorderData.unavailableItems.length})
                </h3>
                {reorderData.unavailableItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 13,
                      color: "var(--text-2)",
                      padding: "4px 0",
                    }}
                  >
                    <strong>{item.name}</strong> — {item.reason}
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setReorderData(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={confirmReorder}
                disabled={reorderData.items.length === 0}
              >
                Add {reorderData.items.length} Item
                {reorderData.items.length !== 1 ? "s" : ""} to Cart
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ✅ Help Modal */}
      <HelpModal
        isOpen={!!helpOrderId}
        onClose={() => setHelpOrderId(null)}
        orderId={helpOrderId}
        orderLabel={
          helpOrderId ? `Order #${helpOrderId.slice(-6).toUpperCase()}` : ""
        }
      />
    </div>
  );
};

export default Orders;
