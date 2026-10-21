/**
 * ============================================================
 * MENU SECTION — Group of menu items
 * ============================================================
 *
 * Design:
 *   Recommended (5)
 *   ─────────────────────────
 *   [MenuItem]
 *   [MenuItem]
 *   [MenuItem]
 *
 * Props:
 *   title          → "Recommended" | "Biryani" | ...
 *   items          → array of meal objects
 *   restaurantId   → passed to MenuItem for "open detail"
 *   showCount      → shows (n) next to title (default true)
 *
 * If items empty → renders nothing.
 * ============================================================
 */

import MenuItem from "./MenuItem";

const MenuSection = ({ title, items = [], restaurantId, showCount = true }) => {
  if (!items.length) return null;

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 className="menu-section-title">
        {title}
        {showCount && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 14,
              color: "var(--text-3)",
              fontWeight: 500,
            }}
          >
            ({items.length})
          </span>
        )}
      </h2>

      {items.map((item) => (
        <MenuItem key={item.id} item={item} restaurantId={restaurantId} />
      ))}
    </section>
  );
};

export default MenuSection;
