// study-group-backend/utils/admin/socket.js
let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized - call setIO(io) in server startup.");
  }
  return ioInstance;
};
