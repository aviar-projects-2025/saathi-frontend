import React, { useEffect, useState } from "react";
import {
  Paper, Stack, Typography, Box, Button, CircularProgress,
  Avatar
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PersonIcon from "@mui/icons-material/Person";
import { useUser } from "../context/userConetext";
import { useLocation, useNavigate } from "react-router-dom";
import { useReferral } from "../context/ReferralContext";
import { useNotifications } from "../context/NotificationContext";

export default function Sidebar({ onItemClick, isMobile = false }) {
  const { currentUser, completion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingReferralCount } = useReferral();
  const { notifications } = useNotifications();
  const [notificationLengthcount, setNotificationLengthcount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
  const referralNotificationsCount =
    notifications?.filter(
      (n) => n.type === "REFERRAL" // adjust based on your actual type
    ).length || 0;

  const total =
    (pendingReferralCount || 0) + referralNotificationsCount;

  setNotificationLengthcount(total);
}, [notifications, pendingReferralCount]);

  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const goTo = (link) => {
    navigate(link);
    onItemClick?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    onItemClick?.();
  };

  // NOTE: every item now has a stable, unique `id` string.
  // Use `id` (not `label`) for React keys and for the openDropdown
  // comparison — `label` can be JSX (see "referrals") and JSX is not
  // a valid/stable value for keys or state equality checks.
  const menuItems = [
    { id: "community", label: "Community", icon: <DashboardIcon />, link: "/community" },
    {
      id: "find-ride",
      label: "Find Ride",
      icon: <SearchIcon />,
      children: [
        { id: "search-ride", label: "Search Ride", link: "/find-ride" },
        { id: "requested-rides", label: "Requested Rides", link: "/request-ride" },
      ],
    },
    { id: "my-rides", label: "My Rides", icon: <RouteIcon />, link: "/myride" },
    { id: "my-profile", label: "My Profile", icon: <PersonIcon />, link: "/user-profile" },
    {
      id: "referrals",
      label: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>My Referrals</span>
          {notificationLengthcount > 0 && (
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#ff0000" }}>
              ({notificationLengthcount})
            </Typography>
          )}
        </Box>
      ),
      icon: <HandshakeIcon />,
      link: "/my-referalls",
    },
    { id: "settings", label: "Settings", icon: <SettingsIcon />, link: "/myprofile" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        // Responsive width: full-bleed on mobile, scales gently across breakpoints on desktop
        width: isMobile ? "100%" : { sm: 220, md: 240, lg: 260 },
        minWidth: isMobile ? "100%" : { sm: 220, md: 240, lg: 260 },
        height: isMobile ? "100dvh" : "100%",
        maxHeight: isMobile ? "100dvh" : "100vh",
        bgcolor: "#ffffff",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "1px solid #f1e4d7",
        zIndex: 200,
        overflow: "hidden", // outer paper never scrolls; inner menu region does
      }}
    >
      {/* ---------- HEADER (fixed) ---------- */}
      <Box
        sx={{
          flexShrink: 0,
          p: { xs: "12px 14px", sm: "16px 18px", md: "20px 20px" },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              position: "relative",
              width: 40,
              height: 60,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={60}
              thickness={3}
              sx={{ color: "#FFE0B2", position: "absolute" }}
            />
            <CircularProgress
              variant="determinate"
              value={completion}
              size={60}
              thickness={3}
              sx={{
                color: completion === 100 ? "#f97316" : "#e9b691",
                position: "absolute",
                transform: "rotate(-90deg)",
              }}
            />
            <Avatar
              src={currentUser?.profileImage}
              sx={{ width: 52, height: 52, bgcolor: SAFFRON }}
            >
              {!currentUser?.profileImage &&
                `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
            </Avatar>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }} noWrap>
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }} noWrap>
              {currentUser?.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: SAFFRON, display: "block", mt: 0.25 }}
            >
              {Math.round(completion)}% complete
            </Typography>
          </Box>
        </Stack>

        <Button
          fullWidth
          size="small"
          variant="contained"
          onClick={() => navigate("/user-profile")}
          sx={{
            mt: 1,
            bgcolor: "#FF9933",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 10,
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: "#e68a00", boxShadow: "none" },
          }}
        >
          Update Profile
        </Button>
      </Box>

      {/* ---------- MENU (flexible, scrolls independently) ---------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0, // required for overflow to work inside a flex child
          overflowY: "auto",
          px: { xs: 1.5, sm: 2 },
          py: 1,
        }}
      >
        <Typography
          sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 800, color: "#d97706", mb: { xs: 2, sm: 2.5 }, px: 1 }}
        >
          Saathi Menu
        </Typography>

        <Stack spacing={{ xs: 2, sm: 2 }}>
          {menuItems.map((item) => {
            const isDropdown = Boolean(item.children);
            const isOpen = openDropdown === item.id;
            const isParentActive =
              location.pathname === item.link ||
              (isDropdown && item.children.some((c) => c.link === location.pathname));

            return (
              <Box key={item.id}>
                {/* Parent Item */}
                <Box
                  onClick={() => {
                    if (isDropdown) {
                      setOpenDropdown(isOpen ? null : item.id);
                    } else {
                      goTo(item.link);
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderRadius: 7,
                    cursor: "pointer",
                    bgcolor: isParentActive ? "#fff0df" : "transparent",
                    "&:hover": { bgcolor: "#fff0df" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {item.icon}
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                  </Box>

                  {isDropdown && (
                    <Typography sx={{ fontSize: 12 }}>
                      {isOpen ? "▲" : "▼"}
                    </Typography>
                  )}
                </Box>

                {/* Children */}
                {isDropdown && isOpen && (
                  <Stack sx={{ pl: 5, mt: 0.5 }}>
                    {item.children.map((sub) => {
                      const active = location.pathname === sub.link;

                      return (
                        <Box
                          key={sub.id}
                          onClick={() => goTo(sub.link)}
                          sx={{
                            py: 0.8,
                            cursor: "pointer",
                            borderRadius: 2,
                            color: active ? "#d97706" : "#5f4632",
                            fontWeight: active ? 700 : 500,
                            "&:hover": { color: "#d97706" },
                          }}
                        >
                          <Typography sx={{ fontSize: 12 }}>
                            {sub.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ---------- FOOTER (fixed to bottom) ---------- */}
      <Box
        onClick={handleLogout}
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          cursor: "pointer",
          color: "#b42318",
          borderTop: CARD_BORDER,
          transition: "0.2s ease",
          "&:hover": { bgcolor: "#fee4e2" },
        }}
      >
        <LogoutIcon sx={{ fontSize: 21 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Logout</Typography>
      </Box>
    </Paper>
  );
}