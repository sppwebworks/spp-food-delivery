import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { clearCart } from "../features/cart/cartSlice";
import { useToast } from "../context/ToastContext";

/* ============================================================
   Load Stripe OUTSIDE the component (only once)
   ============================================================ */
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

/* ============================================================
   Inner form — used inside <Elements>
   ============================================================ */
function CheckoutForm({ orderId, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?paid=1&gateway=stripe`,
      },
      redirect: "if_required",
    });

    if (error) {
      showToast(error.message || "Payment failed", "error");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      dispatch(clearCart());
      showToast("Payment successful 🎉", "success");
      navigate(`/orders/${orderId}?paid=1&gateway=stripe`);
    } else {
      showToast("Payment did not complete", "error");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <div className="stripe-card-wrap">
        <PaymentElement />
      </div>

      <button
        type="submit"
        className="stripe-pay-btn"
        disabled={!stripe || !elements || processing}
      >
        {processing ? "Processing..." : `Pay ₹${amount}`}
      </button>

      <p className="stripe-secure">
        🔒 Secured by Stripe · Your card details are encrypted
      </p>
    </form>
  );
}

/* ============================================================
   Outer wrapper — checks clientSecret + stripeKey
   ============================================================ */
export default function StripeCheckout() {
  const { orderId } = useParams();
  const location = useLocation();
  const clientSecret = location.state?.clientSecret;
  const amount = location.state?.amount;

  if (!stripeKey) {
    return (
      <div className="container" style={{ padding: 60, textAlign: "center" }}>
        <h2>Stripe not configured</h2>
        <p style={{ color: "var(--text-3)", marginTop: 8 }}>
          Add <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to{" "}
          <code>client/.env</code> and restart the dev server.
        </p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container" style={{ padding: 60, textAlign: "center" }}>
        <h2>Invalid checkout session</h2>
        <p style={{ color: "var(--text-3)", marginTop: 8 }}>
          Please return to checkout and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="stripe-page">
      <div className="stripe-container">
        <div className="stripe-header">
          <div className="stripe-logo">🍽️</div>
          <h1>Complete Payment</h1>
          <p>Enter your card details to finish your order</p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#fc8019",
                colorBackground: "#ffffff",
                colorText: "#282c3f",
                colorDanger: "#e23744",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                borderRadius: "8px",
              },
            },
          }}
        >
          <CheckoutForm orderId={orderId} amount={amount} />
        </Elements>

        <div className="stripe-back">
          <a href="/checkout">← Back to checkout</a>
        </div>
      </div>
    </div>
  );
}
