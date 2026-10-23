import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../services/api";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.adminAuth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0); // ✅ New State

  // ✅ Fetch Badges (Tickets + Orders)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchBadges = async () => {
      try {
        // Fetch open tickets
        const ticketsRes = await api.get("/admin/support?status=open");
        if (!cancelled) setOpenTickets(ticketsRes.data.total || 0);

        // Fetch pending orders
        const ordersRes = await api.get("/admin/orders?status=pending");
        if (!cancelled) setPendingOrders(ordersRes.data.total || 0);
      } catch {
        /* ignore */
      }
    };

    fetchBadges();
    const t = setInterval(fetchBadges, 60000); // Refresh every minute
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [token, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    navigate("/admin/login");
    window.location.reload();
  };

  const NAV_ITEMS = [
    { label: "Dashboard", to: "/admin", icon: "📊", end: true },
    { label: "Orders", to: "/admin/orders", icon: "📦", badge: pendingOrders }, // ✅ Added Badge
    { label: "Restaurants", to: "/admin/restaurants", icon: "🍽️" },
    { label: "Coupons", to: "/admin/coupons", icon: "🎟️" },
    { label: "Users", to: "/admin/users", icon: "👥" },
    { label: "Announcements", to: "/admin/announcements", icon: "📢" },
    { label: "Hero Banners", to: "/admin/hero-banners", icon: "🖼️" },
    { label: "Support", to: "/admin/support", icon: "🎧", badge: openTickets },
    { label: "Settings", to: "/admin/settings", icon: "⚙️" },
    { label: "Delivery Partners", to: "/admin/riders", icon: "🛵" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          background: "#0f1115",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #2a3039",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #2a3039",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
          }}
        >
          <span style={{ fontSize: 24 }}>🍽️</span>
          <span>
            Foodie<span style={{ color: "#fc8019" }}>Admin</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflowY: "auto",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fc8019" : "#9ca3af",
                background: isActive
                  ? "rgba(252, 128, 25, 0.1)"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>

              {/* ✅ Badge */}
              {item.badge > 0 && (
                <span
                  style={{
                    background: "#fc8019",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    minWidth: 20,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div style={{ padding: "20px", borderTop: "1px solid #2a3039" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fc8019, #e56f0e)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name || "Admin User"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.email || "admin@foodie.com"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: "rgba(226, 55, 68, 0.1)",
              color: "#e23744",
              border: "1px solid rgba(226, 55, 68, 0.3)",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          background: "#f4f6f8",
          minHeight: "100vh",
          padding: 32,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
