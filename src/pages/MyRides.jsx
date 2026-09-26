import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  FormControl,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Slider,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  DialogContentText,
  Badge,
  Collapse,
  Avatar,
  useTheme,
  FormHelperText,
  Checkbox,
} from "@mui/material";
import {
  Calendar,
  Clock,
  Fuel,
  HeartPulse,
  Languages,
  Luggage,
  MapPin,
  Users,
} from "lucide-react";
import Ridebook from "./Ridebook.jsx";
import OfferRide from "./OfferRide.jsx";
// import { useTheme } from '@mui/material/styles';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import WcIcon from "@mui/icons-material/Wc";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import TrainIcon from "@mui/icons-material/Train";
import PersonIcon from "@mui/icons-material/Person";
import WomanIcon from "@mui/icons-material/Woman";
import GroupsIcon from "@mui/icons-material/Groups";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import socket from "../socket";
import { useRide } from "../context/RideContext";
import notificationSound from "../sounds/notifysound.wav";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import RideDetailsModal from "./RideDetails";
import moment from "moment";
import ToastConfig from "../components/ToastConfig.jsx";
import ProfileModal from './Avatar.jsx';

const statusConfig = {
  FULL: { label: "Filled", color: "#2D6A4F", bg: "#E8F5E9", icon: "✅" },
  OPEN: { label: "Opened", color: "#E8650A", bg: "#FFF3E0", icon: "⏳" },
  // CLOSED: { label: 'Closed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  CLOSED: { label: "Cancelled", color: "#9B2226", bg: "#FFEBEE", icon: "❌" },
};

// const statusMap = {
//   OPEN: 'pending',
//   FULL: 'confirmed',
//   CLOSED: 'completed',
//   CANCELLED: 'cancelled',
// };

const travelIcons = {
  Car: <DirectionsCarIcon sx={{ color: "#FF9933" }} />,
  Bus: <DirectionsBusIcon sx={{ color: "#FF9933" }} />,
  Bike: <TwoWheelerIcon sx={{ color: "#FF9933" }} />,
  Flight: <FlightIcon sx={{ color: "#FF9933" }} />,
  Ship: <DirectionsBoatIcon sx={{ color: "#FF9933" }} />,
  Train: <TrainIcon sx={{ color: "#FF9933" }} />,
};

const travelIcon = {
  Car: "🚗",
  Bus: "🚌",
  Bike: "🏍️",
  Flight: "✈️",
  Ship: "🚢",
  Train: "🚆",
};

const genderIcons = {
  Male: "👨",
  Female: "👩",
  Any: "👥",
};

const genderIcon = {
  Male: <PersonIcon sx={{ color: "#FF9933" }} />,
  Female: <WomanIcon sx={{ color: "#FF9933" }} />,
  Any: <GroupsIcon sx={{ color: "#FF9933" }} />,
};

// const fuelColor = {
//   Yes: "success",
//   No: "default",
//   Shared: "success",
//   "Not shared": "default",
// };

const formFrom = (ride) => ride?.from || "—";
const formTo = (ride) => ride?.destination || ride?.to || "—";

const noZoomInputSx = {
  "& .MuiInputBase-input, & .MuiSelect-select": {
    fontSize: { xs: "16px", sm: "0.875rem" },
  },
};

const user = JSON.parse(localStorage.getItem("user") || "null");

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message1, message2 }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 440, md: 480 },
        textAlign: "center",
        // display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        // alignItems: "center",
        mx: "auto",
        mt: { xs: '50%', sm: '15%' }
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        color="text.primary"
      >
        {message1}
      </Typography>

      <Typography
        fontWeight={400}
        color="text.secondary"
        sx={{
          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
          mt: 1.2,
        }}
      >
        {message2}
      </Typography>
    </Box>

  );
}

