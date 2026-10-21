import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;

  const URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";
  const token = localStorage.getItem("token"); // ← Customer uses "token"

  socket = io(URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: { token },
  });

  socket.on("connect", () => console.log("🟢 Customer Socket connected"));
  return socket;
};

export const getSocket = () => socket;
