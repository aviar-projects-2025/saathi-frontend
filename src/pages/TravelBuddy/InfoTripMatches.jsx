import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  Avatar,
  Typography,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
/* ---------- Theme ---------- */
const colors = {
  bg: "#FAF8F4",
  navy: "#10255A",
  green: "#14653A",
  greenLight: "#DDF7E6",
  red: "#BF1E1E",
  orange: "#D4410F",
  blueTint: "#D9EEFB",
  blueText: "#0B5C8E",
  border: "#E4E1DA",
  muted: "#6B6B6B",
};

const theme = createTheme({
  palette: {
    background: { default: colors.bg },
    primary: { main: colors.navy },
    success: { main: colors.green },
    error: { main: colors.red },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
});

/* ---------- Sample data (replace with props / API data) ---------- */
const trip = {
  title: "Mother's trip",
  status: "Matched",
  date: "Sat 10/17/2026",
  total: "25 h 30 m",
  layover: "Layover 2 h 10 m in Dubai",
  legs: [
    { flight: "EK 544", route: "MAA 5:00 AM IST → DXB 7:30 AM GST" },
    { flight: "EK 235", route: "DXB 9:40 AM GST → ORD 8:00 PM CDT" },
  ],
  pickup: "Pickup: family member meeting at ORD arrivals.",
  companion: {
    name: "Lakshmi V.",
    initials: "LV",
    phone: "+1 (555) 010-0188",
    languages: "Tamil, English",
  },
};

/* ---------- Small helpers ---------- */
const SectionLabel = ({ children, color = colors.muted }) => (
  <Typography
    sx={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color,
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
);

const cardSx = {
  p: 2.5,
  borderRadius: 2,
  border: `1px solid ${colors.border}`,
  bgcolor: "#fff",
  boxShadow: "none",
};

/* ---------- Component ---------- */
export default function TripMatched({
  data = trip,
  onBack,
  onCall,
  onText,
  onAddRide,
  onArrived,
  onNeedHelp,
  onRate,
  onReport,
  onCancel,
}) {
  const [checkIn, setCheckIn] = useState(null); // null | "arrived" | "help"
      const navigate = useNavigate();
    const handleBack = onBack ?? (() => navigate(-1));
  const handleArrived = () => {
    setCheckIn("arrived");
    onArrived?.();
  };
  const handleHelp = () => {
    setCheckIn("help");
    onNeedHelp?.();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 2.5 }}>
        <Box sx={{ maxWidth: 860, mx: "auto" }}>
          {/* Back link */}
          <Link
            component="button"
            underline="none"
            onClick={handleBack}
            sx={{ color: colors.orange, fontWeight: 700, fontSize: 14, mb: 2 }}
          >
            Back to Travel Buddy
          </Link>

          {/* Title row */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Typography
              component="h1"
              sx={{ fontSize: 26, fontWeight: 700, color: colors.navy }}
            >
              {data.title} · {data.status}
            </Typography>
            <Box sx={{marginLeft:"40%"}}>
            <Chip
              label="COMPANION ACCEPTED"
              size="small"
              sx={{
                bgcolor: colors.greenLight,
                color: colors.green,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 0.3,
              }}
            />
            </Box>
          </Stack>

          {/* Journey + Companion */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            {/* Journey */}
            <Paper sx={cardSx}>
              <SectionLabel>Journey (local times)</SectionLabel>

              <Stack spacing={1.25}>
                <Typography sx={{ fontSize: 14 }}>
                  <b>{data.legs[0].flight}</b>&nbsp;&nbsp;{data.legs[0].route}
                </Typography>
                <Typography sx={{ fontSize: 14, color: colors.muted }}>
                  {data.layover}
                </Typography>
                <Typography sx={{ fontSize: 14 }}>
                  <b>{data.legs[1].flight}</b>&nbsp;&nbsp;{data.legs[1].route}
                </Typography>
                <Typography sx={{ fontSize: 14, color: colors.muted }}>
                  Total {data.total} · {data.date}
                </Typography>
              </Stack>

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: colors.blueTint,
                  color: colors.blueText,
                  fontSize: 13,
                }}
              >
                {data.pickup}{" "}
                <Link
                  component="button"
                  onClick={onAddRide}
                  sx={{
                    color: colors.blueText,
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "left",
                    verticalAlign: "baseline",
                  }}
                >
                  Or add an airport-pickup ride
                </Link>
              </Box>
            </Paper>

            {/* Companion */}
            <Paper sx={cardSx}>
              <SectionLabel>Companion</SectionLabel>

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: colors.greenLight,
                    color: colors.green,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {data.companion.initials}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                    {data.companion.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.muted }}>
                    {data.companion.phone} · {data.companion.languages}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={onCall}
                  sx={{
                    bgcolor: colors.green,
                    "&:hover": { bgcolor: "#0F4F2D" },
                    boxShadow: "none",
                    py: 1,
                  }}
                >
                  Call
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onText}
                  sx={{
                    color: colors.green,
                    borderColor: colors.green,
                    borderWidth: 2,
                    py: 1,
                    "&:hover": { borderWidth: 2, borderColor: colors.green },
                  }}
                >
                  Text
                </Button>
              </Stack>

              <Typography sx={{ fontSize: 12, color: colors.muted, mt: 1.5 }}>
                Contact visible only for this trip. Ends 7 days after arrival.
              </Typography>
            </Paper>
          </Box>

          {/* Arrival check-in */}
          <Paper
            sx={{
              ...cardSx,
              border: `2px solid ${colors.orange}`,
              mb: 2,
            }}
          >
            <SectionLabel color={colors.orange}>
              Arrival check-in (text sent at arrival + 1 hour)
            </SectionLabel>

            <Typography sx={{ fontSize: 15, mb: 1.5 }}>
              {checkIn === "arrived"
                ? "Thanks — Mother arrived safely. Please leave a rating."
                : checkIn === "help"
                ? "Help is on the way. A moderator and the family contact have been notified."
                : "Did Mother reach her pickup safely?"}
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
              <Button
                variant="contained"
                onClick={handleArrived}
                disabled={checkIn !== null}
                sx={{
                  bgcolor: colors.green,
                  "&:hover": { bgcolor: "#0F4F2D" },
                  boxShadow: "none",
                  px: 3,
                  py: 1.1,
                }}
              >
                Arrived safely
              </Button>
              <Button
                variant="contained"
                onClick={handleHelp}
                disabled={checkIn !== null}
                sx={{
                  bgcolor: colors.red,
                  "&:hover": { bgcolor: "#9E1818" },
                  boxShadow: "none",
                  px: 3,
                  py: 1.1,
                }}
              >
                Need help
              </Button>
            </Stack>

            <Typography sx={{ fontSize: 12, color: colors.muted }}>
              "Need help" creates an urgent moderator item and texts the family
              contact. No reply after 2 hours also escalates. After "Arrived
              safely", both sides are asked to leave a rating.
            </Typography>
          </Paper>

          {/* Footer actions */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={onRate}
              sx={{
                bgcolor: colors.navy,
                "&:hover": { bgcolor: "#0B1A42" },
                boxShadow: "none",
              }}
            >
              Rate {data.companion.name.split(" ")[0]}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={onReport}
              sx={{ borderColor: colors.red, color: colors.red }}
            >
              Report
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                color: "#333",
                borderColor: colors.border,
                bgcolor: "#F3F1EC",
                fontWeight: 600,
              }}
            >
              Cancel match
            </Button>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
