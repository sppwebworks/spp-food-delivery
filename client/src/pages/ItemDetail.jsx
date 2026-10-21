/**
 * ============================================================
 * ITEM DETAIL PAGE  (/restaurants/:id/item/:itemId)
 * ============================================================
 * Fetches a single menu item directly from OUR backend:
 *   GET /api/restaurants/:rid/items/:itemId
 * Response: { item, restaurant, siblings }
 * ============================================================
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMenuItemById,
  clearCurrentItem,
} from "../features/restaurants/restaurantsSlice";
import { addToCart, updateQuantity } from "../features/cart/cartSlice";
import { useToast } from "../context/ToastContext";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";

const ItemDetail = () => {
  const { id: restaurantId, itemId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    menuItem: item,
    menuItemRestaurant: restaurant,
    menuItemSiblings: siblings,
    menuItemLoading: loading,
    menuItemError: error,
  } = useSelector((s) => s.restaurants);

  const cartItem = useSelector((s) =>
    s.cart.items.find((i) => i.id === itemId),
  );

  const [localQty, setLocalQty] = useState(1);

  /* ---------- Load item ---------- */
  useEffect(() => {
    if (restaurantId && itemId) {
      dispatch(fetchMenuItemById({ restaurantId, itemId }));
    }
    return () => dispatch(clearCurrentItem());
  }, [dispatch, restaurantId, itemId]);

  /* ---------- Sync qty from cart ---------- */
  useEffect(() => {
    setLocalQty(cartItem?.quantity || 1);
  }, [itemId, cartItem?.quantity]);

  /* ---------- Discount % ---------- */
  const discountPercent = useMemo(() => {
    if (!item || !item.mrp || item.mrp <= item.price) return 0;
    return Math.round(((item.mrp - item.price) / item.mrp) * 100);
  }, [item]);

  /* ---------- Handlers ---------- */
  const handleIncrement = () => setLocalQty((q) => q + 1);
  const handleDecrement = () => setLocalQty((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    if (!item) return;

    if (cartItem) {
      dispatch(updateQuantity({ id: item._id, quantity: localQty }));
      showToast(`Updated ${item.name} in cart`, "success");
    } else {
      dispatch(
        addToCart({
          id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          restaurantId,
          restaurantName: restaurant?.name || "",
          quantity: localQty,
        }),
      );
      showToast(`Added ${localQty} × ${item.name} to cart`, "success");
    }
  };

  /* ============================================================
     LOADING
     ============================================================ */
  if (loading && !item) {
    return (
      <div className="container item-detail-page">
        <div
          className="shimmer"
          style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12 }}
        />
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Skeleton type="text" width="40%" height={26} />
          <Skeleton type="text" width="30%" height={16} />
          <Skeleton type="text" width="20%" height={20} />
          <Skeleton type="text" width="90%" height={14} />
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR / NOT FOUND
     ============================================================ */
  if (error || (!loading && !item)) {
    return (
      <div className="container" style={{ padding: "60px 20px" }}>
        <EmptyState
          icon="🍽️"
          title="Item not found"
          message={error || "This item may have been removed."}
          actionLabel="Back to Restaurants"
          actionLink="/restaurants"
        />
      </div>
    );
  }

  /* ============================================================
     NORMAL
     ============================================================ */
  const heroImage = item.image || restaurant?.image;
  const totalPrice = item.price * localQty;

  return (
    <div className="container item-detail-page">
      {/* Breadcrumb */}
      <nav className="restaurant-breadcrumb">
        <Link to="/">Home</Link>
        <span className="restaurant-breadcrumb-sep">›</span>
        <Link to="/restaurants">Restaurants</Link>
        <span className="restaurant-breadcrumb-sep">›</span>
        {restaurant && (
          <>
            <Link to={`/restaurants/${restaurant._id}`}>{restaurant.name}</Link>
            <span className="restaurant-breadcrumb-sep">›</span>
          </>
        )}
        <span style={{ color: "var(--text)", fontWeight: 500 }}>
          {item.name}
        </span>
      </nav>

      {/* Hero image */}
      <img
        src={heroImage}
        alt={item.name}
        className="item-detail-main-image"
        onError={(e) => {
          e.currentTarget.src = restaurant?.image || "";
        }}
      />

      {/* Title row with veg indicator */}
      <div className="item-detail-name-row">
        <div
          className={`menu-item-veg-indicator ${item.isVeg ? "" : "non-veg"}`}
          aria-label={item.isVeg ? "Veg" : "Non-veg"}
        />
        <h1 className="item-detail-name">{item.name}</h1>
      </div>

      {/* Restaurant + category */}
      {restaurant && (
        <p className="item-detail-restaurant">
          🏠 <strong>{restaurant.name}</strong>
          {item.category && (
            <>
              {" "}
              · <span style={{ color: "var(--text-3)" }}>{item.category}</span>
            </>
          )}
        </p>
      )}

      {/* Rating + delivery */}
      {restaurant?.rating && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <span className="restaurant-header-rating">
            ★ {restaurant.rating}
          </span>
          {restaurant.reviewCount > 0 && (
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>
              ({(restaurant.reviewCount / 1000).toFixed(1)}K ratings)
            </span>
          )}
          {restaurant.deliveryTime && (
            <>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                ⏱ {restaurant.deliveryTime} mins
              </span>
            </>
          )}
        </div>
      )}

      {/* Price row */}
      <div className="item-detail-price-row">
        <span className="item-detail-price">₹{item.price}</span>
        {item.mrp > item.price && (
          <>
            <span className="item-detail-price-mrp">₹{item.mrp}</span>
            <span className="item-detail-discount">{discountPercent}% OFF</span>
          </>
        )}
      </div>

      {/* Bestseller */}
      {item.isRecommended && (
        <div style={{ marginBottom: 12 }}>
          <span className="restaurant-header-tag">⭐ Bestseller</span>
        </div>
      )}

      {/* Description */}
      {item.description && (
        <p className="item-detail-description">{item.description}</p>
      )}

      {/* Unavailable banner */}
      {!item.isAvailable && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          ⚠️ This item is currently unavailable
        </div>
      )}

      {/* Actions */}
      {item.isAvailable && (
        <div className="item-detail-actions">
          <div className="qty-selector">
            <button onClick={handleDecrement} aria-label="Decrease quantity">
              −
            </button>
            <span>{localQty}</span>
            <button onClick={handleIncrement} aria-label="Increase quantity">
              +
            </button>
          </div>

          <button
            className="btn-primary btn-large"
            onClick={handleAddToCart}
            style={{ flex: 1, maxWidth: 320 }}
          >
            {cartItem ? "Update Cart" : "Add to Cart"} · ₹{totalPrice}
          </button>
        </div>
      )}

      {/* Siblings */}
      {siblings.length > 0 && (
        <section style={{ marginTop: 60 }}>
          <h2 className="menu-section-title">
            More from {item.category || "this restaurant"}
          </h2>

          <div className="menu-list">
            {siblings.map((sib) => (
              <div
                key={sib._id}
                className="menu-item"
                onClick={() =>
                  navigate(`/restaurants/${restaurantId}/item/${sib._id}`)
                }
                style={{ cursor: "pointer" }}
              >
                <div className="menu-item-info">
                  <div className="menu-item-name-row">
                    <span
                      className={`menu-item-veg-indicator ${
                        sib.isVeg ? "" : "non-veg"
                      }`}
                    />
                    <span className="menu-item-name">{sib.name}</span>
                  </div>

                  {sib.description && (
                    <p className="menu-item-description">{sib.description}</p>
                  )}

                  <div className="menu-item-price">₹{sib.price}</div>
                </div>

                <div className="menu-item-image-wrap">
                  <img
                    src={sib.image || restaurant?.image}
                    alt={sib.name}
                    className="menu-item-image"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ItemDetail;
