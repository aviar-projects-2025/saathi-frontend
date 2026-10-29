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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
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
  const normalized = String(status || "OPEN").toUpperCase();
  const styles = {
    MATCHED: { label: "MATCHED", bg: "#D6F0DF", color: "#166534" },
    OPEN: { label: "OPEN", bg: "#FCE9B8", color: "#8A4B08" },
    COMPLETED: { label: "COMPLETED", bg: "#DCEBFA", color: "#1B2A5C" },
    CANCELLED: { label: "CANCELLED", bg: "#FDE2E2", color: "#991B1B" },
  };
  const { label, bg, color } = styles[normalized] || styles.OPEN;

  return (
    <Chip
      label={label}
      size="small"
      sx={{ fontWeight: 700, fontSize: 11, height: 24, borderRadius: "14px", bgcolor: bg, color: color, letterSpacing: 0.4 }}
    />
  );
}

/* ---------- Trip Cards ---------- */

function MyTripRow({ trip, onViewMatches, showAction = true, viewDetails }) {
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
      onClick={() => viewDetails(trip)}
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
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <StatusChip status={trip.status} />
        {trip.status === "OPEN" && trip.isRequestSubmission && (
          <Chip size="small" label="Private offer" sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 700 }} />
        )}
        {showAction && ((trip.status === "OPEN" && !trip.isRequestSubmission) || isMatched) && (
          <Button
            variant={isMatched ? "outlined" : "contained"}
            disableElevation
            onClick={() => onViewMatches(trip._id, isMatched)}
            sx={{ ...actionStyles.base, ...(isMatched ? actionStyles.outlined : actionStyles.contained) }}
          >
            {console.log(isMatched, 'isMatched ')}
            {isMatched ? "Open trip" : "View requests"}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function formatTripDate(value, pattern = "eee, MMM d, yyyy · h:mm a") {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided" : format(date, pattern);
}

function DetailLine({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, color: colors.muted, mb: 0.35 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, color: "#1F2937", fontWeight: 600, overflowWrap: "anywhere" }}>
        {value || "Not provided"}
      </Typography>
    </Box>
  );
}

function GlobalTripRow({ trip, onViewDetails }) {
  const isParent = trip.role === "parent";
  const flightNos = trip.flights?.map((f) => f.flightNumber).filter(Boolean).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].filter(Boolean).join(" → ") : "Route not provided";
  const dateStr = trip.flights?.[0]?.departureTime ? formatTripDate(trip.flights[0].departureTime, "eee, MMM d, yyyy") : "Date TBD";
  const userName = [trip.createdBy?.firstName, trip.createdBy?.lastName].filter(Boolean).join(" ") || "Community member";

  return (
    <Paper
      variant="outlined"
      role="button"
      tabIndex={0}
      aria-label={`View trip details for ${userName}`}
      onClick={() => onViewDetails(trip)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewDetails(trip);
        }
      }}
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 3,
        borderColor: colors.border,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", borderColor: colors.rust },
        "&:focus-visible": { outline: `2px solid ${colors.rust}`, outlineOffset: 2 },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Avatar src={trip.createdBy?.profileImage || undefined} alt={userName} sx={{ bgcolor: isParent ? "#DCEBFA" : "#DDF4E4", width: 48, height: 48, flexShrink: 0 }}>
          {!trip.createdBy?.profileImage && <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 16 }, color: "#1F2937", wordBreak: "break-word" }}>
            {userName} · <span style={{ color: isParent ? colors.navy : "#14653A" }}>{isParent ? "Needs Help" : "Can Help"}</span>
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25 }}>
            {flightNos} · {route} · {dateStr}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.rust, fontWeight: 700, mt: 0.75 }}>Tap to view full trip details</Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end" }}>
        <StatusChip status={trip.status} />
        <Button
          variant="outlined"
          disableElevation
          onClick={(event) => { event.stopPropagation(); onViewDetails(trip); }}
          sx={{ ...actionStyles.base, ...actionStyles.outlined }}
        >
          View details
        </Button>
      </Stack>
    </Paper>
  );
}

