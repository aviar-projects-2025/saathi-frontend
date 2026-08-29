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
  Pagination,
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

// Pagination config: how many ride cards to show per page on each tab
const ITEMS_PER_PAGE = 10;
const user = JSON.parse(localStorage.getItem("user"));

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

// ── Pagination Bar ───────────────────────────────────────────────────────────
function RidePaginationBar({ count, page, onChange, isMobile }) {
  if (count <= 1) return null;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: { xs: 2, sm: 2.5, md: 3 },
        mb: { xs: 2, sm: 1 },
      }}
    >
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        shape="rounded"
        size={isMobile ? "small" : "medium"}
        siblingCount={isMobile ? 0 : 1}
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: 600,
            color: "#fd6100",
            borderColor: "#fd6100",
            minWidth: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#fd6100",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#e55a00",
            },
          },
        }}
      />
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
        onClose={onClose}
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
    onClose();
    setError("");
    try {
      await axios.patch(
        `${Api}/rides/cancelride/${ride._id || ride.id}?type=Cancel`,
      );

      onConfirm(ride);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Failed to delete ride. Please try again.",
      );


    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
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

  const status = statusConfig[ride?.status];

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
      setApproveLoading(requestId);
      const res = await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Approve`,
        { status: "ACCEPTED" },
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

  const handleReject = async (requestId) => {
    try {
      setRejectLoading(requestId);
     const rejected= await axios.patch(`${Api}/bookride/${requestId}/status?type=Reject`, {
        status: "REJECTED",
      });
      
      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "REJECTED" } : req,
        ),
      );
      
      fetchRides();
      fetchAllRequests();
      toast.success("Request rejected", toasts);
      fetchRides();
    } catch (error) {
      toast.error("Failed to reject request", toasts);
    } finally {
      setRejectLoading(null);
    }
  };

  const handleEdit = async (rideId, status) => {
    try {
      if (status === "Waiting") {
        const response = await axios.patch(`${Api}/rides/edit/${rideId}`, {
          travelStatus: "Started",
          startTime: new Date().toISOString(),
        });

        setConfirmRide(null);
        fetchRides();
        toast.success("Ride Started", toasts);
      } else if (status === "Started") {
        const response = await axios.patch(`${Api}/rides/edit/${rideId}`, {
          travelStatus: "Completed",
          endTime: new Date().toISOString(),
        });

        setConfirmRide(null);
        fetchRides();
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

  const isOwner = ride?.createdBy?._id === user?.id;
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
              alt={
                ride?.createdBy?.firstName
                  ? `${ride?.createdBy?.firstName} ${ride?.createdBy?.lastName || ""
                  }`
                  : "Profile Image"
              }
              onClick={() => {
                setSelectedProfile(ride?.createdBy);
                setProfileModalOpen(true);
              }}
              sx={{
                width: { xs: 26, sm: 35 },
                height: { xs: 26, sm: 35 },
                fontSize: { xs: 12, sm: 13 },
                fontWeight: 700,
                bgcolor: ACCENT,
                color: "#1a1030",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />

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
                      noWrap
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: {
                          xs: "0.78rem",
                          sm: "0.88rem",
                          md: "0.95rem",
                        },
                        lineHeight: 1.3,
                      }}
                    >
                      {/* 📍 */}
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
                      noWrap
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: {
                          xs: "0.78rem",
                          sm: "0.88rem",
                          md: "0.95rem",
                        },
                        lineHeight: 1.3,
                      }}
                    >
                      {/* 📍  */}
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

            {/* Requests section */}
            {/* {showRequests && rideRequests.length > 0 && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,153,51,0.2)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                    Requests ({rideRequests.length})
                  </Typography>
                </Box>
              </Box>
            )} */}
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
          approveLoading={approveLoading}
          rejectLoading={rejectLoading}
        />
      )}

      <Dialog
        open={!!confirmRide}
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
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [tab, setTab] = useState(0);
  const [mypost, setMypost] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [editRide, setEditRide] = useState(null);
  const [deleteRide, setDeleteRide] = useState(null);
  const [currentRide, setCurrentRide] = useState([]);
  const [notificationRide, setNotificationRide] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [allMyRequests, setAllMyRequests] = useState([]);
  const { notifications } = useNotifications();
  const [confirmRide, setConfirmRide] = useState(null);

  const [ridesLoaded, setRidesLoaded] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const loading = !(ridesLoaded && requestsLoaded);

  const [currentRidePage, setCurrentRidePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [mypostPage, setMypostPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const toastss = ToastConfig();

  const activeUpcoming = upcoming.filter(
    (item) => item.travelStatus !== "Cancelled"
  );
  const processedIds = useRef(new Set());

  // const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      currentRide?.forEach((ride) => {
        if (["Started", "Completed"].includes(ride?.travelStatus)) return;

        const start = new Date(ride.startTime);

        if (now >= start && !processedIds.current.has(ride._id)) {
          ride.createdBy._id == user.id &&
            toast.info("Your ride is starting now 🚗", toastss);

          ride.createdBy._id == user.id && setConfirmRide(ride);

          processedIds.current.add(ride._id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRide]);

  // In MyRides component, add this useEffect:

  useEffect(() => {
    // Listen for ride data changes from other components
    const handleRideDataChange = (event) => {
      // Refresh all data
      fetchRides();
      fetchAllSends();
    };

    window.addEventListener("rideDataChanged", handleRideDataChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("rideDataChanged", handleRideDataChange);
    };
  }, []); // Empty dependency array - only run once
  useEffect(() => {
    if (!notifications?.length) return;
    fetchRides();
    fetchAllSends();
  }, [notifications]);

  useEffect(() => {
    if (!notifications?.length) return;

    const newNotifs = notifications.filter(
      (n) => !processedIds.current.has(n.id),
    );

    if (!newNotifs.length) return;

    newNotifs.forEach((n) => processedIds.current.add(n.id));

    const shouldRefetch = newNotifs.some((n) =>
      ["request_update", "request_accepted", "request_rejected"].includes(
        n.type,
      ),
    );

    const shouldRefetchReceived = newNotifs.some(
      (n) => n.type === "new_request",
    );

    if (shouldRefetchReceived) {
      fetchAllRequests();
    }

    fetchRides();

    if (shouldRefetch) {
      fetchAllSends();
    }
  }, [notifications]);

  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTab(location.state.tab);
      setNotificationRide(location.state.rideId);
    }
  }, [location.state]);

  const { refreshRide } = useRide();

  const fetchRides = async () => {
    const currentDateTime = new Date();

    try {
      const response = await axios.get(`${Api}/rides/get`);

      const all = (response.data.data || []).sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );

      const myRides = all.filter((ride) => ride?.createdBy?._id === user.id);

      setMypost(myRides);

      setUpcoming(
        myRides.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);

          return (
            !isNaN(rideStartTime.getTime()) &&
            rideStartTime > currentDateTime &&
            ride?.travelStatus !== "Cancelled" &&
            ride?.travelStatus !== "Completed"
          );
        }),
      );

      setHistory(
        myRides.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);

          return (
            !isNaN(rideStartTime.getTime()) &&
            (ride?.travelStatus === "Completed" ||
              ride?.travelStatus === "Cancelled")
          )
        }),
      );

      const currReqRide = (allMyRequests || []).filter((request) => {
        const rideStartTime = new Date(request?.rideId?.startTime);

        return (
          !isNaN(rideStartTime.getTime()) &&
          rideStartTime <= currentDateTime &&
          request?.rideId?.travelStatus !== "Completed" &&
          request?.rideId?.travelStatus !== "Cancelled"
        );
      });

      setCurrentRide(currReqRide);
    } catch (error) {
      console.error("Error fetching rides:", error.message);
    } finally {
      setRidesLoaded(true);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [refreshRide, notifications]);



  useEffect(() => {
    if (!allMyRequests?.length) return;

    const currentDateTime = new Date();

    const acceptedRides = allMyRequests
      .filter((ride) => {
        // ride?.status?.trim() === "ACCEPTED" && ride.rideId
        const rideStartTime = new Date(ride?.rideId?.startTime);
        return (
          !isNaN(rideStartTime) &&
          rideStartTime > currentDateTime &&
          ride?.status === "ACCEPTED"
        );
      })
      .map((ride) => ride.rideId);

    const myUpcoming = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);
      return !isNaN(rideStartTime) && rideStartTime > currentDateTime;
    });

    setUpcoming([...acceptedRides, ...myUpcoming]);
  }, [allMyRequests, mypost, notifications]);

  useEffect(() => {
    const currentDateTime = new Date();

    // Accepted rides requested by me
    const currReqRide = allMyRequests
      .filter((ride) => {
        const rideStartTime = new Date(ride?.rideId?.startTime);

        return (
          !isNaN(rideStartTime) &&
          rideStartTime <= currentDateTime &&
          ride?.status === "ACCEPTED" &&
          ride?.rideId?.travelStatus !== "Completed" &&
          ride?.rideId?.travelStatus !== "Cancelled"
        );
      })
      .map((ride) => ride.rideId);

    // Rides created by me
    const myrides = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);

      return (
        ride?.createdBy?._id === user.id &&
        !isNaN(rideStartTime) &&
        rideStartTime <= currentDateTime &&
        ride?.travelStatus !== "Completed" &&
        ride?.travelStatus !== "Cancelled"
      );
    });

    const currentRides = [...currReqRide, ...myrides];

    setCurrentRide(currentRides);



    // History - requested rides
    const historyRide = allMyRequests
      .filter((ride) => {
        return (
          ride?.rideId?.travelStatus === "Completed" ||
          ride?.rideId?.travelStatus === "Cancelled"
        );
      })
      .map((ride) => ride.rideId);

    // History - rides created by me
    const histMyPost = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);

      return (
        ride?.createdBy?._id === user.id &&
        !isNaN(rideStartTime) &&
        (ride?.travelStatus === "Completed" ||
          ride?.travelStatus === "Cancelled")
      );
    });

    setHistory([...historyRide, ...histMyPost]);
  }, [allMyRequests, mypost, notifications, user?.id]);

  useEffect(() => {
    if (!notifications?.length) return;

    const newRequestsFromNotifications = notifications
      .filter((noti) => noti.type === "new_request")
      .map((noti) => {
        const booking = noti.data.bookingData;

        return {
          ...booking,
          _id: booking._id,

          // normalize rideId (VERY IMPORTANT)
          rideId: {
            _id: booking.rideId,
          },

          // attach profile image
          requestedBy: {
            _id: booking.requestedBy,
            profileImage: noti.data.profileImage,
            firstName: noti.data.requestBy.requestedBy.firstName,
            lastName: noti.data.requestBy.requestedBy.lastName,
          },
        };
      });

    setAllRequests((prev) => {
      const merged = [...newRequestsFromNotifications, ...prev];

      // remove duplicates
      const unique = merged.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t._id === item._id),
      );

      return unique;
    });
  }, [notifications]);

  const fetchAllRequests = async () => {
    try {
      const res = await axios.get(`${Api}/bookride/${user.id}?type=received`);
      setAllRequests(res.data.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };
  const fetchAllSends = async () => {
    try {
      const res = await axios.get(`${Api}/bookride/send/${user.id}`);

      setAllMyRequests(res.data.data || []);

    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoaded(true);
    }
  };

  useEffect(() => {
    fetchAllSends();
    fetchAllRequests();
  }, []);

  // const getBookRideStatus =(`${Api}/bookride/`)=>{
  //   try{
  //     const res = await axios.get()
  //   }
  // }
  // Socket connection for real-time updates
  // useEffect(() => {
  //   if (!user?.id) return;

  //   socket.emit("join", user.id);

  //   const handleNewRequest = (newRequest) => {
  //     const audio = new Audio(notificationSound);
  //     audio.currentTime = 0;
  //     audio.play();

  //     setAllRequests((prev) => {
  //       const exists = prev.find(r => r._id === newRequest._id);
  //       if (exists) return prev;
  //       return [newRequest, ...prev];
  //     });

  //     setAllMyRequests((prev) => {
  //       const exists = prev.find(r => r._id === newRequest._id);
  //       if (exists) return prev;
  //       return [newRequest, ...prev];
  //     });

  //     toast.info("New ride request received!");
  //   };

  //   const handleNewRequestUpdate = (updated) => {
  //     console.log("updated", updated)
  //     const audio = new Audio(notificationSound);
  //     audio.currentTime = 0;
  //     audio.play();

  //     setAllRequests((prev) =>
  //       prev.map(r => r._id === updated._id ? updated : r)
  //     );

  //     setAllMyRequests((prev) =>
  //       prev.map(r => r._id === updated._id ? updated : r)
  //     );

  //     toast.info("Request status received!");

  //   }

  //   socket.on("new_request", handleNewRequest);
  //   socket.on("request_update", handleNewRequestUpdate);

  //   return () => {
  //     socket.off("new_request", handleNewRequest);
  //     socket.off("request_update", handleNewRequestUpdate);
  //   };
  // }, [user?.id]);

  const handleEdit = (updated) => {
    const id = updated._id || updated.id;
    const merge = (list) =>
      list.map((r) => ((r._id || r.id) === id ? updated : r));
    setMypost(merge(mypost));
    setUpcoming(merge(upcoming));
    setHistory(merge(history));
    setCurrentRide((prev) => merge(prev));
    setEditRide(null);
    // toast.success("Ride Updated Successfully...!", toastss);
  };

  const handleDelete = (deleted) => {
    const id = deleted._id || deleted.id;
    const remove = (list) => list.filter((r) => (r._id || r.id) !== id);
    setMypost((prev) => remove(prev));
    setUpcoming((prev) => remove(prev));
    setHistory((prev) => remove(prev));
    setDeleteRide(null);
    toast.success("Ride Deleted Successfully...!", toastss);
  };
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Slices a list down to the given page's worth of items (ITEMS_PER_PAGE per page)
  const paginate = (list, page) =>
    list.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const renderList = (
    list,
    showEdit = false,
    showDelete = false,
    isCurrentRide = false,
    isHistory = false,
  ) =>
    list.map((ride) => {
      const isCompleted = ride.travelStatus === "Completed";
      const isCancelled = ride.travelStatus === "Cancelled";

      return (
        <RideCard
          key={ride._id || ride.id}
          user={user}
          ride={ride}
          notificationRide={notificationRide}
          isCurrentRide={isCurrentRide}
          setNotificationRide={setNotificationRide}
          showEdit={showEdit && !isCompleted && !isCancelled}
          confirmRide={confirmRide}
          setConfirmRide={setConfirmRide}
          showDelete={showDelete && !isCompleted && !isCancelled}
          fetchRides={fetchRides}
          onEdit={setEditRide}
          onDelete={setDeleteRide}
          allRequests={allRequests}
          setAllRequests={setAllRequests}
          isHistory={isHistory}
          fetchAllRequests={fetchAllRequests}
        />
      );
    });
  const handleCancelClick = (request) => {
    setSelectedRequest(request);
    setOpenCancelDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
    setSelectedRequest(null);
  };

  const handleConfirmCancel = async () => {
    try {
      await axios.delete(`${Api}/bookride/${selectedRequest._id}`);

      handleCloseDialog();

      getMyRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingRequests = useMemo(() => {
    const now = new Date();
    return allMyRequests.filter((booking) => {
      const rideStart = booking.rideId?.startTime
        ? new Date(booking.rideId.startTime)
        : null;
      return rideStart && !isNaN(rideStart.getTime()) && rideStart > now;
    });
  }, [allMyRequests]);

  const pastRequests = useMemo(() => {
    const now = new Date();
    return allMyRequests.filter((booking) => {
      const rideStart = booking.rideId?.startTime
        ? new Date(booking.rideId.startTime)
        : null;
      return rideStart && !isNaN(rideStart.getTime()) && rideStart <= now;
    });
  }, [allMyRequests]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(currentRide.length / ITEMS_PER_PAGE));
    if (currentRidePage > maxPage) setCurrentRidePage(maxPage);
  }, [currentRide, currentRidePage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(upcoming.length / ITEMS_PER_PAGE));
    if (upcomingPage > maxPage) setUpcomingPage(maxPage);
  }, [upcoming, upcomingPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(mypost.length / ITEMS_PER_PAGE));
    if (mypostPage > maxPage) setMypostPage(maxPage);
  }, [mypost, mypostPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
    if (historyPage > maxPage) setHistoryPage(maxPage);
  }, [history, historyPage]);

  const tabLabels = [
    { short: "Current", count: currentRide.length },
    { short: "Upcoming", count: activeUpcoming.length },
    { short: "My Posts", count: mypost.length },
    { short: "History", count: history.length },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 2.5, md: 3 },
        alignItems: "flex-start",
        flexDirection: { xs: "column", lg: "row", md: "row" },
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          mx: { md: "auto", lg: 0 },
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: { xs: "100dvh", sm: "auto" },
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 0 },
            pt: { xs: 2, sm: 0 },
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" } }}
          >
            My Rides
          </Typography>
        </Box>

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            borderBottom: "1px solid",
            borderColor: "divider",
            mb: 0,
            flexShrink: 0,
            position: { xs: "sticky", sm: "sticky" },
            top: { xs: -3, sm: -3 },
            zIndex: { xs: 10, sm: 10 },
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              width: "100%",
              minHeight: { xs: 40, sm: 48, md: 50 },
              "& .MuiTabs-flexContainer": {
                width: "100%",
              },
              "& .MuiTab-root": {
                minWidth: 0,
                flex: 1,
                padding: { xs: "4px 2px", sm: "8px 12px", md: "12px 16px" },
                fontSize: { xs: "0.68rem", sm: "0.78rem", md: "0.82rem" },
                fontWeight: 600,
                textTransform: "none",
                minHeight: { xs: 36, sm: 44, md: 48 },
                lineHeight: 1.1,
              },
              "& .MuiTabs-indicator": {
                height: 3,
              },
            }}
          >
            {tabLabels.map(({ short, count }, i) => (
              <Tab
                key={i}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      width: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography
                      component="span"
                      noWrap
                      sx={{
                        fontSize: {
                          xs: "0.62rem",
                          sm: "0.72rem",
                          md: "0.8rem",
                        },
                        fontWeight: "bold",
                        lineHeight: 1.5,
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {`${short} ( ${count} )`}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            overflowY: { xs: "auto", sm: "visible" },
            overflowX: "hidden",
            px: { xs: 0.5, sm: 0 },
            pt: 1.5,
            pb: { xs: 3, sm: 0 },
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: "4px",
            },
          }}
        >
          {loading ? (
            <Box
              sx={{
                width: "100%",
                mt: "5rem",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={50} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  {currentRide.length > 0 ? (
                    <>
                      {renderList(
                        paginate(currentRide, currentRidePage),
                        true,
                        true,
                        true,
                      )}
                      <RidePaginationBar
                        count={Math.ceil(currentRide.length / ITEMS_PER_PAGE)}
                        page={currentRidePage}
                        onChange={(_, value) => setCurrentRidePage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState
                      message1="No Rides in Progress"
                      message2="You don't have any rides currently in progress."
                    />
                  )}
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  {activeUpcoming.length > 0 ? (
                    <>
                      {renderList(paginate(activeUpcoming, upcomingPage), true, true)}
                      <RidePaginationBar
                        count={Math.ceil(upcoming.length / ITEMS_PER_PAGE)}
                        page={upcomingPage}
                        onChange={(_, value) => setUpcomingPage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState
                      message1="No Upcoming Rides"
                      message2="You don't have any upcoming rides scheduled."
                    />
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  {mypost.length > 0 ? (
                    <>
                      {renderList(paginate(mypost, mypostPage), true, true)}
                      <RidePaginationBar
                        count={Math.ceil(mypost.length / ITEMS_PER_PAGE)}
                        page={mypostPage}
                        onChange={(_, value) => setMypostPage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState
                      message1="No Posted Rides"
                      message2="You haven't posted any rides yet."
                    />
                  )}
                </Box>
              )}

              {tab === 3 && (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  {history.length > 0 ? (
                    <>
                      {renderList(
                        paginate(history, historyPage),
                        false,
                        false,
                        false,
                        true,
                      )}
                      <RidePaginationBar
                        count={Math.ceil(history.length / ITEMS_PER_PAGE)}
                        page={historyPage}
                        onChange={(_, value) => setHistoryPage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState
                      message1="No Ride History"
                      message2="No completed rides are available at the moment."
                    />
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        {editRide && (
          <EditRideModal
            ride={editRide}
            onSave={handleEdit}
            onClose={() => setEditRide(null)}
          />
        )}

        {deleteRide && (
          <DeleteConfirmDialog
            ride={deleteRide}
            onConfirm={handleDelete}
            onClose={() => setDeleteRide(null)}
          />
        )}
      </Box>
    </Box>
  );
};

export default MyRides;
