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

const TopNav = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const { tabNotification, notifications } = useNotifications();
  // const unreadCount = tabNotification?.filter(n => !n.isRead).length;
  console.log(tabNotification, 'tabNotification')
  const unreadCount = Object.values(
    (tabNotification || []).reduce((acc, curr) => {
      if (!curr?.isRead) {
        acc[curr?.data.rideId || curr._id] = curr;
      }
      return acc;
    }, {})
  ).length;
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
    localStorage.clear();
    navigate("/login");
    // onItemClick?.();
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
          minHeight: { xs: 58, md: 66 },
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

          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <img
              src={saathilogo1}
              alt="saathi"
              width={38}
              height={38}
              style={{ marginRight: 8, objectFit: "contain" }}
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

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <IconButton onClick={handleOpenNotifications} sx={{ color: "#5f4632" }}>
            <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0}>
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
              <NotificationTab handleCloseNotifications={handleCloseNotifications} />
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

          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
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
                {!currentUser?.profileImage && (currentUser?.firstName?.[0] || "U")}
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
                      color: selectedMenu === option.label ? "#FF9933" : "inherit",
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
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;