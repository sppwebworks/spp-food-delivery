/**
 * ============================================================
 * FOOTER — with working newsletter subscription
 * ============================================================
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

const FOOTER_LINKS = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Our Team", to: "/team" },
    { label: "Blog", to: "/blog" },
    { label: "Press", to: "/press" },
  ],
  Support: [
    { label: "Contact Us", to: "/contact" },
    { label: "Help Center", to: "/help" },
    { label: "Partner With Us", to: "/partner" },
    { label: "Ride With Us", to: "/ride" },
    { label: "Report an Issue", to: "/report" },
  ],
  Legal: [
    { label: "Terms & Conditions", to: "/terms" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Cookie Policy", to: "/cookies" },
    { label: "Refund Policy", to: "/refunds" },
    { label: "Licenses", to: "/licenses" },
  ],
};

const Footer = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      showToast("Please enter your email", "error");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmed)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/newsletter/subscribe", {
        email: trimmed,
        source: "footer",
      });

      showToast(data.message || "Thanks for subscribing!", "success");
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* ---------- BRAND ---------- */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span style={{ fontSize: 26 }}>🍽️</span>
            <span>SPP FoodieApp</span>
          </div>

          <p>
            Delivering great food, one order at a time. Fresh from your
            favourite kitchens to your doorstep.
          </p>

          {/* Social icons */}
          <div className="footer-social">
            <a href="#" aria-label="Twitter" className="footer-social-btn">
              𝕏
            </a>
            <a href="#" aria-label="Instagram" className="footer-social-btn">
              📷
            </a>
            <a href="#" aria-label="Facebook" className="footer-social-btn">
              f
            </a>
            <a href="#" aria-label="YouTube" className="footer-social-btn">
              ▶
            </a>
          </div>
        </div>

        {/* ---------- LINK COLUMNS ---------- */}
        <div className="footer-columns">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              {links.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* ---------- NEWSLETTER ---------- */}
          <div className="footer-col footer-newsletter">
            <h4>Stay Hungry</h4>
            <p className="footer-newsletter-text">
              Exclusive offers and new restaurant alerts, straight to your
              inbox.
            </p>

            {subscribed ? (
              <div className="footer-newsletter-success">
                <span className="footer-newsletter-success-icon">✓</span>
                <span>You're subscribed!</span>
              </div>
            ) : (
              <form
                className="footer-newsletter-form"
                onSubmit={handleSubscribe}
              >
                <div className="footer-newsletter-field">
                  <span className="footer-newsletter-icon" aria-hidden="true">
                    ✉
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading || !email.trim()}>
                    {loading ? (
                      <span className="footer-newsletter-spinner" />
                    ) : (
                      "→"
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="footer-newsletter-privacy">
              <span aria-hidden="true">🔒</span> We respect your privacy.
              Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- BOTTOM BAR ---------- */}
      <div className="footer-bottom">
        <span className="footer-copyright">
          © {new Date().getFullYear()} SPP FoodieApp. Built with ❤️ using React +
          MERN
        </span>

        <div className="footer-bottom-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
