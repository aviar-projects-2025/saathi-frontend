import { io } from "socket.io-client";
import Api from "./Api";

const SOCKET_URL = Api.replace(/\/api\/?$/, "").replace(/\/+$/, "");

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // fallback for old browsers
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  } else {
    // token rotated — force re-auth
    socket.disconnect();
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;