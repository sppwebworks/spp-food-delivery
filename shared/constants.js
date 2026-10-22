/**
 * ============================================================
 * SHARED CONSTANTS
 * ============================================================
 * Values used by both client/ and admin/ apps.
 *
 * Usage (from client or admin):
 *   import { ORDER_STATUS, PAYMENT_METHOD } from "../../shared/constants";
 *
 * Or with path alias (recommended):
 *   import { ORDER_STATUS } from "@shared/constants";
 * ============================================================
 */

/* ============================================================
   ORDER STATUS
   ============================================================ */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LIST = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.PREPARING]: "Preparing",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "Out for Delivery",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "#f59e0b",
  [ORDER_STATUS.CONFIRMED]: "#3b82f6",
  [ORDER_STATUS.PREPARING]: "#8b5cf6",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "#06b6d4",
  [ORDER_STATUS.DELIVERED]: "#10b981",
  [ORDER_STATUS.CANCELLED]: "#ef4444",
};

/* ============================================================
   PAYMENT
   ============================================================ */
export const PAYMENT_METHOD = {
  COD: "cod",
  STRIPE: "stripe",
  RAZORPAY: "razorpay",
  PHONEPE: "phonepe",
  UPI: "upi",
};

export const PAYMENT_METHOD_LIST = [
  PAYMENT_METHOD.COD,
  PAYMENT_METHOD.STRIPE,
  PAYMENT_METHOD.RAZORPAY,
  PAYMENT_METHOD.PHONEPE,
  PAYMENT_METHOD.UPI,
];

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "Cash on Delivery",
  [PAYMENT_METHOD.STRIPE]: "Credit / Debit Card",
  [PAYMENT_METHOD.RAZORPAY]: "Razorpay",
  [PAYMENT_METHOD.PHONEPE]: "PhonePe",
  [PAYMENT_METHOD.UPI]: "UPI Apps",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

/* ============================================================
   USER ROLES
   ============================================================ */
export const USER_ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  DELIVERY: "delivery",
};

/* ============================================================
   SORT OPTIONS
   ============================================================ */
export const SORT_OPTION = {
  RELEVANCE: "relevance",
  RATING: "rating",
  DELIVERY_TIME: "delivery",
  COST_LOW_HIGH: "cost-low-high",
  COST_HIGH_LOW: "cost-high-low",
};

export const SORT_OPTIONS = [
  { value: SORT_OPTION.RELEVANCE, label: "Relevance", icon: "🎯" },
  { value: SORT_OPTION.RATING, label: "Rating 4.0+", icon: "★" },
  { value: SORT_OPTION.DELIVERY_TIME, label: "Fast Delivery", icon: "⚡" },
  { value: SORT_OPTION.COST_LOW_HIGH, label: "Cost: Low to High", icon: "↑" },
  { value: SORT_OPTION.COST_HIGH_LOW, label: "Cost: High to Low", icon: "↓" },
];

/* ============================================================
   CITIES & AREAS
   ============================================================ */
export const CITIES = [
  { id: "bangalore", name: "Bangalore", state: "Karnataka" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "delhi", name: "Delhi", state: "Delhi NCR" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal" },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat" },
];

/* ============================================================
   CUISINE / CATEGORY EMOJI MAP
   ============================================================ */
export const CUISINE_EMOJI = {
  Biryani: "🍛",
  Hyderabadi: "🍛",
  Mughlai: "🥘",
  "North Indian": "🍲",
  Pizza: "🍕",
  Italian: "🍝",
  Burgers: "🍔",
  American: "🌭",
  "Fast Food": "🍟",
  Chinese: "🥡",
  "Indo-Chinese": "🥡",
  Asian: "🍜",
  "South Indian": "🥘",
  Dosa: "🥞",
  Breakfast: "🍳",
  Vegetarian: "🥗",
  Desserts: "🍰",
  "Ice Cream": "🍦",
  Cakes: "🎂",
  Bakery: "🥐",
  Kebabs: "🍢",
  Tandoori: "🍖",
  Thali: "🍽️",
  Punjabi: "🍛",
  Chettinad: "🌶️",
  Tamil: "🍛",
  Beverages: "🥤",
  Coffee: "☕",
  Seafood: "🦐",
  Salads: "🥗",
  Soups: "🍲",
  Combos: "🍱",
};

/* ============================================================
   RATING OPTIONS
   ============================================================ */
export const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
];

/* ============================================================
   DELIVERY TIME OPTIONS
   ============================================================ */
export const DELIVERY_TIME_OPTIONS = [
  { value: "under-30", label: "Under 30 mins" },
  { value: "under-45", label: "Under 45 mins" },
];

/* ============================================================
   APP CONFIG
   ============================================================ */
export const APP_CONFIG = {
  name: "SPP FoodieApp",
  tagline: "Good Food. Great Mood.",
  currency: "INR",
  currencySymbol: "₹",
  deliveryFee: 30,
  taxRate: 0.05, // 5%
  maxDeliveryTime: 120,
  minOrderValue: 199,
  itemsPerPage: 12,
};

/* ============================================================
   VALIDATION PATTERNS
   ============================================================ */
export const VALIDATION = {
  email: /^\S+@\S+\.\S+$/,
  phone: /^[6-9]\d{9}$/, // Indian 10-digit mobile
  pincode: /^\d{6}$/, // Indian 6-digit pincode
};

/* ============================================================
   LOCAL STORAGE KEYS
   ============================================================ */
export const STORAGE_KEYS = {
  CLIENT_TOKEN: "token",
  ADMIN_TOKEN: "admin_token",
  LOCATION: "foodie_location",
  THEME: "foodie_theme",
  RECENT_SEARCHES: "foodie_recent_searches",
  CART: "foodie_cart",
};
