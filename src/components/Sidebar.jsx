import React, { useEffect, useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Box,
  Button,
  CircularProgress,
  Avatar,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

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
  const { notificationLengthcount } = useReferral();
  const { notifications } = useNotifications();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);

  const SAFFRON = "#109210";
  const CARD_BORDER = "1px solid #F0E6DC";

  const goTo = (link) => {
    navigate(link);
    onItemClick?.();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    handleCloseProfileMenu();
    onItemClick?.();
  };

  const handleSelect = (option) => {
    setSelectedMenu(option.label);
    handleCloseProfileMenu();
    if (option.label === "Log out") {
      handleLogout();
    } else if (option.link) {
      navigate(option.link);
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    setLogoutDialogOpen(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  // NOTE: every item now has a stable, unique `id` string.
  // Use `id` (not `label`) for React keys and for the openDropdown
  // comparison — `label` can be JSX (see "referrals") and JSX is not
  // a valid/stable value for keys or state equality checks.
  const menuItems = [
    {
      id: "find-ride",
      label: "Find Ride",
      icon: <SearchIcon />,
      children: [
        { id: "search-ride", label: "Search Ride", link: "/find-ride" },
        {
          id: "requested-rides",
          label: "Requested Rides",
          link: "/request-ride",
        },
      ],
    },
    {
      id: "community",
      label: "Community",
      icon: <DashboardIcon />,
      link: "/community",
    },
    { id: "my-rides", label: "My Rides", icon: <RouteIcon />, link: "/myride" },
    {
      id: "my-profile",
      label: "My Profile",
      icon: <PersonIcon />,
      link: "/user-profile",
    },
    {
      id: "referrals",
      label: (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span>My Referrals</span>
          {notificationLengthcount > 0 && (
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#ff0000" }}
            >
              ({notificationLengthcount})
            </Typography>
          )}
        </Box>
      ),
      icon: <HandshakeIcon />,
      link: "/my-referalls",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon />,
      link: "/myprofile",
    },
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
              sx={{ color: "#fffffe", position: "absolute" }}
            />
            <CircularProgress
              variant="determinate"
              value={completion}
              size={60}
              thickness={3}
              sx={{
                color: completion === 100 ? "#119200" : "#f74040c2",
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

          <Box
            sx={{
              minWidth: 0,
              width: "100%",
              maxWidth: {
                xs: 100,
                sm: 135,
                md: 150,
              },
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: "0.8rem",
                  sm: "1rem",
                },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.3,
                color: "text.primary",
              }}
            >
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "0.75rem",
                  sm: "0.9rem",
                },
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.3,
                mt: 0.25,
              }}
            >
              {currentUser?.email}
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.75rem",
                },
                fontWeight: 700,
                color: completion === 100 ? "#119200" : "#f74040",
                display: "block",
                mt: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              {Math.round(completion)}% complete
            </Typography>
          </Box>
        </Stack>

        <Button
          fullWidth
          size="small"
          variant="contained"
          onClick={() => {
            navigate("/user-profile");
            onItemClick?.();
          }}
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
        <Stack spacing={{ xs: 2, sm: 2 }}>
          {menuItems.map((item) => {
            const isDropdown = Boolean(item.children);
            const isOpen = openDropdown === item.id;
            const isParentActive =
              location.pathname === item.link ||
              (isDropdown &&
                item.children.some((c) => c.link === location.pathname));

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
                {isDropdown && (
                  <Collapse in={isOpen} timeout={250} unmountOnExit>
                    <Stack
                      sx={{
                        pl: 2,
                        pr: 1,
                        mt: 1,
                        mb: 0.5,
                        ml: 2,
                        // borderLeft: "2px solid #f0e4d7",
                      }}
                    >
                      {item.children.map((sub) => {
                        const active = location.pathname === sub.link;
                        return (
                          <Box
                            key={sub.id}
                            onClick={() => goTo(sub.link)}
                            sx={{
                              py: 1,
                              px: 1.5,
                              mb: 0.3,
                              cursor: "pointer",
                              borderRadius: 1.5,
                              position: "relative",
                              // backgroundColor: active ? "rgba(217, 119, 6, 0.08)" : "transparent",
                              transition:
                                "background-color 0.2s ease, color 0.2s ease",
                              "&:hover": {
                                // backgroundColor: "rgba(217, 119, 6, 0.06)",
                              },
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                left: -2,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 2,
                                height: active ? "70%" : 0,
                                backgroundColor: "#d97706",
                                borderRadius: 2,
                                transition: "height 0.2s ease",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12.5,
                                color: active ? "#d97706" : "#5f4632",
                                fontWeight: active ? 700 : 500,
                                transition: "color 0.2s ease",
                              }}
                            >
                              {sub.label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ---------- FOOTER (fixed to bottom) ---------- */}
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

      {/* Dialog moved OUTSIDE the clickable footer */}
      <Dialog
        open={logoutDialogOpen}
        onClose={cancelLogout}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: { xs: 3, sm: 4 },
            mx: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 24px)", sm: "100%" },
            maxWidth: { xs: 320, sm: 400 },
            overflow: "hidden",
            position: "relative",
            background: "linear-gradient(145deg, #ffffff, #faf5f0)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            my: { xs: 2, sm: "auto" },
            maxHeight: { xs: "90vh", sm: "auto" },
          },
        }}
      >
        {/* Decorative Top Bar */}
        <Box
          sx={{
            height: { xs: 3, sm: 4 },
            background: "linear-gradient(90deg, #f97316, #dc2626)",
            width: "100%",
            flexShrink: 0,
          }}
        />

        {/* Close Button */}
        {/* <IconButton
    onClick={(e) => {
      e.stopPropagation(); // Prevent event bubbling
      cancelLogout();
    }}
    aria-label="Close"
    sx={{
      position: "absolute",
      right: { xs: 8, sm: 12 },
      top: { xs: 8, sm: 12 },
      color: "#E85D26",
      zIndex: 10,
      bgcolor: "#f3f4f6",
      "&:hover": {
        bgcolor: "#fee2e2",
        color: "#E85D26",
      },
      width: { xs: 28, sm: 36 },
      height: { xs: 28, sm: 36 },
      p: 0,
    }}
  >
    <CloseIcon sx={{ fontSize: { xs: 14, sm: 20 } }} />
  </IconButton> */}

        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: { xs: "0.95rem", sm: "1.25rem" },
            pt: { xs: 2.5, sm: 4 },
            pb: 0,
            textAlign: "center",
            color: "#1F2430",
            px: { xs: 2, sm: 3 },
          }}
        />

        <DialogContent
          sx={{
            pt: { xs: 1.5, sm: 2.5 },
            pb: { xs: 0.5, sm: 1.5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ textAlign: "center", px: { xs: 0.5, sm: 1 } }}>
            <Typography
              sx={{
                fontSize: { xs: "0.85rem", sm: "1rem" },
                fontWeight: 600,
                color: "#1F2430",
                mb: { xs: 0.5, sm: 1 },
              }}
            >
              Are you sure you want to logout ?
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 1.5, sm: 3 },
            pb: { xs: 2, sm: 3.5 },
            pt: { xs: 1, sm: 2 },
            gap: { xs: 0.75, sm: 1.5 },
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              cancelLogout();
            }}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { xs: "auto", sm: 110 },
              minHeight: { xs: 32, sm: 46 },
              height: { xs: 32, sm: 46 },
              borderColor: "#6b7280",
              color: "#ffffff",
              bgcolor: "#6b7280",
              "&:hover": {
                borderColor: "#6b7280",
                bgcolor: "#6b7280",
              },
              px: { xs: 1, sm: 3 },
              fontSize: { xs: "0.7rem", sm: "0.9rem" },
              py: { xs: 0.5, sm: 1 },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              confirmLogout();
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { xs: "auto", sm: 110 },
              minHeight: { xs: 32, sm: 46 },
              height: { xs: 32, sm: 46 },
              background: "linear-gradient(135deg, #E85D26, #E85D26)",
              color: "#ffffff",
              "&:hover": {
                background: "linear-gradient(135deg, #D65A00, #D65A00)",
              },
              boxShadow: "0 4px 15px rgba(232, 93, 38, 0.3)",
              px: { xs: 1, sm: 3 },
              fontSize: { xs: "0.7rem", sm: "0.9rem" },
              py: { xs: 0.5, sm: 1 },
            }}
            startIcon={<LogoutIcon sx={{ fontSize: { xs: 14, sm: 20 } }} />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
