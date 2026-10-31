import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

console.log("🔌 [SOCKET] URL:", SOCKET_URL);

if (!SOCKET_URL) {
  console.error(
    "❌ [SOCKET] VITE_SOCKET_URL is missing! Add VITE_SOCKET_URL=http://localhost:3000 to frontend .env and restart Vite."
  );
}

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

/* ─── DEBUG LISTENERS ─── */
socket.on("connect", () => {
  console.log("✅ [SOCKET] connected! id =", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ [SOCKET] connect_error:", err.message);
  console.error("   → socket.io.uri:", socket.io?.uri);
  console.error("   → auth token present:", !!localStorage.getItem("token"));
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ [SOCKET] disconnected:", reason);
});

socket.on("reconnect_attempt", (n) => {
  console.log("🔁 [SOCKET] reconnect attempt #", n);
});

/* ─── CONNECT ─── */
export const connectSocket = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ [SOCKET] connectSocket — no token, skipping");
    return;
  }

  socket.auth = { token };

  if (!socket.connected) {
    console.log("🔌 [SOCKET] connecting to", SOCKET_URL, "with token...");
    socket.connect();
  } else {
    console.log("🔌 [SOCKET] already connected, id =", socket.id);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    console.log("🔌 [SOCKET] disconnecting...");
    socket.disconnect();
  }
};

export default socket;