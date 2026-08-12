import React, { useEffect, useState } from "react";
import { Box, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./web/theme";

import Navbar from "./web/Navbar";

// Active sections
import Family from "./web/Family";
import Hero from "./web/Hero";
import HowItWorks from "./web/HowItWorks";
import WhyReferrals from "./web/WhyRefferals";
import Footers from "./web/Footer";

// ──────────────────────────────────────────────
// Reduced Motion Styles
// ──────────────────────────────────────────────
const reducedMotionStyles = {
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": {
      animationDuration: "0.01ms !important",
      animationIterationCount: "1 !important",
      transitionDuration: "0.01ms !important",
      scrollBehavior: "auto !important",
    },
  },
};

// ──────────────────────────────────────────────
// Main Web Component
// ──────────────────────────────────────────────
const Web = () => {
  const [scrolled, setScrolled] = useState(false);

  // ────────────────────────────────────────────
  // Detect page scroll
  // ────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={reducedMotionStyles} />

      <Box
        sx={{
          bgcolor: "background.default",
          overflowX: "hidden",
          minHeight: "100vh",
        }}
      >
        {/* Navbar */}
        <Navbar scrolled={scrolled} />

        {/* ──────────────────────────────────────
            Main Website Sections
        ────────────────────────────────────── */}

        <Hero />

        <HowItWorks />

        <WhyReferrals />

        <Family />

        <Footers />
      </Box>
    </ThemeProvider>
  );
};

export default Web;