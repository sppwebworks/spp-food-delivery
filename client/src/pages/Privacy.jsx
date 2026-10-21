import InfoPage from "../components/common/InfoPage";

const Privacy = () => (
  <InfoPage
    eyebrow="LEGAL"
    icon="🔒"
    title="Privacy Policy"
    subtitle="Last updated: October 2026"
    sections={[
      {
        heading: "1. Information We Collect",
        items: [
          "Account info: name, email, phone number, hashed password",
          "Order info: items, delivery address, payment method",
          "Device info: IP address, browser, operating system",
          "Usage data: pages visited, time spent, click patterns",
          "Location data (only when you grant permission)",
        ],
      },
      {
        heading: "2. How We Use Your Information",
        items: [
          "To process and deliver your orders",
          "To communicate about orders, offers, and account updates",
          "To improve our platform and personalize your experience",
          "To prevent fraud, abuse, and security threats",
          "To comply with legal obligations",
        ],
      },
      {
        heading: "3. Information Sharing",
        body: [
          "We share your information with: partner restaurants (to fulfill orders), delivery partners (for delivery), payment processors (to process payments), and law enforcement (when legally required).",
          "We do not sell your personal information to third parties.",
        ],
      },
      {
        heading: "4. Cookies & Tracking",
        body: [
          "We use cookies to keep you logged in, remember preferences, and analyze traffic. You can disable cookies in your browser settings, but some features may not work.",
        ],
      },
      {
        heading: "5. Data Security",
        body: [
          "We use industry-standard encryption (TLS, bcrypt) and access controls to protect your data. However, no method is 100% secure.",
        ],
      },
      {
        heading: "6. Your Rights",
        items: [
          "Access and download your data",
          "Correct inaccurate information",
          "Delete your account and personal data",
          "Opt out of marketing emails",
          "File a complaint with your local data protection authority",
        ],
        note: "To exercise any of these rights, email privacy@foodiehub.com.",
      },
      {
        heading: "7. Children's Privacy",
        body: [
          "FoodieApp is not intended for users under 18. We do not knowingly collect data from minors.",
        ],
      },
      {
        heading: "8. Contact",
        body: ["For privacy questions, email privacy@foodiehub.com."],
      },
    ]}
  />
);

export default Privacy;
