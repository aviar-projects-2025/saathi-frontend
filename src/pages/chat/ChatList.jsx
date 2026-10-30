import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import axios from "axios";
import {
  API_BASE,
  authHeaders,
  getUserName,
  getInitials,
  formatListTime,
  SAFFRON,
} from "./chatUtils";

export default function ChatList({ search, setSearch, onSelectUser }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/chat/users`, {
          headers: authHeaders(),
          params: { search, page: 1, limit: 50 },
        });
        if (!cancelled) setPeople(res.data?.data?.users || []);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const t = setTimeout(load, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Search */}
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

      {/* List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {loading && people.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} sx={{ color: SAFFRON }} />
          </Box>
        ) : people.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 6, px: 3 }}>
            <ChatBubbleOutlineIcon
              sx={{ fontSize: 56, color: "#E0E0E0", mb: 1 }}
            />
            <Typography fontWeight={600} color="#555">
              No people found
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#999", mt: 0.5 }}>
              Try a different search.
            </Typography>
          </Box>
        ) : (
          people.map((p) => (
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

              <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    fontWeight={700}
                    noWrap
                    sx={{ fontSize: "0.95rem", color: "#222" }}
                  >
                    {getUserName(p)}
                  </Typography>
                  {p.lastMessageAt && (
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: "#999",
                        whiteSpace: "nowrap",
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
                    color: p.lastMessage ? "#666" : "#aaa",
                    mt: 0.4,
                  }}
                >
                  {p.lastMessage || "Start a conversation"}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}