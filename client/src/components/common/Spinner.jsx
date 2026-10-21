/**
 * ============================================================
 * SPINNER
 * ============================================================
 *
 * Sizes:
 *   - sm: 20px (inline / buttons)
 *   - md: 40px (default, sections)
 *   - lg: 64px (full page)
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" text="Loading restaurants..." />
 *   <Spinner size="sm" />
 * ============================================================
 */

const Spinner = ({ size = "md", text = "", inline = false }) => {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 64,
  };

  const px = sizes[size] || sizes.md;
  const borderWidth = size === "sm" ? 2 : size === "md" ? 4 : 6;

  const spinner = (
    <div
      style={{
        width: px,
        height: px,
        border: `${borderWidth}px solid var(--border)`,
        borderTopColor: "var(--primary)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        flexShrink: 0,
      }}
      aria-label="Loading"
      role="status"
    />
  );

  if (inline) return spinner;

  return (
    <div className="spinner-wrap">
      {spinner}
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default Spinner;
