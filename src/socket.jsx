
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
});

export const connectSocket = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }
};

export default socket;