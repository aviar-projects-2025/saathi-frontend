import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardActionArea, Chip, Avatar, Paper, Stack, Typography,
  createTheme, ThemeProvider, CssBaseline, CircularProgress,
  TextField, InputAdornment, Fade, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, IconButton, useMediaQuery, useTheme, Alert,
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
  height: { xs: 44, sm: 46 },
  minHeight: { xs: 44, sm: 46 },
  px: 2,
  py: 0,
  borderRadius: 2,
  fontSize: { xs: 14, sm: 15 },
  fontWeight: 700,
  lineHeight: 1.2,
  textAlign: "center",
  boxShadow: "none",
  whiteSpace: "nowrap",
};
const actionStyles = {
  base: { ...BTN, width: { xs: "100%", sm: "auto", md: 170 }, minWidth: { sm: 150 } },
  contained: { bgcolor: colors.rustDark, color: "#fff", "&:hover": { bgcolor: "#9A2F06" } },
  outlined: { color: colors.rustDark, borderColor: colors.rustDark, borderWidth: 1.5, bgcolor: "#fff", "&:hover": { borderWidth: 1.5, borderColor: "#9A2F06", bgcolor: "#FFF4EE" } },
  danger: { color: "#B91C1C", borderColor: "#B91C1C", borderWidth: 1.5, bgcolor: "#fff", "&:hover": { borderWidth: 1.5, borderColor: "#991B1B", bgcolor: "#FEF2F2" } },
};

const labelSx = { fontSize: 12, color: colors.muted };
const valueSx = { fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" };

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

function RoleCard({ title, description, onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1, minWidth: 0, borderRadius: 3, bgcolor: "#fff",
        transition: "border-color 0.2s", "&:hover": { borderColor: colors.rust },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: { xs: 1.75, sm: 2.25 }, height: "100%" }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 17, md: 18 }, color: colors.navy, mb: 0.75 }}>{title}</Typography>
        <Typography sx={{ fontSize: { xs: 13, sm: 13.5, md: 14 }, color: colors.muted, lineHeight: 1.5 }}>{description}</Typography>
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

const rowPaperSx = {
  p: { xs: 1.5, sm: 2 },
  borderRadius: 3,
  borderColor: colors.border,
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "stretch", md: "center" },
  gap: { xs: 1.5, md: 2 },
  cursor: "pointer",
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};
const rowActionsSx = {
  flexShrink: 0,
  alignItems: "center",
  justifyContent: { xs: "flex-start", md: "flex-end" },
  flexWrap: "wrap",
  rowGap: 1,
  columnGap: 1.5,
  "& > .MuiButton-root": { flexBasis: { xs: "100%", sm: "auto" } },
};

