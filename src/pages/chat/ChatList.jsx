import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Badge,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import axios from "axios";
import socket from "../../socket"; 
import {
  API_BASE,
  authHeaders,
  getUserName,
  getInitials,
  formatListTime,
  SAFFRON,
  normalizeMessage,
} from "./chatUtils";

// ★ NEW: Skeleton component for the list
const ChatListSkeleton = () => (
  <Box sx={{ width: "100%" }}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Box key={i} sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.25, mb: 0.5 }}>
        <Skeleton variant="circular" width={52} height={52} sx={{ flexShrink: 0 }} />
        <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="20%" height={16} />
          </Box>
          <Skeleton variant="text" width="70%" height={16} />
        </Box>
      </Box>
    ))}
  </Box>
);

export default function ChatList({
  search,
  setSearch,
  onSelectUser,
  unreadByChat = {},
}) {
  const [people, setPeople] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. Initial Load & Search
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        // Only trigger full spinner if it's the FIRST load
        if (people.length === 0) setInitialLoading(true);
        
        const res = await axios.get(`${API_BASE}/chat/users`, {
          headers: authHeaders(),
          params: { search, page: 1, limit: 50 },
        });
        if (!cancelled) setPeople(res.data?.data?.users || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    const t = setTimeout(load, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // 2. Silent realtime updates
  useEffect(() => {
    const handleIncoming = (raw) => {
      const myId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))._id : null;
      const m = normalizeMessage(raw, myId);
      
      setPeople((prev) => {
        const senderId = typeof raw.senderId === "object" ? raw.senderId._id : raw.senderId;
        
        const updated = prev.map((p) => {
          if (String(p._id) === String(senderId)) {
            return {
              ...p,
              lastMessage: m.text,
              lastMessageAt: new Date().toISOString(),
            };
          }
          return p;
        });

        // Move the updated user to the top
        return updated.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });
      });
    };

    socket.on("chat:message", handleIncoming);
    return () => socket.off("chat:message", handleIncoming);
  }, []);

  return (
    // height 100% fills the modal
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* Search Bar */}
      <Box sx={{ px: 2.5, py: 2, flexShrink: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#aaa", fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#F5F5F5",
              height: 44,
              "& fieldset": { border: "none" },
              "&.Mui-focused": { backgroundColor: "#fff" },
              "&.Mui-focused fieldset": { border: `1.5px solid ${SAFFRON}` },
            },
          }}
        />
      </Box>

      {/* List Area - flex: 1 ensures it fills the space and fixes the modal shrinking */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {initialLoading && people.length === 0 ? (
          <ChatListSkeleton /> // ★ Use the skeleton here
        ) : people.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 6, px: 3 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 56, color: "#E0E0E0", mb: 1 }} />
            <Typography fontWeight={600} color="#555">No people found</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#999", mt: 0.5 }}>
              Try a different search.
            </Typography>
          </Box>
        ) : (
          people.map((p) => {
            const unreadCount = unreadByChat[p._id] || unreadByChat[p.chatId] || 0;

            return (
              <Box
                key={p._id}
                onClick={() => onSelectUser(p)}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  mb: 0.5,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  borderRadius: "14px",
                  transition: "background-color 0.15s",
                  "&:hover": { backgroundColor: "#FFF8EE" },
                  "&:active": { backgroundColor: "#FFEAD1" },
                }}
              >
                <Badge
                  color="success"
                  badgeContent={unreadCount > 0 ? unreadCount : 0}
                  invisible={unreadCount === 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#25D366",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      minWidth: 20,
                      height: 20,
                      border: "2px solid #fff",
                    },
                  }}
                >
                  <Avatar
                    src={p.profileImage || ""}
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: SAFFRON,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      border: "2px solid #FFEAD1",
                      flexShrink: 0,
                    }}
                  >
                    {!p.profileImage && getInitials(p)}
                  </Avatar>
                </Badge>

                <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                      fontWeight={unreadCount > 0 ? 800 : 700}
                      noWrap
                      sx={{ fontSize: "0.95rem", color: "#222", flex: 1, minWidth: 0 }}
                    >
                      {getUserName(p)}
                    </Typography>
                    {p.lastMessageAt && (
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          color: unreadCount > 0 ? "#25D366" : "#999",
                          fontWeight: unreadCount > 0 ? 700 : 400,
                          whiteSpace: "nowrap",
                          ml: 1,
                        }}
                      >
                        {formatListTime(p.lastMessageAt)}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: "0.85rem",
                      color: unreadCount > 0 ? "#111" : p.lastMessage ? "#666" : "#aaa",
                      fontWeight: unreadCount > 0 ? 600 : 400,
                      mt: 0.4,
                    }}
                  >
                    {p.lastMessage || "Start a conversation"}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}