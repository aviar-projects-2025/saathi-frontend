// import React, { useState } from 'react';
// import {
//   Box, Typography, Tabs, Tab, Paper, Chip, Button, Stack,
//   Avatar, Divider, Alert
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import PendingIcon from '@mui/icons-material/Pending';
// import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import StarIcon from '@mui/icons-material/Star';
// import { rides, currentUser } from '../data/mockData';

// const statusConfig = {
//   confirmed: { label: 'Confirmed', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
//   pending: { label: 'Pending', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
//   completed: { label: 'Completed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
//   cancelled: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
// };

// const RideHistoryCard = ({ ride }) => {
//   const status = statusConfig[ride.status] || statusConfig.pending;
//   return (
//     <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid #F0E6DC' }} elevation={0}>
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//         <Chip
//           label={`${status.icon} ${status.label}`}
//           size="small"
//           sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: '0.72rem' }}
//         />
//         <Chip
//           label={ride.role === 'offered' ? '🚗 Driver' : '🧑‍💼 Passenger'}
//           size="small"
//           sx={{ bgcolor: '#F0F4FF', color: '#4361EE', fontSize: '0.72rem' }}
//         />
//       </Box>
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
//         <Typography fontWeight={700} fontSize="0.9rem">{ride.from}</Typography>
//         <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
//         <Typography fontWeight={700} fontSize="0.9rem">{ride.to}</Typography>
//       </Box>
//       <Typography variant="caption" color="text.secondary">📅 {ride.date}</Typography>
//       {(ride.passenger || ride.driver) && (
//         <Typography variant="caption" color="text.secondary" display="block">
//           {ride.passenger ? `Passenger: ${ride.passenger}` : `Driver: ${ride.driver}`}
//         </Typography>
//       )}
//       {ride.status === 'completed' && (
//         <Box sx={{ mt: 1.5 }}>
//           <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ fontSize: '0.75rem' }}>
//             Leave a review
//           </Button>
//         </Box>
//       )}
//     </Paper>
//   );
// }

// export default function MyRides() {
//   const [tab, setTab] = useState(0);

//   return (
//     <Box sx={{ maxWidth: 700, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
//       <Typography variant="h5" fontWeight={800} mb={2.5}>My Rides</Typography>

//       <Tabs
//         value={tab}
//         onChange={(_, v) => setTab(v)}
//         sx={{
//           mb: 2.5,
//           '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
//           '& .Mui-selected': { color: 'primary.main' },
//           '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
//         }}
//       >
//         <Tab label="Upcoming" />
//         <Tab label="History" />
//         <Tab label="My Posts" />
//       </Tabs>

//       {tab === 0 && (
//         <Box>
//           <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
//             You have 1 confirmed upcoming ride. Safe travels! 🙏
//           </Alert>
//           {rides.filter(r => r.status === 'confirmed').map(ride => (
//             <RideHistoryCard key={ride.id} ride={ride} />
//           ))}
//         </Box>
//       )}

//       {tab === 1 && (
//         <Box>
//           {rides.filter(r => r.status === 'completed').map(ride => (
//             <RideHistoryCard key={ride.id} ride={ride} />
//           ))}
//           {rides.filter(r => r.status === 'completed').length === 0 && (
//             <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }} elevation={0}>
//               <Typography fontSize="2rem">🕰️</Typography>
//               <Typography fontWeight={600} color="text.secondary" mt={1}>No past rides yet</Typography>
//             </Paper>
//           )}
//           {rides.filter(r => r.status !== 'confirmed').map(ride => (
//             <RideHistoryCard key={ride.id} ride={ride} />
//           ))}
//         </Box>
//       )}

//       {tab === 2 && (
//         <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }} elevation={0}>
//           <Typography fontSize="2rem">🚗</Typography>
//           <Typography fontWeight={600} color="text.secondary" mt={1}>You haven't posted any rides yet</Typography>
//           <Button variant="contained" sx={{ mt: 2 }} href="/offer">Post your first ride</Button>
//         </Paper>
//       )}
//     </Box>
//   );
// }



