import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Stack, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
  CircularProgress,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import Api from '../Api';
import { toast } from 'react-toastify';


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

// Helper: normalise from/to regardless of field name used by the API
const formFrom = (ride) => ride?.from || '—';
const formTo = (ride) => ride?.destination || ride?.to || '—';

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ emoji, message, actionLabel, actionHref }) {
  return (
    <Paper
      sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }}
      elevation={0}
    >
      <Typography fontSize="2rem">{emoji}</Typography>
      <Typography fontWeight={600} color="text.secondary" mt={1}>{message}</Typography>
      {actionLabel && (
        <Button variant="contained" sx={{ mt: 2 }} href={actionHref}>
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
      const payload = { ...form };
      const response = await axios.patch(`${Api}/rides/edit/${ride._id || ride.id}`, payload);
      // Merge updated data back; fall back to local form if API doesn't return updated doc
      const updated = response.data?.data ?? { ...ride, ...payload };
      onSave(updated);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update ride. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
        Edit Ride
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, mt: 1 }}>
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
          <Stack direction="row" spacing={2}>
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
              sx={{ color: 'primary.main' }}
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

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleEdit}
          variant="contained"
          disabled={saving}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
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
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {label}?
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
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
          <Typography fontSize="0.85rem" fontWeight={700}>
            {formFrom(ride)} → {formTo(ride)}
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary">{ride.date}</Typography>
        </Paper>
        {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Keep it
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
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
  const startDate = new Date(ride.startTime);
  const dateLabel = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const timeLabel = !isNaN(startDate)
    ? startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';

  const status = statusConfig[statusMap[ride?.status]];

  const Row = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, py: 0.5 }}>
      <Typography fontSize="1.1rem" lineHeight={1.4}>{icon}</Typography>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
        <Typography fontWeight={600} fontSize="0.92rem">{value}</Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        Ride Details
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography fontWeight={800} fontSize="1.05rem">{formFrom(ride)}</Typography>
            <ArrowForwardIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography fontWeight={800} fontSize="1.05rem">{formTo(ride)}</Typography>
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
            p: 2,
          }}
        >
          <Row icon="📅" label="Date" value={dateLabel} />
          <Row icon="🕐" label="Time" value={timeLabel} />
          <Row
            icon={travelIcons[ride.modeOfTravel] || '🚗'}
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
            <Typography fontSize="0.9rem">{ride.description}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {showEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(ride);
              onClose();
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
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
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Delete
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, showEdit, showDelete, onEdit, onDelete }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const status = statusConfig.confirmed;

  const startDate = new Date(ride.startTime);
  const date = !isNaN(startDate)
    ? startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const time = !isNaN(startDate)
    ? startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '—';

  return (
    <>
      <Box onClick={() => setDetailsOpen(true)} sx={{ cursor: 'pointer' }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid #E8EAF0",
            bgcolor: "#fff",
            transition: "0.2s",
            "&:hover": {
              boxShadow: 2,
            },
          }}
        >
          {/* Route */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: "#1F2937" }}
            >
              📍 {formFrom(ride)}
            </Typography>

            <ArrowForwardIcon color="primary" />

            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: "#1F2937" }}
            >
              📍 {formTo(ride)}
            </Typography>
          </Box>

          {/* Details */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              size="small"
              label={`📅 ${date}`}
              variant="outlined"
            />

            <Chip
              size="small"
              label={`🕐 ${time}`}
              variant="outlined"
            />

            {ride.modeOfTravel && (
              <Chip
                size="small"
                label={`${travelIcons[ride.modeOfTravel]} ${ride.modeOfTravel}`}
                color="primary"
                variant="outlined"
              />
            )}

            {ride.availableSeats != null && (
              <Chip
                size="small"
                label={`🪑 ${ride.availableSeats} Seats`}
                color="success"
                variant="outlined"
              />
            )}

            {ride.genderPreference && (
              <Chip
                size="small"
                label={`${genderIcons[ride.genderPreference]} ${ride.genderPreference}`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        </Paper>
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
        const response = await axios.get(`${Api}/rides/`);

        const all = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        console.log("All ===> ", all);

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

      <Box sx={{ maxWidth: 700 }}>
        <Typography variant="h5" fontWeight={800}>My Rides</Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            mb: 2.5,
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
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
              width: '70%',
              marginTop:'5rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={50} />
          </Box>

        ) : (
          <>
            {/* My Posts — edit + delete */}
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
            {/* My Posts — edit + delete */}
            {tab === 2 && (
              <Box>
                {mypost.length > 0
                  ? renderList(mypost, true, true)
                  : <EmptyState emoji="🚗" message="You haven't posted any rides yet"
                    actionLabel="Post your first ride" actionHref="/offer" />}
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

            {/* History — edit/delete only for rides that also exist in mypost or upcoming */}
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