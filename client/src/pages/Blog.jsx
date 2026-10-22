import InfoPage from "../components/common/InfoPage";

const Blog = () => (
  <InfoPage
    eyebrow="STORIES & INSIGHTS"
    icon="✍️"
    title="The SPP FoodieApp Blog"
    subtitle="Recipes, restaurant stories, and behind-the-scenes from the food delivery industry."
    sections={[
      {
        heading: "Trending this week",
        items: [
          "The 10 most-ordered dishes in Bangalore this month",
          "How we cut average delivery time by 4 minutes",
          "The rise of cloud kitchens — what it means for customers",
          "A day in the life of a SPP FoodieApp delivery partner",
        ],
      },
      {
        heading: "Categories we write about",
        items: [
          "Food Culture — local cuisines, chef interviews, ingredient deep dives",
          "Engineering — how we build and scale the platform",
          "Operations — logistics, delivery, partner onboarding",
          "Health & Nutrition — eating well while ordering out",
        ],
        note: "New posts every Tuesday and Friday. Subscribe to our newsletter to get them delivered.",
      },
    ]}
    footerCta={{ label: "Subscribe to Newsletter", to: "/contact" }}
  />
);

export default Blog;
