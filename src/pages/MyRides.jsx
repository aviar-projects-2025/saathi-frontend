import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Stack, FormControl, Grid,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
  CircularProgress, Card, CardContent, Divider, useMediaQuery,
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
import PersonIcon from '@mui/icons-material/Person';           // Male
import WomanIcon from '@mui/icons-material/Woman';             // Female
import GroupsIcon from '@mui/icons-material/Groups';           // Group



const statusConfig = {
  confirmed: { label: 'Filled', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
  pending: { label: 'Opened', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
  completed: { label: 'Closed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  cancelled: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
};

const statusMap = {
  OPEN: 'pending',
  FULL: 'confirmed',
  CLOSED: 'completed',
  CANCELLED: 'cancelled',
};

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

// Maps a fuel-sharing label to a MUI Chip `color` keyword.
const fuelColor = {
  Yes: 'success',
  No: 'default',
  Shared: 'success',
  'Not shared': 'default',
};


// Helper: normalise from/to regardless of field name used by the API
const formFrom = (ride) => ride?.from || '—';
const formTo = (ride) => ride?.destination || ride?.to || '—';

// Prevents iOS Safari from auto-zooming the viewport when a text input
// or select is focused (it zooms on any focused field under 16px font-size).
const noZoomInputSx = {
  '& .MuiInputBase-input, & .MuiSelect-select': {
    fontSize: { xs: '16px', sm: '0.875rem' },
  },
};

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ emoji, message, actionLabel, actionHref }) {
  return (
    <Paper
      sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }}
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
// Maps the PostRide form fields to the edit modal.
// Fields: from, destination, date, time, modeOfTravel, description,
//         availableSeats, genderPreference, fuelSharing
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
          sx={{
            position: 'absolute', right: 8, top: 8, color: 'text.secondary',
            width: 44, height: 44,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, mt: 1, ...noZoomInputSx }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* From */}
          <TextField
            label="From"
            fullWidth
            size="small"
            value={form.from}
            onChange={(e) => update('from', e.target.value)}
            placeholder="Chennai"
          />

          {/* Destination */}
          <TextField
            label="Destination"
            fullWidth
            size="small"
            value={form.destination}
            onChange={(e) => update('destination', e.target.value)}
            placeholder="Bangalore"
          />

          {/* Date & Time */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Stack sx={{ flex: 1 }}>
              <InputLabel shrink>Date</InputLabel>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <InputLabel shrink>Time</InputLabel>
              <TextField
                fullWidth
                size="small"
                type="time"
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>

          {/* Mode of Travel */}
          <FormControl fullWidth size="small">
            <InputLabel>Mode of Travel</InputLabel>
            <Select
              value={form.modeOfTravel}
              label="Mode of Travel"
              onChange={(e) => update('modeOfTravel', e.target.value)}
            >
              <MenuItem value="Car">🚗 Car</MenuItem>
              <MenuItem value="Bus">🚌 Bus</MenuItem>
              <MenuItem value="Bike">🏍️ Bike</MenuItem>
              <MenuItem value="Flight">✈️ Flight</MenuItem>
              <MenuItem value="Ship">🚢 Ship</MenuItem>
              <MenuItem value="Train">🚆 Train</MenuItem>
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            size="small"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Traveling to Bangalore for a weekend trip..."
          />

          {/* Available Seats */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Available seats: {form.availableSeats}
            </Typography>
            <Slider
              value={form.availableSeats}
              onChange={(_, value) => update('availableSeats', value)}
              min={1}
              max={7}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ color: 'primary.main', py: { xs: 1.5, sm: 1 } }}
            />
          </Box>

          {/* Gender Preference */}
          <FormControl fullWidth size="small">
            <InputLabel>Gender Preference</InputLabel>
            <Select
              value={form.genderPreference}
              label="Gender Preference"
              onChange={(e) => update('genderPreference', e.target.value)}
            >
              <MenuItem value="Any">Any</MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>

          {/* Fuel Sharing */}
          <FormControlLabel
            control={
              <Switch
                checked={form.fuelSharing}
                onChange={(e) => update('fuelSharing', e.target.checked)}
                color="primary"
              />
            }
            label="Fuel Sharing"
          />

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleEdit}
          variant="contained"
          disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
        >
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

  // ride doesn't carry a plain `date` field — derive a readable date from startTime.
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
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: 'absolute', right: 8, top: 8, color: 'text.secondary',
            width: 44, height: 44,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" fontSize="0.9rem">{body}</Typography>
        <Paper
          sx={{ mt: 2, p: 1.5, bgcolor: '#FFF8F2', border: '1px solid #F0E6DC', borderRadius: 2 }}
          elevation={0}
        >
          <Typography fontSize="0.85rem" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
            {formFrom(ride)} → {formTo(ride)}
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary">{dateLabel}</Typography>
        </Paper>
        {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
        >
          Keep it
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
        >
          {deleting ? 'Deleting...' : label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Details Modal ───────────────────────────────────────────────────────
// Shown when a RideCard is clicked. Professional summary layout with
// Edit / Delete / Close actions wired back to the parent handlers.
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

  const status = statusConfig[statusMap[ride?.status]] || statusConfig.pending;

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
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: 'absolute', right: 8, top: 8, color: 'text.secondary',
            width: 44, height: 44,
          }}
        >
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
            sx={{
              bgcolor: status?.bg,
              color: status?.color,
              fontWeight: 700,
              fontSize: '0.72rem'
            }}
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
          <Row
            icon={travelIcon[ride.modeOfTravel] || '🚗'}
            label="Mode of travel"
            value={ride.modeOfTravel || '—'}
          />
          <Row icon="🪑" label="Available seats" value={ride.availableSeats ?? ride.seats ?? '—'} />
          <Row
            icon={genderIcons[ride.genderPreference] || '👥'}
            label="Gender preference"
            value={ride.genderPreference || 'Any'}
          />
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
            onClick={() => {
              onEdit(ride);
              onClose();
            }}
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
            onClick={() => {
              onDelete(ride);
              onClose();
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 2, textTransform: 'none', flex: { xs: '1 1 auto', sm: '0 0 auto' }, minHeight: 44 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, showEdit, showDelete, onEdit, onDelete }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const status =
    statusConfig[statusMap[ride?.status]] || statusConfig.pending;

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

  const fuelLabel = ride.fuelSharing ? "Yes" : "No";

  return (
    <>
      <Box
        onClick={() => setDetailsOpen(true)}
        sx={{
          p: { xs: 1, sm: 2 },
          width: '100%',
          maxWidth: 1000,
          mx: "auto",
          cursor: "pointer",
          transition: "all .3s ease",
          "&:hover": {
            transform: { xs: 'none', sm: 'translateY(-5px)' },
          },
        }}
      >
        {/* From / To Header */}
        <Box
          sx={{
            background: "#111",
            color: "#fff",
            borderRadius: "16px 16px 0 0",
            p: { xs: 1.5, sm: 1 },
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between",
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: '100%' }}>
            <Typography
              variant="caption"
              sx={{
                color: "#FF9933",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              FROM
            </Typography>

            <Typography fontWeight={700} sx={{ wordBreak: 'break-word', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              📍 {formFrom(ride)}
            </Typography>
          </Box>

          <Box textAlign={{ xs: 'left', sm: 'right' }} sx={{ minWidth: 0, maxWidth: '100%' }}>
            <Typography
              variant="caption"
              sx={{
                color: "#FF9933",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              TO
            </Typography>

            <Typography fontWeight={700} sx={{ wordBreak: 'break-word', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              📍 {formTo(ride)}
            </Typography>
          </Box>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: "0 0 16px 16px",
            border: "1px solid rgba(255,153,51,0.25)",
            borderTop: 0,
            bgcolor: "#FFF9F2",
            "&:hover": {
              boxShadow: "0 10px 25px rgba(255,153,51,.25)",
            },
          }}
        >
          <CardContent sx={{ p: { xs: 1.75, sm: 3 } }}>
            <Grid container rowSpacing={{ xs: 2, sm: 3 }} columnSpacing={{ xs: 1.5, sm: 3 }} alignItems="center">

              {/* Date & Time */}
              <Grid item xs={6} sm={6} md={2}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon sx={{ color: "#FF9933", fontSize: { xs: 16, sm: 24 } }} />
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      {date}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon sx={{ color: "#FF9933", fontSize: { xs: 16, sm: 24 } }} />
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      {time}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* Vehicle */}
              <Grid item xs={6} sm={6} md={2}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {travelIcons[ride.modeOfTravel]}
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      {`${ride.modeOfTravel}`}
                    </Typography>
                  </Stack>

                  <Chip
                    icon={<LocalGasStationIcon />}
                    label={`Fuel : ${fuelLabel}`}
                    size="small"
                    sx={{
                      bgcolor: fuelLabel === "Yes" ? "#FFF0DD" : "#F3F4F6",
                      color: "#000",
                      fontWeight: 600,
                      fontSize: { xs: '0.68rem', sm: '0.8125rem' },
                      maxWidth: '100%',
                      '& .MuiChip-icon': { fontSize: { xs: 14, sm: 18 } },
                    }}
                  />
                </Stack>
              </Grid>

              {/* Gender & Seats */}
              <Grid item xs={6} sm={6} md={2}>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeatIcon sx={{ color: "#FF9933", fontSize: { xs: 16, sm: 24 } }} />
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      {ride.availableSeats} Seats
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {genderIcon[ride.genderPreference]}
                    <Typography variant="body2" noWrap sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      {`${ride.genderPreference}`}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              {/* Status */}
              <Grid item xs={6} sm={6} md={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    size="small"
                    label={`${status.icon} ${status.label}`}
                    sx={{
                      bgcolor: status.bg,
                      color: status.color,
                      fontWeight: 700,
                      fontSize: { xs: '0.68rem', sm: '0.8125rem' },
                      maxWidth: '100%',
                    }}
                  />
                </Stack>
              </Grid>

            </Grid>
          </CardContent>
        </Card>
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

  // ── Fetch all rides ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRides = async () => {

      const currentDateTime = new Date();

      try {
        const response = await axios.get(`${Api}/rides/get`);

        const all = (response.data.data || []).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );

        setMypost(
          all.filter((item) => item?.createdBy?._id === user.id)
        );

        // Upcoming rides (only future rides)
        setUpcoming(
          all.filter((ride) => {
            const rideStartTime = new Date(ride?.startTime);

            return (
              ride?.createdBy?._id === user.id &&
              !isNaN(rideStartTime) &&
              rideStartTime > currentDateTime
            );
          })
        );

        // History rides (ended after 3 hours)
        setHistory(
          all.filter((ride) => {
            const rideStartTime = new Date(ride?.startTime);

            const rideEndTime = new Date(
              rideStartTime.getTime() + 3 * 60 * 60 * 1000
            );

            return (
              ride?.createdBy?._id === user.id &&
              !isNaN(rideStartTime) &&
              rideEndTime < currentDateTime
            );
          })
        );

        // Current active ride (between start time and +3 hours)
        setCurrentRide(
          all.filter((ride) => {
            const rideStartTime = new Date(ride?.startTime);

            const rideEndTime = new Date(
              rideStartTime.getTime() + 3 * 60 * 60 * 1000
            );

            return (
              ride?.createdBy?._id === user.id &&
              rideStartTime <= currentDateTime &&
              rideEndTime >= currentDateTime
            );
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

  // ── Edit: update the ride in all three lists ───────────────────────────────
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

  // ── Delete: remove from all three lists (called after API success) ─────────
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

  return (
    <>
      <Box
        // sx={{ width: '100%', maxWidth: 700, mx: 'auto', px: { xs: 1.5, sm: 2, md: 0 } }}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: 720 },
          // mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          boxSizing: 'border-box',
        }}
      >
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          My Rides
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            mb: 2.5,
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              minWidth: { xs: 'auto', sm: 90 },
              minHeight: 44,
              px: { xs: 1.25, sm: 2 },
              fontSize: { xs: '0.78rem', sm: '0.875rem' },
            },
            '& .Mui-selected': { color: 'primary.main' },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          }}
        >
          <Tab label={`Current Ride (${currentRide.length})`} />
          <Tab label={`Upcoming (${upcoming.length})`} />
          <Tab label={`My Posts (${mypost.length})`} />
          <Tab label={`History (${history.length})`} />
        </Tabs>

        {loading ? (
          <Box
            sx={{
              width: '100%',
              marginTop: '5rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={50} />
          </Box>

        ) : (
          <>
            {/* Current Ride */}
            {tab === 0 && (
              <Box>
                {currentRide.length > 0
                  ? renderList(currentRide, false, false)
                  : <EmptyState
                    emoji="🚗"
                    message="You don't have any active rides at the moment"
                    actionLabel="Share a Ride"
                    actionHref="/offer"
                  />
                }
              </Box>
            )}

            {/* Upcoming — edit + delete */}
            {tab === 1 && (
              <Box>
                {upcoming.length > 0
                  ? renderList(upcoming, true, true)
                  : <EmptyState emoji="🗓️" message="No upcoming rides" actionLabel="Find a ride" actionHref="/find" />}
              </Box>
            )}

            {/* My Posts — edit + delete */}
            {tab === 2 && (
              <Box>
                {mypost.length > 0
                  ? renderList(mypost, true, true)
                  : <EmptyState emoji="🚗" message="You haven't posted any rides yet"
                    actionLabel="Post your first ride" actionHref="/offer" />}
              </Box>
            )}

            {/* History */}
            {tab === 3 && (
              <Box>
                {history.length > 0
                  ? renderList(history, false, false)
                  : <EmptyState emoji="🕰️" message="No past rides yet" />}
              </Box>
            )}
          </>
        )}
        {/* Edit Modal — pre-filled with all fields from clicked ride */}
        {editRide && (
          <EditRideModal
            ride={editRide}
            onSave={handleEdit}
            onClose={() => setEditRide(null)}
          />
        )}

        {/* Delete Confirm Dialog — calls DELETE API then removes from state */}
        {deleteRide && (
          <DeleteConfirmDialog
            ride={deleteRide}
            onConfirm={handleDelete}
            onClose={() => setDeleteRide(null)}
          />
        )}
      </Box>
    </>
  );
};

export default MyRides;