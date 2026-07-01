// import { Box, Skeleton } from "@mui/material";
// import { useState } from "react";

// const CommunityImage = ({ src }) => {
//   const [loaded, setLoaded] = useState(false);

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         height: 360,
//         position: "relative",
//         overflow: "hidden",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       {!loaded && (
//         <Skeleton
//           variant="rectangular"
//           width="100%"
//           height={360}
//           animation="wave"
//         />
//       )}

//       <Box
//         component="img"
//         src={src}
//         loading="lazy"
//         onLoad={() => setLoaded(true)}
//         sx={{
//           maxWidth: "100%",
//           maxHeight: 600,
//           width: "auto",
//           height: "auto",
//           objectFit: "contain",
//           alignItems: 'center',
//           display: "block",
//           opacity: loaded ? 1 : 0.4,
//           filter: loaded ? "blur(0px)" : "blur(8px)",
//           transition: "opacity 0.3s ease, filter 0.3s ease",
//         }}
//       />
//     </Box>
//   );
// };

// export default CommunityImage;


// // width: "100%",
// //     aspectRatio: "16/9",
// //     overflow: "hidden",

import { useState } from "react";
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
        onClose={() => setOpen(false)}
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
              lg: 900,
            },

            height: {
              xs: "60vh",
              sm: 400,
              md: 500,
              lg: 600,
            },

            m: 2,
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={() => setOpen(false)}
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
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={src}
            alt="Preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Change to "cover" if you want it to fill the modal
              display: "block",
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommunityImage;