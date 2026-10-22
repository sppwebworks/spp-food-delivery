import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, selectCartItems } from "../features/cart/cartSlice";
import { useToast } from "../context/ToastContext";

const OFFERS = [
  {
    id: 1,
    title: "Flat ₹50 OFF",
    subtitle: "On orders above ₹200",
    code: "SAVE50",
    emoji: "🎉",
    color: "orange",
    tag: "Most Used",
  },
  {
    id: 2,
    title: "20% OFF",
    subtitle: "On your first order above ₹300",
    code: "FIRST20",
    emoji: "🍕",
    color: "red",
    tag: "New User",
  },
  {
    id: 3,
    title: "₹100 OFF",
    subtitle: "On orders above ₹500",
    code: "WELCOME",
    emoji: "🎁",
    color: "purple",
    tag: "Big Order",
  },
  {
    id: 4,
    title: "Free Delivery",
    subtitle: "On orders above ₹150",
    code: "FREEDEL",
    emoji: "🛵",
    color: "green",
    tag: "Popular",
  },
  {
    id: 5,
    title: "30% OFF",
    subtitle: "Weekend special on orders above ₹400",
    code: "WEEKEND",
    emoji: "🌟",
    color: "blue",
    tag: "Weekend",
  },
  {
    id: 6,
    title: "₹75 OFF on Biryani",
    subtitle: "On your favourite biryani above ₹250",
    code: "BIRYANI",
    emoji: "🍛",
    color: "orange",
    tag: "Cuisine",
  },
];

const Offers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const cartItems = useSelector(selectCartItems);
  const { token } = useSelector((s) => s.auth); // ✅ Check if logged in

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("Code copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = async (code) => {
    // 1. ✅ Check Login
    if (!token) {
      showToast("Please login to apply coupons", "error");
      navigate("/login");
      return;
    }

    // 2. ✅ Check Cart
    if (cartItems.length === 0) {
      showToast("Your cart is empty. Add items first!", "error");
      return;
    }

    // 3. Apply the coupon
    const result = await dispatch(applyCoupon(code));

    if (applyCoupon.fulfilled.match(result)) {
      showToast(`Coupon ${code} applied successfully!`, "success");
      navigate("/checkout"); // Send them to checkout to see the discount
    } else {
      showToast(result.payload || "Failed to apply coupon", "error");
    }
  };

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Offers & Coupons 🎉
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: 16 }}>
          Save more on every order with these exclusive deals
        </p>
      </div>

      {/* Offers Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
          marginBottom: 60,
        }}
      >
        {OFFERS.map((offer) => (
          <div
            key={offer.id}
            className={`offer-card offer-${offer.color}`}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            {/* Tag */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                padding: "4px 10px",
                borderRadius: 20,
                background: "var(--bg-3)",
                color: "var(--text-2)",
              }}
            >
              {offer.tag}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  width: 56,
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  background: "var(--bg-2)",
                }}
              >
                {offer.emoji}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--text)",
                    margin: "0 0 4px 0",
                  }}
                >
                  {offer.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
                  {offer.subtitle}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1.5px dashed var(--border)",
                margin: "4px 0",
              }}
            />

            {/* Code & Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--bg-2)",
                  border: "1.5px dashed var(--border-2)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                  }}
                >
                  Use Code
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "var(--text)",
                  }}
                >
                  {offer.code}
                </span>
              </div>
              <button
                onClick={() => handleCopy(offer.code, offer.id)}
                style={{
                  padding: "0 16px",
                  height: 48,
                  alignSelf: "flex-end",
                  borderRadius: 10,
                  background:
                    copiedId === offer.id
                      ? "rgba(72, 196, 121, 0.15)"
                      : "var(--bg-3)",
                  color:
                    copiedId === offer.id ? "var(--success)" : "var(--text)",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {copiedId === offer.id ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => handleApply(offer.code)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--primary)",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
              }}
            >
              Apply this code →
            </button>
          </div>
        ))}
      </div>

      {/* How to use */}
      <div
        style={{
          background: "var(--bg-2)",
          borderRadius: 16,
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 24,
            color: "var(--text)",
          }}
        >
          How to use a coupon?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 24,
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {[
            "Browse offers and pick the one that fits your order",
            'Copy the code or click "Apply" to add it to your cart',
            "Discount is applied automatically at checkout 🎉",
          ].map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  boxShadow: "0 8px 20px rgba(252, 128, 25, 0.3)",
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offers;
