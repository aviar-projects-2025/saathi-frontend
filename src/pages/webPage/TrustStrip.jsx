import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  Shield as ShieldIcon,
  HeadsetMic as HeadsetMicIcon,
  Public as PublicIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

// ──────────────────────────────────────────────
// Trust Badges Strip
// ──────────────────────────────────────────────
const trustItems = [
  { icon: <VerifiedUserIcon fontSize="small" />, text: 'Verified Drivers' },
  { icon: <ShieldIcon fontSize="small" />, text: 'Secure Payments' },
  { icon: <HeadsetMicIcon fontSize="small" />, text: '24/7 Support' },
  { icon: <PublicIcon fontSize="small" />, text: '100+ Destinations' },
  { icon: <TrophyIcon fontSize="small" />, text: '#1 Travel Platform' },
];

const TrustStrip = () => (
  <Box
    sx={{
      bgcolor: '#F7F5F2',
      py: { xs: 2.5, md: 2 },
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }}
  >
    <Container maxWidth="lg" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee 20s linear infinite',
          '@keyframes marquee': {
            '0%': {
              transform: 'translateX(0)',
            },
            '100%': {
              transform: 'translateX(-50%)',
            },
          },
          '&:hover': {
            animationPlayState: 'paused',
          },
        }}
      >
        {[...trustItems, ...trustItems].map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              mx: { xs: 2.5, md: 4 },
            }}
          >
            <Box
              sx={{
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.icon}
            </Box>

            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

export default TrustStrip;