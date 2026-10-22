import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, selectCartItems } from "../features/cart/cartSlice";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

const Offers = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const cartItems = useSelector(selectCartItems);
  const { token } = useSelector((s) => s.auth);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCoupons = async () => {
      try {
        // ✅ Cache-busting: force a fresh response every time
        const { data } = await api.get(`/coupons?_t=${Date.now()}`);

        // ✅ Defense in depth: drop inactive OR expired coupons
        const now = new Date();
        const usable = (data.coupons || []).filter((c) => {
          if (c.isActive === false) return false;
          if (c.expiresAt && new Date(c.expiresAt) <= now) return false;
          return true;
        });

        if (!cancelled) setCoupons(usable);
      } catch (err) {
        console.error("Failed to load coupons", err);
        if (!cancelled) showToast("Failed to load offers", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCoupons();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("Code copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = async (code) => {
    if (!token) {
      showToast("Please login to apply coupons", "error");
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      showToast("Your cart is empty. Add items first!", "error");
      return;
    }

    const result = await dispatch(applyCoupon(code));
    if (applyCoupon.fulfilled.match(result)) {
      showToast(`Coupon ${code} applied successfully!`, "success");
      navigate("/checkout");
    } else {
      showToast(result.payload || "Failed to apply coupon", "error");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 40, textAlign: "center" }}>
        Loading offers...
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}
    >
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

      {coupons.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: 40, color: "var(--text-3)" }}
        >
          No active offers right now. Check back later!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
            marginBottom: 60,
          }}
        >
          {coupons.map((offer, index) => {
            const colors = ["orange", "red", "purple", "green", "blue"];
            const emojis = ["🎉", "🍕", "🎁", "🛵", "🌟", "🍛"];
            const color = colors[index % colors.length];
            const emoji = emojis[index % emojis.length];

            return (
              <div
                key={offer._id}
                className={`offer-card offer-${color}`}
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
                    {emoji}
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
                      {offer.discountType === "percentage"
                        ? `${offer.discountValue}% OFF`
                        : `Flat ₹${offer.discountValue} OFF`}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-2)",
                        margin: 0,
                      }}
                    >
                      On orders above ₹{offer.minOrderValue}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1.5px dashed var(--border)",
                    margin: "4px 0",
                  }}
                />

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
                    onClick={() => handleCopy(offer.code, offer._id)}
                    style={{
                      padding: "0 16px",
                      height: 48,
                      alignSelf: "flex-end",
                      borderRadius: 10,
                      background:
                        copiedId === offer._id
                          ? "rgba(72, 196, 121, 0.15)"
                          : "var(--bg-3)",
                      color:
                        copiedId === offer._id
                          ? "var(--success)"
                          : "var(--text)",
                      border: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {copiedId === offer._id ? "Copied!" : "Copy"}
                  </button>
                </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Offers;
