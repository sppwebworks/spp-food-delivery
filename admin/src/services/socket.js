import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;

  const URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  // ✅ Must match the token key in your admin api.js
  const token = localStorage.getItem("admin_token");

  socket = io(URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("🟢 Admin Socket connected:", socket.id);
    // ✅ This is critical: Tell backend to join the admin room
    socket.emit("join:admin");
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Admin Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
