import React from 'react';
import { Box, Container, Typography, Grid, Card, Stack, Chip, Grow } from '@mui/material';
import { DirectionsCar as CarIcon, Star as StarIcon } from '@mui/icons-material';

// ──────────────────────────────────────────────
// Featured Destinations Section
// ──────────────────────────────────────────────
const destinations = [
  {
    city: 'Goa',
    state: 'Coastal Paradise',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974&auto=format&fit=crop',
    trips: 245,
    rating: 4.8,
    price: '₹1,200',
  },
  {
    city: 'Manali',
    state: 'Himachal Pradesh',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070&auto=format&fit=crop',
    trips: 189,
    rating: 4.9,
    price: '₹2,500',
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    image:
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2070&auto=format&fit=crop',
    trips: 312,
    rating: 4.7,
    price: '₹1,800',
  },
  {
    city: 'Kerala',
    state: "God's Own Country",
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2070&auto=format&fit=crop',
    trips: 178,
    rating: 4.9,
    price: '₹3,000',
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    image:
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop',
    trips: 156,
    rating: 4.6,
    price: '₹1,500',
  },
  {
    city: 'Thiruvannamalai',
    state: 'Tamil Nadu',
    image:
      'https://plus.unsplash.com/premium_photo-1697729536647-4e23a32dd324?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVtcGxlfGVufDB8fDB8fHww',
    trips: 134,
    rating: 4.8,
    price: '₹1,600',
  },
];

const DestinationsSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }} mb={7}>
          <Typography variant="h2" fontWeight={800} mb={2}>
            Find the Perfect Travel Companion
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              m: 4,
              fontSize: '1.1rem',
            }}
          >
            Find the perfect travel companion for your next adventure. Connect
            with trusted people heading the same way, share the journey,
            split travel costs, and create unforgettable memories together.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {destinations.map((dest, index) => (
            <Grid
              key={dest.city}
              size={{ xs: 12, sm: 6, md: 4 }} // MUI v7
            >
              <Grow in timeout={400 + index * 100}>
                <Card
                  sx={{
                    position: 'relative',
                    height: { xs: 250, sm: 280, md: 300 },
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all .35s ease',
                    boxShadow: 3,

                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 10,
                    },

                    '&:hover .dest-image': {
                      transform: 'scale(1.05)',
                    },

                    '&:hover .dest-overlay': {
                      background:
                        'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.20) 55%, rgba(0,0,0,.05) 100%)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    className="dest-image"
                    src={dest.image}
                    alt={dest.city}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src =
                        'https://placehold.co/600x400?text=Destination';
                    }}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform .6s ease',
                    }}
                  />

                  <Box
                    className="dest-overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.15) 48%, rgba(0,0,0,0) 100%)',
                      transition: 'background .5s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 2.5,
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mb={0.5}
                      sx={{ color: '#fff' }}
                    >
                      {dest.city}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,.8)"
                      mb={2.5}
                      sx={{ color: '#fff', mb: 2 }}
                    >
                      {dest.state}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        icon={<CarIcon sx={{ fontSize: 15 }} />}
                        label={`${dest.trips} trips`}
                        size="small"
                        sx={{
                          color: '#fff',
                          bgcolor: 'inherit',
                          fontWeight: 600,
                          height: 24,
                        }}
                      />

                      <Chip
                        icon={
                          <StarIcon
                            sx={{
                              fontSize: 14,
                              color: '#FFD700 !important',
                            }}
                          />
                        }
                        label={dest.rating}
                        size="small"
                        sx={{
                          color: '#fff',
                          bgcolor: 'rgba(255,255,255,.2)',
                          fontWeight: 600,
                          height: 24,
                        }}
                      />

                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: '#FFD700', mt: 0.5 }}
                      >
                        from {dest.price}
                      </Typography>
                    </Stack>
                  </Box>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default DestinationsSection;