function MyTripRow({ trip, onViewMatches, showAction = true, viewDetails, currentUserId, onEdit, onCancel }) {
  const isMatched = trip.status === "MATCHED";
  const isMine = String(trip.createdBy?._id || trip.createdBy) === String(currentUserId);
  const flightNos = trip.flights?.map((f) => f.flightNumber).join(" · ") || "No flights";
  const route = trip.flights?.length > 0 ? [trip.flights[0].fromCode, ...trip.flights.map((f) => f.toCode)].join(" → ") : "Unknown route";
  const dateStr = formatTripDate(trip.flights?.[0]?.departureTime, "eee MM/dd/yyyy h:mm a");

  const canEdit = isMine && trip.status === "OPEN" && !trip.isRequestSubmission;
  const canCancel = isMine && ["OPEN", "MATCHED"].includes(trip.status);

  return (
    <Paper
      variant="outlined"
      onClick={() => viewDetails(trip)}
      sx={{ ...rowPaperSx, transition: "box-shadow 0.2s", "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.05)" } }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Avatar src={trip?.createdBy?.profileImageUrl} sx={{ bgcolor: isMatched ? "#DDF4E4" : "#DCEBFA", width: { xs: 40, sm: 44 }, height: { xs: 40, sm: 44 }, flexShrink: 0 }}>
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 15, md: 16 }, color: "#1F2937", overflowWrap: "anywhere", lineHeight: 1.35 }}>
            {trip.relationship || "Traveller"} · {flightNos} · {route}
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25, overflowWrap: "anywhere" }}>
            {dateStr} · {trip.flights?.length || 0} segment{trip.flights?.length > 1 ? "s" : ""}
            {!isMine && trip.createdBy?.firstName ? ` · ${trip.createdBy.firstName}` : ""}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={rowActionsSx}>
        <StatusChip status={trip.status} />
        {trip.status === "OPEN" && trip.isRequestSubmission && (
          <Chip size="small" label="Private offer" sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 700 }} />
        )}

        {showAction && canEdit && (
          <Button
            variant="outlined"
            disableElevation
            onClick={(e) => { e.stopPropagation(); onEdit?.(trip); }}
            sx={{ ...actionStyles.base, ...actionStyles.outlined }}
          >
            Edit
          </Button>
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
            variant="outlined"
            disableElevation
            onClick={(e) => { e.stopPropagation(); onViewMatches(trip._id, true); }}
            sx={{ ...actionStyles.base, ...actionStyles.outlined }}
          >
            Open trip
          </Button>
        )}

        {showAction && canCancel && (
          <Button
            variant="outlined"
            disableElevation
            onClick={(e) => { e.stopPropagation(); onCancel?.(trip); }}
            sx={{ ...actionStyles.base, ...actionStyles.danger }}
          >
            Cancel
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
        ...rowPaperSx,
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": { boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", borderColor: colors.rust },
        "&:focus-visible": { outline: `2px solid ${colors.rust}`, outlineOffset: 2 },
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <ProtectedAvatar
          src={trip.createdBy?.profileImageUrl || ""} alt={userName}
          sx={{ width: { xs: 42, sm: 48 }, height: { xs: 42, sm: 48 }, flexShrink: 0, bgcolor: isParent ? "#DCEBFA" : "#DDF4E4" }}
        >
          <FlightIcon sx={{ color: "#1E293B", transform: "rotate(45deg)", fontSize: 20 }} />
        </ProtectedAvatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, sm: 15, md: 16 }, color: "#1F2937", overflowWrap: "anywhere", lineHeight: 1.35 }}>
            {userName}{isOwn ? " (you)" : ""} ·{" "}
            <span style={{ color: isParent ? colors.navy : "#14653A" }}>{isParent ? "Needs Help" : "Can Help"}</span>
          </Typography>
          <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: colors.muted, mt: 0.25, overflowWrap: "anywhere" }}>
            {flightNos} · {route} · {dateStr}
          </Typography>
          <Typography sx={{ fontSize: 12, color: colors.rust, fontWeight: 700, mt: 0.75 }}>
            {isOwn ? "Your trip · Tap to view" : "Tap to view full trip details"}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" sx={rowActionsSx}>
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

function InfoItem({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography sx={valueSx}>{children}</Typography>
    </Box>
  );
}

