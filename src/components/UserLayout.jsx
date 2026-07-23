import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./Sidebar";
import TopNav from "./Navbar";
import MobileBottomNav from "../pages/MobileBottomNav";

const TOPBAR_HEIGHT = 50;
const BOTTOMNAV_HEIGHT = 56;

const UserLayout = () => {
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        bgcolor: "#fbfaf8ff",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: `${TOPBAR_HEIGHT}px`,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <TopNav onMenuClick={() => setMobileOpen(true)} />
      </Box>

      {/* Body */}
      <Box
        sx={{
          width: "100%",
          height: `calc(100dvh - ${TOPBAR_HEIGHT}px - ${
            isMobile ? BOTTOMNAV_HEIGHT : 0
          }px)`,
          mt: `${TOPBAR_HEIGHT}px`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Box 1 */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            px: {
              xs: 0,
              // sm: "2%",
              // md: "3%",
              lg: "1%",
            },
            boxSizing: "border-box",
          }}
        >
          {/* Box 2 */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "100%", sm: "1800px" },
              height: "100%",
              py: { xs: 1, sm: 2 },
              mx: "auto", // explicit centering, don't rely only on parent flex
            }}
          >
            {/* Box 3 */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "20% 80%",
                },
                gap: {
                  xs: 0,
                  lg: "2%",
                },
                alignItems: "start",
                justifyContent: "center",
              }}
            >
              {/* Desktop Sidebar */}
              {isDesktop ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "98%",
                    overflowY: "auto",
                  }}
                >
                  <Sidebar />
                </Box>
              ) : (
                <Drawer
                  anchor="left"
                  open={mobileOpen}
                  onClose={() => setMobileOpen(false)}
                  PaperProps={{
                    sx: {
                      width: "70%",
                      maxWidth: 280,
                      mt: `${TOPBAR_HEIGHT}px`,
                      height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
                    },
                  }}
                >
                  <Sidebar onItemClick={() => setMobileOpen(false)} isMobile />
                </Drawer>
              )}

              {/* Outlet */}
              <Box
                component="main"
                sx={{
                  width: "100%",
                  minWidth: 0,
                  height: "100%",
                  overflowY: "auto",
                  pb: 4,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "100%" },
                    mx: "auto", // explicit centering for the outlet content too
                    p: { xs: 1, sm: 2, md: 3 },
                  }}
                >
                  <Outlet />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Bar */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${BOTTOMNAV_HEIGHT}px`,
            zIndex: theme.zIndex.appBar,
            bgcolor: "#fff",
          }}
        >
          <MobileBottomNav />
        </Box>
      )}
    </Box>
  );
};

export default UserLayout;