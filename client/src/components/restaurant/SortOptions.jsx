/**
 * ============================================================
 * SORT OPTIONS — Horizontal bar above grid
 * ============================================================
 *
 * Design:
 *   [ Relevance ▾ ]  [ Rating 4.0+ ]  [ Fast Delivery ]  [ ₹ Low → High ]
 *
 * Props:
 *   value      → string (current sort key)
 *   onChange   → (key) => void
 *   compact    → bool (hide labels, show chips only)
 * ============================================================
 */

const SORT_CHIPS = [
  { key: "relevance", label: "Relevance", icon: "🎯" },
  { key: "rating", label: "Rating 4.0+", icon: "★" },
  { key: "delivery", label: "Fast Delivery", icon: "⚡" },
  { key: "cost-low-high", label: "Cost: Low to High", icon: "↑" },
  { key: "cost-high-low", label: "Cost: High to Low", icon: "↓" },
];

const SortOptions = ({ value = "relevance", onChange = () => {} }) => {
  return (
    <div className="sort-options">
      <span className="sort-options-label">Sort by:</span>

      <div className="sort-options-chips">
        {SORT_CHIPS.map((chip) => (
          <button
            key={chip.key}
            className={`sort-chip ${value === chip.key ? "active" : ""}`}
            onClick={() => onChange(chip.key)}
          >
            <span className="sort-chip-icon">{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortOptions;
