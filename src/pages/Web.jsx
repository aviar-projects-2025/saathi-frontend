import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  Divider,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Badge,
  Fab,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Zoom,
  Slide,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Rating,
  CircularProgress,
  GlobalStyles,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Shield as ShieldIcon,
  CreditCard as CreditCardIcon,
  HeadsetMic as HeadsetMicIcon,
  Public as PublicIcon,
  EmojiEvents as TrophyIcon,
  VerifiedUser as VerifiedUserIcon,
  SupportAgent as SupportAgentIcon,
  Map as MapIcon,
  Route as RouteIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { useNavigate } from "react-router-dom";
import SaathiLogo from '../assets/saathilogo.png';

// ──────────────────────────────────────────────
// Custom Premium Theme
// ──────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6B35',
      light: '#FF8F65',
      dark: '#E55A2B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1B4332',
      light: '#2D6A4F',
      dark: '#081C15',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#E63946',
      light: '#FF6B6B',
      dark: '#C1121F',
    },
    info: {
      main: '#457B9D',
      light: '#69A3C7',
      dark: '#1D3557',
    },
    success: {
      main: '#2A9D8F',
      light: '#40C9B5',
      dark: '#1B7A6E',
    },
    background: {
      default: '#FBFBFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#5C5C6E',
      disabled: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Poppins", "Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
      '@media (max-width:900px)': { fontSize: '2.6rem' },
      '@media (max-width:600px)': { fontSize: '2rem' },
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      '@media (max-width:900px)': { fontSize: '2rem' },
      '@media (max-width:600px)': { fontSize: '1.6rem' },
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      '@media (max-width:600px)': { fontSize: '1.5rem' },
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.4rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': { fontSize: '1.2rem' },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.15rem',
      lineHeight: 1.45,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.005em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.65,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
      fontSize: '0.95rem',
    },
    caption: {
      fontSize: '0.78rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)',
          boxShadow: '0 4px 20px rgba(255,107,53,0.30)',
          '&:hover': {
            background: 'linear-gradient(135deg, #E55A2B 0%, #E08E00 100%)',
            boxShadow: '0 8px 30px rgba(255,107,53,0.40)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          boxShadow: '0 4px 20px rgba(27,67,50,0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #081C15 0%, #1B4332 100%)',
            boxShadow: '0 8px 30px rgba(27,67,50,0.35)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
  },
});

// ──────────────────────────────────────────────
// Animation Keyframes
// ──────────────────────────────────────────────
const floatSlow = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const breathe = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,53,0.4); }
  50% { box-shadow: 0 0 0 16px rgba(255,107,53,0); }
`;

// Respect the OS-level "reduce motion" preference across the whole app.
// Applied once via <GlobalStyles> in the root component below.
const reducedMotionStyles = {
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
      scrollBehavior: 'auto !important',
    },
  },
};

// ──────────────────────────────────────────────
// Helper Components
// ──────────────────────────────────────────────
const GradientChip = ({ label, icon, color = 'primary', sx: sxProp = {}, ...props }) => (
  <Chip
    icon={icon}
    label={label}
    size="small"
    {...props}
    sx={{
      fontWeight: 600,
      fontSize: '0.78rem',
      height: 26,
      bgcolor: color === 'primary' ? 'rgba(255,107,53,0.10)' : 'rgba(27,67,50,0.08)',
      color: color === 'primary' ? 'primary.main' : 'secondary.main',
      border: `1.5px solid ${color === 'primary' ? 'rgba(255,107,53,0.25)' : 'rgba(27,67,50,0.20)'}`,
      ...sxProp,
    }}
  />
);

const SectionBadge = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      display: 'inline-block',
      px: 2.5,
      py: 0.8,
      borderRadius: 50,
      bgcolor: 'rgba(255,107,53,0.08)',
      color: 'primary.main',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      fontSize: '0.73rem',
      mb: 2.5,
    }}
  >
    {children}
  </Typography>
);

// ──────────────────────────────────────────────
// Navbar Component
// ──────────────────────────────────────────────
const Navbar = ({ scrolled, onDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 3 : 0}
      sx={{
        background: scrolled
          ? "rgba(255,255,255,0.96)"
          : "transparent",
        backdropFilter: scrolled
          ? "blur(20px) saturate(180%)"
          : "none",
        color: scrolled ? "text.primary" : "#fff",
        transition: "all .35s ease",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,.08)"
          : "1px solid transparent",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 50, md: 72 },
            px: { xs: 0, sm: 2 },
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              src={SaathiLogo}
              alt="Saathi"
              sx={{
                width: { xs: 30, md: 35 },
                height: { xs: 30, md: 35 },
                bgcolor: "transparent",

              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "inherit",
                fontSize: {xs:"1.3rem", md: "1.8rem" }
              }}
            >
              Saathi
            </Typography>
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1,
              py: 0.5,
              borderRadius: "50px",

            }}
          >

            {/* Sign In */}
            <Button
              // onClick={onLoginOpen}
              onClick={() => navigate("/login")}
              variant={scrolled ? "contained" : "outlined"}
              size="small"
              sx={{
                borderRadius: "30px",
                px: { xs: 2, md: 4 },
                py: 0.5,
                fontWeight: 700,
                textTransform: "none",
                borderWidth: "2px",
                borderColor: scrolled
                  ? "primary.main"
                  : "rgba(255,255,255,.8)",
                color: scrolled
                  ? "#fff"
                  : "#fff",
                "&:hover": {
                  borderWidth: "2px",
                  bgcolor: scrolled
                    ? "primary.main"
                    : "rgba(255,255,255,.15)",
                  color: "#fff",
                },
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// ──────────────────────────────────────────────
// Hero Section
// ──────────────────────────────────────────────
const HeroSection = ({ onSearchClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', sm: '90vh', md: '92vh' },
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(https://images.unsplash.com/photo-1612925498765-67c53ae41782?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzZ8fFRyYXZlbCUyMHdpdGglMjBjb21wYW5pb24lMjBwZXJzb24lMjB3aXRoJTIwdmVoaWNsZXxlbnwwfHwwfHx8MA%3D%3D)`,
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

