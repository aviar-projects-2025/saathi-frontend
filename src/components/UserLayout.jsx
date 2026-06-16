import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const userMenus = [
  { label: "Home", path: "/home" },
  { label: "Find Ride", path: "/find" },
  { label: "Offer Ride", path: "/offerRide" },
  { label: "My Rides", path: "/myRide" },
  { label: "Community", path: "/community" },
  { label: "Profile", path: "/profile" },
  { label: "Notifications", path: "/notification" },
];

const UserLayout = () => {
  return (
    <Box
      sx={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Sidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 3,
            pt: 1,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;