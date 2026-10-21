import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
  selectDiscount,
  selectDeliveryFee,
  selectTax,
  selectCartTotal,
} from "../../features/cart/cartSlice";
import { closeCart } from "../../features/ui/uiSlice";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CouponBox from "./CouponBox";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const deliveryFee = useSelector(selectDeliveryFee);
  const tax = useSelector(selectTax);
  const discount = useSelector(selectDiscount);
  const total = useSelector(selectCartTotal);
  const cartOpen = useSelector((s) => s.ui.cartOpen);
  const { user, token } = useSelector((s) => s.auth);

  const handleCheckout = () => {
    dispatch(closeCart());
    if (!token || !user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const handleClose = () => dispatch(closeCart());

  return (
    <>
      {cartOpen && (
        <div
          className="cart-drawer-overlay"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cart-sidebar ${cartOpen ? "open" : ""}`}
        aria-hidden={!cartOpen}
      >
        <header className="cart-sidebar-header">
          <h2>
            Your Cart {count > 0 && `(${count} item${count !== 1 ? "s" : ""})`}
          </h2>
          <button
            className="icon-btn-sm"
            onClick={handleClose}
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add items from a restaurant to get started</p>
            <button
              className="btn-primary"
              onClick={() => {
                handleClose();
                navigate("/restaurants");
              }}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <>
            <div className="cart-sidebar-items">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <CouponBox />

            <CartSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tax={tax}
              discount={discount}
              total={total}
            />

            <footer className="cart-sidebar-footer">
              <button
                className="btn-primary"
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Proceed to Checkout · ₹{total}
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
};

export default CartSidebar;
