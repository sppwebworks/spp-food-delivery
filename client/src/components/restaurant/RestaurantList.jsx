/**
 * ============================================================
 * RESTAURANT LIST — Grid of restaurant cards
 * ============================================================
 * Handles loading skeletons, empty state, error, and normal grid.
 * ============================================================
 */

import RestaurantCard from "./RestaurantCard";
import EmptyState from "../common/EmptyState";

const RestaurantList = ({
  items = [],
  loading = false,
  error = null,
  emptyIcon = "🍽️",
  emptyTitle = "No restaurants found",
  emptyMessage = "Try clearing some filters or searching for something else.",
  emptyActionLabel = "",
  emptyActionLink = "",
}) => {
  /* ---------- LOADING ---------- */
  if (loading && items.length === 0) {
    return (
      <div className="restaurants-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="restaurant-card"
            style={{ cursor: "default" }}
          >
            <div
              className="shimmer"
              style={{
                width: "100%",
                aspectRatio: "16 / 10",
                borderRadius: 12,
              }}
            />
            <div style={{ padding: "14px 4px" }}>
              <div
                className="shimmer"
                style={{ height: 18, width: "70%", borderRadius: 4 }}
              />
              <div
                className="shimmer"
                style={{
                  height: 14,
                  width: "50%",
                  borderRadius: 4,
                  marginTop: 10,
                }}
              />
              <div
                className="shimmer"
                style={{
                  height: 12,
                  width: "40%",
                  borderRadius: 4,
                  marginTop: 10,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className="status error" style={{ padding: "40px 20px" }}>
        <p>
          {typeof error === "string" ? error : "Failed to load restaurants"}
        </p>
      </div>
    );
  }

  /* ---------- EMPTY ---------- */
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel={emptyActionLabel}
        actionLink={emptyActionLink}
      />
    );
  }

  /* ---------- NORMAL GRID ---------- */
  return (
    <div className="restaurants-grid">
      {items.map((item, index) => (
        <RestaurantCard
          key={item._id || item.id || `restaurant-${index}`}
          restaurant={item}
        />
      ))}
    </div>
  );
};

export default RestaurantList;
