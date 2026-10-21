/**
 * ============================================================
 * MENU TABS — Restaurant Detail page
 * ============================================================
 *
 * Design:
 *   ┌────────────┬─────────┬──────────┬────────┬───────────┐
 *   │ Recommended│ Biryani │ Starters │ Combos │ Desserts  │
 *   └────────────┴─────────┴──────────┴────────┴───────────┘
 *        ↑ active (orange underline)
 *
 * Props:
 *   tabs        → array of { id, label, count? }
 *   activeTab   → string
 *   onChange    → (tabId) => void
 *
 * If tabs > screen width, scrolls horizontally (no visible scrollbar).
 * ============================================================
 */

const MenuTabs = ({ tabs = [], activeTab, onChange }) => {
  if (!tabs.length) return null;

  return (
    <div className="menu-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`menu-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span
              style={{
                marginLeft: 6,
                fontSize: 12,
                color: "var(--text-3)",
                fontWeight: 500,
              }}
            >
              ({tab.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MenuTabs;
