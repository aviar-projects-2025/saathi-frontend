import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Chip, Button, Stack,
  Avatar, Divider, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
// import { myRides } from '../data/mockData';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#2D6A4F', bg: '#E8F5E9', icon: '✅' },
  pending: { label: 'Pending', color: '#E8650A', bg: '#FFF3E0', icon: '⏳' },
  completed: { label: 'Completed', color: '#555577', bg: '#F5F5F5', icon: '🏁' },
  cancelled: { label: 'Cancelled', color: '#9B2226', bg: '#FFEBEE', icon: '❌' },
};

function RideHistoryCard({ ride }) {
  const status = statusConfig[ride.status] || statusConfig.pending;
  return (
    <Paper sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid #F0E6DC' }} elevation={0}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography fontWeight={700} fontSize="0.9rem">{ride.from}</Typography>
        <ArrowForwardIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography fontWeight={700} fontSize="0.9rem">{ride.to}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">📅 {ride.date}</Typography>
      {(ride.passenger || ride.driver) && (
        <Typography variant="caption" color="text.secondary" display="block">
          {ride.passenger ? `Passenger: ${ride.passenger}` : `Driver: ${ride.driver}`}
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
        <Tab label="Upcoming" />
        <Tab label="History" />
        <Tab label="My Posts" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            You have 1 confirmed upcoming ride. Safe travels! 🙏
          </Alert>
          {/* {myRides?.filter(r => r.status === 'confirmed').map(ride => (
            <RideHistoryCard key={ride.id} ride={ride} />
          ))} */}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {/* {myRides.filter(r => r.status === 'completed').map(ride => (
            <RideHistoryCard key={ride.id} ride={ride} />
          ))}
          {myRides.filter(r => r.status === 'completed').length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }} elevation={0}>
              <Typography fontSize="2rem">🕰️</Typography>
              <Typography fontWeight={600} color="text.secondary" mt={1}>No past rides yet</Typography>
            </Paper>
          )}
          {myRides.filter(r => r.status !== 'confirmed').map(ride => (
            <RideHistoryCard key={ride.id} ride={ride} />
          ))} */}
        </Box>
      )}

      {tab === 2 && (
        <>
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }} elevation={0}>
            <Typography fontSize="2rem">🚗</Typography>
            <Typography fontWeight={600} color="text.secondary" mt={1}>You haven't posted any rides yet</Typography>
            <Button variant="contained" sx={{ mt: 2 }} href="/offer">Post your first ride</Button>
          </Paper>
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2', borderRadius: 2 }} elevation={0}>
            <Typography fontSize="2rem">🚗</Typography>
            <Typography fontWeight={600} color="text.secondary" mt={1}>You haven't posted any rides yet</Typography>
            <Button variant="contained" sx={{ mt: 2 }} href="/offer">Post your first ride</Button>
          </Paper>
          
        </>

      )}
    </Box>
  );
}


export default MyRides