function TripDetailsDialog({ trip, onClose, onAction }) {
  if (!trip) return null;
  const isParent = trip.role === "parent";
  const userName = [trip.createdBy?.firstName, trip.createdBy?.lastName].filter(Boolean).join(" ") || "Community member";
  const flights = Array.isArray(trip.flights) ? trip.flights : [];
  const status = trip.status || "OPEN";

  return (
    <Dialog open={Boolean(trip)} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pr: 6, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={trip.createdBy?.profileImage || undefined} alt={userName} sx={{ width: 52, height: 52, bgcolor: "#DCEBFA" }}>
            {!trip.createdBy?.profileImage && <FlightIcon />}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 19, fontWeight: 800, color: colors.navy }}>{userName}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted }}>
              {isParent ? `Parent trip${trip.relationship ? ` · ${trip.relationship}` : ""}` : "Companion trip"}
              {isParent && trip.ageBand ? ` · Age ${trip.ageBand}` : ""}
            </Typography>
          </Box>
          <IconButton aria-label="Close trip details" onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#FFFEFC" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: colors.navy }}>Trip details</Typography>
            <StatusChip status={status} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
            <DetailLine label="Trip role" value={isParent ? "Needs help" : "Can help"} />
            <DetailLine label="Posted" value={formatTripDate(trip.createdAt, "MMM d, yyyy")} />
            <DetailLine label="Pickup" value={trip.pickup === "family" ? "Family pickup" : trip.pickup === "saathi" ? "Saathi pickup" : trip.pickup} />
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Flight itinerary ({flights.length})</Typography>
            {flights.length ? (
              <Stack spacing={1.5}>
                {flights.map((flight, index) => (
                  <Paper key={flight._id || `${flight.flightNumber || "flight"}-${index}`} variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, borderColor: colors.border, bgcolor: "#fff" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontWeight: 800, color: colors.navy }}>Flight {index + 1}</Typography>
                      <Chip size="small" icon={<FlightIcon />} label={flight.airline || "Airline not provided"} sx={{ maxWidth: "65%" }} />
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{flight.fromCode || "—"}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>Departure airport</Typography>
                      </Box>
                      <FlightIcon sx={{ color: colors.rust, transform: "rotate(45deg)" }} />
                      <Box sx={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                        <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{flight.toCode || "—"}</Typography>
                        <Typography sx={{ fontSize: 11, color: colors.muted }}>Arrival airport</Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <DetailLine label="Flight number" value={flight.flightNumber} />
                      <DetailLine label="Airline" value={flight.airline} />
                      <DetailLine label="Departure" value={formatTripDate(flight.departureTime)} />
                      <DetailLine label="Arrival" value={formatTripDate(flight.arrivalTime)} />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : <Typography sx={{ fontSize: 13, color: colors.muted }}>No flight details have been added.</Typography>}
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Preferences</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
              <DetailLine label="Languages" value={trip.languages?.length ? trip.languages.join(", ") : "Not specified"} />
              <DetailLine label={isParent ? "Help needed" : "Help offered"} value={trip.help?.length ? trip.help.join(", ") : "Not specified"} />
              {isParent && <DetailLine label="Relationship" value={trip.relationship} />}
              {isParent && <DetailLine label="Traveller age" value={trip.ageBand} />}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: "column-reverse", sm: "row" }, "& > :not(style) ~ :not(style)": { ml: 0 } }}>
        <Button onClick={onClose} sx={{ ...BTN, width: { xs: "100%", sm: "auto" }, color: colors.muted }}>Close</Button>
        <Button variant="contained" disableElevation onClick={() => onAction(trip)} sx={{ ...BTN, width: { xs: "100%", sm: "auto" }, bgcolor: colors.rust, "&:hover": { bgcolor: colors.rustDark } }}>
          {isParent ? "Offer to Help" : "Ask for Help"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Main Page ---------- */

export default function TravelBuddy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [myTrips, setMyTrips] = useState([]);
  const [globalTrips, setGlobalTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const requestedTab = location.state?.activeTab;
  const [activeTab, setActiveTab] = useState(requestedTab || "browse");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${token}` };
        const [myTripsRes, globalRes] = await Promise.all([
          axios.get(`${Api}/travel-buddy/my-trips`, { headers }),
          axios.get(`${Api}/travel-buddy`, { headers, params: { search } }),
        ]);
        if (!cancelled) {
          setMyTrips(Array.isArray(myTripsRes.data?.data) ? myTripsRes.data.data : []);
          setGlobalTrips(Array.isArray(globalRes.data?.data) ? globalRes.data.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch Travel Buddy trips", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const timer = setTimeout(fetchData, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, token]);

  const handleGlobalAction = (trip) => {
    if (!trip?._id || trip.status !== "OPEN") return;
    const targetRole = trip.role === "parent" ? "companion" : "parent";
    setSelectedTrip(null);
    navigate("/post-trip", {
      state: { role: targetRole, prefillTrip: trip, targetTripId: trip._id, requestMode: true },
    });
  };

  // const getDeparture = (trip) => {
  //   const raw = trip?.flights?.[0]?.departureTime;
  //   if (!raw) return null;
  //   const date = new Date(raw);
  //   return Number.isNaN(date.getTime()) ? null : date;
  // };
  // const now = Date.now();
  // const upcomingTrips = myTrips.filter((trip) => trip.status === "MATCHED" && getDeparture(trip)?.getTime() > now)
  //   .sort((a, b) => getDeparture(a) - getDeparture(b));
  // const historyTrips = myTrips.filter((trip) => {
  //   const departure = getDeparture(trip);
  //   return ["COMPLETED", "CANCELLED"].includes(trip.status) || Boolean(departure && departure.getTime() <= now);
  // }).sort((a, b) => (getDeparture(b)?.getTime() || 0) - (getDeparture(a)?.getTime() || 0));

  console.log("My Trip:", myTrips);


  // Get the first flight's departure time
  const getDeparture = (trip) => {
    const raw = trip?.flights?.[0]?.departureTime;

    if (!raw) return null;

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Get the last flight segment's arrival time

  const getArrival = (trip) => {
    const flights = trip?.flights;

    if (!Array.isArray(flights) || flights.length === 0) {
      return null;
    }

    const raw = flights[flights.length - 1]?.arrivalTime;

    if (!raw) return null;

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;
  };

  const now = Date.now();

  const upcomingTrips = myTrips
    .filter((trip) => {
      const departure = getDeparture(trip);

      return (
        trip.status === "MATCHED" &&
        departure !== null &&
        departure.getTime() > now
      );
    })
    .sort(
      (a, b) => getDeparture(a).getTime() - getDeparture(b).getTime()
    );

  const openTrips = myTrips.filter((trip) => {
    // if (trip.status !== "OPEN") return false;
    const departure = getDeparture(trip);
    const arrival = getArrival(trip);
    
    return departure.getTime() <= now || departure.getTime() >= now || arrival.getTime() >= now || arrival.getTime() <= now;
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const historyTrips = myTrips
    .filter((trip) => {
      const arrival = getArrival(trip);

      return (
        ["COMPLETED", "CANCELLED"].includes(trip.status) ||
        (arrival !== null && arrival.getTime() <= now)
      );
    })
    .sort(
      (a, b) =>
        (getArrival(b)?.getTime() || 0) -
        (getArrival(a)?.getTime() || 0)
    );

  // const openTrips = myTrips
  //   .filter((trip) => {
  //     if (trip.status !== "OPEN") return false;

  //     const departure = getDeparture(trip);

  //     return departure.getTime() < now || arrival.getTime() > now;
  //   })
  //   .sort(
  //     (a, b) =>
  //       new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  //   );

  const currentTrips = myTrips.filter((trip) => {
    const departure = getDeparture(trip);
    const arrival = getArrival(trip);

    return (
      trip.status === "MATCHED" &&
      departure !== null &&
      arrival !== null &&
      departure.getTime() <= now &&
      arrival.getTime() > now
    );
  });

  const tabs = [
    { key: "browse", label: "Browse All Trips", count: null },
    { key: "current", label: "Current Trips", count: currentTrips.length },
    { key: "upcoming", label: "Upcoming Trips", count: upcomingTrips.length },
    { key: "mine", label: "My Trips", count: openTrips.length },
    { key: "history", label: "History", count: historyTrips.length },
  ];

  const renderEmpty = (message, action = false) => (
    <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, borderColor: colors.border, textAlign: "center", bgcolor: "#fff" }}>
      <Typography sx={{ color: colors.muted, fontSize: 14, mb: action ? 2 : 0 }}>{message}</Typography>
      {action && <Button variant="contained" disableElevation onClick={() => navigate("/post-trip")} sx={{ ...actionStyles.base, ...actionStyles.contained, width: "auto", px: 3 }}>Post your first trip</Button>}
    </Paper>
  );

  const renderTripList = (trips, emptyMessage, showAction = true) => trips.length ? (
    <Stack spacing={1.75} sx={{ mb: 2.5 }}>
      {
        trips.map((trip) => (
          <MyTripRow
            key={trip._id}
            trip={trip}
            showAction={showAction}
            onViewMatches={(id, isMatched) => {
              if (isMatched) {
                navigate(`/trip-accepted/${id}`);
                return;
              }

              navigate("/travelbuddy/requests", {
                state: {
                  tab: "received",
                  targetTripId: id,
                },
              });
            }}
          />
        ))
      }
    </Stack>
  ) : renderEmpty(emptyMessage, !showAction && false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: colors.bg, minHeight: "100vh", py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ maxWidth: 880, mx: "auto" }}>
          <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: colors.navy }}>Travel Buddy</Typography>
          <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: colors.muted, mt: 0.5, mb: 2.5 }}>
            Find a trusted community member on the same flight to help a parent travelling from India to the US.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
            <RoleCard title="My parent needs a companion" description="Post your parent's flight. Members on the same flight can offer to look out for them." onClick={() => navigate("/post-trip")} />
            <RoleCard title="I'm flying and can help" description="Volunteer to be a companion for a senior on your flight. You never carry items for anyone." onClick={() => navigate("/post-trip", { state: { role: "companion" } })} />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 3, justifyContent: { xs: "flex-start", md: "center" }, flexWrap: "wrap", rowGap: 1 }}>
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return <Chip key={tab.key} label={`${tab.label}${tab.count !== null ? ` (${tab.count})` : ""}`} onClick={() => setActiveTab(tab.key)} sx={{ height: 42, px: 1.5, fontSize: 13.5, fontWeight: 700, borderRadius: "21px", bgcolor: active ? colors.activeChip : "#fff", color: active ? "#fff" : colors.navy, border: `1.5px solid ${active ? colors.activeChip : colors.border}`, "&:hover": { bgcolor: active ? colors.activeChip : "#F3EFE6" }, boxShadow: active ? "0 4px 12px rgba(27,42,92,0.2)" : "none" }} />;
            })}
          </Stack>

          {loading ? <Box display="flex" justifyContent="center" py={8}><CircularProgress size={32} sx={{ color: colors.rust }} /></Box> : (
            <Fade in timeout={250}>
              <Box>
                {activeTab === "browse" && <>
                  <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.border}`, mb: 3 }}>
                    <TextField fullWidth size="small" placeholder="Search by flight number (EK 544), airline, or airport code (MAA, ORD)" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: "#FAFAFA" } }} />
                  </Paper>
                  <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                    {globalTrips.length ? globalTrips.map((trip) => <GlobalTripRow key={trip._id} trip={trip} onViewDetails={setSelectedTrip} />) : renderEmpty("No public trips found matching your search.")}
                  </Stack>
                </>}
                {activeTab === "current" && <>
                  <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Current trips appear here.</Typography>
                  {currentTrips.length ? <Stack spacing={1.75}>{currentTrips.map((trip) => <MyTripRow key={trip._id} trip={trip} showAction={false} onViewMatches={() => { }} viewDetails={setSelectedTrip} />)}</Stack> : renderEmpty("You don't have any current trips.")}
                </>}
                {activeTab === "upcoming" && <>
                  <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Confirmed matches with future departure dates appear here.</Typography>
                  {upcomingTrips.length ? <Stack spacing={1.75}>{upcomingTrips.map((trip) => <MyTripRow key={trip._id} trip={trip} onViewMatches={(id) => navigate(`/trip-accepted/${id}`)} viewDetails={setSelectedTrip} />)}</Stack> : renderEmpty("You don't have any upcoming matched trips yet.")}
                </>}
                {activeTab === "mine" && <>
                  <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Open trips, including private offers awaiting a response, are shown only to you here.</Typography>
                  {openTrips.length ? (
                    <Stack spacing={1.75}>
                      {openTrips.map((trip) => (
                        <MyTripRow
                          key={trip._id}
                          trip={trip}
                          viewDetails={setSelectedTrip}
                          onViewMatches={(id) =>
                            navigate("/travelbuddy/requests", {
                              state: {
                                tab: "received",
                                targetTripId: id,
                              },
                            })
                          }
                        />
                      ))}
                    </Stack>
                  ) : (
                    renderEmpty("You don't have any open trips.", true)
                  )}
                </>}
                {activeTab === "history" && <>
                  <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Completed, cancelled, and past-departure trips appear here.</Typography>
                  {historyTrips.length ? <Stack spacing={1.75}>{historyTrips.map((trip) => <MyTripRow key={trip._id} trip={trip} showAction={false} onViewMatches={() => { }} viewDetails={setSelectedTrip} />)}</Stack> : renderEmpty("Your trip history is empty.")}
                </>}
              </Box>
            </Fade>
          )}

          <TripDetailsDialog trip={selectedTrip} onClose={() => setSelectedTrip(null)} onAction={handleGlobalAction} />
          <Box sx={{ bgcolor: colors.amberBg, color: colors.amberText, borderRadius: 2.5, px: 2.5, py: 1.75, fontSize: 13.5, lineHeight: 1.6, mt: 3 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>Safety basics:</Box>{" "}companions are volunteers, not caregivers or escorts. Nobody should carry items for anyone else. The family approves every helper.
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
