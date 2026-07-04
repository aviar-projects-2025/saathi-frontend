// import React from "react";
// import {
//   Box,
//   Button,
//   Chip,
//   Container,
//   Grid,
//   Paper,
//   Stack,
//   Typography,
// } from "@mui/material";
// import ShieldIcon from "@mui/icons-material/Shield";
// import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
// import GroupsIcon from "@mui/icons-material/Groups";
// import ChatIcon from "@mui/icons-material/Chat";
// import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
// import TravelExploreIcon from "@mui/icons-material/TravelExplore";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import { keyframes } from "@mui/system";
// import { useNavigate } from "react-router-dom";

// const navy = "#0B1F3A";
// const saffron = "#F28C28";
// const lightBg = "#F7FAFF";
// const softSaffron = "#FFF1E0";

// const float = keyframes`
//   0%, 100% { transform: translateY(0px); }
//   50% { transform: translateY(-14px); }
// `;

// const fadeUp = keyframes`
//   from {
//     opacity: 0;
//     transform: translateY(35px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// `;

// const pulse = keyframes`
//   0%, 100% {
//     box-shadow: 0 0 0 0 rgba(242, 140, 40, 0.28);
//   }
//   50% {
//     box-shadow: 0 0 0 18px rgba(242, 140, 40, 0);
//   }
// `;

// const features = [
//   {
//     icon: <ShieldIcon />,
//     title: "Verified Members",
//     text: "Members join through referrals and community approval.",
//   },
//   {
//     icon: <DirectionsCarIcon />,
//     title: "Shared Travel",
//     text: "Find trusted companions and share rides safely.",
//   },
//   {
//     icon: <GroupsIcon />,
//     title: "Trusted Network",
//     text: "Build real community connections through a verified referral system.",
//   },
//   {
//     icon: <ChatIcon />,
//     title: "Community Feed",
//     text: "Share updates, ask for help, and support others.",
//   },
// ];

// const steps = [
//   "Create your profile",
//   "Get referred by a member",
//   "Join the verified community",
//   "Find rides and travel safely",
// ];

// const Web = () => {
//   const navigate = useNavigate();

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: lightBg, overflow: "hidden" }}>
//       {/* Navbar */}
//       <Box
//         sx={{
//           py: 2,
//           px: { xs: 2, md: 6 },
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           bgcolor: "rgba(255,255,255,0.94)",
//           backdropFilter: "blur(14px)",
//           borderBottom: "1px solid #DDE7F3",
//           position: "sticky",
//           top: 0,
//           zIndex: 10,
//         }}
//       >
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Box
//             sx={{
//               width: 44,
//               height: 44,
//               borderRadius: "50%",
//               bgcolor: saffron,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               color: "#fff",
//               animation: `${pulse} 2.5s infinite`,
//             }}
//           >
//             <DirectionsCarIcon />
//           </Box>

//           <Typography variant="h5" fontWeight={900} color={navy}>
//             Saathi
//           </Typography>
//         </Stack>

//         <Button
//           variant="contained"
//           onClick={() => navigate("/login")}
//           sx={{
//             bgcolor: navy,
//             color: "#fff",
//             borderRadius: 999,
//             px: 3,
//             textTransform: "none",
//             fontWeight: 800,
//             boxShadow: "0 10px 25px rgba(11,31,58,.25)",
//             "&:hover": { bgcolor: "#07172B" },
//           }}
//         >
//           Login
//         </Button>
//       </Box>

//       <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
//         {/* Hero */}
//         <Grid container spacing={8} alignItems="center">
//           <Grid item xs={12} md={6}>
//             <Stack sx={{ animation: `${fadeUp} 0.8s ease both` }}>
//               <Chip
//                 icon={<VerifiedUserIcon />}
//                 label="Referral Based Trusted Community"
//                 sx={{
//                   bgcolor: softSaffron,
//                   color: navy,
//                   fontWeight: 900,
//                   mb: 2,
//                   border: `1px solid ${saffron}`,
//                   "& .MuiChip-icon": {
//                     color: saffron,
//                   },
//                 }}
//               />

