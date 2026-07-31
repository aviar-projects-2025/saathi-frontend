import React from 'react';
import { Box, Grid, Paper, Typography, Fade } from '@mui/material';
import {
  VerifiedUser as VerifiedUserIcon,
  CreditCard as CreditCardIcon,
  Map as MapIcon,
  SupportAgent as SupportAgentIcon,
} from '@mui/icons-material';

// ──────────────────────────────────────────────
// Safety & Trust Section
// ──────────────────────────────────────────────
const safetyFeatures = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 44 }} />,
    title: 'ID Verified Drivers',
    description:
      'Every driver undergoes government ID verification and background checks before being listed.',
    color: '#f36f03',
    bgcolor: '#f36f03',
  },
  {
    icon: <CreditCardIcon sx={{ fontSize: 44 }} />,
    title: 'Secure Transactions',
    description:
      'All payments are processed through encrypted channels. Your financial data is always protected.',
    color: '#0cebeb',
    bgcolor: '#0cebeb',
  },
  {
    icon: <MapIcon sx={{ fontSize: 44 }} />,
    title: 'Live Trip Tracking',
    description:
      'Share your live location with trusted contacts. Real-time GPS tracking for complete peace of mind.',
    color: '#67e910',
    bgcolor: '#67e910',
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 44 }} />,
    title: '24/7 Emergency Support',
    description:
      'Our dedicated support team is available around the clock to assist you with any concerns.',
    color: '#f70d0d',
    bgcolor: '#f70d0d',
  },
];

const SafetySection = () => (
  <Box sx={{ bgcolor: '#fff' }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h2" fontWeight={800}>
        Travel with complete confidence
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(10, 10, 10, 0.72)', lineHeight: 2, m: 4, fontWeight: 700 }}
      >
        We've built industry-leading safety features so you can focus on enjoying the journey.
      </Typography>
    </Box>

    <Grid
      container
      spacing={{ xs: 7, md: 3 }}
      sx={{ display: 'flex', justifyContent: 'space-evenly' }}
    >
      {safetyFeatures.map((step, index) => (
        <Grid item xs={12} sm={6} md={4} key={step.title}>
          <Fade in timeout={500 + index * 200}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                minHeight: 360,
                p: 1,
                borderRadius: 2,
                border: '1px solid',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .35s ease',
                borderColor: step.color,
                color: step.color,
                bgcolor: '#fff',

                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 45px rgba(0,0,0,.08)',
                  color: '#fff',
                  bgcolor: step.bgcolor,
                },
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 82,
                  height: 82,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 7,
                }}
              >
                {step.icon}
              </Box>

              {/* Title */}
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {step.title}
              </Typography>

              {/* Description */}
              <Typography
                color="text.secondary"
                sx={{
                  lineHeight: 1.8,
                  maxWidth: 270,
                }}
              >
                {step.description}
              </Typography>
            </Paper>
          </Fade>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default SafetySection;