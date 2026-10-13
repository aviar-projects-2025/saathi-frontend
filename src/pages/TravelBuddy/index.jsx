import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Avatar,
  Paper,
  Stack,
  Typography,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

import FlightIcon from "@mui/icons-material/Flight";
import { useNavigate } from "react-router-dom";
const colors = {
  navy: "#1B2A5C",
  rust: "#C2410C",
  rustDark: "#B83A0A",
  //   bg: "#F7F5F1",
  border: "#E4E0D8",
  muted: "#5F6368",
  amberBg: "#FDF1C7",
  amberText: "#7A3E0A",
};

const theme = createTheme({
  typography: {
    fontFamily: `"Figtree", "Inter", "Segoe UI", Roboto, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  palette: { primary: { main: colors.rust } },
  shape: { borderRadius: 12 },
});
const actionStyles = {
  base: { px: 2.75, py: 1, borderRadius: 2, fontSize: 15, whiteSpace: "nowrap" },
  contained: {
    bgcolor: colors.rustDark,
    color: "#fff",
    "&:hover": { bgcolor: "#9A2F06" },
  },
  outlined: {
    color: colors.rustDark,
    borderColor: colors.rustDark,
    borderWidth: 1.5,
    bgcolor: "#fff",
    "&:hover": { borderWidth: 1.5, borderColor: "#9A2F06", bgcolor: "#FFF4EE" },
  },
};
const trips = [
  {
    id: 1,
    person: "Mother",
    flights: "Emirates EK 544 · MAA → DXB, EK 235 DXB → ORD",
    meta: "Departs Sat 10/17/2026 5:00 AM IST · Arrives 8:00 PM CDT 10/17 · 2 segments",
    status: { type: "matches", label: "2 matches" },
    action: { label: "View matches", variant: "contained", to: "/trip-matches" },
    iconBg: "#DCEBFA",
    iconColor: "#1E293B",
  },
  {
    id: 2,
    person: "Father",
    flights: "Qatar QR 1260 · HYD → DOH, QR 725 DOH → DFW",
    meta: "Mon 11/02/2026 · companion accepted: Lakshmi V.",
    status: { type: "matched", label: "MATCHED" },
    action: { label: "Open trip", variant: "outlined" },
    iconBg: "#DDF4E4",
    iconColor: "#1E293B",
  },
];

function RoleCard({ title, description, selected, onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        borderRadius: 3,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.rust : colors.border,
        bgcolor: "#fff",
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 2.25, height: "100%" }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 18,
            color: selected ? colors.rust : colors.navy,
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, color: colors.muted, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function StatusChip({ status }) {
  const isMatched = status.type === "matched";
  return (
    <Chip
      label={status.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 12,
        height: 26,
        borderRadius: "14px",
        bgcolor: isMatched ? "#D6F0DF" : "#FCE9B8",
        color: isMatched ? "#166534" : "#8A4B08",
        letterSpacing: isMatched ? 0.4 : 0,
      }}
    />
  );
}

function TripRow({ trip }) {
  const isContained = trip.action.variant === "contained";
  const navigate = useNavigate();
  const { action } = trip;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        px: 2.5,
        borderRadius: 3,
        borderColor: colors.border,
        display: "flex",
        alignItems: "center",
        gap: 2,
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      <Avatar sx={{ bgcolor: trip.iconBg, width: 44, height: 44 }}>
        <FlightIcon sx={{ color: trip.iconColor, transform: "rotate(45deg)" }} />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937" }}>
          {trip.person} · {trip.flights}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: colors.muted, mt: 0.25 }}>
          {trip.meta}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <StatusChip status={trip.status} />
        <Button
          variant={action.variant}
          disableElevation
          onClick={() => action.to && navigate(action.to, { state: { tripId: trip.id } })}
          sx={{ ...actionStyles.base, ...actionStyles[action.variant] }}
        >
          {action.label}
        </Button>
      </Stack>
    </Paper>
  );
}

export default function TravelBuddy() {
  const [role, setRole] = useState("parent"); // "parent" | "volunteer"
  const hasTrips = trips.length > 0;
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: colors.bg, minHeight: "100vh", py: 3, px: 3 }}>
        <Box sx={{ maxWidth: 880, mx: "auto" }}>
          {/* Header */}
          <Typography
            component="h1"
            sx={{ fontSize: 28, fontWeight: 800, color: colors.navy }}
          >
            Travel Buddy
          </Typography>
          <Typography sx={{ fontSize: 14, color: colors.muted, mt: 0.5, mb: 2.5 }}>
            Find a trusted community member on the same flight to help a parent
            travelling from India to the US.
          </Typography>


          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            <RoleCard
              title="My parent needs a companion"
              description="Post your parent's flight. Members on the same flight can offer to look out for them."
              selected={role === "parent"}
              onClick={() => navigate("/post-trip")}
            />
            <RoleCard
              title="I'm flying and can help"
              description="Volunteer to be a companion for a senior on your flight. You never carry items for anyone."
              selected={role === "volunteer"}
              onClick={() => navigate("/post-trip", { state: { role: "companion" } })}
            />
          </Stack>

          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.8,
              color: colors.muted,
              mb: 1,
            }}
          >
            MY TRIPS
          </Typography>

          <Stack spacing={1.75} sx={{ mb: 2.5 }}>
            {hasTrips ? (
              trips.map((t) => <TripRow key={t.id} trip={t} />)
            ) : (
              <Typography sx={{ color: colors.muted, fontSize: 14 }}>
                No trips yet. Post your parent's flight at least 7 days ahead for
                the best chance of a match.
              </Typography>
            )}
          </Stack>

          {/* Safety basics */}
          <Box
            sx={{
              bgcolor: colors.amberBg,
              color: colors.amberText,
              borderRadius: 2.5,
              px: 2.5,
              py: 1.75,
              fontSize: 13.5,
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              Safety basics:
            </Box>{" "}
            companions are volunteers, not caregivers or escorts. Nobody should
            carry items for anyone else. The family approves every helper. Before
            approval, others see only flights, dates, route, "traveller 60+",
            languages and your first name.
          </Box>

          <Typography sx={{ fontSize: 12, color: colors.muted }}>
            Empty state: "No trips yet. Post your parent's flight at least 7 days
            ahead for the best chance of a match."
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
