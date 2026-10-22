import InfoPage from "../components/common/InfoPage";

const Refunds = () => (
  <InfoPage
    eyebrow="LEGAL"
    icon="💸"
    title="Refund Policy"
    subtitle="Last updated: October 2026"
    sections={[
      {
        heading: "When you're eligible for a refund",
        items: [
          "Order cancelled before preparation starts",
          "Order not delivered within 60 minutes of promised time",
          "Missing items from your order",
          "Incorrect items delivered",
          "Food quality issues (verified by our team)",
          "Payment charged twice by mistake",
        ],
      },
      {
        heading: "When you're NOT eligible",
        items: [
          "Change of mind after food is prepared",
          "Incorrect delivery address provided by you",
          "Unavailable at delivery address when partner arrives",
          "Order marked delivered but rejected at the door",
        ],
      },
      {
        heading: "How to request a refund",
        body: [
          "Step 1: Open your Orders page and select the affected order.",
          "Step 2: Tap 'Report an Issue' and select the reason.",
          "Step 3: Upload photos if applicable (missing items, quality issues).",
          "Step 4: Submit — our team responds within 24 hours.",
        ],
      },
      {
        heading: "Refund timelines",
        items: [
          "UPI / Netbanking — 3 to 5 business days",
          "Credit / Debit Card — 5 to 7 business days",
          "Wallet — within 24 hours",
          "SPP FoodieApp Credits — instant",
        ],
        note: "Timelines are set by your bank or payment provider and may vary.",
      },
      {
        heading: "Partial refunds",
        body: [
          "For missing items or late delivery, we may issue a partial refund proportional to the affected items or delay.",
        ],
      },
    ]}
  />
);

export default Refunds;
