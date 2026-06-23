import { Box, Skeleton } from "@mui/material";
import { useState } from "react";

const CommunityImage = ({ src }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        height: 360,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!loaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={360}
          animation="wave"
        />
      )}

      <Box
        component="img"
        src={src}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        sx={{
          maxWidth: "100%",
          maxHeight: 600,
          width: "auto",
          height: "auto",
          objectFit: "contain",
          alignItems: 'center',
          display: "block",
          opacity: loaded ? 1 : 0.4,
          filter: loaded ? "blur(0px)" : "blur(8px)",
          transition: "opacity 0.3s ease, filter 0.3s ease",
        }}
      />
    </Box>
  );
};

export default CommunityImage;


// width: "100%",
//     aspectRatio: "16/9",
//     overflow: "hidden",