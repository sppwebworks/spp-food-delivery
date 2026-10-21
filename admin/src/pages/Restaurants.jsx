/**
 * ============================================================
 * ADMIN RESTAURANTS — List + create/edit/delete
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurant,
} from "../features/restaurants/adminRestaurantsSlice";
import RestaurantFormModal from "../components/RestaurantFormModal";
import { useToast } from "../context/ToastContext";

const Restaurants = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { items, loading, error, total } = useSelector(
    (s) => s.adminRestaurants,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = [...items];
    if (activeFilter === "active") result = result.filter((r) => r.isActive);
    if (activeFilter === "inactive") result = result.filter((r) => !r.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.cuisines || []).some((c) => c.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [items, searchQuery, activeFilter]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (r) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleDelete = async (r) => {
    if (
      !window.confirm(
        `Delete "${r.name}"? This will also delete its ${r.itemCount || 0} menu items.`,
      )
    )
      return;
    const result = await dispatch(deleteRestaurant(r._id));
    if (deleteRestaurant.fulfilled.match(result)) {
      showToast(`${r.name} deleted`, "success");
    } else {
      showToast(result.payload || "Delete failed", "error");
    }
  };

  const handleToggle = async (r) => {
    const result = await dispatch(toggleRestaurant(r._id));
    if (toggleRestaurant.fulfilled.match(result)) {
      showToast(
        r.isActive ? "Restaurant disabled" : "Restaurant enabled",
        "success",
      );
    }
  };

  const handleSave = async (data) => {
    let result;
    if (editing) {
      result = await dispatch(updateRestaurant({ id: editing._id, ...data }));
    } else {
      result = await dispatch(createRestaurant(data));
    }

    if (
      createRestaurant.fulfilled.match(result) ||
      updateRestaurant.fulfilled.match(result)
    ) {
      showToast(
        editing ? "Restaurant updated" : "Restaurant created",
        "success",
      );
      setModalOpen(false);
      setEditing(null);
    } else {
      showToast(result.payload || "Save failed", "error");
    }
  };

  const activeCount = items.filter((r) => r.isActive).length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Restaurants</h1>
          <p>
            {total} restaurant{total !== 1 ? "s" : ""} · Manage your catalog
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleCreate}
        >
          + Add Restaurant
        </button>
      </header>

      {/* Filter tabs */}
      <div className="admin-filter-tabs">
        <button
          type="button"
          className={`admin-filter-tab ${
            activeFilter === "all" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("all")}
        >
          <span className="admin-filter-tab-icon">🏪</span>
          <span>All</span>
          <span className="admin-filter-tab-count">{items.length}</span>
        </button>
        <button
          type="button"
          className={`admin-filter-tab ${
            activeFilter === "active" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("active")}
        >
          <span className="admin-filter-tab-icon">✅</span>
          <span>Active</span>
          <span className="admin-filter-tab-count">{activeCount}</span>
        </button>
        <button
          type="button"
          className={`admin-filter-tab ${
            activeFilter === "inactive" ? "active" : ""
          }`}
          onClick={() => setActiveFilter("inactive")}
        >
          <span className="admin-filter-tab-icon">🚫</span>
          <span>Inactive</span>
          <span className="admin-filter-tab-count">{inactiveCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-wrap">
        <span className="admin-search-icon">🔍</span>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search by name or cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {loading && items.length === 0 && (
        <div className="admin-loading">Loading restaurants...</div>
      )}
      {error && <div className="admin-error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🏪</div>
          <h3>No restaurants found</h3>
          <p>
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "Click 'Add Restaurant' to create your first one"}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="admin-restaurant-grid">
          {filtered.map((r) => (
            <div
              key={r._id}
              className={`admin-restaurant-card ${
                !r.isActive ? "inactive" : ""
              }`}
            >
              <div className="admin-restaurant-image-wrap">
                <img src={r.image} alt={r.name} loading="lazy" />
                <div className="admin-restaurant-badges">
                  {r.isFeatured && (
                    <span className="admin-badge admin-badge-featured">
                      ⭐ Featured
                    </span>
                  )}
                  {!r.isActive && (
                    <span className="admin-badge admin-badge-inactive">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="admin-restaurant-rating">
                  ★ {Number(r.rating || 0).toFixed(1)}
                </div>
              </div>

              <div className="admin-restaurant-body">
                <h3 className="admin-restaurant-name">{r.name}</h3>
                <p className="admin-restaurant-cuisines">
                  {(r.cuisines || []).join(" · ")}
                </p>

                <div className="admin-restaurant-meta">
                  <span>⏱ {r.deliveryTime} min</span>
                  <span>₹{r.priceForTwo} for two</span>
                </div>

                <div className="admin-restaurant-footer">
                  <span className="admin-restaurant-itemcount">
                    🍽️ {r.itemCount || 0} items
                  </span>
                </div>

                <div className="admin-restaurant-actions">
                  <Link
                    to={`/admin/restaurants/${r._id}`}
                    className="admin-btn-primary btn-sm"
                  >
                    🍽️ Manage Menu
                  </Link>
                  <button
                    type="button"
                    className="admin-btn-outline btn-sm"
                    onClick={() => handleEdit(r)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline btn-sm"
                    onClick={() => handleToggle(r)}
                  >
                    {r.isActive ? "🚫 Disable" : "✅ Enable"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger btn-sm"
                    onClick={() => handleDelete(r)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RestaurantFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={editing}
        onSave={handleSave}
      />
    </div>
  );
};

export default Restaurants;
