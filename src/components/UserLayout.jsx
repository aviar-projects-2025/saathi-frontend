
import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./Navbar";
import { useState } from "react";
import MobileBottomNav from "../pages/MobileBottomNav";

const TOPBAR_HEIGHT = 64; // adjust to match your TopNav's actual height
const BOTTOMNAV_HEIGHT = 56; // adjust to match your MobileBottomNav's actual height

// Percentages of viewport width
const SIDEBAR_WIDTH_PCT = 15;
const OUTLET_WIDTH_PCT = 60;
// Remaining 25% is split as left/right gap (12.5% each), which centers the 75% content block

const UserLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // 1024+
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        height: "100dvh",
        bgcolor: "#fbfaf8ff",
        overflow: "hidden",
      }}
    >
      {/* Fixed Top Bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: TOPBAR_HEIGHT,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <TopNav onMenuClick={() => setMobileOpen(true)} />
      </Box>

      {/* Body: centered wrapper containing sidebar + outlet */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center", // centers the inner content block horizontally
          height: "100%",
          pt: `${TOPBAR_HEIGHT}px`,
          pb: isMobile ? `${BOTTOMNAV_HEIGHT}px` : 0,
          boxSizing: "border-box",
        }}
      >
        {/* Inner content block: sidebar% + outlet% = 75% of viewport, centered */}
        <Box
          sx={{
            display: "flex",
            width: { lg: `${SIDEBAR_WIDTH_PCT + OUTLET_WIDTH_PCT}%` }, // 75% on desktop
            height: "100%",
            gap: 1, // visual gap between sidebar and outlet
          }}
        >
          {isDesktop ? (
            <Box
              sx={{
                width: `${(SIDEBAR_WIDTH_PCT / (SIDEBAR_WIDTH_PCT + OUTLET_WIDTH_PCT)) * 100}%`,
                flexShrink: 0,
                // borderRight: "1px solid #f1e4d7",
                // overflowY: "auto",
                height: "100%",
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
                  borderRight: "1px solid #f1e4d7",
                  mt: `${TOPBAR_HEIGHT}px`, // sit below fixed topbar
                  height: `calc(100% - ${TOPBAR_HEIGHT}px)`,
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
              minWidth: 0,
              overflowY: "auto",
              height: "100%",
              px: { xs: 1, sm: 1.5, md: 2 },
              pt: 2,
              pb: 5,
              width: "100%",
              // maxWidth: "1500px",
              mx: "auto",
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>

      {/* Fixed Mobile Bottom Bar */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOMNAV_HEIGHT,
            zIndex: theme.zIndex.appBar,
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