// ──────────────────────────────────────────────
// Trust Badges Strip
// ──────────────────────────────────────────────
const trustItems = [
  { icon: <VerifiedUserIcon fontSize="small" />, text: "Verified Drivers" },
  { icon: <ShieldIcon fontSize="small" />, text: "Secure Payments" },
  { icon: <HeadsetMicIcon fontSize="small" />, text: "24/7 Support" },
  { icon: <PublicIcon fontSize="small" />, text: "100+ Destinations" },
  { icon: <TrophyIcon fontSize="small" />, text: "#1 Travel Platform" },
];

const TrustStrip = () => (
  <Box
    sx={{
      bgcolor: "#F7F5F2",
      py: { xs: 2.5, md: 2 },
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      overflow: "hidden",
      whiteSpace: "nowrap",
    }}
  >
    <Container maxWidth="lg" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          width: "max-content",
          animation: "marquee 20s linear infinite",
          "@keyframes marquee": {
            "0%": {
              transform: "translateX(0)",
            },
            "100%": {
              transform: "translateX(-50%)",
            },
          },
          "&:hover": {
            animationPlayState: "paused",
          },
        }}
      >
        {[...trustItems, ...trustItems].map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              mx: { xs: 2.5, md: 4 },
            }}
          >
            <Box
              sx={{
                color: "primary.main",
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.icon}
            </Box>

            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);


// ──────────────────────────────────────────────
// Featured Destinations Section
// ──────────────────────────────────────────────
const destinations = [
  {
    city: "Goa",
    state: "Coastal Paradise",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1974&auto=format&fit=crop",
    trips: 245,
    rating: 4.8,
    price: "₹1,200",
  },
  {
    city: "Manali",
    state: "Himachal Pradesh",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070&auto=format&fit=crop",
    trips: 189,
    rating: 4.9,
    price: "₹2,500",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2070&auto=format&fit=crop",
    trips: 312,
    rating: 4.7,
    price: "₹1,800",
  },
  {
    city: "Kerala",
    state: "God's Own Country",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2070&auto=format&fit=crop",
    trips: 178,
    rating: 4.9,
    price: "₹3,000",
  },
  {
    city: "Varanasi",
    state: "Uttar Pradesh",
    image:
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=2076&auto=format&fit=crop",
    trips: 156,
    rating: 4.6,
    price: "₹1,500",
  },
  {
    city: "Thiruvannamalai",
    state: "Tamil Nadu",
    image:
      "https://plus.unsplash.com/premium_photo-1697729536647-4e23a32dd324?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVtcGxlfGVufDB8fDB8fHww",
    trips: 134,
    rating: 4.8,
    price: "₹1,600",
  },
];

