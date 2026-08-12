import React from 'react';
import { Box, Stack, Typography, Avatar, AvatarGroup, Button, Chip } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { colors } from './theme';

const navItems = [
  { icon: HomeRoundedIcon, label: 'Home' },
  { icon: DirectionsCarFilledRoundedIcon, label: 'Rides' },
  { icon: ChatBubbleOutlineRoundedIcon, label: 'Messages' },
  { icon: PersonOutlineRoundedIcon, label: 'Profile' },
];

export default function PhoneMockup() {
  return (
    // Fixed pixel dimensions below are what give the mockup its crisp, deliberate
    // proportions — instead of recalculating every inner value per breakpoint, we
    // scale the whole unit down on narrow phones so it never overflows the viewport.
    <Box
      sx={{
        transform: { xs: 'scale(0.82)', sm: 'scale(0.92)', md: 'scale(1)' },
        transformOrigin: 'top center',
        mb: { xs: -9, sm: -5, md: 0 },
      }}
    >
      <Box
        sx={{
          width: 300,
          height: 610,
          bgcolor: '#111',
          borderRadius: '46px',
          p: '12px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        {/* notch */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 22,
            bgcolor: '#111',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            zIndex: 3,
          }}
        />
        <Box
          sx={{
            bgcolor: '#F7F9FC',
            width: '100%',
            height: '100%',
            borderRadius: '36px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* status bar */}
          <Box sx={{ px: 2.5, pt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.navy }}>0:41</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.navy }}>●●● ▲ 100%</Typography>
          </Box>

          {/* header */}
          <Box sx={{ px: 2.5, pt: 1.5 }}>
            <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 19, color: colors.navy }}>
              Saathi
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.2 }}>
              <Avatar sx={{ width: 26, height: 26, bgcolor: colors.orange, fontSize: 13 }}>A</Avatar>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: colors.navy, flexGrow: 1 }}>
                Hello, Arjun
              </Typography>
              <ChevronRightRoundedIcon sx={{ fontSize: 18, color: '#9AA7B4' }} />
            </Stack>
          </Box>

          {/* route card */}
          <Box
            sx={{
              mx: 2.5,
              mt: 2,
              p: 1.8,
              borderRadius: 3,
              bgcolor: colors.navy,
              color: '#fff',
            }}
          >
            <Stack spacing={0.6}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>📍 Dallas, TX</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>📍 Austin, TX</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: 11, opacity: 0.75 }}>May 25, 2024 &nbsp;•&nbsp; 2 Seats</Typography>
            </Stack>
            <Button
              size="small"
              sx={{
                mt: 1,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 11,
                px: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              View Details
            </Button>
          </Box>

          {/* ride requests */}
          <Box sx={{ px: 2.5, mt: 2.4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: colors.navy }}>Ride Requests</Typography>
              <ChevronRightRoundedIcon sx={{ fontSize: 18, color: '#9AA7B4' }} />
            </Stack>
            <Chip
              label="2 New Requests"
              size="small"
              sx={{ mt: 0.5, bgcolor: '#FDECE1', color: colors.orange, fontWeight: 700, fontSize: 10.5 }}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.4 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: 12 } }}>
                <Avatar sx={{ bgcolor: '#F6B78E' }}>R</Avatar>
                <Avatar sx={{ bgcolor: '#8EC6F6' }}>P</Avatar>
                <Avatar sx={{ bgcolor: '#B7E0A6' }}>S</Avatar>
              </AvatarGroup>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.6 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                sx={{ borderColor: '#D9E2EC', color: colors.navy, fontSize: 12, borderRadius: 2 }}
              >
                Review
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                sx={{ bgcolor: colors.navy, fontSize: 12, borderRadius: 2, '&:hover': { bgcolor: colors.navyDark } }}
              >
                Manage
              </Button>
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* bottom nav */}
          <Stack
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            sx={{ borderTop: '1px solid #E7ECF2', py: 1.2 }}
          >
            {navItems.map(({ icon: Icon, label }, i) => (
              <Stack key={label} alignItems="center" spacing={0.2}>
                <Icon sx={{ fontSize: 19, color: i === 0 ? colors.orange : '#9AA7B4' }} />
                <Typography sx={{ fontSize: 8.5, color: i === 0 ? colors.orange : '#9AA7B4' }}>{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}