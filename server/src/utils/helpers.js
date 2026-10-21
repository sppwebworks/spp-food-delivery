/**
 * ============================================================
 * HELPER UTILITIES
 * ============================================================
 * Shared utility functions used across controllers and models.
 * Pure functions (no side effects) that make business logic
 * easier to test and reason about.
 * ============================================================
 */

/* ============================================================
   PRICE & CURRENCY
   ============================================================ */

/**
 * Format a number as Indian Rupee currency
 * @example formatCurrency(1234.5) → "₹1,234.50"
 */
export const formatCurrency = (amount, currency = "INR") => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Round to 2 decimal places (avoids floating point errors)
 * @example roundPrice(10.999) → 11.00
 */
export const roundPrice = (amount) => {
  return Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
};

/**
 * Calculate discount percentage
 * @example calculateDiscount(349, 499) → 30 (means 30% off)
 */
export const calculateDiscount = (currentPrice, mrp) => {
  const price = Number(currentPrice);
  const original = Number(mrp);
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
};

/**
 * Calculate order totals (subtotal, tax, delivery, discount, total)
 * @param items - Array of {price, quantity}
 * @param options - {deliveryFee, taxRate, discount}
 */
export const calculateOrderTotals = (
  items = [],
  {
    deliveryFee = 30,
    taxRate = 0.05,
    discount = 0,
    freeDeliveryThreshold = 0,
  } = {},
) => {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0,
  );

  const appliedDeliveryFee =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
      ? 0
      : deliveryFee;

  const tax = roundPrice(subtotal * taxRate);
  const safeDiscount = Math.min(Number(discount) || 0, subtotal);

  const total = roundPrice(subtotal + appliedDeliveryFee + tax - safeDiscount);

  return {
    subtotal: roundPrice(subtotal),
    deliveryFee: appliedDeliveryFee,
    tax,
    discount: safeDiscount,
    total,
  };
};

/* ============================================================
   STRING UTILITIES
   ============================================================ */

/**
 * Convert a string to a URL-friendly slug
 * @example slugify("Paradise Biryani & Grill") → "paradise-biryani-grill"
 */
export const slugify = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // collapse whitespace and underscores
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
};

/**
 * Capitalize first letter of each word
 * @example titleCase("chicken biryani") → "Chicken Biryani"
 */
export const titleCase = (text = "") => {
  return String(text)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Truncate a string with an ellipsis
 * @example truncate("A very long description", 10) → "A very lon..."
 */
export const truncate = (text = "", maxLength = 100) => {
  const str = String(text);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "...";
};

/* ============================================================
   VALIDATION
   ============================================================ */

/**
 * Check if a string is a valid email
 */
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(String(email || ""));
};

/**
 * Check if a string is a valid Indian 10-digit mobile number
 */
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(String(phone || "").replace(/\D/g, ""));
};

/**
 * Check if a string is a valid Indian 6-digit pincode
 */
export const isValidPincode = (pincode) => {
  return /^\d{6}$/.test(String(pincode || ""));
};

/**
 * Check if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(String(id || ""));
};

/* ============================================================
   DISTANCE & DELIVERY
   ============================================================ */

/**
 * Haversine distance between two coordinates in kilometers
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== "number" || isNaN(v))) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return roundPrice(R * c); // distance in km
};

/**
 * Estimate delivery time based on distance (avg speed: 20 km/h in city traffic)
 */
export const estimateDeliveryTime = (distanceKm = 0, prepTime = 15) => {
  if (!distanceKm || distanceKm < 0) return prepTime;
  const travelTimeMinutes = Math.ceil((distanceKm / 20) * 60);
  return prepTime + travelTimeMinutes;
};

/* ============================================================
   DATE & TIME
   ============================================================ */

/**
 * Format a date as "17 Oct 2026, 10:30 AM"
 */
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

/**
 * Return a relative time string ("2 hours ago", "in 3 days")
 */
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

/**
 * Add a number of minutes to a date
 */
export const addMinutes = (date, minutes) => {
  return new Date(new Date(date).getTime() + minutes * 60 * 1000);
};

/* ============================================================
   PAGINATION
   ============================================================ */

/**
 * Parse pagination params from query string
 * @example parsePagination({page: "2", limit: "20"}) → {page: 2, limit: 20, skip: 20}
 */
export const parsePagination = (query = {}, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit) || defaultLimit),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build a pagination response object
 */
export const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};

/* ============================================================
   ID & TOKEN
   ============================================================ */

/**
 * Generate a short order ID like "ORD-X7K9M"
 */
export const generateOrderId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ORD-${id}`;
};

/**
 * Generate a random alphanumeric string
 */
export const generateRandomString = (length = 16) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

/* ============================================================
   ARRAY & OBJECT
   ============================================================ */

/**
 * Group an array by a key
 * @example groupBy([{cat: "A"}, {cat: "B"}, {cat: "A"}], "cat")
 *          → {A: [{...}, {...}], B: [{...}]}
 */
export const groupBy = (array = [], key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Remove duplicate objects by a key
 */
export const uniqueBy = (array = [], key) => {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffle = (array = []) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/* ============================================================
   RESPONSE HELPERS
   ============================================================ */

/**
 * Standard success response
 */
export const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null && { data }),
  });
};

/**
 * Standard error response
 */
export const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/* ============================================================
   LOGGING
   ============================================================ */

/**
 * Simple timestamped logger
 */
export const log = (...args) => {
  console.log(`[${new Date().toISOString()}]`, ...args);
};

export const logError = (...args) => {
  console.error(`[${new Date().toISOString()}] [ERROR]`, ...args);
};

export default {
  formatCurrency,
  roundPrice,
  calculateDiscount,
  calculateOrderTotals,
  slugify,
  titleCase,
  truncate,
  isValidEmail,
  isValidPhone,
  isValidPincode,
  isValidObjectId,
  calculateDistance,
  estimateDeliveryTime,
  formatDate,
  timeAgo,
  addMinutes,
  parsePagination,
  buildPaginationResponse,
  generateOrderId,
  generateRandomString,
  groupBy,
  uniqueBy,
  shuffle,
  successResponse,
  errorResponse,
  log,
  logError,
};
