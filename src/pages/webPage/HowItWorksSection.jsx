import React from 'react';
import { Box, Container, Typography, Grid, Paper, Fade } from '@mui/material';
import {
  Search as SearchIcon,
  VerifiedUser as VerifiedUserIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// ──────────────────────────────────────────────
// How It Works Section
// ──────────────────────────────────────────────
const steps = [
  {
    icon: <SearchIcon sx={{ fontSize: 36 }} />,
    title: 'Find Your Ride',
    description:
      'Search thousands of rides to your destination. Filter by date, seats, and preferences.',
    color: '#FF6B35',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 36 }} />,
    title: 'Verify & Book',
    description:
      'Check driver profiles, reviews, and ratings. Book your seat securely in seconds.',
    color: '#1B4332',
  },
  {
    icon: <GroupIcon sx={{ fontSize: 36 }} />,
    title: 'Travel Together',
    description:
      'Meet at the pickup point, share the journey, split costs, and make new friends.',
    color: '#457B9D',
  },
];

const HowItWorksSection = () => (
  <Box
    sx={{
      py: { xs: 12, md: 12 },
      bgcolor: 'background.paper',
    }}
  >
    <Container maxWidth="lg">
      {/* Heading */}
      <Box sx={{ textAlign: 'center' }} mb={{ xs: 6, md: 8 }}>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            fontSize: {
              xs: '2rem',
              sm: '2.5rem',
              md: '3rem',
            },
          }}
        >
          Travel in 3 easy steps
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            textAlign: 'center',
            lineHeight: 1.8,
            fontSize: {
              xs: '1rem',
              md: '1.15rem',
            },
            m: 2.5,
          }}
        >
          Getting started with Saathi is simple. Find, book, and travel —
          all in one place.
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={7} sx={{ display: 'flex', justifyContent: 'space-around' }}>
        {steps.map((step, index) => (
          <Grid item xs={12} sm={6} md={4} key={step.title}>
            <Fade in timeout={500 + index * 200}>
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  minHeight: 360,
                  p: 1.3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .35s ease',
                  bgcolor: '#fff',

                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 45px rgba(0,0,0,.08)',
                    borderColor: step.color,
                  },
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: `${step.color}15`,
                    color: step.color,
                    border: `2px solid ${step.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    mb: 3,
                  }}
                >
                  {index + 1}
                </Box>

                {/* Icon */}
                <Box
                  sx={{
                    width: 82,
                    height: 82,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    mb: 3,
                    boxShadow: `0 10px 30px ${step.color}40`,
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
    </Container>
  </Box>
);

export default HowItWorksSection;