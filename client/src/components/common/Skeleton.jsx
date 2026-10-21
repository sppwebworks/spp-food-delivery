/**
 * ============================================================
 * SKELETON
 * ============================================================
 *
 * Types:
 *   - card: restaurant card skeleton (image + 3 lines)
 *   - menuItem: menu row skeleton (2 cols)
 *   - cartItem: cart row skeleton
 *   - text: single line shimmer
 *
 * Usage:
 *   <Skeleton type="card" />
 *   <Skeleton type="card" count={6} />  // 6 cards
 *   <Skeleton type="text" width="60%" />
 * ============================================================
 */

const SkeletonText = ({ width = "100%", height = 14, style = {} }) => (
  <div
    className="shimmer"
    style={{
      width,
      height,
      borderRadius: 4,
      ...style,
    }}
  />
);

const SkeletonCard = () => (
  <div className="restaurant-card" style={{ cursor: "default" }}>
    <div
      className="shimmer"
      style={{ aspectRatio: "16/10", borderRadius: 12 }}
    />
    <div
      className="restaurant-card-info"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <SkeletonText width="70%" height={16} />
      <SkeletonText width="50%" height={12} />
      <SkeletonText width="40%" height={12} />
    </div>
  </div>
);

const SkeletonMenuItem = () => (
  <div className="menu-item" style={{ padding: "20px 0" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <SkeletonText width="60%" height={16} />
      <SkeletonText width="20%" height={14} />
      <SkeletonText width="90%" height={12} />
      <SkeletonText width="75%" height={12} />
    </div>
    <div
      className="shimmer"
      style={{ width: 120, height: 120, borderRadius: 8 }}
    />
  </div>
);

const SkeletonCartItem = () => (
  <div className="cart-item" style={{ padding: "14px 0" }}>
    <div
      className="shimmer"
      style={{ width: 60, height: 60, borderRadius: 6 }}
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <SkeletonText width="80%" height={14} />
      <SkeletonText width="50%" height={12} />
      <SkeletonText width="30%" height={12} />
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-end",
      }}
    >
      <SkeletonText width={60} height={14} />
      <div
        className="shimmer"
        style={{ width: 80, height: 26, borderRadius: 4 }}
      />
    </div>
  </div>
);

const Skeleton = ({ type = "text", count = 1, width, height, style }) => {
  if (type === "card") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </>
    );
  }

  if (type === "menuItem") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonMenuItem key={i} />
        ))}
      </>
    );
  }

  if (type === "cartItem") {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCartItem key={i} />
        ))}
      </>
    );
  }

  // Default: text line
  return <SkeletonText width={width} height={height} style={style} />;
};

export default Skeleton;
