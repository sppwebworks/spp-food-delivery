import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchActiveBanners } from "../../features/banner/bannerSlice";
import { fetchMyOrders } from "../../features/orders/ordersSlice";

const AnnouncementBar = () => {
  const dispatch = useDispatch();

  const { top } = useSelector((s) => s.banner);
  const { token, user, authLoaded } = useSelector((s) => s.auth);
  const { items: userOrders, loaded: ordersLoaded } = useSelector(
    (s) => s.orders,
  );

  // ✅ Dismissal is per-banner (not global forever)
  // If admin creates a NEW banner (different title/id), it resets automatically
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Re-check dismissal whenever a banner loads
    if (!top?._id) {
      setDismissed(false);
      return;
    }
    const key = `hideAnnouncement_${top._id}`;
    const stored = localStorage.getItem(key);
    setDismissed(stored === "1");
  }, [top?._id]);

  useEffect(() => {
    dispatch(fetchActiveBanners());
    if (token && !ordersLoaded) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, token, ordersLoaded]);

  const handleClose = () => {
    if (!top?._id) return;
    const key = `hideAnnouncement_${top._id}`;
    localStorage.setItem(key, "1");
    setDismissed(true);
  };

  /* ────────────────────────────────────────────────────────
     SHOW / HIDE LOGIC
     ──────────────────────────────────────────────────────── */

  if (dismissed) return null;
  if (!top) return null;

  // Hide first-order coupons for returning users
  const isLoggedIn = !!token;
  const bothLoaded = authLoaded && ordersLoaded;

  if (isLoggedIn && bothLoaded) {
    const isReturningUser = userOrders.length > 0;
    const isFirstOrderCoupon =
      top.couponCode?.toUpperCase() === "WELCOME05" ||
      top.couponCode?.toUpperCase() === "WELCOME32" ||
      top.title?.toLowerCase().includes("first order");

    if (isReturningUser && isFirstOrderCoupon) {
      return null;
    }
  }

  return (
    <div className="announcement-bar">
      <div className="announcement-bar-inner">
        <span className="announcement-emoji">🎁</span>
        <span className="announcement-text">{top.title}</span>

        {top.couponCode && (
          <span
            style={{
              background: "#fff",
              color: "#fc8019",
              padding: "2px 8px",
              borderRadius: "4px",
              fontWeight: 800,
              fontSize: "12px",
              letterSpacing: "1px",
              border: "1px dashed rgba(252, 128, 25, 0.5)",
              marginLeft: "8px",
            }}
          >
            CODE: {top.couponCode}
          </span>
        )}

        <Link to={top.ctaLink || "/restaurants"} className="announcement-cta">
          {top.ctaText || "Order Now →"}
        </Link>

        <button
          className="announcement-close"
          onClick={handleClose}
          aria-label="Close announcement"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
