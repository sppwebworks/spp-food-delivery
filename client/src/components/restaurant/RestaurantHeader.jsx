/**
 * ============================================================
 * RESTAURANT HEADER — Detail page top block
 * ============================================================
 *
 * Design (from screenshot):
 *   ┌──────┐ ┌────────────────────────────────────────────┐
 *   │ img  │ │ Paradise Biryani                        ♡  │
 *   │      │ │ ★ 4.5 (2.1K ratings)                        │
 *   │      │ │ Biryani · North Indian · Mughlai            │
 *   │      │ │ ⏱ 30-40 min · ₹400 for two · ✓ Free Del    │
 *   │      │ │ [Pure Veg] [Bestseller] [Free Delivery]     │
 *   └──────┘ └────────────────────────────────────────────┘
 *
 * Props:
 *   restaurant → { id, name, image, rating, reviews, category, area,
 *                  deliveryTime, priceForTwo, tags, isVeg }
 *   onWishlist → optional callback
 *   isWishlisted → bool (default false)
 * ============================================================
 */

import { useToast } from "../../context/ToastContext";

const RestaurantHeader = ({ restaurant, onWishlist, isWishlisted = false }) => {
  const { showToast } = useToast();

  if (!restaurant) return null;

  const handleWishlist = () => {
    if (onWishlist) {
      onWishlist(restaurant);
    } else {
      showToast(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist",
        "success",
      );
    }
  };

  return (
    <header className="restaurant-header">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="restaurant-header-image"
      />

      <div className="restaurant-header-info">
        <div className="restaurant-header-name-row">
          <h1 className="restaurant-header-name">{restaurant.name}</h1>

          <button
            className="icon-btn"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            style={{
              color: isWishlisted ? "var(--danger)" : "var(--text-3)",
              fontSize: 24,
            }}
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        </div>

        <div className="restaurant-header-meta">
          <span className="restaurant-header-rating">
            ★ {restaurant.rating}
          </span>
          <span>({restaurant.reviews} ratings)</span>
        </div>

        <div className="restaurant-header-meta">
          <span>{restaurant.category}</span>
          {restaurant.area && (
            <>
              <span>·</span>
              <span>{restaurant.area}</span>
            </>
          )}
        </div>

        <div className="restaurant-header-meta">
          <span>
            ⏱ {restaurant.deliveryTime}–{restaurant.deliveryTime + 10} mins
          </span>
          <span>·</span>
          <span>₹{restaurant.priceForTwo} for two</span>
          <span>·</span>
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            ✓ Free Delivery
          </span>
        </div>

        {restaurant.tags?.length > 0 && (
          <div className="restaurant-header-tags">
            {restaurant.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="restaurant-header-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default RestaurantHeader;
