import InfoPage from "../components/common/InfoPage";

const Terms = () => (
  <InfoPage
    eyebrow="LEGAL"
    icon="📜"
    title="Terms & Conditions"
    subtitle="Last updated: October 2026"
    sections={[
      {
        heading: "1. Acceptance of Terms",
        body: [
          "By accessing or using SPP FoodieApp, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.",
        ],
      },
      {
        heading: "2. Account & Eligibility",
        body: [
          "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.",
          "You agree to provide accurate, current, and complete information during registration and to update it as needed.",
        ],
      },
      {
        heading: "3. Ordering & Payment",
        body: [
          "All orders placed through SPP FoodieApp are subject to acceptance by the partner restaurant. We reserve the right to refuse or cancel any order.",
          "Payment must be completed at the time of ordering for prepaid methods. Cash on Delivery is available for eligible orders.",
        ],
      },
      {
        heading: "4. Delivery",
        body: [
          "Estimated delivery times are indicative and may vary based on weather, traffic, and restaurant preparation times.",
          "Risk of loss passes to you upon delivery to the address you specified.",
        ],
      },
      {
        heading: "5. Cancellations & Refunds",
        body: [
          "Orders may be cancelled within 2 minutes of placement. After this window, the order is processed by the restaurant and cannot be cancelled.",
          "Refunds for cancelled or undelivered orders are issued within 3–5 business days.",
        ],
      },
      {
        heading: "6. Prohibited Conduct",
        items: [
          "Using the platform for any unlawful purpose",
          "Impersonating another person or entity",
          "Interfering with the platform's operation or security",
          "Posting false reviews or manipulating ratings",
        ],
      },
      {
        heading: "7. Limitation of Liability",
        body: [
          "SPP FoodieApp acts as a marketplace connecting customers with restaurants and delivery partners. We are not liable for the quality, safety, or legality of food prepared by partner restaurants.",
        ],
      },
      {
        heading: "8. Changes to Terms",
        body: [
          "We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance.",
        ],
      },
      {
        heading: "9. Contact",
        body: ["Questions? Email legal@foodiehub.com."],
      },
    ]}
  />
);

export default Terms;
