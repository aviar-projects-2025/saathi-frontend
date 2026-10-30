import React, { useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { SAFFRON } from "./chat/chatUtils";
import ChatList from "./chat/ChatList";
import ChatConversation from "./chat/ChatConversation";
import { useChatSocket } from "../hooks/useChatSocket";

export default function ChatModal({
  open,
  onClose,
  selectedUser: initialUser,
  onResetUnread,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // Global listener — reorder list when a new message arrives while modal is open
  const { lastMessage } = useChatSocket();
  useEffect(() => {
    if (open && lastMessage) {
      setListRefreshKey((k) => k + 1);
    }
  }, [lastMessage, open]);

  useEffect(() => {
    if (open && initialUser?._id) setSelectedUser(initialUser);
  }, [open, initialUser]);

  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setSearch("");
    }
  }, [open]);

  // When the modal opens, clear the outer unread badge on the 💬 icon
  useEffect(() => {
    if (open) onResetUnread?.();
  }, [open, onResetUnread]);

  const handleClose = () => {
    setSelectedUser(null);
    setSearch("");
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          height: isMobile ? "100%" : "min(720px, 88vh)",
          maxHeight: isMobile ? "100%" : "88vh",
          borderRadius: isMobile ? 0 : "20px",
          overflow: "hidden",
          m: isMobile ? 0 : 2,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",
          "& .MuiDialogContent-root": { p: 0 },
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 20, 30, 0.55)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      {!selectedUser && (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            background: "linear-gradient(135deg, #FFF8EE 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #F1E4D7",
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 46,
              height: 46,
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${SAFFRON} 0%, #E68A00 100%)`,
              boxShadow: "0 4px 12px rgba(255,153,51,0.35)",
            }}
          >
            <ChatBubbleOutlineIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#1F2430",
                lineHeight: 1.2,
              }}
            >
              Messages
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#888", mt: 0.2 }}>
              Chat with your community
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            sx={{
              width: 36,
              height: 36,
              color: "#888",
              backgroundColor: "#F5F5F5",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#FFEAD1",
                color: "#E68A00",
                transform: "rotate(90deg)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFFFF",
        }}
      >
        {selectedUser ? (
          <ChatConversation
            user={selectedUser}
            onBack={() => setSelectedUser(null)}
            onClose={handleClose}
          />
        ) : (
          <ChatList
            key={listRefreshKey}
            search={search}
            setSearch={setSearch}
            onSelectUser={setSelectedUser}
          />
        )}
      </Box>
    </Dialog>
  );
}