import { useDispatch } from "react-redux";
import {
  addToCart,
  removeFromCart,
  removeItemCompletely,
} from "../../features/cart/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncrease = () => {
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        restaurant: item.restaurant,
        restaurantName: item.restaurantName,
      }),
    );
  };

  const handleDecrease = () => dispatch(removeFromCart(item.id));
  const handleRemove = () => dispatch(removeItemCompletely(item.id));

  const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

  return (
    <div className="cart-item">
      {/* LEFT: image + info stacked */}
      <div className="cart-item-main">
        <div className="cart-item-image">
          {item.image ? (
            <img src={item.image} alt={item.name} />
          ) : (
            <div className="cart-item-image-placeholder">🍽️</div>
          )}
        </div>

        <div className="cart-item-info">
          <div className="cart-item-name">{item.name}</div>
          {item.restaurantName && (
            <div className="cart-item-restaurant">{item.restaurantName}</div>
          )}
          <div className="cart-item-price">₹{item.price}</div>
        </div>
      </div>

      {/* RIGHT: total + remove */}
      <button
        className="cart-item-remove"
        onClick={handleRemove}
        aria-label="Remove item"
      >
        ✕
      </button>

      {/* BOTTOM: quantity + line total */}
      <div className="cart-item-bottom">
        <div className="cart-qty">
          <button onClick={handleDecrease} aria-label="Decrease">
            −
          </button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease} aria-label="Increase">
            +
          </button>
        </div>
        <div className="cart-item-total">₹{itemTotal}</div>
      </div>
    </div>
  );
};

export default CartItem;