import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Stack, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import Api from '../Api';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
  pending: { label: 'Pending', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
  completed: { label: 'Completed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  cancelled: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
};

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
// Maps your existing PostRide form fields to the edit modal.
// Fields: from, destination, date, time, modeOfTravel, description,
//         availableSeats, genderPreference, fuelSharing
function EditRideModal({ ride, onSave, onClose }) {
  const [form, setForm] = useState({
    from: ride.from ?? '',
    destination: ride.destination ?? ride.to ?? '',
    date: ride.date ?? '',
    time: ride.time ?? '',
    modeOfTravel: ride.modeOfTravel ?? '',
    description: ride.description ?? '',
    availableSeats: ride.availableSeats ?? ride.seats ?? 1,
    genderPreference: ride.genderPreference ?? 'Any',
    fuelSharing: ride.fuelSharing ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      const response = await axios.patch(`${Api}/rides/${ride._id || ride.id}`, payload);
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

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} mt={0.5}>

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
          onClick={handleSave}
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
            {form_from(ride)} → {form_to(ride)}
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

// Helper: normalise from/to regardless of field name used by the API
const form_from = (ride) => ride.from || '—';
const form_to = (ride) => ride.destination || ride.to || '—';

// ── Ride Card ────────────────────────────────────────────────────────────────
function RideCard({ ride, showEdit, showDelete, onEdit, onDelete }) {
  const status = statusConfig[ride.status] || statusConfig.pending;

  return (
    <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid #F0E6DC' }} elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Chip
            label={`${status.icon} ${status.label}`}
            size="small"
            sx={{ bgcolor: status.bg, color: status.color, fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Chip
            label={ride.role === 'offered' ? '🚗 Driver' : '🧑‍💼 Passenger'}
            size="small"
            sx={{ bgcolor: '#F0F4FF', color: '#4361EE', fontSize: '0.72rem' }}
          />
        </Box>

        {(showEdit || showDelete) && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {showEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(ride)}
                sx={{ color: '#4361EE', bgcolor: '#F0F4FF', borderRadius: 1.5, p: 0.6, '&:hover': { bgcolor: '#E0E8FF' } }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {showDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(ride)}
                sx={{ color: '#9B2226', bgcolor: '#FFEBEE', borderRadius: 1.5, p: 0.6, '&:hover': { bgcolor: '#FFCDD2' } }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography fontWeight={700} fontSize="0.9rem">{form_from(ride)}</Typography>
        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography fontWeight={700} fontSize="0.9rem">{form_to(ride)}</Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">📅 {ride.date}</Typography>

      {ride.time && (
        <Typography variant="caption" color="text.secondary" display="block">
          🕐 {ride.time}
        </Typography>
      )}
      {ride.modeOfTravel && (
        <Typography variant="caption" color="text.secondary" display="block">
          🚘 {ride.modeOfTravel}
        </Typography>
      )}
      {ride.passenger && (
        <Typography variant="caption" color="text.secondary" display="block">
          Passenger: {ride.passenger}
        </Typography>
      )}
      {ride.driver && (
        <Typography variant="caption" color="text.secondary" display="block">
          Driver: {ride.driver}
        </Typography>
      )}
      {(ride.availableSeats ?? ride.seats) !== undefined && (
        <Typography variant="caption" color="text.secondary" display="block">
          🪑 {ride.availableSeats ?? ride.seats} seats
        </Typography>
      )}
      {ride.genderPreference && ride.genderPreference !== 'Any' && (
        <Typography variant="caption" color="text.secondary" display="block">
          👤 {ride.genderPreference} only
        </Typography>
      )}
      {ride.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ fontStyle: 'italic', mt: 0.25 }}
        >
          "{ride.description}"
        </Typography>
      )}

      {ride.status === 'completed' && (
        <Box sx={{ mt: 1.5 }}>
          <Button size="small" variant="outlined" startIcon={<StarIcon />} sx={{ fontSize: '0.75rem' }}>
            Leave a review
          </Button>
        </Box>
      )}
    </Paper>
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
  const [toast, setToast] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  // ── Fetch all rides ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get(`${Api}/rides/`);
        const all = response.data.data || [];

        setMypost(all.filter(item => item.createdBy === user.id));
        setUpcoming(all.filter(item => item.createdBy === user.id));
        setHistory(all);
      } catch (error) {
        console.error('Error fetching rides:', error.message);
      }
    };
    fetchRides();
  }, []);

  // ── Edit: update the ride in all three lists ───────────────────────────────
  const handleSave = (updated) => {
    const id = updated._id || updated.id;
    const merge = (list) => list.map(r => (r._id || r.id) === id ? updated : r);

    setMypost(merge);
    setUpcoming(merge);
    setHistory(merge);
    setEditRide(null);
    setToast('Ride updated successfully ✅');
  };

  // ── Delete: remove from all three lists (called after API success) ─────────
  const handleDelete = (deleted) => {
    const id = deleted._id || deleted.id;
    const remove = (list) => list.filter(r => (r._id || r.id) !== id);

    setMypost(remove);
    setUpcoming(remove);
    setHistory(remove);
    setDeleteRide(null);
    setToast('Ride removed 🗑️');
  };

  // Show edit/delete for any ride the user posted (mypost list).
  // Falls back gracefully if status or role field is missing from the API.
  const canEdit = (r) => r.status !== 'completed' && r.status !== 'cancelled';
  const canDelete = (r) => r.status !== 'completed' && r.status !== 'cancelled';

  const renderList = (list, showEdit = false, showDelete = false) =>
    list.map(ride => (
      <RideCard
        key={ride._id || ride.id}
        ride={ride}
        showEdit={showEdit && canEdit(ride)}
        showDelete={showDelete && canDelete(ride)}
        onEdit={setEditRide}
        onDelete={setDeleteRide}
      />
    ));

  return (
    <Box sx={{ maxWidth: 700 }}>
      <Typography variant="h5" fontWeight={800} mb={2.5}>My Rides</Typography>

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
        <Tab label={`My Posts (${mypost.length})`} />
        <Tab label={`Upcoming (${upcoming.length})`} />
        <Tab label={`History (${history.length})`} />
      </Tabs>

      {/* My Posts — edit + delete */}
      {tab === 0 && (
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
      {tab === 2 && (
        <Box>
          {history.length > 0
            ? history.map(ride => {
              const id = ride._id || ride.id;
              const isOwned = [...mypost, ...upcoming].some(r => (r._id || r.id) === id);
              return (
                <RideCard
                  key={id}
                  ride={ride}
                  showEdit={isOwned && canEdit(ride)}
                  showDelete={isOwned && canDelete(ride)}
                  onEdit={setEditRide}
                  onDelete={setDeleteRide}
                />
              );
            })
            : <EmptyState emoji="🕰️" message="No past rides yet" />}
        </Box>
      )}

      {/* Edit Modal — pre-filled with all fields from clicked ride */}
      {editRide && (
        <EditRideModal
          ride={editRide}
          onSave={handleSave}
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

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { borderRadius: 2, fontWeight: 600 } }}
      />
    </Box>
  );
};

export default MyRides;