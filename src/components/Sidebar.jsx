import React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import RouteIcon from "@mui/icons-material/Route";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";

import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  { label: "Community", icon: <DashboardIcon />, link: "/community" },
  { label: "Offer Ride", icon: <DirectionsCarIcon />, link: "/offer-ride" },
  { label: "Find Ride", icon: <SearchIcon />, link: "/find-ride" },
  { label: "My Rides", icon: <RouteIcon />, link: "/myride" },
  { label: "Refer", icon: <SettingsIcon />, link: "/settings" },
  { label: "Settings", icon: <SettingsIcon />, link: "/settings" },

];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 200,
        minWidth: 200,
        height: "90vh",
        background: "#ffffffff",
        borderRadius: 0,
        p: 2,
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #f1e4d7"
        // borderRight: "1px solid #f1e4d7",
      }}
    >
      <Stack spacing={1}>

        {menuItems.map((item, index) => (
          <Box
            key={index}
            onClick={() => navigate(item.link)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1.2,
              borderRadius: 2,
              cursor: "pointer",
              color: "#5f4632",
              transition: "0.2s ease",
              backgroundColor:
                location.pathname === item.link
                  ? "#ffe8d2"
                  : "transparent",

              color:
                location.pathname === item.link
                  ? "#d97706"
                  : "#5f4632",
              "& svg": {
                fontSize: 21,
              },
              "&:hover": {
                backgroundColor: "#ffe8d2",
                color: "#d97706",
                transform: "translateX(3px)",
              },
            }}
          >
            {item.icon}

            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        onClick={handleLogout}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          py: 1.2,
          borderRadius: 2,
          cursor: "pointer",
          color: "#b42318",
          transition: "0.2s ease",
          "&:hover": {
            backgroundColor: "#fee4e2",
          },
        }}
      >
        <LogoutIcon sx={{ fontSize: 21 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          Logout
        </Typography>
      </Box>
    </Paper>
  );
}