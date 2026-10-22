import InfoPage from "../components/common/InfoPage";

const Press = () => (
  <InfoPage
    eyebrow="MEDIA & PRESS"
    icon="📰"
    title="Press & Media"
    subtitle="Everything journalists need to write about SPP FoodieApp."
    sections={[
      {
        heading: "About SPP FoodieApp",
        body: [
          "SPP FoodieApp is India's fastest-growing food delivery platform, connecting millions of customers with over 12,000 partner restaurants across 50+ cities.",
          "Founded in 2019 in Bangalore, we've delivered over 50 million orders with an average rating of 4.8 stars.",
        ],
      },
      {
        heading: "Press kit",
        items: [
          "Brand guidelines (PDF, logo pack, color palette)",
          "Founder bios and high-resolution photos",
          "Company fact sheet with key metrics",
          "Product screenshots and app demos",
        ],
        note: "Request the press kit at press@foodiehub.com.",
      },
      {
        heading: "Recent coverage",
        items: [
          "TechCrunch — 'SPP FoodieApp raises $50M Series B to expand into tier-2 cities'",
          "YourStory — 'How three friends built India's fastest food delivery app'",
          "Economic Times — 'Food delivery wars: SPP FoodieApp's strategy to win'",
          "Forbes India — 'The 30 under 30 changemakers behind SPP FoodieApp'",
        ],
      },
      {
        heading: "Media inquiries",
        body: [
          "For interviews, quotes, or data requests, contact our communications team at press@foodiehub.com. We typically respond within 24 hours.",
        ],
      },
    ]}
  />
);

export default Press;
