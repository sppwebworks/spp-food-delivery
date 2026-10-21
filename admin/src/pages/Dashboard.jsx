/**
 * ============================================================
 * ADMIN DASHBOARD — Analytics with charts
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import StatCard from "../components/StatCard";
import AreaChart from "../components/AreaChart";
import BarChart from "../components/BarChart";
import DonutChart from "../components/DonutChart";
import ProgressBar from "../components/ProgressBar";

const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  out_for_delivery: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const CATEGORY_ICONS = {
  Beef: "🥩",
  Chicken: "🍗",
  Dessert: "🍰",
  Lamb: "🐑",
  Miscellaneous: "🍽️",
  Pasta: "🍝",
  Pork: "🥓",
  Seafood: "🦐",
  Side: "🥗",
  Starter: "🥟",
  Vegan: "🥬",
  Vegetarian: "🥦",
  Breakfast: "🍳",
  Goat: "🐐",
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // ✅ Fetch data using the configured api instance
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/orders?limit=100"),
        ]);

        // ✅ Ensure we set the data safely
        setStats(statsRes.data || null);
        setOrders(ordersRes.data.orders || ordersRes.data || []);
      } catch (e) {
        console.error("Failed to load stats", e);
        setError(e.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------- Build chart data from orders ---------- */
  const revenueData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const buckets = days.map((d) => ({ label: d, value: 0 }));
    const now = new Date();

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const idx = d.getDay();
        buckets[idx].value += o.total || 0;
      }
    });

    const today = now.getDay();
    const ordered = [];
    for (let i = 6; i >= 0; i--) {
      ordered.push(buckets[(today - i + 7) % 7]);
    }
    return ordered;
  }, [orders]);

  const ordersPerDay = useMemo(() => {
    const buckets = revenueData.map((r) => ({ label: r.label, value: 0 }));
    const now = new Date();
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const dayIdx = (d.getDay() - (now.getDay() - 6) + 14) % 7;
        buckets[dayIdx].value += 1;
      }
    });
    return buckets;
  }, [orders, revenueData]);

  const statusData = useMemo(() => {
    if (!stats?.byStatus) return [];
    return Object.entries(stats.byStatus).map(([status, count]) => ({
      label: status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status] || "#94a3b8",
    }));
  }, [stats]);

  const topCategories = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const name = (item.name || "").toLowerCase();
        let cat = "Miscellaneous";
        if (name.includes("chicken")) cat = "Chicken";
        else if (name.includes("beef")) cat = "Beef";
        else if (name.includes("pasta") || name.includes("spaghetti"))
          cat = "Pasta";
        else if (name.includes("cake") || name.includes("dessert"))
          cat = "Dessert";
        else if (
          name.includes("fish") ||
          name.includes("seafood") ||
          name.includes("prawn")
        )
          cat = "Seafood";
        else if (name.includes("lamb")) cat = "Lamb";
        else if (name.includes("vegan")) cat = "Vegan";
        else if (name.includes("vegetarian")) cat = "Vegetarian";
        counts[cat] = (counts[cat] || 0) + (item.quantity || 1);
      });
    });

    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        icon: CATEGORY_ICONS[label] || "🍽️",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => {
    return orders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  const formatCurrency = (n) => {
    const num = Number(n) || 0;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const timeAgo = (date) => {
    const secs = Math.floor((Date.now() - new Date(date)) / 1000);
    if (secs < 60) return "just now";
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  // ✅ Safe check: If stats is null after loading, show fallback
  if (!stats) {
    return (
      <div className="admin-page">
        <div className="admin-error">No data available.</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your platform's performance</p>
        </div>
        <div className="admin-header-badge">Last 7 days</div>
      </header>

      {/* KPI cards */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon="📦"
          accent="orange"
          trend={12}
        />
        <StatCard
          label="Customers"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          accent="blue"
          trend={5}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          accent="green"
          trend={18}
        />
        <StatCard
          label="Delivered"
          value={(stats.byStatus?.delivered || 0).toLocaleString()}
          icon="✅"
          accent="purple"
          trend={8}
        />
      </div>

      {/* Charts row 1 */}
      <div className="admin-charts-row admin-charts-2">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>Revenue Trend</h3>
              <p>Last 7 days</p>
            </div>
            <span className="admin-chart-total">
              {formatCurrency(revenueData.reduce((s, d) => s + d.value, 0))}
            </span>
          </div>
          <AreaChart
            data={revenueData}
            accent="#10b981"
            formatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
          />
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>Order Status</h3>
              <p>Distribution</p>
            </div>
          </div>
          <DonutChart data={statusData} size={200} thickness={26} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="admin-charts-row admin-charts-2">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>Orders per Day</h3>
              <p>Last 7 days</p>
            </div>
          </div>
          <BarChart data={ordersPerDay} accent="#fc8019" />
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <h3>Top Categories</h3>
              <p>By items sold</p>
            </div>
          </div>
          <div className="admin-progress-list">
            {topCategories.length === 0 ? (
              <p className="admin-muted">No items yet</p>
            ) : (
              topCategories.map((c, i) => (
                <ProgressBar
                  key={c.label}
                  label={c.label}
                  icon={c.icon}
                  value={c.value}
                  max={topCategories[0]?.value || 1}
                  color={
                    ["#fc8019", "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][i]
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <div>
            <h3>Recent Orders</h3>
            <p>Last 5 orders placed</p>
          </div>
          <Link to="/admin/orders" className="admin-link-inline">
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="admin-muted" style={{ padding: "20px 0" }}>
            No orders yet
          </p>
        ) : (
          <div className="admin-recent-list">
            {recentOrders.map((o) => (
              <Link
                key={o._id}
                to={`/admin/orders/${o._id}`}
                className="admin-recent-row"
              >
                <div className="admin-recent-id">
                  #{o._id.slice(-6).toUpperCase()}
                </div>
                <div className="admin-recent-user">
                  <div className="admin-recent-avatar">
                    {o.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="admin-recent-name">
                      {o.user?.name || "Unknown"}
                    </div>
                    <div className="admin-recent-items">
                      {o.items?.length || 0} item
                      {(o.items?.length || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="admin-recent-total">{formatMoney(o.total)}</div>
                <div
                  className="admin-recent-status"
                  style={{ background: STATUS_COLORS[o.status] || "#94a3b8" }}
                >
                  {o.status.replace(/_/g, " ")}
                </div>
                <div className="admin-recent-time">{timeAgo(o.createdAt)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
