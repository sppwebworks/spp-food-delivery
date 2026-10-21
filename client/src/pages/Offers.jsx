/**
 * ============================================================
 * OFFERS PAGE  (/offers)
 * ============================================================
 * Grid of coupon cards. "Apply" copies the code to clipboard.
 * ============================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useDispatch } from "react-redux";
import { applyCoupon } from "../features/cart/cartSlice";

const COUPONS = [
  {
    code: "SAVE50",
    title: "Flat ₹50 OFF",
    description: "On orders above ₹200",
    minOrder: 200,
    discount: "₹50 off",
    type: "flat",
    value: 50,
    validTill: "31 Dec 2026",
    color: "orange",
    icon: "🎉",
    tag: "Most Used",
  },
  {
    code: "FIRST20",
    title: "20% OFF",
    description: "On your first order above ₹300",
    minOrder: 300,
    discount: "Up to ₹100",
    type: "percent",
    value: 20,
    validTill: "31 Dec 2026",
    color: "red",
    icon: "🍕",
    tag: "New User",
  },
  {
    code: "WELCOME",
    title: "₹100 OFF",
    description: "On orders above ₹500",
    minOrder: 500,
    discount: "₹100 off",
    type: "flat",
    value: 100,
    validTill: "31 Dec 2026",
    color: "purple",
    icon: "🎁",
    tag: "Big Order",
  },
  {
    code: "FREEDEL",
    title: "Free Delivery",
    description: "On orders above ₹150",
    minOrder: 150,
    discount: "₹30 off",
    type: "flat",
    value: 30,
    validTill: "31 Dec 2026",
    color: "green",
    icon: "🛵",
    tag: "Popular",
  },
  {
    code: "WEEKEND",
    title: "30% OFF",
    description: "Weekend special on orders above ₹400",
    minOrder: 400,
    discount: "Up to ₹150",
    type: "percent",
    value: 30,
    validTill: "Every weekend",
    color: "blue",
    icon: "🌟",
    tag: "Weekend",
  },
  {
    code: "BIRYANI",
    title: "₹75 OFF on Biryani",
    description: "On your favourite biryani above ₹250",
    minOrder: 250,
    discount: "₹75 off",
    type: "flat",
    value: 75,
    validTill: "31 Dec 2026",
    color: "orange",
    icon: "🍛",
    tag: "Cuisine",
  },
];

const Offers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = async (coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedCode(coupon.code);
      showToast(`Code ${coupon.code} copied!`, "success");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleApply = (coupon) => {
    dispatch(
      applyCoupon({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        description: coupon.description,
      }),
    );
    showToast(`Coupon ${coupon.code} applied!`, "success");
    navigate("/restaurants");
  };

  return (
    <div className="container" style={{ padding: "28px 24px" }}>
      {/* HEADER */}
      <div className="offers-header">
        <div>
          <h1>Offers & Coupons 🎉</h1>
          <p className="offers-subtitle">
            Save more on every order with these exclusive deals
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="offers-grid">
        {COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;
          return (
            <div
              key={coupon.code}
              className={`offer-card offer-${coupon.color}`}
            >
              {/* Tag */}
              <span className="offer-tag">{coupon.tag}</span>

              {/* Icon + Title */}
              <div className="offer-top">
                <div className="offer-icon">{coupon.icon}</div>
                <div>
                  <h3 className="offer-title">{coupon.title}</h3>
                  <p className="offer-subtitle">{coupon.description}</p>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="offer-dashed" />

              {/* Code + Copy */}
              <div className="offer-code-row">
                <div className="offer-code-box">
                  <span className="offer-code-label">USE CODE</span>
                  <strong className="offer-code">{coupon.code}</strong>
                </div>

                <button
                  type="button"
                  className={`offer-copy-btn ${isCopied ? "copied" : ""}`}
                  onClick={() => handleCopy(coupon)}
                >
                  {isCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>

              {/* Footer */}
              <div className="offer-footer">
                <span className="offer-valid">
                  Valid till {coupon.validTill}
                </span>
                <button
                  type="button"
                  className="offer-apply-btn"
                  onClick={() => handleApply(coupon)}
                >
                  Apply →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HOW IT WORKS */}
      <section className="offers-how">
        <h2>How to use a coupon?</h2>
        <div className="offers-how-grid">
          <div className="offers-how-step">
            <div className="offers-how-num">1</div>
            <p>Browse offers and pick the one that fits your order</p>
          </div>
          <div className="offers-how-step">
            <div className="offers-how-num">2</div>
            <p>Copy the code or click "Apply" to add it to your cart</p>
          </div>
          <div className="offers-how-step">
            <div className="offers-how-num">3</div>
            <p>Discount is applied automatically at checkout 🎉</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
