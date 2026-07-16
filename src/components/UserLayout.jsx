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

  // Sidebar becomes a permanent column at lg+, a Drawer below that.
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  // Bottom nav now matches the same threshold as the Drawer, so there's
  // never a gap where the sidebar is hidden AND there's no bottom nav
  // to reach it from (previously true between "md" and "lg").
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
          height: `calc(100dvh - ${TOPBAR_HEIGHT}px - ${isMobile ? BOTTOMNAV_HEIGHT : 0
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
            // Scales up gradually instead of jumping straight from 0 to 5%
            // only at "lg" — tablets now get some breathing room too.
            px: {
              xs: 0,
              sm: "2%",
              md: "3%",
              lg: "5%",
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
                  <Sidebar
                    onItemClick={() => setMobileOpen(false)}
                    isMobile
                  />
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
                  pb: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "1400px" },
                    // A touch more breathing room as the screen grows,
                    // instead of a flat p:1 at every size below "sm".
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

{/* <Box> */ }
// import {Box, Drawer, useMediaQuery} from "@mui/material";
// import {useTheme} from "@mui/material/styles";
// import {Outlet} from "react-router-dom";
// import Sidebar from "./Sidebar";
// import TopNav from "./Navbar";
// import {useState} from "react";
// import MobileBottomNav from "../pages/MobileBottomNav";

// const TOPBAR_HEIGHT = 64; // adjust to match your TopNav's actual height
// const BOTTOMNAV_HEIGHT = 56; // adjust to match your MobileBottomNav's actual height
// const SIDEBAR_WIDTH = 250;

// const UserLayout = () => {
//   const theme = useTheme();
//   const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // 1024+
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   return (
//     <Box
//       sx={{
//         height: "100dvh",
//         bgcolor: "#fbfaf8ff",
//         overflow: "hidden",
//         display:'flex',
//         alignItems:'center',
//         justifyContent:'center'
//       }}
//     >
//       {/* Fixed Top Bar */}
//       <Box
//         sx={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: TOPBAR_HEIGHT,
//           zIndex: theme.zIndex.appBar,
//         }}
//       >
//         <TopNav onMenuClick={() => setMobileOpen(true)} />
//       </Box>

//       {/* Body: sidebar + outlet, side by side, offset below fixed topbar */}
//       <Box
//         sx={{
//           display: "flex",
//           height: "100%",
//           pt: `${TOPBAR_HEIGHT}px`,
//           pb: isMobile ? `${BOTTOMNAV_HEIGHT}px` : 0,
//           boxSizing: "border-box",
//         }}
//       >
//         {isDesktop ? (
//           <Box
//             sx={{
//               width: SIDEBAR_WIDTH,
//               flexShrink: 0,
//               borderRight: "1px solid #f1e4d7",
//               overflowY: "auto",
//               height: "100%",
//             }}
//           >
//             <Sidebar />
//           </Box>
//         ) : (
//           <Drawer
//             anchor="left"
//             open={mobileOpen}
//             onClose={() => setMobileOpen(false)}
//             PaperProps={{
//               sx: {
//                 width: SIDEBAR_WIDTH,
//                 borderRight: "1px solid #f1e4d7",
//                 mt: `${TOPBAR_HEIGHT}px`, // sit below fixed topbar
//                 height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
//               },
//             }}
//           >
//             <Sidebar onItemClick={() => setMobileOpen(false)} isMobile />
//           </Drawer>
//         )}

//         <Box
//           component="main"
//           sx={{
//             flex: 1,
//             minWidth: 0,
//             overflowY: "auto",
//             height: "100%",
//             px: { xs: 1.5, sm: 2, md: 3 },
//             pt: 1.5,
//             pb: 2,
//           }}
//         >
//           <Outlet />
//         </Box>
//       </Box>

//       {/* Fixed Mobile Bottom Bar */}
//       {isMobile && (
//         <Box
//           sx={{
//             position: "fixed",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             height: BOTTOMNAV_HEIGHT,
//             zIndex: theme.zIndex.appBar,
//           }}
//         >
//           <MobileBottomNav />
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default UserLayout;
// </Box >