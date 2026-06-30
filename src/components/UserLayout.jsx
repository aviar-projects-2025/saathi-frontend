import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./Navbar";
import { useState } from "react";
import MobileBottomNav from "../pages/MobileBottomNav";

const UserLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // 1024+
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fbfaf8ff",
        overflow: "hidden",
      }}
    >
      <TopNav onMenuClick={() => setMobileOpen(true)} />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {isDesktop && <Sidebar />}

        {!isDesktop && (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{
              sx: {
                width: 250,
                borderRight: "1px solid #f1e4d7",
              },
            }}
          >
            <Sidebar onItemClick={() => setMobileOpen(false)} isMobile />
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1.5, sm: 2, md: 3 },
            pt: 1.5,
            pb: { xs: "50px", sm: 2 }, // Prevent content from hiding behind navbar
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {isMobile && <MobileBottomNav />}
    </Box>
  );
};

export default UserLayout;