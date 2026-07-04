
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  Button,
  Avatar,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import saathilogo1 from "../assets/saathilogo1.png";
import { useUser } from "../context/userConetext.jsx";
import NotificationTab from "../pages/NotificationTab.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

const TopNav = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const { tabNotification } = useNotifications();
  const unreadCount = tabNotification?.filter(n => !n.isRead).length;

  console.log(tabNotification.length, 'tabNotification')
  const { completion, currentUser } = useUser();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const openNotifications = Boolean(anchorEl);

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

          <Box sx={{ display: "flex", alignItems: "center", cursor: 'pointer' }} >
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
                  color: openNotifications ? '#f97316' : '#5f4632', // ✅ FIXED
                  transition: '0.2s'
                }}
              />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
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
            <Typography sx={{ pl: 2, fontSize: 14, }}>
              Notifications
            </Typography>
            <Box sx={{
              display: "flex",
              flexDirection: 'column',
              justifyContent: "center",
              alignItems: "center",
              width: 320,
              p: 1,
              maxHeight: 400,
              overflowY: "auto"
            }}>
              <NotificationTab />
              {tabNotification.length > 0 &&
                <Typography sx={{ fontSize: 14, position: 'absolute', bottom: 1 }}>
                  <KeyboardDoubleArrowUpIcon />
                  Scroll to see more
                </Typography>
              }
            </Box>
          </Menu>

          <Button

            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
            sx={{
              display: { xs: "none", sm: "flex" },
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#f97316",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Post Ride
          </Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
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
              Post a Ride

              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "grey.600",
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{
              display: "flex",
              justifyContent: "center",
            }}>
              <OfferRide />

            </DialogContent>
          </Dialog>

          {/* <IconButton
            component={Link}
            to="/offer-ride"
            sx={{
              display: { xs: "inline-flex", sm: "none" },
              border: "1px solid #f97316",
              borderRadius: 2,
              color: "#d97706",
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton> */}

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
                }}
              >
                {!currentUser?.profileImage && (currentUser?.firstName?.[0] || "U")}
              </Avatar>
            </Box>
          </Stack>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;