//               <Typography
//                 variant="h2"
//                 fontWeight={900}
//                 sx={{
//                   fontSize: { xs: "2.4rem", sm: "3rem", md: "4.3rem" },
//                   lineHeight: 1.08,
//                   color: navy,
//                 }}
//               >
//                 Join Community
//               </Typography>

//               <Button
//                 variant="outlined"
//                 sx={{
//                   mt: 2.5,
//                   fontSize: { xs: "1rem", md: "1.12rem" },
//                   lineHeight: 1.9,
//                   color: navy,
//                   maxWidth: 560,
//                   opacity: 0.82,
//                 }}
//               >
//                 Learn More
//               </Button>
//             </Stack>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <Box
//               sx={{
//                 position: "relative",
//                 animation: `${float} 4s ease-in-out infinite`,
//               }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: { xs: 3, md: 4 },
//                   borderRadius: "36px",
//                   bgcolor: "#fff",
//                   border: "1px solid #DDE7F3",
//                   boxShadow: "0 30px 80px rgba(11,31,58,0.13)",
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     width: 190,
//                     height: 190,
//                     bgcolor: softSaffron,
//                     borderRadius: "50%",
//                     right: -60,
//                     top: -60,
//                   }}
//                 />

//                 <Box
//                   component="img"
//                   src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
//                   alt="travel community"
//                   sx={{
//                     width: "100%",
//                     maxWidth: 330,
//                     display: "block",
//                     mx: "auto",
//                     position: "relative",
//                     zIndex: 1,
//                   }}
//                 />

//                 <Stack spacing={2.5} mt={3} position="relative" zIndex={1}>
//                   <Paper
//                     elevation={0}
//                     sx={{
//                       p: 2.2,
//                       borderRadius: 4,
//                       bgcolor: "#F7FAFF",
//                       border: "1px solid #DDE7F3",
//                     }}
//                   >
//                     <Typography fontWeight={900} color={navy}>
//                       Safe Ride Match
//                     </Typography>
//                     <Typography fontSize={13} color={navy} sx={{ opacity: 0.75 }}>
//                       Connect with verified members before starting your trip.
//                     </Typography>
//                   </Paper>

//                   <Paper
//                     elevation={0}
//                     sx={{
//                       p: 2.2,
//                       borderRadius: 4,
//                       bgcolor: softSaffron,
//                       border: `1px solid ${saffron}`,
//                     }}
//                   >
//                     <Typography fontWeight={900} color={navy}>
//                       Community Approved
//                     </Typography>
//                     <Typography fontSize={13} color={navy} sx={{ opacity: 0.75 }}>
//                       Trust starts from referrals and member verification.
//                     </Typography>
//                   </Paper>
//                 </Stack>
//               </Paper>
//             </Box>
//           </Grid>
//         </Grid>

//         {/* Features */}
//         <Grid container spacing={9} mt={9}>
//           {features.map((item, index) => (
//             <Grid item xs={12} sm={6} md={6} key={item.title}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 4,
//                   minHeight: 230,
//                   height: "100%",
//                   borderRadius: 5,
//                   border: "1px solid #DDE7F3",
//                   bgcolor: "#fff",
//                   animation: `${fadeUp} .8s ease both`,
//                   animationDelay: `${index * 0.12}s`,
//                   transition: "0.3s ease",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "flex-start",
//                   "&:hover": {
//                     transform: "translateY(-10px)",
//                     boxShadow: "0 22px 55px rgba(11,31,58,.15)",
//                     borderColor: saffron,
//                   },
//                 }}
//               >
//                 <Box
//                   sx={{
//                     width: 58,
//                     height: 58,
//                     borderRadius: 3,
//                     bgcolor: softSaffron,
//                     color: saffron,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     mb: 2.5,
//                     "& svg": { fontSize: 30 },
//                   }}
//                 >
//                   {item.icon}
//                 </Box>

//                 <Typography fontWeight={900} color={navy} fontSize={20}>
//                   {item.title}
//                 </Typography>

//                 <Typography
//                   variant="body2"
//                   mt={1.3}
//                   lineHeight={1.8}
//                   sx={{ color: navy, opacity: 0.78 }}
//                 >
//                   {item.text}
//                 </Typography>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default Web;


