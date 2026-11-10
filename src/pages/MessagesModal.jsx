
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Dialog,
    Box,
    Typography,
    IconButton,
    Avatar,
    TextField,
    InputAdornment,
    Divider,
    Badge,
    List,
    ListItemButton,
    Button,
    CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";

import axios from "axios";
import Api from "../Api";
import socket, { connectSocket } from "../socket";

const SAFFRON = "#FF9933";
const API_BASE = Api.replace(/\/+$/, "");

/* ---------------- Helpers ---------------- */

const getToken = () => localStorage.getItem("token");

const getCurrentUserId = () => {
    try {
        const token = getToken();
        if (!token) return null;

        const payload = token.split(".")[1];
        if (!payload) return null;

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const decoded = JSON.parse(
            atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
        );

        return String(decoded.id || decoded._id || "");
    } catch {
        return null;
    }
};

const getId = (value) =>
    String(value?._id || value?.id || value || "");

const getMessageId = (message) =>
    getId(message?._id || message?.id);

const getMessageChatId = (message) =>
    getId(message?.chatId);

const formatTime = (date) => {
    if (!date) return "";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    const now = new Date();
    const sameDay =
        parsed.getDate() === now.getDate() &&
        parsed.getMonth() === now.getMonth() &&
        parsed.getFullYear() === now.getFullYear();

    if (sameDay) {
        return parsed.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
        });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
        parsed.getDate() === yesterday.getDate() &&
        parsed.getMonth() === yesterday.getMonth() &&
        parsed.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
};

const normalizeMessage = (message, currentUserId) => {
    const senderId = getId(message?.senderId);

    return {
        id: getMessageId(message),
        text: message?.text || "",
        sender:
            currentUserId && senderId === String(currentUserId)
                ? "me"
                : "other",
        time: message?.createdAt
            ? new Date(message.createdAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
              })
            : "",
        createdAt: message?.createdAt || null,
        status: String(message?.status || "SENT").toLowerCase(),
    };
};

const mergeMessages = (existing, incoming) => {
    const byId = new Map();

    [...existing, ...incoming].forEach((message) => {
        if (!message.id) return;

        const previous = byId.get(message.id);

        byId.set(
            message.id,
            previous ? { ...previous, ...message } : message
        );
    });

    return [...byId.values()].sort((a, b) => {
        const timeA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

        const timeB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

        return timeA - timeB;
    });
};

const normalizeConversation = (chat, currentUserId) => {
    const participants = chat?.participants || [];

    const otherUser = participants.find(
        (participant) =>
            getId(participant) !== String(currentUserId)
    );

    if (!otherUser) return null;

    const lastMessage =
        chat?.lastMessage &&
        typeof chat.lastMessage === "object"
            ? chat.lastMessage
            : null;

    return {
        chatId: getId(chat._id),
        user: otherUser,
        lastMessage: lastMessage?.text || "",
        time: formatTime(
            lastMessage?.createdAt || chat?.lastMessageAt
        ),
        lastMessageAt:
            lastMessage?.createdAt ||
            chat?.lastMessageAt ||
            chat?.updatedAt ||
            null,
        unread: false,
        unreadCount: 0,
        online: false,
    };
};

/* ---------------- Component ---------------- */

