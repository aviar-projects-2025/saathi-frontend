import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SaathiLogo from '../../assets/saathilogo.png';
import { colors } from './theme';

// ──────────────────────────────────────────────
// Navbar Component
// ──────────────────────────────────────────────
const Navbar = ({ scrolled }) => {
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
                        minHeight: scrolled
                            ? { xs: 44, md: 56 }   // compact once scrolled
                            : { xs: 50, md: 72 },  // full height at top
                        px: { xs: 0, sm: 2 },
                        py: scrolled ? 0.5 : 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all .35s ease',
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
                                width: scrolled
                                    ? { xs: 26, md: 30 }
                                    : { xs: 30, md: 35 },
                                height: scrolled
                                    ? { xs: 26, md: 30 }
                                    : { xs: 30, md: 35 },
                                bgcolor: "transparent",
                                transition: 'all .35s ease',
                            }}
                        />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                lineHeight: 1,
                            }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 900,
                                    letterSpacing: "-0.03em",
                                    color: "#0B2350",
                                    fontSize: scrolled
                                        ? { xs: "1.1rem", md: "1.5rem" }
                                        : { xs: "1.3rem", md: "1.8rem" },
                                    lineHeight: 1,
                                    transition: 'all .35s ease',
                                }}
                            >
                                Saathi
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color: colors.orange,
                                    fontWeight: 600,
                                    letterSpacing: 0.3,
                                    fontSize: { xs: "0.55rem", md: "0.65rem" },
                                    lineHeight: 1.2,
                                    mt: 0.4,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Travel Together. Arrive Together.
                            </Typography>

                        </Box>
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

                                // Normal state
                                borderColor: colors.navy,
                                color: scrolled ? '#fff' : colors.navy,
                                bgcolor: scrolled ? colors.navy : 'transparent',

                                '&:hover': {
                                    borderWidth: '2px',
                                    borderColor: colors.navy,
                                    bgcolor: colors.navy,
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

export default Navbar;