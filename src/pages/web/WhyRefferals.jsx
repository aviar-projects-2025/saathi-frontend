import React from 'react';
import { Box, Container, Grid, Typography, Stack, Divider } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { colors } from './theme';

const pillars = [
    { icon: GroupRoundedIcon, label: 'Stronger\nConnections' },
    { icon: ShieldRoundedIcon, label: 'More\nAccountability' },
    { icon: LockRoundedIcon, label: 'Safer\nJourneys' },
    { icon: FavoriteBorderRoundedIcon, label: 'Peace of Mind\nfor Families' },
];

export default function WhyReferrals() {
    return (
        <Box sx={{ bgcolor: '#F7FAFD', py: { xs: 4, md: 5 } }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        bgcolor: colors.navy || '#0B1F44',
                        color: '#fff',
                        borderRadius: '18px',
                        px: { xs: 3, md: 5 },
                        py: { xs: 4, md: 4 },
                    }}
                >
                    <Grid container spacing={{ xs: 4, md: 3 }} alignItems="center">
                        {/* Left: heading + copy */}
                        <Grid item xs={12} md={5.5}>
                            <Typography
                                sx={{
                                    fontSize: { xs: 22, md: 26 },
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    mb: 1.5,
                                }}
                            >
                                Why Referral Only?
                            </Typography>
                            <Typography
                                sx={{
                                    color: 'rgba(255,255,255,0.75)',
                                    fontSize: 13,
                                    lineHeight: 1.7,
                                    maxWidth: 500,
                                }}
                            >
                                Every Saathi member starts with a connection to someone already in the community.
                                Combined with real profiles, referrer approval, and complete information, this
                                creates greater accountability and helps us build a more trusted community.
                            </Typography>
                        </Grid>

                        {/* Right: 4 icon pillars */}
                        <Grid item xs={12} md={6.5}>
                            <Stack
                                direction="row"
                                divider={
                                    <Divider
                                        orientation="vertical"
                                        flexItem
                                        sx={{
                                            borderColor: "rgba(255,255,255,0.2)",
                                            my: 1,
                                        }}
                                    />
                                }
                                spacing={2}
                                sx={{ width: "100%" }}
                            >
                                {pillars.map(({ icon: Icon, label }) => (
                                    <Box
                                        key={label}
                                        sx={{
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            textAlign: "center",
                                            px: { xs: 1, sm: 1.5, md: 2 },
                                        }}
                                    >
                                        <Stack
                                            spacing={2}
                                            sx={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            <Icon
                                                sx={{
                                                    fontSize: { xs: 24, sm: 26, md: 28 },
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontSize: { xs: 12, sm: 12.5, md: 13 },
                                                    fontWeight: 600,
                                                    lineHeight: 1.3,
                                                    letterSpacing: "0.1px",
                                                    whiteSpace: "pre-line",
                                                    textAlign: "center",
                                                    color: "inherit",
                                                    width: "100%",
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}