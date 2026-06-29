import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        width: "100%",
        bgcolor: "#fffaf4",
        borderTop: "1px solid #f1e4d7",
      }}
    >
      <Divider />

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 3,
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 1.5,
          }}
        >
          <DirectionsCarFilledRoundedIcon
            sx={{
              color: "#fff",
              fontSize: 28,
            }}
          />
        </Box>

        {/* App Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#8b5e3c",
          }}
        >
          Saathi
        </Typography>

        {/* Tagline */}
        <Typography
          sx={{
            mt: 1,
            color: "#8f6d56",
            fontSize: 13,
          }}
        >
          Connecting people through trusted rides & referrals.
        </Typography>

        {/* Version */}
        <Typography
          sx={{
            mt: 2,
            fontSize: 12,
            color: "#d97706",
            fontWeight: 600,
          }}
        >
          Version 1.0.0
        </Typography>

        {/* Copyright */}
        <Typography
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
            color: "#8f6d56",
            fontSize: 12,
          }}
        >
          Made with
          <FavoriteRoundedIcon
            sx={{
              color: "#ef4444",
              fontSize: 16,
            }}
          />
          by Saathi Team
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 11,
            color: "#a98a73",
          }}
        >
          © 2026 Saathi. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}