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
    name: "Michael Johnson",
    location: "United States",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop&crop=face",
    text: "Saathi made my journey across North America effortless. I found trusted travel companions, shared travel expenses, and enjoyed a safe, comfortable trip.",
    rating: 5,
    trip: "United States → Canada",
  },
  {
    name: "Emily Carter",
    location: "United Kingdom",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop&crop=face",
    text: "Traveling solo felt much safer with Saathi. The verified community helped me meet reliable travelers and made my international trip stress-free.",
    rating: 5,
    trip: "United Kingdom → France",
  },
  {
    name: "David Miller",
    location: "Germany",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop&crop=face",
    text: "Saathi is an excellent platform for international travel. Sharing rides reduced my costs while giving me the chance to meet amazing people from around the world.",
    rating: 5,
    trip: "Germany → Netherlands",
  },
];

const TestimonialsSection = () => (
  <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: "background.paper" }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center" }} mb={7}>
        <Typography variant="h2" fontWeight={800} mb={2}>
          Trusted by Travelers Worldwide
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.8,
            m: 2,
            fontWeight: 500,
            maxWidth: 800,
            mx: "auto",
          }}
        >
          Join a growing global community of verified travelers who choose
          Saathi for safer journeys, shared travel expenses, meaningful
          connections, and unforgettable experiences across cities and
          countries.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 3, md: 4 }}>
        {testimonials.map((testimonial, index) => (
          <Grid
            item
            xs={12}
            md={4}
            key={testimonial.name}
            sx={{ display: "flex" }}
          >
            <Zoom in timeout={500 + index * 150} style={{ width: "100%" }}>
              <Card
                elevation={2}
                sx={{
                  width: "100%",
                  display: "flex",
                  borderRadius: 3,
                  transition: "all .3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    width: "100%",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={3}
                    alignItems={{ xs: "center", sm: "flex-start" }}
                  >
                    <Avatar
                      src={testimonial.avatar}
                      sx={{
                        width: { xs: 72, md: 82 },
                        height: { xs: 72, md: 82 },
                        flexShrink: 0,
                      }}
                    />

                    <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
                      <Rating
                        value={testimonial.rating}
                        readOnly
                        size="small"
                        sx={{
                          color: "#FFD700",
                          mb: 1,
                        }}
                      />

                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontStyle: "italic",
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