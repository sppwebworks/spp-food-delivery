import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inner form component
function CheckoutForm({ orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?paid=1&gateway=stripe`,
      },
      redirect: "if_required",
    });

    if (error) {
      console.error(error.message);
    } else if (paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
        Pay Now
      </button>
    </form>
  );
}

// Main component
export default function StripeCheckout({ clientSecret, orderId, onSuccess }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm orderId={orderId} onSuccess={onSuccess} />
    </Elements>
  );
}
