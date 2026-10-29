import React from "react";
import { Avatar, Box } from "@mui/material";

export default function ProtectedAvatar({
  src,
  alt,
  onClick,
  sx = {},
  children,
  ...rest
}) {
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const width = sx.width ?? 40;
  const height = sx.height ?? 40;

  const positioningSx = {
    position: sx.position,
    top: sx.top,
    left: sx.left,
    right: sx.right,
    bottom: sx.bottom,
    transform: sx.transform,
    zIndex: sx.zIndex,
  };

  const spacingSx = {
    mx: sx.mx,
    my: sx.my,
    mt: sx.mt,
    mb: sx.mb,
    ml: sx.ml,
    mr: sx.mr,
  };

  const avatarSx = {
    width: "100%",
    height: "100%",
    bgcolor: sx.bgcolor,
    color: sx.color,
    fontFamily: sx.fontFamily,
    fontSize: sx.fontSize,
    fontWeight: sx.fontWeight,
    border: sx.border,
    borderRadius: sx.borderRadius ?? "50%",
    boxShadow: sx.boxShadow,
    pointerEvents: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    "& img": {
      pointerEvents: "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitUserDrag: "none",
      WebkitTouchCallout: "none",
    },
  };

  const handleWrapperClick = (event) => {
    // If user clicked the wrapper itself (rare — usually they hit the overlay),
    // stop propagation and call onClick once.
    if (onClick) {
      event.stopPropagation();
      onClick(event);
    }
  };

  return (
    <Box
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
      onCopy={blockEvent}
      onCut={blockEvent}
      onClick={handleWrapperClick}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        flexShrink: 0,
        overflow: "hidden",          // ← keep the overlay inside
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserDrag: "none",
        cursor: onClick ? "pointer" : "default",
        ...positioningSx,
        ...spacingSx,
      }}
    >
      <Avatar
        src={src || ""}
        alt={alt || "Profile"}
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        sx={avatarSx}
        {...rest}
      >
        {children}
      </Avatar>

      {/* Overlay: catches clicks and stops propagation to parent card */}
      {onClick && (
        <Box
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClick(event);
          }}
          onContextMenu={blockEvent}
          onDragStart={blockEvent}
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            zIndex: 1,
            cursor: "pointer",
          }}
        />
      )}
    </Box>
  );
}