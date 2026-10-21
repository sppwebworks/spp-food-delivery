/**
 * ============================================================
 * ADMIN MENU ITEMS — Manage menu for a restaurant
 * ============================================================
 * Route: /admin/restaurants/:id
 *
 * Features:
 *   - Restaurant header with quick info
 *   - Category filter tabs (All + each category)
 *   - Search by name / description
 *   - Grouped menu list with edit / toggle / delete
 *   - "Add Menu Item" modal with dropdown for category
 *     + inline "Add new category" option
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRestaurantById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItem,
} from "../features/restaurants/adminRestaurantsSlice";
import MenuItemFormModal from "../components/MenuItemFormModal";
import { useToast } from "../context/ToastContext";

const MenuItems = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { current, loading, error } = useSelector((s) => s.adminRestaurants);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchRestaurantById(id));
  }, [dispatch, id]);

  /* ---------- Derived data ---------- */
  const grouped = current?.grouped || {};

  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const totalItems = useMemo(
    () => Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0),
    [grouped],
  );

  /* ---------- Filtered view ---------- */
  const visibleCategories = useMemo(() => {
    let cats = categories;

    if (filterCategory !== "all") {
      cats = cats.filter((c) => c === filterCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return cats
        .map((cat) => ({
          cat,
          items: (grouped[cat] || []).filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              (it.description || "").toLowerCase().includes(q),
          ),
        }))
        .filter((c) => c.items.length > 0);
    }

    return cats.map((cat) => ({ cat, items: grouped[cat] || [] }));
  }, [categories, grouped, filterCategory, searchQuery]);

  /* ---------- Handlers ---------- */
  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    const result = await dispatch(deleteMenuItem(item._id));
    if (deleteMenuItem.fulfilled.match(result)) {
      showToast("Item deleted", "success");
    } else {
      showToast(result.payload || "Delete failed", "error");
    }
  };

  const handleToggle = async (item) => {
    const result = await dispatch(toggleMenuItem(item._id));
    if (toggleMenuItem.fulfilled.match(result)) {
      showToast(
        item.isAvailable ? "Marked unavailable" : "Marked available",
        "success",
      );
    }
  };

  const handleSave = async (data) => {
    let result;

    if (editing) {
      result = await dispatch(updateMenuItem({ id: editing._id, ...data }));
    } else {
      result = await dispatch(createMenuItem({ restaurantId: id, ...data }));
    }

    if (
      createMenuItem.fulfilled.match(result) ||
      updateMenuItem.fulfilled.match(result)
    ) {
      showToast(editing ? "Menu item updated" : "Menu item created", "success");
      setModalOpen(false);
      setEditing(null);
    } else {
      showToast(result.payload || "Save failed", "error");
    }
  };

  /* ---------- Loading / error ---------- */
  if (loading && !current) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading restaurant…</div>
      </div>
    );
  }

  if (error || (!loading && !current)) {
    return (
      <div className="admin-page">
        <Link to="/admin/restaurants" className="admin-back-link">
          ← Back to Restaurants
        </Link>
        <div className="admin-error" style={{ marginTop: 16 }}>
          {error || "Restaurant not found"}
        </div>
      </div>
    );
  }

  const restaurant = current;

  return (
    <div className="admin-page">
      <Link to="/admin/restaurants" className="admin-back-link">
        ← Back to Restaurants
      </Link>

      {/* ---------- HEADER ---------- */}
      <div className="admin-restaurant-detail-header">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="admin-restaurant-detail-img"
        />

        <div className="admin-restaurant-detail-info">
          <h1>{restaurant.name}</h1>

          <p className="admin-restaurant-detail-cuisines">
            {(restaurant.cuisines || []).join(" · ")}
          </p>

          <div className="admin-restaurant-detail-meta">
            <span>★ {restaurant.rating}</span>
            <span>⏱ {restaurant.deliveryTime} min</span>
            <span>₹{restaurant.priceForTwo} for two</span>
            <span>🍽️ {totalItems} items</span>
          </div>
        </div>

        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleCreate}
        >
          + Add Menu Item
        </button>
      </div>

      {/* ---------- FILTERS + SEARCH ---------- */}
      {totalItems > 0 && (
        <>
          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-tab ${
                filterCategory === "all" ? "active" : ""
              }`}
              onClick={() => setFilterCategory("all")}
            >
              <span className="admin-filter-tab-icon">📋</span>
              <span>All</span>
              <span className="admin-filter-tab-count">{totalItems}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`admin-filter-tab ${
                  filterCategory === cat ? "active" : ""
                }`}
                onClick={() => setFilterCategory(cat)}
              >
                <span>{cat}</span>
                <span className="admin-filter-tab-count">
                  {(grouped[cat] || []).length}
                </span>
              </button>
            ))}
          </div>

          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search items by name or description…"
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
        </>
      )}

      {/* ---------- EMPTY STATE ---------- */}
      {totalItems === 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🍕</div>
          <h3>No menu items yet</h3>
          <p>Click "Add Menu Item" to add the first dish</p>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={handleCreate}
            style={{ marginTop: 16 }}
          >
            + Add Menu Item
          </button>
        </div>
      )}

      {/* ---------- NO SEARCH RESULTS ---------- */}
      {visibleCategories.length === 0 && totalItems > 0 && (
        <div className="admin-empty">
          <div className="admin-empty-icon">🔍</div>
          <h3>No matching items</h3>
          <p>Try a different search or clear the filter</p>
        </div>
      )}

      {/* ---------- MENU LIST ---------- */}
      {visibleCategories.map(({ cat, items }) => (
        <section key={cat} className="admin-menu-section">
          <h2 className="admin-menu-section-title">
            {cat}
            <span className="admin-menu-count">{items.length}</span>
          </h2>

          <div className="admin-menu-list">
            {items.map((item) => (
              <div key={item._id} className="admin-menu-row">
                <img
                  src={item.image || restaurant.image}
                  alt={item.name}
                  className="admin-menu-row-img"
                  loading="lazy"
                />

                <div className="admin-menu-row-info">
                  <div className="admin-menu-row-title">
                    <span
                      className={`admin-veg-dot ${
                        item.isVeg ? "veg" : "non-veg"
                      }`}
                      aria-label={item.isVeg ? "Veg" : "Non-veg"}
                    />
                    <strong>{item.name}</strong>
                  </div>

                  {item.description && (
                    <p className="admin-menu-row-desc">{item.description}</p>
                  )}

                  <div className="admin-menu-row-price">
                    ₹{item.price}
                    {item.mrp > item.price && (
                      <span className="admin-menu-row-mrp">₹{item.mrp}</span>
                    )}
                    {item.isRecommended && (
                      <span className="admin-menu-row-badge">
                        ⭐ Bestseller
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="admin-menu-row-badge admin-menu-row-badge-warn">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>

                <div className="admin-menu-row-actions">
                  <button
                    type="button"
                    className="admin-btn-outline btn-sm"
                    onClick={() => handleEdit(item)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    className="admin-btn-outline btn-sm"
                    onClick={() => handleToggle(item)}
                  >
                    {item.isAvailable ? "🚫 Disable" : "✅ Enable"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger btn-sm"
                    onClick={() => handleDelete(item)}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ---------- MODAL ---------- */}
      <MenuItemFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        initialData={editing}
        onSave={handleSave}
        existingCategories={categories}
      />
    </div>
  );
};

export default MenuItems;
