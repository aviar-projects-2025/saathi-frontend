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
import PhoneMockup from './PhoneMockUp.jsx';
import { colors } from './theme';

// ---------------------------------------------------------------------
// data
// ---------------------------------------------------------------------
const TRUST_POINTS = [
  { icon: PeopleAltOutlinedIcon, title: 'Referral Only', sub: 'No referral, no registration.' },
  { icon: VerifiedUserOutlinedIcon, title: 'Real Profiles', sub: 'Real photos. Real people.' },
  { icon: AssignmentTurnedInOutlinedIcon, title: 'Referrer Approval', sub: 'Approved by someone you trust.' },
  { icon: LockOutlinedIcon, title: 'Safe & Trusted', sub: 'Built for our community.' },
];

const ROUTE_CARD_ROWS = [
  { from: { name: 'Dallas', sub: 'TX' }, to: { name: 'Austin', sub: 'TX' }, ModeIcon: DirectionsCarFilledRoundedIcon },
  { from: { name: 'Dallas', sub: 'TX' }, to: { name: 'Hyderabad', sub: 'India' }, ModeIcon: FlightRoundedIcon },
];

const HERO_BG_IMAGE =
  'https://images.unsplash.com/photo-1532931899774-fbd4de0008fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhdmVsJTIwY29tcGFuaW9ucyUyMGZsaWdodCUyMCUyQyUyMGNhcnxlbnwwfHwwfHx8MA%3D%3D';

// ---------------------------------------------------------------------
// small presentational pieces
// ---------------------------------------------------------------------
function TrustPoint({ icon: Icon, title, sub }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Icon sx={{ color: colors.orange, fontSize: 35 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 15, mt: 1, color: colors.navy }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 13, color: colors.textSecondary, mt: 0.3 }}>
        {sub}
      </Typography>
    </Grid>
  );
}

function TrustPointsGrid() {
  return (
    <Grid container spacing={3} sx={{ mt: 3, maxWidth: 700 }}>
      {TRUST_POINTS.map((point) => (
        <TrustPoint key={point.title} {...point} />
      ))}
    </Grid>
  );
}

function HeroHeading() {
  return (
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
  );
}

function HeroCTAs() {
  // Preserved but inactive in the original markup — kept as its own
  // component so it's a one-line toggle to bring back.
  return (
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
  );
}

function HeroCopyColumn() {
  return (
    <Grid item xs={12} md={7}>
      <HeroHeading />

      <Typography sx={{ mt: 3, fontSize: 18, color: colors.textSecondary, maxWidth: 560 }}>
        A referral-based community for Indians in the USA to share rides between cities
        and find travel companions for journeys to or from India.
      </Typography>

      <TrustPointsGrid />

      {/* <HeroCTAs /> */}
    </Grid>
  );
}

function SpeechBubble() {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: -70,
        right: { sm: 6, lg: -35 },
        zIndex: 4,
        p: 1.8,
        borderRadius: 3,
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 1.2,
        maxWidth: 250,
        mt: 1
      }}
    >
      <FavoriteRoundedIcon sx={{ color: colors.orange }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: colors.navy }}>
        Helping families make their parents&apos; journey easier and safer.
      </Typography>
    </Paper>
  );
}

function TiltedPhone() {
  return (
    <Box
      sx={{
        perspective: { xs: 'none', sm: '1200px' },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          transform: {
            xs: 'none',
            md: `
              translate3d(10px, -0px, -30px)
              rotateX(15deg)
              rotateY(-25deg)
              rotateZ(10deg)
            `,
          },
          transformStyle: { xs: 'flat', sm: 'preserve-3d' },
          transition: 'transform 0.5s ease',
          mt: 2,
        }}
      >
        <PhoneMockup />
      </Box>
    </Box>
  );
}

function RouteRow({ from, to, ModeIcon }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.navy }}>
          {from.name}
        </Typography>
        <Typography sx={{ fontSize: 9.5, color: colors.textSecondary }}>
          {from.sub}
        </Typography>
      </Box>

      <ModeIcon sx={{ color: colors.navy, fontSize: 17 }} />

      <Box textAlign="right">
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.navy }}>
          {to.name}
        </Typography>
        <Typography sx={{ fontSize: 9.5, color: colors.textSecondary }}>
          {to.sub}
        </Typography>
      </Box>
    </Stack>
  );
}

function RoutesCard() {
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'absolute',
        right: { sm: 15, lg: 360 },
        bottom: 5,
        zIndex: 4,
        p: 1.5,
        borderRadius: 2,
        width: { sm: 210, md: 230, lg: 240 },
        display: { xs: 'none', sm: 'none', lg: 'block' },
      }}
    >
      {ROUTE_CARD_ROWS.map((row, i) => (
        <React.Fragment key={`${row.from.name}-${row.to.name}`}>
          <RouteRow {...row} />
          {i < ROUTE_CARD_ROWS.length - 1 && (
            <Box sx={{ borderTop: `1px dashed ${colors.border}`, my: 1 }} />
          )}
        </React.Fragment>
      ))}

      <Typography
        sx={{
          fontSize: 9.5,
          color: colors.textSecondary,
          mt: 1.2,
          textAlign: 'center',
        }}
      >
        And many more routes across USA &amp; India
      </Typography>
    </Paper>
  );
}

function HeroVisualColumn() {
  return (
    <Grid item xs={12} md={5}>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          justifyContent: { xs: 'center', sm: 'flex-end' },
          mr: { md: -2, lg: 0 },
        }}
      >
        <SpeechBubble />
        <TiltedPhone />
        <RoutesCard />
      </Box>
    </Grid>
  );
}

// ---------------------------------------------------------------------
// root
// ---------------------------------------------------------------------
export default function Hero() {
  return (
    <Box
      sx={{
        position: 'relative',
        pt: { xs: 14, md: 24 },
        pb: { xs: 14, md: 10 },
        backgroundImage: `linear-gradient(
          100deg, rgba(255,255,255,0.94)
           0%, rgba(255,255,255,0.55)
           45%, rgba(234,242,251,0.25) 100%),
            url(${HERO_BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={10}
          sx={{ display: 'flex', justifyContent: 'space-around' }}
        >
          <HeroCopyColumn />
          <HeroVisualColumn />
        </Grid>
      </Container>
    </Box>
  );
}