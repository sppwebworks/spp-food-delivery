/**
 * ============================================================
 * ADMIN USERS — Card layout with search + filters
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminUsers } from "../features/users/adminUsersSlice";
import { formatDate, timeAgo } from "../utils/format";

const ROLE_FILTERS = [
  { key: "all", label: "All Users", icon: "👥" },
  { key: "customer", label: "Customers", icon: "🛍️" },
  { key: "admin", label: "Admins", icon: "🛡️" },
];

const ROLE_STYLES = {
  customer: { bg: "#e0e7ff", text: "#3730a3", dot: "#6366f1" },
  admin: { bg: "#fed7aa", text: "#9a3412", dot: "#fc8019" },
};

const Users = () => {
  const dispatch = useDispatch();
  const { items: rawItems, loading, error } = useSelector((s) => s.adminUsers);

  // ✅ EXTRA SAFETY: Ensure items is always an array
  const items = Array.isArray(rawItems) ? rawItems : [];

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  /* ---------- Role counts ---------- */
  const roleCounts = useMemo(() => {
    const counts = { all: items.length };
    items.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [items]);

  /* ---------- Filter + sort ---------- */
  const filteredUsers = useMemo(() => {
    let result = [...items];

    if (activeFilter !== "all") {
      result = result.filter((u) => u.role === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.phone || "").includes(q),
      );
    }

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "name":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "email":
          aVal = (a.email || "").toLowerCase();
          bVal = (b.email || "").toLowerCase();
          break;
        case "joined":
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }
      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [items, activeFilter, searchQuery, sortKey, sortDir]);

  /* ---------- Sort handler ---------- */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span className="sort-icon-idle">⇅</span>;
    return (
      <span className="sort-icon-active">{sortDir === "asc" ? "↑" : "↓"}</span>
    );
  };

  /* ---------- Initials + color ---------- */
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const AVATAR_COLORS = [
    "linear-gradient(135deg, #fc8019, #e56f0e)",
    "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    "linear-gradient(135deg, #ec4899, #be185d)",
    "linear-gradient(135deg, #06b6d4, #0891b2)",
    "linear-gradient(135deg, #f59e0b, #d97706)",
    "linear-gradient(135deg, #ef4444, #dc2626)",
  ];

  const getAvatarGradient = (str) => {
    let hash = 0;
    for (let i = 0; i < (str || "").length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  return (
    <div className="admin-page">
      {/* HEADER */}
      <header className="admin-page-header">
        <div>
          <h1>Users</h1>
          <p>
            {items.length} user{items.length !== 1 ? "s" : ""} · Manage
            customers and admins
          </p>
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="admin-filter-tabs">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`admin-filter-tab ${
              activeFilter === f.key ? "active" : ""
            }`}
            onClick={() => setActiveFilter(f.key)}
          >
            <span className="admin-filter-tab-icon">{f.icon}</span>
            <span>{f.label}</span>
            {roleCounts[f.key] > 0 && (
              <span className="admin-filter-tab-count">
                {roleCounts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      <div className="admin-search-wrap">
        <span className="admin-search-icon">🔍</span>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* LOADING / ERROR */}
      {loading && items.length === 0 && (
        <div className="admin-loading">Loading users...</div>
      )}
      {error && <div className="admin-error">{error}</div>}

      {/* EMPTY */}
      {!loading && filteredUsers.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">👥</div>
          <h3>No users found</h3>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : activeFilter !== "all"
                ? `No ${activeFilter} users`
                : "Users will appear here once registered"}
          </p>
        </div>
      )}

      {/* TABLE */}
      {filteredUsers.length > 0 && (
        <>
          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th
                    className="th-user sortable"
                    onClick={() => handleSort("name")}
                  >
                    User <SortIcon column="name" />
                  </th>
                  <th
                    className="th-email sortable"
                    onClick={() => handleSort("email")}
                  >
                    Email <SortIcon column="email" />
                  </th>
                  <th className="th-phone">Phone</th>
                  <th className="th-role">Role</th>
                  <th
                    className="th-joined sortable"
                    onClick={() => handleSort("joined")}
                  >
                    Joined <SortIcon column="joined" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const rs = ROLE_STYLES[u.role] || ROLE_STYLES.customer;
                  const gradient = getAvatarGradient(u.name || u.email);

                  return (
                    <tr key={u._id} className="admin-orders-row">
                      <td>
                        <div className="admin-customer-cell">
                          <div
                            className="admin-customer-avatar"
                            style={{ background: gradient }}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div className="admin-customer-info">
                            <strong>{u.name || "Unknown"}</strong>
                            <small>
                              {u.role === "admin"
                                ? "Administrator"
                                : "Customer"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-user-email">{u.email}</span>
                      </td>

                      <td>
                        <span className="admin-user-phone">
                          {u.phone || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="admin-status-pill"
                          style={{ background: rs.bg, color: rs.text }}
                        >
                          <span
                            className="admin-status-dot"
                            style={{ background: rs.dot }}
                          />
                          {u.role}
                        </span>
                      </td>

                      <td>
                        <div className="admin-user-joined">
                          <span className="admin-order-date">
                            {formatDate(u.createdAt)}
                          </span>
                          <small className="admin-user-joined-ago">
                            {timeAgo(u.createdAt)}
                          </small>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="admin-orders-cards">
            {filteredUsers.map((u) => {
              const rs = ROLE_STYLES[u.role] || ROLE_STYLES.customer;
              const gradient = getAvatarGradient(u.name || u.email);

              return (
                <div key={u._id} className="admin-order-card">
                  <div className="admin-order-card-header">
                    <div className="admin-customer-cell">
                      <div
                        className="admin-customer-avatar"
                        style={{ background: gradient }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div className="admin-customer-info">
                        <strong>{u.name || "Unknown"}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                    <span
                      className="admin-status-pill"
                      style={{ background: rs.bg, color: rs.text }}
                    >
                      <span
                        className="admin-status-dot"
                        style={{ background: rs.dot }}
                      />
                      {u.role}
                    </span>
                  </div>

                  <div className="admin-order-card-row admin-order-card-meta">
                    <span>
                      📞 <strong>{u.phone || "No phone"}</strong>
                    </span>
                    <span className="admin-order-date">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Users;
