/**
 * ============================================================
 * ADMIN SIDEBAR
 * ============================================================
 */

import { NavLink } from "react-router-dom";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/restaurants", label: "Restaurants", icon: "🍽️" },
  { to: "/admin/coupons", label: "Coupons", icon: "🎟️" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const Sidebar = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span className="admin-logo-icon">🍽️</span>
        <span className="admin-logo-text">Foodie</span>
        <span className="admin-logo-tag">ADMIN</span>
      </div>

      <nav className="admin-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
