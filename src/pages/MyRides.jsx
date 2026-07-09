import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Stack, FormControl, Grid,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
  CircularProgress, Card, CardContent, Divider, useMediaQuery, DialogContentText,
  Badge, Collapse, Avatar
} from '@mui/material';
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


// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ emoji, message, actionLabel, actionHref }) {
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4 },
        textAlign: 'center',

        border: '1px dashed #E0D5CC',
        bgcolor: '#FFF8F2',
        borderRadius: 2,
        mx: 'auto',
        maxWidth: 480,
      }}
      elevation={0}
    >
      <Typography fontSize="2rem">{emoji}</Typography>
      <Typography fontWeight={600} color="text.secondary" mt={1} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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

// ── Edit Ride Modal ──────────────────────────────────────────────────────────
function EditRideModal({ ride, onSave, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const startDate = new Date(ride.startTime);
  const initialDate = !isNaN(startDate) ? startDate.toISOString().split('T')[0] : '';
  const initialTime = !isNaN(startDate) ? startDate.toISOString().split('T')[1].slice(0, 5) : '';

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
    try {
      const startTime = new Date(`${form.date}T${form.time}:00`).toISOString();
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
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 0, pr: 5 }}>
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
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
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
      <DialogTitle sx={{ fontWeight: 800, pr: 5 }}>
        {label}?
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', width: 44, height: 44 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" fontSize="0.9rem">{body}</Typography>
        <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#FFF8F2', border: '1px solid #F0E6DC', borderRadius: 2 }} elevation={0}>
          <Typography fontSize="0.85rem" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {formFrom(ride)} → {formTo(ride)}
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary">{dateLabel}</Typography>
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
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9933', fontSize: '0.9rem' }}>
                {request.requestedBy?.firstName?.[0] || 'U'}
              </Avatar>
              <Typography fontWeight={700} fontSize="0.95rem">
                {request.requestedBy?.firstName} {request.requestedBy?.lastName || ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 5 }}>
              <Chip
                size="small"
                label={`${request?.seatsRequested || 1} seat${request?.seatsRequested > 1 ? 's' : ''}`}
                icon={<EventSeatIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                size="small"
                label={getStatusLabel(request?.status)}
                color={getStatusColor(request?.status)}
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {request.status?.toUpperCase() === 'PENDING' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => onApprove(request._id)}
                  sx={{ textTransform: 'none', fontSize: '0.7rem' }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => onReject(request._id)}
                  sx={{ textTransform: 'none', fontSize: '0.7rem' }}
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
              <Typography fontSize="0.85rem">
                <strong>Message:</strong> {request.message || 'No message'}
              </Typography>
              <Typography fontSize="0.85rem">
                <strong>Phone:</strong> {request.phone || 'Not provided'}
              </Typography>
              {request.members?.length > 0 && (
                <>
                  <Typography fontSize="0.85rem" fontWeight={700}>Members:</Typography>
                  {request.members.map((m, i) => (
                    <Typography key={i} fontSize="0.82rem" sx={{ ml: 2 }}>
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
function RideCard({ ride, fetchRides, confirmRide, setConfirmRide, showEdit, showDelete, onEdit, isCurrentRide, notificationRide, setNotificationRide, onDelete, allRequests, setAllRequests }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState([]);

  const navigate = useNavigate();

  const status = statusConfig[ride?.status];

  // console.log(ride, 'ride inside ridecard')

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
      // console.log(res.data.succes, 'res')
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



  return (
    <>
      <Box
        sx={{
          p: { xs: 0.5, sm: 0 },
          width: "100%",
          maxWidth: 1000,
          mx: "auto",
          mb: 2.5,
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
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 6px 15px rgba(255,153,51,.25)",
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: { xs: '0.85rem', sm: '1rem' },
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {ride.createdBy?.firstName} {ride.createdBy?.lastName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isCurrentRide && ride?.travelStatus != "Completed" && (
              <Button
                onClick={() => { handleEdit(ride._id, ride?.travelStatus) }}
                sx={{
                  color: 'white',
                  background: ride?.travelStatus != "Started" ? "Orange" : "Red",
                  width: '100%',
                  height: '30px',
                  fontSize: 13,
                }}
              >
                {ride?.travelStatus === "Started" ? "Complete Ride" : "Start Ride"}
              </Button>
            )}
            <Chip
              size="small"
              label={`${status.icon} ${status.label}`}
              sx={{
                bgcolor: status.bg,
                color: status.color,
                fontWeight: 700,
                fontSize: { xs: '0.62rem', sm: '0.7rem' },
                height: { xs: 22, sm: 24 },
                flexShrink: 0,
              }}
            />

            {rideRequests.length > 0 && (
              <Badge
                badgeContent={pendingCount}
                color="error"
                invisible={pendingCount === 0}
              >
                <Button
                  size="small"
                  variant="outlined"
                  // onClick={() => setShowRequests(!showRequests)}
                  onClick={() => setDetailsOpen(true)}
                  sx={{
                    color: '#FF9933',
                    borderColor: '#FF9933',
                    textTransform: 'none',
                    fontSize: { xs: '0.6rem', sm: '0.7rem' },
                    minHeight: 24,
                    height: { xs: 24, sm: 28 },
                    px: 1,
                    '&:hover': {
                      borderColor: '#FF9933',
                      backgroundColor: 'rgba(27, 15, 88, 0.1)',
                    }
                  }}
                >
                  {showRequests ? 'Hide Requests' : 'View Requests'}
                </Button>
              </Badge>
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
            boxShadow: "0 10px 30px rgba(255,153,51,.12)",
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
              p: { xs: '12px !important', sm: '20px 24px !important' },
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
                  pb: { xs: 1.25, sm: 2 },
                  mb: { xs: 1.25, sm: 2 },
                  borderBottom: '1px solid rgba(255,153,51,0.2)',
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#FF9933", fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                  >
                    FROM
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: 'break-word',
                      fontSize: { xs: '0.82rem', sm: '0.95rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    📍 {formFrom(ride)}
                  </Typography>
                </Box>

                <ArrowForwardIcon sx={{ color: '#FF9933', fontSize: { xs: 16, sm: 20 }, flexShrink: 0 }} />

                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#FF9933", fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                  >
                    TO
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: 'break-word',
                      fontSize: { xs: '0.82rem', sm: '0.95rem' },
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
                  gap: { xs: '12px 8px', sm: 3 },
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Date &amp; time
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon sx={{ color: "#FF9933", fontSize: { xs: 15, sm: 18 } }} />
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      {date} · {time}
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Seats available
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeatIcon sx={{ color: "#FF9933", fontSize: { xs: 15, sm: 18 } }} />
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      {ride.availableSeats} seat{ride.availableSeats === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, color: 'text.secondary', mb: 0.5 }}>
                    Travel mode
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {React.cloneElement(travelIcons[ride.modeOfTravel] || travelIcons.Car, {
                      sx: { color: "#FF9933", fontSize: { xs: 15, sm: 18 } },
                    })}
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
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

      <Dialog open={!!confirmRide}>
        <DialogContent>
          Looks like your ride is starting 🚗
        </DialogContent>
        <DialogContent>
          <Typography>From : {confirmRide?.from}</Typography>
          <Typography>To : {confirmRide?.destination}</Typography>
          <Typography>Time : {moment(confirmRide?.startTime).format("DD MMM YYYY, hh:mm A")}</Typography>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRide(null)}>not yet</Button>
          <Button onClick={() => handleEdit(confirmRide._id, confirmRide.travelStatus)}>
            Started
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const MyRides = () => {
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
          toast.info("Your ride is starting now 🚗");

          setConfirmRide(ride);

          processedIds.current.add(ride._id);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRide]);

  // console.log(notifications, 'from my rides')

  // useEffect(() => {
  //   if (!notifications?.length) return;

  //   const latest = notifications[0];
  //   if (latest.type === "request_update" || latest.type === "new_request" || latest.type === "request_accepted") {
  //     const requestData = latest;

  //     setAllMyRequests((prev) => {
  //       console.log(prev, 'prev')
  //       console.log(requestData, 'requestData')

  //       const exists = prev.find(r => r.rideId._id === requestData.data.rideId);

  //       if (exists) {
  //         return prev.map(r =>
  //           r.rideId._id === requestData.data.rideId ? requestData : r
  //         );
  //       }

  //       return [requestData, ...prev];
  //     });
  //   }

  // }, [notifications]);

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
          console.log(ride,'ride histroy')
          const rideStartTime = new Date(ride?.startTime);
          const rideEndTime = new Date(ride?.endTime);
          return ride?.createdBy?._id === user.id && !isNaN(rideStartTime) && rideEndTime < currentDateTime;
        })
      );

      setCurrentRide(
        all.filter((ride) => {
          const rideStartTime = new Date(ride?.startTime);
          const rideEndTime = ride.endTime ? new Date(ride.endTime) : new Date(ride.endTimerideStartTime.getTime() + 3 * 60 * 60 * 1000);
          return ride?.createdBy?._id === user.id && rideStartTime <= currentDateTime && rideEndTime >= currentDateTime;
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
  }, [refreshRide]);

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
  const renderList = (list, showEdit = false, showDelete = false, isCurrentRide = false) =>
    list.map((ride) => (
      <RideCard
        key={ride._id || ride.id}
        ride={ride}
        notificationRide={notificationRide}
        isCurrentRide={isCurrentRide}
        setNotificationRide={setNotificationRide}
        showEdit={showEdit}
        confirmRide={confirmRide}
        setConfirmRide={setConfirmRide}
        showDelete={showDelete}
        fetchRides={fetchRides}
        onEdit={setEditRide}
        onDelete={setDeleteRide}
        allRequests={allRequests}
        setAllRequests={setAllRequests}
      />
    ));

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

  const tabLabels = [
    { short: 'Current', count: currentRide.length },
    { short: 'Upcoming', count: upcomingRequests.length },
    { short: 'My Posts', count: mypost.length },
    { short: 'History', count: history.length + pastRequests.length },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        alignItems: "flex-start",
        flexDirection: { xs: "column", lg: "row", md: "row" },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 720 },
          px: { xs: 0, sm: 3 },
          py: { xs: 0, sm: 3 },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          height: { xs: '100dvh', sm: 'auto' },
        }}
      >
        <Box sx={{ px: { xs: 1.5, sm: 0 }, pt: { xs: 2, sm: 0 }, mb: 2, flexShrink: 0 }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
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
            top: { xs: -10, sm: -12 },
            zIndex: { xs: 10, sm: 10 },
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              minHeight: { xs: 50, sm: 48 },
              "& .MuiTab-root": {
                minWidth: 0,
                padding: { xs: "4px 2px", sm: "12px 16px" },
                fontSize: { xs: "0.7rem", sm: "0.82rem" },
                fontWeight: 600,
                textTransform: "none",
                minHeight: { xs: 38, sm: 48 },
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
                        fontSize: { xs: '0.65rem', sm: "0.8rem" },
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
            px: { xs: 1.5, sm: 0 },
            pt: 2.5,
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
                  {currentRide.length > 0
                    ? renderList(currentRide, false, false, true)
                    : <EmptyState emoji="🚗" message="You don't have any active rides at the moment" actionLabel="Share a Ride" actionHref="/offer" />
                  }
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  {upcoming.length > 0
                    ? renderList(upcoming, true, true)
                    : <EmptyState emoji="🗓️" message="No upcoming rides" actionLabel="Find a ride" actionHref="/find" />}
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  {mypost.length > 0
                    ? renderList(mypost, true, true)
                    : <EmptyState emoji="🚗" message="You haven't posted any rides yet" actionLabel="Post your first ride" actionHref="/offer" />}
                </Box>
              )}

              {tab === 3 && (
                <Box>
                  {history.length > 0
                    ? renderList(history, false, false)
                    : <EmptyState emoji="🕰️" message="No past rides yet" />}
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
      <Box
        sx={{
          flex: 1,
          minWidth: { lg: 340 },
          maxHeight: "90vh",
          overflowY: "auto",
          position: "sticky",
          top: 30,
        }}
      >
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          My Requests
        </Typography>
        <br />
        {allMyRequests
          .filter(req => req?.rideId)
          .map((request) => (
            <Card
              key={request._id}
              sx={{
                mb: 3,
                borderRadius: "20px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                transition: "0.3s",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                },
              }}
            >
              {/* Delete Button */}
              <IconButton
                color="error"
                onClick={() => handleCancelClick(request)}
                sx={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  bgcolor: "#fff",
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "#ffebee",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>

              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                  p: 2.5,
                  pr: 8, // Space for delete button
                }}
              >
                {/* Rider */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 220,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#FF9933",
                      width: 42,
                      height: 42,
                    }}
                  >
                    <PersonIcon />
                  </Avatar>

                  <Typography fontWeight={700}>
                    {request.rideId?.createdBy?.firstName}{" "}
                    {request.rideId?.createdBy?.lastName}
                  </Typography>
                </Box>

                {/* Route */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minWidth: 250,
                  }}
                >
                  <LocationOnIcon sx={{ color: "#FF9933" }} />

                  <Typography fontWeight={600}>
                    {request.rideId?.from}
                  </Typography>

                  <ArrowForwardIcon sx={{ color: "#FF9933" }} />

                  <Typography fontWeight={600}>
                    {request.rideId?.destination}
                  </Typography>
                </Box>

                {/* Date */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CalendarMonthIcon sx={{ color: "#FF9933" }} />

                  <Typography>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Time */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeIcon sx={{ color: "#FF9933" }} />

                  <Typography>
                    {new Date(request.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>

                {/* Status */}
                <Chip
                  label={request.status}
                  color={
                    request.status === "ACCEPTED"
                      ? "success"
                      : request.status === "REJECTED"
                        ? "error"
                        : "warning"
                  }
                  sx={{
                    fontWeight: 700,
                    borderRadius: 5,
                  }}
                />
              </CardContent>
            </Card>
          ))}
        <Dialog
          open={openCancelDialog}
          onClose={handleCloseDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Cancel Ride Request</DialogTitle>

          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel this ride request?
              <br />
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>
              No
            </Button>

            <Button
              color="error"
              variant="contained"
              onClick={handleConfirmCancel}
            >
              Yes, Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

    </Box>
  );
};

export default MyRides;