// Web.jsx - Premium Travel Startup Landing Page
// Saathi - Your Travel Companion
// Fixed: responsive breakpoints, deprecated MUI APIs, alignment/spacing bugs,
// reduced-motion support, and mobile CTA/button consistency.

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
              gap: 1.5,
            }}
          >
            {/* Mobile Menu */}
            {/* {isMobile && (
              <IconButton
                onClick={onDrawerToggle}
                sx={{ color: "inherit" }}
              >
                <MenuIcon />
              </IconButton>
            )} */}

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "inherit",
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
              // background: scrolled
              //   ? "rgba(245,245,245,.9)"
              //   : "rgba(255,255,255,.12)",
              // backdropFilter: "blur(12px)",
              // border: scrolled
              //   ? "1px solid rgba(0,0,0,.08)"
              //   : "1px solid rgba(255,255,255,.18)",
            }}
          >
            {/* Notification */}
            <IconButton
              sx={{
                color: "inherit",
                // bgcolor: scrolled
                //   ? "#fff"
                //   : "rgba(255,255,255,.08)",
                // "&:hover": {
                //   bgcolor: scrolled
                //     ? "#f5f5f5"
                //     : "rgba(255,255,255,.18)",
                // },
              }}
            >
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Sign In */}
            <Button
              // onClick={onLoginOpen}
              onClick={() => navigate("/login")}
              variant={scrolled ? "contained" : "outlined"}
              size="small"
              sx={{
                borderRadius: "30px",
                px: { xs: 2, md: 3.5 },
                py: 0.3,
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
        backgroundImage: `url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop)`,
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
                    split costs,
                  </Box>{' '}
                  explore together.
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

          {/* Right: floating search card (hidden below md to avoid a squeezed layout) */}
          {/* {!isMobile && (
            <Grid item xs={12} md={5}>
              <Zoom in timeout={1100}>
                <Paper
                  elevation={10}
                  sx={{
                    p: 3.5,
                    borderRadius: '24px',
                    bgcolor: 'rgba(255,255,255,0.97)',
                    backdropFilter: 'blur(20px)',
                    animation: `${floatSlow} 7s ease-in-out infinite`,
                    boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} mb={3} color="text.primary">
                    Search Your Ride
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      placeholder="Leaving from..."
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#F7F5F2',
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      placeholder="Going to..."
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#F7F5F2',
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      defaultValue="2026-07-10"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon sx={{ color: 'info.main', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#F7F5F2',
                        },
                      }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{ py: 1.6, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', mt: 0.5 }}
                    >
                      Search Rides
                    </Button>
                  </Stack>
                </Paper>
              </Zoom>
            </Grid>
          )} */}
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
                    borderRadius: 4,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all .35s ease",
                    boxShadow: 3,

                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: 10,
                    },

                    "&:hover .dest-image": {
                      transform: "scale(1.1)",
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
      <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
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
            maxWidth: 650,
            // mx: "auto",
            lineHeight: 1.8,
            fontSize: {
              xs: "1rem",
              md: "1.15rem",
            },
            m: 2
          }}
        >
          Getting started with Saathi is simple. Find, book, and travel —
          all in one place.
        </Typography>
      </Box>

      {/* Cards */}
      <Grid container spacing={4} sx={{ display: "flex", justifyContent: "space-around" }}>
        {steps.map((step, index) => (
          <Grid item xs={12} sm={6} md={4} key={step.title}>
            <Fade in timeout={500 + index * 200}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 360,
                  p: 1.2,
                  borderRadius: 4,
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

// // ──────────────────────────────────────────────
// // Live Rides / Trips Section
// // ──────────────────────────────────────────────
// const liveTrips = [
//   {
//     id: 1,
//     driver: 'Rahul Sharma',
//     driverAvatar:
//       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&crop=face',
//     from: 'Mumbai',
//     to: 'Goa',
//     date: 'Jul 12',
//     time: '7:00 AM',
//     seats: 3,
//     price: '₹1,500',
//     rating: 4.8,
//     verified: true,
//     car: 'Honda City',
//     amenities: ['AC', 'Music', 'Snacks'],
//   },
//   {
//     id: 2,
//     driver: 'Priya Patel',
//     driverAvatar:
//       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop&crop=face',
//     from: 'Delhi',
//     to: 'Manali',
//     date: 'Jul 15',
//     time: '5:30 AM',
//     seats: 4,
//     price: '₹2,500',
//     rating: 4.9,
//     verified: true,
//     car: 'Innova Crysta',
//     amenities: ['Blankets', 'Hot Drinks', 'First Aid'],
//   },
//   {
//     id: 3,
//     driver: 'Amrit Singh',
//     driverAvatar:
//       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1970&auto=format&fit=crop&crop=face',
//     from: 'Chandigarh',
//     to: 'Amritsar',
//     date: 'Jul 18',
//     time: '8:00 AM',
//     seats: 2,
//     price: '₹800',
//     rating: 4.7,
//     verified: true,
//     car: 'Swift Dzire',
//     amenities: ['Water', 'Charging', 'Maps'],
//   },
//   {
//     id: 4,
//     driver: 'Ananya Nair',
//     driverAvatar:
//       'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&crop=face',
//     from: 'Chennai',
//     to: 'Kerala',
//     date: 'Jul 20',
//     time: '6:00 AM',
//     seats: 5,
//     price: '₹3,000',
//     rating: 4.9,
//     verified: true,
//     car: 'XUV 700',
//     amenities: ['AC', 'Music', 'Food Stops'],
//   },
// ];

// const LiveTripsSection = () => (
//   <Box sx={{ py: { xs: 8, md: 11 }, bgcolor: '#F7F5F2' }}>
//     <Container maxWidth="lg">
//       <Box textAlign="center" mb={7}>
//         <SectionBadge>Live Rides</SectionBadge>
//         <Typography variant="h2" fontWeight={800} mb={2}>
//           Available trips near you
//         </Typography>
//         <Typography
//           variant="body1"
//           color="text.secondary"
//           sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}
//         >
//           Real rides from verified drivers. Book now and start your next adventure.
//         </Typography>
//       </Box>

//       <Grid container spacing={3} alignItems="stretch">
//         {liveTrips.map((trip, index) => (
//           <Grid item xs={12} sm={6} lg={3} key={trip.id}>
//             <Slide direction="up" in timeout={400 + index * 120}>
//               <Card
//                 elevation={2}
//                 sx={{
//                   height: '100%',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   '&:hover': {
//                     transform: 'translateY(-6px)',
//                     boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
//                   },
//                 }}
//               >
//                 <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
//                   {/* Driver info */}
//                   <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
//                     <Badge
//                       overlap="circular"
//                       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                       badgeContent={
//                         trip.verified ? (
//                           <CheckCircleIcon
//                             sx={{ fontSize: 16, color: 'success.main', bgcolor: '#FFF', borderRadius: '50%' }}
//                           />
//                         ) : null
//                       }
//                     >
//                       <Avatar
//                         src={trip.driverAvatar}
//                         sx={{ width: 46, height: 46, border: '2px solid', borderColor: 'primary.main' }}
//                       />
//                     </Badge>
//                     <Box sx={{ minWidth: 0 }}>
//                       <Typography
//                         variant="subtitle2"
//                         fontWeight={700}
//                         noWrap
//                       >
//                         {trip.driver}
//                       </Typography>
//                       <Box display="flex" alignItems="center" gap={0.5}>
//                         <StarIcon sx={{ fontSize: 13, color: '#FFD700' }} />
//                         <Typography variant="caption" fontWeight={600} color="text.secondary">
//                           {trip.rating}
//                         </Typography>
//                         <Typography variant="caption" color="text.disabled" noWrap>
//                           · {trip.car}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Box>

//                   {/* Route */}
//                   <Box
//                     sx={{ bgcolor: '#F7F5F2', borderRadius: '12px', p: 1.8, mb: 2 }}
//                   >
//                     <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
//                       <Box sx={{ minWidth: 0 }}>
//                         <Typography variant="caption" color="text.disabled" fontWeight={700} display="block">
//                           FROM
//                         </Typography>
//                         <Typography variant="body2" fontWeight={700} noWrap>
//                           {trip.from}
//                         </Typography>
//                       </Box>
//                       <ArrowForwardIcon sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
//                       <Box sx={{ minWidth: 0, textAlign: 'right' }}>
//                         <Typography variant="caption" color="text.disabled" fontWeight={700} display="block">
//                           TO
//                         </Typography>
//                         <Typography variant="body2" fontWeight={700} noWrap>
//                           {trip.to}
//                         </Typography>
//                       </Box>
//                     </Stack>
//                   </Box>

//                   {/* Date / seats / price chips */}
//                   <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap mb={1.8}>
//                     <GradientChip
//                       icon={<CalendarIcon sx={{ fontSize: 12 }} />}
//                       label={`${trip.date} · ${trip.time}`}
//                     />
//                     <GradientChip
//                       icon={<PeopleIcon sx={{ fontSize: 12 }} />}
//                       label={`${trip.seats} seats`}
//                       color="secondary"
//                     />
//                     <GradientChip
//                       icon={<MoneyIcon sx={{ fontSize: 12 }} />}
//                       label={trip.price}
//                     />
//                   </Stack>

//                   {/* Amenities */}
//                   <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mb={2.5}>
//                     {trip.amenities.map((amenity) => (
//                       <Chip
//                         key={amenity}
//                         label={amenity}
//                         size="small"
//                         variant="outlined"
//                         sx={{ borderRadius: '8px', fontSize: '0.68rem', fontWeight: 500, height: 22 }}
//                       />
//                     ))}
//                   </Stack>

//                   <Box sx={{ mt: 'auto' }}>
//                     <Button
//                       fullWidth
//                       variant="contained"
//                       endIcon={<ArrowForwardIcon />}
//                       sx={{ py: 1.2, fontWeight: 700, fontSize: '0.9rem' }}
//                     >
//                       Book Seat
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Slide>
//           </Grid>
//         ))}
//       </Grid>

//       <Box textAlign="center" mt={6}>
//         <Button
//           variant="outlined"
//           size="large"
//           endIcon={<ArrowForwardIcon />}
//           sx={{
//             px: 5,
//             py: 1.4,
//             fontWeight: 700,
//             borderRadius: 50,
//             borderWidth: 2,
//             '&:hover': { borderWidth: 2 },
//           }}
//         >
//           View All Trips
//         </Button>
//       </Box>
//     </Container>
//   </Box>
// );

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
                  borderRadius: 4,
                  transition: "all .3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                  },
                  mt: 3
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

  <Box sx={{ p: 5 }}>
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h2" fontWeight={800} sx={{ mt: 2 }}>
        Travel with complete confidence
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: 'rgba(10, 10, 10, 0.72)', lineHeight: 2, m: 4, fontWeight: 700 }}
      >
        We've built industry-leading safety features so you can focus on enjoying the journey.
      </Typography>
    </Box>

    <Grid container spacing={5} sx={{ display: "flex", justifyContent: "space-evenly" }}>
      {safetyFeatures.map((step, index) => (
        <Grid item xs={12} sm={6} md={4} key={step.title}>
          <Fade in timeout={500 + index * 200}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 360,
                p: 1.4,
                borderRadius: 4,
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
const Footer = () => (
  <Box
    component="footer"
    sx={{
      bgcolor: '#0D1117',
      color: '#fff',
      pt: { xs: 7, md: 10 },
      pb: 4,
    }}
  >
    <Container maxWidth="lg">
      <Grid
        container
        spacing={{ xs: 5, md: 6 }}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        {/* Brand - LEFT */}
        <Grid
          item
          xs={12}
          sm={7}
          md={8}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', sm: 'flex-start' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: { xs: 56, md: 75 },
                height: { xs: 56, md: 75 },
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF6B35, #FF9F1C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                flexShrink: 0,
              }}
            >
              S
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" fontWeight={800}>
                Saathi
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#fa7406',
                  maxWidth: 360,
                  lineHeight: 1.7,
                  mt: 0.5,
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                }}
              >
                India&rsquo;s most trusted travel companion platform. Connect,
                share rides, split costs, and explore together with verified
                travelers.
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            {[InstagramIcon, FacebookIcon, TwitterIcon, YouTubeIcon].map(
              (Icon, i) => (
                <IconButton
                  key={i}
                  size="small"
                  sx={{
                    width: 36,
                    height: 36,
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    transition: '0.2s',
                    '&:hover': {
                      color: '#FF6B35',
                      borderColor: '#FF6B35',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              )
            )}
          </Stack>
        </Grid>

        {/* Contact - RIGHT */}
        <Grid
          item
          xs={12}
          sm={5}
          md={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', sm: 'flex-end' },
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2.5 }}>
            Contact
          </Typography>

          <Stack spacing={2}>
            {[
              { Icon: PhoneIcon, text: '+91 98765 43210' },
              { Icon: EmailIcon, text: 'hello@saathi.com' },
              { Icon: LocationIcon, text: 'Bangalore, India' },
            ].map(({ Icon, text }) => (
              <Stack
                key={text}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  flexDirection: { xs: 'row', sm: 'row-reverse' },
                }}
              >
                <Icon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}
                >
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.08)' }} />

      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent={{ xs: 'center', sm: 'space-between' }}
        alignItems="center"
        gap={2}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          © 2026 Saathi Technologies Pvt Ltd
        </Typography>

        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          Made with ❤️ in India
        </Typography>
      </Box>
    </Container>
  </Box>
);

// // ──────────────────────────────────────────────
// // Login Modal
// // ──────────────────────────────────────────────
// const LoginModal = ({ open, onClose }) => {
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       onClose();
//     }, 1500);
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="xs"
//       fullWidth
//       PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', m: { xs: 2, sm: 3 } } }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)',
//           p: { xs: 3.5, sm: 4 },
//           textAlign: 'center',
//           color: '#FFF',
//         }}
//       >
//         <Box
//           sx={{
//             width: 52,
//             height: 52,
//             borderRadius: '14px',
//             bgcolor: 'rgba(255,255,255,0.22)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             mx: 'auto',
//             mb: 2,
//             fontSize: '1.5rem',
//             fontWeight: 800,
//           }}
//         >
//           S
//         </Box>
//         <Typography variant="h5" fontWeight={800}>
//           Welcome Back
//         </Typography>
//         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.80)', mt: 0.5 }}>
//           Sign in to continue your journey
//         </Typography>
//       </Box>

//       {/* Form */}
//       <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
//         <Stack spacing={2.5}>
//           <TextField
//             fullWidth
//             label="Email Address"
//             variant="outlined"
//             placeholder="you@example.com"
//             size="small"
//           />
//           <TextField
//             fullWidth
//             label="Password"
//             type="password"
//             variant="outlined"
//             placeholder="••••••••"
//             size="small"
//           />
//           <Typography
//             variant="body2"
//             color="primary"
//             sx={{
//               cursor: 'pointer',
//               textAlign: 'right',
//               fontWeight: 600,
//               '&:hover': { textDecoration: 'underline' },
//             }}
//           >
//             Forgot Password?
//           </Typography>
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{ p: { xs: 3, sm: 4 }, pt: 0, flexDirection: 'column', gap: 1.5 }}>
//         <Button
//           fullWidth
//           variant="contained"
//           size="large"
//           onClick={handleSubmit}
//           disabled={loading}
//           sx={{ py: 1.6, fontWeight: 700, fontSize: '1rem', borderRadius: '12px' }}
//         >
//           {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
//         </Button>
//         <Typography variant="body2" color="text.secondary" textAlign="center">
//           Don't have an account?{' '}
//           <Box component="span" color="primary.main" fontWeight={700} sx={{ cursor: 'pointer' }}>
//             Sign Up
//           </Box>
//         </Typography>
//       </DialogActions>
//     </Dialog>
//   );
// };

