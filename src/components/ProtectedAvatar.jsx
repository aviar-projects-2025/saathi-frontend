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
  ...rest // pass through anything else (e.g. imgProps, variant, etc.)
}) {
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Split sx so we can apply structural styles to the wrapper,
  // and let the Avatar pick up colors, font, border, etc.
  return (
    <Box
      onContextMenu={blockEvent}
      onDragStart={blockEvent}
      onCopy={blockEvent}
      onCut={blockEvent}
      onClick={onClick}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserDrag: "none",
        flexShrink: 0,
        ...(sx.width != null ? { width: sx.width } : {}),
        ...(sx.height != null ? { height: sx.height } : {}),
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <Avatar
        src={src || ""}
        alt={alt || "Profile"}
        onContextMenu={blockEvent}
        onDragStart={blockEvent}
        sx={{
          width: "100%",
          height: "100%",
          // pass through visual sx props:
          bgcolor: sx.bgcolor,
          color: sx.color,
          fontFamily: sx.fontFamily,
          fontSize: sx.fontSize,
          fontWeight: sx.fontWeight,
          border: sx.border,
          borderRadius: sx.borderRadius,
          boxShadow: sx.boxShadow,
          // ★ kill all direct interaction with the <img>
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
        }}
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