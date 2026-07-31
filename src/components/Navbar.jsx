import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Button,
  Avatar,
  CircularProgress,
  Stack,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import OfferRide from "../pages/OfferRide.jsx";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import saathilogo1 from "../assets/saathilogo1.png";
import { useUser } from "../context/userConetext.jsx";
import NotificationTab from "../pages/NotificationTab.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, useMediaQuery } from "@mui/material";

const TopNav = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { tabNotification, notifications } = useNotifications();

  // const unreadCount = tabNotification?.filter(n => !n.isRead).length;
  // console.log(tabNotification, 'tabNotification')

  // const unreadCount = Object.values(
  //   (tabNotification || []).reduce((acc, curr) => {
  //     if(curr.type == "ride_started") return 0;
  //     if (!curr?.isRead) {
  //       acc[curr?.data.rideId || curr._id] = curr;
  //     }
  //     return acc;
  //   }, {})
  // ).length;

  const unreadCount = Object.values(
    (tabNotification || []).reduce((acc, curr) => {
      if (curr.type === "ride_started") return acc;
      if (!curr?.isRead) {
        acc[curr?.data?.rideId || curr._id] = curr;
      }

      return acc;
    }, {}),
  ).length;
  // console.log(unreadCount,'unreadCount')
  const [selectedMenu, setSelectedMenu] = useState("");

  const { completion, currentUser } = useUser();
  const navigate = useNavigate();

  // Separate anchor state for each menu so they don't fight over one another
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const openNotifications = Boolean(notifAnchorEl);
  const openProfileMenu = Boolean(profileAnchorEl);

  const handleOpenNotifications = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotifAnchorEl(null);
  };

  const handleOpenProfileMenu = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const isProfileComplete = completion === 100;

  const profileMenuOptions = [
    {
      label: "Profile",
      icon: <AccountCircleIcon fontSize="small" />,
      link: "/user-profile",
    },
    {
      label: "Settings",
      icon: <SettingsOutlinedIcon fontSize="small" />,
      link: "/myprofile",
    },
    {
      label: "Log out",
      icon: <LogoutIcon fontSize="small" />,
      link: "/login",
    },
  ];

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    handleCloseProfileMenu();
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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#ffffff",
        color: "#1F2430",
        borderBottom: "1px solid #f1e4d7",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 58, md: 68 },
          px: { xs: 1.5, sm: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              mr: 1,
              color: "#d97706",
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/community")}
          >
            <img
              src={saathilogo1}
              alt="saathi"
              width={38}
              height={38}
              style={{ marginRight: 5, objectFit: "contain" }}
            />

            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              <Box component="span" sx={{ color: "#f97316" }}>
                Saa
              </Box>
              <Box component="span" sx={{ color: "#15803d" }}>
                thi
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.2, sm: 1.5 },
          }}
        >
          {isMobile && (
            <IconButton
              onClick={() => navigate("/discover")}
              sx={{
                color: "#5f4632",
                transition: "color 0.2s ease",
                "&:hover": {
                  color: "#f97316",
                },
              }}
            >
              <EmojiEventsIcon />
            </IconButton>
          )}

          <IconButton
            onClick={handleOpenNotifications}
            sx={{ color: "#5f4632" }}
          >
            <Badge
              color="error"
              badgeContent={unreadCount}
              invisible={unreadCount === 0}
            >
              <NotificationsNoneIcon
                sx={{
                  color: openNotifications ? "#f97316" : "#5f4632",
                  transition: "0.2s",
                }}
              />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notifAnchorEl}
            open={openNotifications}
            onClose={handleCloseNotifications}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Typography sx={{ pl: 2, fontSize: 14 }}>Notifications</Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: 320,
                p: 1,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              <NotificationTab
                handleCloseNotifications={handleCloseNotifications}
              />
            </Box>
          </Menu>

          <Tooltip
            title={
              !isProfileComplete
                ? "Complete your profile to 100% before posting a ride."
                : ""
            }
            arrow
          >
            <Box component="span">
              <Button
                onClick={() => setOpen(true)}
                disabled={!isProfileComplete}
                startIcon={<AddIcon />}
                sx={{
                  display: { xs: "none", sm: "flex" },
                  textTransform: "none",
                  borderRadius: 2,
                  backgroundColor: "#f97316",
                  color: "#ffffff",
                  fontWeight: 700,

                  "&:hover": {
                    backgroundColor: "#f5c4a1",
                  },

                  "&.Mui-disabled": {
                    backgroundColor: "#d1d5db",
                    color: "#6b7280",
                    cursor: "not-allowed",
                  },
                }}
              >
                Post Ride
              </Button>
            </Box>
          </Tooltip>

          <Dialog
            open={open}
            onClose={(event, reason) => {
              if (reason === "backdropClick") return;
              setOpen(false);
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle
              sx={{
                position: "relative",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "80%",
                  transform: "translateY(-50%)",
                  color: "grey.600",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <OfferRide />
            </DialogContent>
          </Dialog>

          <Stack>
            <Box sx={{ position: "relative", width: 44, height: 44 }}>
              <CircularProgress
                variant="determinate"
                value={completion}
                size={44}
                thickness={3}
                sx={{
                  color: completion === 100 ? "#a33916ff" : "#f97316",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />

              <Avatar
                src={currentUser?.profileImage || ""}
                onClick={handleOpenProfileMenu}
                sx={{
                  bgcolor: "#f97316",
                  width: 34,
                  height: 34,
                  fontSize: 14,
                  fontWeight: 800,
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                }}
              >
                {!currentUser?.profileImage &&
                  (currentUser?.firstName?.[0] || "U")}
              </Avatar>
            </Box>
            <Menu
              anchorEl={profileAnchorEl}
              open={openProfileMenu}
              onClose={handleCloseProfileMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              transformOrigin={{ vertical: "top", horizontal: "center" }}
              sx={{ mt: 1.5 }}
            >
              {profileMenuOptions.map((option) => (
                <MenuItem
                  key={option.label}
                  selected={selectedMenu === option.label}
                  onClick={() => handleSelect(option)}
                  sx={{
                    "&.Mui-selected": {
                      bgcolor: "#fff", // Saffron
                      color: "#FF9933",
                    },
                    "&.Mui-selected:hover": {
                      color: "#e68a00",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        selectedMenu === option.label ? "#FF9933" : "inherit",
                    }}
                  >
                    {option.icon}
                  </ListItemIcon>

                  <ListItemText>{option.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Box>
      <Dialog
  open={logoutDialogOpen}
  onClose={cancelLogout}
  PaperProps={{
    sx: {
      borderRadius: 4,
      mx: { xs: 2, sm: "auto" },
      width: { xs: "calc(100% - 32px)", sm: "100%" },
      maxWidth: "xs",
      overflow: "hidden",
      position: "relative",
      background: "linear-gradient(145deg, #ffffff, #faf5f0)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    },
  }}
>
  {/* Decorative Top Bar */}
  <Box
    sx={{
      height: 4,
      background: "linear-gradient(90deg, #f97316, #dc2626)",
      width: "100%",
    }}
  />

  <IconButton
    onClick={cancelLogout}
    aria-label="Close"
    sx={{
      position: "absolute",
      right: 12,
      top: 12,
      color: "#9ca3af",
      zIndex: 10,
      bgcolor: "#f3f4f6",
      "&:hover": {
        bgcolor: "#fee2e2",
        color: "#dc2626",
      },
      width: 36,
      height: 36,
    }}
  >
    <CloseIcon fontSize="small" />
  </IconButton>

  <DialogTitle
    sx={{
      fontWeight: 800,
      fontSize: { xs: "1.1rem", sm: "1.25rem" },
      pt: 4,
      pb: 0,
      textAlign: "center",
      color: "#1F2430",
    }}
  >
  </DialogTitle>

  <DialogContent sx={{ pt: 2, pb: 1 }}>
    <Box sx={{ textAlign: "center", px: 1 }}>
      <Typography
        sx={{
          fontSize: { xs: "0.95rem", sm: "1rem" },
          fontWeight: 500,
          color: "#374151",
          mb: 1,
        }}
      >
        Are you sure you want to logout?
      </Typography>
      <Typography
        color="text.secondary"
        sx={{
          fontSize: { xs: "0.8rem", sm: "0.85rem" },
          color: "#6b7280",
          lineHeight: 1.6,
        }}
      >
        You'll need to login again to access your account.
      </Typography>
    </Box>
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      pb: 3.5,
      pt: 1.5,
      gap: 1.5,
      flexWrap: "wrap",
      justifyContent: "center",
    }}
  >
    <Button
      onClick={cancelLogout}
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 600,
        flex: { xs: "1 1 auto", sm: "0 0 auto" },
        minWidth: 110,
        minHeight: 46,
        borderColor: "#e5e7eb",
        color: "#4b5563",
        bgcolor: "#f9fafb",
        "&:hover": {
          borderColor: "#d1d5db",
          bgcolor: "#f3f4f6",
        },
        px: 3,
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={confirmLogout}
      variant="contained"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 700,
        flex: { xs: "1 1 auto", sm: "0 0 auto" },
        minWidth: 110,
        minHeight: 46,
        background: "linear-gradient(135deg, #dc2626, #b91c1c)",
        color: "#ffffff",
        "&:hover": {
          background: "linear-gradient(135deg, #b91c1c, #991b1b)",
        },
        boxShadow: "0 4px 15px rgba(220, 38, 38, 0.35)",
        px: 3,
      }}
      startIcon={<LogoutIcon />}
    >
      Logout
    </Button>
  </DialogActions>
</Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;
