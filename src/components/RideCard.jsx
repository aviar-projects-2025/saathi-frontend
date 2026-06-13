import React, { useState } from 'react';
import {
  Card, CardContent, Box, Typography, Avatar, Chip, Button, Divider,
  IconButton, Collapse, Stack,
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TempleHinduIcon from '@mui/icons-material/TempleHindu';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useApp } from '../context/Roles.jsx';

const typeConfig = {
  airport: { icon: <FlightTakeoffIcon />, color: '#1A3C5E', label: 'Airport' },
  intercity: { icon: <DirectionsCarIcon />, color: '#E85D26', label: 'Intercity' },
  temple: { icon: <TempleHinduIcon />, color: '#7B5EA7', label: 'Temple' },
  local: { icon: <PeopleIcon />, color: '#2E7D52', label: 'Local' },
};

export default function RideCard({ ride }) {
  const [expanded, setExpanded] = useState(false);
  const { showSnackbar } = useApp();
  const config = typeConfig[ride.type] || typeConfig.local;
  const isRequest = ride.mode === 'requesting';

  return (
    <Card sx={{ mb: 2, border: isRequest ? '1.5px dashed #E85D26' : '1.5px solid transparent', overflow: 'visible' }}>
      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Avatar
            sx={{ bgcolor: config.color, width: 44, height: 44, fontSize: '0.85rem', fontWeight: 700 }}
          >
            {ride.driver.avatar}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {ride.driver.name}
              </Typography>
              <VerifiedIcon sx={{ fontSize: 14, color: '#2E7D52' }} />
              <Chip
                label={`${ride.driver.trustScore}% trust`}
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#2E7D52', height: 18, fontSize: '0.68rem' }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Referred by {ride.driver.referredBy}
            </Typography>
          </Box>
          <Chip
            icon={config.icon}
            label={isRequest ? 'Request' : config.label}
            size="small"
            sx={{
              bgcolor: isRequest ? '#FFF3EC' : `${config.color}18`,
              color: isRequest ? '#E85D26' : config.color,
              border: isRequest ? '1px solid #E85D26' : 'none',
              fontWeight: 700,
              '& .MuiChip-icon': { fontSize: 14 },
            }}
          />
        </Box>

        {/* Route */}
        <Box mt={1.5} display="flex" alignItems="center" gap={1}>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">FROM</Typography>
            <Typography variant="body1" fontWeight={700} fontSize="0.92rem">{ride.from}</Typography>
          </Box>
          <Box sx={{ color: 'text.secondary', fontSize: 18 }}>→</Box>
          <Box flex={1} textAlign="right">
            <Typography variant="body2" color="text.secondary" fontSize="0.75rem">TO</Typography>
            <Typography variant="body1" fontWeight={700} fontSize="0.92rem">{ride.to}</Typography>
          </Box>
        </Box>

        {/* Meta */}
        <Stack direction="row" spacing={2} mt={1.5}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{ride.date} · {ride.time}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <EventSeatIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">{ride.seats} seats</Typography>
          </Box>
          <Typography variant="caption" fontWeight={700} color="primary" sx={{ ml: 'auto !important' }}>
            {ride.priceLabel}
          </Typography>
        </Stack>

        {/* Tags */}
        {ride.tags?.length > 0 && (
          <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
            {ride.tags.map(tag => (
              <Chip key={tag} label={`#${tag}`} size="small"
                sx={{ bgcolor: '#F5F5F5', fontSize: '0.68rem', height: 20 }} />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <Button
            variant="contained"
            size="small"
            onClick={() => showSnackbar(isRequest ? '🙏 Offer sent to ' + ride.driver.name : '✅ Ride request sent to ' + ride.driver.name)}
          >
            {isRequest ? 'Offer Help' : 'Request Seat'}
          </Button>
        </Box>

        <Collapse in={expanded}>
          <Box mt={1.5} p={1.5} bgcolor="#FFF8F5" borderRadius={2}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>NOTE</Typography>
            <Typography variant="body2" mt={0.3}>{ride.note}</Typography>
            <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
              {ride.driver.languages.map(lang => (
                <Chip key={lang} label={lang} size="small"
                  sx={{ bgcolor: '#EDE7F6', color: '#5E35B1', fontSize: '0.7rem', height: 20 }} />
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
