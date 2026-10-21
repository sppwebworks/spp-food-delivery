/**
 * ============================================================
 * FRONTEND FORMATTING HELPERS
 * ============================================================
 */

/* ---------- Currency ---------- */
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

/* ---------- Discount ---------- */
export const calculateDiscount = (price, mrp) => {
  const p = Number(price);
  const m = Number(mrp);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
};

/* ---------- Date ---------- */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const timeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

/* ---------- String ---------- */
export const truncate = (text = "", maxLength = 100) => {
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "...";
};

export const titleCase = (text = "") => {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
