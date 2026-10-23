/**
 * ============================================================
 * Socket.IO singleton — allows controllers to emit events
 * without needing a direct reference to the io instance.
 * ============================================================
 */

let io;

export const setIO = (instance) => {
  io = instance;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
