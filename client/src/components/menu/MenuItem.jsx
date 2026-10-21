/**
 * ============================================================
 * MENU ITEM — Single menu row
 * ============================================================
 *
 * Design (from screenshot):
 *   ┌─────────────────────────────┬──────────────┐
 *   │ 🟢 Chicken Biryani          │  [image]     │
 *   │ Aromatic basmati rice...    │              │
 *   │ ₹299                        │  [ + ADD ]   │
 *   └─────────────────────────────┴──────────────┘
 *
 * Props:
 *   item      → { id, name, price, description, image, isVeg }
 *   onAdd     → (item) => void
 *   onOpen    → (id) => void   (optional — click to open item detail)
 *
 * If quantity > 0 in cart, the [+ ADD] swaps to a quantity stepper.
 * ============================================================
 */

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  removeFromCart,
  incrementItem,
  decrementItem,
} from "../../features/cart/cartSlice";
import { useToast } from "../../context/ToastContext";

const MenuItem = ({ item, restaurantId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cartItem = useSelector((s) =>
    s.cart.items.find((i) => i.id === item.id),
  );
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    dispatch(addToCart(item));
    showToast(`${item.name} added`, "success");
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    dispatch(incrementItem(item.id));
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity === 1) {
      dispatch(removeFromCart(item.id));
    } else {
      dispatch(decrementItem(item.id));
    }
  };

  const handleOpen = () => {
    if (restaurantId) {
      navigate(`/restaurants/${restaurantId}/item/${item.id}`);
    }
  };

  return (
    <div className="menu-item" onClick={handleOpen}>
      {/* ============== LEFT: INFO ============== */}
      <div className="menu-item-info">
        <div
          className={`menu-item-veg-indicator ${item.isVeg ? "" : "non-veg"}`}
          aria-label={item.isVeg ? "Veg" : "Non-veg"}
        />

        <h3 className="menu-item-name">{item.name}</h3>

        <div className="menu-item-price">₹{item.price}</div>

        {item.description && (
          <p className="menu-item-description">{item.description}</p>
        )}
      </div>

      {/* ============== RIGHT: IMAGE + ACTION ============== */}
      <div className="menu-item-image-wrap">
        <img
          src={item.image}
          alt={item.name}
          className="menu-item-image"
          loading="lazy"
        />

        {quantity === 0 ? (
          <button
            className="menu-item-add-btn"
            onClick={handleAdd}
            aria-label={`Add ${item.name} to cart`}
          >
            Add
          </button>
        ) : (
          <div
            className="cart-qty"
            style={{
              position: "absolute",
              bottom: -14,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={handleDecrement} aria-label="Decrease quantity">
              −
            </button>
            <span>{quantity}</span>
            <button onClick={handleIncrement} aria-label="Increase quantity">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
