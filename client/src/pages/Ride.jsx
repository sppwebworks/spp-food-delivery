import InfoPage from "../components/common/InfoPage";

const Ride = () => (
  <InfoPage
    eyebrow="FOR DELIVERY PARTNERS"
    icon="🛵"
    title="Ride with FoodieApp"
    subtitle="Earn on your own schedule — bike, cycle, or walk. Your choice."
    sections={[
      {
        heading: "Why ride with us",
        items: [
          "Earn ₹20,000–40,000 per month depending on hours",
          "Weekly payouts directly to your bank account",
          "Insurance coverage up to ₹5 lakh",
          "Free uniform, thermal bag, and phone mount",
          "Flexible timings — work when you want",
          "In-app support, 24/7",
        ],
      },
      {
        heading: "What you need",
        items: [
          "Valid driving license (for bike/scooter)",
          "Aadhaar card and PAN card",
          "A two-wheeler or bicycle (we provide walking routes too)",
          "Android phone with active internet",
          "Age 18+",
        ],
      },
      {
        heading: "How to join",
        body: [
          "Step 1: Download the FoodieApp Rider app and register with your phone number.",
          "Step 2: Upload your documents — verification takes under 24 hours.",
          "Step 3: Complete a short training session at your nearest hub.",
          "Step 4: Start accepting orders and earn.",
        ],
        note: "No joining fee. No deposit. Start earning from day one.",
      },
    ]}
    footerCta={{ label: "Apply as a Rider", to: "/contact" }}
  />
);

export default Ride;
