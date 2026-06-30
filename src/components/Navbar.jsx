
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Badge,
  Button,
  Avatar,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,

} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import OfferRide from "../pages/OfferRide.jsx";
import { Link } from "react-router-dom";
import saathilogo1 from "../assets/saathilogo1.png";

const TopNav = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);

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
          <IconButton component={Link} to="/notification" sx={{ color: "#5f4632" }}>
            <Badge badgeContent={2} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          {/* <Button
            component={Link}
            to="/offer-ride"
            variant="outlined"
            startIcon={<AddIcon />}
            sx={{
              display: { xs: "none", sm: "flex" },
              textTransform: "none",
              borderRadius: 2,
              borderColor: "#f97316",
              color: "#d97706",
              fontWeight: 700,
            }}
          >
          
            Post a ride
          </Button> */}

          <Button
        
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
            sx={{
              display: { xs: "none", sm: "flex" },
              textTransform: "none",
              borderRadius: 2,
              backgroundColor:"#f97316",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Post a ride
          </Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md"
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

          <IconButton
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
          </IconButton>

          <Avatar
            sx={{
              bgcolor: "#f97316",
              width: 34,
              height: 34,
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            SA
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;