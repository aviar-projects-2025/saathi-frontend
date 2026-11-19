import React, { useEffect, useState, useRef } from "react";
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Stack, CircularProgress, Divider, useMediaQuery, Avatar, useTheme,
  Collapse, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import TrainIcon from "@mui/icons-material/Train";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import Api from "../Api";
import OfferRide from "./OfferRide.jsx";
import RideDetailsModal from "./RideDetails";
import ToastConfig from "../components/ToastConfig.jsx";
import { useRide } from "../context/RideContext";
import { useNotifications } from "../context/NotificationContext";
import { useRating } from "../context/RatingContext";
import socket from "../socket"; // ★ IMPORT
import ProtectedAvatar from "../components/ProtectedAvatar.jsx";

/* ───────────── design tokens ───────────── */
const BRAND = "#E8650A";
const LINE = "#E8DED4";
const KIND = {
  offer: { label: "🚗 You’re offering a ride", short: "Offering", color: "#2D6A4F", bg: "#E8F5E9" },
  request: { label: "🙋 You need a ride", short: "Need a ride", color: "#3F4FBF", bg: "#ECEEFC" },
  matched: { label: "🙋 You need a ride · driver confirmed", short: "Need a ride", color: "#3F4FBF", bg: "#ECEEFC" },
  driving: { label: "🤝 You’re the driver", short: "Offering", color: "#2D6A4F", bg: "#E8F5E9" },
};

const isMatched = (ride) => ride?.kind === "request" && Boolean(ride?.helpProposalId);

// What this ride is to ME: "offer" (I'm driving) or "request" (I need a ride)
const roleOf = (ride, userId) => {
  const me = String(userId || "");
  const driverIsMe = String(getRefId(ride?.actualDriver) || "") === me;
  const ownerIsMe = String(getRefId(ride?.createdBy) || "") === me;
  if (isMatched(ride) && driverIsMe && !ownerIsMe) return "offer";
  return ride?.kind === "request" ? "request" : "offer";
};

const personName = (p) =>
  [p?.firstName, p?.lastName].filter(Boolean).join(" ") || "a community member";

// A request is "pending" if it still has unhandled seats.
// Falls back to status for requests without seat fields.
const isPendingRequest = (r) => {
  if (r?.pendingReqSeats != null) return Number(r.pendingReqSeats) > 0;
  return String(r?.status || "").toUpperCase() === "PENDING";
};

// Totals of approved / rejected / pending across all requests on a ride.
// Uses seat counts when the backend sends them, otherwise counts one per request by status.
const requestStats = (reqs = []) =>
  reqs.reduce(
    (acc, r) => {
      const hasSeats = r?.approvedSeats != null || r?.rejectedSeats != null || r?.pendingReqSeats != null;
      if (hasSeats) {
        acc.approved += Number(r.approvedSeats || 0);
        acc.rejected += Number(r.rejectedSeats || 0);
        acc.pending += Number(r.pendingReqSeats || 0);
      } else {
        const s = String(r?.status || "").toUpperCase();
        if (["ACCEPTED", "APPROVED"].includes(s)) acc.approved += 1;
        else if (["REJECTED", "AUTO_REJECTED"].includes(s)) acc.rejected += 1;
        else if (s === "PENDING") acc.pending += 1;
      }
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 }
  );

const statusLabelOf = (ride, { pendingCount = 0, requestCount = 0 } = {}) => {
  if (ride?.travelStatus === "Cancelled") return "Cancelled";
  if (ride?.travelStatus === "Completed") return "Completed";
  if (ride?.travelStatus === "Started") return "Ongoing";
  if (ride?.kind === "request") {
    if (isMatched(ride)) return "Driver confirmed";
    return ride?.status === "CLOSED" ? "Request closed" : "Waiting for a driver";
  }
  // offered ride
  if (ride?.status === "FULL") return "Filled";
  if (pendingCount > 0) return `${pendingCount} pending request${pendingCount > 1 ? "s" : ""}`;
  if (requestCount > 0) return "All requests handled";
  return "Open for requests";
};
const travelIcons = {
  Car: DirectionsCarIcon, Bus: DirectionsBusIcon, Bike: TwoWheelerIcon,
  Flight: FlightIcon, Ship: DirectionsBoatIcon, Train: TrainIcon,
};

