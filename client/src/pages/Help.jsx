/**
 * ============================================================
 * HELP CENTER  (/help)
 * ============================================================
 * Category grid + FAQ + CTA
 * ============================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  {
    icon: "📦",
    title: "Orders",
    description: "Track, cancel, or modify an order",
    topics: [
      "Track my order",
      "Cancel an order",
      "Order delayed",
      "Missing items",
    ],
  },
  {
    icon: "💳",
    title: "Payments",
    description: "Refunds, failed transactions, billing",
    topics: [
      "Refund status",
      "Payment failed",
      "Add payment method",
      "Coupon not applied",
    ],
  },
  {
    icon: "👤",
    title: "Account",
    description: "Login issues, profile, security",
    topics: [
      "Reset password",
      "Update phone",
      "Delete account",
      "Login issues",
    ],
  },
  {
    icon: "🛵",
    title: "Delivery",
    description: "Delivery times, address, contact",
    topics: [
      "Change address",
      "Delivery not arrived",
      "Contact delivery partner",
    ],
  },
  {
    icon: "🍽️",
    title: "Restaurants",
    description: "Partner info, menu, availability",
    topics: ["Add a restaurant", "Menu not showing", "Restaurant closed"],
  },
  {
    icon: "🎁",
    title: "Offers & Rewards",
    description: "Coupons, loyalty, referrals",
    topics: ["Coupon not working", "Referral bonus", "Loyalty points"],
  },
];

const QUICK_FAQS = [
  {
    q: "How do I track my order?",
    a: "Open your Orders page → tap the order → you'll see a live tracker that updates from 'Placed' to 'Delivered'.",
  },
  {
    q: "Can I cancel an order?",
    a: "Yes — you can cancel up to 2 minutes after placing the order. After that, the kitchen has already started preparing.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds for cancelled or undelivered orders are processed within 3–5 business days to your original payment method.",
  },
  {
    q: "What if my order is late?",
    a: "If your order is 15+ minutes late, you can request a partial refund from the order detail page. We'll review within 24 hours.",
  },
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="help-page">
      {/* HERO */}
      <section className="help-hero">
        <div className="help-hero-inner">
          <span className="help-hero-eyebrow">SUPPORT</span>
          <h1 className="help-hero-title">
            How can we <span>help you</span>?
          </h1>
          <p className="help-hero-subtitle">
            Browse common topics below, or reach out to our support team — we're
            available 24/7.
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="help-categories">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="help-cat-card">
            <div className="help-cat-icon">{cat.icon}</div>
            <h3 className="help-cat-title">{cat.title}</h3>
            <p className="help-cat-desc">{cat.description}</p>
            <ul className="help-cat-topics">
              {cat.topics.map((t) => (
                <li key={t}>
                  <span className="help-topic-arrow">→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="help-faq-section">
        <div className="help-faq-header">
          <span className="help-hero-eyebrow">POPULAR QUESTIONS</span>
          <h2>Quick answers</h2>
          <p>The questions we hear most often.</p>
        </div>

        <div className="help-faq-list">
          {QUICK_FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                className={`help-faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="help-faq-question"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="help-faq-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <div className="help-faq-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="help-cta">
        <div className="help-cta-content">
          <h2>Still stuck? Talk to a human.</h2>
          <p>
            Our support team replies within 30 minutes during working hours.
          </p>
          <div className="help-cta-actions">
            <Link to="/contact" className="btn-primary btn-large">
              Contact Support
            </Link>
            <a href="tel:+919876543210" className="btn-outline btn-large">
              📞 Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;
