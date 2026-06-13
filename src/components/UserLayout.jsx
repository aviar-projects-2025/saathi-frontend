import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

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
    <Box sx={{ display: "flex" }}>
      <Sidebar/>
      <Box component="main" sx={{ flex: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;