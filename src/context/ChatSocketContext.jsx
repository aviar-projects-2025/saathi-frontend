import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import socket from "../socket";

const ChatSocketContext = createContext(null);

const getMyId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const p = token.split(".")[1];
    const b = p.replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(atob(b.padEnd(Math.ceil(b.length / 4) * 4, "=")));
    return String(d.id || d._id || d.userId || d.sub || "");
  } catch {
    return "";
  }
};

export function ChatSocketProvider({ children }) {
  const [lastMessage, setLastMessage] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState({});
  const handlerRef = useRef(null);

  // A single global subscription — receives every chat:message exactly once.
  useEffect(() => {
    const onMessage = (payload) => {
      if (!payload?._id) return;

      setLastMessage(payload);

      const senderRaw = payload.senderId;
      const senderId =
        typeof senderRaw === "object"
          ? String(senderRaw?._id || senderRaw?.id || "")
          : String(senderRaw || "");

      const myId = getMyId();
      const isMine = myId && senderId === myId;
      if (isMine) {
        handlerRef.current?.(payload);
        return;
      }

      // ONE key per conversation: the sender's user ID.
      // ChatList keys by user ID, so this is the right identity.
      if (senderId) {
        setUnreadChats((n) => n + 1);
        setUnreadByChat((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      handlerRef.current?.(payload);
    };

    const onRead = (payload) => {
      const otherUserId = String(
        payload?.otherUserId?._id || payload?.otherUserId || ""
      );
      if (!otherUserId) return;

      setUnreadByChat((prev) => {
        if (!prev[otherUserId]) return prev;
        const next = { ...prev };
        const removed = next[otherUserId];
        delete next[otherUserId];
        setUnreadChats((total) => Math.max(0, total - removed));
        return next;
      });
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:read", onRead);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:read", onRead);
    };
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadChats(0);
    setUnreadByChat({});
  }, []);

  // Accept either a user ID or a chat ID. Clear both keys if both exist.
  const clearChatUnread = useCallback((chatOrUserId, otherUserId) => {
    const ids = [chatOrUserId, otherUserId]
      .filter(Boolean)
      .map((v) => String(v));
    if (!ids.length) return;

    setUnreadByChat((prev) => {
      const next = { ...prev };
      let removed = 0;
      for (const key of ids) {
        if (next[key]) {
          removed += next[key];
          delete next[key];
        }
      }
      if (removed > 0) {
        setUnreadChats((total) => Math.max(0, total - removed));
      }
      return next;
    });
  }, []);

  const value = {
    lastMessage,
    unreadChats,
    unreadByChat,
    resetUnread,
    clearChatUnread,
  };

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) {
    throw new Error("useChatSocket must be used inside ChatSocketProvider");
  }
  return ctx;
}