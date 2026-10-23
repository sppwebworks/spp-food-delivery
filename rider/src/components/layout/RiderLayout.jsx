import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/riderAuthSlice";
import { fetchMyOrders } from "../../features/orders/riderOrdersSlice"; // ✅ Imported fetchMyOrders
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const RiderLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rider } = useSelector((s) => s.riderAuth);
  const { showToast } = useToast();
  const [toggling, setToggling] = useState(false);

  // ✅ Real-time Socket Listener for new assignments
  useEffect(() => {
    if (!rider) return;

    // Connect to Socket
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      { transports: ["websocket"] },
    );

    // Join the rider's specific room
    socket.emit("rider:join", rider._id);

    // Listen for new order assignments
    socket.on("order:assigned", (payload) => {
      showToast(`🛵 New order assigned: #${payload.shortId}`, "success");
      // ✅ MAGIC FIX: Fetch the latest orders so it appears without refreshing
      dispatch(fetchMyOrders());
    });

    socket.on("order:completed", () => {
      showToast("Order completed ✅", "success");
      dispatch(fetchMyOrders());
    });

    return () => socket.disconnect();
  }, [rider, dispatch, showToast]);

  const toggleOnline = async () => {
    if (!rider) return;
    setToggling(true);
    try {
      await api.put("/rider/status", { isOnline: !rider.isOnline });
      window.location.reload();
    } catch {
      showToast("Failed to toggle", "error");
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🛵</span>
          <strong>Rider Dashboard</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              background: rider?.isOnline ? "#16a34a" : "#6b7280",
              color: "#fff",
            }}
          >
            {rider?.isOnline ? "● Online" : "○ Offline"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <nav
        style={{
          display: "flex",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {[
          { to: "/", label: "📦 My Orders" },
          { to: "/profile", label: "👤 Profile" },
        ].map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            style={({ isActive }) => ({
              padding: "14px 20px",
              textDecoration: "none",
              color: isActive ? "#fc8019" : "#6b7280",
              fontWeight: 600,
              borderBottom: isActive
                ? "2px solid #fc8019"
                : "2px solid transparent",
            })}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <main
        style={{
          flex: 1,
          padding: 20,
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default RiderLayout;
