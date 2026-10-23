/**
 * ============================================================
 * PAYMENT SELECTOR
 * ============================================================
 *
 * Options:
 *   cod       : Cash on Delivery
 *   stripe    : Credit / Debit card (Stripe Checkout)
 *   razorpay  : Razorpay hosted checkout (UPI, Cards, NB, Wallets)
 *   phonepe   : PhonePe UPI
 *   upi       : Generic UPI intent (Google Pay, Paytm, BHIM)
 *
 * Props:
 *   value    → string (current selected method)
 *   onChange → (method) => void
 * ============================================================
 */

const PAYMENT_OPTIONS = [
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💵",
  },
  {
    value: "stripe",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex via Stripe",
    icon: "💳",
  },
  {
    value: "razorpay",
    label: "Razorpay",
    description: "UPI, Cards, Netbanking, Wallets",
    icon: "🟦",
  },
  // {
  //   value: "phonepe",
  //   label: "PhonePe",
  //   description: "Pay with PhonePe UPI",
  //   icon: "📱",
  // },
  // {
  //   value: "upi",
  //   label: "Other UPI Apps",
  //   description: "Google Pay, Paytm, BHIM",
  //   icon: "🇮🇳",
  // },
];

const PaymentSelector = ({ value, onChange }) => {
  return (
    <div className="payment-options">
      {PAYMENT_OPTIONS.map((opt) => (
        <label
          key={opt.value}
          className={`payment-option ${value === opt.value ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="payment"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="payment-icon">{opt.icon}</span>
          <div className="payment-info">
            <strong>{opt.label}</strong>
            <small>{opt.description}</small>
          </div>
        </label>
      ))}
    </div>
  );
};

export default PaymentSelector;
