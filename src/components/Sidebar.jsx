import React, { useState } from "react";
import {
  Paper, Stack, Typography, Box, Badge, Button, CircularProgress,
  Avatar
} from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import HandshakeIcon from "@mui/icons-material/Handshake";
import { useUser } from "../context/userConetext";
import { useLocation, useNavigate } from "react-router-dom";
import { useReferral } from "../context/ReferralContext";
import ArticleIcon from "@mui/icons-material/Article";


export default function Sidebar({ onItemClick, isMobile = false }) {
  const { currentUser, getuserData } = useUser()
  const { completion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingReferralCount } = useReferral();
  const SAFFRON = "#E8650A";
  const SAFFRON_LIGHT = "#FDF0E8";
  const CARD_BORDER = "1px solid #F0E6DC";
  const pillBtn = {
    textTransform: "none",
    border: "none",
    fontSize: { xs: "0.60rem", sm: "0.8rem", md: "0.875rem" },
    color: SAFFRON,
    fontWeight: 600,
  };
  const SectionCard = ({ children, sx = {} }) => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: "12px 14px", sm: "16px 18px", md: "20px 24px" },
        borderRadius: { xs: 2, sm: 3 },
        border: CARD_BORDER,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );

  console.log(pendingReferralCount,)

  const goTo = (link) => {
    navigate(link);
    onItemClick?.();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    onItemClick?.();
  };

  const menuItems = [
    { label: "Community", icon: <DashboardIcon />, link: "/community" },
    // { label: "Offer Ride", icon: <DirectionsCarIcon />, link: "/offer-ride" },
    { label: "Find Ride", icon: <SearchIcon />, link: "/find-ride" },
    { label: "My Rides", icon: <RouteIcon />, link: "/myride" },
    { label: "My Post", icon: <ArticleIcon />, link: "/mypost" },
    {
      label: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>My Referrals</span>
          {pendingReferralCount > 0 && (
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ff0000ff",
              }}
            >
              ({pendingReferralCount})
            </Typography>
          )}
        </Box>
      ),
      icon: <HandshakeIcon />,
      link: "/my-referalls",
    },
    { label: "Settings", icon: <SettingsIcon />, link: "/settings" },
  ];

  return (
    <Box>

      <Paper
        elevation={0}
        sx={{
          width: isMobile ? "100%" : 200,
          minWidth: isMobile ? "100%" : 200,
          height: isMobile ? "100dvh" : "98%",
          bgcolor: "#ffffff",
          borderRadius: 0,
          p: { xs: 0, sm: -2 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: isMobile ? "none" : "1px solid #f1e4d7",
          zIndex: 200
        }}
      >
        <SectionCard>
          <Box sx={{ mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                // border: "1px solid #F0E6DC",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: 60,
                      height: 60,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Background Ring */}
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={60}
                      thickness={3}
                      sx={{
                        color: "#FFE0B2",
                        position: "absolute",
                      }}
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
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: "#E8650A",
                      }}
                    >
                      {!currentUser?.profileImage &&
                        `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
                    </Avatar>
                  </Box>

                  {/* Percentage Below Avatar */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      fontWeight: 700,
                      color: "#E8650A",
                    }}
                  >
                    {Math.round(completion)}%
                  </Typography>
                </Box>

              </Stack>
              <Box>
                <Typography fontWeight={700}>
                  {currentUser?.firstName} {currentUser?.lastName}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>


            </Paper>
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate("/settings")}
              sx={{
                bgcolor: "#FF9933", // Saffron
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#e68a00",
                },
              }}
            >
              Update Profile
            </Button>
          </Box>
        </SectionCard>
        <Stack spacing={{ xs: 1.3, sm: 2 }}
          sx={{
            marginTop: isMobile ? 10 : 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "#d97706",
              mb: 1,
              px: 1,
            }}
          >
            Saathi Menu
          </Typography>

          {menuItems.map((item) => {
            const active = location.pathname === item.link;

            return (
              <Box
                key={item.link}
                onClick={() => goTo(item.link)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: 2.5,
                  py: 1,
                  borderRadius: 7,
                  cursor: "pointer",
                  transition: "0.2s ease",
                  bgcolor: active ? "#fff0df" : "transparent",
                  color: active ? "#d97706" : "#5f4632",
                  border: active ? "1px solid #ffd7aa" : "1px solid transparent",
                  "& svg": { fontSize: 20 },
                  "&:hover": {
                    bgcolor: "#fff0df",
                    color: "#d97706",
                    // transform: "translateX(3px)",

                  },
                }}
              >
                {item.icon}

                <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Box
          onClick={handleLogout}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.2,
            borderRadius: 2,
            cursor: "pointer",
            color: "#b42318",
            transition: "0.2s ease",
            "&:hover": {
              bgcolor: "#fee4e2",
            },
          }}
        >
          <LogoutIcon sx={{ fontSize: 21 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Logout</Typography>
        </Box>
      </Paper>
    </Box>
  );
}