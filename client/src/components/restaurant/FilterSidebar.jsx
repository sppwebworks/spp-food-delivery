/**
 * ============================================================
 * FILTER SIDEBAR — Restaurants page
 * ============================================================
 * Categories come from Redux (derived from YOUR backend).
 * No TheMealDB defaults.
 * ============================================================
 */

import { useState } from "react";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "delivery", label: "Delivery Time" },
  { value: "cost-low-high", label: "Cost: Low to High" },
  { value: "cost-high-low", label: "Cost: High to Low" },
];

const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
];

const FilterSidebar = ({
  filters = {
    sortBy: "relevance",
    cuisines: [],
    rating: [],
    deliveryTime: [],
  },
  onFilterChange = () => {},
  onClearAll = () => {},
  categories = [],
}) => {
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  // Categories come from Redux as an array of strings
  // (see restaurantsSlice.fetchCategories — returns cuisine names)
  const cuisines = Array.isArray(categories) ? categories : [];

  const visibleCuisines = showAllCuisines ? cuisines : cuisines.slice(0, 6);

  const toggleArrayValue = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(key, next);
  };

  const hasActiveFilters =
    (filters.cuisines?.length || 0) > 0 ||
    (filters.rating?.length || 0) > 0 ||
    (filters.deliveryTime?.length || 0) > 0 ||
    filters.sortBy !== "relevance";

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button type="button" className="filter-clear" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      {/* SORT BY */}
      <div className="filter-group">
        <div className="filter-group-title">Sort By</div>
        {SORT_OPTIONS.map((opt) => (
          <label key={opt.value} className="filter-option">
            <input
              type="radio"
              name="sortBy"
              value={opt.value}
              checked={filters.sortBy === opt.value}
              onChange={() => onFilterChange("sortBy", opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* CUISINES */}
      {cuisines.length > 0 && (
        <div className="filter-group">
          <div className="filter-group-title">Cuisines</div>
          {visibleCuisines.map((cuisine) => (
            <label key={cuisine} className="filter-option">
              <input
                type="checkbox"
                checked={(filters.cuisines || []).includes(cuisine)}
                onChange={() => toggleArrayValue("cuisines", cuisine)}
              />
              <span>{cuisine}</span>
            </label>
          ))}

          {cuisines.length > 6 && (
            <button
              type="button"
              className="filter-show-more"
              onClick={() => setShowAllCuisines((s) => !s)}
            >
              {showAllCuisines ? "Show Less ▴" : "Show More ▾"}
            </button>
          )}
        </div>
      )}

      {/* RATING */}
      <div className="filter-group">
        <div className="filter-group-title">Rating</div>
        {RATING_OPTIONS.map((opt) => (
          <label key={opt.value} className="filter-option">
            <input
              type="checkbox"
              checked={(filters.rating || []).includes(opt.value)}
              onChange={() => toggleArrayValue("rating", opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* DELIVERY TIME */}
      <div className="filter-group">
        <div className="filter-group-title">Delivery Time</div>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={(filters.deliveryTime || []).includes("under-30")}
            onChange={() => toggleArrayValue("deliveryTime", "under-30")}
          />
          <span>Under 30 mins</span>
        </label>
      </div>
    </aside>
  );
};

export default FilterSidebar;
