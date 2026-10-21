/**
 * ============================================================
 * TEAM PAGE  (/team)
 * ============================================================
 */

const FOUNDERS = [
  {
    emoji: "👨‍💼",
    name: "Aarav Sharma",
    role: "Co-founder & CEO",
    bio: "Ex-food blogger with a decade in media. Believes the perfect biryani is worth any wait.",
  },
  {
    emoji: "👩‍💻",
    name: "Priya Menon",
    role: "Co-founder & CTO",
    bio: "Built the routing engine that keeps your food hot. Previously at Swiggy and Zomato.",
  },
  {
    emoji: "🧑‍🍳",
    name: "Rohan Kapoor",
    role: "Co-founder & COO",
    bio: "Has personally visited 800+ partner kitchens. Obsessed with hygiene and speed.",
  },
];

const HEADS = [
  {
    emoji: "👩‍🎨",
    name: "Ishita Verma",
    role: "Head of Design",
    bio: "The reason our app feels like a restaurant menu, not a form.",
  },
  {
    emoji: "👨‍💻",
    name: "Karthik Iyer",
    role: "Head of Engineering",
    bio: "Scaled our infra from 10K to 500K daily requests without a single down-minute.",
  },
  {
    emoji: "👩‍📊",
    name: "Neha Bansal",
    role: "Head of Growth",
    bio: "Turned our first 1,000 users into the first million. Runs on data and dosas.",
  },
  {
    emoji: "👨‍⚖️",
    name: "Arjun Rao",
    role: "Head of Legal",
    bio: "Keeps us compliant across 50 cities. Also runs the best coffee club in office.",
  },
];

const Team = () => {
  return (
    <div className="team-page">
      {/* HERO */}
      <section className="team-hero">
        <div className="team-hero-inner">
          <span className="team-hero-eyebrow">THE PEOPLE</span>
          <h1 className="team-hero-title">
            Meet the humans behind <span>every meal</span>.
          </h1>
          <p className="team-hero-subtitle">
            A small team of food-obsessed builders, designers, and operators
            working to make mealtime a little better for millions.
          </p>
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="team-section">
        <div className="team-section-header">
          <span className="team-section-eyebrow">FOUNDERS</span>
          <h2>The originals</h2>
          <p>Three friends, one kitchen, and a very bad first dish.</p>
        </div>

        <div className="team-grid team-grid-3">
          {FOUNDERS.map((p) => (
            <TeamCard key={p.name} person={p} featured />
          ))}
        </div>
      </section>

      {/* HEADS */}
      <section className="team-section team-section-alt">
        <div className="team-section-header">
          <span className="team-section-eyebrow">LEADERSHIP</span>
          <h2>The leadership team</h2>
          <p>The people who keep the operation running, day and night.</p>
        </div>

        <div className="team-grid team-grid-4">
          {HEADS.map((p) => (
            <TeamCard key={p.name} person={p} />
          ))}
        </div>
      </section>

      {/* JOIN */}
      <section className="team-join">
        <h2>Want to join us?</h2>
        <p>We're always looking for people who love food as much as we do.</p>
        <div className="team-join-actions">
          <a href="/careers" className="btn-primary btn-large">
            View Open Roles
          </a>
          <a href="/contact" className="btn-outline btn-large">
            Say Hello
          </a>
        </div>
      </section>
    </div>
  );
};

const TeamCard = ({ person, featured = false }) => (
  <div className={`team-card ${featured ? "team-card-featured" : ""}`}>
    <div className="team-card-avatar">{person.emoji}</div>
    <h3>{person.name}</h3>
    <p className="team-card-role">{person.role}</p>
    <p className="team-card-bio">{person.bio}</p>
  </div>
);

export default Team;
