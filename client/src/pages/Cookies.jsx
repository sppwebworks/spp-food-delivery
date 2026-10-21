import InfoPage from "../components/common/InfoPage";

const Cookies = () => (
  <InfoPage
    eyebrow="LEGAL"
    icon="🍪"
    title="Cookie Policy"
    subtitle="Last updated: October 2026"
    sections={[
      {
        heading: "What are cookies?",
        body: [
          "Cookies are small text files stored on your device when you visit our website. They help us remember you and improve your experience.",
        ],
      },
      {
        heading: "Types of cookies we use",
        items: [
          "Essential cookies — login sessions, cart contents, security",
          "Preference cookies — theme (dark/light), language, city",
          "Analytics cookies — pages visited, time on site, click paths",
          "Marketing cookies — ad performance, retargeting",
        ],
      },
      {
        heading: "Third-party cookies",
        body: [
          "We use Google Analytics for traffic analysis and Stripe/Razorpay for payment processing. These services may set their own cookies.",
        ],
      },
      {
        heading: "Managing cookies",
        body: [
          "You can control or delete cookies through your browser settings. Note that disabling essential cookies may break core functionality.",
        ],
        note: "Most browsers let you block third-party cookies while allowing first-party ones.",
      },
      {
        heading: "Contact",
        body: ["Questions? Email privacy@foodiehub.com."],
      },
    ]}
  />
);

export default Cookies;
