/**
 * ============================================================
 * USE SOCKET HOOK
 * ============================================================
 *
 * Manages a Socket.IO connection to the backend.
 * - Authenticates with JWT from localStorage
 * - Auto-joins the user's private room
 * - Cleans up on unmount
 *
 * Usage:
 *   useSocket({
 *     onOrderCreated: (data) => { ... },
 *     onOrderStatus: (data) => { ... },
 *   });
 * ============================================================
 */

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Socket URL = API URL without /api suffix
// http://localhost:5000/api → http://localhost:5000
const SOCKET_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/api\/?$/,
  "",
);

export const useSocket = (handlers = {}) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!SOCKET_URL) {
      console.warn("Socket.IO URL missing — check VITE_API_URL");
      return;
    }

    const token = localStorage.getItem("token");

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // Successfully connected
    socket.on("connect", () => {
      // Optional debug — remove in production
      // console.log("🔌 Socket connected:", socket.id);
    });

    // Failed auth or server error
    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    // Register domain-specific handlers
    if (typeof handlers.onOrderCreated === "function") {
      socket.on("order:created", handlers.onOrderCreated);
    }
    if (typeof handlers.onOrderStatus === "function") {
      socket.on("order:status", handlers.onOrderStatus);
    }

    // Cleanup on unmount
    return () => {
      socket.off("order:created");
      socket.off("order:status");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef.current;
};

export default useSocket;
