import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ChatModalContext = createContext(null);

export function ChatModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const openChatWith = useCallback((user) => {
    if (!user?._id) return;
    setPendingUser(user);
    setIsOpen(true);
  }, []);

  const openChat = useCallback(() => {
    setPendingUser(null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setPendingUser(null);
  }, []);

  const value = useMemo(
    () => ({ isOpen, pendingUser, openChatWith, openChat, closeChat }),
    [isOpen, pendingUser, openChatWith, openChat, closeChat]
  );

  return <ChatModalContext.Provider value={value}>{children}</ChatModalContext.Provider>;
}

export function useChatModal() {
  const ctx = useContext(ChatModalContext);
  if (!ctx) {
    throw new Error("useChatModal must be used inside ChatModalProvider");
  }
  return ctx;
}