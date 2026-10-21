/**
 * ============================================================
 * OFFER BANNER — Home page promo
 * ============================================================
 *
 * Design (matches Swiggy):
 *   ┌─────────────────────────────────────────────────┐
 *   │  ┌──────────┐    50% OFF                        │
 *   │  │  image   │    On your first order            │
 *   │  │          │    [ ORDER NOW ]                  │
 *   │  └──────────┘                                   │
 *   └─────────────────────────────────────────────────┘
 *
 * Props:
 *   title      → "50% OFF" (default)
 *   subtitle   → "On your first order"
 *   ctaLabel   → "ORDER NOW"
 *   ctaLink    → "/restaurants"
 *   image      → optional image URL
 *   variant    → "primary" | "dark" | "orange" (default: "dark")
 * ============================================================
 */

import { Link } from "react-router-dom";

const OfferBanner = ({
  title = "50% OFF",
  subtitle = "On your first order",
  ctaLabel = "ORDER NOW",
  ctaLink = "/restaurants",
  image = null,
  variant = "dark",
}) => {
  const variants = {
    dark: {
      bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      text: "#fff",
      accent: "#fc8019",
      btnBg: "#fc8019",
      btnText: "#fff",
    },
    orange: {
      bg: "linear-gradient(135deg, #fc8019 0%, #e56f0e 100%)",
      text: "#fff",
      accent: "#fff",
      btnBg: "#fff",
      btnText: "#fc8019",
    },
    primary: {
      bg: "linear-gradient(135deg, #e23744 0%, #b91c2b 100%)",
      text: "#fff",
      accent: "#fff",
      btnBg: "#fff",
      btnText: "#e23744",
    },
  };

  const v = variants[variant] || variants.dark;

  return (
    <div
      className="offer-banner"
      style={{
        background: v.bg,
        color: v.text,
      }}
    >
      <div className="offer-banner-content">
        <h3 className="offer-banner-title" style={{ color: v.accent }}>
          {title}
        </h3>
        <p className="offer-banner-subtitle" style={{ color: v.text }}>
          {subtitle}
        </p>
        <Link
          to={ctaLink}
          className="offer-banner-cta"
          style={{
            background: v.btnBg,
            color: v.btnText,
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="offer-banner-image" aria-hidden="true">
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="offer-banner-emoji">🎉</div>
        )}
      </div>
    </div>
  );
};

export default OfferBanner;
