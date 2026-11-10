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
  textTransform: "none", borderRadius: 999, px: { xs: 2.5, sm: 3 }, fontWeight: 600,
  fontSize: { xs: "0.85rem", sm: "0.9rem" },
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
        PaperProps={{
          sx: {
            borderRadius: 3, textAlign: "center", p: { xs: 0.5, sm: 1 },
            m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "100%" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontWeight: 700,
            pt: { xs: 2.5, sm: 3 }, fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: { xs: 34, sm: 40 }, color: "#E8650A" }} />
          Complete your profile
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ fontSize: { xs: "0.86rem", sm: "0.95rem" }, color: "text.secondary" }}>
            Your profile is {completionPct}% complete. Finish it to unlock posting in the Community.
          </Typography>
          <Box sx={{ mt: { xs: 2, sm: 2.5 }, px: { xs: 1, sm: 3 } }}>
            <LinearProgress
              variant="determinate"
              value={completionPct}
              sx={{ height: { xs: 7, sm: 8 }, borderRadius: 5, bgcolor: "#F0E6DC", "& .MuiLinearProgress-bar": { bgcolor: "#FF9933" } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", flexWrap: "wrap", pb: { xs: 2.5, sm: 3 }, px: 2, gap: { xs: 1, sm: 1.5 } }}>
          <Button variant="contained" onClick={() => setGateOpen(false)} sx={GATE_BTN}>Not now</Button>
          <Button
            variant="contained"
            onClick={() => navigate("/user-profile", { state: { openEditProfile: true } })}
            sx={{ ...GATE_BTN, ml: "0 !important" }}
          >
            Update profile
          </Button>
        </DialogActions>
      </Dialog>

      <PageLayout>
        <Box
          sx={{
            display: "flex", gap: { md: 2.5, lg: 3 }, alignItems: "flex-start",
            width: "100%", maxWidth: 1100, minWidth: 0, boxSizing: "border-box",
          }}
        >
          {/* Main column */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%", maxWidth: { xs: "100%", md: 640 } }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: { xs: 1.5, sm: 2 }, gap: 1 }}>
              <Typography fontWeight={900} color="#B33A00" sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }}>
                Saathi
              </Typography>
              <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
                <Chip
                  icon={<LocationOnIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={currentUser?.city || "Set city"}
                  variant="outlined"
                  sx={{
                    fontWeight: 600, bgcolor: "#fff", maxWidth: { xs: 150, sm: 220 },
                    height: { xs: 28, sm: 32 }, fontSize: { xs: "0.76rem", sm: "0.8125rem" },
                    "& .MuiChip-label": { px: { xs: 0.9, sm: 1.5 } },
                  }}
                />
                {/* <IconButton sx={{ bgcolor: "#fff", border: "1px solid #eee" }}><NotificationsNoneIcon /></IconButton> */}
              </Stack>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" },
                fontWeight: 800, lineHeight: 1.25, mb: { xs: 1.5, sm: 2 }, wordBreak: "break-word",
              }}
            >
              Namaste{currentUser?.firstName ? `, ${currentUser.firstName}` : ""} 👋<br />
              What does {city} need today?
            </Typography>

            {/* Quick post */}
            <Paper
              onClick={handleQuickPost}
              sx={{
                p: { xs: 1.1, sm: 1.5 }, mb: { xs: 2.5, sm: 3 }, borderRadius: { xs: 2.5, sm: 3 },
                border: "1px solid #E0E0E0", boxShadow: "none",
                display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1 }, cursor: "pointer", minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 26, sm: 28 }, height: { xs: 26, sm: 28 }, flexShrink: 0,
                  borderRadius: "50%", bgcolor: "#FFF0E5",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#E8650A",
                }}
              >
                <AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Typography color="text.secondary" noWrap sx={{ fontSize: { xs: "0.84rem", sm: "0.9rem" }, minWidth: 0 }}>
                Ask, offer or recommend something...
              </Typography>
            </Paper>

            {/* Rooms */}
            <Typography fontWeight={700} sx={{ mb: { xs: 1, sm: 1.5 }, fontSize: { xs: "1.05rem", sm: "1.2rem", md: "1.25rem" } }}>
              Rooms
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
                gap: { xs: 1, sm: 1.5 },
                mb: { xs: 3, sm: 4 },
              }}
            >
              {ROOMS.map((room) => (
                <Paper
                  key={room.id}
                  onClick={() => navigate(`/community/room/${room.id}`)}
                  sx={{
                    p: { xs: 1.25, sm: 1.5 }, borderRadius: { xs: 2.5, sm: 3 }, bgcolor: room.color,
                    boxShadow: "none", cursor: "pointer", minWidth: 0, "&:hover": { opacity: 0.9 },
                  }}
                >
                  <Typography mb={0.5} sx={{ fontSize: { xs: "1.1rem", sm: "1.2rem" } }}>{room.icon}</Typography>
                  <Typography fontWeight={700} mb={0.5} sx={{ fontSize: { xs: "0.88rem", sm: "0.95rem" }, wordBreak: "break-word" }}>
                    {room.label}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>Tap to view</Typography>
                </Paper>
              ))}
            </Box>

            {/* Feed */}
            <Typography fontWeight={700} sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: "1.05rem", sm: "1.2rem", md: "1.25rem" } }}>
              Community feed
            </Typography>
            <FeedList feed={feed} emptyText="Start the conversation: ask, offer or recommend something." />
          </Box>

          {/* Discover sidebar (desktop / tablet landscape) */}
          {showSidebar && (
            <Box
              sx={{
                flex: { md: "0 0 300px", lg: "0 0 340px" }, width: { md: 300, lg: 340 },
                position: "sticky", top: 20,
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