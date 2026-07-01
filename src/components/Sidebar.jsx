import React, { useState } from "react";
import { Paper, Stack, Typography, Box, Badge } from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import HandshakeIcon from "@mui/icons-material/Handshake";

import { useLocation, useNavigate } from "react-router-dom";
import { useReferral } from "../context/ReferralContext";



export default function Sidebar({ onItemClick, isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingReferralCount } = useReferral();

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
    { label: "Offer Ride", icon: <DirectionsCarIcon />, link: "/offer-ride" },
    { label: "Find Ride", icon: <SearchIcon />, link: "/find-ride" },
    { label: "My Rides", icon: <RouteIcon />, link: "/myride" },
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
    <Paper
      elevation={0}
      sx={{
        width: isMobile ? "100%" : 220,
        minWidth: isMobile ? "100%" : 220,
        height: isMobile ? "100dvh" : "98%",
        bgcolor: "#ffffff",
        borderRadius: 0,
        // p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: isMobile ? "none" : "1px solid #f1e4d7",
        zIndex: 200
      }}
    >
      <Stack spacing={1.2}
        sx={{
          marginTop: isMobile ? 10 : 0,
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
                  transform: "translateX(3px)",
                
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
  );
}