function EditRideModal({ ride, onSave, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      {/* <Dialog
        open={Boolean(ride)}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2, md: 4 } },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pb: 0,
            pr: 5,
            fontSize: { xs: "1.05rem", sm: "1.25rem" },
          }}
        >
          Edit Ride
          <IconButton
            onClick={onClose}
            aria-label="Close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.secondary",
              width: 44,
              height: 44,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* OfferRide owns the form, stepper, validation, and its own
          Back / Continue / Save Changes buttons — nothing extra needed here */}
      {/* {ride && (
          <OfferRide ride={ride} onSave={onSave} onClose={onClose} />
        )}
      </Dialog> */}

      <Dialog
        open={Boolean(ride)}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return;
          }

          onClose();
        }}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: "95%",
              md: "90%",
            },
            maxWidth: {
              sm: 600,
              md: 800,
            },
            borderRadius: {
              xs: 0,
              sm: 3,
            },
            m: {
              xs: 0,
              sm: 2,
            },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "relative",
            // textAlign: "center",
            fontWeight: 700,
            py: 2,
            pr: 6,
          }}
        >
          Edit Ride
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            display: "flex",
            justifyContent: "center",
            p: {
              xs: 1,
              sm: 3,
            },
            overflowY: "auto",
            maxHeight: {
              xs: "100vh",
              sm: "80vh",
            },
          }}
        >
          {ride && <OfferRide ride={ride} onSave={onSave} onClose={onClose} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({ ride, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const startDate = new Date(ride.startTime);
  const dateLabel = !isNaN(startDate)
    ? startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.patch(
        `${Api}/rides/cancelride/${ride._id || ride.id}?type=Cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      onConfirm(ride);
      onClose();

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to cancel ride. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={(event, reason) => {
        if (reason === "backdropClick") {
          return;
        }

        onClose();
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          mx: { xs: 2, sm: "auto" },
          width: { xs: "calc(100% - 32px)", sm: "100%" },
        },
      }}
    >
      <DialogTitle
        sx={{ fontWeight: 800, pr: 5, fontSize: { xs: "1rem", sm: "1.15rem" } }}
      >
        Are you sure to cancel your ride?
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "text.secondary",
            width: 44,
            height: 44,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography
          color="text.secondary"
          sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" } }}
        >
          This will cancel your ride, requested persons will be notified...
        </Typography>
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
            backgroundColor: "#FFF8F2",
            border: "1px solid #F0E6DC",
            borderRadius: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              fontWeight: 700,
              color: "#2D2D2D",
              lineHeight: 1.4,
              wordBreak: "break-word",
              pl: 0.5,
            }}
          >
            {formFrom(ride)}{" "}
            <Box
              component="span"
              sx={{
                color: "#FF6B35",
                mx: 0.5,
                fontWeight: 800,
              }}
            >
              →
            </Box>{" "}
            {formTo(ride)}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "0.72rem", sm: "0.8rem" },
              color: "#757575",
              fontWeight: 500,
              lineHeight: 1.4,
              pl: 0.5,
            }}
          >
            {dateLabel}
          </Typography>
        </Paper>
        {error && (
          <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            flex: { xs: "1 1 auto", sm: "0 0 auto" },
            minHeight: 44,
            bgcolor: "#757575",
            color: "#ffff",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            flex: { xs: "1 1 auto", sm: "0 0 auto" },
            minHeight: 44,
          }}
        >
          {deleting ? "Canceling..." : "Cancel Ride"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({
  ride,
  fetchRides,
  fetchAllRequests,
  user,
  confirmRide,
  setConfirmRide,
  showEdit,
  showDelete,
  onEdit,
  isCurrentRide,
  notificationRide,
  setNotificationRide,
  onDelete,
  allRequests,
  fetchRideCounts,
  setAllRequests,
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState([]);

  const [approveLoading, setApproveLoading] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(null);

  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);

  const toasts = ToastConfig();

  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const ACCENT = "#FF9933";

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const status = statusConfig[ride?.status] || {
    color: "#9B2226",
    bg: "#FFEBEE",
  };

  const startDate = new Date(ride.startTime);
  const date = !isNaN(startDate)
    ? startDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";
  const time = !isNaN(startDate)
    ? startDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    : "—";

  // const fuelLabel = ride.fuelSharing ? "Yes" : "No";

  // Get requests for this specific ride
  const rideRequests =
    allRequests?.filter(
      (req) => req.rideId?._id?.toString() === ride._id?.toString(),
    ) || [];

  const pendingCount = rideRequests.filter(
    (r) => r.status?.toUpperCase() === "PENDING",
  ).length;

  const handleApprove = async (requestId) => {
    try {
      // if (!window.confirm("Are you sure you want to approve this request?")) {
      //   return;
      // }
      setApproveLoading(requestId);
      const res = await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Approve`,
        { status: "ACCEPTED" },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );

      if (res.status) {
        setAllRequests((prev) =>
          prev.map((req) =>
            req._id === requestId ? { ...req, status: "ACCEPTED" } : req,
          ),
        );
        fetchRides();
        fetchAllRequests();
        toast.success("Request approved successfully!", toasts);
      }
    } catch (error) {
      toast.error(error.response.data.message, toasts);
    } finally {
      setApproveLoading(null);
    }
  };

  const handleRequestUpdated = (requestId, updatedRequest) => {
    setAllRequests((prev) =>
      prev.map((req) =>
        req._id === requestId
          ? { ...req, ...updatedRequest }
          : req
      )
    );
  };

  const handleReject = async (requestId) => {
    try {
      // if (!window.confirm("Are you sure you want to reject this request?")) {
      //   return;
      // }
      setRejectLoading(requestId);

      await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Reject`,
        { status: "REJECTED" },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      );

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, status: "REJECTED" }
            : req
        )
      );

      toast.success("Request rejected", toasts);

      // Refresh only if actually needed
      fetchRides();
      fetchAllRequests();
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to reject request",
        toasts
      );
    } finally {
      setRejectLoading(null);
    }
  };

  const handleEdit = async (rideId, status) => {
    try {
      if (status === "Waiting") {
        const response = await axios.patch(
          `${Api}/rides/edit/${rideId}`,
          {
            travelStatus: "Started",
            startTime: new Date().toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        setConfirmRide(null);
        fetchRides();
        toast.success("Ride Started", toasts);
        fetchRideCounts()
      } else if (status === "Started") {
        const response = await axios.patch(
          `${Api}/rides/edit/${rideId}`,
          {
            travelStatus: "Completed",
            endTime: new Date().toISOString(),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        setConfirmRide(null);
        fetchRides();
        fetchRideCounts();
        toast.success("Ride Completed", toasts);
      }
    } catch (error) {
      toast.error("Failed", toasts);
    }
  };

  useEffect(() => {
    if (!notificationRide) return;

    if (ride?._id && ride?._id.toString() === notificationRide.toString()) {
      setDetailsOpen(true);

      setNotificationRide(null);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [notificationRide, ride]);

  const isOwner =
    String(ride?.createdBy?._id || ride?.createdBy?.id) === String(user?.id);
  const isStarted = ride?.travelStatus === "Started";
  const isCancelled = ride?.travelStatus === "Cancelled";
  const isCompleted = ride?.travelStatus === "Completed";

  return (
    <>
      <Box
        sx={{
          p: { xs: 0, sm: 0 },
          width: "100%",
          mb: { xs: 1.5, sm: 2 },
          transition: "all .3s ease",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-5px)" },
          },
        }}
      >
        {/* ── Top header: name + status ── */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1b1b3aff, #09031bff)",
            color: "#fff",
            borderRadius: "15px 15px 0 0",
            px: { xs: 1.5, sm: 2.5, md: 3 },
            py: { xs: 1.25, sm: 1.75, md: 2 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {/* Ride Owner */}
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              src={ride?.createdBy?.profileImage || ""}
              // alt={`${ride?.createdBy?.firstName[0]}${ride?.createdBy?.lastName[0]}`.toUpperCase()}
              onClick={() => {
                setSelectedProfile(ride?.createdBy);
                setProfileModalOpen(true);
              }}
              sx={{
                width: { xs: 26, sm: 35 },
                height: { xs: 26, sm: 35 },
                fontSize: { xs: 12, sm: 15 },
                fontWeight: 700,
                bgcolor: ACCENT,
                color: "#fff",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {`${ride?.createdBy?.firstName?.[0]}${ride?.createdBy?.lastName?.[0]}`.toUpperCase() ||
                "U"}
            </Avatar>

            <Typography
              fontWeight={700}
              sx={{
                minWidth: 0,
                flex: 1,
                fontSize: {
                  xs: "0.8rem",
                  sm: "0.92rem",
                  md: "1rem",
                },
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {ride?.createdBy?.firstName} {ride?.createdBy?.lastName}
            </Typography>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: { xs: 0.5, sm: 1 },
              flexWrap: "wrap",

              "& .MuiChip-root, & .MuiButton-root": {
                height: { xs: 22, sm: 26, md: 28 },
                minHeight: { xs: 22, sm: 26, md: 28 },
                fontSize: { xs: "0.55rem", sm: "0.65rem", md: "0.7rem" },
                textTransform: "none",
                borderRadius: 1.5,
              },

              "& .MuiChip-label": {
                px: { xs: 0.75, sm: 1, md: 1.25 },
                fontWeight: 700,
              },
            }}
          >
            {ride?.travelStatus === "Cancelled" && (
              <Chip
                size="small"
                label={isMobile ? "Cancelled" : "Ride Cancelled"}
                sx={{
                  bgcolor: status.bg,
                  color: status.color,
                  fontWeight: 700,
                }}
              />
            )}

            {ride?.travelStatus === "Completed" && (
              <Chip
                size="small"
                label="Completed"
                sx={{
                  bgcolor: "#E8F5E9",
                  color: "#2E7D32",
                  fontWeight: 700,
                }}
              />
            )}

            {/* View Requests */}
            {rideRequests.length > 0 && ride?.travelStatus !== "Completed" && (
              <Badge
                badgeContent={pendingCount}
                color="error"
                invisible={pendingCount === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: { xs: "0.55rem", sm: "0.7rem" },
                    minWidth: { xs: 14, sm: 18 },
                    height: { xs: 14, sm: 18 },
                    p: 0,
                  },
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setDetailsOpen(true)}
                  sx={{
                    color: "#FF9933",
                    borderColor: "#FF9933",
                    "&:hover": {
                      borderColor: "#FF9933",
                      bgcolor: "rgba(255,153,51,0.08)",
                    },
                  }}
                >
                  {showRequests ? "Hide Requests" : "View Requests"}
                </Button>
              </Badge>
            )}

            {/* Start / Complete Ride */}
            {isCurrentRide && (
              <>
                {isOwner && !isCompleted ? (
                  <Button
                    size="small"
                    onClick={() => handleEdit(ride._id, ride?.travelStatus)}
                    sx={{
                      color: "#fff",
                      bgcolor: isStarted ? "red" : "orange",
                      px: { xs: 1, sm: 1.5 },
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: isStarted ? "darkred" : "darkorange",
                      },
                    }}
                  >
                    {isStarted ? "Complete Ride" : "Start Ride"}
                  </Button>
                ) : (
                  <span
                    style={{
                      color: isCompleted
                        ? "green"
                        : isStarted
                          ? "orange"
                          : "gray",
                      fontWeight: 600,
                    }}
                  >
                    {isCompleted
                      ? "Completed"
                      : isCancelled
                        ? ""
                        : isStarted
                          ? "Ongoing"
                          : "Not Started"}
                  </span>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* ── Card body ── */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "0 0 18px 18px",
            background: "#fff",
            border: "1px solid #FFE2C2",
            // boxShadow: "0 10px 30px rgba(255,153,51,.12)",
            overflow: "hidden",
            transition: ".3s",
            // "&:hover": {
            //   transform: "translateY(-5px)",
            //   boxShadow: "0 18px 40px rgba(255,153,51,.22)"
            // }
          }}
        >
          <CardContent
            onClick={() => setDetailsOpen(true)}
            sx={{
              p: {
                xs: "10px !important",
                sm: "16px 18px !important",
                md: "20px 24px !important",
              },
            }}
          >
            <Box>
              {/* FROM / TO row */}
              <Box
                sx={{
                  display: isMobile ? "block" : "flex",
                  justifyContent: "space-between",
                  // alignItems:'center',
                }}
              >
                <Box
                  sx={{
                    // border:'1px solid black',
                    display: "flex",
                    width: isMobile ? "100%" : "35%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    pb: isMobile && { xs: 1.2, sm: 1.5, md: 2 },
                    // mb: { xs: 1.1, sm: 1.5, md: 2 },
                    // borderBottom: '1px solid rgba(255,153,51,0.2)',
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#FF9933",
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        fontSize: {
                          xs: "0.58rem",
                          sm: "0.65rem",
                          md: "0.7rem",
                        },
                      }}
                    >
                      FROM
                    </Typography>
                    <Typography
                      fontWeight={700}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: "left",
                        fontSize: {
                          xs: "0.78rem",
                          sm: "0.88rem",
                          md: "0.95rem",
                        },
                        lineHeight: 1.3,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {formFrom(ride)}
                    </Typography>
                  </Box>
                  <ArrowForwardIcon
                    sx={{
                      color: "#FF9933",
                      fontSize: { xs: 14, sm: 18, md: 20 },
                      flexShrink: 0,
                      mx: { xs: 0.7, sm: 1.2, md: 1.5 },
                    }}
                  />

                  <Box sx={{ minWidth: 0, flex: 1, textAlign: "right" }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#FF9933",
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        fontSize: {
                          xs: "0.58rem",
                          sm: "0.65rem",
                          md: "0.7rem",
                        },
                      }}
                    >
                      TO
                    </Typography>
                    <Typography
                      fontWeight={700}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: "right",
                        fontSize: {
                          xs: "0.78rem",
                          sm: "0.88rem",
                          md: "0.95rem",
                        },
                        lineHeight: 1.3,
                        whiteSpace: "normal",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {formTo(ride)}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    // border:'1px solid black',
                    justifyContent: "space-around",
                    display: "flex",
                    width: isMobile ? "100%" : "60%",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: { xs: "10px 6px", sm: "16px", md: 3 },
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.62rem",
                          sm: "0.68rem",
                          md: "0.7rem",
                        },
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      Date &amp; time
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayIcon
                        sx={{
                          color: "#FF9933",
                          fontSize: { xs: 14, sm: 16, md: 18 },
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.8rem",
                            md: "0.875rem",
                          },
                          fontWeight: 600,
                        }}
                      >
                        {date} · {time}
                      </Typography>
                    </Stack>
                  </Box>

                  {ride.modeOfTravel !== "Flight" && (
                    <Box>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.62rem",
                            sm: "0.68rem",
                            md: "0.7rem",
                          },
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        Total Seats
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventSeatIcon
                          sx={{
                            color: "#FF9933",
                            fontSize: { xs: 14, sm: 16, md: 18 },
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.8rem",
                              md: "0.875rem",
                            },
                            fontWeight: 600,
                          }}
                        >
                          {ride.totalSeats} seat
                          {ride.totalSeats === 1 ? "" : "s"}
                        </Typography>
                      </Stack>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.62rem",
                          sm: "0.68rem",
                          md: "0.7rem",
                        },
                        color: "text.secondary",
                        mb: 0.5,
                      }}
                    >
                      Travel mode
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {React.cloneElement(
                        travelIcons[ride.modeOfTravel] || travelIcons.Car,
                        {
                          sx: {
                            color: "#FF9933",
                            fontSize: { xs: 14, sm: 16, md: 18 },
                          },
                        },
                      )}
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.8rem",
                            md: "0.875rem",
                          },
                          fontWeight: 600,
                        }}
                      >
                        {ride.modeOfTravel}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>

              {/* Details grid */}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <ProfileModal
        open={profileModalOpen}
        selectedProfile={selectedProfile}
        onClose={() => {
          setProfileModalOpen(false);
        }}
      />

      {detailsOpen && (

        <RideDetailsModal
          ride={ride}
          user={user}
          showEdit={showEdit}
          showDelete={showDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={() => setDetailsOpen(false)}
          requests={rideRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestUpdated={handleRequestUpdated}
          approveLoading={approveLoading}
          rejectLoading={rejectLoading}
        />
      )}

      <Dialog
        open={!!confirmRide}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            return;
          }

          setConfirmRide(null);
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            mx: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 32px)", sm: "100%" },
            maxWidth: { xs: "calc(100% - 32px)", sm: 450 },
          },
        }}
      >
        <DialogContent
          sx={{
            pb: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
            }}
          >
            Looks like your ride is starting
          </Typography>
        </DialogContent>

        <DialogContent
          sx={{
            pt: 0,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              mb: 0.5,
            }}
          >
            From : {confirmRide?.from || "—"}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              mb: 0.5,
            }}
          >
            To : {confirmRide?.destination || "—"}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
            }}
          >
            Time :{" "}
            {confirmRide?.startTime
              ? moment(confirmRide.startTime).format("DD MMM YYYY, hh:mm A")
              : "—"}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 2.5 },
            pt: { xs: 0.5, sm: 1 },
            gap: { xs: 1, sm: 1.5 },
            flexWrap: "nowrap",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setConfirmRide(null)}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 36, sm: 40 },
              px: { xs: 1.5, sm: 2.5 },
              fontSize: { xs: "0.78rem", sm: "0.875rem" },
              bgcolor: "#757575",
              color: "#fff",
              textTransform: "none",
              borderRadius: { xs: 1.5, sm: 2 },
              "&:hover": {
                bgcolor: "#616161",
              },
            }}
          >
            Not yet
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              handleEdit(confirmRide._id, confirmRide.travelStatus)
            }
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 36, sm: 40 },
              px: { xs: 1.5, sm: 2.5 },
              fontSize: { xs: "0.78rem", sm: "0.875rem" },
              bgcolor: "#f89b04",
              color: "#fff",
              textTransform: "none",
              borderRadius: { xs: 1.5, sm: 2 },
              "&:hover": {
                bgcolor: "#db8700",
              },
            }}
          >
            Started
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const MyRides = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const { notifications } = useNotifications();
  const { refreshRide } = useRide();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const ITEMS_PER_PAGE = 10;
  const [rideCounts, setRideCounts] = useState({
    current: 0,
    upcoming: 0,
    posts: 0,
    history: 0,
  });

  const tabs = [
    { key: "current", label: `Current (${rideCounts.current})`, empty1: "No Rides in Progress", empty2: "You don't have any rides currently in progress.", current: true, edit: true, del: true },
    { key: "upcoming", label: `Upcoming (${rideCounts.upcoming})`, empty1: "No Upcoming Rides", empty2: "You don't have any upcoming rides scheduled.", current: false, edit: true, del: true },
    { key: "posts", label: `My Posts (${rideCounts.posts})`, empty1: "No Posted Rides", empty2: "You haven't posted any rides yet.", current: false, edit: true, del: true },
    { key: "history", label: `History (${rideCounts.history})`, empty1: "No Ride History", empty2: "No completed or cancelled rides are available at the moment.", current: false, edit: false, del: false },
  ];

  const emptyPage = () => ({ rides: [], page: 0, hasMore: true, total: null, loading: false, loaded: false });
  const [data, setData] = useState({ current: emptyPage(), upcoming: emptyPage(), posts: emptyPage(), history: emptyPage() });
  const [tab, setTab] = useState(0);
  const [allRequests, setAllRequests] = useState([]);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [editRide, setEditRide] = useState(null);
  const [deleteRide, setDeleteRide] = useState(null);
  const [confirmRide, setConfirmRide] = useState(null);
  const [notificationRide, setNotificationRide] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const sentinelRef = useRef(null);
  const processedRideIds = useRef(new Set());
  const processedNotificationIds = useRef(new Set());
  const categoryLoadingRef = useRef({ current: false, upcoming: false, posts: false, history: false });
  const toastss = ToastConfig();

  const active = tabs[tab];
  const activeData = data[active.key];
  const authConfig = () => token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const setCategory = (category, patch) => {
    setData(prev => ({ ...prev, [category]: { ...prev[category], ...patch } }));
  };

  const fetchCategory = async (category, { reset = false } = {}) => {
    if (!currentUser?.id) return;
    const state = data[category];
    if (categoryLoadingRef.current[category]) return;
    if (!reset && state.loaded && !state.hasMore) return;
    const page = reset ? 1 : state.page + 1;

    categoryLoadingRef.current[category] = true;
    setCategory(category, { loading: true });
    try {
      const res = await axios.get(`${Api}/rides/get`, {
        params: { type: "my", category, page, limit: ITEMS_PER_PAGE },
        ...authConfig(),
      });
      const body = res?.data || {};
      const rides = Array.isArray(body.data) ? body.data : [];
      const hasMore = typeof body.hasMore === "boolean" ? body.hasMore : rides.length === ITEMS_PER_PAGE;
      const total = typeof body.total === "number" ? body.total : (typeof body.totalRides === "number" ? body.totalRides : null);

      setData(prev => {
        const old = reset ? [] : prev[category].rides;
        const ids = new Set(old.map(r => String(r?._id || r?.id)));
        const unique = rides.filter(r => !ids.has(String(r?._id || r?.id)));
        return { ...prev, [category]: { ...prev[category], rides: reset ? rides : [...old, ...unique], page, hasMore, total, loading: false, loaded: true } };
      });
    } catch (error) {
      console.error(`Error fetching ${category} rides:`, error?.response?.data || error);
      setCategory(category, { loading: false, loaded: true });
      toast.error(error?.response?.data?.message || `Failed to load ${category} rides`, toastss);
    } finally {
      categoryLoadingRef.current[category] = false;
      setInitialLoading(false);
    }
  };

  const refreshCategory = async (category) => {
    setCategory(category, { rides: [], page: 0, hasMore: true, total: null, loaded: false, loading: false });
    await fetchCategory(category, { reset: true });
  };

  const fetchRides = () => refreshCategory(active.key);

  const fetchAllRequests = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await axios.get(`${Api}/bookride/${currentUser.id}?type=received`, authConfig());
      setAllRequests(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error?.response?.data || error);
    } finally {
      setRequestsLoaded(true);
    }
  };

  const fetchRideCounts = async () => {
    try {
      const res = await axios.get(
        `${Api}/rides/my/counts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        setRideCounts(res.data.data);
      }
    } catch (error) {
      console.error(
        "Failed to fetch ride counts:",
        error
      );
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
    ]);
  };

  useEffect(() => {
    if (!currentUser?.id) { setInitialLoading(false); return; }
    fetchCategory("current", { reset: true });
    fetchAllRequests();
    fetchRideCounts();
  }, []);

  useEffect(() => {
    const requestedTab = Number(location.state?.tab);

    if (
      location.state?.tab === undefined ||
      Number.isNaN(requestedTab) ||
      requestedTab < 0 ||
      requestedTab > 3
    ) {
      return;
    }

    setTab(requestedTab);
    setNotificationRide(location.state?.rideId || null);

    const category = tabs[requestedTab].key;

    if (location.state?.refresh) {
      fetchCategory(category, { reset: true });
      fetchAllRequests();
      fetchRideCounts();
      return;
    }

    if (!data[category].loaded) {
      fetchCategory(category, { reset: true });
    }
  }, [location.state]);

  useEffect(() => {
    const handler = () => {
      refreshAllCategories();
    };

    window.addEventListener("rideDataChanged", handler);

    return () => {
      window.removeEventListener("rideDataChanged", handler);
    };
  }, []);

  useEffect(() => {
    if (!refreshRide) return;
    refreshCategory(active.key);
    fetchAllRequests();
  }, [refreshRide]);

  useEffect(() => {
    if (!notifications?.length) return;
    const fresh = notifications.filter(n => {
      const id = String(n?.id || n?._id || "");
      if (!id || processedNotificationIds.current.has(id)) return false;
      processedNotificationIds.current.add(id);
      return true;
    });
    if (!fresh.length) return;

    const newRequest = fresh.filter(n => n?.type === "new_request");
    const refreshTypes = ["request_update", "request_accepted", "ride_request_update", "request_rejected", "ride_cancelled", "ride_status"];
    if (newRequest.length) fetchAllRequests();
    if (fresh.some(n => refreshTypes.includes(n?.type))) refreshCategory(active.key);

    if (newRequest.length) {
      const normalized = newRequest.map(n => {
        const booking = n?.data?.bookingData;
        if (!booking) return null;
        return {
          ...booking,
          rideId: typeof booking.rideId === "object" ? booking.rideId : { _id: booking.rideId },
          requestedBy: {
            _id: booking.requestedBy,
            profileImage: n?.data?.profileImage,
            firstName: n?.data?.requestBy?.requestedBy?.firstName || "",
            lastName: n?.data?.requestBy?.requestedBy?.lastName || "",
          },
        };
      }).filter(Boolean);
      setAllRequests(prev => [...normalized, ...prev].filter((item, i, arr) => i === arr.findIndex(x => x?._id === item?._id)));
    }
  }, [notifications, active.key]);


  useEffect(() => {
  if (location.state?.refresh) {

    console.log("Refreshing all categories due to location state refresh");

    refreshAllCategories();
  }
}, [location.state?.refreshKey]);

  useEffect(() => {
    if (active.key !== "current") return;
    const check = () => {
      const now = new Date();
      (data.current.rides || []).forEach(ride => {
        const id = String(ride?._id || "");
        if (!id || ["Started", "Completed", "Cancelled"].includes(ride?.travelStatus)) return;
        const start = new Date(ride?.startTime);
        if (Number.isNaN(start.getTime()) || now < start || processedRideIds.current.has(id)) return;
        const owner = String(ride?.createdBy?._id || ride?.createdBy || "");
        if (owner === String(currentUser?.id || "")) {
          toast.info("Your ride is starting now 🚗", toastss);
          setConfirmRide(ride);
        }
        processedRideIds.current.add(id);
      });
    };
    check();
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [active.key, data.current.rides, currentUser?.id]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) return;
      const state = data[active.key];
      if (!state.loading && state.hasMore) fetchCategory(active.key);
    }, { rootMargin: "500px 0px", threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [active.key, activeData.loading, activeData.hasMore]);

  const handleTabChange = async (_, value) => {
    setTab(value);
    const category = tabs[value].key;
    if (!data[category].loaded) await fetchCategory(category, { reset: true });
  };

  const handleEdit = async (updated) => {
    const id = String(updated?._id || updated?.id || "");
    if (id) {
      setData(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { next[k] = { ...next[k], rides: next[k].rides.map(r => String(r?._id || r?.id) === id ? { ...r, ...updated } : r) }; });
        return next;
      });
    }
    setEditRide(null);
    toast.success("Ride updated successfully", toastss);
    await refreshCategory(active.key);
  };

  const handleDelete = async (deleted) => {
    const id = String(deleted?._id || deleted?.id || "");
    if (id) setData(prev => { const next = { ...prev }; Object.keys(next).forEach(k => { next[k] = { ...next[k], rides: next[k].rides.filter(r => String(r?._id || r?.id) !== id) }; }); return next; });
    setDeleteRide(null);
    toast.success("Ride cancelled successfully", toastss);
    await refreshCategory(active.key);
  };

  const handleStartOrComplete = async (rideId, status) => {
    try {
      if (status === "Waiting") {
        await axios.patch(`${Api}/rides/edit/${rideId}`, { travelStatus: "Started", startTime: new Date().toISOString() }, authConfig());
        toast.success("Ride started", toastss);
      } else if (status === "Started") {
        await axios.patch(`${Api}/rides/edit/${rideId}`, { travelStatus: "Completed", endTime: new Date().toISOString() }, authConfig());
        toast.success("Ride completed", toastss);
      }
      setConfirmRide(null);
      await refreshCategory("current");
      await refreshCategory("history");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update ride status", toastss);
    }
  };

  const renderList = list => list.map(ride => {
    const completed = ride?.travelStatus === "Completed";
    const cancelled = ride?.travelStatus === "Cancelled";
    return <RideCard
      key={ride?._id || ride?.id}
      user={currentUser}
      ride={ride}
      notificationRide={notificationRide}
      isCurrentRide={active.current}
      setNotificationRide={setNotificationRide}
      showEdit={active.edit && !completed && !cancelled}
      confirmRide={confirmRide}
      setConfirmRide={setConfirmRide}
      showDelete={active.del && !completed && !cancelled}
      fetchRides={fetchRides}
      onEdit={setEditRide}
      onDelete={setDeleteRide}
      allRequests={allRequests}
      fetchRideCounts={fetchRideCounts}
      setAllRequests={setAllRequests}
      fetchAllRequests={fetchAllRequests}
    />;
  });

  const countFor = category => typeof data[category].total === "number" ? data[category].total : data[category].rides.length;

  return (
    <Box sx={{ display: "flex", gap: { xs: 1, sm: 2.5, md: 3 }, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" }, width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", overflowX: "hidden" }}>
      <Box sx={{ flex: 1, width: "100%", minWidth: 0, maxWidth: "100%", mx: { md: "auto", lg: 0 }, boxSizing: "border-box", display: "flex", flexDirection: "column", height: { xs: "100dvh", sm: "auto" }, overflowX: "hidden" }}>
        <Box sx={{ px: { xs: 1.5, sm: 0 }, pt: { xs: 2, sm: 0 }, mb: 2, flexShrink: 0 }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" } }}>My Rides</Typography>
        </Box>

        <Box sx={{ width: "100%", minWidth: 0, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0, position: "sticky", top: -3, zIndex: 10, bgcolor: "background.paper" }}>
          <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ width: "100%", minHeight: { xs: 40, sm: 48, md: 50 }, "& .MuiTabs-flexContainer": { width: "100%" }, "& .MuiTab-root": { minWidth: 0, flex: 1, padding: { xs: "4px 2px", sm: "8px 12px", md: "12px 16px" }, fontSize: { xs: "0.68rem", sm: "0.78rem", md: "0.82rem" }, fontWeight: 600, textTransform: "none", minHeight: { xs: 36, sm: 44, md: 48 }, lineHeight: 1.1, color: "#666", "&.Mui-selected": { color: "#FF9933" } }, "& .MuiTabs-indicator": { height: 3, backgroundColor: "#FF9933" } }}>
            {tabs.map(item => <Tab key={item.key} label={<Typography component="span" noWrap sx={{ fontSize: { xs: "0.62rem", sm: "0.72rem", md: "0.8rem" }, fontWeight: "bold", lineHeight: 1.5 }}>{`${item.label}`}</Typography>} />)}
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, overflowY: { xs: "auto", sm: "visible" }, overflowX: "hidden", px: { xs: 0.5, sm: 0 }, pt: 1.5, pb: { xs: 3, sm: 0 }, "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-track": { bgcolor: "transparent" }, "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: "4px" } }}>
          {(initialLoading && active.key === "current" && !activeData.loaded) || (activeData.loading && !activeData.loaded) ? (
            <Box sx={{ width: "100%", mt: "5rem", display: "flex", justifyContent: "center" }}><CircularProgress size={50} sx={{ color: "#FF9933" }} /></Box>
          ) : activeData.rides.length === 0 && !activeData.loading ? (
            <EmptyState message1={active.empty1} message2={active.empty2} />
          ) : (
            <>
              {renderList(activeData.rides)}
              <Box ref={sentinelRef} sx={{ minHeight: activeData.hasMore ? 80 : 24, display: "flex", alignItems: "center", justifyContent: "center", py: 1 }}>
                {activeData.loading && <CircularProgress size={28} sx={{ color: "#FF9933" }} />}
                {!activeData.loading && !activeData.hasMore && activeData.rides.length > 0 && <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.78rem" }, color: "text.secondary", py: 1 }}>No more rides</Typography>}
              </Box>
            </>
          )}
        </Box>

        {editRide && <EditRideModal ride={editRide} onSave={handleEdit} onClose={() => setEditRide(null)} />}
        {deleteRide && <DeleteConfirmDialog ride={deleteRide} onConfirm={handleDelete} onClose={() => setDeleteRide(null)} />}

        <Dialog open={!!confirmRide} onClose={(e, reason) => { if (reason === "backdropClick") return; setConfirmRide(null); }} PaperProps={{ sx: { borderRadius: { xs: 2, sm: 3 }, mx: { xs: 2, sm: "auto" }, width: { xs: "calc(100% - 32px)", sm: "100%" }, maxWidth: { xs: "calc(100% - 32px)", sm: 450 } } }}>
          <DialogContent sx={{ pb: { xs: 1, sm: 1.5 }, px: { xs: 2, sm: 3 } }}><Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, fontWeight: 600 }}>Looks like your ride is starting</Typography></DialogContent>
          <DialogContent sx={{ pt: 0, px: { xs: 2, sm: 3 } }}>
            <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, mb: 0.5 }}>From : {confirmRide?.from || "—"}</Typography>
            <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, mb: 0.5 }}>To : {confirmRide?.destination || "—"}</Typography>
            <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Time : {confirmRide?.startTime ? moment(confirmRide.startTime).format("DD MMM YYYY, hh:mm A") : "—"}</Typography>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2.5 }, pt: { xs: 0.5, sm: 1 }, gap: { xs: 1, sm: 1.5 }, flexWrap: "nowrap" }}>
            <Button variant="contained" onClick={() => setConfirmRide(null)} sx={{ flex: 1, minWidth: 0, minHeight: { xs: 36, sm: 40 }, bgcolor: "#757575", color: "#fff", textTransform: "none", borderRadius: 2 }}>Not yet</Button>
            <Button variant="contained" onClick={() => handleStartOrComplete(confirmRide?._id, confirmRide?.travelStatus)} sx={{ flex: 1, minWidth: 0, minHeight: { xs: 36, sm: 40 }, bgcolor: "#f89b04", color: "#fff", textTransform: "none", borderRadius: 2 }}>Started</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default MyRides;
