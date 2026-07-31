import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SaathiLogo from '../../assets/saathilogo.png';

// ──────────────────────────────────────────────
// Navbar Component
// ──────────────────────────────────────────────
const WebNavbar = ({ scrolled }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={scrolled ? 3 : 0}
      sx={{
        background: scrolled
          ? 'rgba(255,255,255,0.96)'
          : 'transparent',
        backdropFilter: scrolled
          ? 'blur(20px) saturate(180%)'
          : 'none',
        color: scrolled ? 'text.primary' : '#fff',
        transition: 'all .35s ease',
        borderBottom: scrolled
          ? '1px solid rgba(0,0,0,.08)'
          : '1px solid transparent',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 50, md: 72 },
            px: { xs: 0, sm: 2 },
            py: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {/* {isMobile && (
              <IconButton
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={drawerOpen}
                onClick={onDrawerToggle}
                sx={{ color: 'inherit', mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )} */}

            <Avatar
              src={SaathiLogo}
              alt="Saathi"
              sx={{
                width: { xs: 30, md: 35 },
                height: { xs: 30, md: 35 },
                bgcolor: 'transparent',
              }}
            />

            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: 'inherit',
                fontSize: { xs: '1.3rem', md: '1.8rem' },
              }}
            >
              Saathi
            </Typography>
          </Box>

          {/* Right Side */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1,
              py: 0.5,
              borderRadius: '50px',
            }}
          >
            {/* Sign In */}
            <Button
              onClick={() => navigate('/login')}
              variant={scrolled ? 'contained' : 'outlined'}
              size="small"
              sx={{
                borderRadius: '30px',
                px: { xs: 2, md: 4 },
                py: 0.5,
                fontWeight: 700,
                textTransform: 'none',
                borderWidth: '2px',
                borderColor: scrolled
                  ? 'primary.main'
                  : 'rgba(255,255,255,.8)',
                color: '#fff',
                '&:hover': {
                  borderWidth: '2px',
                  bgcolor: scrolled
                    ? 'primary.main'
                    : 'rgba(255,255,255,.15)',
                  color: '#fff',
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

export default WebNavbar;