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
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Sidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            px: 3,
            pt : 1,
            overflowY: "auto",
            height: "100vh",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default UserLayout;