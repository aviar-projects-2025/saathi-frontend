import { useCallback, useEffect, useRef, useState } from "react";
import socket from "../socket";

export const useChatSocket = ({ onMessage } = {}) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState({});

  const handlerRef = useRef(onMessage);
  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  // Reads current user id from JWT (mirror of chatUtils.getCurrentUserId)
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

  useEffect(() => {
    const handle = (payload) => {
      if (!payload?._id) return;

      setLastMessage(payload);

      // Determine if this message is from someone else
      const senderRaw = payload.senderId;
      const senderId =
        typeof senderRaw === "object"
          ? String(senderRaw?._id || senderRaw?.id || "")
          : String(senderRaw || "");

      const myId = getMyId();
      const isMine = myId && senderId === myId;

      if (!isMine) {
        setUnreadChats((n) => n + 1);

        const chatId = String(payload.chatId?._id || payload.chatId || "");
        const senderUserId = String(
          typeof payload.senderId === "object"
            ? payload.senderId?._id || payload.senderId?.id || ""
            : payload.senderId || ""
        );

        if (chatId || senderUserId) {
          setUnreadByChat((prev) => {
            const next = { ...prev };
            if (chatId) next[chatId] = (next[chatId] || 0) + 1;
            if (senderUserId) next[senderUserId] = (next[senderUserId] || 0) + 1;
            return next;
          });
        }
      }

      handlerRef.current?.(payload);
    };

    socket.on("chat:message", handle);
    return () => socket.off("chat:message", handle);
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadChats(0);
    setUnreadByChat({});
  }, []);

  const clearChatUnread = useCallback((chatOrUserId) => {
  if (!chatOrUserId) return;
  const key = String(chatOrUserId);

  setUnreadByChat((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    const count = next[key];
    delete next[key];

    setUnreadChats((total) => Math.max(0, total - count));
    return next;
  });
}, []);

  return {
    lastMessage,
    unreadChats,
    unreadByChat,
    resetUnread,
    clearChatUnread,
  };
};