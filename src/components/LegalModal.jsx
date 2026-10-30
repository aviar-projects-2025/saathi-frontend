import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const RUST = "#C83F08";
const TEXT_PRIMARY = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BG = "#FAF8F5";

export default function LegalModal({ open, onClose, title, content }) {
  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2.5 },
          m: { xs: 0, sm: 3 },
          maxHeight: { xs: "100vh", sm: "90vh" },
          bgcolor: "#fff",
          overflow: "hidden",
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: { xs: 2, sm: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #E5E7EB",
          bgcolor: "#F9FAFB",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 22 },
              fontWeight: 800,
              color: TEXT_PRIMARY,
              letterSpacing: -0.3,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: TEXT_MUTED, mt: 0.5 }}>
            Last updated: October 29, 2026
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: TEXT_MUTED,
            bgcolor: "#fff",
            border: "1px solid #E5E7EB",
            "&:hover": { bgcolor: "#F3F4F6", color: RUST },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 4, md: 5 }, bgcolor: BG }}>
        <Box
          sx={{
            maxWidth: 720,
            mx: "auto",
            bgcolor: "#fff",
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            border: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            "& h1": { fontSize: 24, fontWeight: 800, color: TEXT_PRIMARY, mt: 0, mb: 2 },
            "& h2": { fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, mt: 4, mb: 1.5 },
            "& h3": { fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, mt: 3, mb: 1 },
            "& p": { fontSize: 15, color: "#374151", lineHeight: 1.7, mb: 2 },
            "& ul": { pl: 3, mb: 2 },
            "& li": { fontSize: 15, color: "#374151", lineHeight: 1.7, mb: 0.75 },
            "& strong": { fontWeight: 700, color: TEXT_PRIMARY },
          }}
        >
          {content}
        </Box>
      </DialogContent>
    </Dialog>
  );
}