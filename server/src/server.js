import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import connectDB from "./config/db.js";
import { setIO } from "./config/socket.js";
import { validateEnv } from "./config/validateEnv.js";
import { verifyEmailConfig } from "./config/mailer.js";
import User from "./models/User.js";

import { getStats } from "./controllers/adminController.js";
import { protect, adminOnly } from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 5000;

validateEnv();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      process.env.ADMIN_URL || "http://localhost:5174",
      process.env.RIDER_URL || "http://localhost:5175",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ].filter(Boolean),
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded.userId).select(
        "role",
      );
      if (user) {
        socket.userId = user._id;
        socket.userRole = user.role;
      }
    }
    next();
  } catch (err) {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  if (socket.userId) socket.join(`user:${socket.userId}`);

  socket.on("join:admin", () => {
    if (socket.userRole === "admin") socket.join("admin");
  });

  // 🆕 Customer tracking an order
  socket.on("order:track", (orderId) => {
    socket.join(`order:${orderId}`);
  });

  // 🆕 Rider joins their own room to receive assignments
  socket.on("rider:join", (riderId) => {
    socket.join(`rider:${riderId}`);
  });

  // 🆕 Rider broadcasts location updates during delivery
  socket.on("rider:location", ({ orderId, lat, lng }) => {
    if (orderId) {
      socket.to(`order:${orderId}`).emit("rider:location", { lat, lng });
    }
  });
});

setIO(io);

app.get("/api/admin/stats", protect, adminOnly, getStats);

(async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");

    console.log("🔄 Verifying Email...");
    await verifyEmailConfig();
    console.log("✅ Email verified");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (error) {
    console.error("❌ CRITICAL STARTUP ERROR:");
    console.error(error);
    process.exit(1);
  }
})();
