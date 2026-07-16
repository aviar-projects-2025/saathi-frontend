import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Stack, FormControl, Grid,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
  CircularProgress, Card, CardContent, Divider, useMediaQuery, DialogContentText,
  Badge, Collapse, Avatar, Pagination
} from '@mui/material';
import Ridebook from './Ridebook.jsx';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import WcIcon from '@mui/icons-material/Wc';
import axios from 'axios';
import Api from '../Api';
import { toast } from 'react-toastify';
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import TrainIcon from "@mui/icons-material/Train";
import PersonIcon from '@mui/icons-material/Person';
import WomanIcon from '@mui/icons-material/Woman';
import GroupsIcon from '@mui/icons-material/Groups';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import socket from '../socket'
import { useRide } from "../context/RideContext";
import notificationSound from '../sounds/notifysound.wav'
import { useLocation, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import RideDetailsModal from './RideDetails'
import moment from 'moment';

const statusConfig = {
  FULL: { label: 'Filled', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
  OPEN: { label: 'Opened', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
  // CLOSED: { label: 'Closed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  CLOSED: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
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
  Car: '🚗',
  Bus: '🚌',
  Bike: '🏍️',
  Flight: '✈️',
  Ship: '🚢',
  Train: '🚆',
};

const genderIcons = {
  Male: '👨',
  Female: '👩',
  Any: '👥',
};

const genderIcon = {
  Male: <PersonIcon sx={{ color: "#FF9933" }} />,
  Female: <WomanIcon sx={{ color: "#FF9933" }} />,
  Any: <GroupsIcon sx={{ color: "#FF9933" }} />,
};

const fuelColor = {
  Yes: 'success',
  No: 'default',
  Shared: 'success',
  'Not shared': 'default',
};

const formFrom = (ride) => ride?.from || '—';
const formTo = (ride) => ride?.destination || ride?.to || '—';

const noZoomInputSx = {
  '& .MuiInputBase-input, & .MuiSelect-select': {
    fontSize: { xs: '16px', sm: '0.875rem' },
  },
};

// Pagination config: how many ride cards to show per page on each tab
const ITEMS_PER_PAGE = 10;


// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ emoji, message, actionLabel, actionHref }) {
  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 3.5, md: 4 },
        textAlign: 'center',

        // border: '1px dashed #E0D5CC',
        // bgcolor: '#FFF8F2',
        borderRadius: 2,
        mx: 'auto',
        maxWidth: { xs: '100%', sm: 440, md: 480 },
      }}
      elevation={0}
    >
      {/* <Typography sx={{ fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2rem' } }}>{emoji}</Typography> */}
      <Typography fontWeight={600} color="text.secondary" mt={1} sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } }}>
        {message}
      </Typography>
      {actionLabel && (
        <Button
          variant="contained"
          href={actionHref}
          sx={{ mt: 2, width: { xs: '100%', sm: 'auto' }, minHeight: 44 }}
        >
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}

// ── Pagination Bar ───────────────────────────────────────────────────────────
function RidePaginationBar({ count, page, onChange, isMobile }) {
  if (count <= 1) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
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

// ── Edit Ride Modal ──────────────────────────────────────────────────────────
function EditRideModal({ ride, onSave, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Helper to zero-pad numbers (e.g. 5 -> "05")
  const pad2 = (n) => String(n).padStart(2, '0');

  const startDate = new Date(ride.startTime);

  // FIX: use LOCAL date/time getters, not toISOString().
  // toISOString() converts to UTC, which shifts the displayed date/time
  // away from the actual local time, and causes drift on every save.
  const initialDate = !isNaN(startDate)
    ? `${startDate.getFullYear()}-${pad2(startDate.getMonth() + 1)}-${pad2(startDate.getDate())}`
    : '';
  const initialTime = !isNaN(startDate)
    ? `${pad2(startDate.getHours())}:${pad2(startDate.getMinutes())}`
    : '';

  const [form, setForm] = useState({
    from: ride.from ?? '',
    destination: ride.destination ?? ride.to ?? '',
    date: initialDate,
    time: initialTime,
    modeOfTravel: ride.modeOfTravel ?? '',
    description: ride.description ?? '',
    availableSeats: ride.availableSeats ?? ride.seats ?? 1,
    genderPreference: ride.genderPreference ?? 'Any',
    fuelSharing: ride.fuelSharing ?? false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleEdit = async () => {
    setSaving(true);
    setError('');

    // Basic guard: don't attempt to save with an empty/invalid date or time.
    if (!form.date || !form.time) {
      setError('Please select both a date and a time.');
      setSaving(false);
      return;
    }

    try {
      // form.date and form.time are LOCAL values coming from the inputs.
      // `new Date('YYYY-MM-DDTHH:mm:00')` (no timezone suffix) is parsed
      // as local time by the JS engine, so this correctly round-trips with
      // the local getters used above, then converts to UTC for storage.
      const localDateTime = new Date(`${form.date}T${form.time}:00`);

      if (isNaN(localDateTime)) {
        setError('Invalid date or time. Please check your input.');
        setSaving(false);
        return;
      }

      const startTime = localDateTime.toISOString();
      const { date, time, ...rest } = form;
      const payload = { ...rest, startTime };
      const response = await axios.patch(`${Api}/rides/edit/${ride._id || ride.id}`, payload);
      const updated = response.data?.data ?? { ...ride, ...payload };
      onSave(updated);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update ride. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 }, m: { xs: 0, sm: 2, md: 4 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 0, pr: 5, fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
        Edit Ride
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', width: 44, height: 44 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, mt: 1, ...noZoomInputSx }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField label="From" fullWidth size="small" value={form.from} onChange={(e) => update('from', e.target.value)} placeholder="Chennai" />
          <TextField label="Destination" fullWidth size="small" value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="Bangalore" />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Stack sx={{ flex: 1 }}>
              <InputLabel shrink>Date</InputLabel>
              <TextField fullWidth size="small" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <InputLabel shrink>Time</InputLabel>
              <TextField fullWidth size="small" type="time" value={form.time} onChange={(e) => update('time', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Stack>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Mode of Travel</InputLabel>
            <Select value={form.modeOfTravel} label="Mode of Travel" onChange={(e) => update('modeOfTravel', e.target.value)}>
              <MenuItem value="Car">🚗 Car</MenuItem>
              <MenuItem value="Bus">🚌 Bus</MenuItem>
              <MenuItem value="Bike">🏍️ Bike</MenuItem>
              <MenuItem value="Flight">✈️ Flight</MenuItem>
              <MenuItem value="Ship">🚢 Ship</MenuItem>
              <MenuItem value="Train">🚆 Train</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Description" fullWidth multiline rows={3} size="small" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Traveling to Bangalore for a weekend trip..." />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Available seats: {form.availableSeats}
            </Typography>
            <Slider value={form.availableSeats} onChange={(_, value) => update('availableSeats', value)} min={1} max={7} step={1} marks valueLabelDisplay="auto" sx={{ color: 'primary.main', py: { xs: 1.5, sm: 1 } }} />
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Gender Preference</InputLabel>
            <Select value={form.genderPreference} label="Gender Preference" onChange={(e) => update('genderPreference', e.target.value)}>
              <MenuItem value="Any">Any</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Switch checked={form.fuelSharing} onChange={(e) => update('fuelSharing', e.target.checked)} color="primary" />}
            label="Fuel Sharing"
          />

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          Cancel
        </Button>
        <Button onClick={handleEdit} variant="contained" disabled={saving} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}



// ── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({ ride, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const isPost = ride.role === 'offered' && (ride.status === 'pending' || ride.status === 'confirmed');
  const label = isPost ? 'Remove post' : 'Cancel ride';
  const body = isPost
    ? 'This will remove your ride post. Passengers who requested this ride will be notified.'
    : 'This will cancel your booking. The driver will be notified.';

  const startDate = new Date(ride.startTime);
  const dateLabel = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const handleConfirm = async () => {
    setDeleting(true);
    setError('');
    try {
      await axios.delete(`${Api}/rides/${ride._id || ride.id}`);
      onConfirm(ride);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete ride. Please try again.');
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
      PaperProps={{ sx: { borderRadius: 3, mx: { xs: 2, sm: 'auto' }, width: { xs: 'calc(100% - 32px)', sm: '100%' } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pr: 5, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
        {label}?
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', width: 44, height: 44 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.82rem', sm: '0.9rem' } }}>{body}</Typography>
        <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#FFF8F2', border: '1px solid #F0E6DC', borderRadius: 2 }} elevation={0}>
          <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' } }} fontWeight={700} wordBreak="break-word">
            {formFrom(ride)} → {formTo(ride)}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' } }} color="text.secondary">{dateLabel}</Typography>
        </Paper>
        {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          Keep it
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={deleting} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          {deleting ? 'Deleting...' : label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Request Item Component ──────────────────────────────────────────────────
function RequestItem({ request, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'success';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'Approved ✓';
      case 'APPROVED': return 'Approved ✓';
      case 'REJECTED': return 'Rejected ✗';
      case 'PENDING': return 'Pending ⏳';
      default: return status || 'Pending';
    }
  };

  return (
    <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid #f0e6dc' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, bgcolor: '#FF9933', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                {request.requestedBy?.firstName?.[0] || 'U'}
              </Avatar>
              <Typography fontWeight={700} sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                {request.requestedBy?.firstName} {request.requestedBy?.lastName || ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: { xs: 4.5, sm: 5 } }}>
              <Chip
                size="small"
                label={`${request?.seatsRequested || 1} seat${request?.seatsRequested > 1 ? 's' : ''}`}
                icon={<EventSeatIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              />
              <Chip
                size="small"
                label={getStatusLabel(request?.status)}
                color={getStatusColor(request?.status)}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {request.status?.toUpperCase() === 'PENDING' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onApprove(request._id)}
                  sx={{ textTransform: 'none', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => onReject(request._id)}
                  sx={{ textTransform: 'none', fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                >
                  Reject
                </Button>
              </>
            )}
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0e6dc' }}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
                <strong>Message:</strong> {request.message || 'No message'}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' } }}>
                <strong>Phone:</strong> {request.phone || 'Not provided'}
              </Typography>
              {request.members?.length > 0 && (
                <>
                  <Typography sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' } }} fontWeight={700}>Members:</Typography>
                  {request.members.map((m, i) => (
                    <Typography key={i} sx={{ fontSize: { xs: '0.75rem', sm: '0.82rem' }, ml: 2 }}>
                      • {m.name} ({m.age} yrs)
                    </Typography>
                  ))}
                </>
              )}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}


// ── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, fetchRides, user, confirmRide, setConfirmRide, showEdit, showDelete, onEdit, isCurrentRide, notificationRide, setNotificationRide, onDelete, allRequests, setAllRequests }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();

  const status = statusConfig[ride?.status];

  const startDate = new Date(ride.startTime);
  const date = !isNaN(startDate)
    ? startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const time = !isNaN(startDate)
    ? startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "—";

  const fuelLabel = ride.fuelSharing ? "Yes" : "No";

  // Get requests for this specific ride
  const rideRequests = allRequests?.filter(
    (req) => req.rideId?.toString() === ride._id?.toString()
  ) || [];

  const pendingCount = rideRequests.filter(
    r => r.status?.toUpperCase() === 'PENDING'
  ).length;

  const handleApprove = async (requestId) => {

    try {
      const res = await axios.patch(`${Api}/bookride/${requestId}/status?type=Approve`, { status: 'ACCEPTED' });

      setAllRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'ACCEPTED' } : req
      ));
      fetchRides();
      toast.success('Request approved successfully!');
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`${Api}/bookride/${requestId}/status?type=Reject`, { status: 'REJECTED' });
      setAllRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'REJECTED' } : req
      ));
      toast.success('Request rejected');
      fetchRides()
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const handleEdit = async (rideId, status) => {
    try {

      if (status === 'Waiting') {
        const response = await axios.patch(`${Api}/rides/edit/${rideId}`, { travelStatus: 'Started', startTime: new Date().toISOString() })

        setConfirmRide(null)
        fetchRides()
        toast.success('Ride Started');
      } else if (status === "Started") {
        const response = await axios.patch(`${Api}/rides/edit/${rideId}`, { travelStatus: 'Completed', endTime: new Date().toISOString() })

        setConfirmRide(null)
        fetchRides()
        toast.success('Ride Completed');
      }
    } catch (error) {
      toast.error('Failed');
    }
  };

  useEffect(() => {
    if (!notificationRide) return;

    if (ride?._id && ride._id.toString() === notificationRide.toString()) {
      setDetailsOpen(true);

      setNotificationRide(null);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [notificationRide, ride]);


  const isOwner = ride.createdBy._id === user?.id;
  const isStarted = ride?.travelStatus === "Started";
  const isCompleted = ride?.travelStatus === "Completed";



  return (
    <>
      <Box
        sx={{
          p: { xs: 0, sm: 0 },
          width: "100%",
          // maxWidth: "100%",
          // mx: "auto",
          mb: { xs: 1.5, sm: 2 },
          transition: "all .3s ease",
          "&:hover": {
            transform: { xs: "none", sm: "translateY(-6px)" },
          },
        }}
      >
        {/* ── Top header: name + status ── */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #0e0e3b, #271c45)",
            color: "#fff",
            borderRadius: "18px 18px 0 0",
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
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.92rem", md: "1rem" },
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {ride.createdBy?.firstName} {ride.createdBy?.lastName}
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
            {/* Completed Chip */}
            {ride?.travelStatus === "Completed" && (
              <Chip
                size="small"
                label={isMobile ? "Completed" : "Completed Ride"}
                sx={{
                  bgcolor: status.bg,
                  color: status.color,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Status Chip */}
            {ride?.travelStatus !== "Completed" && (
              <Chip
                size="small"
                label={`${status.icon} ${status.label}`}
                sx={{
                  bgcolor: status.bg,
                  color: status.color,
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
          onClick={() => setDetailsOpen(true)}
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
            sx={{
              p: { xs: '10px !important', sm: '16px 18px !important', md: '20px 24px !important' },
            }}
          >
            <Box>
              {/* FROM / TO row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  pb: { xs: 1.1, sm: 1.5, md: 2 },
                  mb: { xs: 1.1, sm: 1.5, md: 2 },
                  borderBottom: '1px solid rgba(255,153,51,0.2)',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#FF9933", fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: '0.58rem', sm: '0.65rem', md: '0.7rem' } }}
                  >
                    FROM
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: 'break-word',
                      fontSize: { xs: '0.78rem', sm: '0.88rem', md: '0.95rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    📍 {formFrom(ride)}
                  </Typography>
                </Box>

                <ArrowForwardIcon sx={{ color: '#FF9933', fontSize: { xs: 14, sm: 18, md: 20 }, flexShrink: 0 }} />

                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#FF9933", fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: '0.58rem', sm: '0.65rem', md: '0.7rem' } }}
                  >
                    TO
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: 'break-word',
                      fontSize: { xs: '0.78rem', sm: '0.88rem', md: '0.95rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    📍 {formTo(ride)}
                  </Typography>
                </Box>
              </Box>

              {/* Details grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
                  gap: { xs: '10px 6px', sm: '16px', md: 3 },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: { xs: '0.62rem', sm: '0.68rem', md: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Date &amp; time
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon sx={{ color: "#FF9933", fontSize: { xs: 14, sm: 16, md: 18 } }} />
                    <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}>
                      {date} · {time}
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: { xs: '0.62rem', sm: '0.68rem', md: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Seats available
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeatIcon sx={{ color: "#FF9933", fontSize: { xs: 14, sm: 16, md: 18 } }} />
                    <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}>
                      {ride.availableSeats} seat{ride.availableSeats === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: { xs: '0.62rem', sm: '0.68rem', md: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Travel mode
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {React.cloneElement(travelIcons[ride.modeOfTravel] || travelIcons.Car, {
                      sx: { color: "#FF9933", fontSize: { xs: 14, sm: 16, md: 18 } },
                    })}
                    <Typography sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }, fontWeight: 600 }}>
                      {ride.modeOfTravel}
                    </Typography>
                  </Stack>
                </Box>
              </Box>
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

      {/* {detailsOpen && (
        <RideDetailsModal
          ride={ride}
          showEdit={showEdit}
          showDelete={showDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={() => setDetailsOpen(false)}
          request={[selectedRequest]}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )} */}

      {detailsOpen && (
        // rideRequests.map((req) => (
        // <RequestItem
        //   key={req._id}
        //   request={req}
        //   onApprove={handleApprove}
        //   onReject={handleReject}
        // />

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
        />
      )}

      <Dialog open={!!confirmRide} PaperProps={{ sx: { borderRadius: { xs: 2, sm: 3 }, mx: { xs: 2, sm: 'auto' }, width: { xs: 'calc(100% - 32px)', sm: '100%' } } }}>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>Looks like your ride is starting 🚗</Typography>
        </DialogContent>
        <DialogContent sx={{ pt: 0 }}>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>From : {confirmRide?.from}</Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>To : {confirmRide?.destination}</Typography>
          <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Time : {moment(confirmRide?.startTime).format("DD MMM YYYY, hh:mm A")}</Typography>

        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button onClick={() => setConfirmRide(null)} sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 40 }}>not yet</Button>
          <Button variant="contained" onClick={() => handleEdit(confirmRide._id, confirmRide.travelStatus)} sx={{ flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 40 }}>
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [tab, setTab] = useState(0);
  const [mypost, setMypost] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [editRide, setEditRide] = useState(null);
  const [deleteRide, setDeleteRide] = useState(null);
  const [currentRide, setCurrentRide] = useState([]);
  const [notificationRide, setNotificationRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]);
  const [allMyRequests, setAllMyRequests] = useState([]);
  const { notifications } = useNotifications();
  const [confirmRide, setConfirmRide] = useState(null)

  // Pagination state — one page counter per tab so each tab remembers its own position
  const [currentRidePage, setCurrentRidePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [mypostPage, setMypostPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);


  const processedIds = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      currentRide?.forEach((ride) => {
        if (["Started", "Completed"].includes(ride?.travelStatus)) return;

        const start = new Date(ride.startTime);

        if (
          now >= start &&
          !processedIds.current.has(ride._id)
        ) {
          ride.createdBy._id == user.id && toast.info("Your ride is starting now 🚗");

          ride.createdBy._id == user.id && setConfirmRide(ride);

          processedIds.current.add(ride._id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRide]);

  useEffect(() => {
    if (!notifications?.length) return;
    fetchRides();
    fetchAllSends();
  }, [notifications]);

  useEffect(() => {
    if (!notifications?.length) return;

    const newNotifs = notifications.filter(
      (n) => !processedIds.current.has(n.id)
    );

    if (!newNotifs.length) return;

    newNotifs.forEach((n) => processedIds.current.add(n.id));

    const shouldRefetch = newNotifs.some((n) =>
      ["request_update", "request_accepted", "request_rejected"].includes(n.type)
    );

    const shouldRefetchReceived = newNotifs.some((n) =>
      n.type === "new_request"
    );

    if (shouldRefetchReceived) {
      fetchAllRequests();
    }

    fetchRides()

    if (shouldRefetch) {
      fetchAllSends();
    }
  }, [notifications]);

  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setTab(location.state.tab);
      setNotificationRide(location.state.rideId)
    }
  }, [location.state]);

  const { refreshRide } = useRide();

  const fetchRides = async () => {

    const currentDateTime = new Date();
    try {
      const response = await axios.get(`${Api}/rides/get`);
      const all = (response.data.data || []).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      setMypost(all.filter((item) => item?.createdBy?._id === user.id));


      setUpcoming(
        all.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);
          return ride?.createdBy?._id === user.id && !isNaN(rideStartTime) && rideStartTime > currentDateTime;
        })
      );

      setHistory(
        all.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);
          // const rideEndTime = new Date(rideStartTime.getTime() + 3 * 60 * 60 * 1000);
          return ride?.createdBy?._id === user.id && !isNaN(rideStartTime) && ride?.travelStatus === "Completed";
        })
      );

      setCurrentRide(
        //   const currentDateTime = new Date();
        //   const currReqRide = allMyRequests.filter((ride)=>{

        //     const rideStartTime = new Date(ride?.rideId?.startTime);
        //     return(
        //       !isNaN(rideStartTime) &&
        //       rideStartTime <= currentDateTime
        //     )
        //   })

        all.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);
          // const rideEndTime = new Date(rideStartTime.getTime() + 3 * 60 * 60 * 1000);
          return ride?.createdBy?._id === user.id && rideStartTime >= currentDateTime && ride?.travelStatus !== "Completed";
        })
      );

    } catch (error) {
      console.error('Error fetching rides:', error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRides();
  }, [refreshRide, notifications]);


  // Upcoming Ride Condition for both req and post
  useEffect(() => {

    if (!allMyRequests?.length) return;

    const currentDateTime = new Date();

    const acceptedRides = allMyRequests.filter((ride) => {
      // ride?.status?.trim() === "ACCEPTED" && ride.rideId
      const rideStartTime = new Date(ride?.rideId?.startTime);
      return (
        !isNaN(rideStartTime) &&
        rideStartTime > currentDateTime && ride?.status === "ACCEPTED"
      )
    })
      .map((ride) => ride.rideId);

    const myUpcoming = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);
      return (
        !isNaN(rideStartTime) &&
        rideStartTime > currentDateTime
      );
    });


    setUpcoming([...acceptedRides, ...myUpcoming]);
  }, [allMyRequests, mypost, notifications]);

  useEffect(() => {
    console.log("🔥 notifications changed", notifications);
  }, [notifications]);

  useEffect(() => {
    const currentDateTime = new Date();

    const currReqRide = allMyRequests
      .filter((ride) => {
        const rideStartTime = new Date(ride?.rideId?.startTime);

        return (
          !isNaN(rideStartTime) &&
          rideStartTime <= currentDateTime && ride?.status === "ACCEPTED" && ride?.rideId?.travelStatus !== "Completed"
        );
      })
      .map((ride) => ride.rideId);



    const myrides = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);
      // const rideEndTime = new Date(rideStartTime.getTime() + 3 * 60 * 60 * 1000);
      return ride?.createdBy?._id === user.id && rideStartTime <= currentDateTime && ride?.travelStatus !== "Completed";
    })


    setCurrentRide([...currReqRide, ...myrides]);

    const historyRide = allMyRequests
      .filter((ride) => ride?.rideId?.travelStatus == "Completed")
      .map((ride) => ride.rideId);

    const histMyPost = mypost.filter((ride) => {
      const rideStartTime = new Date(ride?.startTime);
      return ride?.createdBy?._id === user.id && !isNaN(rideStartTime) && ride?.travelStatus == "Completed";
    })

    setHistory([...historyRide, ...histMyPost]);

  }, [allMyRequests, mypost, notifications]);

  const fetchAllRequests = async () => {
    try {
      const res = await axios.get(`${Api}/bookride/${user.id}?type=received`);
      setAllRequests(res.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchAllSends = async () => {
    try {
      const res = await axios.get(`${Api}/bookride/send/${user.id}`);
      // console.log(res.data.data, 'res.data.data')
      setAllMyRequests(res.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
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
    const merge = (list) => list.map((r) => ((r._id || r.id) === id ? updated : r));
    setMypost(merge(mypost));
    setUpcoming(merge(upcoming));
    setHistory(merge(history));
    setCurrentRide(prev => merge(prev));
    setEditRide(null);
    toast.success('Ride Updated Successfully...!');
  };

  const handleDelete = (deleted) => {
    const id = deleted._id || deleted.id;
    const remove = (list) => list.filter((r) => (r._id || r.id) !== id);
    setMypost(prev => remove(prev));
    setUpcoming(prev => remove(prev));
    setHistory(prev => remove(prev));
    setDeleteRide(null);
    toast.success('Ride Deleted Successfully...!');
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
    isCurrentRide = false
  ) =>
    list.map((ride) => {
      const isCompleted = ride.travelStatus === "Completed";

      return (
        <RideCard
          key={ride._id || ride.id}
          user={user}
          ride={ride}
          notificationRide={notificationRide}
          isCurrentRide={isCurrentRide}
          setNotificationRide={setNotificationRide}
          showEdit={showEdit && !isCompleted}
          confirmRide={confirmRide}
          setConfirmRide={setConfirmRide}
          showDelete={showDelete && !isCompleted}
          fetchRides={fetchRides}
          onEdit={setEditRide}
          onDelete={setDeleteRide}
          allRequests={allRequests}
          setAllRequests={setAllRequests}
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
      // Call your delete/cancel API here
      await axios.delete(`${Api}/bookride/${selectedRequest._id}`);


      handleCloseDialog();

      // Refresh request list
      getMyRequests();
    } catch (err) {
      console.error(err);
    }
  };
  // Rides you've requested/booked that haven't happened yet
  const upcomingRequests = useMemo(() => {
    const now = new Date();
    return allMyRequests.filter((booking) => {
      const rideStart = booking.rideId?.startTime ? new Date(booking.rideId.startTime) : null;
      return rideStart && !isNaN(rideStart.getTime()) && rideStart > now;
    });
  }, [allMyRequests]);

  // Rides you've requested/booked that already happened (with approve/reject outcome)
  const pastRequests = useMemo(() => {
    const now = new Date();
    return allMyRequests.filter((booking) => {
      const rideStart = booking.rideId?.startTime ? new Date(booking.rideId.startTime) : null;
      return rideStart && !isNaN(rideStart.getTime()) && rideStart <= now;
    });
  }, [allMyRequests]);

  // Clamp each tab's page number back into range whenever its underlying list shrinks/grows
  // (e.g. after a delete makes the last page disappear)
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
    { short: 'Current', count: currentRide.length },
    { short: 'Upcoming', count: upcoming.length },
    { short: 'My Posts', count: mypost.length },
    { short: 'History', count: history.length },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 2.5, md: 3 },
        alignItems: "flex-start",
        flexDirection: { xs: "column", lg: "row", md: "row" },
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          // maxWidth: { xs: '100%', sm: '100%', md: 900, lg: 1200 },
          mx: { md: 'auto', lg: 0 },
          // px: { xs: 0, sm: 2, md: 3 },
          // py: { xs: 0, sm: 2, md: 3 },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: '100dvh', sm: 'auto' },
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 0 }, pt: { xs: 2, sm: 0 }, mb: 2, flexShrink: 0 }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' } }}>
            My Rides
          </Typography>
        </Box>

        <Box
          sx={{
            width: '100%',
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 0,
            flexShrink: 0,
            position: { xs: 'sticky', sm: 'sticky' },
            top: { xs: -3, sm: -3 },
            zIndex: { xs: 10, sm: 10 },
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: { xs: 40, sm: 48, md: 50 },
              "& .MuiTab-root": {
                minWidth: 0,
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: '0.62rem', sm: "0.72rem", md: "0.8rem" },
                        fontWeight: "bold",
                        lineHeight: 1.5,
                        whiteSpace: 'nowrap',
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
            overflowY: { xs: 'auto', sm: 'visible' },
            px: { xs: 0.5, sm: 0 },
            pt: 1.5,
            pb: { xs: 3, sm: 0 },
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' },
          }}
        >
          {loading ? (
            <Box sx={{ width: '100%', mt: '5rem', display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={50} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                <Box>
                  {currentRide.length > 0 ? (
                    <>
                      {renderList(paginate(currentRide, currentRidePage), true, true, true)}
                      <RidePaginationBar
                        count={Math.ceil(currentRide.length / ITEMS_PER_PAGE)}
                        page={currentRidePage}
                        onChange={(_, value) => setCurrentRidePage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState emoji="🚗" message="You don't have any active rides at the moment"

                    />
                  )}
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  {upcoming.length > 0 ? (
                    <>
                      {renderList(paginate(upcoming, upcomingPage), true, true)}
                      <RidePaginationBar
                        count={Math.ceil(upcoming.length / ITEMS_PER_PAGE)}
                        page={upcomingPage}
                        onChange={(_, value) => setUpcomingPage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState emoji="🗓️" message="No upcoming rides" />
                  )}
                </Box>
              )}

              {tab === 2 && (
                <Box>
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
                    <EmptyState emoji="🚗" message="You haven't posted any rides yet" />
                  )}
                </Box>
              )}

              {tab === 3 && (
                <Box>
                  {history.length > 0 ? (
                    <>
                      {renderList(paginate(history, historyPage), false, false)}
                      <RidePaginationBar
                        count={Math.ceil(history.length / ITEMS_PER_PAGE)}
                        page={historyPage}
                        onChange={(_, value) => setHistoryPage(value)}
                        isMobile={isMobile}
                      />
                    </>
                  ) : (
                    <EmptyState emoji="🕰️" message="No past rides yet" />
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        {editRide && (
          <EditRideModal ride={editRide} onSave={handleEdit} onClose={() => setEditRide(null)} />
        )}

        {deleteRide && (
          <DeleteConfirmDialog ride={deleteRide} onConfirm={handleDelete} onClose={() => setDeleteRide(null)} />
        )}
      </Box>

    </Box>
  );
};

export default MyRides;