/* ───────────── helpers ───────────── */
const getRefId = (v) => v?._id || v?.id || v;
const idOf = (r) => String(r?._id || r?.id || "");
const formFrom = (ride) => ride?.from || "—";
const formTo = (ride) => ride?.destination || ride?.to || "—";
const fmtDate = (d) => {
  const x = new Date(d);
  return isNaN(x) ? "—" : x.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (d) => {
  const x = new Date(d);
  return isNaN(x) ? "—" : x.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

/* ───────────── small components ───────────── */
function EmptyState({ message1, message2 }) {
  return (
    <Box sx={{ width: "100%", maxWidth: 480, textAlign: "center", mx: "auto", mt: { xs: "20%", sm: "8%" }, px: 2 }}>
      <Typography variant="h6" fontWeight={600}>{message1}</Typography>
      <Typography color="text.secondary" sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" }, mt: 1.2 }}>{message2}</Typography>
    </Box>
  );
}

function KindFilter({ value, onChange, rides, userId }) {
  const n = (k) => rides.filter((r) => k === "all" || roleOf(r, userId) === k).length;

  return (
    <ToggleButtonGroup
      exclusive fullWidth value={value} onChange={(_, v) => v && onChange(v)}
      sx={{
        my: 1.5, bgcolor: LINE, p: "4px", borderRadius: "12px",
        "& .MuiToggleButton-root": { border: 0, borderRadius: "9px !important", textTransform: "none", fontWeight: 600, fontSize: { xs: "0.72rem", sm: "0.82rem" }, color: "#6f6a64", py: 0.8, px: 0.5, whiteSpace: "nowrap" },
        "& .Mui-selected": { bgcolor: "#fff !important", color: "#242424 !important", boxShadow: "0 1px 3px rgba(0,0,0,.15)" },
      }}
    >
      <ToggleButton value="all">All {n("all")}</ToggleButton>
      <ToggleButton value="offer">🚗 Offering {n("offer")}</ToggleButton>
      <ToggleButton value="request">🙋 Need a ride {n("request")}</ToggleButton>
    </ToggleButtonGroup>
  );
}

function EditRideModal({ ride, onSave, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog
      open={Boolean(ride)} fullWidth maxWidth="sm" fullScreen={isMobile}
      onClose={(e, reason) => { if (reason !== "backdropClick") onClose(); }}
      PaperProps={{ sx: { width: { xs: "100%", sm: "95%", md: "90%" }, maxWidth: { sm: 600, md: 800 }, borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2 }, overflow: "hidden" } }}
    >
      <DialogTitle sx={{ position: "relative", fontWeight: 700, py: 2, pr: 6 }}>
        Edit Ride
        <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", top: 12, right: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: "flex", justifyContent: "center", p: { xs: 1, sm: 3 }, overflowY: "auto", maxHeight: { xs: "100vh", sm: "80vh" } }}>
        {ride && <OfferRide ride={ride} onSave={onSave} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({ ride, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.patch(
        `${Api}/rides/cancelride/${ride._id || ride.id}?type=Cancel`, {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      onConfirm(ride);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel ride. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open maxWidth="xs" fullWidth onClose={(e, reason) => { if (reason !== "backdropClick") onClose(); }}
      PaperProps={{ sx: { borderRadius: 3, mx: { xs: 2, sm: "auto" }, width: { xs: "calc(100% - 32px)", sm: "100%" } } }}>
      <DialogTitle sx={{ fontWeight: 800, pr: 5, fontSize: { xs: "1rem", sm: "1.15rem" } }}>
        Are you sure you want to cancel this ride?
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: "absolute", right: 8, top: 8, width: 44, height: 44 }}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" } }}>
          This will cancel your ride. Anyone who requested it will be notified.
        </Typography>
        <Paper elevation={0} sx={{ mt: 2, px: 2, py: 1.5, bgcolor: "#FFF8F2", border: "1px solid #F0E6DC", borderRadius: 2.5 }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, wordBreak: "break-word" }}>
            {formFrom(ride)} <Box component="span" sx={{ color: BRAND, mx: 0.5 }}>→</Box> {formTo(ride)}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#757575", fontWeight: 500 }}>{fmtDate(ride.startTime)}</Typography>
        </Paper>
        {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ flex: 1, minHeight: 44, bgcolor: "#757575", color: "#fff", "&:hover": { bgcolor: "#616161" } }}>Keep ride</Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={deleting} sx={{ flex: 1, minHeight: 44, fontWeight: 700 }}>
          {deleting ? "Cancelling..." : "Cancel Ride"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ───────────── ride card ───────────── */
function RideCard({
  ride, user, isCurrentRide, showEdit, showDelete, onEdit, onDelete,
  rideRequests, pendingCount, offersCount, stats,
  notificationRide, setNotificationRide,
  onApprove, onReject, onRequestUpdated, approveLoading, rejectLoading,
  onTravelAction, actionLoading,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = user?.id || user?._id;
  const matched = isMatched(ride);
  const role = roleOf(ride, currentUserId);
  const isOffer = role === "offer";
  const k = KIND[matched ? (isOffer ? "driving" : "matched") : isOffer ? "offer" : "request"];
  const Mode = travelIcons[ride?.modeOfTravel] || DirectionsCarIcon;
  const isOwner = String(getRefId(ride?.createdBy) || "") === String(currentUserId || "");
  const isActualDriver = String(getRefId(ride?.actualDriver) || "") === String(currentUserId || "");
  const canManageTravel = isOwner || (Boolean(ride?.helpProposalId) && isActualDriver);
  const isStarted = ride?.travelStatus === "Started";
  const isCompleted = ride?.travelStatus === "Completed";
  const isCancelled = ride?.travelStatus === "Cancelled";
  const busy = actionLoading === idOf(ride);
  const hasPendingStatus = !isCompleted && !isCancelled && !isStarted && isOffer && !matched && pendingCount > 0;

  useEffect(() => {
    if (!notificationRide) return;
    if (ride?._id && ride._id.toString() === notificationRide.toString()) {
      setDetailsOpen(true);
      setNotificationRide(null);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [notificationRide, ride]);

  const strong = (t) => <b style={{ color: k.color }}>{t}</b>;
  let footerText;

  if (isCompleted || isCancelled) {
    footerText = isCompleted
      ? "This ride is complete"
      : "This ride was cancelled";
  } else if (matched) {
    footerText = isOffer
      ? <>Passenger: {strong(personName(ride.createdBy))}</>
      : <>Driver: {strong(personName(ride.actualDriver))}</>;
  } else if (isOffer) {
    footerText = rideRequests.length > 0 && stats ? (
      <>
        <b style={{ color: "#2D6A4F" }}>{stats.approved} Approved</b>
        {" · "}
        <b style={{ color: "#9B2226" }}>{stats.rejected} Rejected</b>
        {" · "}
        <b style={{ color: "#C65B00" }}>{stats.pending} Pending</b>
      </>
    ) : "No requests yet";
  } else {
    footerText = offersCount > 0
      ? <>{strong(`${offersCount} offer${offersCount > 1 ? "s" : ""}`)} to help you</>
      : "No offers yet · we’ll notify you";
  }

  return (
    <>
      <Box sx={{ bgcolor: "#fff", border: `1px solid ${LINE}`, borderTop: `4px solid ${k.color}`, borderRadius: "16px", overflow: "hidden", mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, px: 2, pt: 1.5, flexWrap: "wrap" }}>
          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
            <Chip size="small" label={k.label} sx={{ bgcolor: k.bg, color: k.color, fontWeight: 700, borderRadius: "8px" }} />
          </Stack>
          <Typography
            sx={{
              fontSize: "0.76rem",
              fontWeight: 600,
              color: isCompleted ? "#2D6A4F" : isCancelled ? "#9B2226" : hasPendingStatus ? "#C65B00" : "text.secondary",
            }}
          >
            {statusLabelOf(ride, { pendingCount, requestCount: rideRequests.length })}
          </Typography>
        </Box>

        <Box onClick={() => setDetailsOpen(true)} sx={{ display: "grid", gridTemplateColumns: "14px 1fr", columnGap: 1.5, px: 2, pt: 1.75, cursor: "pointer" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.8 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${k.color}` }} />
            <Box sx={{ flex: 1, width: 2, bgcolor: LINE, my: 0.4, minHeight: 22 }} />
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: k.color }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>FROM</Typography>
            <Typography fontWeight={700} sx={{ mb: 1, overflowWrap: "anywhere" }}>{formFrom(ride)}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>TO</Typography>
            <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>{formTo(ride)}</Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          sx={{
            display: "flex",
            flexWrap: "wrap",
            px: 2,
            py: 1.5,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflowX: "visible",
            "& .MuiChip-root": {
              flexShrink: 0,
              maxWidth: "100%",
            },
            "& .MuiChip-label": {
              whiteSpace: "nowrap",
            },
          }}
        >
          <Chip
            size="small"
            variant="outlined"
            icon={<CalendarTodayIcon />}
            label={`${fmtDate(ride.startTime)} · ${fmtTime(ride.startTime)}`}
          />

          <Chip
            size="small"
            variant="outlined"
            icon={<Mode />}
            label={ride.modeOfTravel || "Car"}
          />

          {ride.kind === "offer" && ride.modeOfTravel !== "Flight" && (
            <>
              <Chip
                size="small"
                variant="outlined"
                icon={<EventSeatIcon />}
                label={`${ride.totalSeats} Total seat${ride.totalSeats === 1 ? "" : "s"}`}
              />

              <Chip
                size="small"
                variant="outlined"
                icon={<EventSeatIcon />}
                label={`${ride.availableSeats} Available seat${ride.availableSeats === 1 ? "" : "s"}`}
              />
            </>
          )}

          {ride.kind === "request" && (
            <Chip
              size="small"
              variant="outlined"
              icon={<EventSeatIcon />}
              label={`${ride.passengers || 1} passenger${(ride.passengers || 1) === 1 ? "" : "s"}`}
            />
          )}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, bgcolor: k.bg, px: 2, py: 1.25, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.84rem", flex: "1 1 140px" }}>{footerText}</Typography>
          <Stack direction="row" spacing={1}>
            {isCurrentRide && canManageTravel && !isCompleted && !isCancelled && (
              <Button size="small" variant="contained" disabled={busy} onClick={() => onTravelAction(ride)}
                sx={{ bgcolor: isStarted ? "#C62828" : "#E8650A", boxShadow: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: isStarted ? "#9B1C1C" : "#C85508" } }}>
                {busy ? "Please wait…" : isStarted ? "Complete Ride" : "Start Ride"}
              </Button>
            )}
            <Button size="small" variant="contained" onClick={() => setDetailsOpen(true)}
              sx={{ bgcolor: k.color, boxShadow: "none", whiteSpace: "nowrap", "&:hover": { bgcolor: k.color, opacity: 0.9 } }}>
              {isOffer && pendingCount > 0 ? "Review" : "View"}
            </Button>
          </Stack>
        </Box>
      </Box >

      {detailsOpen && (
        <RideDetailsModal
          isCurrentRide={isCurrentRide}
          ride={ride} user={user} showEdit={showEdit} showDelete={showDelete}
          onEdit={onEdit} onDelete={onDelete} onClose={() => setDetailsOpen(false)}
          requests={rideRequests} onApprove={onApprove} onReject={onReject}
          onRequestUpdated={onRequestUpdated} approveLoading={approveLoading} rejectLoading={rejectLoading}
        />
      )
      }
    </>
  );
}

/* ───────────── page ───────────── */
const MyRides = () => {
  const location = useLocation();
  const { notifications } = useNotifications();
  const { refreshRide } = useRide();
  const { triggerRatingCheck } = useRating();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?.id || currentUser?._id;
  const ITEMS_PER_PAGE = 10;
  const toasts = ToastConfig();

  const [rideCounts, setRideCounts] = useState({ current: 0, upcoming: 0, posts: 0, history: 0 });
  const tabs = [
    { key: "current", label: `Current (${rideCounts.current})`, empty1: "No rides in progress", empty2: "You don’t have any rides in progress right now.", current: true, edit: true, del: true },
    { key: "upcoming", label: `Upcoming (${rideCounts.upcoming})`, empty1: "No upcoming rides", empty2: "You don’t have any upcoming rides scheduled.", current: false, edit: true, del: true },
    { key: "posts", label: `My Posts (${rideCounts.posts})`, empty1: "No posted rides", empty2: "You haven’t posted any rides yet.", current: false, edit: true, del: true },
    { key: "history", label: `History (${rideCounts.history})`, empty1: "No ride history", empty2: "No completed or cancelled rides yet.", current: false, edit: false, del: false },
  ];

  const emptyPage = () => ({ rides: [], page: 0, hasMore: true, total: null, loading: false, loaded: false });
  const [data, setData] = useState({ current: emptyPage(), upcoming: emptyPage(), posts: emptyPage(), history: emptyPage() });
  const [tab, setTab] = useState(0);
  const [kind, setKind] = useState("all");
  const [allRequests, setAllRequests] = useState([]);
  const [editRide, setEditRide] = useState(null);
  const [deleteRide, setDeleteRide] = useState(null);
  const [confirmRide, setConfirmRide] = useState(null);
  const [notificationRide, setNotificationRide] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [helpProposals, setHelpProposals] = useState([]);
  const [loadingHelpProposals, setLoadingHelpProposals] = useState(false);
  const [respondingProposalId, setRespondingProposalId] = useState(null);
  const [offersOpen, setOffersOpen] = useState(location?.state?.offersOpen || false);

  const sentinelRef = useRef(null);
  const processedRideIds = useRef(new Set());
  const processedNotificationIds = useRef(new Set());
  const categoryLoadingRef = useRef({ current: false, upcoming: false, posts: false, history: false });

  const active = tabs[tab];
  const activeData = data[active.key];

  const authConfig = () => {
    const t = localStorage.getItem("token");
    return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
  };
  const setCategory = (category, patch) => setData((prev) => ({ ...prev, [category]: { ...prev[category], ...patch } }));

  /* ── help proposals ── */
  const pendingProposals = helpProposals.filter((p) => p?.status === "PENDING");

  const fetchHelpProposals = async () => {
    if (!currentUserId) { setHelpProposals([]); return; }
    try {
      setLoadingHelpProposals(true);
      const res = await axios.get(`${Api}/help-proposals/received`, authConfig());
      const body = res?.data;
      setHelpProposals(Array.isArray(body?.data) ? body.data : Array.isArray(body?.proposals) ? body.proposals : Array.isArray(body) ? body : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load help proposals", toasts);
    } finally {
      setLoadingHelpProposals(false);
    }
  };

  const respondToHelpProposal = async (proposalId, action) => {
    if (!proposalId || !["accept", "reject"].includes(action)) return;
    try {
      setRespondingProposalId(proposalId);
      const res = await axios.patch(`${Api}/help-proposals/${proposalId}/respond`, { action }, authConfig());
      toast.success(res?.data?.message || (action === "accept" ? "Offer accepted" : "Offer declined"), toasts);
      await refreshAllCategories();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to process this proposal", toasts);
    } finally {
      setRespondingProposalId(null);
    }
  };

  /* ── data fetching ── */
  const fetchCategory = async (category, { reset = false } = {}) => {
    if (!currentUserId) { setInitialLoading(false); return; }
    const state = data[category];
    if (categoryLoadingRef.current[category]) return;
    if (!reset && state.loaded && !state.hasMore) return;
    const page = reset ? 1 : state.page + 1;

    categoryLoadingRef.current[category] = true;
    setCategory(category, { loading: true });
    try {
      const res = await axios.get(`${Api}/rides/get`, { params: { type: "my", category, page, limit: ITEMS_PER_PAGE }, ...authConfig() });
      const body = res?.data || {};
      const rides = Array.isArray(body.data) ? body.data : [];
      const hasMore = typeof body.hasMore === "boolean" ? body.hasMore : rides.length === ITEMS_PER_PAGE;
      const total = typeof body.total === "number" ? body.total : typeof body.totalRides === "number" ? body.totalRides : null;
      setData((prev) => {
        const old = reset ? [] : prev[category].rides;
        const ids = new Set(old.map(idOf));
        const unique = rides.filter((r) => !ids.has(idOf(r)));
        return { ...prev, [category]: { ...prev[category], rides: reset ? rides : [...old, ...unique], page, hasMore, total, loading: false, loaded: true } };
      });
    } catch (error) {
      setCategory(category, { loading: false, loaded: true });
      toast.error(error?.response?.data?.message || `Failed to load ${category} rides`, toasts);
    } finally {
      categoryLoadingRef.current[category] = false;
      setInitialLoading(false);
    }
  };

  const refreshCategory = async (category) => {
    setCategory(category, { rides: [], page: 0, hasMore: true, total: null, loaded: false, loading: false });
    await fetchCategory(category, { reset: true });
  };

  const fetchAllRequests = async () => {
    if (!currentUserId) return;
    try {
      const res = await axios.get(`${Api}/bookride/${currentUserId}?type=received`, authConfig());
      setAllRequests(res?.data?.data || []);
    } catch (error) {
      console.error("[MY_RIDES][REQUESTS] Failed", error);
    }
  };

  const fetchRideCounts = async () => {
    try {
      const res = await axios.get(`${Api}/rides/my/counts`, authConfig());
      if (res.data?.success) setRideCounts(res.data.data);
    } catch (error) {
      console.error("[MY_RIDES][COUNTS] failed", error);
    }
  };

  const refreshAllCategories = async () => {
    await Promise.all([
      fetchCategory("current", { reset: true }),
      fetchCategory("upcoming", { reset: true }),
      fetchCategory("posts", { reset: true }),
      fetchCategory("history", { reset: true }),
      fetchAllRequests(),
      fetchRideCounts(),
      fetchHelpProposals(),
    ]);
  };

  /* ── request approve / reject ── */
  const handleApprove = async (requestId) => {
    try {
      setApproveLoading(requestId);
      await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Approve`,
        { status: "ACCEPTED" },
        authConfig()
      );
      // Optimistic update: move pending seats to approved so the card updates immediately
      setAllRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? {
              ...r,
              status: "ACCEPTED",
              approvedSeats: Number(r.approvedSeats || 0) + Number(r.pendingReqSeats || 0),
              pendingReqSeats: 0,
            }
            : r
        )
      );
      await fetchAllRequests();
      await refreshCategory(active.key);
      toast.success("Request approved successfully!", toasts);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve request", toasts);
    } finally {
      setApproveLoading(null);
    }
  };

  const handleReject = async (requestId, scope = "pending") => {
    try {
      setRejectLoading(requestId);
      await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Reject&scope=${scope}`,
        { status: "REJECTED" },
        authConfig()
      );

      setAllRequests((prev) =>
        prev.map((r) => {
          if (r._id !== requestId) return r;

          if (scope === "pending") {
            const approvedSeats = Number(r.approvedSeats || 0);
            const rejectedSeats =
              Number(r.rejectedSeats || 0) + Number(r.pendingReqSeats || 0);
            return {
              ...r,
              pendingReqSeats: 0,
              rejectedSeats,
              // If approved seats still exist, the request stays ACCEPTED.
              status: approvedSeats > 0 ? "ACCEPTED" : "REJECTED",
            };
          }

          if (scope === "approved") {
            const pendingReqSeats = Number(r.pendingReqSeats || 0);
            const rejectedSeats =
              Number(r.rejectedSeats || 0) + Number(r.approvedSeats || 0);
            return {
              ...r,
              approvedSeats: 0,
              rejectedSeats,
              status: pendingReqSeats > 0 ? "PENDING" : "REJECTED",
            };
          }

          // scope=all
          return {
            ...r,
            approvedSeats: 0,
            pendingReqSeats: 0,
            status: "REJECTED",
          };
        })
      );

      toast.success(
        scope === "pending"
          ? "Pending seats rejected"
          : scope === "approved"
            ? "Approved seats rejected"
            : "Request rejected (approved + pending)",
        toasts
      );
      await fetchAllRequests();
      await refreshCategory(active.key);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reject request",
        toasts
      );
    } finally {
      setRejectLoading(null);
    }
  };

  const handleRequestUpdated = (requestId, updated) =>
    setAllRequests((prev) => prev.map((r) => (r._id === requestId ? { ...r, ...updated } : r)));

  const handleTravelAction = async (ride) => {
    if (!ride) return;
    const id = idOf(ride);
    const isHelpDriver = Boolean(ride?.helpProposalId) && String(getRefId(ride?.actualDriver) || "") === String(currentUserId || "");
    const url = isHelpDriver ? `${Api}/help-proposals/ride/${id}/status` : `${Api}/rides/edit/${id}`;
    try {
      setActionLoading(id);
      if (ride.travelStatus === "Waiting") {
        await axios.patch(url, { travelStatus: "Started", ...(isHelpDriver ? {} : { startTime: new Date().toISOString() }) }, authConfig());
        toast.success("Ride started", toasts);
      } else if (ride.travelStatus === "Started") {
        await axios.patch(url, { travelStatus: "Completed", endTime: new Date().toISOString() }, authConfig());
        toast.success("Ride completed", toasts);
        triggerRatingCheck();
      }
      setConfirmRide(null);
      await Promise.all([refreshCategory("current"), refreshCategory("history"), fetchRideCounts()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update ride status", toasts);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = async (updated) => {
    const id = idOf(updated);
    if (id) {
      setData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = { ...next[k], rides: next[k].rides.map((r) => (idOf(r) === id ? { ...r, ...updated } : r)) };
        });
        return next;
      });
    }
    setEditRide(null);
    await refreshCategory(active.key);
  };

  const handleDelete = async (deleted) => {
    const id = idOf(deleted);
    if (id) {
      setData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = { ...next[k], rides: next[k].rides.filter((r) => idOf(r) !== id) }; });
        return next;
      });
    }
    setDeleteRide(null);
    toast.success("Ride cancelled successfully", toasts);
    await Promise.all([refreshCategory(active.key), fetchRideCounts()]);
  };

  /* ── effects ── */
  useEffect(() => {
    if (!currentUserId) { setInitialLoading(false); return; }
    fetchCategory("current", { reset: true });
    fetchCategory("history", { reset: true });
    fetchAllRequests();
    fetchRideCounts();
    fetchHelpProposals();
  }, []);

  useEffect(() => {
    const requestedTab = Number(location.state?.tab);
    if (location.state?.tab === undefined || Number.isNaN(requestedTab) || requestedTab < 0 || requestedTab > 3) return;
    setTab(requestedTab);
    setNotificationRide(location.state?.rideId || null);
    const category = tabs[requestedTab].key;
    if (location.state?.refresh) {
      fetchCategory(category, { reset: true });
      fetchAllRequests();
      fetchRideCounts();
      return;
    }
    if (!data[category].loaded) fetchCategory(category, { reset: true });
  }, [location.state]);

  useEffect(() => {
    const handler = () => refreshAllCategories();
    window.addEventListener("rideDataChanged", handler);
    return () => window.removeEventListener("rideDataChanged", handler);
  }, []);

  useEffect(() => {
    if (!refreshRide) return;
    refreshAllCategories();
  }, [refreshRide]);

  // ★ Notification-driven refresh (refetch on ANY new notification)
  const lastNotificationCount = useRef(0);

  useEffect(() => {
    if (!notifications?.length) {
      lastNotificationCount.current = 0;
      return;
    }

    // Skip the initial hydration (fetch returns 40 items at once)
    if (lastNotificationCount.current === 0) {
      lastNotificationCount.current = notifications.length;
      return;
    }

    // Only fire when the count grows (a new notification was added)
    if (notifications.length > lastNotificationCount.current) {
      refreshAllCategories();
    }

    lastNotificationCount.current = notifications.length;
  }, [notifications]);

  // ★ Direct socket listener — never misses, works even if context dedupe drops
  useEffect(() => {
    if (!currentUserId) return;

    const REFRESH_TYPES = new Set([
      "new_request",
      "request_accepted",
      "request_rejected",
      "request_cancelled",
      "ride_request_update",
      "ride_started",
      "ride_completed",
      "ride_updated",
      "ride_status",
      "ride_cancelled",
      "help_proposal_received",
      "help_proposal_accepted",
      "help_proposal_rejected",
    ]);

    const onSocketNotification = (payload) => {
      const t = payload?.type;
      if (!t || !REFRESH_TYPES.has(t)) return;
      refreshAllCategories();
    };

    socket.on("notification", onSocketNotification);
    return () => {
      socket.off("notification", onSocketNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ★ Polling safety net (every 30s while on Current tab)
  useEffect(() => {
    if (!currentUserId) return;
    if (active.key !== "current") return;

    const interval = setInterval(() => {
      fetchCategory("current", { reset: true });
      fetchAllRequests();
      fetchRideCounts();
    }, 30_000);

    return () => clearInterval(interval);
  }, [currentUserId, active.key]);

  useEffect(() => {
    if (location.state?.refresh) refreshAllCategories();
  }, [location.state?.refreshKey]);

  // "Your ride is starting" popup
  useEffect(() => {
    if (active.key !== "current") return;
    const check = () => {
      const now = new Date();
      (data.current.rides || []).forEach((ride) => {
        const id = idOf(ride);
        if (!id || ["Started", "Completed", "Cancelled"].includes(ride?.travelStatus)) return;
        const start = new Date(ride?.startTime);
        if (Number.isNaN(start.getTime()) || now < start || processedRideIds.current.has(id)) return;
        if (String(getRefId(ride?.createdBy) || "") === String(currentUserId || "")) {
          toast.info("Your ride is starting now 🚗", toasts);
          setConfirmRide(ride);
        }
        processedRideIds.current.add(id);
      });
    };
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [active.key, data.current.rides, currentUserId]);

  // infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      const state = data[active.key];
      if (!state.loading && state.hasMore) fetchCategory(active.key);
    }, { rootMargin: "500px 0px", threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [active.key, activeData.loading, activeData.hasMore, activeData.rides.length]);

  const handleTabChange = async (_, value) => {
    setTab(value);
    const category = tabs[value].key;
    if (!data[category].loaded) await fetchCategory(category, { reset: true });
  };

  /* ── render ── */
  const visibleRides = activeData.rides.filter((r) => kind === "all" || roleOf(r, currentUserId) === kind);

  const renderList = (list) =>
    list.map((ride) => {
      const completed = ride?.travelStatus === "Completed";
      const cancelled = ride?.travelStatus === "Cancelled";
      const rideRequests = allRequests.filter((req) => req.rideId?._id?.toString() === ride._id?.toString());

      // Pending = request still has unhandled seats (falls back to status)
      const pendingCount = rideRequests.filter(isPendingRequest).length;
      const stats = requestStats(rideRequests);

      // Check if any request is already accepted/approved
      const hasApprovedRequests = rideRequests.some((r) =>
        ["ACCEPTED", "APPROVED", "AUTO_REJECTED"].includes(r.status?.toUpperCase())
      );

      const offersCount = pendingProposals.filter((p) => String(getRefId(p?.requestRideId) || "") === String(ride._id)).length;
      const matched = isMatched(ride);
      const owner = String(getRefId(ride.createdBy) || "") === String(currentUserId || "");

      // Prevent editing if completed, cancelled, matched, or someone has been approved
      const canEdit = active.edit && !completed && !cancelled && !matched && !hasApprovedRequests;

      return (
        <RideCard
          key={idOf(ride)} ride={ride} user={currentUser}
          isCurrentRide={active.current}
          showEdit={canEdit}
          showDelete={active.del && !completed && !cancelled && (!matched || owner)}
          onEdit={setEditRide} onDelete={setDeleteRide}
          rideRequests={rideRequests} pendingCount={pendingCount} offersCount={offersCount} stats={stats}
          notificationRide={notificationRide} setNotificationRide={setNotificationRide}
          onApprove={handleApprove} onReject={handleReject} onRequestUpdated={handleRequestUpdated}
          approveLoading={approveLoading} rejectLoading={rejectLoading}
          onTravelAction={handleTravelAction} actionLoading={actionLoading}
        />
      );
    });

  return (
    <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", boxSizing: "border-box", overflowX: "hidden", bgcolor: "#FAF8F5", color: "#242424", fontFamily: '"Inter","Roboto",sans-serif', px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, sm: 3 }, "& .MuiButton-root": { textTransform: "none", fontWeight: 600, borderRadius: "10px" } }}>
      <Typography variant="h5" fontWeight={800} sx={{ color: "#142958", fontSize: { xs: "1.35rem", sm: "1.6rem" }, letterSpacing: "-0.4px", mb: 2 }}>My Rides</Typography>

      {(loadingHelpProposals || pendingProposals.length > 0) && (
        <Paper elevation={0} sx={{ border: `1px solid ${LINE}`, borderLeft: `4px solid ${BRAND}`, borderRadius: "14px", overflow: "hidden", mb: 2, bgcolor: "#fff" }}>
          <Box onClick={() => setOffersOpen((o) => !o)} role="button" sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1.5, cursor: "pointer" }}>
            {loadingHelpProposals && pendingProposals.length === 0
              ? <CircularProgress size={22} sx={{ color: BRAND }} />
              : <Chip label={pendingProposals.length} size="small" sx={{ bgcolor: BRAND, color: "#fff", fontWeight: 800 }} />}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>People offered to help you</Typography>
              <Typography variant="body2" color="text.secondary">On your ride requests · tap to review</Typography>
            </Box>
            <ExpandMoreIcon sx={{ transform: offersOpen ? "rotate(180deg)" : "none", transition: "transform .2s", color: "text.secondary" }} />
          </Box>
          <Collapse in={offersOpen} unmountOnExit>
            <Divider />
            <Stack divider={<Divider />}>
              {pendingProposals.map((proposal) => {
                const helper = proposal?.helperId && typeof proposal.helperId === "object" ? proposal.helperId : {};
                const reqRide = proposal?.requestRideId && typeof proposal.requestRideId === "object" ? proposal.requestRideId : {};
                const offer = proposal?.offerDetails && typeof proposal.offerDetails === "object" ? proposal.offerDetails : {};
                const name = [helper.firstName, helper.lastName].filter(Boolean).join(" ") || "Community member";
                const from = offer.from || reqRide.from || "—";
                const dest = offer.destination || reqRide.destination || "—";
                const mode = offer.modeOfTravel || reqRide.modeOfTravel || "Any mode";
                const st = offer.startTime || reqRide.startTime;
                const responding = respondingProposalId === proposal._id;
                return (
                  <Box key={proposal._id} sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25 }}>
                      <ProtectedAvatar src={helper.profileImageUrl || ""} sx={{ width: 40, height: 40, bgcolor: "#FFF0E3", color: "#C65B00", fontWeight: 800 }}>
                        {`${helper.firstName?.[0] || ""}${helper.lastName?.[0] || ""}` || "U"}
                      </ProtectedAvatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }} noWrap>{name}</Typography>
                        <Typography variant="caption" color="text.secondary">can help with your request</Typography>
                      </Box>
                    </Stack>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "12px", borderColor: "#EFE5DC", bgcolor: "#FFFCF9" }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", overflowWrap: "anywhere" }}>{from} <ArrowForwardIcon sx={{ fontSize: 14, color: BRAND, verticalAlign: "middle" }} /> {dest}</Typography>
                      <Typography sx={{ mt: 0.4, fontSize: "0.8rem", color: "#777783" }}>{st ? moment(st).format("DD MMM YYYY, hh:mm A") : "Time not specified"}</Typography>
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                        <Chip size="small" variant="outlined" label={mode} />
                        {offer.availableSeats != null && <Chip size="small" variant="outlined" label={`${offer.availableSeats} seat(s)`} />}
                        {offer.costPerSeat != null && <Chip size="small" variant="outlined" label={`₹${offer.costPerSeat} / seat`} />}
                      </Stack>
                      {offer.description && <Typography variant="body2" sx={{ mt: 1, color: "#6B6B78", overflowWrap: "anywhere" }}>{offer.description}</Typography>}
                    </Paper>
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.25 }}>
                      <Button variant="outlined" startIcon={<CancelIcon />} disabled={Boolean(respondingProposalId)} onClick={() => respondToHelpProposal(proposal._id, "reject")}
                        sx={{ flex: { xs: 1, sm: "0 0 auto" }, color: "#A83D36", borderColor: "#E8C6C3", bgcolor: "#fff", minHeight: 40 }}>Decline</Button>
                      <Button variant="contained" startIcon={responding ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />} disabled={Boolean(respondingProposalId)} onClick={() => respondToHelpProposal(proposal._id, "accept")}
                        sx={{ flex: { xs: 1, sm: "0 0 auto" }, bgcolor: "#2D6A4F", boxShadow: "none", minHeight: 40, "&:hover": { bgcolor: "#245640", boxShadow: "none" } }}>{responding ? "Processing…" : "Accept"}</Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Collapse>
        </Paper>
      )}

      <Box sx={{ position: "sticky", top: 0, zIndex: 10, bgcolor: "#FAF8F5", pb: 0.5 }}>
        <Tabs value={tab} onChange={handleTabChange} variant="scrollable" scrollButtons={false}
          sx={{
            minHeight: 42, "& .MuiTabs-flexContainer": { gap: "8px" }, "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": { minWidth: "auto", px: 2, py: 0.75, minHeight: 38, border: `1px solid #DCD4CB`, borderRadius: "24px", bgcolor: "#fff", textTransform: "none", marginRight: 2, fontSize: { xs: "0.74rem", sm: "0.82rem" }, fontWeight: 700, color: "#292929", "&.Mui-selected": { color: "#fff", bgcolor: "#C83D08", borderColor: "#C83D08" } }
          }}>
          {tabs.map((t) => <Tab key={t.key} label={t.label} />)}
        </Tabs>
      </Box>

      <KindFilter value={kind} onChange={setKind} rides={activeData.rides} userId={currentUserId} />

      <Box>
        {(initialLoading && active.key === "current" && !activeData.loaded) || (activeData.loading && !activeData.loaded) ? (
          <Box sx={{ mt: "4rem", display: "flex", justifyContent: "center" }}><CircularProgress size={46} sx={{ color: "#FF9933" }} /></Box>
        ) : activeData.rides.length === 0 && !activeData.loading ? (
          <EmptyState message1={active.empty1} message2={active.empty2} />
        ) : (
          <>
            {visibleRides.length === 0 && !activeData.loading && (
              <EmptyState
                message1={`No ${KIND[kind]?.short.toLowerCase() || ""} rides here`}
                message2={activeData.hasMore ? "Scroll down to load more, or switch the filter." : "Try switching the filter above."}
              />
            )}
            {renderList(visibleRides)}
            <Box ref={sentinelRef} sx={{ minHeight: activeData.hasMore ? 80 : 24, display: "flex", alignItems: "center", justifyContent: "center", py: 1 }}>
              {activeData.loading && <CircularProgress size={28} sx={{ color: "#FF9933" }} />}
              {!activeData.loading && !activeData.hasMore && activeData.rides.length > 0 && (
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>No more rides</Typography>
              )}
            </Box>
          </>
        )}
      </Box>

      {editRide && <EditRideModal ride={editRide} onSave={handleEdit} onClose={() => setEditRide(null)} />}
      {deleteRide && <DeleteConfirmDialog ride={deleteRide} onConfirm={handleDelete} onClose={() => setDeleteRide(null)} />}

      <Dialog
        open={!!confirmRide}
        onClose={(e, reason) => {
          if (reason !== "backdropClick") {
            setConfirmRide(null);
          }
        }}
        PaperProps={{
          sx: {
            width: {
              xs: "calc(100% - 24px)",
              sm: "90%",
              md: "850px",
              lg: "1000px",
              xl: "1100px",
            },
            maxWidth: "1100px",
            mx: "auto",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #FFE0B2",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            m: { xs: 1.5, sm: 2 },
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            bgcolor: "#FFF4E5",
            borderTop: "4px solid #F89B04",
            borderBottom: "1px solid #FFE0B2",
            px: 2.5,
            py: 1.75,
          }}
        >
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#292929" }}>
            Looks like your ride is starting
          </Typography>

          <Typography sx={{ fontSize: "0.78rem", color: "#8A7355", mt: 0.4 }}>
            Please confirm before starting your journey.
          </Typography>
        </Box>

        {/* RIDE DETAILS */}
        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Box
            sx={{
              bgcolor: "#FFFAF2",
              border: "1px solid #FFE0B2",
              borderRadius: "10px",
              p: 1.75,
            }}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#A08B72", letterSpacing: 0.8 }}>
                  FROM
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#292929", overflowWrap: "anywhere" }}>
                  {confirmRide?.from || "—"}
                </Typography>
              </Box>

              <Box sx={{ borderLeft: "2px dashed #F89B04", height: 10, ml: 0.5 }} />

              <Box>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#A08B72", letterSpacing: 0.8 }}>
                  TO
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 600, color: "#292929", overflowWrap: "anywhere" }}>
                  {confirmRide?.destination || "—"}
                </Typography>
              </Box>

              <Box sx={{ borderTop: "1px solid #FFE0B2", pt: 1.25 }}>
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#A08B72", letterSpacing: 0.8 }}>
                  START TIME
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#75552B" }}>
                  {confirmRide?.startTime
                    ? moment(confirmRide.startTime).format("DD MMM YYYY, hh:mm A")
                    : "—"}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        {/* ACTION BUTTONS */}
        <DialogActions
          sx={{
            px: 2.5,
            pb: 2,
            pt: 0,
            gap: 1,
            flexWrap: "nowrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setConfirmRide(null)}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 38,
              borderRadius: "8px",
              borderColor: "#D6D6D6",
              color: "#666",
              fontSize: "0.82rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#999",
                bgcolor: "#F5F5F5",
              },
            }}
          >
            Not yet
          </Button>

          <Button
            variant="contained"
            disabled={actionLoading === idOf(confirmRide)}
            onClick={() => handleTravelAction(confirmRide)}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 38,
              borderRadius: "8px",
              bgcolor: "#F89B04",
              color: "#FFF",
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#DB8700",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: "#F5C978",
                color: "#FFF",
              },
            }}
          >
            {actionLoading === idOf(confirmRide) ? "Starting…" : "Start now"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default MyRides;