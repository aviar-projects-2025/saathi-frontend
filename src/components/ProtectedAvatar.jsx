import React from "react";
import { Avatar, Box } from "@mui/material";

/**
 * ProtectedAvatar
 * Drop-in replacement for MUI <Avatar src="..." />
 * Blocks right-click, drag-save, mobile long-press save menu, and text selection
 * while preserving onClick, alt text, initials fallback, and all MUI Avatar props.
 */
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

  // --- Sizing ---
  const width = sx.width ?? 40;
  const height = sx.height ?? 40;

  // --- Positioning (applied to the wrapper, NOT the inner Avatar) ---
  const positioningSx = {
    position: sx.position,
    top: sx.top,
    left: sx.left,
    right: sx.right,
    bottom: sx.bottom,
    transform: sx.transform,
    zIndex: sx.zIndex,
  };

  // --- Centering helpers (go on wrapper so mx:"auto" works) ---
  const spacingSx = {
    mx: sx.mx,
    my: sx.my,
    mt: sx.mt,
    mb: sx.mb,
    ml: sx.ml,
    mr: sx.mr,
  };

  // --- Visual styles (go on the Avatar itself) ---
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

  return (
    <Box
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
      onCopy={blockEvent}
      onCut={blockEvent}
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height,
        flexShrink: 0,
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

      {/* Transparent overlay — catches clicks, right-clicks, long-press */}
      <Box
        onClick={onClick}
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          zIndex: 1,
          cursor: onClick ? "pointer" : "default",
        }}
      />
    </Box>
  );
}