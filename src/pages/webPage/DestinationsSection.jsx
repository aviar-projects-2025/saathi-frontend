import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  Chip,
  Grow,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Star as StarIcon,
} from '@mui/icons-material';

// ──────────────────────────────────────────────
// Featured Destinations Section
// ──────────────────────────────────────────────
const destinations = [
  {
    city: "Paris",
    state: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2070&auto=format&fit=crop",
    trips: 486,
    rating: 4.9,
    price: "$45",
  },
  {
    city: "Tokyo",
    state: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2070&auto=format&fit=crop",
    trips: 421,
    rating: 4.8,
    price: "$55",
  },
  {
    city: "Dubai",
    state: "United Arab Emirates",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop",
    trips: 367,
    rating: 4.8,
    price: "$40",
  },
  {
    city: "Singapore",
    state: "Singapore",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2070&auto=format&fit=crop",
    trips: 298,
    rating: 4.9,
    price: "$60",
  },
  {
    city: "Sydney",
    state: "Australia",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
    trips: 245,
    rating: 4.8,
    price: "$50",
  },
  {
    city: "London",
    state: "United Kingdom",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
    trips: 214,
    rating: 4.7,
    price: "$42",
  },
];

const DestinationsSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }} mb={7}>
          <Typography variant="h2" fontWeight={800} mb={2}>
            Explore Popular Destinations Around the World
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              m: 4,
              fontSize: "1.1rem",
            }}
          >
            Discover exciting destinations across the globe. Connect with
            verified travelers, share rides, split travel expenses, and enjoy
            safer, smarter, and more affordable journeys wherever your next
            adventure takes you.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {destinations.map((dest, index) => (
            <Grid key={dest.city} size={{ xs: 12, sm: 6, md: 4 }}>
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