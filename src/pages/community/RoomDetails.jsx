import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Stack, Chip, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";
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

  useEffect(() => {
    setActiveSub("All");
  }, [roomId]);

  const feed = useCommunityFeed({ room: roomId, subCategory: activeSub });

  const handleCreate = () => {
    if (completion === 100) setCreateOpen(true);
    else toast.warning("Complete your profile to 100% before creating a post.", toasts);
  };

  const city = currentUser?.city || "your city";
  const subtitle =
    roomId === "housing"
      ? `Home services, rentals and shared stays in ${city}`
      : roomId === "immigration"
        ? "Lived experience from members across all cities"
        : `Explore everything related to ${roomInfo.label}`;

  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          pb: { xs: 18, sm: 16, md: 14 },
        }}
      >
        {/* Room Header */}
        <Box
          sx={{
            bgcolor: roomInfo.color,
            p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
            borderRadius: { xs: 2, sm: 2.5, md: 3 },
            mb: { xs: 1.5, sm: 2 },
            position: "relative",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <Button
            onClick={() => navigate("/community")}
            startIcon={
              <ArrowBackIcon
                sx={{ fontSize: { xs: 18, sm: 20, md: 22 }, mr: { xs: 0.2 } }}
              />
            }
            sx={{
              textTransform: "none",
              color: "#333",
              mb: { xs: 1.25, sm: 1.5, md: 2 },
              p: 0,
              minWidth: 0,
              fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.95rem" },
              whiteSpace: "nowrap",
              "& .MuiButton-startIcon": {
                mr: { xs: 0.5, sm: 1 },
                ml: 0,
              },
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            Back
          </Button>

          <Typography
            fontWeight={800}
            color="#1A1A1A"
            mb={{ xs: 0.5, sm: 0.75, md: 1 }}
            sx={{
              fontSize: {
                xs: "1.25rem",
                sm: "1.5rem",
                md: "1.9rem",
                lg: "2.125rem",
                xl: "2.25rem",
              },
              lineHeight: { xs: 1.25, sm: 1.2 },
              width: "100%",
              minWidth: 0,
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "normal",
            }}
          >
            {roomInfo.label}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: {
                xs: "0.78rem",
                sm: "0.84rem",
                md: "0.9rem",
                lg: "0.95rem",
              },
              lineHeight: { xs: 1.45, sm: 1.5, md: 1.6 },
              width: "100%",
              minWidth: 0,
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "normal",
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* ★ TC-fix: "Not legal advice" banner — Immigration room only */}
        {roomId === "immigration" && (
          <Alert
            severity="warning"
            icon={<GavelIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />}
            sx={{
              mb: { xs: 1.5, sm: 2 },
              borderRadius: { xs: 1.5, sm: 2 },
              bgcolor: "#FFF7E6",
              color: "#7A4A00",
              border: "1px solid #F5C896",
              alignItems: "flex-start",
              "& .MuiAlert-icon": { color: "#B26A00", mt: "2px" },
              "& .MuiAlert-message": {
                fontSize: { xs: "0.78rem", sm: "0.84rem", md: "0.88rem" },
                lineHeight: 1.5,
                width: "100%",
              },
            }}
          >
            <Typography
              component="span"
              sx={{ fontWeight: 800, display: "block", mb: 0.25, color: "#7A4A00" }}
            >
              Not legal advice
            </Typography>
            <Typography component="span" sx={{ color: "#7A4A00" }}>
              This is a community space for sharing personal experience. Posts and
              replies are from members, not attorneys, and are not legal advice. For
              your situation, please consult a licensed immigration attorney or an
              accredited representative.
            </Typography>
          </Alert>
        )}

        {/* Sub-category Chips */}
        {subCategories && (
          <Stack
            direction="row"
            spacing={{ xs: 0.75, sm: 1 }}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              pb: { xs: 1.5, sm: 2 },
              mb: { xs: 1, sm: 2 },
              "& > *": { flexShrink: 0 },
            }}
          >
            {subCategories.map((sub) => (
              <Chip
                key={sub}
                label={sub}
                onClick={() => setActiveSub(sub)}
                sx={{
                  bgcolor: activeSub === sub ? "#333" : "#fff",
                  color: activeSub === sub ? "#fff" : "#333",
                  fontWeight: 600,
                  border: "1px solid #E0E0E0",
                  height: { xs: 30, sm: 32 },
                  fontSize: { xs: "0.78rem", sm: "0.8125rem" },
                  "& .MuiChip-label": { px: { xs: 1.1, sm: 1.5 } },
                  "&:hover": { bgcolor: activeSub === sub ? "#333" : "#f5f5f5" },
                }}
              />
            ))}
          </Stack>
        )}

        <Box
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: { xs: "100%", md: 640 },
            minWidth: 0,
            boxSizing: "border-box",
            pb: { xs: 14, sm: 12 },
          }}
        >
          <FeedList
            feed={feed}
            emptyText="No posts in this room yet. Be the first!"
          />
        </Box>
      </Box>

      {/* Floating Action Button */}
      <Button
        variant="contained"
        onClick={handleCreate}
        startIcon={<AddIcon sx={{ fontSize: { xs: 19, sm: 22 } }} />}
        sx={{
          position: "fixed",
          zIndex: 1100,
          bgcolor: "#B33A00",
          color: "#fff",
          borderRadius: 99,
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 1.1, sm: 1.3, md: 1.5 },
          fontWeight: 700,
          fontSize: { xs: "0.78rem", sm: "0.88rem", md: "0.95rem" },
          whiteSpace: "nowrap",
          width: "max-content",
          maxWidth: "calc(100vw - 24px)",
          minWidth: "fit-content",
          textTransform: "none",
          boxSizing: "border-box",
          boxShadow: "0 4px 12px rgba(179,58,0,0.4)",
          "& .MuiButton-startIcon": {
            mr: { xs: 0.5, sm: 1 },
            ml: 0,
            flexShrink: 0,
          },
          "&:hover": { bgcolor: "#8f2e00" },
          left: { xs: "50%", md: "auto" },
          right: { xs: "auto", md: "32px" },
          transform: { xs: "translateX(-50%)", md: "none" },
          bottom: {
            xs: "calc(90px + env(safe-area-inset-bottom, 0px))",
            md: "40px",
          },
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