const DestinationsSection = () => {
  return (
    <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }} mb={7}>
          {/* <SectionBadge>Popular Destinations</SectionBadge> */}

          <Typography variant="h2" fontWeight={800} mb={2}>
            Find the Perfect Travel Companion
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{

              lineHeight: 1.8,
              m: 4,
              fontSize: "1.1rem"
            }}
          >
            Find the perfect travel companion for your next adventure. Connect with trusted people heading the same way, share the journey, split travel costs, and create unforgettable memories together.
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
                    position: "relative",
                    height: { xs: 250, sm: 280, md: 300 },
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all .35s ease",
                    boxShadow: 3,

                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 10,
                    },

                    "&:hover .dest-image": {
                      transform: "scale(1.05)",
                    },

                    "&:hover .dest-overlay": {
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.20) 55%, rgba(0,0,0,.05) 100%)",
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
                        "https://placehold.co/600x400?text=Destination";
                    }}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform .6s ease",
                    }}
                  />

                  <Box
                    className="dest-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.15) 48%, rgba(0,0,0,0) 100%)",
                      transition: "background .5s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      p: 2.5,
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      mb={0.5}
                      sx={{ color: "#fff" }}
                    >
                      {dest.city}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="rgba(255,255,255,.8)"
                      mb={2.5}
                      sx={{ color: "#fff", mb: 2 }}
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
                          color: "#fff",
                          bgcolor: "inherit",
                          fontWeight: 600,
                          height: 24,
                        }}
                      />

                      <Chip
                        icon={
                          <StarIcon
                            sx={{
                              fontSize: 14,
                              color: "#FFD700 !important",
                            }}
                          />
                        }
                        label={dest.rating}
                        size="small"
                        sx={{
                          color: "#fff",
                          bgcolor: "rgba(255,255,255,.2)",
                          fontWeight: 600,
                          height: 24,
                        }}
                      />

                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: "#FFD700", mt: 0.5 }}
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
      bgcolor: "background.paper",
    }}
  >
    <Container maxWidth="lg">
      {/* Heading */}
      <Box sx={{ textAlign: "center" }} mb={{ xs: 6, md: 8 }}>
        {/* <SectionBadge>How It Works</SectionBadge> */}

        <Typography
          variant="h2"
          fontWeight={800}
          sx={{
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3rem",
            },
          }}
        >
          Travel in 3 easy steps
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            // maxWidth: 650,
            textAlign: "center",
            // mx: "auto",
            lineHeight: 1.8,
            fontSize: {
              xs: "1rem",
              md: "1.15rem",
            },
            m: 2.5
          }}
        >
          Getting started with Saathi is simple. Find, book, and travel —
          all in one place.
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={7} sx={{ display: "flex", justifyContent: "space-around" }}>
        {steps.map((step, index) => (
          <Grid item xs={12} sm={6} md={4} key={step.title}>
            <Fade in timeout={500 + index * 200}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 360,
                  p: 1.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .35s ease",
                  bgcolor: "#fff",

                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 20px 45px rgba(0,0,0,.08)",
                    borderColor: step.color,
                  },
                }}
              >
                {/* Step Number */}
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    bgcolor: `${step.color}15`,
                    color: step.color,
                    border: `2px solid ${step.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.9rem",
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
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    mb: 3,
                    boxShadow: `0 10px 30px ${step.color}40`,
                  }}
                >
                  {step.icon}
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                >
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
  <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: "background.paper" }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center" }} mb={7}>
        {/* <SectionBadge>Testimonials</SectionBadge> */}

        <Typography variant="h2" fontWeight={800} mb={2}>
          Loved by travelers
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            lineHeight: 1.8,
            m: 2,
            fontWeight: 700
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
              display: "flex",

            }}
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
                  mt: 5
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

                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                      >
                        {testimonial.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
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
    </Container >
  </Box >
);

// ──────────────────────────────────────────────
// Safety & Trust Section
// ──────────────────────────────────────────────
const safetyFeatures = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 44 }} />,
    title: 'ID Verified Drivers',
    description:
      'Every driver undergoes government ID verification and background checks before being listed.',
    color: "#f36f03",
    bgcolor: "#f36f03"
  },
  {
    icon: <CreditCardIcon sx={{ fontSize: 44 }} />,
    title: 'Secure Transactions',
    description:
      'All payments are processed through encrypted channels. Your financial data is always protected.',
    color: "#0cebeb",
    bgcolor: "#0cebeb"
  },
  {
    icon: <MapIcon sx={{ fontSize: 44 }} />,
    title: 'Live Trip Tracking',
    description:
      'Share your live location with trusted contacts. Real-time GPS tracking for complete peace of mind.',
    color: "#67e910",
    bgcolor: "#67e910"
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 44 }} />,
    title: '24/7 Emergency Support',
    description:
      'Our dedicated support team is available around the clock to assist you with any concerns.',
    color: "#f70d0d",
    bgcolor: "#f70d0d"
  },
];

const SafetySection = () => (
  <Box sx={{ bgcolor: "#fff" }}>
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h2" fontWeight={800}>
        Travel with complete confidence
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(10, 10, 10, 0.72)', lineHeight: 2, m: 4, fontWeight: 700 }}
      >
        We've built industry-leading safety features so you can focus on enjoying the journey.
      </Typography>
    </Box>

    <Grid container spacing={{ xs: 7, md: 3 }} sx={{ display: "flex", justifyContent: "space-evenly" }}>
      {safetyFeatures.map((step, index) => (
        <Grid item xs={12} sm={6} md={4} key={step.title}>
          <Fade in timeout={500 + index * 200}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 360,
                p: 1,
                borderRadius: 2,
                border: "1px solid",

                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .35s ease",
                borderColor: step.color,
                color: step.color,
                bgcolor: "#fff",

                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: "0 20px 45px rgba(0,0,0,.08)",
                  color: "#fff",
                  bgcolor: step.bgcolor,

                },
              }}
            >

              {/* Icon */}
              <Box
                sx={{
                  width: 82,
                  height: 82,
                  // background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  // color: "#fff",
                  mb: 7,
                  // boxShadow: `0 10px 30px ${step.color}40`,
                }}
              >
                {step.icon}
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
              >
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
  </Box>

);

// ──────────────────────────────────────────────
// CTA Section
// ──────────────────────────────────────────────
const CTASection = () => (
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
          sx={{ justifyContent: "center", alignItems: "center", mt: 3 }}
        >
          <Button

            variant="contained"
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
            Get Started Free
          </Button>

          <Button
            variant="outlined"
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

// ──────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

const socialIcons = [
  {
    name: "Instagram",
    icon: InstagramIcon,
    link: "#",
  },
  {
    name: "Facebook",
    icon: FacebookIcon,
    link: "#",
  },
  {
    name: "Twitter",
    icon: TwitterIcon,
    link: "#",
  },
  {
    name: "YouTube",
    icon: YouTubeIcon,
    link: "#",
  },
];

const Footer = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: "#0D1117",
      color: "#fff",
      pt: { xs: 7, md: 9 },
      pb: 4,
    }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 5, md: 8 }}>
        {/* Brand Section */}
        <Grid item xs={12}>
          <Stack
            spacing={3}
            alignItems="center"
            textAlign="center"
          >
            <Box
              sx={{
                width: { xs: 64, md: 72 },
                height: { xs: 64, md: 72 },
                borderRadius: 3,
                background:
                  "linear-gradient(135deg,#FF6B35,#FF9F1C)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: { xs: "1.8rem", md: "2rem" },
              }}
            >
              S
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
              >
                Saathi
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  color: "rgba(255,255,255,.68)",
                  lineHeight: 1.8,
                }}
              >
                India's most trusted travel companion platform.
                Connect, share rides, split costs, and explore
                together with verified travelers.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="center"
            >
              {socialIcons.map(({ name, icon: Icon, link }) => (
                <IconButton
                  key={name}
                  component="a"
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  sx={{
                    width: 42,
                    height: 42,
                    border:
                      "1px solid rgba(255,255,255,.12)",
                    color: "rgba(255,255,255,.6)",
                    transition: ".3s",

                    "&:hover": {
                      color: "#FF6B35",
                      borderColor: "#FF6B35",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Contact Section */}
        <Grid item xs={12}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 6 }}
            justifyContent="center"
            alignItems="center"
          >
            {[
              {
                Icon: PhoneIcon,
                text: "+91 98765 43210",
              },
              {
                Icon: EmailIcon,
                text: "hello@saathi.com",
              },
              {
                Icon: LocationIcon,
                text: "Bangalore, India",
              },
            ].map(({ Icon, text }) => (
              <Stack
                key={text}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Icon
                  sx={{
                    color: "#FF6B35",
                    fontSize: 20,
                  }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,.68)",
                  }}
                >
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Divider
        sx={{
          my: { xs: 5, md: 6 },
          bgcolor: "rgba(255,255,255,.08)",
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,.45)",
            textAlign: "center",
          }}
        >
          © 2026 Saathi Technologies Pvt Ltd
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,.45)",
            textAlign: "center",
          }}
        >
          Made with ❤️ in India
        </Typography>
      </Stack>
    </Container>
  </Box>
);


// ──────────────────────────────────────────────
// Main Web Component
// ──────────────────────────────────────────────
const Web = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLoginClose = useCallback(() => setLoginOpen(false), []);
  const handleDrawerToggle = useCallback(() => setDrawerOpen((prev) => !prev), []);
  const handleSearchClick = useCallback(() => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={reducedMotionStyles} />
      <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>
        <Navbar scrolled={scrolled} onDrawerToggle={handleDrawerToggle} />


        <HeroSection onSearchClick={handleSearchClick} />
        <TrustStrip />

        <Box ref={searchRef}>
          <DestinationsSection />
        </Box>

        <HowItWorksSection />
        <SafetySection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Web;