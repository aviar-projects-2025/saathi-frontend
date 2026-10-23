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
  TextField,
  InputAdornment,
  Fade,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../Api";
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
  activeChip: "#1B2A5C",
};

const theme = createTheme({
  typography: {
    fontFamily: `"Figtree", "Inter", "Segoe UI", Roboto, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  palette: { primary: { main: colors.rust } },
  shape: { borderRadius: 12 },
});

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

/* ---------- Shared Components ---------- */

function RoleCard({ title, description, onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        borderRadius: 3,
        bgcolor: "#fff",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: colors.rust },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: { xs: 1.75, sm: 2.25 }, height: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, color: colors.navy, mb: 0.75 }}>
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
  let label = isMatched ? "MATCHED" : "OPEN";
  let bg = isMatched ? "#D6F0DF" : "#FCE9B8";
  let color = isMatched ? "#166534" : "#8A4B08";

  return (
    <Chip
      label={label}
      size="small"
      sx={{ fontWeight: 700, fontSize: 11, height: 24, borderRadius: "14px", bgcolor: bg, color: color, letterSpacing: 0.4 }}
    />
  );
}

/* ---------- Trip Cards ---------- */

function MyTripRow({ trip, onViewMatches }) {
  const isMatched = trip.status === "MATCHED";
  const flightNos = trip.flights?.map((f) => f.flightNumber).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].join(" → ") : "Unknown route";
  const dateStr = trip.flights?.[0]?.departureTime ? format(new Date(trip.flights[0].departureTime), "eee MM/dd/yyyy h:mm a") : "Date TBD";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2 },
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
        <Avatar sx={{ bgcolor: isMatched ? "#DDF4E4" : "#DCEBFA", width: 44, height: 44, flexShrink: 0 }}>
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 16 }, color: "#1F2937", wordBreak: "break-word" }}>
            {trip.relationship || "Traveller"} · {flightNos} · {route}
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25 }}>
            {dateStr} · {trip.flights?.length || 0} segment{trip.flights?.length > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end" }}>
        <StatusChip status={trip.status} />
        <Button
          variant={isMatched ? "outlined" : "contained"}
          disableElevation
          onClick={() => onViewMatches(trip._id, isMatched)}
          sx={{ ...actionStyles.base, ...(isMatched ? actionStyles.outlined : actionStyles.contained) }}
        >
          {isMatched ? "Open trip" : "View matches"}
        </Button>
      </Stack>
    </Paper>
  );
}

function GlobalTripRow({ trip, onAction }) {
  const isParent = trip.role === "parent";
  const flightNos = trip.flights?.map((f) => f.flightNumber).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].join(" → ") : "Unknown route";
  const dateStr = trip.flights?.[0]?.departureTime ? format(new Date(trip.flights[0].departureTime), "eee MM/dd/yyyy") : "Date TBD";
  const userName = trip.createdBy ? `${trip.createdBy.firstName} ${trip.createdBy.lastName}` : "User";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2 },
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
        <Avatar sx={{ bgcolor: isParent ? "#DCEBFA" : "#DDF4E4", width: 44, height: 44, flexShrink: 0 }}>
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 16 }, color: "#1F2937", wordBreak: "break-word" }}>
            {userName} · <span style={{ color: isParent ? colors.navy : "#14653A" }}>{isParent ? "Needs Help" : "Can Help"}</span>
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25 }}>
            {flightNos} · {route} · {dateStr}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          disableElevation
          onClick={() => onAction(trip)}
          sx={{ ...actionStyles.base, ...actionStyles.outlined }}
        >
          {isParent ? "Offer to help" : "Ask for help"}
        </Button>
      </Stack>
    </Paper>
  );
}

/* ---------- Main Page ---------- */

export default function TravelBuddy() {
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState([]);
  const [globalTrips, setGlobalTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "mine"
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch both my trips and the global feed in parallel
        const [myTripsRes, globalRes] = await Promise.all([
          axios.get(`${Api}/travel-buddy/my-trips`, { headers }),
          axios.get(`${Api}/travel-buddy`, { 
            headers,
            params: { search: search } 
          })
        ]);

        setMyTrips(myTripsRes.data.data || []);
        setGlobalTrips(globalRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch trips", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search so it doesn't spam the API on every keystroke
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, token]);

  const handleGlobalAction = (trip) => {
    // If I click "Offer to help", I should go post a companion trip
    const targetRole = trip.role === "parent" ? "companion" : "parent";
    navigate("/post-trip", { state: { role: targetRole } });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: colors.bg, minHeight: "100vh", py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 880, mx: "auto" }}>
          
          {/* Header */}
          <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: colors.navy }}>
            Travel Buddy
          </Typography>
          <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: colors.muted, mt: 0.5, mb: 2.5 }}>
            Find a trusted community member on the same flight to help a parent travelling from India to the US.
          </Typography>

          {/* Role Selection */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
            <RoleCard
              title="My parent needs a companion"
              description="Post your parent's flight. Members on the same flight can offer to look out for them."
              onClick={() => navigate("/post-trip")}
            />
            <RoleCard
              title="I'm flying and can help"
              description="Volunteer to be a companion for a senior on your flight. You never carry items for anyone."
              onClick={() => navigate("/post-trip", { state: { role: "companion" } })}
            />
          </Stack>

          {/* 🌟 Beautiful Chip Tabs */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 3, justifyContent: "center" }}>
            <Chip
              label="Browse All Trips"
              onClick={() => setActiveTab("browse")}
              sx={{
                height: 42,
                px: 2,
                fontSize: 14,
                fontWeight: 700,
                borderRadius: "21px",
                bgcolor: activeTab === "browse" ? colors.activeChip : "#fff",
                color: activeTab === "browse" ? "#fff" : colors.navy,
                border: `1.5px solid ${activeTab === "browse" ? colors.activeChip : colors.border}`,
                "&:hover": { bgcolor: activeTab === "browse" ? colors.activeChip : "#F3EFE6" },
                transition: "all 0.2s ease",
                boxShadow: activeTab === "browse" ? "0 4px 12px rgba(27,42,92,0.2)" : "none",
              }}
            />
            <Chip
              label={`My Trips ${myTrips.length > 0 ? `(${myTrips.length})` : ""}`}
              onClick={() => setActiveTab("mine")}
              sx={{
                height: 42,
                px: 2,
                fontSize: 14,
                fontWeight: 700,
                borderRadius: "21px",
                bgcolor: activeTab === "mine" ? colors.activeChip : "#fff",
                color: activeTab === "mine" ? "#fff" : colors.navy,
                border: `1.5px solid ${activeTab === "mine" ? colors.activeChip : colors.border}`,
                "&:hover": { bgcolor: activeTab === "mine" ? colors.activeChip : "#F3EFE6" },
                transition: "all 0.2s ease",
                boxShadow: activeTab === "mine" ? "0 4px 12px rgba(27,42,92,0.2)" : "none",
              }}
            />
          </Stack>

          {/* Content Area with Fade Animation */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={32} sx={{ color: colors.rust }} />
            </Box>
          ) : activeTab === "browse" ? (
            <Fade in={true} timeout={400}>
              <Box>
                {/* Search Bar */}
                <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.border}`, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by flight number (EK 544), airline, or airport code (MAA, ORD)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                      sx: { borderRadius: 2, bgcolor: "#FAFAFA" }
                    }}
                  />
                </Paper>

                {/* Global Trips List */}
                <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                  {globalTrips.length > 0 ? (
                    globalTrips.map((t) => (
                      <GlobalTripRow key={t._id} trip={t} onAction={handleGlobalAction} />
                    ))
                  ) : (
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: colors.border, textAlign: "center", bgcolor: "#fff" }}>
                      <Typography sx={{ color: colors.muted, fontSize: 14 }}>
                        No other trips found matching your search.
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Box>
            </Fade>
          ) : (
            <Fade in={true} timeout={400}>
              <Box>
                {/* My Trips List */}
                <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                  {myTrips.length > 0 ? (
                    myTrips.map((t) => (
                      <MyTripRow
                        key={t._id}
                        trip={t}
                        onViewMatches={(id, isMatched) => navigate(isMatched ? `/trip-accepted/${id}` : `/trip-matches/${id}`)}
                      />
                    ))
                  ) : (
                    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: colors.border, textAlign: "center", bgcolor: "#fff" }}>
                      <Typography sx={{ color: colors.muted, fontSize: 14, mb: 2 }}>
                        You haven't posted any trips yet.
                      </Typography>
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => navigate("/post-trip")}
                        sx={{ ...actionStyles.base, ...actionStyles.contained, width: "auto", px: 3 }}
                      >
                        Post your first trip
                      </Button>
                    </Paper>
                  )}
                </Stack>
              </Box>
            </Fade>
          )}

          {/* Safety Info */}
          <Box sx={{ bgcolor: colors.amberBg, color: colors.amberText, borderRadius: 2.5, px: 2.5, py: 1.75, fontSize: 13.5, lineHeight: 1.6 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>Safety basics:</Box>{" "}
            companions are volunteers, not caregivers or escorts. Nobody should carry items for anyone else. The family approves every helper.
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}