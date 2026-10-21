/**
 * ============================================================
 * POPULAR ROW — Top-rated horizontal carousel
 * ============================================================
 */

import { useRef } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "../restaurant/RestaurantCard";

const PopularRow = ({
  restaurants = [],
  loading = false,
  title = "Popular Right Now",
}) => {
  const scrollRef = useRef(null);

  const scrollBy = (delta) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const top = restaurants.slice(0, 8);

  return (
    <section className="popular-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">Top-rated restaurants near you</p>
        </div>

        <div className="section-actions">
          <button
            type="button"
            className="scroll-btn"
            onClick={() => scrollBy(-320)}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            className="scroll-btn"
            onClick={() => scrollBy(320)}
            aria-label="Scroll right"
          >
            ›
          </button>
          <Link to="/restaurants" className="view-all">
            View All →
          </Link>
        </div>
      </div>

      {loading && top.length === 0 && (
        <div className="popular-row" ref={scrollRef}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="popular-row-item">
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

      {!loading && top.length === 0 && (
        <p className="empty-message">No restaurants to show right now.</p>
      )}

      {top.length > 0 && (
        <div className="popular-row" ref={scrollRef}>
          {top.map((restaurant) => (
            <div key={restaurant._id} className="popular-row-item">
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PopularRow;
