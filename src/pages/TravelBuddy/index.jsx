import React, { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../Api"; // Adjust this path if necessary
import { format } from "date-fns";

/* ---------- Design Tokens ---------- */
const colors = {
  navy: "#1B2A5C",
  rust: "#C2410C",
  rustDark: "#B83A0A",
  bg: "#F7F5F1",
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

/* One size for every button */
const BTN = {
  height: 46,
  minHeight: 46,
  px: 2,
  py: 0,
  borderRadius: 2,
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.2,
  textAlign: "center",
  boxShadow: "none",
};

const actionStyles = {
  base: { ...BTN, width: 170 },
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

/* ---------- Components ---------- */

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
        transition: "border-color 0.2s",
        "&:hover": { borderColor: selected ? colors.rust : colors.muted },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: { xs: 1.75, sm: 2.25 }, height: "100%" }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: { xs: 16, sm: 18 },
            color: selected ? colors.rust : colors.navy,
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: colors.muted, lineHeight: 1.5 }}>
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function StatusChip({ status }) {
  const isMatched = status === "MATCHED";
  const isCancelled = status === "CANCELLED";

  let label = "OPEN";
  let bg = "#FCE9B8";
  let color = "#8A4B08";

  if (isMatched) {
    label = "MATCHED";
    bg = "#D6F0DF";
    color = "#166534";
  } else if (isCancelled) {
    label = "CANCELLED";
    bg = "#FEE2E2";
    color = "#991B1B";
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: 11,
        height: 24,
        borderRadius: "14px",
        bgcolor: bg,
        color: color,
        letterSpacing: 0.4,
      }}
    />
  );
}

function TripRow({ trip }) {
  const navigate = useNavigate();

  // Determine action based on status
  const action =
    trip.status === "MATCHED"
      ? { label: "Open trip", variant: "outlined", to: `/trip-accepted/${trip._id}` }
      : { label: "View matches", variant: "contained", to: `/trip-matches/${trip._id}` };

  // Safely extract flight details
  const flightNos = trip.flights?.map((f) => f.flightNumber).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 
    ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].join(" → ")
    : "Unknown route";

  // Format start time safely
  const startTime = trip.flights?.[0]?.departureTime;
  const dateStr = startTime ? format(new Date(startTime), "eee MM/dd/yyyy h:mm a") : "Date TBD";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2 },
        px: { xs: 1.75, sm: 2.5 },
        borderRadius: 3,
        borderColor: colors.border,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Avatar
          sx={{
            bgcolor: trip.status === "MATCHED" ? "#DDF4E4" : "#DCEBFA",
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            flexShrink: 0,
          }}
        >
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 14.5, sm: 16 },
              color: "#1F2937",
              wordBreak: "break-word",
            }}
          >
            {trip.relationship || "Traveller"} · {flightNos} · {route}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 12, sm: 12.5 },
              color: colors.muted,
              mt: 0.25,
              wordBreak: "break-word",
            }}
          >
            {dateStr} · {trip.flights?.length || 0} segment{trip.flights?.length > 1 ? "s" : ""}
            {trip.status === "MATCHED" && " · companion accepted"}
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "space-between", md: "flex-end" },
        }}
      >
        <StatusChip status={trip.status} />
        <Button
          variant={action.variant}
          disableElevation
          onClick={() => navigate(action.to)}
          sx={{ ...actionStyles.base, ...actionStyles[action.variant] }}
        >
          {action.label}
        </Button>
      </Stack>
    </Paper>
  );
}

/* ---------- Main Page ---------- */

export default function TravelBuddy() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`${Api}/travel-buddy/my-trips`);
        setTrips(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch trips", err);
        // Optional: Add toast.error("Failed to load trips") here if you have react-toastify
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const hasTrips = trips.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: colors.bg,
          minHeight: "100vh",
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 880, mx: "auto" }}>
          {/* Header */}
          <Typography
            component="h1"
            sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: colors.navy }}
          >
            Travel Buddy
          </Typography>
          <Typography
            sx={{ fontSize: { xs: 13, sm: 14 }, color: colors.muted, mt: 0.5, mb: 2.5 }}
          >
            Find a trusted community member on the same flight to help a parent
            travelling from India to the US.
          </Typography>

          {/* Role Cards */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            <RoleCard
              title="My parent needs a companion"
              description="Post your parent's flight. Members on the same flight can offer to look out for them."
              selected={false} // Set to true if you want to default highlight one
              onClick={() => navigate("/post-trip")}
            />
            <RoleCard
              title="I'm flying and can help"
              description="Volunteer to be a companion for a senior on your flight. You never carry items for anyone."
              selected={false}
              onClick={() => navigate("/post-trip", { state: { role: "companion" } })}
            />
          </Stack>

          {/* My Trips Section */}
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
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={30} sx={{ color: colors.rust }} />
              </Box>
            ) : hasTrips ? (
              trips.map((t) => <TripRow key={t._id} trip={t} />)
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: colors.border, textAlign: "center" }}>
                <Typography sx={{ color: colors.muted, fontSize: 14 }}>
                  No trips yet. Post your parent's flight at least 7 days ahead for
                  the best chance of a match.
                </Typography>
              </Paper>
            )}
          </Stack>

          {/* Safety Basics Info */}
          <Box
            sx={{
              bgcolor: colors.amberBg,
              color: colors.amberText,
              borderRadius: 2.5,
              px: { xs: 2, sm: 2.5 },
              py: 1.75,
              fontSize: { xs: 12.5, sm: 13.5 },
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
        </Box>
      </Box>
    </ThemeProvider>
  );
}