function TripDetailsDialog({ trip, onClose, onAction, currentUserId }) {
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  if (!trip) return null;
  const isParent = trip.role === "parent";
  const userName = [trip.createdBy?.firstName, trip.createdBy?.lastName].filter(Boolean).join(" ") || "Community member";
  const flights = Array.isArray(trip.flights) ? trip.flights : [];
  const isOwn = String(trip.createdBy?._id || trip.createdBy) === String(currentUserId);
  const canRequest = !isOwn && trip.status === "OPEN" && !trip.isRequestSubmission;

  const dialogBtn = { ...BTN, width: { xs: "100%", sm: "auto" } };

  return (
    <Dialog
      open onClose={onClose} fullWidth maxWidth="sm" scroll="paper" fullScreen={fullScreen}
      PaperProps={{ sx: { m: { xs: 0, sm: 2 }, width: { sm: "calc(100% - 32px)" }, maxHeight: { sm: "calc(100% - 32px)" } } }}
    >
      <DialogTitle sx={{ pr: 7, pb: 1, pt: { xs: "calc(16px + env(safe-area-inset-top, 0px))", sm: 2 }, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ProtectedAvatar
            src={trip.createdBy?.profileImageUrl|| ""} alt={userName}
            sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, flexShrink: 0, bgcolor: "#DCEBFA" }}
          >
            <FlightIcon />
          </ProtectedAvatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: { xs: 17, sm: 19 }, fontWeight: 800, color: colors.navy, overflowWrap: "anywhere", lineHeight: 1.25 }}>{userName}{isOwn ? " (you)" : ""}</Typography>
            <Typography sx={{ fontSize: 13, color: colors.muted, overflowWrap: "anywhere" }}>
              {isParent ? `Parent trip${trip.relationship ? ` · ${trip.relationship}` : ""}` : "Companion trip"}
              {isParent && trip.ageBand ? ` · Age ${trip.ageBand}` : ""}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose} aria-label="Close"
            sx={{ position: "absolute", top: { xs: "calc(8px + env(safe-area-inset-top, 0px))", sm: 8 }, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#FFFEFC", px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: colors.navy }}>Trip details</Typography>
            <StatusChip status={trip.status} />
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
            <InfoItem label="Trip role">{isParent ? "Needs help" : "Can help"}</InfoItem>
            <InfoItem label="Posted">{formatTripDate(trip.createdAt, "MMM d, yyyy")}</InfoItem>
            <InfoItem label="Pickup">{trip.pickup === "family" ? "Family pickup" : trip.pickup === "saathi" ? "Saathi pickup" : trip.pickup}</InfoItem>
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Flight itinerary ({flights.length})</Typography>
            <Stack spacing={1.5}>
              {flights.map((flight, index) => (
                <Paper key={flight._id || index} variant="outlined" sx={{ p: { xs: 1.5, sm: 1.75 }, borderRadius: 2.5, borderColor: colors.border, bgcolor: "#fff" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: colors.navy, flexShrink: 0 }}>Flight {index + 1}</Typography>
                    <Chip size="small" icon={<FlightIcon />} label={flight.airline || "Airline not provided"} sx={{ maxWidth: { xs: "60%", sm: "65%" } }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 800 }}>{flight.fromCode}</Typography><Typography sx={{ fontSize: 11, color: colors.muted }}>Departure</Typography></Box>
                    <FlightIcon sx={{ color: colors.rust, transform: "rotate(45deg)", flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0, textAlign: "right" }}><Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 800 }}>{flight.toCode}</Typography><Typography sx={{ fontSize: 11, color: colors.muted }}>Arrival</Typography></Box>
                  </Stack>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
                    <InfoItem label="Flight no.">{flight.flightNumber || "—"}</InfoItem>
                    <InfoItem label="Airline">{flight.airline || "—"}</InfoItem>
                    <InfoItem label="Departure">{formatTripDate(flight.departureTime)}</InfoItem>
                    <InfoItem label="Arrival">{formatTripDate(flight.arrivalTime)}</InfoItem>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Divider />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: colors.navy, mb: 1.5 }}>Preferences</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
              <InfoItem label="Languages">{trip.languages?.length ? trip.languages.join(", ") : "Not specified"}</InfoItem>
              <InfoItem label={isParent ? "Help needed" : "Help offered"}>{trip.help?.length ? trip.help.join(", ") : "Not specified"}</InfoItem>
              {isParent && <InfoItem label="Relationship">{trip.relationship || "—"}</InfoItem>}
              {isParent && <InfoItem label="Traveller age">{trip.ageBand || "—"}</InfoItem>}
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2, gap: 1,
          pb: { xs: "calc(16px + env(safe-area-inset-bottom, 0px))", sm: 2 },
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          "& > :not(style) ~ :not(style)": { ml: 0 },
        }}
      >
        <Button onClick={onClose} sx={{ ...dialogBtn, color: colors.muted }}>Close</Button>
        {canRequest && (
          <Button variant="contained" disableElevation onClick={() => onAction(trip)} sx={{ ...dialogBtn, bgcolor: colors.rust, "&:hover": { bgcolor: colors.rustDark } }}>
            {isParent ? "Offer to Help" : "Ask for Help"}
          </Button>
        )}
        {isOwn && trip.status === "OPEN" && !trip.isRequestSubmission && (
          <Button variant="contained" disableElevation onClick={() => { onClose(); onAction({ ...trip, __viewRequests: true }); }} sx={{ ...dialogBtn, bgcolor: colors.rust, "&:hover": { bgcolor: colors.rustDark } }}>
            View requests
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

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
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
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

  const reloadTrips = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, globalRes] = await Promise.all([
        axios.get(`${Api}/travel-buddy/my-trips`, { headers }),
        axios.get(`${Api}/travel-buddy`, { headers, params: { search } }),
      ]);
      setMyTrips(Array.isArray(myRes.data?.data) ? myRes.data.data : []);
      setGlobalTrips(Array.isArray(globalRes.data?.data) ? globalRes.data.data : []);
    } catch (err) {
      console.error("Failed to reload trips", err);
    }
  };

  const handleGlobalAction = (trip) => {
    if (!trip?._id || trip.status !== "OPEN") return;
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

  const handleCancelTrip = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${Api}/travel-buddy/${cancelTarget._id}/cancel`, {}, { headers });
      setCancelTarget(null);
      setSelectedTrip(null);
      await reloadTrips();
    } catch (err) {
      console.error("Failed to cancel trip", err);
      alert(err.response?.data?.message || "Failed to cancel trip.");
    } finally {
      setCancelling(false);
    }
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
    <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, borderColor: colors.border, textAlign: "center", bgcolor: "#fff" }}>
      <Typography sx={{ color: colors.muted, fontSize: 14, mb: action ? 2 : 0 }}>{message}</Typography>
      {action && <Button variant="contained" disableElevation onClick={() => navigate("/post-trip")} sx={{ ...actionStyles.base, ...actionStyles.contained, width: { xs: "100%", sm: "auto" }, px: 3 }}>Post your first trip</Button>}
    </Paper>
  );

  const renderList = (trips, emptyMessage, showAction = true) =>
    trips.length ? (
      <Stack spacing={{ xs: 1.5, sm: 1.75 }} sx={{ mb: 2.5 }}>
        {trips.map((trip) => (
          <MyTripRow
            key={trip._id}
            trip={trip}
            showAction={showAction}
            currentUserId={currentUserId}
            viewDetails={setSelectedTrip}
            onEdit={(t) => navigate("/post-trip", { state: { editTrip: t } })}
            onCancel={setCancelTarget}
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
      <Box
        sx={{
          bgcolor: colors.bg,
          minHeight: "100vh",
          "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
          width: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
          py: { xs: 2, sm: 3, md: 4 },
          pl: { xs: "max(16px, env(safe-area-inset-left, 0px))", sm: 3, md: 4 },
          pr: { xs: "max(16px, env(safe-area-inset-right, 0px))", sm: 3, md: 4 },
          pb: { xs: "calc(16px + env(safe-area-inset-bottom, 0px))", sm: 3, md: 4 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 720, md: 880, xl: 960 }, mx: "auto" }}>
          <Typography component="h1" sx={{ fontSize: { xs: 24, sm: 28, md: 30 }, fontWeight: 800, color: colors.navy, lineHeight: 1.2 }}>Travel Buddy</Typography>
          <Typography sx={{ fontSize: { xs: 13, sm: 14, md: 15 }, color: colors.muted, mt: 0.5, mb: { xs: 2, sm: 2.5 }, maxWidth: 680 }}>
            Find a trusted community member on the same flight to help a parent travelling from India to the US.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ mb: { xs: 3, sm: 4 }, alignItems: "stretch" }}
          >
            <RoleCard title="My parent needs a companion" description="Post your parent's flight. Members on the same flight can offer to look out for them." onClick={() => navigate("/post-trip")} />
            <RoleCard title="I'm flying and can help" description="Volunteer to be a companion for a senior on your flight. You never carry items for anyone." onClick={() => navigate("/post-trip", { state: { role: "companion" } })} />
          </Stack>

          <Box
            sx={{
              mb: 3,
              mx: { xs: -2, sm: 0 },
              px: { xs: 2, sm: 0 },
              overflowX: { xs: "auto", sm: "visible" },
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              role="tablist"
              sx={{
                width: { xs: "max-content", sm: "auto" },
                minWidth: { xs: "100%", sm: 0 },
                justifyContent: { xs: "flex-start", md: "center" },
                flexWrap: { xs: "nowrap", sm: "wrap" },
                rowGap: 1,
                pb: { xs: 0.5, sm: 0 },
              }}
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <Chip
                    key={tab.key}
                    role="tab"
                    aria-selected={active}
                    label={`${tab.label}${tab.count !== null ? ` (${tab.count})` : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                    sx={{
                      height: { xs: 40, sm: 42 }, px: { xs: 1, sm: 1.5 },
                      fontSize: { xs: 13, sm: 13.5 }, fontWeight: 700, borderRadius: "21px",
                      flexShrink: 0,
                      bgcolor: active ? colors.activeChip : "#fff",
                      color: active ? "#fff" : colors.navy,
                      border: `1.5px solid ${active ? colors.activeChip : colors.border}`,
                      "&:hover": { bgcolor: active ? colors.activeChip : "#F3EFE6" },
                      boxShadow: active ? "0 4px 12px rgba(27,42,92,0.2)" : "none",
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress size={32} sx={{ color: colors.rust }} /></Box>
          ) : (
            <Fade in timeout={250}>
              <Box>
                {activeTab === "browse" && (
                  <>
                    <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, border: `1px solid ${colors.border}`, mb: 3 }}>
                      <TextField
                        fullWidth size="small"
                        placeholder="Search by flight number (EK 544), airline, or airport code (MAA, ORD)"
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                          sx: { borderRadius: 2, bgcolor: "#FAFAFA", fontSize: { xs: 16, sm: 14 } },
                        }}
                      />
                    </Paper>
                    <Stack spacing={{ xs: 1.5, sm: 1.75 }} sx={{ mb: 2.5 }}>
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

          <Dialog open={Boolean(cancelTarget)} onClose={() => !cancelling && setCancelTarget(null)} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 800 }}>
              {cancelTarget?.status === "MATCHED" ? "Cancel matched trip?" : "Cancel trip?"}
            </DialogTitle>
            <DialogContent>
              <Typography sx={{ fontSize: 14 }}>
                {cancelTarget?.status === "MATCHED"
                  ? "This will cancel the match. The other member's trip will go back to OPEN and they'll be notified that you cancelled. Your trip will be marked CANCELLED."
                  : "This will cancel your trip. Any pending requests aimed at this trip will be declined automatically."}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: "column-reverse", sm: "row" } }}>
              <Button onClick={() => setCancelTarget(null)} disabled={cancelling} sx={{ width: { xs: "100%", sm: "auto" } }}>
                Keep trip
              </Button>
              <Button
                onClick={handleCancelTrip}
                disabled={cancelling}
                variant="contained"
                sx={{ bgcolor: "#B91C1C", "&:hover": { bgcolor: "#991B1B" }, width: { xs: "100%", sm: "auto" } }}
              >
                {cancelling ? "Cancelling..." : "Cancel trip"}
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ bgcolor: colors.amberBg, color: colors.amberText, borderRadius: 2.5, px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 1.75 }, fontSize: { xs: 13, sm: 13.5 }, lineHeight: 1.6, mt: 3 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>Safety basics:</Box>{" "}companions are volunteers, not caregivers or escorts. Nobody should carry items for anyone else. The family approves every helper.
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}