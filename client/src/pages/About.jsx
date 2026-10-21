/**
 * ============================================================
 * ABOUT PAGE  (/about)
 * ============================================================
 * Sections:
 *   1. Hero — "Our Story"
 *   2. Mission stats
 *   3. Story timeline
 *   4. Values grid
 *   5. Team cards
 *   6. CTA — Join us
 * ============================================================
 */

import { Link } from "react-router-dom";

const STATS = [
  { value: "500K+", label: "Happy Customers", icon: "😋" },
  { value: "12K+", label: "Restaurants", icon: "🍽️" },
  { value: "50+", label: "Cities Served", icon: "📍" },
  { value: "4.8★", label: "Avg Rating", icon: "⭐" },
];

const TIMELINE = [
  {
    year: "2019",
    title: "The Idea",
    description:
      "Three friends, one kitchen, and a simple idea — food should arrive fast, fresh, and hot.",
    icon: "💡",
  },
  {
    year: "2020",
    title: "First Delivery",
    description:
      "Our first order went out from a tiny kitchen in Bangalore. 45 minutes — and it was still warm.",
    icon: "🛵",
  },
  {
    year: "2022",
    title: "10 Cities",
    description:
      "Word spread. We expanded to 10 cities and partnered with 2,000+ restaurants.",
    icon: "🏙️",
  },
  {
    year: "2024",
    title: "1 Million Orders",
    description:
      "A million orders later, we're still obsessed with making every meal memorable.",
    icon: "🎉",
  },
  {
    year: "2026",
    title: "Today",
    description:
      "Serving 50+ cities, backed by a community that loves great food. And we're just getting started.",
    icon: "🚀",
  },
];

const VALUES = [
  {
    icon: "⚡",
    title: "Speed",
    description:
      "We don't just deliver fast — we deliver while it's still steaming. Every minute matters.",
  },
  {
    icon: "🌱",
    title: "Quality",
    description:
      "Every restaurant on FoodieHub is vetted for hygiene, taste, and consistency.",
  },
  {
    icon: "💚",
    title: "Community",
    description:
      "We partner with local kitchens, empowering small businesses to reach millions.",
  },
  {
    icon: "🎯",
    title: "Reliability",
    description:
      "Rain, traffic, or rush hour — your order arrives when we promise it will.",
  },
  {
    icon: "🔒",
    title: "Trust",
    description:
      "Transparent pricing, honest reviews, secure payments. No surprises.",
  },
  {
    icon: "🌟",
    title: "Delight",
    description:
      "Small touches — free delivery, bonus coupons, warm packaging — add up.",
  },
];

const TEAM = [
  {
    name: "Aarav Sharma",
    role: "Co-founder & CEO",
    emoji: "👨‍💼",
    bio: "Ex-food blogger. Believes the perfect biryani is worth any wait.",
  },
  {
    name: "Priya Menon",
    role: "Co-founder & CTO",
    emoji: "👩‍💻",
    bio: "Built the routing engine that keeps your food hot.",
  },
  {
    name: "Rohan Kapoor",
    role: "Head of Operations",
    emoji: "🧑‍🍳",
    bio: "Has visited 800+ partner kitchens. Yes, 800.",
  },
  {
    name: "Ishita Verma",
    role: "Head of Design",
    emoji: "👩‍🎨",
    bio: "The reason our app feels like a restaurant menu, not a form.",
  },
];

const About = () => {
  return (
    <div className="about-page">
      {/* ============ HERO ============ */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-hero-eyebrow">SINCE 2019</span>
          <h1 className="about-hero-title">
            Food should feel <span>like home</span>.
          </h1>
          <p className="about-hero-subtitle">
            We started FoodieHub with a simple promise — bring the warmth of
            your favourite meal to your door, fast. Today, we're a family of
            millions who share that love.
          </p>

          <div className="about-hero-actions">
            <Link to="/restaurants" className="btn-primary btn-large">
              Order Now →
            </Link>
            <Link to="/contact" className="btn-outline btn-large">
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="about-hero-art" aria-hidden="true">
          <div className="about-hero-emoji">🍜</div>
          <div className="about-hero-emoji about-hero-emoji-2">🥘</div>
          <div className="about-hero-emoji about-hero-emoji-3">🍕</div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="about-stats">
        {STATS.map((stat) => (
          <div key={stat.label} className="about-stat">
            <div className="about-stat-icon">{stat.icon}</div>
            <div className="about-stat-value">{stat.value}</div>
            <div className="about-stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ============ STORY ============ */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-eyebrow">OUR STORY</span>
          <h2>From a tiny kitchen to 50+ cities</h2>
          <p>Every milestone taught us something. Here's how we grew.</p>
        </div>

        <div className="about-timeline">
          {TIMELINE.map((item, idx) => (
            <div key={item.year} className="about-timeline-item">
              <div className="about-timeline-marker">
                <span className="about-timeline-icon">{item.icon}</span>
              </div>
              <div className="about-timeline-content">
                <span className="about-timeline-year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              {idx < TIMELINE.length - 1 && (
                <div className="about-timeline-line" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="about-section about-section-alt">
        <div className="about-section-header">
          <span className="about-section-eyebrow">WHAT WE STAND FOR</span>
          <h2>Our values</h2>
          <p>Six principles that guide every decision we make.</p>
        </div>

        <div className="about-values">
          {VALUES.map((v) => (
            <div key={v.title} className="about-value-card">
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TEAM ============ */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="about-section-eyebrow">THE PEOPLE</span>
          <h2>Meet the team</h2>
          <p>A small group of food-obsessed people, building for millions.</p>
        </div>

        <div className="about-team">
          {TEAM.map((person) => (
            <div key={person.name} className="about-team-card">
              <div className="about-team-avatar">{person.emoji}</div>
              <h3>{person.name}</h3>
              <p className="about-team-role">{person.role}</p>
              <p className="about-team-bio">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Hungry yet?</h2>
          <p>
            Your next favourite meal is one tap away. Join millions who order
            with FoodieHub.
          </p>
          <div className="about-cta-actions">
            <Link to="/restaurants" className="btn-primary btn-large">
              Browse Restaurants
            </Link>
            <Link to="/register" className="btn-outline btn-large">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
