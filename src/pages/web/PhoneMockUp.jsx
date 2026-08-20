import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  AvatarGroup,
  Button,
  Chip,
} from '@mui/material';

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
    <Box
      sx={{
        transform: {
          xs: 'scale(0.82)',
          sm: 'scale(0.92)',
          md: 'scale(1)',
        },
        transformOrigin: 'top center',
        mb: { xs: -9, sm: -5, md: 0 },
      }}
    >
      <Box
        sx={{
          width: 265,
          height: 525,
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
          <Box
            sx={{
              px: 2,
              pt: 1.2,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              sx={{
                fontSize: 9,
                fontWeight: 600,
                color: colors.navy,
              }}
            >
              0:41
            </Typography>

            <Typography
              sx={{
                fontSize: 8.5,
                fontWeight: 600,
                color: colors.navy,
              }}
            >
              ●●● ▲ 100%
            </Typography>
          </Box>

          {/* header */}
          <Box sx={{ px: 2, pt: 1.2 }}>
            <Typography
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: colors.navy,
              }}
            >
              Saathi
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{ mt: 0.8 }}
            >
              <Avatar
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: colors.orange,
                  fontSize: 10,
                }}
              >
                A
              </Avatar>

              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: colors.navy,
                  flexGrow: 1,
                }}
              >
                Hello, Arjun
              </Typography>

              <ChevronRightRoundedIcon
                sx={{
                  fontSize: 15,
                  color: '#9AA7B4',
                }}
              />
            </Stack>
          </Box>

          {/* route card */}
          <Box
            sx={{
              mx: 2,
              mt: 1.5,
              p: 1.4,
              borderRadius: 2.5,
              bgcolor: colors.navy,
              color: '#fff',
            }}
          >
            <Stack spacing={0.4}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                📍 Dallas, TX
              </Typography>

              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                📍 Austin, TX
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 0.7 }}
            >
              <Typography
                sx={{
                  fontSize: 9,
                  opacity: 0.75,
                }}
              >
                May 25, 2024 &nbsp;•&nbsp; 2 Seats
              </Typography>
            </Stack>

            <Button
              size="small"
              sx={{
                mt: 0.7,
                minHeight: 25,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 9.5,
                px: 1.2,
                py: 0.3,
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              View Details
            </Button>
          </Box>

          {/* ride requests */}
          <Box sx={{ px: 2, mt: 1.8 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: colors.navy,
                }}
              >
                Ride Requests
              </Typography>

              <ChevronRightRoundedIcon
                sx={{
                  fontSize: 15,
                  color: '#9AA7B4',
                }}
              />
            </Stack>

            <Chip
              label="2 New Requests"
              size="small"
              sx={{
                mt: 0.4,
                height: 20,
                bgcolor: '#FDECE1',
                color: colors.orange,
                fontWeight: 700,
                fontSize: 8.5,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{ mt: 1 }}
            >
              <AvatarGroup
                max={4}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 25,
                    height: 25,
                    fontSize: 10,
                  },
                }}
              >
                <Avatar sx={{ bgcolor: '#F6B78E' }}>R</Avatar>
                <Avatar sx={{ bgcolor: '#8EC6F6' }}>P</Avatar>
                <Avatar sx={{ bgcolor: '#B7E0A6' }}>S</Avatar>
              </AvatarGroup>
            </Stack>

            <Stack
              direction="row"
              spacing={0.8}
              sx={{ mt: 1.2 }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  minHeight: 28,
                  borderColor: '#D9E2EC',
                  color: colors.navy,
                  fontSize: 9.5,
                  py: 0.3,
                  borderRadius: 1.5,
                  textTransform: 'none',
                }}
              >
                Review
              </Button>

              <Button
                fullWidth
                variant="contained"
                size="small"
                sx={{
                  minHeight: 28,
                  bgcolor: colors.navy,
                  fontSize: 9.5,
                  py: 0.3,
                  borderRadius: 1.5,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: colors.navyDark,
                  },
                }}
              >
                Manage
              </Button>
            </Stack>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* bottom nav */}
          <Stack
            direction="row"
            sx={{
              borderTop: '1px solid #E7ECF2',
              py: 0.8,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            {navItems.map(({ icon: Icon, label }, i) => (
              <Stack
                key={label}
                alignItems="center"
                spacing={0.1}
              >
                <Icon
                  sx={{
                    fontSize: 16,
                    color:
                      i === 0
                        ? colors.orange
                        : '#9AA7B4',
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 7,
                    lineHeight: 1.1,
                    color:
                      i === 0
                        ? colors.orange
                        : '#9AA7B4',
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}