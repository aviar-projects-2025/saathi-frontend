import React from 'react';
import { Box, Container, Grid, Typography, Stack, Button, Paper } from '@mui/material';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PhoneMockup from './PhoneMockup.jsx';
import { colors } from './theme';

const trustPoints = [
  { icon: PeopleAltOutlinedIcon, title: 'Referral Only', sub: 'No referral, no registration.' },
  { icon: VerifiedUserOutlinedIcon, title: 'Real Profiles', sub: 'Real photos. Real people.' },
  { icon: AssignmentTurnedInOutlinedIcon, title: 'Referrer Approval', sub: 'Approved by someone you trust.' },
  { icon: LockOutlinedIcon, title: 'Safe & Trusted', sub: 'Built for our community.' },
];

export default function Hero() {
  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 14, md: 16 },
        pb: { xs: 26, md: 30 },
        backgroundImage:
          'linear-gradient(100deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.55) 45%, rgba(234,242,251,0.25) 100%), url(https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?q=80&w=1600&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 40, sm: 48, md: 54 },
                lineHeight: 1.12,
                color: colors.navy,
              }}
            >
              Trusted Rides.
              <br />
              Trusted People.
              <br />
              <Box component="span" sx={{ color: colors.orange }}>
                That&apos;s Saathi.
              </Box>
            </Typography>

            <Typography sx={{ mt: 3, fontSize: 18, color: colors.textSecondary, maxWidth: 560 }}>
              A referral-based community for Indians in the USA to share rides between cities
              and find travel companions for journeys to or from India.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 3, maxWidth: 620 }}>
              {trustPoints.map(({ icon: Icon, title, sub }) => (
                <Grid item xs={6} sm={3} key={title}>
                  <Icon sx={{ color: colors.orange, fontSize: 30 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 1, color: colors.navy }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: colors.textSecondary, mt: 0.3 }}>
                    {sub}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchRoundedIcon />}
                sx={{
                  bgcolor: colors.navy,
                  borderRadius: 3,
                  px: 3.5,
                  py: 1.4,
                  '&:hover': { bgcolor: colors.navyDark },
                }}
              >
                Find a Ride
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AddCircleOutlineRoundedIcon />}
                sx={{
                  borderColor: colors.navy,
                  color: colors.navy,
                  borderRadius: 3,
                  px: 3.5,
                  py: 1.4,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2, borderColor: colors.navy, bgcolor: '#F5F8FC' },
                }}
              >
                Post Your Ride
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: { xs: 'center', sm: 'flex-end' },
                mr: { md: -2, lg: 0 },
              }}
            >
              {/* speech bubble — hidden below sm so it never crowds the phone on narrow screens */}
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  top: -70,
                  right: { sm: 6, lg: -10 },
                  zIndex: 4,
                  p: 1.8,
                  borderRadius: 3,
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1.2,
                  maxWidth: 250,
                }}
              >
                <FavoriteRoundedIcon sx={{ color: colors.orange }} />
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.navy }}>
                  Helping families make their parents&apos; journey easier and safer.
                </Typography>
              </Paper>

              <PhoneMockup />

              {/* route preview card — only shown at lg+, where there's enough room beside the
                  text column that it can't overlap it (it did at md, where the columns are narrower) */}
              <Paper
                elevation={6}
                sx={{
                  position: 'absolute',
                  left: -190,
                  bottom: -60,
                  zIndex: 4,
                  p: 2.5,
                  borderRadius: 3,
                  width: 260,
                  display: { xs: 'none', lg: 'block' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.navy }}>Dallas</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>TX</Typography>
                  </Box>
                  <DirectionsCarFilledRoundedIcon sx={{ color: colors.navy, fontSize: 20 }} />
                  <Box textAlign="right">
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.navy }}>Austin</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>TX</Typography>
                  </Box>
                </Stack>
                <Box sx={{ borderTop: `1px dashed ${colors.border}`, my: 1.6 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.navy }}>Dallas</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>TX</Typography>
                  </Box>
                  <FlightRoundedIcon sx={{ color: colors.navy, fontSize: 20 }} />
                  <Box textAlign="right">
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: colors.navy }}>Hyderabad</Typography>
                    <Typography sx={{ fontSize: 11, color: colors.textSecondary }}>India</Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: 11.5, color: colors.textSecondary, mt: 1.8, textAlign: 'center' }}>
                  And many more routes across USA &amp; India
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}