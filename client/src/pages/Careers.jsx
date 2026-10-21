import InfoPage from "../components/common/InfoPage";

const Careers = () => (
  <InfoPage
    eyebrow="JOIN THE TEAM"
    icon="💼"
    title="Careers at FoodieApp"
    subtitle="We're building the future of food delivery — and we're hiring."
    sections={[
      {
        heading: "Why work with us",
        items: [
          "Competitive salary + equity for early employees",
          "Fully remote-friendly — work from anywhere in India",
          "Health insurance for you and your family",
          "Annual learning budget of ₹50,000",
          "Free food delivery credits every month (obviously)",
          "Quarterly team offsites and celebrations",
        ],
      },
      {
        heading: "Open positions",
        items: [
          "Senior Frontend Engineer (React) — Bangalore / Remote",
          "Backend Engineer (Node.js) — Bangalore / Remote",
          "Product Designer (UI/UX) — Bangalore",
          "Growth Marketing Manager — Mumbai",
          "Data Scientist — Remote",
          "Customer Success Lead — Delhi NCR",
        ],
      },
      {
        heading: "Our hiring process",
        body: [
          "We keep it fast — usually 2 weeks from first contact to offer.",
          "Step 1: Intro call with our talent team. Step 2: Technical or portfolio deep dive. Step 3: Culture and values interview. Step 4: Offer and reference check.",
        ],
        note: "Send your resume to careers@foodiehub.com with the role in the subject line.",
      },
    ]}
  />
);

export default Careers;
