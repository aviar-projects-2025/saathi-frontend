import React from 'react';
import {
  Box, Typography, Chip, Divider, List, ListItem, ListItemText,
  Paper, Stack
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import { useApp } from '../context/AppContext.jsx';
import UserAvatar from './UserAvatar.jsx';

export default function Sidebar() {
  const { user } = useApp();

  return (
    <Paper
      elevation={0}
      sx={{
        width: 240,
        minWidth: 240,
        border: '1px solid #F0E6DC',
        borderRadius: 3,
        p: 2.5,
        height: 'fit-content',
        position: 'sticky',
        top: 80,
      }}
    >
      {/* Profile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <UserAvatar name={user.name} initials={user.initials} size={64} verified={user.verified} sx={{ mb: 1 }} />
        <Typography fontWeight={700} fontSize="1rem">{user.name}</Typography>
        <Typography variant="caption" color="text.secondary">{user.city} · Verified member</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        {[
          { value: user.rides, label: 'Rides' },
          { value: user.rating, label: 'Rating' },
          { value: user.referred, label: 'Referred' },
        ].map(stat => (
          <Box key={stat.label} sx={{ textAlign: 'center' }}>
            <Typography fontWeight={800} fontSize="1.2rem" color="primary.main">{stat.value}</Typography>
            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* Verified badges */}
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <PhoneIcon sx={{ fontSize: 14, color: '#52B788' }} />
          <Typography variant="caption" color="secondary.main" fontWeight={600}>Phone verified</Typography>
        </Box>
        {user.referredBy && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{user.referredBy}</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {/* Ride types */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Ride Types
      </Typography>
      <List dense sx={{ py: 0.5 }}>
        {user.rideTypes.map(type => (
          <ListItem key={type} sx={{ py: 0.25, px: 0 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mr: 1.5, flexShrink: 0 }} />
            <ListItemText primary={type} primaryTypographyProps={{ variant: 'caption', fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* Cities */}
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        Cities
      </Typography>
      <Box sx={{ mt: 0.75 }}>
        {user.cities.map(city => (
          <Box key={city} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Box sx={{ color: '#E8650A', fontSize: '0.85rem' }}>📍</Box>
            <Typography variant="caption" fontWeight={500} sx={{ color: city === user.city ? 'primary.main' : 'text.secondary' }}>
              {city}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
