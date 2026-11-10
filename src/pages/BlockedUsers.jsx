import React, { useEffect, useState } from "react";
import {
  Box, Typography, Avatar, IconButton, CircularProgress, Button,
  List, ListItem, ListItemAvatar, ListItemText, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../Api";
import ToastConfig from "../components/ToastConfig.jsx";
import { useNavigate } from "react-router-dom";

const SAFFRON = "#FF9933";
const API_BASE = Api.replace(/\/+$/, "");
const getToken = () => localStorage.getItem("token");

export default function BlockedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toasts = ToastConfig();

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/blocks`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load blocked users", toasts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const unblock = async (id) => {
    try {
      await axios.delete(`${API_BASE}/blocks/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("Unblocked", toasts);
    } catch (err) {
      toast.error("Failed to unblock", toasts);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={800}>
          Blocked users
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: SAFFRON }} />
        </Box>
      ) : users.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={6}>
          You haven't blocked anyone.
        </Typography>
      ) : (
        <List>
          {users.map((u) => (
            <React.Fragment key={u._id}>
              <ListItem
                secondaryAction={
                  <Button
                    size="small"
                    onClick={() => unblock(u._id)}
                    sx={{ textTransform: "none", color: SAFFRON, fontWeight: 700 }}
                  >
                    Unblock
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar src={u.profileImage || ""} sx={{ bgcolor: SAFFRON }}>
                    {(u.firstName?.[0] || "") + (u.lastName?.[0] || "")}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${u.firstName || ""} ${u.lastName || ""}`.trim()}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}