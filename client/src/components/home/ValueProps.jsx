/**
 * ============================================================
 * VALUE PROPS — "Why choose us"
 * ============================================================
 */

const PROPS = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Average 30-minute delivery across the city.",
    accent: "orange",
  },
  {
    icon: "🥗",
    title: "Fresh Ingredients",
    description: "Sourced from local farms, cooked to order.",
    accent: "green",
  },
  {
    icon: "🛡️",
    title: "Hygiene First",
    description: "Every kitchen audited monthly for safety.",
    accent: "blue",
  },
  {
    icon: "💸",
    title: "Best Prices",
    description: "Daily offers and loyalty rewards.",
    accent: "purple",
  },
];

const ValueProps = () => (
  <section className="value-props">
    <div className="section-header">
      <div>
        <h2 className="section-title">Why SPP FoodieApp?</h2>
        <p className="section-subtitle">
          Trusted by over a million hungry customers
        </p>
      </div>
    </div>

    <div className="value-props-grid">
      {PROPS.map((p) => (
        <div key={p.title} className={`value-card value-card-${p.accent}`}>
          <div className="value-icon">{p.icon}</div>
          <h3 className="value-title">{p.title}</h3>
          <p className="value-desc">{p.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default ValueProps;
