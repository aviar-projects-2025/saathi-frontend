import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Stack,
  Zoom,
  Rating,
} from '@mui/material';
import { Route as RouteIcon } from '@mui/icons-material';

// ──────────────────────────────────────────────
// Testimonials Section
// ──────────────────────────────────────────────
const testimonials = [
  {
    name: 'Aditya Mehta',
    location: 'Mumbai',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop&crop=face',
    text: 'Saathi made my Goa trip unforgettable! Found amazing travel buddies and saved so much on fuel costs. Highly recommended!',
    rating: 5,
    trip: 'Mumbai → Goa',
  },
  {
    name: 'Sneha Kapoor',
    location: 'Delhi',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop&crop=face',
    text: "As a solo female traveler, safety was my priority. Saathi's verified drivers and community reviews gave me complete peace of mind.",
    rating: 5,
    trip: 'Delhi → Manali',
  },
  {
    name: 'Vikram Reddy',
    location: 'Hyderabad',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop&crop=face',
    text: 'The best way to travel on a budget! Met incredible people and discovered hidden gems along the way. Will use again!',
    rating: 5,
    trip: 'Hyderabad → Bangalore',
  },
];

const TestimonialsSection = () => (
  <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: 'background.paper' }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center' }} mb={7}>
        <Typography variant="h2" fontWeight={800} mb={2}>
          Loved by travelers
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.8,
            m: 2,
            fontWeight: 700,
          }}
        >
          Hear from our community of 50,000+ happy travelers across India.
        </Typography>
      </Box>

      <Grid spacing={{ xs: 3, md: 4 }}>
        {testimonials.map((testimonial, index) => (
          <Grid
            item
            xs={12}
            md={6}
            key={testimonial.name}
            sx={{
              display: 'flex',
            }}
          >
            <Zoom in timeout={500 + index * 150} style={{ width: '100%' }}>
              <Card
                elevation={2}
                sx={{
                  width: '100%',
                  display: 'flex',
                  borderRadius: 3,
                  transition: 'all .3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  },
                  mt: 5,
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    width: '100%',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                  >
                    {/* Avatar */}
                    <Avatar
                      src={testimonial.avatar}
                      sx={{
                        width: { xs: 72, md: 82 },
                        height: { xs: 72, md: 82 },
                        flexShrink: 0,
                      }}
                    />

                    {/* Content */}
                    <Box flex={1} textAlign={{ xs: 'center', sm: 'left' }}>
                      <Rating
                        value={testimonial.rating}
                        readOnly
                        size="small"
                        sx={{
                          color: '#FFD700',
                          mb: 1,
                        }}
                      />

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          lineHeight: 1.8,
                          mb: 2.5,
                        }}
                      >
                        "{testimonial.text}"
                      </Typography>

                      <Chip
                        icon={<RouteIcon />}
                        label={testimonial.trip}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Divider sx={{ mb: 2 }} />

                      <Typography variant="subtitle1" fontWeight={700}>
                        {testimonial.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {testimonial.location}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default TestimonialsSection;