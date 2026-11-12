
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
import { useNavigate } from "react-router-dom";
import saathilogo1 from "../assets/saathilogo1.png";
import { useUser } from "../context/userConetext.jsx";
import { useAuth } from "../context/AuthContext";
import NotificationTab from "../pages/NotificationTab.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme, useMediaQuery } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import axios from "axios";
import Api from "../Api.jsx";
import ChatModal from "../pages/ChatModal";
import { useChatSocket } from "../hooks/useChatSocket";

const TopNav = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { logout } = useAuth();

  const { tabNotification, fetchNotifications } = useNotifications();

  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [messagesOpen, setMessagesOpen] = useState(false);

  const { unreadChats, resetUnread } = useChatSocket();

  const openMoreMenu = Boolean(moreAnchorEl);

  const uniqueNotifications = Object.values(
    (tabNotification || []).reduce((acc, curr) => {
      acc[curr._id] = curr;
      return acc;
    }, {})
  );

  const unreadCount = Object.values(
    (tabNotification || []).reduce((acc, curr) => {
      if (curr.type === "ride_started") return acc;

      if (!curr?.isRead) {
        acc[curr?.data?.rideId || curr._id] = curr;
      }

      return acc;
    }, {})
  ).length;

  const [selectedMenu, setSelectedMenu] = useState("");

  const { completion, currentUser } = useUser();
  const navigate = useNavigate();

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const openNotifications = Boolean(notifAnchorEl);
  const openProfileMenu = Boolean(profileAnchorEl);

  const handleOpenMoreMenu = (event) =>
    setMoreAnchorEl(event.currentTarget);

  const handleCloseMoreMenu = () => setMoreAnchorEl(null);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await axios.patch(
        `${Api}/notification/${currentUser?._id}`
      );

      if (res?.data?.success === true) {
        fetchNotifications();
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCloseMoreMenu();
    }
  };

  const handleOpenNotifications = (event) =>
    setNotifAnchorEl(event.currentTarget);

  const handleCloseNotifications = () => setNotifAnchorEl(null);

  const handleOpenProfileMenu = (event) =>
    setProfileAnchorEl(event.currentTarget);

  const handleCloseProfileMenu = () => setProfileAnchorEl(null);

  const isProfileComplete = completion === 100;

  const profileMenuOptions = [
    {
      label: "Profile",
      icon: <AccountCircleIcon />,
      link: "/user-profile",
    },
    {
      label: "Settings",
      icon: <SettingsOutlinedIcon />,
      link: "/myprofile",
    },
    {
      label: "Log out",
      icon: <LogoutIcon />,
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
    setLogoutDialogOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => setLogoutDialogOpen(false);

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
          minHeight: { xs: 54, sm: 60, md: 66 },
          px: { xs: 1, sm: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO SECTION */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={onMenuClick}
            sx={{
              display: { xs: "inline-flex", lg: "none" },
              mr: 0.5,
              color: "#d97706",
              p: 0.8,
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: 21, sm: 23 } }} />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => navigate("/find-ride")}
          >
            <img
              src={saathilogo1}
              alt="saathi"
              width={34}
              height={34}
              style={{
                marginRight: 4,
                objectFit: "contain",
              }}
            />

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: "15px",
                    sm: "17px",
                    md: "19px",
                  },
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                <Box component="span" sx={{ color: "#f97316" }}>
                  Saa
                </Box>
                <Box component="span" sx={{ color: "#15803d" }}>
                  thi
                </Box>
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: "7px",
                    sm: "8px",
                    md: "9px",
                  },
                  color: "#666666",
                  mt: 0.3,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                Community rides · By invite only
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE ACTIONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.1, sm: 1, md: 1.5 },
          }}
        >
          {/* DISCOVER ICON */}
          {isMobile && (
            <IconButton
              onClick={() => navigate("/discover")}
              sx={{
                color: "#5f4632",
                p: 0.8,
                "&:hover": { color: "#f97316" },
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}

          {/* CHAT ICON */}
          <IconButton
            onClick={() => setMessagesOpen(true)}
            sx={{
              color: "#5f4632",
              p: 0.8,
              "&:hover": { color: "#f97316" },
            }}
          >
            <Badge
              color="error"
              badgeContent={unreadChats}
              invisible={unreadChats === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "9px",
                  minWidth: 15,
                  height: 15,
                  padding: "0 3px",
                },
              }}
            >
              <ChatBubbleOutlineIcon
                sx={{ fontSize: { xs: 21, sm: 23, md: 24 } }}
              />
            </Badge>
          </IconButton>

          {/* NOTIFICATIONS ICON */}
          <IconButton
            onClick={handleOpenNotifications}
            sx={{
              color: "#5f4632",
              p: 0.8,
            }}
          >
            <Badge
              color="error"
              badgeContent={unreadCount}
              invisible={unreadCount === 0}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "9px",
                  minWidth: 15,
                  height: 15,
                  padding: "0 3px",
                },
              }}
            >
              <NotificationsNoneIcon
                sx={{
                  color: openNotifications ? "#f97316" : "#5f4632",
                  fontSize: { xs: 22, sm: 24, md: 25 },
                }}
              />
            </Badge>
          </IconButton>

          {/* NOTIFICATION MENU */}
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
            slotProps={{
              paper: {
                sx: {
                  minWidth: 280,
                  maxWidth: "calc(100vw - 20px)",
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography
                sx={{
                  pl: 2,
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                Notifications
              </Typography>

              <IconButton onClick={handleOpenMoreMenu} size="small">
                <MoreVertIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Box>

            <Menu
              anchorEl={moreAnchorEl}
              open={openMoreMenu}
              onClose={handleCloseMoreMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={handleMarkAllAsRead}
                sx={{
                  fontSize: "11px",
                  minHeight: 34,
                }}
              >
                Mark all as read
              </MenuItem>
            </Menu>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: 280, sm: 320 },
                p: 1,
                maxHeight: 380,
                overflowY: "auto",
                "& *": {
                  fontSize: "12px",
                },
              }}
            >
              <NotificationTab
                handleCloseNotifications={handleCloseNotifications}
              />
            </Box>

            {uniqueNotifications?.length > 4 && (
              <Typography
                onClick={() => {
                  handleCloseNotifications();
                  navigate("/notifications");
                }}
                sx={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#1f49adff",
                  cursor: "pointer",
                  py: 0.5,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                See more
              </Typography>
            )}
          </Menu>

          {/* POST RIDE BUTTON */}
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
                startIcon={<AddIcon sx={{ fontSize: "16px !important" }} />}
                sx={{
                  display: { xs: "none", sm: "flex" },
                  textTransform: "none",
                  borderRadius: 2,
                  backgroundColor: "#f97316",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: {
                    sm: "11px",
                    md: "12px",
                    lg: "13px",
                  },
                  minWidth: "auto",
                  py: 0.6,
                  px: 1.5,
                  "&:hover": {
                    backgroundColor: "#e96810",
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

          {/* OFFER RIDE DIALOG */}
          <Dialog
            open={open}
            onClose={(event, reason) => {
              if (reason === "backdropClick") return;
              setOpen(false);
            }}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                width: { xs: "100%", sm: "80%", md: "90%" },
                maxWidth: { sm: 600, md: 800 },
                borderRadius: { xs: 0, sm: 3 },
                m: { xs: 0, sm: 3 },
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                position: "relative",
                fontWeight: 700,
                fontSize: { xs: "14px", sm: "16px" },
                py: 1.5,
                pr: 6,
              }}
            >
              Offer Ride

              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  color: "text.secondary",
                }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                p: { xs: 1, sm: 2 },
                overflowY: "auto",
                maxHeight: { xs: "100vh", sm: "75vh" },
              }}
            >
              <OfferRide
                setOpen={setOpen}
                onClose={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* PROFILE AVATAR */}
          <Stack>
            <Box
             sx={{ position: "relative", width: 44, height: 44 }}
             >
              <CircularProgress
                variant="determinate"
                value={completion}
                size={44}
                thickness={3}
                sx={{
                  color: completion === 100 ? "#119200" : "#f74040",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />

              <Avatar
                src={currentUser?.profileImageUrl || ""}
                onClick={handleOpenProfileMenu}
                sx={{
                  bgcolor: "#f97316",
                  width: { xs: 28, sm: 32, md: 34 },
                  height: { xs: 28, sm: 32, md: 34 },
                  fontSize: { xs: 10, sm: 12, md: 13 },
                  fontWeight: 800,
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  cursor: "pointer",
                }}
              >
                {currentUser?.firstName?.[0]}
                {currentUser?.lastName?.[0]}
              </Avatar>
            </Box>

            {/* PROFILE MENU */}
            <Menu
              anchorEl={profileAnchorEl}
              open={openProfileMenu}
              onClose={handleCloseProfileMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              sx={{ mt: 1.5 }}
            >
              {profileMenuOptions.map((option) => (
                <MenuItem
                  key={option.label}
                  selected={selectedMenu === option.label}
                  onClick={() => handleSelect(option)}
                  sx={{
                    fontSize: "12px",
                    minHeight: 36,
                    py: 0.5,
                    "&.Mui-selected": {
                      bgcolor: "#fff",
                      color: "#FF9933",
                    },
                    "&.Mui-selected:hover": {
                      color: "#e68a00",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 30,
                      color:
                        selectedMenu === option.label
                          ? "#FF9933"
                          : "inherit",
                      "& .MuiSvgIcon-root": {
                        fontSize: 17,
                      },
                    }}
                  >
                    {option.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={option.label}
                    slotProps={{
                      primary: {
                        fontSize: "12px",
                      },
                    }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </Box>

        {/* CHAT MODAL */}
        <ChatModal
          open={messagesOpen}
          onClose={() => setMessagesOpen(false)}
          onResetUnread={resetUnread}
        />

        {/* LOGOUT CONFIRMATION DIALOG */}
        <Dialog
          open={logoutDialogOpen}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            cancelLogout();
          }}
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
          <Box
            sx={{
              height: 4,
              background: "linear-gradient(90deg, #f97316, #dc2626)",
              width: "100%",
              flexShrink: 0,
            }}
          />

          <DialogTitle
            sx={{
              fontWeight: 800,
              fontSize: { xs: "13px", sm: "15px" },
              pt: { xs: 2, sm: 3 },
              pb: 0,
              textAlign: "center",
              color: "#1F2430",
              px: 2,
            }}
          />

          <DialogContent
            sx={{
              pt: 2,
              pb: 1,
              px: 2,
            }}
          >
            <Box sx={{ textAlign: "center", px: 0.5 }}>
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "14px" },
                  fontWeight: 600,
                  color: "#1F2430",
                  mb: 1,
                }}
              >
                Are you sure you want to logout?
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 1.5, sm: 3 },
              pb: { xs: 2, sm: 3 },
              pt: 1,
              gap: 1,
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Button
              onClick={cancelLogout}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { xs: "auto", sm: 100 },
                minHeight: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                borderColor: "#6b7280",
                color: "#ffffff",
                bgcolor: "#6b7280",
                "&:hover": {
                  borderColor: "#6b7280",
                  bgcolor: "#6b7280",
                },
                px: { xs: 1, sm: 2.5 },
                fontSize: { xs: "11px", sm: "12px" },
                py: 0.5,
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={confirmLogout}
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { xs: "auto", sm: 100 },
                minHeight: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                background: "linear-gradient(135deg, #E85D26, #E85D26)",
                color: "#ffffff",
                "&:hover": {
                  background: "linear-gradient(135deg, #D65A00, #D65A00)",
                },
                boxShadow: "0 4px 15px rgba(232, 93, 38, 0.3)",
                px: { xs: 1, sm: 2.5 },
                fontSize: { xs: "11px", sm: "12px" },
                py: 0.5,
              }}
              startIcon={
                <LogoutIcon sx={{ fontSize: { xs: 13, sm: 17 } }} />
              }
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
