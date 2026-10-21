import InfoPage from "../components/common/InfoPage";

const Partner = () => (
  <InfoPage
    eyebrow="FOR RESTAURANTS"
    icon="🤝"
    title="Partner with FoodieApp"
    subtitle="Grow your restaurant with India's fastest-growing food delivery platform."
    sections={[
      {
        heading: "Why partner with us",
        items: [
          "Reach 500K+ hungry customers across 50 cities",
          "Zero onboarding fee — start selling in 48 hours",
          "Transparent weekly payouts with zero hidden charges",
          "Marketing boost for new restaurants — 30 days free",
          "Dedicated partner success manager",
          "Real-time dashboard to track orders and revenue",
        ],
      },
      {
        heading: "Who can partner",
        items: [
          "Restaurants (dine-in, takeaway, or cloud kitchen)",
          "Home chefs with a valid FSSAI license",
          "Bakeries, cafes, and dessert shops",
          "Food trucks and pop-up kitchens",
        ],
        note: "All partners must have a valid FSSAI license and meet our hygiene standards.",
      },
      {
        heading: "How to get started",
        body: [
          "Step 1: Fill the partner application on our website with your restaurant details.",
          "Step 2: Our team visits for a quick hygiene and quality check.",
          "Step 3: Sign the agreement, upload your menu, and you're live within 48 hours.",
        ],
      },
    ]}
    footerCta={{ label: "Apply as a Partner", to: "/contact" }}
  />
);

export default Partner;
