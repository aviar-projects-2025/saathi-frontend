import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Stack, FormControl, Grid,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
  CircularProgress, Card, CardContent, Divider, useMediaQuery,
  Badge, Collapse, Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  // Use local date/time components (not toISOString, which is UTC) so the
  // displayed value matches what gets sent to the server when saving.
  const pad = (n) => String(n).padStart(2, '0');
  const initialDate = !isNaN(startDate)
    ? `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`
    : '';
  const initialTime = !isNaN(startDate)
    ? `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`
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

    if (!form.date || !form.time) {
      setError('Please select both a date and time.');
      setSaving(false);
      return;
    }

    const combined = new Date(`${form.date}T${form.time}:00`);
    if (isNaN(combined)) {
      setError('Invalid date or time. Please check your input.');
      setSaving(false);
      return;
    }

    try {
      const startTime = combined.toISOString();
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
  const [cancel, setCancel] = useState(false);
  const [error, setError] = useState('');

  // const isPost = ride.role === 'offered' && (ride.status === 'pending' || ride.status === 'confirmed');
  // const label = isPost ? 'Remove Post' : 'Cancel Ride';
  // const body = isPost
  //   ? 'This will remove your ride post. Passengers who requested this ride will be notified.'
  //   : 'This will cancel your booking. The driver will be notified.';

  const startDate = new Date(ride.startTime);
  const dateLabel = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const handleConfirm = async () => {
    setCancel(true);
    setError('');
    // try {
    //   await axios.delete(`${Api}/rides/${ride.id || ride._id}`);
    //   onConfirm(ride);
    // } catch (err) {
    //   setError(err?.response?.data?.message || 'Failed to delete ride. Please try again.');
    // } finally {
    //   setDeleting(false);
    // }
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
        Cancel Ride ?
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', width: 44, height: 44 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" fontSize="0.9rem">This will cancel your booking. The driver will be notified.</Typography>
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
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={cancel} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          Cancel Ride
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Details Modal ───────────────────────────────────────────────────────
function RideDetailsModal({ ride, showEdit, showDelete, onEdit, onDelete, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const startDate = new Date(ride.startTime);
  const dateLabel = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const timeLabel = !isNaN(startDate)
    ? startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';

  const status = statusConfig[ride?.status];

  const Row = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, py: 0.5 }}>
      <Typography fontSize="1.1rem" lineHeight={1.4}>{icon}</Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography fontWeight={600} fontSize="0.92rem" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen} PaperProps={{ sx: { borderRadius: { xs: 0, sm: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1, pr: 5 }}>
        Ride Details
        <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary', width: 44, height: 44 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', minWidth: 0 }}>
            <Typography fontWeight={800} fontSize="1.05rem" sx={{ wordBreak: 'break-word' }}>{formFrom(ride)}</Typography>
            <ArrowForwardIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography fontWeight={800} fontSize="1.05rem" sx={{ wordBreak: 'break-word' }}>{formTo(ride)}</Typography>
          </Box>
          <Chip
            label={`${status?.icon} ${status?.label}`}
            size="small"
            sx={{ bgcolor: status?.bg, color: status?.color, fontWeight: 700, fontSize: '0.72rem' }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 0.5,
            bgcolor: '#FFF8F2',
            border: '1px solid #F0E6DC',
            borderRadius: 2,
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Row icon="📅" label="Date" value={dateLabel} />
          <Row icon="🕐" label="Time" value={timeLabel} />
          <Row icon={travelIcon[ride.modeOfTravel] || '🚗'} label="Mode of travel" value={ride.modeOfTravel || '—'} />
          <Row icon="🪑" label="Available seats" value={ride.availableSeats ?? ride.seats ?? '—'} />
          <Row icon={genderIcons[ride.genderPreference] || '👥'} label="Gender preference" value={ride.genderPreference || 'Any'} />
          <Row icon="⛽" label="Fuel sharing" value={ride.fuelSharing ? 'Yes' : 'No'} />
        </Box>

        {ride.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              📝 Description
            </Typography>
            <Typography fontSize="0.9rem" sx={{ wordBreak: 'break-word' }}>{ride.description}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1, flexWrap: 'wrap' }}>
        {showEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => { onEdit(ride); onClose(); }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
          >
            Edit
          </Button>
        )}
        {showDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => { onDelete(ride); onClose(); }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Request Item Component ──────────────────────────────────────────────────
function RequestItem({ request, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  console.log(request, 'request')

  return (
    <Card sx={{ mb: 2, borderRadius: 2, border: '1px solid #f0e6dc' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9933', fontSize: '0.9rem' }}>
                {request.requestedBy?.firstName?.[0]}
              </Avatar>
              <Typography fontWeight={700} fontSize="0.95rem">
                {request.requestedBy?.firstName} {request.requestedBy?.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 5 }}>
              <Chip
                size="small"
                label={`${request?.seatsRequested} seat${request?.seatsRequested > 1 ? 's' : ''}`}
                icon={<EventSeatIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                size="small"
                label={request?.status}
                color={getStatusColor(request?.status)}
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
          {request.status === 'PENDING' && (
            <Stack direction="row" spacing={2} mt={1}>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => onApprove(request._id)}
                sx={{ textTransform: 'none' }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => onReject(request._id)}
                sx={{ textTransform: 'none' }}
              >
                Reject
              </Button>
            </Stack>
          )}
          {request.status === 'approved' && (
            <Chip
              label="Approved ✓"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {request.status === 'rejected' && (
            <Chip
              label="Rejected ✗"
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
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
function RideCard({ ride, showEdit, showDelete, onEdit, onDelete }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = JSON.parse(localStorage.getItem('user'));
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const status = statusConfig[ride?.status];

  const startDate = new Date(ride.startTime);
  const date = !isNaN(startDate)
    ? startDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const time = !isNaN(startDate)
    ? startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "—";

  const fuelLabel = ride.fuelSharing ? "Yes" : "No";


  const fetchRequests = async () => {
    // if (requests.length > 0) {
    //   setShowRequests(!showRequests);
    //   return;
    // }

    setLoadingRequests(true);
    try {
      const res = await axios.get(`${Api}/bookride/${user.id}?type=received`);
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [])

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`${Api}/bookride/${requestId}/status`, { status: 'approved' });
      setRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'approved' } : req
      ));
      toast.success('Request approved successfully!');
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`${Api}/bookride/${requestId}/status`, { status: 'rejected' });
      setRequests(prev => prev.map(req =>
        req._id === requestId ? { ...req, status: 'rejected' } : req
      ));
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };





  const filteredRequests = requests.filter(
    (req) => req.rideId === ride._id
  );

  console.log(filteredRequests, 'filteredRequests')

  return (
    <>
      <Box
        sx={{
          p: { xs: 0.01, sm: 0 },
          width: '100%',
          maxWidth: 1000,
          mx: "auto",
          transition: "transform .25s ease",
          "&:hover": {
            transform: { xs: 'none', sm: 'translateY(-4px)' },
          },
          mb: 2
        }}
      >
        {/* ── Top header: name + status ── */}
        <Box
          sx={{
            background: "#111",
            color: "#fff",
            borderRadius: "14px 14px 0 0",
            px: { xs: 1.5, sm: 2.5 },
            py: { xs: 1.1, sm: 1.4 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
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

            {requests.some(r => r.rideId === ride._id) && (
              <Badge
                badgeContent={
                  requests.filter(
                    r => r.status === 'PENDING' && r.rideId === ride._id
                  ).length
                }
                color="error"
                invisible={
                  requests.filter(
                    r => r.status === 'PENDING' && r.rideId === ride._id
                  ).length === 0
                }
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setShowRequests(!showRequests)
                  }}
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
                      backgroundColor: 'rgba(255, 153, 51, 0.1)',
                    }
                  }}
                >
                  View Requests
                </Button>
              </Badge>
            )}
          </Box>
        </Box>

        {/* ── Card body ── */}
        <Card
          onClick={() => setDetailsOpen(true)}
          elevation={0}
          sx={{
            borderRadius: "0 0 14px 14px",
            border: "1px solid rgba(255,153,51,0.25)",
            borderTop: 0,
            bgcolor: "#FFF9F2",
            transition: "box-shadow .25s ease",
          }}
        >
          <CardContent
            sx={{
              p: { xs: '12px !important', sm: '20px 24px !important' },
            }}
          >
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
          </CardContent>
        </Card>
        {/* Requests section */}
        {showRequests && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,153,51,0.2)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                Requests ({requests.length})
              </Typography>
              <Button
                size="small"
                onClick={() => setShowRequests(false)}
                sx={{ textTransform: 'none' }}
              >
                Close
              </Button>
            </Box>

            {filteredRequests.length === 0 ? (
              <Paper sx={{ p: 2, bgcolor: '#ffffffff', textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary" fontSize="0.85rem">
                  No requests yet for this ride
                </Typography>
              </Paper>
            ) : (
              filteredRequests.map((req) => (
                <RequestItem
                  key={req._id}
                  request={req}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </Box>
        )}
      </Box>

      {detailsOpen && (
        <RideDetailsModal
          ride={ride}
          showEdit={showEdit}
          showDelete={showDelete}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
const MyRides = () => {
  const [tab, setTab] = useState(0);
  const [mypost, setMypost] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [editRide, setEditRide] = useState(null);
  const [deleteRide, setDeleteRide] = useState(null);
  const [currentRide, setCurrentRide] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
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
            const rideEndTime = new Date(rideStartTime.getTime() + 3 * 60 * 60 * 1000);
            return ride?.createdBy?._id === user.id && !isNaN(rideStartTime) && rideEndTime < currentDateTime && ride?.status == "CLOSED";
          })
        );

        setCurrentRide(
          all.filter((ride) => {
            const rideStartTime = new Date(ride?.startTime);
            const rideEndTime = new Date(rideStartTime.getTime() + 3 * 60 * 60 * 1000);
            return ride?.createdBy?._id === user.id && rideStartTime <= currentDateTime && rideEndTime >= currentDateTime;
          })
        );
      } catch (error) {
        console.error('Error fetching rides:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  console.log("Ride List ===> ", mypost);

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

  const renderList = (list, showEdit = false, showDelete = false) =>
    list.map((ride) => (
      <RideCard
        key={ride._id || ride.id}
        ride={ride}
        showEdit={showEdit}
        showDelete={showDelete}
        onEdit={setEditRide}
        onDelete={setDeleteRide}
      />
    ));

  const tabLabels = [
    { short: 'Current', count: currentRide.length },
    { short: 'Upcoming', count: upcoming.length },
    { short: 'My Posts', count: mypost.length },
    { short: 'History', count: history.length },
  ];

  return (
    <>
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
                        fontSize: { xs: '0.55rem', sm: "0.8rem" },
                        fontWeight: 'inherit',
                        lineHeight: 1.2,
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
                    ? renderList(currentRide, false, false)
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
    </>
  );
};

export default MyRides;