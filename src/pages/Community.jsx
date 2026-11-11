import React, { useEffect, useRef, useState } from "react";
import {
  Box, Typography, Paper, Chip, Stack, Button, IconButton, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import PageLayout from "../components/PageLayout.jsx";
import ToastConfig from "../components/ToastConfig.jsx";
import { useUser } from "../context/userConetext.jsx";
import Discover from "./Discover.jsx";

import CreatePostModal from "./community/CreatePostModal.jsx";
import FeedList from "./community/FeedList.jsx";
import useCommunityFeed from "./community/useCommunityFeed.js";
import { ROOMS } from "./community/rooms.js";

// keep old `import { ROOMS } from '../Community.jsx'` imports working
export { ROOMS };

const GATE_BTN = {
  textTransform: "none", borderRadius: 999, px: 3, fontWeight: 600,
  bgcolor: "#FF9933", color: "#fff", "&:hover": { bgcolor: "#FF9933" },
};

export default function Community() {
  const { currentUser, completion } = useUser();
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const theme = useTheme();
  const showSidebar = useMediaQuery(theme.breakpoints.up("md"));

  const feed = useCommunityFeed({ room: "all", sortByProximity: true });

  const [createOpen, setCreateOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const gateChecked = useRef(false);

  const completionPct = Number.isFinite(completion) ? completion : 0;
  const isProfileComplete = completion === 100;

  // Show the "complete your profile" dialog once per visit
  useEffect(() => {
    if (gateChecked.current) return;
    if (currentUser?._id && typeof completion === "number") {
      gateChecked.current = true;
      setGateOpen(completion !== 100);
    }
  }, [currentUser, completion]);

  const handleQuickPost = () => {
    if (isProfileComplete) setCreateOpen(true);
    else toast.warning("Complete your profile to 100% before creating a post.", toasts);
  };

  const city = currentUser?.city || "your city";

  return (
    <>
      {/* Profile gate */}
      <Dialog
        open={gateOpen}
        onClose={(e, reason) => { if (reason !== "backdropClick") setGateOpen(false); }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3, textAlign: "center", p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontWeight: 700, pt: 3 }}>
          <WarningAmberRoundedIcon sx={{ fontSize: 40, color: "#E8650A" }} />
          Complete your profile
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "0.95rem", color: "text.secondary" }}>
            Your profile is {completionPct}% complete. Finish it to unlock posting in the Community.
          </Typography>
          <Box sx={{ mt: 2.5, px: 3 }}>
            <LinearProgress
              variant="determinate"
              value={completionPct}
              sx={{ height: 8, borderRadius: 5, bgcolor: "#F0E6DC", "& .MuiLinearProgress-bar": { bgcolor: "#FF9933" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1.5 }}>
          <Button variant="contained" onClick={() => setGateOpen(false)} sx={GATE_BTN}>Not now</Button>
          <Button
            variant="contained"
            onClick={() => navigate("/user-profile", { state: { openEditProfile: true } })}
            sx={GATE_BTN}
          >
            Update profile
          </Button>
        </DialogActions>
      </Dialog>

      <PageLayout>
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", width: "100%", maxWidth: 1100 }}>
          {/* Main column */}
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 640 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2 }}>
              {/* <Typography variant="h5" fontWeight={900} color="#B33A00">Saathi</Typography> */}
              <Stack direction="row" spacing={1}>
                <Chip icon={<LocationOnIcon fontSize="small" />} label={currentUser?.city || "Set city"} variant="outlined" sx={{ fontWeight: 600, bgcolor: "#fff" }} />
                {/* <IconButton sx={{ bgcolor: "#fff", border: "1px solid #eee" }}><NotificationsNoneIcon /></IconButton> */}
              </Stack>
            </Box>

            <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
              Namaste{currentUser?.firstName ? `, ${currentUser.firstName}` : ""} 👋<br />
              What does {city} need today?
            </Typography>

            {/* Quick post */}
            <Paper
              onClick={handleQuickPost}
              sx={{ p: 1.5, mb: 3, borderRadius: 3, border: "1px solid #E0E0E0", boxShadow: "none", display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
            >
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#FFF0E5", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8650A" }}>
                <AddIcon fontSize="small" />
              </Box>
              <Typography color="text.secondary" fontSize="0.9rem">Ask, offer or recommend something...</Typography>
            </Paper>

            {/* Rooms */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>Rooms</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5, mb: 4 }}>
              {ROOMS.map((room) => (
                <Paper
                  key={room.id}
                  onClick={() => navigate(`/community/room/${room.id}`)}
                  sx={{ p: 1.5, borderRadius: 3, bgcolor: room.color, boxShadow: "none", cursor: "pointer", "&:hover": { opacity: 0.9 } }}
                >
                  <Typography fontSize="1.2rem" mb={0.5}>{room.icon}</Typography>
                  <Typography fontWeight={700} fontSize="0.95rem" mb={0.5}>{room.label}</Typography>
                  <Typography fontSize="0.75rem" color="text.secondary">Tap to view</Typography>
                </Paper>
              ))}
            </Box>

            {/* Feed */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Community feed</Typography>
            <FeedList feed={feed} emptyText="Start the conversation: ask, offer or recommend something." />
          </Box>

          {/* Discover sidebar (desktop / tablet landscape) */}
          {showSidebar && (
            <Box
              sx={{
                flex: "0 0 340px", width: 340, position: "sticky", top: 20,
                height: "calc(100vh - 120px)", overflowY: "auto", overflowX: "hidden",
                scrollbarWidth: "thin", scrollbarColor: "#E0D4C8 transparent",
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { backgroundColor: "#E0D4C8", borderRadius: 4 },
              }}
            >
              <Discover />
            </Box>
          )}
        </Box>

        <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onPosted={feed.refresh} />
      </PageLayout>
    </>
  );
}
