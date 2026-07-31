
// import { useState } from "react";
// import {
//   Box,
//   Skeleton,
//   Dialog,
//   DialogContent,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// const CommunityImage = ({ src }) => {
//   const [loaded, setLoaded] = useState(false);
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       {/* Thumbnail */}
//       <Box
//         onClick={() => setOpen(true)}
//         sx={{
//           width: "100%",
//           position: "relative",
//           overflow: "hidden",
//           cursor: "pointer",
//         }}
//       >
//         {!loaded && (
//           <Skeleton
//             variant="rectangular"
//             width="100%"
//             height={300}
//             animation="wave"
//             sx={{
//               position: "absolute",
//               inset: 0,
//             }}
//           />
//         )}

//         <Box
//           component="img"
//           src={src}
//           loading="lazy"
//           alt="Community"
//           onLoad={() => setLoaded(true)}
//           sx={{
//             width: "100%",
//             height: "auto",
//             display: "block",
//             opacity: loaded ? 1 : 0,
//             filter: loaded ? "blur(0px)" : "blur(8px)",
//             transition: "opacity .3s ease, filter .3s ease",
//           }}
//         />
//       </Box>

//       {/* Preview Dialog */}
//       <Dialog
//         open={open}
//         onClose={() => setOpen(false)}
//         maxWidth={false}
//         PaperProps={{
//           sx: {
//             position: "relative",
//             bgcolor: "#111",
//             overflow: "hidden",
//             borderRadius: 2,

//             width: {
//               xs: "90vw",
//               sm: 500,
//               md: 700,
//               lg: 900,
//             },

//             height: {
//               xs: "60vh",
//               sm: 400,
//               md: 500,
//               lg: 600,
//             },

//             m: 2,
//           },
//         }}
//       >
//         {/* Close Button */}
//         <IconButton
//           onClick={() => setOpen(false)}
//           sx={{
//             position: "absolute",
//             top: 7,
//             right: 10,
//             zIndex: 2,
//             color: "rgba(0,0,0,0.8)",
//             bgcolor: "#fff",
//             "&:hover": {
//               bgcolor: "rgba(0,0,0,0.6)",
//               color: "#fff",
//             },
//           }}
//         >
//           <CloseIcon />
//         </IconButton>

//         {/* Image */}
//         <DialogContent
//           sx={{
//             p: 0,
//             width: "100%",
//             height: "100%",
//             bgcolor: "#000",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             overflow: "hidden",
//           }}
//         >
//           <Box
//             component="img"
//             src={src}
//             alt="Preview"
//             sx={{
//               width: "100%",
//               height: "100%",
//               objectFit: "contain", // Change to "cover" if you want it to fill the modal
//               display: "block",
//             }}
//           />
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default CommunityImage;

import { useState, useRef } from "react";
import {
  Box,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CommunityImage = ({ src }) => {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  // Zoom state for the preview image
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const lastTapRef = useRef(0);

  const handleDoubleTapZoom = (e) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Detect double-tap (works for touch) — also handles onDoubleClick for desktop
    if (e.type === "touchend") {
      if (timeSinceLastTap > 300 || timeSinceLastTap === now) {
        lastTapRef.current = now;
        return; // first tap, wait for second
      }
    }

    // Compute tap position relative to the image, so zoom centers on that point
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    setOrigin(`${x}% ${y}%`);
    setZoomed((prev) => !prev);
    lastTapRef.current = 0;
  };

  const handleClose = () => {
    setOpen(false);
    setZoomed(false); // reset zoom when dialog closes
  };

  return (
    <>
      {/* Thumbnail */}
      <Box
        onClick={() => setOpen(true)}
        sx={{
          width: "100%",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        {!loaded && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            animation="wave"
            sx={{
              position: "absolute",
              inset: 0,
            }}
          />
        )}

        <Box
          component="img"
          src={src}
          loading="lazy"
          alt="Community"
          onLoad={() => setLoaded(true)}
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: loaded ? 1 : 0,
            filter: loaded ? "blur(0px)" : "blur(8px)",
            transition: "opacity .3s ease, filter .3s ease",
          }}
        />
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            position: "relative",
            bgcolor: "#111",
            overflow: "hidden",
            borderRadius: 2,

            width: {
              xs: "90vw",
              sm: 500,
              md: 700,
              lg: 500,
            },

            height: {
              xs: "60vh",
              sm: 400,
              md: 500,
              lg: 500,
            },

            m: 2,
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 7,
            right: 10,
            zIndex: 2,
            color: "rgba(0,0,0,0.8)",
            bgcolor: "#fff",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.6)",
              color: "#fff",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Image */}
        <DialogContent
          sx={{
            p: 0,
            width: "100%",
            height: "100%",
            bgcolor: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // This is the key part: prevent the browser's native
            // pinch/double-tap zoom from acting on the whole page/dialog.
            touchAction: "manipulation",
            overflow: zoomed ? "auto" : "hidden",
          }}
        >
          <Box
            component="img"
            src={src}
            alt="Preview"
            onTouchEnd={handleDoubleTapZoom}
            onDoubleClick={handleDoubleTapZoom}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              cursor: zoomed ? "zoom-out" : "zoom-in",
              transformOrigin: origin,
              transform: zoomed ? "scale(2.5)" : "scale(1)",
              transition: "transform 0.25s ease",
              touchAction: "manipulation",
              userSelect: "none",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityImage;