import React from 'react';
import { Box, Container, Typography, Button, Grid, Stack, Divider, Fade } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

// ──────────────────────────────────────────────
// Hero Section
// ──────────────────────────────────────────────
const HeroSection = ({ onSearchClick }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', sm: '90vh', md: '92vh' },
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(https://wallpaperaccess.com/full/185289.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(175deg, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.65) 100%)',
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '28%',
          background: 'linear-gradient(to top, rgba(251,251,251,1) 0%, transparent 100%)',
          zIndex: 2,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: 'relative', zIndex: 3, pt: { xs: 10, md: 12 }, pb: { xs: 10, md: 8 } }}
      >
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="center">
          {/* Left: headline + CTA */}
          <Grid item xs={12} md={7}>
            <Fade in timeout={900}>
              <Box>
                <Typography
                  variant="h1"
                  sx={{ color: '#FFFFFF', mb: 2.5, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
                >
                  Share rides,{' '}
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #FF9F1C 0%, #FF6B35 50%, #FFBF69 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'brightness(1.15)',
                    }}
                  >
                    Split costs,
                  </Box>{' '}
                  Explore together.
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.88)',
                    mb: 5,
                    fontWeight: 400,
                    maxWidth: 520,
                    textShadow: '0 1px 8px rgba(0,0,0,0.25)',
                    lineHeight: 1.65,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  India's most trusted travel companion platform. Connect with verified travelers,
                  share fuel costs, and make every journey memorable.
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ mb: { xs: 5, md: 6 } }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onSearchClick}
                    endIcon={<SearchIcon />}
                    sx={{
                      px: 4,
                      py: 1.7,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 50,
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    Find a Ride
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.7,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 50,
                      borderColor: 'rgba(255,255,255,0.6)',
                      color: '#FFFFFF',
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: '#FFFFFF',
                        bgcolor: 'rgba(255,255,255,0.12)',
                      },
                    }}
                  >
                    Offer a Ride
                  </Button>
                </Stack>

                {/* Stats row */}
                <Stack
                  direction="row"
                  spacing={{ xs: 2.5, sm: 4 }}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  {[
                    { value: '50K+', label: 'Happy Travelers' },
                    { value: '15K+', label: 'Trips Completed' },
                    { value: '4.9★', label: 'Community Rating' },
                  ].map((stat, i) => (
                    <React.Fragment key={stat.label}>
                      {i > 0 && (
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.28)',
                            display: { xs: 'none', sm: 'block' },
                          }}
                        />
                      )}
                      <Box sx={{ minWidth: 70 }}>
                        <Typography
                          variant="h4"
                          sx={{ color: '#FFFFFF', fontWeight: 800, lineHeight: 1.1 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </React.Fragment>
                  ))}
                </Stack>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;