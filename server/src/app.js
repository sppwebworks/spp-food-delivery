/**
 * ============================================================
 * EXPRESS APP — Production hardened
 * ============================================================
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

/* ---------- Routes ---------- */
import authRoutes from "./routes/authRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminRestaurantRoutes from "./routes/adminRestaurantRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import adminSettingRoutes from "./routes/adminSettingRoutes.js";
import publicSettingRoutes from "./routes/publicSettingRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import adminSupportRoutes from "./routes/adminSupportRoutes.js";

/* ---------- Middleware ---------- */
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { sanitizeMongo } from "./middleware/sanitize.js";
import { protect, adminOnly } from "./middleware/authMiddleware.js";
import { getStats } from "./controllers/adminController.js"; // ✅ Direct import

/* ---------- ESM __dirname shim ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* TRUST PROXY */
app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);

/* SECURITY HEADERS */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  }),
);

/* CORS */
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ✅ WEBHOOKS — BEFORE JSON PARSER */
app.use("/api/payments/webhook", webhookRoutes);

/* BODY PARSERS */
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

/* MONGODB SANITIZATION */
app.use(sanitizeMongo);

/* STATIC FILES */
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

/* RATE LIMITERS */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many auth attempts. Please try again later." },
});
app.use("/api", globalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

/* HEALTH CHECK */
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  }),
);

/* ============================================================
   ✅ EXPLICIT ADMIN STATS ROUTE 
   (Must be above app.use("/api/admin", ...) to prevent /:id conflict)
   ============================================================ */
app.get("/api/admin/stats", protect, adminOnly, getStats);

/* APPLICATION ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/settings", publicSettingRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/admin/settings", adminSettingRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminRestaurantRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin/support", adminSupportRoutes);

/* ERROR HANDLERS */
app.use(notFound);
app.use(errorHandler);

export default app;
