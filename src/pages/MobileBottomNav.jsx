import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/userConetext.jsx";

import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import GroupsIcon from "@mui/icons-material/Groups";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import ExploreIcon from "@mui/icons-material/Explore";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export default function MobileBottomNav() {
  const { completion } = useUser();

  const isProfileComplete = completion === 100;

  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMessage, setOpenMessage] = useState(false);

  const bottomNavItems = [
    {
      label: "Community",
      icon: <GroupsIcon />,
      link: "/community",
    },
    {
      label: "Find Ride",
      icon: <TravelExploreIcon />,
      link: "/find-ride",
      hasDropdown: true,
      dropdownOptions: [
        {
          label: "Find Rides",
          link: "/find-ride",
        },
        {
          label: "Find Request",
          link: "/request-ride",
        },
      ],
    },
    {
      label: "Post Ride",
      icon: <AddCircleIcon />,
      link: "/offer-ride",
      requiresComplete: true, // only this item is gated by profile completion
    },
    {
      label: "Discover",
      icon: <ExploreIcon />,
      link: "/discover",
    },
    {
      label: "Settings",
      icon: <SettingsIcon />,
      link: "/myprofile",
    },
  ];

  // Highlight active tab
  const currentIndex = bottomNavItems.findIndex((item) => {
    if (item.hasDropdown) {
      return (
        location.pathname === "/find-ride" ||
        location.pathname === "/request-ride"
      );
    }

    return location.pathname === item.link;
  });

  const handleNavChange = (event, newValue) => {
    const item = bottomNavItems[newValue];

    // Only "Post Ride" is blocked when profile isn't complete
    if (item.requiresComplete && !isProfileComplete) {
      setOpenMessage(true);
      return;
    }

    // Open dropdown for Find Ride
    if (item.hasDropdown) {
      setAnchorEl(event.currentTarget);
      return;
    }

    navigate(item.link);
  };

  const handleDropdownSelect = (link) => {
    setAnchorEl(null);
    navigate(link);
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <BottomNavigation
          value={currentIndex === -1 ? 0 : currentIndex}
          onChange={handleNavChange}
          showLabels
          sx={{
            width: "100%",
            height: 56,

            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              p: "8px 4px",
              gap: "4px",
            },

            "& .MuiBottomNavigationAction-label": {
              fontSize: "10px !important",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            },

            "& .MuiSvgIcon-root": {
              fontSize: 20,
            },

            "& .Mui-selected": {
              color: "#FF9933",
            },

            "& .Mui-selected .MuiBottomNavigationAction-label": {
              fontWeight: 600,
            },
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.link}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Find Ride Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {bottomNavItems
          .find((item) => item.hasDropdown)
          ?.dropdownOptions.map((option) => {
            const isActive = location.pathname === option.link;

            return (
              <MenuItem
                key={option.link}
                onClick={() => handleDropdownSelect(option.link)}
                sx={{
                  color: isActive ? "#FF9933" : "text.primary",
                  fontWeight: isActive ? 600 : 400,
                  // bgcolor: isActive ? "rgba(255, 153, 51, 0.12)" : "transparent",
                  // "&:hover": {
                  //   bgcolor: "rgba(255, 153, 51, 0.18)",
                  // },
                }}
              >
                {option.label}
              </MenuItem>
            );
          })}
      </Menu>

      {/* Alert for Post Ride only */}
      <Snackbar
        open={openMessage}
        autoHideDuration={3000}
        onClose={() => setOpenMessage(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "bottom",
        }}
      // sx={{
      //   top: { xs: 70, sm: 80 },
      // }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setOpenMessage(false)}
          sx={{ width: "100%" }}
        >
          Complete your profile to 100% before posting a ride.
        </Alert>
      </Snackbar>
    </>
  );
}