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


import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Stack,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { rides as initialRides } from '../data/mockData';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
  pending: { label: 'Pending', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
  completed: { label: 'Completed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  cancelled: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
};

// ── Edit Modal ──────────────────────────────────────────────────────────────
function EditRideModal({ ride, onSave, onClose }) {
  const [form, setForm] = useState({
    from: ride.from,
    to: ride.to,
    date: ride.date,
    seats: ride.seats ?? '',
    price: ride.price ?? '',
    note: ride.note ?? '',
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
        Edit Ride
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2} mt={0.5}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="From" value={form.from} onChange={set('from')}
              fullWidth size="small" />
            <TextField label="To" value={form.to} onChange={set('to')}
              fullWidth size="small" />
          </Box>
          <TextField label="Date & Time" value={form.date} onChange={set('date')}
            fullWidth size="small" />
          {ride.seats !== undefined && (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <TextField label="Seats" value={form.seats} onChange={set('seats')}
                fullWidth size="small" type="number" inputProps={{ min: 1, max: 8 }} />
              <TextField label="Price" value={form.price} onChange={set('price')}
                fullWidth size="small" />
            </Box>
          )}
          {ride.note !== undefined && (
            <TextField label="Note" value={form.note} onChange={set('note')}
              fullWidth size="small" multiline rows={2} />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button onClick={() => onSave({ ...ride, ...form })} variant="contained"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ──────────────────────────────────────────────────
function DeleteConfirmDialog({ ride, onConfirm, onClose }) {
  const isPost = ride.role === 'offered' && (ride.status === 'pending' || ride.status === 'confirmed');
  const label = isPost ? 'Remove post' : 'Cancel ride';
  const body = isPost
    ? 'This will remove your ride post. Passengers who requested this ride will be notified.'
    : 'This will cancel your booking. The driver will be notified.';

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {label}?
        <IconButton onClick={onClose} size="small"
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" fontSize="0.9rem">{body}</Typography>
        <Paper sx={{ mt: 2, p: 1.5, bgcolor: '#FFF8F2', border: '1px solid #F0E6DC', borderRadius: 2 }} elevation={0}>
          <Typography fontSize="0.85rem" fontWeight={700}>
            {ride.from} → {ride.to}
          </Typography>
          <Typography fontSize="0.78rem" color="text.secondary">{ride.date}</Typography>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Keep it
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error"
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
          {label}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Ride Card ──────────────────────────────────────────────────────────────
function RideCard({ ride, showEdit, showDelete, onEdit, onDelete }) {
  const status = statusConfig[ride.status] || statusConfig.pending;

  return (
    <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid #F0E6DC' }} elevation={0}>
      {/* Top row: status + role chips, action buttons */}
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

        {/* Action buttons — only when applicable */}
        {(showEdit || showDelete) && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {showEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(ride)}
                sx={{
                  color: '#4361EE',
                  bgcolor: '#F0F4FF',
                  borderRadius: 1.5,
                  p: 0.6,
                  '&:hover': { bgcolor: '#E0E8FF' },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {showDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(ride)}
                sx={{
                  color: '#9B2226',
                  bgcolor: '#FFEBEE',
                  borderRadius: 1.5,
                  p: 0.6,
                  '&:hover': { bgcolor: '#FFCDD2' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Route */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography fontWeight={700} fontSize="0.9rem">{ride.from}</Typography>
        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography fontWeight={700} fontSize="0.9rem">{ride.to}</Typography>
      </Box>

      <Typography variant="caption" color="text.secondary">📅 {ride.date} {' '}</Typography>

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
      {ride.seats !== undefined && (
        <Typography variant="caption" color="text.secondary" display="block">
          🪑 {ride.seats} seats · {ride.price}
        </Typography>
      )}
      {ride.note && (
        <Typography variant="caption" color="text.secondary" display="block"
          sx={{ fontStyle: 'italic', mt: 0.25 }}>
          "{ride.note}"
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

const MyRides = () => {
  const [tab, setTab] = useState(0);
  const [rideList, setRideList] = useState(initialRides);
  const [editRide, setEditRide] = useState(null);   // ride being edited
  const [deleteRide, setDeleteRide] = useState(null); // ride being deleted
  const [toast, setToast] = useState('');

  const upcoming = rideList.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const history = rideList;
  const myPosts = rideList.filter(r => r.role === 'offered');
  const confirmedCount = upcoming.filter(r => r.status === 'confirmed').length;

  // Edit: merge updated fields back into list
  const handleSave = (updated) => {
    setRideList(list => list.map(r => r.id === updated.id ? updated : r));
    setEditRide(null);
    setToast('Ride updated successfully ✅');
  };

  // Delete: remove from list (or mark cancelled for passenger bookings)
  const handleDelete = () => {
    const r = deleteRide;
    if (r.role === 'offered') {
      // Driver removing their own post — remove entirely
      setRideList(list => list.filter(x => x.id !== r.id));
      setToast('Ride post removed 🗑️');
    } else {
      // Passenger cancelling booking — mark cancelled so it shows in history
      setRideList(list => list.map(x => x.id === r.id ? { ...x, status: 'cancelled' } : x));
      setToast('Booking cancelled ❌');
    }
    setDeleteRide(null);
  };

  // Rule: edit only offered rides; delete only upcoming (not history)
  const canEdit = (r) => r.role === 'offered' && (r.status === 'pending' || r.status === 'confirmed');
  const canDelete = (r) => r.status === 'pending' || r.status === 'confirmed';

  const renderList = (list) =>
    list.map(ride => (
      <RideCard
        key={ride.id}
        ride={ride}
        showEdit={canEdit(ride)}
        showDelete={canDelete(ride)}
        onEdit={setEditRide}
        onDelete={setDeleteRide}
      />
    ));

  return (
    <Box sx={{ maxWidth: 700, }}>
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
        <Tab label={`My Posts (${myPosts.length})`} />
        <Tab label={`Upcoming (${upcoming.length})`} />
        <Tab label={`History (${history.length})`} />

      </Tabs>

      {tab === 1 && (
        <Box>
          {upcoming.length > 0 ? (
            <>
              {confirmedCount > 0 && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                  You have {confirmedCount} confirmed upcoming{' '}
                  {confirmedCount === 1 ? 'ride' : 'rides'}. Safe travels! 🙏
                </Alert>
              )}
              {renderList(upcoming)}
            </>
          ) : (
            <EmptyState emoji="🗓️" message="No upcoming rides" actionLabel="Find a ride" actionHref="/find" />
          )}
        </Box>
      )}

      {tab === 2 && (
        <Box>
          {history.length > 0
            ? renderList(history)
            : <EmptyState emoji="🕰️" message="No past rides yet" />}
        </Box>
      )}

      {tab === 0 && (
        <Box>
          {myPosts.length > 0
            ? renderList(myPosts)
            : <EmptyState emoji="🚗" message="You haven't posted any rides yet"
              actionLabel="Post your first ride" actionHref="/offer" />}
        </Box>
      )}

      {/* ── Modals ── */}
      {editRide && <EditRideModal ride={editRide} onSave={handleSave} onClose={() => setEditRide(null)} />}
      {deleteRide && <DeleteConfirmDialog ride={deleteRide} onConfirm={handleDelete} onClose={() => setDeleteRide(null)} />}

      {/* ── Toast ── */}
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
}


export default MyRides
