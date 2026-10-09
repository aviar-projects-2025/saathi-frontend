import React, { useEffect, useRef, useState } from "react";
import {
    Dialog,
    Box,
    Avatar,
    Typography,
    IconButton,
    TextField,
    Paper,
    Stack,
    Divider,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const SAFFRON = "#FF9933";

const ChatModal = ({
    open,
    onClose,
    selectedUser,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [message, setMessage] = useState("");

    /*
     * Temporary messages.
     *
     * Later these will come from your backend / Socket.IO.
     */
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "other",
            text: "Hi! How are you?",
            time: "10:32 AM",
            status: "read",
        },
        {
            id: 2,
            sender: "me",
            text: "I'm good! Thanks 😊",
            time: "10:33 AM",
            status: "read",
        },
        {
            id: 3,
            sender: "other",
            text: "I saw your community post.",
            time: "10:34 AM",
            status: "read",
        },
        {
            id: 4,
            sender: "other",
            text: "I wanted to know more about it.",
            time: "10:34 AM",
            status: "read",
        },
    ]);

    const messagesEndRef = useRef(null);

    const getUserName = () => {
        if (!selectedUser) return "User";

        const fullName = `${selectedUser?.firstName || ""} ${
            selectedUser?.lastName || ""
        }`.trim();

        return fullName || selectedUser?.name || "User";
    };

    const getInitials = () => {
        if (!selectedUser) return "U";

        const first =
            selectedUser?.firstName?.[0] ||
            selectedUser?.name?.[0] ||
            "";

        const last =
            selectedUser?.lastName?.[0] || "";

        return `${first}${last}`.toUpperCase() || "U";
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
            });
        }, 50);
    };

    useEffect(() => {
        if (open) {
            scrollToBottom();
        }
    }, [open, messages]);

    const handleSendMessage = () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        const newMessage = {
            id: Date.now(),
            sender: "me",
            text: trimmedMessage,
            time: new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
            }),
            status: "sent",
        };

        setMessages((prev) => [...prev, newMessage]);
        setMessage("");

        scrollToBottom();
    };

    const handleKeyDown = (event) => {
        /*
         * Enter = send
         * Shift + Enter = new line
         */
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const renderMessageStatus = (status) => {
        if (status === "sent") {
            return (
                <CheckIcon
                    sx={{
                        fontSize: 15,
                        color: "#777",
                    }}
                />
            );
        }

        if (status === "read") {
            return (
                <DoneAllIcon
                    sx={{
                        fontSize: 16,
                        color: "#1976d2",
                    }}
                />
            );
        }

        return null;
    };

    /*
     * Creates date separators.
     *
     * Currently all mock messages are "Today".
     * This can later be replaced by actual message dates.
     */
    const renderDateSeparator = () => {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    my: 2,
                }}
            >
                <Box
                    sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        backgroundColor: "rgba(0,0,0,0.06)",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "0.72rem",
                            color: "#777",
                            fontWeight: 600,
                        }}
                    >
                        Today
                    </Typography>
                </Box>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    width: "100%",
                    height: isMobile ? "100%" : "min(720px, 90vh)",
                    maxHeight: isMobile ? "100%" : "90vh",
                    borderRadius: isMobile ? 0 : 3,
                    overflow: "hidden",
                    m: isMobile ? 0 : 2,
                },
            }}
        >
            {/* ===================================================== */}
            {/* HEADER */}
            {/* ===================================================== */}

            <Box
                sx={{
                    height: 68,
                    px: { xs: 1, sm: 2 },
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderBottom: "1px solid #e5e5e5",
                    flexShrink: 0,
                }}
            >
                {isMobile && (
                    <IconButton
                        onClick={onClose}
                        sx={{
                            mr: 0.5,
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                )}

                <Avatar
                    src={selectedUser?.profileImage || ""}
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: SAFFRON,
                        fontWeight: 700,
                    }}
                >
                    {!selectedUser?.profileImage && getInitials()}
                </Avatar>

                <Box
                    sx={{
                        ml: 1.25,
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    <Typography
                        fontWeight={700}
                        noWrap
                        sx={{
                            fontSize: "0.98rem",
                        }}
                    >
                        {getUserName()}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                        }}
                    >
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: "#35c759",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: "0.72rem",
                                color: "#777",
                            }}
                        >
                            Online
                        </Typography>
                    </Box>
                </Box>

                <IconButton>
                    <MoreVertIcon />
                </IconButton>

                {!isMobile && (
                    <IconButton
                        onClick={onClose}
                        sx={{
                            ml: 0.5,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            {/* ===================================================== */}
            {/* CHAT BODY */}
            {/* ===================================================== */}

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: { xs: 1, sm: 2 },
                    py: 1.5,

                    /*
                     * Subtle chat background.
                     */
                    backgroundColor: "#f5f5f5",

                    /*
                     * Scrollbar
                     */
                    "&::-webkit-scrollbar": {
                        width: 6,
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
                        borderRadius: 10,
                    },
                }}
            >
                {renderDateSeparator()}

                {messages.map((msg) => {
                    const isMine = msg.sender === "me";

                    return (
                        <Box
                            key={msg.id}
                            sx={{
                                display: "flex",
                                justifyContent: isMine
                                    ? "flex-end"
                                    : "flex-start",
                                mb: 1,
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    maxWidth: {
                                        xs: "82%",
                                        sm: "70%",
                                    },

                                    px: 1.5,
                                    py: 1,

                                    borderRadius: isMine
                                        ? "16px 4px 16px 16px"
                                        : "4px 16px 16px 16px",

                                    backgroundColor: isMine
                                        ? "#FFE1BD"
                                        : "#fff",

                                    boxShadow:
                                        "0 1px 1px rgba(0,0,0,0.08)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "0.92rem",
                                        lineHeight: 1.45,
                                        color: "#222",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {msg.text}
                                </Typography>

                                <Stack
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={0.3}
                                    sx={{
                                        mt: 0.3,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "0.65rem",
                                            color: "#777",
                                        }}
                                    >
                                        {msg.time}
                                    </Typography>

                                    {isMine &&
                                        renderMessageStatus(
                                            msg.status
                                        )}
                                </Stack>
                            </Paper>
                        </Box>
                    );
                })}

                <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* ===================================================== */}
            {/* MESSAGE INPUT */}
            {/* ===================================================== */}

            <Box
                sx={{
                    p: { xs: 1, sm: 1.25 },
                    backgroundColor: "#fff",
                    flexShrink: 0,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 1,
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={message}
                        onChange={(event) =>
                            setMessage(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        variant="outlined"
                        size="small"
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                backgroundColor: "#f7f7f7",

                                "& fieldset": {
                                    borderColor: "#e0e0e0",
                                },

                                "&:hover fieldset": {
                                    borderColor: "#ccc",
                                },

                                "&.Mui-focused fieldset": {
                                    borderColor: SAFFRON,
                                },
                            },

                            "& textarea": {
                                fontSize: "0.9rem",
                            },
                        }}
                    />

                    <IconButton
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        sx={{
                            width: 44,
                            height: 44,
                            flexShrink: 0,
                            backgroundColor: message.trim()
                                ? SAFFRON
                                : "#e5e5e5",
                            color: "#fff",

                            "&:hover": {
                                backgroundColor: message.trim()
                                    ? "#e68a00"
                                    : "#e5e5e5",
                            },

                            "&.Mui-disabled": {
                                backgroundColor: "#e5e5e5",
                                color: "#aaa",
                            },
                        }}
                    >
                        <SendIcon
                            sx={{
                                fontSize: 20,
                            }}
                        />
                    </IconButton>
                </Box>

                <Typography
                    sx={{
                        textAlign: "center",
                        mt: 0.5,
                        fontSize: "0.65rem",
                        color: "#999",
                    }}
                >
                    Press Enter to send • Shift + Enter for a new line
                </Typography>
            </Box>
        </Dialog>
    );
};

export default ChatModal;