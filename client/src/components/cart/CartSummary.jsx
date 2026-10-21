import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/format";
// ✅ Import the new selector
import { selectPackagingFee } from "../../features/cart/cartSlice";

const CartSummary = ({
  subtotal = 0,
  deliveryFee = 0,
  tax = 0,
  discount = 0,
  total = 0,
  showItemTotal = true,
  compact = false,
}) => {
  const taxRate = useSelector((state) => state.settings?.taxRate ?? 5);
  const packagingFee = useSelector(selectPackagingFee); // ✅ Get packaging fee

  const Row = ({ label, value, className = "", isFree = false }) => (
    <div className={`cart-bill-row ${className}`}>
      <span>{label}</span>
      {isFree ? (
        <span style={{ color: "var(--success)", fontWeight: 700 }}>FREE</span>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );

  return (
    <div className="cart-bill" style={compact ? { padding: "12px 0" } : {}}>
      {!compact && <h3>BILL DETAILS</h3>}

      {showItemTotal && (
        <Row label="Item Total" value={formatCurrency(subtotal)} />
      )}

      {/* ✅ Add FREE tag if delivery fee is 0 */}
      <Row
        label="Delivery Fee"
        value={formatCurrency(deliveryFee)}
        isFree={deliveryFee === 0 && subtotal > 0}
      />

      {/* ✅ Add Packaging Fee row */}
      {packagingFee > 0 && (
        <Row label="Packaging Fee" value={formatCurrency(packagingFee)} />
      )}

      {tax > 0 && (
        <Row label={`Tax (${taxRate}%)`} value={formatCurrency(tax)} />
      )}

      {discount > 0 && (
        <Row
          label="Discount"
          value={`− ${formatCurrency(discount)}`}
          className="discount"
        />
      )}

      <Row
        label="Total Amount"
        value={formatCurrency(total)}
        className="total"
      />
    </div>
  );
};

export default CartSummary;
