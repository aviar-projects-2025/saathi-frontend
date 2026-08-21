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

export default function Sidebar({ onItemClick, isMobile = false }) {
  const { currentUser, completion } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { notificationLengthcount } = useReferral();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const SAFFRON = "#109210";
  const CARD_BORDER = "1px solid #F0E6DC";

  const menuItems = [
    {
      id: "find-ride",
      label: "Find Ride",
      icon: <SearchIcon />,
      children: [
        {
          id: "search-ride",
          label: "Search Ride",
          link: "/find-ride",
        },
        {
          id: "requested-rides",
          label: "Requested Rides",
          link: "/request-ride",
        },
      ],
    },
    {
      id: "my-rides",
      label: "My Rides",
      icon: <RouteIcon />,
      link: "/myride",
    },
    {
      id: "community",
      label: "Community",
      icon: <DashboardIcon />,
      link: "/community",
    },
    {
      id: "referrals",
      label: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span>My Referrals</span>

          {notificationLengthcount > 0 && (
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ff0000",
              }}
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
      id: "my-profile",
      label: "My Profile",
      icon: <PersonIcon />,
      link: "/user-profile",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon />,
      link: "/myprofile",
    },
  ];

  // Automatically open dropdown when one of its children is active
  useEffect(() => {
    const activeDropdown = menuItems.find(
      (item) =>
        item.children &&
        item.children.some(
          (child) => child.link === location.pathname
        )
    );

    if (activeDropdown) {
      setOpenDropdown(activeDropdown.id);
    }
  }, [location.pathname]);

  const goTo = (link) => {
    navigate(link);
    onItemClick?.();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    onItemClick?.();
  };

  const confirmLogout = () => {
    localStorage.clear();
    setLogoutDialogOpen(false);
    navigate("/login");
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
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
        overflow: "hidden",
      }}
    >
      {/* ---------- HEADER ---------- */}
      <Box
        sx={{
          flexShrink: 0,
          p: {
            xs: "12px 14px",
            sm: "16px 18px",
            md: "20px",
          },
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
              sx={{
                color: "#fffffe",
                position: "absolute",
              }}
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
              sx={{
                width: 52,
                height: 52,
                bgcolor: SAFFRON,
              }}
            >
              {!currentUser?.profileImage &&
                `${currentUser?.firstName?.[0] || ""}${
                  currentUser?.lastName?.[0] || ""
                }`}
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
                mt: 0.5,
              }}
            >
              {Math.round(completion)}% complete
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ---------- MENU ---------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: {
            xs: 1.5,
            sm: 2,
          },
          py: 1,
        }}
      >
        <Stack spacing={{ xs: 2, sm: 2 }}>
          {menuItems.map((item) => {
            const isDropdown = Boolean(item.children);

            // Check whether one of the children is active
            const hasActiveChild =
              isDropdown &&
              item.children.some(
                (child) => child.link === location.pathname
              );

            // Dropdown stays open when child is active
            const isOpen =
              openDropdown === item.id || hasActiveChild;

            const isParentActive =
              location.pathname === item.link || hasActiveChild;

            const handleMenuClick = () => {
              if (isDropdown) {
                // Do not close if one of the children is active
                if (hasActiveChild) {
                  setOpenDropdown(item.id);
                  return;
                }

                // Toggle dropdown for non-active dropdown
                setOpenDropdown(
                  openDropdown === item.id ? null : item.id
                );
              } else {
                goTo(item.link);
              }
            };

            return (
              <Box key={item.id}>
                {/* ---------- PARENT MENU ---------- */}
                <Box
                  onClick={handleMenuClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    px: 2,
                    py: 1,
                    borderRadius: 7,
                    cursor: "pointer",
                    bgcolor: isParentActive
                      ? "#fff0df"
                      : "transparent",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: "#fff0df",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {item.icon}

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>

                  {isDropdown && (
                    <Typography sx={{ fontSize: 12 }}>
                      {isOpen ? "▲" : "▼"}
                    </Typography>
                  )}
                </Box>

                {/* ---------- DROPDOWN CHILDREN ---------- */}
                {isDropdown && (
                  <Collapse
                    in={isOpen}
                    timeout={250}
                    unmountOnExit
                  >
                    <Stack
                      sx={{
                        pl: 2,
                        pr: 1,
                        mt: 1,
                        mb: 0.5,
                        ml: 2,
                      }}
                    >
                      {item.children.map((sub) => {
                        const active =
                          location.pathname === sub.link;

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
                              transition:
                                "background-color 0.2s ease, color 0.2s ease",

                              "&:hover": {
                                bgcolor: "#fff7ed",
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
                                color: active
                                  ? "#d97706"
                                  : "#5f4632",
                                fontWeight: active ? 700 : 500,
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

      {/* ---------- FOOTER ---------- */}
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
          "&:hover": {
            bgcolor: "#fee4e2",
          },
        }}
      >
        <LogoutIcon sx={{ fontSize: 21 }} />

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Logout
        </Typography>
      </Box>

      {/* ---------- LOGOUT DIALOG ---------- */}
      <Dialog
        open={logoutDialogOpen}
        onClose={cancelLogout}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            mx: {
              xs: 2,
              sm: "auto",
            },
            width: {
              xs: "calc(100% - 24px)",
              sm: "100%",
            },
            maxWidth: {
              xs: 320,
              sm: 400,
            },
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #ffffff, #faf5f0)",
          },
        }}
      >
        <Box
          sx={{
            height: {
              xs: 3,
              sm: 4,
            },
            background:
              "linear-gradient(90deg, #f97316, #dc2626)",
          }}
        />

        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: {
              xs: "0.95rem",
              sm: "1.25rem",
            },
            pt: {
              xs: 2.5,
              sm: 4,
            },
            pb: 0,
            textAlign: "center",
          }}
        >
          Logout
        </DialogTitle>

        <DialogContent
          sx={{
            pt: {
              xs: 1.5,
              sm: 2.5,
            },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "0.85rem",
                sm: "1rem",
              },
              fontWeight: 600,
            }}
          >
            Are you sure you want to logout?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: {
              xs: 1.5,
              sm: 3,
            },
            pb: {
              xs: 2,
              sm: 3.5,
            },
            pt: {
              xs: 1,
              sm: 2,
            },
            gap: {
              xs: 0.75,
              sm: 1.5,
            },
            justifyContent: "center",
          }}
        >
          <Button
            onClick={cancelLogout}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              flex: {
                xs: 1,
                sm: "0 0 auto",
              },
              minWidth: {
                xs: "auto",
                sm: 110,
              },
              height: {
                xs: 32,
                sm: 46,
              },
              borderColor: "#6b7280",
              color: "#ffffff",
              bgcolor: "#6b7280",
              "&:hover": {
                borderColor: "#6b7280",
                bgcolor: "#6b7280",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={confirmLogout}
            variant="contained"
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              flex: {
                xs: 1,
                sm: "0 0 auto",
              },
              minWidth: {
                xs: "auto",
                sm: 110,
              },
              height: {
                xs: 32,
                sm: 46,
              },
              bgcolor: "#E85D26",
              "&:hover": {
                bgcolor: "#D65A00",
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}