import { Box, Drawer, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./Navbar";
import { useEffect, useState } from "react";
import MobileBottomNav from "../pages/MobileBottomNav";

const TOPBAR_HEIGHT = 56;
const BOTTOMNAV_HEIGHT = 56;

// Percentages of viewport width for the 3-column technical layout
const SIDEBAR_WIDTH_PCT = 18;
const OUTLET_WIDTH_PCT = 50;
const RAIL_WIDTH_PCT = 22;
// Remaining 10% splits as outer gutters, centering the content block

const UserLayout = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // 1024+
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const railTotalPct = SIDEBAR_WIDTH_PCT + OUTLET_WIDTH_PCT + RAIL_WIDTH_PCT;

  return (
    <Box
      sx={{
        height: "100dvh",
        width: "100vw",
        // overflow: "hidden"
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 0, md: 0 },
        }}
      >
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <TopNav onMenuClick={() => setMobileOpen(true)} />
        </Box>
      </Box>

      {/* Body: centered wrapper containing sidebar + outlet + rail */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "100%",
          pt: `${TOPBAR_HEIGHT}px`,
          pb: isMobile ? `${BOTTOMNAV_HEIGHT}px` : 0,
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: { lg: `${railTotalPct}%` },
            maxWidth: "100%",
            height: "100%",
          }}
        >
          {isDesktop ? (
            <Box
              component="nav"
              sx={{
                width: `${(SIDEBAR_WIDTH_PCT / railTotalPct) * 100}%`,
                flexShrink: 0,
                height: "100%",
                // borderRight: `1px solid #f3eae2`,
                overflowY: "auto",
                ml: -1
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
                  width: "72%",
                  maxWidth: 280,
                  mt: `${TOPBAR_HEIGHT}px`,
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
              px: { xs: 1, sm: 2, md: 3 },
              pt: 2,
              pb: 1,

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