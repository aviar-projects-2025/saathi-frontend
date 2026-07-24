import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, GlobalStyles } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import WebNavbar from './webPage/WebNavbar';
import TrustStrip from './webPage/TrustStrip';
import HeroSection from './webPage/HeroSection';
import HowItWorksSection from './webPage/HowItWorksSection';
import DestinationsSection from './webPage/DestinationsSection';
import CTASection from './webPage/CTASection';
import Footer from './webPage/Footer';
import TestimonialsSection from './webPage/TestimonialsSection';
import SafetySection from './webPage/SafetySection';

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
// Main Web Component
// ──────────────────────────────────────────────
const Web = () => {
  const [scrolled, setScrolled] = useState(false);
  // const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // const handleDrawerToggle = useCallback(() => setDrawerOpen((prev) => !prev), []);

  const handleSearchClick = useCallback(() => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={reducedMotionStyles} />
      <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>
        <WebNavbar
          scrolled={scrolled}
        // drawerOpen={drawerOpen}
        // onDrawerToggle={handleDrawerToggle}
        />

        <Box ref={searchRef}>
          <HeroSection />
        </Box>

        <TrustStrip />
        <DestinationsSection />
        <HowItWorksSection />
        <SafetySection />
        <TestimonialsSection />
        <CTASection onSearchClick={handleSearchClick} />
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Web;