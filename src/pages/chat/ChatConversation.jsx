import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Paper,
  Stack,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import socket from "../../socket";
import {
  API_BASE,
  authHeaders,
  getCurrentUserId,
  normalizeMessage,
  mergeMessages,
  isWithin15Min,
  getUserName,
  getInitials,
  SAFFRON,
} from "./chatUtils";

export default function ChatConversation({ user, onBack, onClose }) {
  const myId = getCurrentUserId();

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatError, setChatError] = useState("");
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedMe, setBlockedMe] = useState(false);

  const [headerMenuAnchor, setHeaderMenuAnchor] = useState(null);
  const [msgMenuAnchor, setMsgMenuAnchor] = useState(null);
  const [msgMenuTarget, setMsgMenuTarget] = useState(null);

  const messagesEndRef = useRef(null);
  const activeChatIdRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  /* ─── Open chat ─── */
  useEffect(() => {
    if (!user?._id) return;

    let cancelled = false;
    setChatId(null);
    setMessages([]);
    setChatError("");
    setBlockedByMe(false);
    setBlockedMe(false);
    activeChatIdRef.current = null;
    setLoadingMessages(true);

    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/chat/with/${user._id}`, {
          headers: authHeaders(),
        });
        if (cancelled) return;
        const chat = res.data?.data;
        if (!chat?._id) throw new Error("Could not open chat");
        setChatId(String(chat._id));
        activeChatIdRef.current = String(chat._id);
      } catch (err) {
        if (cancelled) return;
        const msg = err.response?.data?.message || "Unable to open this chat.";
        setChatError(msg);
        if (msg.toLowerCase().includes("blocked this user")) {
          setBlockedByMe(true);
        } else if (msg.toLowerCase().includes("cannot message")) {
          setBlockedMe(true);
        }
        setLoadingMessages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  /* ─── Load messages ─── */
  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadingMessages(true);
        const res = await axios.get(`${API_BASE}/chat/${chatId}/messages`, {
          headers: authHeaders(),
          params: { page: 1, limit: 100 },
        });
        if (cancelled) return;
        const raw = res.data?.data?.messages || [];
        const normalized = raw.map((m) => normalizeMessage(m, myId));
        setMessages((prev) => mergeMessages(prev, normalized));
        scrollToBottom("auto");

        await axios.patch(
          `${API_BASE}/chat/${chatId}/read`,
          {},
          { headers: authHeaders() }
        );
        setChatError("");
      } catch (err) {
        if (!cancelled) {
          setChatError(
            err.response?.data?.message || "Unable to load messages."
          );
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chatId, myId, scrollToBottom]);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ─── Realtime ─── */
  useEffect(() => {
    if (!chatId) return;

    const onIncoming = (raw) => {
      const m = normalizeMessage(raw, myId);
      if (!m.id || m.chatId !== activeChatIdRef.current) return;
      setMessages((prev) => mergeMessages(prev, [m]));
      if (m.sender === "other") {
        axios
          .patch(
            `${API_BASE}/chat/${m.chatId}/read`,
            {},
            { headers: authHeaders() }
          )
          .catch(() => {});
      }
    };

    const onRead = (payload) => {
      if (String(payload?.chatId) !== activeChatIdRef.current) return;
      if (String(payload?.readerId) === String(myId)) return;
      setMessages((prev) =>
        prev.map((m) => (m.sender === "me" ? { ...m, status: "read" } : m))
      );
    };

    const onDeleted = (payload) => {
      if (String(payload?.chatId) !== activeChatIdRef.current) return;
      const mid = String(payload?.messageId || "");
      const scope = payload?.scope || "me";
      setMessages((prev) => {
        if (scope === "everyone") {
          return prev.map((m) =>
            m.id === mid ? { ...m, text: "", deletedForEveryone: true } : m
          );
        }
        return prev.filter((m) => m.id !== mid);
      });
    };

    const onBlocked = (payload) => {
      const otherId = String(payload?.blockedId || payload?.unblockedBy);
      if (String(user?._id) !== otherId) return;
      if (payload?.blockedByMe) setBlockedByMe(true);
      else setBlockedMe(true);
    };

    const onUnblocked = (payload) => {
      const otherId = String(payload?.unblockedId || payload?.unblockedBy);
      if (String(user?._id) !== otherId) return;
      setBlockedByMe(false);
      setBlockedMe(false);
    };

    socket.on("chat:message", onIncoming);
    socket.on("chat:read", onRead);
    socket.on("chat:message:deleted", onDeleted);
    socket.on("chat:blocked", onBlocked);
    socket.on("chat:unblocked", onUnblocked);

    return () => {
      socket.off("chat:message", onIncoming);
      socket.off("chat:read", onRead);
      socket.off("chat:message:deleted", onDeleted);
      socket.off("chat:blocked", onBlocked);
      socket.off("chat:unblocked", onUnblocked);
    };
  }, [chatId, myId, user?._id]);

  /* ─── Send ─── */
  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !chatId || sending) return;

    setSending(true);
    setChatError("");

    try {
      const res = await axios.post(
        `${API_BASE}/chat/${chatId}/messages`,
        { text },
        { headers: authHeaders() }
      );
      const saved = res.data?.data;
      if (!saved?._id) throw new Error("Server did not return message");
      setMessages((prev) =>
        mergeMessages(prev, [normalizeMessage(saved, myId)])
      );
      setMessageText("");
      scrollToBottom();
    } catch (err) {
      setChatError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─── Delete ─── */
  const openMsgMenu = (e, msg) => {
    setMsgMenuAnchor(e.currentTarget);
    setMsgMenuTarget(msg);
  };
  const closeMsgMenu = () => {
    setMsgMenuAnchor(null);
    setMsgMenuTarget(null);
  };

  const deleteMessage = async (scope) => {
    if (!msgMenuTarget) return;
    const mid = msgMenuTarget.id;
    closeMsgMenu();
    try {
      await axios.delete(`${API_BASE}/chat/${chatId}/messages/${mid}`, {
        headers: authHeaders(),
        params: { scope },
      });
      setMessages((prev) => {
        if (scope === "everyone") {
          return prev.map((m) =>
            m.id === mid ? { ...m, text: "", deletedForEveryone: true } : m
          );
        }
        return prev.filter((m) => m.id !== mid);
      });
    } catch (err) {
      setChatError(
        err.response?.data?.message || "Failed to delete message."
      );
    }
  };

  /* ─── Block ─── */
  const blockUser = async () => {
    setHeaderMenuAnchor(null);
    try {
      await axios.post(
        `${API_BASE}/blocks/${user._id}`,
        {},
        { headers: authHeaders() }
      );
      setBlockedByMe(true);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to block user.");
    }
  };

  const unblockUser = async () => {
    setHeaderMenuAnchor(null);
    try {
      await axios.delete(`${API_BASE}/blocks/${user._id}`, {
        headers: authHeaders(),
      });
      setBlockedByMe(false);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to unblock user.");
    }
  };

  const renderStatus = (status) => {
    if (status === "read")
      return <DoneAllIcon sx={{ fontSize: 16, color: "#53bdeb" }} />;
    if (status === "sent" || status === "delivered")
      return <CheckIcon sx={{ fontSize: 15, color: "#8696a0" }} />;
    return null;
  };

  const inputDisabled = !chatId || sending || blockedByMe || blockedMe;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#EFEAE2",
      }}
    >
      {/* ─── Header ─── */}
      <Box
        sx={{
          height: 64,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EEEEEE",
          flexShrink: 0,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <IconButton onClick={onBack} sx={{ ml: -0.5, mr: 0.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar
          src={user?.profileImage || ""}
          sx={{
            width: 42,
            height: 42,
            bgcolor: SAFFRON,
            fontWeight: 700,
            fontSize: "0.95rem",
            border: "2px solid #FFEAD1",
          }}
        >
          {!user?.profileImage && getInitials(user)}
        </Avatar>
        <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight={700}
            noWrap
            sx={{ fontSize: "0.95rem", color: "#222" }}
          >
            {getUserName(user)}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#888" }}>
            {blockedByMe ? "Blocked" : blockedMe ? "Unavailable" : "Online"}
          </Typography>
        </Box>
        <IconButton
          onClick={(e) => setHeaderMenuAnchor(e.currentTarget)}
          sx={{ color: "#666" }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* ─── Messages Scroll Area ─── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          backgroundColor: "#EFEAE2",
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.045) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: messages.length === 0 ? "center" : "flex-end",
        }}
      >
        {/* Forces height during loading so modal doesn't shrink */}
        {loadingMessages && messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={26} sx={{ color: SAFFRON }} />
          </Box>
        )}

        {chatError && (
          <Typography
            role="alert"
            sx={{
              textAlign: "center",
              color: "#c62828",
              fontSize: "0.85rem",
              py: 1,
            }}
          >
            {chatError}
          </Typography>
        )}

        {messages.map((m, idx) => {
          const isMine = m.sender === "me";
          const isDeleted = m.deletedForEveryone;
          const prev = messages[idx - 1];
          const next = messages[idx + 1];
          const prevSame = prev?.sender === m.sender;
          const nextSame = next?.sender === m.sender;

          return (
            <Box
              key={m.id}
              sx={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 0.7,
                mb: nextSame ? 0.4 : 1.2,
                mt: prevSame ? 0 : 0.6,
              }}
            >
              {/* Avatar for received messages (last of group only) */}
              {!isMine && (
                <Avatar
                  src={!nextSame ? user?.profileImage || "" : ""}
                  sx={{
                    width: 26,
                    height: 26,
                    bgcolor: nextSame ? "transparent" : SAFFRON,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    visibility: nextSame ? "hidden" : "visible",
                    flexShrink: 0,
                  }}
                >
                  {!nextSame && !user?.profileImage && getInitials(user)}
                </Avatar>
              )}

              <Paper
                elevation={0}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openMsgMenu(e, m);
                }}
                sx={{
                  maxWidth: { xs: "82%", sm: "72%" },
                  px: 1.6,
                  py: 0.9,
                  borderRadius: isMine
                    ? `16px 16px ${nextSame ? "16px" : "4px"} 16px`
                    : `16px 16px 16px ${nextSame ? "16px" : "4px"}`,
                  backgroundColor: isMine ? "#DCF8C6" : "#FFFFFF",
                  border: isMine ? "none" : "1px solid #F0F0F0",
                  boxShadow: "0 1px 1.5px rgba(0,0,0,0.08)",
                  cursor: "context-menu",
                  overflowWrap: "anywhere",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.92rem",
                    lineHeight: 1.4,
                    color: isDeleted ? "#999" : "#222",
                    fontStyle: isDeleted ? "italic" : "normal",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {isDeleted ? "🚫 This message was deleted" : m.text}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  spacing={0.4}
                  sx={{ mt: 0.3 }}
                >
                  <Typography sx={{ fontSize: "0.66rem", color: "#8696a0" }}>
                    {m.time}
                  </Typography>
                  {isMine && !isDeleted && renderStatus(m.status)}
                </Stack>
              </Paper>
            </Box>
          );
        })}

        {!loadingMessages && messages.length === 0 && !chatError && (
          <Typography
            sx={{
              textAlign: "center",
              color: "#667781",
              fontSize: "0.85rem",
              py: 2,
            }}
          >
            No messages yet. Say hello! 👋
          </Typography>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Block warning bar */}
      {(blockedByMe || blockedMe) && (
        <Box
          sx={{
            px: 2,
            py: 1.2,
            backgroundColor: "#FFF3E0",
            borderTop: "1px solid #FFE0B2",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: "0.82rem", color: "#8B4513" }}>
            {blockedByMe
              ? "You blocked this user. Unblock to send messages."
              : "You can't message this user."}
          </Typography>
          {blockedByMe && (
            <Button
              size="small"
              onClick={unblockUser}
              sx={{
                mt: 0.5,
                p: 0,
                minWidth: 0,
                textTransform: "none",
                color: "#8B4513",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              Unblock
            </Button>
          )}
        </Box>
      )}

      {/* ─── Composer ─── */}
      <Box
        sx={{
          p: 1.2,
          backgroundColor: "#F0F2F5",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              inputDisabled ? "You can't send messages" : "Type a message..."
            }
            disabled={inputDisabled}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "22px",
                backgroundColor: "#FFFFFF",
                "& fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
              "& textarea": {
                py: 1.1,
                px: 2,
                fontSize: "0.95rem",
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!messageText.trim() || inputDisabled}
            sx={{
              width: 44,
              height: 44,
              mb: 0.1,
              backgroundColor: messageText.trim() ? "#25D366" : "#E0E0E0",
              color: "#fff",
              "&:hover": {
                backgroundColor: messageText.trim() ? "#1ebe5c" : "#E0E0E0",
              },
              "&.Mui-disabled": {
                backgroundColor: "#E0E0E0",
                color: "#fff",
              },
            }}
          >
            {sending ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              <SendIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* ─── Header Menu ─── */}
      <Menu
        anchorEl={headerMenuAnchor}
        open={Boolean(headerMenuAnchor)}
        onClose={() => setHeaderMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {blockedByMe ? (
          <MenuItem onClick={unblockUser} sx={{ fontSize: "0.85rem" }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" sx={{ color: "#555" }} />
            </ListItemIcon>
            <ListItemText>Unblock user</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={blockUser} sx={{ fontSize: "0.85rem" }}>
            <ListItemIcon>
              <BlockIcon fontSize="small" sx={{ color: "#c62828" }} />
            </ListItemIcon>
            <ListItemText>Block user</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* ─── Message Menu ─── */}
      <Menu
        anchorEl={msgMenuAnchor}
        open={Boolean(msgMenuAnchor)}
        onClose={closeMsgMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem
          onClick={() => deleteMessage("me")}
          sx={{ fontSize: "0.85rem" }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete for me</ListItemText>
        </MenuItem>
        {msgMenuTarget?.sender === "me" &&
          !msgMenuTarget?.deletedForEveryone &&
          isWithin15Min(msgMenuTarget?.createdAt) && (
            <MenuItem
              onClick={() => deleteMessage("everyone")}
              sx={{ fontSize: "0.85rem", color: "#c62828" }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: "#c62828" }} />
              </ListItemIcon>
              <ListItemText>Delete for everyone</ListItemText>
            </MenuItem>
          )}
      </Menu>
    </Box>
  );
}