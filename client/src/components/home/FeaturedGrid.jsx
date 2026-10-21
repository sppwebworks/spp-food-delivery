/**
 * ============================================================
 * FEATURED GRID — Grid of all restaurants
 * ============================================================
 */

import { Link } from "react-router-dom";
import RestaurantCard from "../restaurant/RestaurantCard";

const FeaturedGrid = ({
  restaurants = [],
  loading = false,
  title = "All Restaurants",
  limit = 8,
}) => {
  const list = restaurants.slice(0, limit);

  return (
    <section className="featured-grid-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">
            {restaurants.length} handpicked restaurants
          </p>
        </div>
        <Link to="/restaurants" className="view-all">
          View All →
        </Link>
      </div>

      {loading && list.length === 0 && (
        <div className="restaurants-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div
                className="shimmer"
                style={{
                  width: "100%",
                  aspectRatio: "16/10",
                  borderRadius: 16,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="empty-message">No restaurants available.</p>
      )}

      {list.length > 0 && (
        <div className="restaurants-grid">
          {list.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedGrid;
