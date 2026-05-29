import React from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Stack,
  Button, Select, MenuItem, FormControl, Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import SortIcon from '@mui/icons-material/Sort';
import { useApp } from '../context/AppContext.jsx';
import { filterCategories } from '../data/mockData.jsx';
import RideCard from '../components/RideCard.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function FindRide() {
  const { rides, activeFilter, setActiveFilter, searchQuery, setSearchQuery } = useApp();

  return (
    <Box sx={{ display: 'flex', gap: 3, maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Sidebar */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Sidebar />
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.25 }}>
            Community <span style={{ color: '#E8650A' }}>rides</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {rides.length} rides · Dallas area
          </Typography>
        </Box>

        {/* Search & sort */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by city, airport, or community member..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: '#fff', borderRadius: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <LocationOnIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>Dallas, TX</Typography>
          </Box>
          <Button
            startIcon={<MapIcon />}
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Map
          </Button>
          <Button
            startIcon={<SortIcon />}
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Sort
          </Button>
        </Box>

        {/* Filter chips */}
        <Stack direction="row" spacing={0.75} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
          {filterCategories.map(cat => (
            <Chip
              key={cat.value}
              label={`${cat.icon} ${cat.label}`}
              onClick={() => setActiveFilter(cat.value)}
              variant={activeFilter === cat.value ? 'filled' : 'outlined'}
              sx={{
                flexShrink: 0,
                fontWeight: activeFilter === cat.value ? 700 : 500,
                bgcolor: activeFilter === cat.value ? 'primary.main' : 'transparent',
                color: activeFilter === cat.value ? '#fff' : 'text.secondary',
                borderColor: activeFilter === cat.value ? 'primary.main' : '#E0D5CC',
                '&:hover': { bgcolor: activeFilter === cat.value ? 'primary.dark' : '#FFF8F2' },
              }}
            />
          ))}
        </Stack>

        {/* Ride list */}
        {rides.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed #E0D5CC', bgcolor: '#FFF8F2' }}>
            <Typography fontSize="2rem" mb={1}>🙏</Typography>
            <Typography fontWeight={600} color="text.secondary">No rides found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your filters or search query</Typography>
          </Paper>
        ) : (
          rides.map(ride => <RideCard key={ride.id} ride={ride} />)
        )}
      </Box>
    </Box>
  );
}
