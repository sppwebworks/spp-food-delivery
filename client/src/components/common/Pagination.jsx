/**
 * ============================================================
 * PAGINATION
 * ============================================================
 *
 * Props:
 *   page          number    — current page (1-based)
 *   totalPages    number    — total number of pages
 *   onChange      (n)=>void — called with new page number
 *   siblingCount  number    — pages to show on each side of current (default 1)
 *   className     string    — extra classes
 *
 * Renders:
 *   ‹ Prev   1 … 4 [5] 6 … 12   Next ›
 *
 * Uses a compact page-range algorithm to show ellipses when
 * there are too many pages.
 * ============================================================
 */

const DOTS = "…";

const range = (start, end) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const usePaginationRange = ({ page, totalPages, siblingCount = 1 }) => {
  // Total slots to display: 1 (first) + 2 (dots) + 2*sibling + 1 (current) + 1 (last)
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(
      totalPages - (3 + siblingCount * 2) + 1,
      totalPages,
    );
    return [1, DOTS, ...rightRange];
  }

  const middleRange = range(leftSibling, rightSibling);
  return [1, DOTS, ...middleRange, DOTS, totalPages];
};

const Pagination = ({
  page = 1,
  totalPages = 1,
  onChange = () => {},
  siblingCount = 1,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = usePaginationRange({ page, totalPages, siblingCount });

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  return (
    <nav
      className={`pagination ${className}`}
      aria-label="Pagination"
      role="navigation"
    >
      {/* Prev */}
      <button
        type="button"
        className="pagination-btn pagination-prev"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <span className="pagination-arrow">‹</span>
        <span className="pagination-btn-label">Prev</span>
      </button>

      {/* Page numbers */}
      <div className="pagination-pages">
        {pages.map((p, idx) =>
          p === DOTS ? (
            <span key={`dots-${idx}`} className="pagination-dots">
              {DOTS}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-num ${p === page ? "active" : ""}`}
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Go to page ${p}`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        className="pagination-btn pagination-next"
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <span className="pagination-btn-label">Next</span>
        <span className="pagination-arrow">›</span>
      </button>
    </nav>
  );
};

export default Pagination;
