/**
 * ============================================================
 * CHECKOUT PAGE (/checkout) — Full Payment Integration
 * ============================================================
 */

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCartItems,
  selectCartSubtotal,
  selectDeliveryFee,
  selectTax,
  selectDiscount,
  selectCartTotal,
  clearCart,
  selectMinOrderValue,
  selectPackagingFee,
  addToCart,
  removeFromCart,
} from "../features/cart/cartSlice";
import {
  fetchAddresses,
  createAddress,
  setSelected,
} from "../features/address/addressSlice";
import { createOrder, fetchMyOrders } from "../features/orders/ordersSlice";
import { fetchSettings } from "../features/settings/settingsSlice";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import PaymentSelector from "../components/checkout/PaymentSelector";
import CouponBox from "../components/cart/CouponBox";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const tax = useSelector(selectTax);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const coupon = useSelector((s) => s.cart.coupon);
  const packagingFee = useSelector(selectPackagingFee);

  const settingsData = useSelector((s) => s.settings?.data);
  const cartMinOrder = useSelector(selectMinOrderValue);

  const minOrderValue = settingsData?.minOrderValue ?? cartMinOrder ?? 0;
  const storeOpen = settingsData?.isStoreOpen !== false;
  const taxRate = settingsData?.taxRate ?? 5;

  const { items: addresses, selected } = useSelector((s) => s.address);
  const { user } = useSelector((s) => s.auth);
  const { loading: placing } = useSelector((s) => s.orders);

  const [phone, setPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isPhoneValid = phone.trim().length === 10 && /^\d+$/.test(phone);

  useEffect(() => {
    if (items.length === 0 && !isProcessing) navigate("/restaurants");
  }, [items.length, navigate, isProcessing]);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchMyOrders());
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (addresses.length > 0 && !selected) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      dispatch(setSelected(defaultAddr));
    }
  }, [addresses, selected, dispatch]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (
      !newAddr.line1.trim() ||
      !newAddr.city.trim() ||
      !newAddr.pincode.trim()
    ) {
      showToast("Line 1, City and Pincode are required", "error");
      return;
    }
    const result = await dispatch(createAddress(newAddr));
    if (createAddress.fulfilled.match(result)) {
      showToast("Address added", "success");
      setShowAddAddress(false);
      setNewAddr({
        label: "Home",
        line1: "",
        line2: "",
        city: "",
        pincode: "",
      });
      dispatch(setSelected(result.payload));
    } else {
      showToast(result.payload || "Failed to add address", "error");
    }
  };

  const handleIncrease = (item) =>
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        restaurant: item.restaurant,
        restaurantName: item.restaurantName,
      }),
    );

  const handleDecrease = (itemId) => dispatch(removeFromCart(itemId));

  const handlePlaceOrder = async () => {
    if (isProcessing) return;
    if (!selected)
      return showToast("Please select a delivery address", "error");
    if (!isPhoneValid) {
      setPhoneTouched(true);
      return showToast("Please enter a valid 10-digit phone number", "error");
    }

    setIsProcessing(true);

    try {
      const payload = {
        items: items.map((i) => ({
          mealId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        deliveryFee,
        packagingFee,
        tax,
        discount,
        total,
        address: {
          label: selected.label,
          line1: selected.line1,
          line2: selected.line2,
          city: selected.city,
          pincode: selected.pincode,
        },
        phone: phone.trim(),
        paymentMethod,
        couponCode: coupon?.code || null,
      };

      const result = await dispatch(createOrder(payload));
      if (!createOrder.fulfilled.match(result)) {
        showToast(result.payload || "Failed to place order", "error");
        setIsProcessing(false);
        return;
      }

      const orderId = result.payload._id;
      const serverTotal = result.payload.total;

      if (paymentMethod === "cod") {
        dispatch(clearCart());
        showToast("Order placed — pay on delivery 🎉", "success");
        navigate(`/orders/${orderId}`);
        return;
      }

      const { data } = await api.post("/payments/initiate", {
        orderId,
        method: paymentMethod,
        amount: serverTotal,
      });

      if (paymentMethod === "stripe") {
        if (!data.clientSecret) {
          showToast("Stripe session failed — please retry", "error");
          setIsProcessing(false);
          return;
        }
        navigate(`/stripe-checkout/${orderId}`, {
          state: { clientSecret: data.clientSecret, amount: serverTotal },
        });
        return;
      }

      if (paymentMethod === "razorpay") {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          showToast("Razorpay failed to load", "error");
          setIsProcessing(false);
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpayOrderId,
          name: "SPP FoodieApp",
          description: `Order #${orderId.slice(-6).toUpperCase()}`,
          handler: async (response) => {
            try {
              await api.post("/payments/verify", {
                orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                gateway: "razorpay",
              });
              dispatch(clearCart());
              showToast("Payment successful 🎉", "success");
              navigate(`/orders/${orderId}?paid=1&gateway=razorpay`);
            } catch (err) {
              showToast(
                err.response?.data?.message || "Payment verification failed",
                "error",
              );
              setIsProcessing(false);
            }
          },
          prefill: { contact: phone.trim() },
          theme: { color: "#fc8019" },
          modal: {
            ondismiss: () => {
              showToast("Payment cancelled", "error");
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      dispatch(clearCart());
      showToast("Order placed 🎉", "success");
      navigate(`/orders/${orderId}`);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Payment initiation failed",
        "error",
      );
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  const isButtonDisabled =
    placing ||
    isProcessing ||
    !selected ||
    !isPhoneValid ||
    !storeOpen ||
    subtotal < minOrderValue;

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>Delivery Address</h2>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowAddAddress(true)}
                style={{ color: "var(--primary)", fontWeight: 600, padding: 0 }}
              >
                + Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                No addresses yet. Add one to continue.
              </p>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`address-option ${
                      selected?._id === addr._id ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selected?._id === addr._id}
                      onChange={() => dispatch(setSelected(addr))}
                    />
                    <div style={{ flex: 1 }}>
                      <strong>{addr.label}</strong>
                      <p>
                        {addr.line1}
                        {addr.line2 && `, ${addr.line2}`}
                      </p>
                      <p>
                        {addr.city} — {addr.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="checkout-section">
            <h2>Contact Number</h2>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              onBlur={() => setPhoneTouched(true)}
              placeholder="10-digit mobile number"
              maxLength={10}
              style={{
                borderColor:
                  phoneTouched && !isPhoneValid ? "#ef4444" : "var(--border)",
                borderWidth: phoneTouched && !isPhoneValid ? 2 : 1,
              }}
            />
            {phoneTouched && !isPhoneValid && (
              <div
                style={{
                  color: "#ef4444",
                  fontSize: 13,
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                {phone.trim().length === 0
                  ? "Phone number is required for delivery."
                  : "Please enter a valid 10-digit phone number."}
              </div>
            )}
          </section>

          <section className="checkout-section">
            <h2>Payment Method</h2>
            <PaymentSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div style={{ marginBottom: 16 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 14,
                  color: "var(--text-2)",
                }}
              >
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text)",
                      marginBottom: 4,
                    }}
                  >
                    {item.name}
                  </div>
                  <div>₹{item.price}</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg)",
                    border: "1px solid var(--primary)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    color: "var(--primary)",
                    fontWeight: 700,
                    width: 86,
                  }}
                >
                  <button
                    onClick={() => handleDecrease(item.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      fontSize: 18,
                      padding: 0,
                    }}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrease(item)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "inherit",
                      fontSize: 18,
                      padding: 0,
                    }}
                  >
                    +
                  </button>
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--text)",
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <CouponBox />
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: 12,
              marginTop: 12,
            }}
          >
            <div className="cart-bill-row">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="cart-bill-row">
              <span>Delivery Fee</span>
              {deliveryFee === 0 && subtotal > 0 ? (
                <span style={{ color: "var(--success)", fontWeight: 700 }}>
                  FREE
                </span>
              ) : (
                <span>₹{deliveryFee}</span>
              )}
            </div>
            {packagingFee > 0 && (
              <div className="cart-bill-row">
                <span>Packaging Fee</span>
                <span>₹{packagingFee}</span>
              </div>
            )}
            <div className="cart-bill-row">
              <span>Tax ({taxRate}%)</span>
              <span>₹{tax}</span>
            </div>
            {discount > 0 && (
              <div
                className="cart-bill-row discount"
                style={{ color: "var(--success)" }}
              >
                <span>Discount {coupon?.code ? `(${coupon.code})` : ""}</span>
                <span>− ₹{discount}</span>
              </div>
            )}
            <div className="cart-bill-row total">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
          </div>

          {!storeOpen && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ⚠️ Store is currently closed. We are not accepting new orders.
            </div>
          )}

          {subtotal < minOrderValue && (
            <div
              style={{
                background: "#fef3c7",
                color: "#92400e",
                padding: 12,
                borderRadius: 8,
                marginTop: 12,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ⚠️ Minimum order is ₹{minOrderValue}. Add ₹
              {minOrderValue - subtotal} more.
            </div>
          )}

          <button
            className="btn-primary btn-large"
            style={{ width: "100%", marginTop: 16 }}
            onClick={handlePlaceOrder}
            disabled={isButtonDisabled}
          >
            {isProcessing || placing
              ? "Processing..."
              : !storeOpen
                ? "Store Closed"
                : subtotal < minOrderValue
                  ? `Add ₹${minOrderValue - subtotal} more`
                  : !isPhoneValid
                    ? "Enter valid phone number"
                    : paymentMethod === "cod"
                      ? `Place Order · ₹${total}`
                      : `Pay ₹${total}`}
          </button>
        </aside>
      </div>

      {/* ✅ FIXED MODAL */}
      {showAddAddress && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-address-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowAddAddress(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 420,
              padding: 24,
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="add-address-title"
              style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}
            >
              Add New Address
            </h2>
            <form
              onSubmit={handleAddAddress}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#686b78",
                    marginBottom: 6,
                  }}
                >
                  Save As
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 20,
                        border: "1.5px solid #e9e9eb",
                        background: newAddr.label === lbl ? "#fc8019" : "#fff",
                        color: newAddr.label === lbl ? "#fff" : "#686b78",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="addressLine1"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#686b78",
                    marginBottom: 6,
                  }}
                >
                  Address Line 1 *
                </label>
                <input
                  id="addressLine1"
                  placeholder="House/Flat No., Building Name"
                  value={newAddr.line1}
                  onChange={(e) =>
                    setNewAddr({ ...newAddr, line1: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e9e9eb",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="addressLine2"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#686b78",
                    marginBottom: 6,
                  }}
                >
                  Address Line 2 (Optional)
                </label>
                <input
                  id="addressLine2"
                  placeholder="Street, Landmark"
                  value={newAddr.line2}
                  onChange={(e) =>
                    setNewAddr({ ...newAddr, line2: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e9e9eb",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    htmlFor="addressCity"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#686b78",
                      marginBottom: 6,
                    }}
                  >
                    City *
                  </label>
                  <input
                    id="addressCity"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) =>
                      setNewAddr({ ...newAddr, city: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #e9e9eb",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="addressPincode"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#686b78",
                      marginBottom: 6,
                    }}
                  >
                    Pincode *
                  </label>
                  <input
                    id="addressPincode"
                    placeholder="6-digit Pincode"
                    value={newAddr.pincode}
                    onChange={(e) =>
                      setNewAddr({
                        ...newAddr,
                        pincode: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    maxLength={6}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #e9e9eb",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "transparent",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#686b78",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#fc8019",
                    color: "#fff",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
