import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardActionArea, Chip, Avatar, Paper, Stack, Typography,
  createTheme, ThemeProvider, CssBaseline, CircularProgress,
  TextField, InputAdornment, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, IconButton,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../Api";
import { format } from "date-fns";
import ProtectedAvatar from "../../components/ProtectedAvatar.jsx";

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
  height: 46, minHeight: 46, px: 2, py: 0, borderRadius: 2,
  fontSize: 15, fontWeight: 700, lineHeight: 1.2, textAlign: "center", boxShadow: "none",
};
const actionStyles = {
  base: { ...BTN, width: 170 },
  contained: { bgcolor: colors.rustDark, color: "#fff", "&:hover": { bgcolor: "#9A2F06" } },
  outlined: { color: colors.rustDark, borderColor: colors.rustDark, borderWidth: 1.5, bgcolor: "#fff", "&:hover": { borderWidth: 1.5, borderColor: "#9A2F06", bgcolor: "#FFF4EE" } },
};

/* ── Helpers ── */
const getDeparture = (trip) => {
  const raw = trip?.flights?.[0]?.departureTime;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getArrival = (trip) => {
  const flights = trip?.flights;
  if (!Array.isArray(flights) || !flights.length) return null;
  const raw = flights[flights.length - 1]?.arrivalTime;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};
const formatTripDate = (value, pattern = "eee, MMM d, yyyy · h:mm a") => {
  if (!value) return "Not provided";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Not provided" : format(d, pattern);
};

/* ── Small components ── */
function RoleCard({ title, description, onClick }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 3, bgcolor: "#fff", transition: "border-color 0.2s", "&:hover": { borderColor: colors.rust } }}>
      <CardActionArea onClick={onClick} sx={{ p: { xs: 1.75, sm: 2.25 }, height: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 }, color: colors.navy, mb: 0.75 }}>{title}</Typography>
        <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: colors.muted, lineHeight: 1.5 }}>{description}</Typography>
      </CardActionArea>
    </Card>
  );
}

function StatusChip({ status }) {
  const n = String(status || "OPEN").toUpperCase();
  const s = {
    MATCHED: { label: "MATCHED", bg: "#D6F0DF", color: "#166534" },
    OPEN: { label: "OPEN", bg: "#FCE9B8", color: "#8A4B08" },
    COMPLETED: { label: "COMPLETED", bg: "#DCEBFA", color: "#1B2A5C" },
    CANCELLED: { label: "CANCELLED", bg: "#FDE2E2", color: "#991B1B" },
  }[n] || { label: "OPEN", bg: "#FCE9B8", color: "#8A4B08" };
  return <Chip label={s.label} size="small" sx={{ fontWeight: 700, fontSize: 11, height: 24, borderRadius: "14px", bgcolor: s.bg, color: s.color, letterSpacing: 0.4 }} />;
}

