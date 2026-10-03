import { useState, useRef } from "react";
import {
  Box,
  Skeleton,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const CommunityImage = ({ src }) => {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const lastTapRef = useRef(0);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });

  const isMobile = useMediaQuery("(max-width: 767px)");


  const zoomAtPoint = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setOrigin(`${x}% ${y}%`);

    setZoomed((prev) => {
      if (prev) {
      
        setPosition({ x: 0, y: 0 });
        isDraggingRef.current = false;

        return false;
      }

      return true;
    });
  };


  const handleDoubleClick = (e) => {

    if (isMobile) return;

    zoomAtPoint(e.clientX, e.clientY, e.currentTarget);
  };

  const handleTouchEnd = (e) => {

    if (!isMobile) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      const touch = e.changedTouches[0];

      zoomAtPoint(
        touch.clientX,
        touch.clientY,
        e.currentTarget
      );

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };


  const handleMouseDown = (e) => {
  
    if (isMobile || !zoomed) return;

    e.preventDefault();

    isDraggingRef.current = true;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    startPositionRef.current = {
      ...position,
    };
  };

  const handleMouseMove = (e) => {
    
    if (isMobile || !isDraggingRef.current || !zoomed) {
      return;
    }

    const deltaX =
      e.clientX - dragStartRef.current.x;

    const deltaY =
      e.clientY - dragStartRef.current.y;

    setPosition({
      x: startPositionRef.current.x + deltaX,
      y: startPositionRef.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    if (isMobile) return;

    isDraggingRef.current = false;
  };


  const handleClose = () => {
    setOpen(false);
    setZoomed(false);
    setPosition({ x: 0, y: 0 });
    setOrigin("center center");
    lastTapRef.current = 0;
    isDraggingRef.current = false;
  };

  return (
    <>
      
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
            filter: loaded
              ? "blur(0px)"
              : "blur(8px)",
            transition:
              "opacity .3s ease, filter .3s ease",
          }}
        />
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return;
          }

          handleClose();
        }}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "hidden",
              width: "auto",
              maxWidth: "95vw",
              maxHeight: "95vh",
              m: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            maxWidth: "95vw",
            maxHeight: "95vh",
            bgcolor: "#000",
            borderRadius: 2,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: {
                xs: 4,
                sm: 6,
                md: 8,
              },
              right: {
                xs: 4,
                sm: 6,
                md: 8,
              },
              width: {
                xs: 25,
                sm: 30,
                md: 35,
              },
              height: {
                xs: 25,
                sm: 30,
                md: 35,
              },
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
              zIndex: 10,
            }}
          >
            <CloseIcon
              sx={{
                fontSize: {
                  xs: 16,
                  sm: 18,
                  md: 20,
                },
              }}
            />
          </IconButton>

          <DialogContent
            sx={{
              p: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#000",
              overflow: "hidden",
              maxWidth: "95vw",
              maxHeight: "95vh",
            }}
          >
            <Box
              component="img"
              src={src}
              alt="Post"

              onDoubleClick={handleDoubleClick}

              onTouchEnd={handleTouchEnd}

              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}

              sx={{
                display: "block",

                maxWidth: zoomed
                  ? "none"
                  : "95vw",

                maxHeight: zoomed
                  ? "none"
                  : "90vh",

                width: "auto",
                height: "auto",

                objectFit: "contain",

                borderRadius: 2,

                cursor: isMobile
                  ? zoomed
                    ? "default"
                    : "zoom-in"
                  : zoomed
                  ? isDraggingRef.current
                    ? "grabbing"
                    : "grab"
                  : "zoom-in",

                transform: zoomed
                  ? `translate(${position.x}px, ${position.y}px) scale(2.5)`
                  : "translate(0px, 0px) scale(1)",

                transformOrigin: origin,

                transition: isDraggingRef.current
                  ? "none"
                  : "transform 0.25s ease",

                userSelect: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation",
              }}
            />
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};

export default CommunityImage;