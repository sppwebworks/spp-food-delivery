import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyCoupon,
  clearCoupon,
  selectCartSubtotal,
} from "../../features/cart/cartSlice";
import { useToast } from "../../context/ToastContext";

const CouponBox = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const coupon = useSelector((s) => s.cart.coupon);
  const subtotal = useSelector(selectCartSubtotal);

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async (e) => {
    e?.preventDefault();
    setError("");

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter a coupon code");
      return;
    }
    if (subtotal < 199) {
      setError("Minimum order value is ₹199");
      return;
    }

    setApplying(true);
    const res = await dispatch(applyCoupon(cleanCode));
    setApplying(false);

    if (applyCoupon.fulfilled.match(res)) {
      showToast(
        `${res.payload.code} applied! You saved ₹${res.payload.discount}`,
        "success",
      );
      setOpen(false);
      setCode("");
      setError("");
    } else {
      // ✅ Show backend's exact error message
      const errMsg = res.payload || "Invalid coupon code";
      setError(errMsg);
      showToast(errMsg, "error");
    }
  };

  const handleRemove = () => {
    dispatch(clearCoupon());
    showToast("Coupon removed", "success");
    setCode("");
    setError("");
  };

  const hasCoupon = Boolean(coupon?.code);
  const discountValue = Number(coupon?.discount) || 0;

  /* ============================================================
     APPLIED STATE
     ============================================================ */
  if (hasCoupon) {
    return (
      <div
        style={{
          margin: "0 16px 16px",
          padding: "14px 16px",
          background:
            "linear-gradient(135deg, rgba(72,196,121,0.10), rgba(72,196,121,0.04))",
          border: "1.5px dashed var(--success)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--success)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          ✓
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--success)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              marginBottom: 2,
            }}
          >
            Coupon Applied
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: 2,
            }}
          >
            {coupon.code}
          </div>
          <div
            style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}
          >
            You saved ₹{discountValue} 🎉
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--danger)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            padding: "6px 10px",
            borderRadius: 6,
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  /* ============================================================
     COLLAPSED STATE
     ============================================================ */
  if (!open) {
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError("");
          }}
          style={{
            width: "100%",
            padding: "14px 16px",
            background:
              "linear-gradient(135deg, var(--primary-light), rgba(252,128,25,0.02))",
            border: "1.5px dashed var(--primary)",
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "all 0.2s",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--text)",
                marginBottom: 2,
              }}
            >
              Apply Coupon
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)" }}>
              Save more on your order
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    );
  }

  /* ============================================================
     OPEN STATE
     ============================================================ */
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          padding: 16,
          background: "var(--bg-2)",
          border: error
            ? "1.5px solid var(--danger)"
            : "1.5px solid var(--primary)",
          borderRadius: 12,
          boxShadow: error
            ? "0 0 0 3px rgba(226,55,68,0.08)"
            : "0 0 0 3px var(--primary-light)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
            Enter Coupon Code
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCode("");
              setError("");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-3)",
              fontSize: 18,
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleApply} style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            maxLength={20}
            autoFocus
            style={{
              flex: 1,
              padding: "11px 14px",
              border: error
                ? "1.5px solid var(--danger)"
                : "1.5px solid var(--border-2)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              background: "var(--bg)",
              color: "var(--text)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={applying || !code.trim()}
            style={{
              padding: "11px 20px",
              background:
                code.trim() && !applying ? "var(--primary)" : "var(--border-2)",
              color: code.trim() && !applying ? "#fff" : "var(--text-3)",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 800,
              cursor: code.trim() && !applying ? "pointer" : "not-allowed",
              letterSpacing: "0.3px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {applying ? "..." : "APPLY"}
          </button>
        </form>

        {/* ✅ Error message from backend — shown inline */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "rgba(226,55,68,0.06)",
              border: "1px solid rgba(226,55,68,0.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--danger)",
              fontWeight: 600,
              lineHeight: 1.5,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          <span>💡 Try WELCOME05, FESTIVE10</span>
          <span>Min order ₹199</span>
        </div>
      </div>
    </div>
  );
};

export default CouponBox;