// ──────────────────────────────────────────────
// Mobile Drawer
// ──────────────────────────────────────────────
// const MobileDrawer = ({ open, onClose, onLoginOpen }) => (
//   <Drawer anchor="left" open={open} onClose={onClose}>
//     <Box sx={{ width: 270, height: '100%', display: 'flex', flexDirection: 'column' }}>
//       {/* Header */}
//       <Box
//         sx={{
//           p: 3,
//           background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F1C 100%)',
//           color: '#FFF',
//         }}
//       >
//         <Box display="flex" alignItems="center" gap={1.5} mb={0.8}>
//           <Box
//             sx={{
//               width: 38,
//               height: 38,
//               borderRadius: '11px',
//               bgcolor: 'rgba(255,255,255,0.22)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               fontWeight: 800,
//               fontSize: '1.05rem',
//               flexShrink: 0,
//             }}
//           >
//             S
//           </Box>
//           <Typography variant="h5" fontWeight={800}>
//             Saathi
//           </Typography>
//         </Box>
//         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
//           Your Travel Companion
//         </Typography>
//       </Box>

//       {/* Nav items — ListItemButton replaces the deprecated `<ListItem button>` API */}
//       <List sx={{ py: 1.5, flexGrow: 1 }}>
//         {[
//           { label: 'Discover Rides', icon: <SearchIcon /> },
//           { label: 'Offer a Ride', icon: <CarIcon /> },
//           { label: 'How It Works', icon: <RouteIcon /> },
//           { label: 'Community', icon: <GroupIcon /> },
//           { label: 'Safety', icon: <ShieldIcon /> },
//         ].map((item) => (
//           <ListItemButton
//             key={item.label}
//             sx={{ px: 3, py: 1.4, '&:hover': { bgcolor: 'rgba(255,107,53,0.06)' } }}
//             onClick={onClose}
//           >
//             <ListItemIcon sx={{ minWidth: 38, color: 'primary.main' }}>{item.icon}</ListItemIcon>
//             <ListItemText
//               primary={item.label}
//               primaryTypographyProps={{ fontWeight: 600, fontSize: '0.95rem' }}
//             />
//           </ListItemButton>
//         ))}
//         <Divider sx={{ my: 1.5 }} />
//         <ListItemButton
//           sx={{ px: 3, py: 1.4, '&:hover': { bgcolor: 'rgba(255,107,53,0.06)' } }}
//           onClick={() => { onClose(); onLoginOpen(); }}
//         >
//           <ListItemText
//             primary="Sign In"
//             primaryTypographyProps={{ fontWeight: 700, color: 'primary.main', fontSize: '0.95rem' }}
//           />
//         </ListItemButton>
//       </List>
//     </Box>
//   </Drawer>
// );

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

  // const handleLoginOpen = useCallback(() => {
  //   setLoginOpen(true);
  //   setSnackbarOpen(true);
  // }, []);

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
        {/* <MobileDrawer open={drawerOpen} onClose={handleDrawerToggle} onLoginOpen={handleLoginOpen} /> */}

        <HeroSection onSearchClick={handleSearchClick} />
        <TrustStrip />

        <Box ref={searchRef}>
          <DestinationsSection />
        </Box>

        <HowItWorksSection />
        {/* <LiveTripsSection /> */}
        <SafetySection />
        <TestimonialsSection />
        <CTASection />
        <Footer />

        {/* <LoginModal open={loginOpen} onClose={handleLoginClose} /> */}
        {/* 
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity="success"
            variant="filled"
            onClose={() => setSnackbarOpen(false)}
            sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem' }}
          >
            🎉 Welcome to Saathi! Your journey starts here.
          </Alert>
        </Snackbar> */}

        {/* Back to top FAB */}
        {/* <Zoom in={scrolled}>
          <Fab
            color="primary"
            size="medium"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            sx={{
              position: 'fixed',
              bottom: { xs: 20, md: 28 },
              right: { xs: 20, md: 28 },
              zIndex: 10,
              animation: scrolled ? `${breathe} 2.2s ease-in-out infinite` : 'none',
            }}
          >
            <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)' }} />
          </Fab>
        </Zoom> */}
      </Box>
    </ThemeProvider>
  );
};

export default Web;