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

  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center center");

  // Pan position
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const lastTapRef = useRef(0);

  // Drag refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const startPositionRef = useRef({ x: 0, y: 0 });

  // -----------------------------
  // Zoom
  // -----------------------------

  const zoomAtPoint = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect();

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setOrigin(`${x}% ${y}%`);

    setZoomed((prev) => {
      if (prev) {
        // Zoom out
        setPosition({ x: 0, y: 0 });
        return false;
      }

      return true;
    });
  };

  // Desktop double click
  const handleDoubleClick = (e) => {
    zoomAtPoint(e.clientX, e.clientY, e.currentTarget);
  };

  // Mobile double tap
  const handleTouchEnd = (e) => {
    // Don't treat dragging as double tap
    if (isDraggingRef.current) {
      return;
    }

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

  // -----------------------------
  // Mouse Drag
  // -----------------------------

  const handleMouseDown = (e) => {
    if (!zoomed) return;

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
    if (!isDraggingRef.current || !zoomed) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setPosition({
      x: startPositionRef.current.x + deltaX,
      y: startPositionRef.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // -----------------------------
  // Touch Drag
  // -----------------------------

  const handleTouchStart = (e) => {
    if (!zoomed) return;

    const touch = e.touches[0];

    isDraggingRef.current = false;

    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    startPositionRef.current = {
      ...position,
    };
  };

  const handleTouchMove = (e) => {
    if (!zoomed) return;

    const touch = e.touches[0];

    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    // Only consider it a drag after moving
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDraggingRef.current = true;
    }

    if (!isDraggingRef.current) return;

    e.preventDefault();

    setPosition({
      x: startPositionRef.current.x + deltaX,
      y: startPositionRef.current.y + deltaY,
    });
  };

  const handleTouchCancel = () => {
    isDraggingRef.current = false;
  };

  // -----------------------------
  // Close
  // -----------------------------

  const handleClose = () => {
    setOpen(false);
    setZoomed(false);
    setPosition({ x: 0, y: 0 });
    setOrigin("center center");
    lastTapRef.current = 0;
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
        onClose={handleClose}
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
              top: 8,
              right: 8,
              color: "#fff",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
              zIndex: 10,
            }}
          >
            <CloseIcon />
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

              /* Zoom */
              onDoubleClick={handleDoubleClick}
              onTouchEnd={handleTouchEnd}

              /* Mouse drag */
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}

              /* Touch drag */
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchCancel={handleTouchCancel}

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

                cursor: zoomed
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

                // Important for touch dragging
                touchAction: zoomed
                  ? "none"
                  : "manipulation",
              }}
            />
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};

export default CommunityImage;