function MyTripRow({ trip, onViewMatches, showAction = true, viewDetails, currentUserId }) {
  const isMatched = trip.status === "MATCHED";
  const isMine = String(trip.createdBy?._id || trip.createdBy) === String(currentUserId);
  const flightNos = trip.flights?.map((f) => f.flightNumber).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].join(" → ") : "Unknown route";
  const dateStr = formatTripDate(trip.flights?.[0]?.departureTime, "eee MM/dd/yyyy h:mm a");

  return (
    <Paper
      variant="outlined"
      onClick={() => viewDetails(trip)}
      sx={{
        p: { xs: 1.75, sm: 2 }, borderRadius: 3, borderColor: colors.border,
        display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "stretch", md: "center" },
        gap: 2, cursor: "pointer", transition: "box-shadow 0.2s",
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
            {!isMine && trip.createdBy?.firstName ? ` · ${trip.createdBy.firstName}` : ""}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
        <StatusChip status={trip.status} />
        {trip.status === "OPEN" && trip.isRequestSubmission && (
          <Chip size="small" label="Private offer" sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 700 }} />
        )}
        {showAction && isMine && ((trip.status === "OPEN" && !trip.isRequestSubmission) || isMatched) && (
          <Button
            variant={isMatched ? "outlined" : "contained"}
            disableElevation
            onClick={(e) => { e.stopPropagation(); onViewMatches(trip._id, isMatched); }}
            sx={{ ...actionStyles.base, ...(isMatched ? actionStyles.outlined : actionStyles.contained) }}
          >
            {isMatched ? "Open trip" : "View requests"}
          </Button>
        )}
        {showAction && !isMine && isMatched && (
          <Button
            variant="outlined" disableElevation
            onClick={(e) => { e.stopPropagation(); onViewMatches(trip._id, true); }}
            sx={{ ...actionStyles.base, ...actionStyles.outlined }}
          >
            Open trip
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

function GlobalTripRow({ trip, onViewDetails, currentUserId }) {
  const isParent = trip.role === "parent";
  const flightNos = trip.flights?.map((f) => f.flightNumber).filter(Boolean).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].filter(Boolean).join(" → ") : "Route not provided";
  const dateStr = formatTripDate(trip.flights?.[0]?.departureTime, "eee, MMM d, yyyy");
  const userName = [trip.createdBy?.firstName, trip.createdBy?.lastName].filter(Boolean).join(" ") || "Community member";
  const isOwn = String(trip.createdBy?._id || trip.createdBy) === String(currentUserId);

  return (
    <Paper
      variant="outlined" role="button" tabIndex={0}
      onClick={() => onViewDetails(trip)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onViewDetails(trip); } }}
      sx={{
        p: { xs: 1.75, sm: 2 }, borderRadius: 3, borderColor: colors.border,
        display: "flex", flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" }, gap: 2, cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", borderColor: colors.rust },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <ProtectedAvatar
          src={trip.createdBy?.profileImage || ""} alt={userName}
          sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: isParent ? "#DCEBFA" : "#DDF4E4" }}
        >
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </ProtectedAvatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 16 }, color: "#1F2937", wordBreak: "break-word" }}>
            {userName}{isOwn ? " (you)" : ""} ·{" "}
            <span style={{ color: isParent ? colors.navy : "#14653A" }}>{isParent ? "Needs Help" : "Can Help"}</span>
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25 }}>
            {flightNos} · {route} · {dateStr}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.rust, fontWeight: 700, mt: 0.75 }}>
            {isOwn ? "Your trip · Tap to view" : "Tap to view full trip details"}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center", justifyContent: "flex-end" }}>
        <StatusChip status={trip.status} />
        <Button
          variant="outlined" disableElevation
          onClick={(e) => { e.stopPropagation(); onViewDetails(trip); }}
          sx={{ ...actionStyles.base, ...actionStyles.outlined }}
        >
          View details
        </Button>
      </Stack>
    </Paper>
  );
}

