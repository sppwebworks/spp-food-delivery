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

/* ✅ Import the controller and middleware directly */
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
    ],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  // ... existing socket middleware
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
  // ... existing socket connection logic
  if (socket.userId) socket.join(`user:${socket.userId}`);
  socket.on("join:admin", () => {
    if (socket.userRole === "admin") socket.join("admin");
  });
});

setIO(io);

/* ============================================================
   ✅ EXPLICIT ROUTE OVERRIDE
   ============================================================ */
app.get("/api/admin/stats", protect, adminOnly, getStats);

(async () => {
  await connectDB();
  await verifyEmailConfig();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready`);
  });
})();
