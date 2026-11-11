import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";

import PageLayout from "../../components/PageLayout.jsx";
import ToastConfig from "../../components/ToastConfig.jsx";
import { useUser } from "../../context/userConetext.jsx";
import CreatePostModal from "./CreatePostModal.jsx";
import FeedList from "./FeedList.jsx";
import useCommunityFeed from "./useCommunityFeed.js";
import { getRoom, SUB_CATEGORIES } from "./rooms.js";

export default function RoomDetails() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser, completion } = useUser();
  const toasts = ToastConfig();

  const roomInfo = getRoom(roomId);
  const subCategories = SUB_CATEGORIES[roomId];

  const [activeSub, setActiveSub] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  // reset the filter when moving between rooms
  useEffect(() => { setActiveSub("All"); }, [roomId]);

  // Centre the floating button on the content column (not the whole window,
  // which is off-centre because of the sidebar).
  const contentRef = useRef(null);
  const [fabLeft, setFabLeft] = useState(null);
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setFabLeft(r.left + r.width / 2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const feed = useCommunityFeed({ room: roomId, subCategory: activeSub });

  const handleCreate = () => {
    if (completion === 100) setCreateOpen(true);
    else toast.warning("Complete your profile to 100% before creating a post.", toasts);
  };

  const city = currentUser?.city || "your city";
  const subtitle =
    roomId === "housing" ? `Home services, rentals and shared stays in ${city}`
    : roomId === "immigration" ? "Lived experience from members across all cities"
    : `Explore everything related to ${roomInfo.label}`;

  return (
    <PageLayout>
      <Box ref={contentRef} sx={{ width: "100%", pb: 12 }}>
      {/* Room header */}
      <Box sx={{ bgcolor: roomInfo.color, p: 2, borderRadius: 3, mb: 2, position: "relative" }}>
        <Button
          onClick={() => navigate("/community")}
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: "none", color: "#333", mb: 2, p: 0, "&:hover": { bgcolor: "transparent" } }}
        >
          Back
        </Button>
        {/* <Button
          variant="outlined"
          sx={{ position: "absolute", top: 16, right: 16, borderRadius: 99, textTransform: "none", borderColor: "#333", color: "#333" }}
        >
          Follow room
        </Button> */}
        <Typography variant="h4" fontWeight={800} color="#1A1A1A" mb={1}>{roomInfo.label}</Typography>
        <Typography fontSize="0.9rem" color="text.secondary">{subtitle}</Typography>
      </Box>

      {/* Sub-category chips */}
      {subCategories && (
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 2, mb: 2, "&::-webkit-scrollbar": { display: "none" } }}>
          {subCategories.map((sub) => (
            <Chip
              key={sub}
              label={sub}
              onClick={() => setActiveSub(sub)}
              sx={{
                bgcolor: activeSub === sub ? "#333" : "#fff",
                color: activeSub === sub ? "#fff" : "#333",
                fontWeight: 600, border: "1px solid #E0E0E0",
                "&:hover": { bgcolor: activeSub === sub ? "#333" : "#f5f5f5" },
              }}
            />
          ))}
        </Stack>
      )}

      <FeedList feed={feed} emptyText="No posts in this room yet. Be the first!" />
      </Box>

      {/* Floating action button */}
      <Button
        variant="contained"
        onClick={handleCreate}
        startIcon={<AddIcon />}
        sx={{
          position: "fixed", bottom: { xs: 80, md: 32 }, left: fabLeft ?? "50%", transform: "translateX(-50%)", zIndex: 1100,
          bgcolor: "#B33A00", color: "#fff", borderRadius: 99, px: 3, py: 1.5, fontWeight: 700,
          textTransform: "none", boxShadow: "0 4px 12px rgba(179,58,0,0.3)",
          "&:hover": { bgcolor: "#8f2e00" },
        }}
      >
        Post in {roomInfo.label}
      </Button>

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onPosted={feed.refresh}
        defaultRoom={roomId}
        defaultSubCategory={activeSub !== "All" ? activeSub : ""}
      />
    </PageLayout>
  );
}