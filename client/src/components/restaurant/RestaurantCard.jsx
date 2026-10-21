/**
 * ============================================================
 * RESTAURANT CARD
 * ============================================================
 */

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../../features/favorites/favoritesSlice";
import { useToast } from "../../context/ToastContext";

const RestaurantCard = ({ restaurant }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { items: favorites } = useSelector((s) => s.favorites);
  const { token } = useSelector((s) => s.auth);

  if (!restaurant) return null;

  const id = restaurant._id || restaurant.id;
  const isFavorited = favorites?.some((f) => f._id === id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      showToast("Please login to save favorites", "error");
      return;
    }

    const result = await dispatch(toggleFavorite(id));
    if (toggleFavorite.fulfilled.match(result)) {
      showToast(
        result.payload.isFavorited
          ? "Added to favorites ❤️"
          : "Removed from favorites",
        "success",
      );
    } else {
      showToast(result.payload || "Failed to update favorites", "error");
    }
  };

  const {
    name = "Unnamed",
    image = "",
    cuisines = [],
    rating = 0,
    reviewCount = 0,
    deliveryTime = 0,
    priceForTwo = 0,
    offer = "",
    isVeg = false,
    isFeatured = false,
  } = restaurant;

  return (
    <Link to={`/restaurants/${id}`} className="restaurant-card">
      <div className="restaurant-card-image">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--bg-2, #f0f0f5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            🍽️
          </div>
        )}

        {/* HEART ICON */}
        <button
          onClick={handleFavorite}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(255,255,255,0.95)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: 18,
          }}
        >
          {isFavorited ? "❤️" : "🤍"}
        </button>

        {offer && <div className="restaurant-card-offer">{offer}</div>}

        {isFeatured && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(252, 128, 25, 0.95)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 6,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            ⭐ Featured
          </span>
        )}
      </div>

      <div className="restaurant-card-info">
        <div className="restaurant-card-title-row">
          <h3 className="restaurant-card-title">{name}</h3>
          {rating > 0 && (
            <span className="restaurant-card-rating">
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>

        {cuisines.length > 0 && (
          <div className="restaurant-card-meta">
            <span className="restaurant-card-cuisines">
              {cuisines.slice(0, 3).join(" · ")}
            </span>
          </div>
        )}

        <div className="restaurant-card-footer">
          {deliveryTime > 0 && (
            <span>
              ⏱ {deliveryTime}–{deliveryTime + 10} mins
            </span>
          )}
          {priceForTwo > 0 && <span>₹{priceForTwo} for two</span>}
        </div>

        {(isVeg || reviewCount > 0) && (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 8,
              fontSize: 12,
              color: "var(--text-3, #93959f)",
              alignItems: "center",
            }}
          >
            {isVeg && (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <span
                  className="menu-item-veg-indicator"
                  style={{ width: 12, height: 12 }}
                />
                Pure Veg
              </span>
            )}
            {reviewCount > 0 && (
              <span>{(reviewCount / 1000).toFixed(1)}K ratings</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RestaurantCard;
