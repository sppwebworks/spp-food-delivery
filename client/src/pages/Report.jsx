import InfoPage from "../components/common/InfoPage";

const Report = () => (
  <InfoPage
    eyebrow="REPORT AN ISSUE"
    icon="🚨"
    title="Report an Issue"
    subtitle="Something went wrong? Tell us and we'll make it right."
    sections={[
      {
        heading: "Common issues to report",
        items: [
          "Order not delivered or delivered late",
          "Missing or incorrect items",
          "Food quality or safety concerns",
          "Wrong amount charged",
          "Rude delivery partner or restaurant staff",
          "App bug or payment failure",
        ],
      },
      {
        heading: "What we need from you",
        items: [
          "Your Order ID (found on the Orders page)",
          "Screenshots if the issue is app-related",
          "A clear description of what went wrong",
          "Your contact number for follow-up",
        ],
        note: "We respond to all reports within 24 hours and often within 2 hours during working times.",
      },
      {
        heading: "What happens next",
        body: [
          "Our support team reviews your report and contacts you within 24 hours.",
          "For valid claims, we issue refunds or credits to your account within 3–5 business days.",
          "For food safety issues, we escalate to the restaurant partner and may suspend them pending investigation.",
        ],
      },
    ]}
    footerCta={{ label: "Contact Support", to: "/contact" }}
  />
);

export default Report;
