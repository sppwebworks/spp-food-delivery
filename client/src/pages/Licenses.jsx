import InfoPage from "../components/common/InfoPage";

const Licenses = () => (
  <InfoPage
    eyebrow="LEGAL"
    icon="📋"
    title="Licenses & Attributions"
    subtitle="Open-source software and content licenses used in SPP FoodieApp."
    sections={[
      {
        heading: "Our licenses",
        items: [
          "FSSAI License No. 10019064001555",
          "GSTIN 29AAACF1234A1Z5",
          "Trade License issued by BBMP, Bangalore",
          "Shop & Establishment Registration",
        ],
      },
      {
        heading: "Open-source software",
        items: [
          "React — MIT License",
          "Redux Toolkit — MIT License",
          "React Router — MIT License",
          "Express — MIT License",
          "MongoDB / Mongoose — Apache 2.0 / MIT",
          "Nodemailer — MIT License",
        ],
      },
      {
        heading: "Third-party content",
        items: [
          "Recipe data — TheMealDB (Free API, non-commercial)",
          "Icons — Emoji (native system fonts)",
          "Fonts — System font stack (San Francisco, Segoe UI, Roboto)",
          "Illustrations — Custom in-house designs",
        ],
      },
      {
        heading: "Trademarks",
        body: [
          "SPP FoodieApp, the fork-and-plate logo, and related marks are trademarks of SPP FoodieApp Technologies Pvt. Ltd. Unauthorized use is prohibited.",
        ],
      },
      {
        heading: "Attribution requests",
        body: [
          "If you believe your content has been used without proper attribution, contact legal@foodiehub.com.",
        ],
      },
    ]}
  />
);

export default Licenses;
