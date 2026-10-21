import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrder } from "../features/orders/adminOrdersSlice";
import { formatCurrency, formatDate } from "../utils/format";
import { useToast } from "../context/ToastContext";

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { current: order, loading } = useSelector((s) => s.adminOrders);

  useEffect(() => {
    dispatch(fetchAdminOrder(id));
  }, [dispatch, id]);

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
        {/* Customer Info */}
        <div className="admin-card">
          <h2>Customer</h2>
          <p>
            <strong>{order.user?.name || "Unknown"}</strong>
          </p>
          <p>{order.user?.email}</p>
          <p>📞 {order.phone}</p>
        </div>

        {/* Delivery Address */}
        <div className="admin-card">
          <h2>Delivery Address</h2>
          <p>{order.address.line1}</p>
          {order.address.line2 && <p>{order.address.line2}</p>}
          <p>
            {order.address.city} — {order.address.pincode}
          </p>
        </div>

        {/* Payment Info */}
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

      {/* Items */}
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

      {/* Bill Summary */}
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