const MessagesModal = ({
    open,
    onClose,
    conversations: initialConversations = [],
    onOpenChat,
}) => {
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeChatId, setActiveChatId] = useState(null);

    const [serverConversations, setServerConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");

    const [loadingConversations, setLoadingConversations] =
        useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);
    const activeChatIdRef = useRef(null);
    const selectedUserRef = useRef(null);

    const currentUserId = getCurrentUserId();

    const getUserName = (user) => {
        const name = `${user?.firstName || ""} ${
            user?.lastName || ""
        }`.trim();

        return name || user?.name || "User";
    };

    const getInitials = (user) => {
        const first =
            user?.firstName?.[0] ||
            user?.name?.[0] ||
            "";

        const last = user?.lastName?.[0] || "";

        return `${first}${last}`.toUpperCase() || "U";
    };

    const getUserId = (user) => getId(user);

    const requestConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    /* ---------------- Fetch conversations ---------------- */

    const loadConversations = useCallback(async () => {
        if (!getToken()) {
            setError("Please log in to view your messages.");
            return;
        }

        try {
            setLoadingConversations(true);

            const response = await axios.get(
                `${API_BASE}/chat`,
                requestConfig()
            );

            const chats = response.data?.data || [];
            const userId = getCurrentUserId();

            const normalized = chats
                .map((chat) => normalizeConversation(chat, userId))
                .filter(Boolean);

            setServerConversations(normalized);
            setError("");
        } catch (err) {
            console.error(
                "Failed to load conversations:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load conversations."
            );
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        connectSocket();
        loadConversations();
    }, [open, loadConversations]);

    /* ---------------- Conversation list ---------------- */

    const conversationsToDisplay = useMemo(() => {
        // Use the backend as the source of truth.
        // Never show dummy conversations in production.
        return serverConversations;
    }, [serverConversations]);

    const filteredConversations = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) return conversationsToDisplay;

        return conversationsToDisplay.filter((conversation) => {
            const name = getUserName(conversation.user).toLowerCase();

            return (
                name.includes(value) ||
                conversation.lastMessage.toLowerCase().includes(value)
            );
        });
    }, [conversationsToDisplay, search]);

    /* ---------------- Select / create conversation ---------------- */

    const handleSelectUser = async (user) => {
        const userId = getUserId(user);

        if (!userId || !getToken()) {
            setError("Unable to open this conversation. Please log in again.");
            return;
        }

        setSelectedUser(user);
        selectedUserRef.current = user;
        setActiveChatId(null);
        activeChatIdRef.current = null;
        setMessages([]);
        setMessageText("");
        setError("");

        // Optional parent notification. The actual chat stays in this modal.
        // Do not open another modal here.
        if (onOpenChat) {
            onOpenChat(user);
        }

        try {
            const response = await axios.get(
                `${API_BASE}/chat/with/${userId}`,
                requestConfig()
            );

            const chat = response.data?.data;

            if (!chat?._id) {
                throw new Error("The server did not return a chat ID.");
            }

            const newChatId = String(chat._id);

            activeChatIdRef.current = newChatId;
            setActiveChatId(newChatId);

            await loadConversations();
        } catch (err) {
            console.error(
                "Failed to open conversation:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to open this conversation."
            );
        }
    };

    /* ---------------- Load message history ---------------- */

    useEffect(() => {
        if (!open || !activeChatId) return;

        let cancelled = false;
        const chatId = String(activeChatId);

        const loadMessages = async () => {
            try {
                setLoadingMessages(true);

                const response = await axios.get(
                    `${API_BASE}/chat/${chatId}/messages`,
                    {
                        ...requestConfig(),
                        params: { page: 1, limit: 100 },
                    }
                );

                if (cancelled) return;

                const rawMessages =
                    response.data?.data?.messages || [];

                const userId = getCurrentUserId();

                setMessages((previous) =>
                    mergeMessages(
                        previous,
                        rawMessages.map((message) =>
                            normalizeMessage(message, userId)
                        )
                    )
                );

                setError("");

                // Mark received messages as read.
                try {
                    await axios.patch(
                        `${API_BASE}/chat/${chatId}/read`,
                        {},
                        requestConfig()
                    );

                    if (!cancelled) {
                        setServerConversations((previous) =>
                            previous.map((conversation) =>
                                conversation.chatId === chatId
                                    ? {
                                          ...conversation,
                                          unread: false,
                                          unreadCount: 0,
                                      }
                                    : conversation
                            )
                        );
                    }
                } catch (readError) {
                    // Reading history should still work if marking
                    // read fails.
                    console.error(
                        "Failed to mark messages as read:",
                        readError.response?.data || readError
                    );
                }
            } catch (err) {
                if (cancelled) return;

                console.error(
                    "Failed to load messages:",
                    err.response?.data || err
                );

                setError(
                    err.response?.data?.message ||
                        "Unable to load message history."
                );
            } finally {
                if (!cancelled) setLoadingMessages(false);
            }
        };

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [open, activeChatId]);

    /* ---------------- Real-time incoming messages ---------------- */

    useEffect(() => {
        if (!open) return;

        const handleIncomingMessage = (rawMessage) => {
            const chatId = getMessageChatId(rawMessage);
            const normalized = normalizeMessage(
                rawMessage,
                getCurrentUserId()
            );

            if (!normalized.id || !chatId) return;

            // Update the visible conversation only if it is open.
            if (activeChatIdRef.current === chatId) {
                setMessages((previous) =>
                    mergeMessages(previous, [normalized])
                );

                // Mark messages received in the active conversation as read.
                if (normalized.sender === "other") {
                    axios
                        .patch(
                            `${API_BASE}/chat/${chatId}/read`,
                            {},
                            requestConfig()
                        )
                        .catch((err) =>
                            console.error(
                                "Failed to mark incoming message as read:",
                                err.response?.data || err
                            )
                        );
                }
            }

            // Refresh last message and conversation ordering.
            loadConversations();
        };

        socket.on("chat:message", handleIncomingMessage);

        return () => {
            socket.off("chat:message", handleIncomingMessage);
        };
    }, [open, loadConversations]);

    /* ---------------- Send message ---------------- */

    const handleSendMessage = async () => {
        const text = messageText.trim();

        if (!text || !activeChatId || sending) return;

        const token = getToken();

        if (!token) {
            setError("Your session has expired. Please log in again.");
            return;
        }

        setSending(true);
        setError("");

        try {
            const response = await axios.post(
                `${API_BASE}/chat/${activeChatId}/messages`,
                { text },
                requestConfig()
            );

            const savedMessage = response.data?.data;

            if (!savedMessage?._id && !savedMessage?.id) {
                throw new Error("The server did not return the saved message.");
            }

            const normalized = normalizeMessage(
                savedMessage,
                getCurrentUserId()
            );

            if (
                activeChatIdRef.current === String(activeChatId)
            ) {
                setMessages((previous) =>
                    mergeMessages(previous, [normalized])
                );
            }

            setMessageText("");
            await loadConversations();
        } catch (err) {
            console.error(
                "Failed to send message:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Failed to send message. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    /* ---------------- Scroll to latest message ---------------- */

    useEffect(() => {
        if (open && selectedUser) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [open, selectedUser, messages]);

    /* ---------------- Back / close ---------------- */

    const handleBackToList = () => {
        setSelectedUser(null);
        selectedUserRef.current = null;
        setActiveChatId(null);
        activeChatIdRef.current = null;
        setMessages([]);
        setMessageText("");
        setError("");
    };

    const handleClose = () => {
        handleBackToList();
        setSearch("");
        onClose?.();
    };

    /* ---------------- UI ---------------- */

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    width: "100%",
                    maxWidth: 460,
                    height: {
                        xs: "100%",
                        sm: "650px",
                    },
                    maxHeight: {
                        xs: "100%",
                        sm: "90vh",
                    },
                    borderRadius: {
                        xs: 0,
                        sm: 3,
                    },
                    overflow: "hidden",
                    m: {
                        xs: 0,
                        sm: 2,
                    },
                },
            }}
        >
            {/* HEADER */}

            <Box
                sx={{
                    minHeight: 68,
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderBottom: "1px solid #eeeeee",
                    flexShrink: 0,
                }}
            >
                {selectedUser ? (
                    <>
                        <IconButton
                            onClick={handleBackToList}
                            aria-label="Back to conversations"
                        >
                            <ArrowBackIcon />
                        </IconButton>

                        <Avatar
                            src={selectedUser.profileImage || ""}
                            sx={{
                                width: 40,
                                height: 40,
                                bgcolor: SAFFRON,
                                fontWeight: 700,
                            }}
                        >
                            {!selectedUser.profileImage &&
                                getInitials(selectedUser)}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight={800} noWrap>
                                {getUserName(selectedUser)}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{ color: "#888" }}
                            >
                                Messages
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <ChatBubbleOutlineIcon sx={{ color: SAFFRON }} />

                        <Typography
                            sx={{
                                fontSize: "1.1rem",
                                fontWeight: 800,
                                flex: 1,
                            }}
                        >
                            Messages
                        </Typography>
                    </>
                )}

                <IconButton onClick={handleClose} aria-label="Close">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* CONVERSATION LIST */}

            {!selectedUser ? (
                <>
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <TextField
                            fullWidth
                            size="small"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search messages..."
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    backgroundColor: "#f7f7f7",
                                    "&.Mui-focused fieldset": {
                                        borderColor: SAFFRON,
                                    },
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: "#888" }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: "auto",
                        }}
                    >
                        {loadingConversations &&
                        conversationsToDisplay.length === 0 ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                                <CircularProgress
                                    size={28}
                                    sx={{ color: SAFFRON }}
                                />
                            </Box>
                        ) : error && conversationsToDisplay.length === 0 ? (
                            <Typography
                                sx={{
                                    textAlign: "center",
                                    color: "#c62828",
                                    p: 3,
                                }}
                            >
                                {error}
                            </Typography>
                        ) : filteredConversations.length === 0 ? (
                            <Box
                                sx={{
                                    minHeight: 250,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    px: 3,
                                    textAlign: "center",
                                }}
                            >
                                <ChatBubbleOutlineIcon
                                    sx={{
                                        fontSize: 52,
                                        color: "#ddd",
                                        mb: 1,
                                    }}
                                />

                                <Typography fontWeight={700} color="#555">
                                    No conversations yet
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#999",
                                        fontSize: "0.85rem",
                                        mt: 0.5,
                                    }}
                                >
                                    Start a chat from a community member's profile.
                                </Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {filteredConversations.map((conversation) => {
                                    const user = conversation.user;
                                    const userId = getUserId(user);

                                    return (
                                        <React.Fragment key={conversation.chatId}>
                                            <ListItemButton
                                                onClick={() =>
                                                    handleSelectUser(user)
                                                }
                                                sx={{
                                                    px: 2,
                                                    py: 1.3,
                                                    "&:hover": {
                                                        backgroundColor: "#fff7ef",
                                                    },
                                                }}
                                            >
                                                <Avatar
                                                    src={user?.profileImage || ""}
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        bgcolor: SAFFRON,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {!user?.profileImage &&
                                                        getInitials(user)}
                                                </Avatar>

                                                <Box
                                                    sx={{
                                                        ml: 1.5,
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Typography fontWeight={600} noWrap>
                                                            {getUserName(user)}
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                fontSize: "0.68rem",
                                                                color: "#999",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {conversation.time}
                                                        </Typography>
                                                    </Box>

                                                    <Typography
                                                        noWrap
                                                        sx={{
                                                            mt: 0.4,
                                                            fontSize: "0.82rem",
                                                            color: "#888",
                                                        }}
                                                    >
                                                        {conversation.lastMessage ||
                                                            "Start a conversation"}
                                                    </Typography>
                                                </Box>
                                            </ListItemButton>

                                            <Divider sx={{ ml: 9 }} />
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </>
            ) : (
                /* CHAT SCREEN */

                <>
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            p: 2,
                            backgroundColor: "#faf8f5",
                        }}
                    >
                        {loadingMessages && messages.length === 0 && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 3,
                                }}
                            >
                                <CircularProgress
                                    size={26}
                                    sx={{ color: SAFFRON }}
                                />
                            </Box>
                        )}

                        {!loadingMessages &&
                            messages.length === 0 &&
                            activeChatId &&
                            !error && (
                                <Box
                                    sx={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        textAlign: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Avatar
                                        src={selectedUser.profileImage || ""}
                                        sx={{
                                            width: 68,
                                            height: 68,
                                            bgcolor: SAFFRON,
                                            fontSize: 24,
                                        }}
                                    >
                                        {!selectedUser.profileImage &&
                                            getInitials(selectedUser)}
                                    </Avatar>

                                    <Typography fontWeight={700}>
                                        {getUserName(selectedUser)}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Start a conversation
                                    </Typography>
                                </Box>
                            )}

                        {messages.map((message) => {
                            const isMine = message.sender === "me";

                            return (
                                <Box
                                    key={message.id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: isMine
                                            ? "flex-end"
                                            : "flex-start",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: "82%",
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: isMine
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                            bgcolor: isMine
                                                ? SAFFRON
                                                : "#fff",
                                            color: isMine ? "#fff" : "#333",
                                            boxShadow:
                                                "0 1px 2px rgba(0,0,0,0.08)",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "0.9rem",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {message.text}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: "0.65rem",
                                                textAlign: "right",
                                                mt: 0.5,
                                                opacity: 0.75,
                                            }}
                                        >
                                            {message.time}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}

                        {error && (
                            <Typography
                                role="alert"
                                sx={{
                                    color: "#c62828",
                                    fontSize: "0.82rem",
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </Typography>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    <Divider />

                    {/* MESSAGE INPUT */}

                    <Box
                        component="form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSendMessage();
                        }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 1.5,
                            backgroundColor: "#fff",
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            multiline
                            maxRows={4}
                            value={messageText}
                            onChange={(event) =>
                                setMessageText(event.target.value)
                            }
                            placeholder="Type a message..."
                            disabled={!activeChatId || sending}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 3,
                                    backgroundColor: "#f7f7f7",
                                    "&.Mui-focused fieldset": {
                                        borderColor: SAFFRON,
                                    },
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                !messageText.trim() ||
                                !activeChatId ||
                                sending
                            }
                            sx={{
                                minWidth: 44,
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                bgcolor: SAFFRON,
                                "&:hover": {
                                    bgcolor: "#e68a00",
                                },
                            }}
                        >
                            {sending ? (
                                <CircularProgress
                                    size={19}
                                    sx={{ color: "#fff" }}
                                />
                            ) : (
                                <SendIcon fontSize="small" />
                            )}
                        </Button>
                    </Box>
                </>
            )}
        </Dialog>
    );
};

export default MessagesModal;