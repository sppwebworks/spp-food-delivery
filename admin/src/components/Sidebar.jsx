/**
 * ============================================================
 * ADMIN SIDEBAR
 * ============================================================
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../features/adminAuth/adminAuthSlice";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/orders", label: "Orders", icon: "📦" },
  { to: "/admin/restaurants", label: "Restaurants", icon: "🏪" },
  { to: "/admin/coupons", label: "Coupons", icon: "🎟️" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
  // ✅ FIXED: prepend /admin/
  { to: "/admin/announcements", label: "Announcements", icon: "📢" },
  { to: "/admin/hero-banners", label: "Hero Banners", icon: "🖼️" },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.adminAuth);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span className="admin-logo-icon">⚙️</span>
        <span className="admin-logo-text">FoodieHub</span>
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

      <div className="admin-sidebar-footer">
        <div className="admin-user">
          <div className="admin-user-avatar">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="admin-user-info">
            <strong>{user?.name || "Admin"}</strong>
            <small>{user?.email || ""}</small>
          </div>
        </div>
        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
