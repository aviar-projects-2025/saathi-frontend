import React from 'react';
import { Box, Container, Typography, Grid, Card, Stack, Chip, Grow } from '@mui/material';
import { DirectionsCar as CarIcon, Star as StarIcon } from '@mui/icons-material';

// ──────────────────────────────────────────────
// Featured Destinations Section
// ──────────────────────────────────────────────
const destinations = [
  {
    city: "New York City",
    state: "New York",
    image:
      "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?q=80&w=2070&auto=format&fit=crop",
    trips: 486,
    rating: 4.9,
    price: "$45",
  },
  {
    city: "Los Angeles",
    state: "California",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop",
    trips: 421,
    rating: 4.8,
    price: "$55",
  },
  {
    city: "Miami",
    state: "Florida",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2070&auto=format&fit=crop",
    trips: 367,
    rating: 4.8,
    price: "$40",
  },
  {
    city: "Las Vegas",
    state: "Nevada",
    image:
      "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?q=80&w=2070&auto=format&fit=crop",
    trips: 298,
    rating: 4.9,
    price: "$60",
  },
  {
    city: "Denver",
    state: "Colorado",
    image:
      "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?q=80&w=2070&auto=format&fit=crop",
    trips: 245,
    rating: 4.8,
    price: "$50",
  },
  {
    city: "Nashville",
    state: "Tennessee",
    image:
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?q=80&w=2070&auto=format&fit=crop",
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
            Find the Perfect Travel Companion
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
            Every journey is better together. Join a trusted community of verified
            travelers, enjoy safer ride sharing, split expenses, and experience
            seamless travel across the USA.
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