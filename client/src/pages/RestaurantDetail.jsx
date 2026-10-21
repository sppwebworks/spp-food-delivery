import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurantById } from "../features/restaurants/restaurantsSlice";
import {
  addToCart,
  removeFromCart,
  selectCartItems,
} from "../features/cart/cartSlice";
import MenuTabs from "../components/menu/MenuTabs";
import Skeleton from "../components/common/Skeleton";
import EmptyState from "../components/common/EmptyState";

const RestaurantDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { current, loading, error } = useSelector((s) => s.restaurants);
  const cartItems = useSelector(selectCartItems) || [];
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchRestaurantById(id));
  }, [dispatch, id]);

  /* ============================================================
     LOADING SKELETON
     ============================================================ */
  if (loading && !current) {
    return (
      <div className="container restaurant-detail-page">
        <Skeleton type="text" width="30%" height={14} />
        <div className="restaurant-header" style={{ marginTop: 20 }}>
          <div
            className="shimmer"
            style={{ width: 140, height: 140, borderRadius: 12 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Skeleton type="text" width="50%" height={26} />
            <Skeleton type="text" width="35%" height={16} />
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR / NOT FOUND
     ============================================================ */
  if (error || (!loading && !current)) {
    return (
      <div className="container" style={{ padding: "60px 20px" }}>
        <EmptyState
          icon="🍽️"
          title="Restaurant not found"
          message={error || "This restaurant may have been removed."}
          actionLabel="Back to Restaurants"
          actionLink="/restaurants"
        />
      </div>
    );
  }

  /* ============================================================
     DATA PREPARATION
     ============================================================ */
  const restaurant = current;
  const grouped = restaurant.grouped || {};
  const menuCategories = Object.keys(grouped);

  const selectedCategory =
    activeCategory && grouped[activeCategory]
      ? activeCategory
      : menuCategories[0];

  const itemsInCategory = grouped[selectedCategory] || [];

  /* ============================================================
     HELPERS
     ============================================================ */
  const getCartItem = (itemId) =>
    cartItems.find((c) => String(c.id) === String(itemId));

  const handleAdd = (item) => {
    dispatch(
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        restaurant: restaurant._id,
        restaurantName: restaurant.name,
      }),
    );
  };

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="container restaurant-detail-page">
      <nav className="restaurant-breadcrumb">
        <Link to="/">Home</Link>
        <span className="restaurant-breadcrumb-sep">›</span>
        <Link to="/restaurants">Restaurants</Link>
        <span className="restaurant-breadcrumb-sep">›</span>
        <span style={{ color: "var(--text)", fontWeight: 500 }}>
          {restaurant.name}
        </span>
      </nav>

      <header className="restaurant-header">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="restaurant-header-image"
        />
        <div className="restaurant-header-info">
          <div className="restaurant-header-name-row">
            <h1 className="restaurant-header-name">{restaurant.name}</h1>
          </div>

          <div className="restaurant-header-meta">
            <span className="restaurant-header-rating">
              ★ {restaurant.rating}
            </span>
            <span>({restaurant.reviewCount || 0} ratings)</span>
          </div>

          <div className="restaurant-header-meta">
            <span>{(restaurant.cuisines || []).join(" · ")}</span>
          </div>

          <div className="restaurant-header-meta">
            <span>
              ⏱ {restaurant.deliveryTime}–{restaurant.deliveryTime + 10} mins
            </span>
            <span>·</span>
            <span>₹{restaurant.priceForTwo} for two</span>
          </div>

          {restaurant.offer && (
            <div className="restaurant-header-tags">
              <span className="restaurant-header-tag">
                🎁 {restaurant.offer}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ============ MENU ============ */}
      {menuCategories.length > 0 ? (
        <>
          <MenuTabs
            tabs={menuCategories.map((c) => ({
              id: c,
              label: c,
              count: grouped[c].length,
            }))}
            activeTab={selectedCategory}
            onChange={setActiveCategory}
          />

          <section style={{ marginTop: 24 }}>
            <h2 className="menu-section-title">
              {selectedCategory} ({itemsInCategory.length})
            </h2>

            {itemsInCategory.map((item) => {
              const cartItem = getCartItem(item._id);

              return (
                <div key={item._id} className="menu-item">
                  <div className="menu-item-info">
                    <div className="menu-item-name">
                      <span
                        className={`veg-dot ${item.isVeg ? "veg" : "non-veg"}`}
                        style={{
                          display: "inline-block",
                          marginRight: 8,
                          verticalAlign: "middle",
                        }}
                      />
                      {item.name}
                    </div>
                    <div className="menu-item-price">₹{item.price}</div>
                    {item.description && (
                      <div className="menu-item-description">
                        {item.description}
                      </div>
                    )}
                  </div>

                  <div
                    className="menu-item-image-wrap"
                    style={{ position: "relative" }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="menu-item-image"
                      />
                    )}

                    {/* ✅ ADD / QUANTITY CONTROL */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -15,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 110,
                      }}
                    >
                      {cartItem ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#fff",
                            border: "1px solid var(--primary, #fc8019)",
                            borderRadius: 8,
                            padding: "4px 8px",
                            color: "var(--primary, #fc8019)",
                            fontWeight: 700,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            fontSize: 14,
                          }}
                        >
                          <button
                            onClick={() => handleRemove(item._id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "inherit",
                              fontSize: 18,
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span>{cartItem.quantity}</span>
                          <button
                            onClick={() => handleAdd(item)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "inherit",
                              fontSize: 18,
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(item)}
                          style={{
                            width: "100%",
                            background: "#fff",
                            border: "1px solid var(--border, #e5e7eb)",
                            borderRadius: 8,
                            padding: "6px 0",
                            fontWeight: 800,
                            color: "var(--primary, #fc8019)",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            textTransform: "uppercase",
                            fontSize: 13,
                            letterSpacing: 0.5,
                          }}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <EmptyState
          icon="🍽️"
          title="No menu items"
          message="This restaurant hasn't added any items yet."
        />
      )}

      {/* ============ CUSTOMER REVIEWS ============ */}
      <section style={{ marginTop: 48, paddingBottom: 40 }}>
        <h2
          className="menu-section-title"
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: 12,
          }}
        >
          Customer Reviews
        </h2>
        <p style={{ color: "var(--text-3)", fontSize: 14 }}>
          No reviews yet. Be the first to order and review!
        </p>
      </section>
    </div>
  );
};

export default RestaurantDetail;