function TripDetailsDialog({ trip, onClose, onAction, currentUserId }) {
  if (!trip) return null;
  const isParent = trip.role === "parent";
  const userName = [trip.createdBy?.firstName, trip.createdBy?.lastName].filter(Boolean).join(" ") || "Community member";
  const flights = Array.isArray(trip.flights) ? trip.flights : [];
  const isOwn = String(trip.createdBy?._id || trip.createdBy) === String(currentUserId);
  const canRequest = !isOwn && trip.status === "OPEN" && !trip.isRequestSubmission;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ pr: 6, pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ProtectedAvatar
            src={trip.createdBy?.profileImage || ""} alt={userName}
            sx={{ width: 52, height: 52, bgcolor: "#DCEBFA" }}
          >
            <FlightIcon />
          </ProtectedAvatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 19, fontWeight: 800, color: colors.navy }}>{userName}{isOwn ? " (you)" : ""}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted }}>
              {isParent ? `Parent trip${trip.relationship ? ` · ${trip.relationship}` : ""}` : "Companion trip"}
              {isParent && trip.ageBand ? ` · Age ${trip.ageBand}` : ""}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8 }}><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#FFFEFC" }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: colors.navy }}>Trip details</Typography>
            <StatusChip status={trip.status} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
            <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Trip role</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{isParent ? "Needs help" : "Can help"}</Typography></Box>
            <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Posted</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatTripDate(trip.createdAt, "MMM d, yyyy")}</Typography></Box>
            <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Pickup</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{trip.pickup === "family" ? "Family pickup" : trip.pickup === "saathi" ? "Saathi pickup" : trip.pickup}</Typography></Box>
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Flight itinerary ({flights.length})</Typography>
            <Stack spacing={1.5}>
              {flights.map((flight, index) => (
                <Paper key={flight._id || index} variant="outlined" sx={{ p: 1.75, borderRadius: 2.5, borderColor: colors.border, bgcolor: "#fff" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: colors.navy }}>Flight {index + 1}</Typography>
                    <Chip size="small" icon={<FlightIcon />} label={flight.airline || "Airline not provided"} sx={{ maxWidth: "65%" }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 22, fontWeight: 800 }}>{flight.fromCode}</Typography><Typography sx={{ fontSize: 11, color: colors.muted }}>Departure</Typography></Box>
                    <FlightIcon sx={{ color: colors.rust, transform: "rotate(45deg)" }} />
                    <Box sx={{ flex: 1, textAlign: "right" }}><Typography sx={{ fontSize: 22, fontWeight: 800 }}>{flight.toCode}</Typography><Typography sx={{ fontSize: 11, color: colors.muted }}>Arrival</Typography></Box>
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                    <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Flight no.</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{flight.flightNumber || "—"}</Typography></Box>
                    <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Airline</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{flight.airline || "—"}</Typography></Box>
                    <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Departure</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatTripDate(flight.departureTime)}</Typography></Box>
                    <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Arrival</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{formatTripDate(flight.arrivalTime)}</Typography></Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Preferences</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
              <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Languages</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{trip.languages?.length ? trip.languages.join(", ") : "Not specified"}</Typography></Box>
              <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>{isParent ? "Help needed" : "Help offered"}</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{trip.help?.length ? trip.help.join(", ") : "Not specified"}</Typography></Box>
              {isParent && <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Relationship</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{trip.relationship || "—"}</Typography></Box>}
              {isParent && <Box><Typography sx={{ fontSize: 12, color: colors.muted }}>Traveller age</Typography><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{trip.ageBand || "—"}</Typography></Box>}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: "column-reverse", sm: "row" } }}>
        <Button onClick={onClose} sx={{ ...BTN, width: { xs: "100%", sm: "auto" }, color: colors.muted }}>Close</Button>
        {canRequest && (
          <Button variant="contained" disableElevation onClick={() => onAction(trip)} sx={{ ...BTN, width: { xs: "100%", sm: "auto" }, bgcolor: colors.rust, "&:hover": { bgcolor: colors.rustDark } }}>
            {isParent ? "Offer to Help" : "Ask for Help"}
          </Button>
        )}
        {isOwn && trip.status === "OPEN" && !trip.isRequestSubmission && (
          <Button variant="contained" disableElevation onClick={() => { onClose(); onAction({ ...trip, __viewRequests: true }); }} sx={{ ...BTN, width: { xs: "100%", sm: "auto" }, bgcolor: colors.rust, "&:hover": { bgcolor: colors.rustDark } }}>
            View requests
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

/* ── Main ── */
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
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?.id || currentUser?._id;

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

    // If it's my own trip, go to requests management
    if (String(trip.createdBy?._id || trip.createdBy) === String(currentUserId)) {
      if (trip.__viewRequests) {
        navigate("/travelbuddy/requests", { state: { tab: "received", targetTripId: trip._id } });
      }
      return;
    }

    const targetRole = trip.role === "parent" ? "companion" : "parent";
    setSelectedTrip(null);
    navigate("/post-trip", {
      state: { role: targetRole, prefillTrip: trip, targetTripId: trip._id, requestMode: true },
    });
  };

  const now = Date.now();

  const openTrips = myTrips
    .filter((trip) => {
      if (trip.status !== "OPEN") return false;
      const departure = getDeparture(trip);
      if (!departure) return true;
      return departure.getTime() > now;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const upcomingTrips = myTrips
    .filter((trip) => {
      if (trip.status !== "MATCHED") return false;
      const departure = getDeparture(trip);
      return departure && departure.getTime() > now;
    })
    .sort((a, b) => getDeparture(a).getTime() - getDeparture(b).getTime());

  const currentTrips = myTrips
    .filter((trip) => {
      if (trip.status !== "MATCHED") return false;
      const departure = getDeparture(trip);
      const arrival = getArrival(trip);
      return departure && arrival && departure.getTime() <= now && arrival.getTime() > now;
    })
    .sort((a, b) => getDeparture(a).getTime() - getDeparture(b).getTime());

  const historyTrips = myTrips
    .filter((trip) => {
      if (["COMPLETED", "CANCELLED"].includes(trip.status)) return true;
      const arrival = getArrival(trip);
      return arrival && arrival.getTime() <= now;
    })
    .sort((a, b) => (getArrival(b)?.getTime() || 0) - (getArrival(a)?.getTime() || 0));

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

  const renderList = (trips, emptyMessage, showAction = true) =>
    trips.length ? (
      <Stack spacing={1.75} sx={{ mb: 2.5 }}>
        {trips.map((trip) => (
          <MyTripRow
            key={trip._id} trip={trip} showAction={showAction} currentUserId={currentUserId}
            viewDetails={setSelectedTrip}
            onViewMatches={(id, isMatched) => {
              if (isMatched) { navigate(`/trip-accepted/${id}`); return; }
              navigate("/travelbuddy/requests", { state: { tab: "received", targetTripId: id } });
            }}
          />
        ))}
      </Stack>
    ) : renderEmpty(emptyMessage);

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

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress size={32} sx={{ color: colors.rust }} /></Box>
          ) : (
            <Fade in timeout={250}>
              <Box>
                {activeTab === "browse" && (
                  <>
                    <Paper sx={{ p: 2, borderRadius: 3, border: `1px solid ${colors.border}`, mb: 3 }}>
                      <TextField fullWidth size="small" placeholder="Search by flight number (EK 544), airline, or airport code (MAA, ORD)" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: "#FAFAFA" } }} />
                    </Paper>
                    <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                      {globalTrips.length ? globalTrips.map((trip) => <GlobalTripRow key={trip._id} trip={trip} onViewDetails={setSelectedTrip} currentUserId={currentUserId} />) : renderEmpty("No public trips found matching your search.")}
                    </Stack>
                  </>
                )}
                {activeTab === "current" && (
                  <>
                    <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Matched trips happening right now.</Typography>
                    {renderList(currentTrips, "You don't have any current trips.")}
                  </>
                )}
                {activeTab === "upcoming" && (
                  <>
                    <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Confirmed matches with future departure dates appear here.</Typography>
                    {renderList(upcomingTrips, "You don't have any upcoming matched trips yet.")}
                  </>
                )}
                {activeTab === "mine" && (
                  <>
                    <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Open trips, including private offers awaiting a response.</Typography>
                    {renderList(openTrips, "You don't have any open trips.", true)}
                  </>
                )}
                {activeTab === "history" && (
                  <>
                    <Typography sx={{ color: colors.muted, mb: 2, fontSize: 13.5 }}>Completed and past-departure trips appear here.</Typography>
                    {renderList(historyTrips, "Your trip history is empty.", false)}
                  </>
                )}
              </Box>
            </Fade>
          )}

          <TripDetailsDialog trip={selectedTrip} onClose={() => setSelectedTrip(null)} onAction={handleGlobalAction} currentUserId={currentUserId} />
          <Box sx={{ bgcolor: colors.amberBg, color: colors.amberText, borderRadius: 2.5, px: 2.5, py: 1.75, fontSize: 13.5, lineHeight: 1.6, mt: 3 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>Safety basics:</Box>{" "}companions are volunteers, not caregivers or escorts. Nobody should carry items for anyone else. The family approves every helper.
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}