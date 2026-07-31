import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { keyframes } from '@mui/system';
import { useNavigate } from "react-router-dom";


// ──────────────────────────────────────────────
// CTA Section
// ──────────────────────────────────────────────

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const CTASection = ({ onSearchClick }) => {

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #FF6B35 0%, #FF9F1C 50%, #FF6B35 100%)',
        backgroundSize: '200% 200%',
        animation: `${gradientShift} 10s ease infinite`,
      }}
    >
      {/* Decorative background blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -80,
          left: '10%',
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(2px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -70,
          right: '8%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          filter: 'blur(2px)',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
            px: { xs: 2, sm: 4 },
          }}
        >
          {/* Heading */}
          <Typography
            variant="h3"
            fontWeight={800}
            color="#fff"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Ready to hit the road?
          </Typography>

          {/* Subtext */}
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.7,
            }}
          >
            Join 50,000+ travelers already using Saathi. Connect, share rides,
            and save money on every journey.
          </Typography>

          {/* Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', alignItems: 'center', mt: 3 }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                px: 6,
                py: 1.6,
                borderRadius: 50,
                fontWeight: 700,
                fontSize: '1rem',
                minWidth: 200,
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#fff',
                color: 'primary.main',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',

                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
                },
              }}
            >
              Get Started
            </Button>

            <Button
              variant="outlined"
              onClick={onSearchClick}
              sx={{
                px: 6,
                py: 1.6,
                borderRadius: 50,
                fontWeight: 700,
                fontSize: '1rem',
                minWidth: 200,
                width: { xs: '100%', sm: 'auto' },
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.7)',
                borderWidth: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',

                '&:hover': {
                  borderColor: '#fff',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );

};

export default CTASection;