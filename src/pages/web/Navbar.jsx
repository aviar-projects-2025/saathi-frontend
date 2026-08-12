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
                                    color: "inherit",
                                    fontSize: { xs: "1.3rem", md: "1.8rem" },
                                    lineHeight: 1,
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
                                borderColor: scrolled
                                    ? colors.navy
                                    : 'rgba(255,255,255,.8)',
                                color: '#fff',
                                '&:hover': {
                                    borderWidth: '2px',
                                    bgcolor: scrolled
                                        ? colors.navyDark
                                        : 'rgba(255,255,255,.15)',
                                    borderColor: scrolled
                                        ? colors.navyDark
                                        : 'rgba(255,255,255,.8)',
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