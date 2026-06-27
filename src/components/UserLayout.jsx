import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./Navbar";


const UserLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#fbfaf8ff",
        overflow: "hidden",
      }}
    >
      {/* Top Navigation */}
      <TopNav onMenuClick={() => setMobileOpen(true)} />

      {/* Content Area */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Desktop Sidebar */}
        {isDesktop && <Sidebar />}

        {/* Mobile Sidebar */}
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
            <Sidebar
              isMobile
              onItemClick={() => setMobileOpen(false)}
            />
          </Drawer>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 1.5, sm: 2, md: 3 },
            pt: 1.5,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;