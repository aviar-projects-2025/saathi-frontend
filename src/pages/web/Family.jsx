import React from "react";
import { Box, Container, Grid, Typography, Stack } from "@mui/material";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { colors } from "./theme";

export default function Family() {
    return (
        <Box
            sx={{
                bgcolor: "#fff",
                py: { xs: 4, sm: 5, md: 6 },
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        bgcolor: colors.skyLight,
                        borderRadius: { xs: 3, md: 4 },
                        overflow: "hidden",
                        width: "100%",
                    }}
                >
                    <Grid
                        container
                        alignItems="center"
                        justifyContent="center"
                    >
                        {/* Image */}
                        <Grid item xs={12} md={4}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=800&auto=format&fit=crop"
                                alt="An Indian family together outdoors, smiling"
                                sx={{
                                    width: "100%",
                                    height: { xs: 210, sm: 230, md: 240 },
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        </Grid>

                        {/* Content */}
                        <Grid item xs={12} md={5}>
                            <Box
                                sx={{
                                    px: { xs: 3, sm: 4, md: 4.5 },
                                    py: { xs: 3.5, sm: 4, md: 3 },
                                    textAlign: { xs: "center", md: "left" },
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: {
                                            xs: "1.3rem",
                                            sm: "1.4rem",
                                            md: "1.5rem",
                                        },
                                        lineHeight: 1.3,
                                        fontWeight: 700,
                                        color: colors.navy,
                                    }}
                                >
                                    For you. For your loved ones.
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: { xs: 1.5, md: 1.25 },
                                        color: colors.textSecondary,
                                        fontSize: {
                                            xs: "0.82rem",
                                            sm: "0.875rem",
                                            md: "0.9rem",
                                        },
                                        lineHeight: 1.65,
                                        maxWidth: 440,
                                        mx: { xs: "auto", md: 0 },
                                    }}
                                >
                                    Saathi helps you share rides with trusted community members
                                    and find reliable travel companions for your parents and
                                    family between the USA and India.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* USA ↔ India Graphic */}
                        <Grid item xs={12} md={3}>
                            <Stack
                                direction="row"
                                spacing={{ xs: 1.5, sm: 2 }}
                                sx={{
                                    py: { xs: 2.5, sm: 3, md: 0 },
                                    pr: { md: 3 },
                                    minHeight: { md: 150 },
                                    width: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {/* Flight Icon */}
                                <FlightRoundedIcon
                                    sx={{
                                        fontSize: { xs: 24, sm: 27, md: 30 },
                                        color: colors.navy,
                                        transform: "rotate(45deg)",
                                        flexShrink: 0,
                                    }}
                                />

                                {/* Globe + Location Pins */}
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: { xs: 68, sm: 74, md: 80 },
                                        height: { xs: 68, sm: 74, md: 80 },
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <PublicRoundedIcon
                                        sx={{
                                            fontSize: { xs: 68, sm: 74, md: 80 },
                                            color: "#8FB6DD",
                                        }}
                                    />

                                    {/* India */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: { xs: -8, md: -10 },
                                            left: { xs: -12, md: -15 },
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            zIndex: 2,
                                        }}
                                    >
                                        <LocationOnRoundedIcon
                                            sx={{
                                                fontSize: { xs: 20, md: 23 },
                                                color: "#2C5FAE",
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: { xs: 7, sm: 8, md: 9 },
                                                fontWeight: 700,
                                                color: colors.navy,
                                                lineHeight: 1,
                                                mt: 0.5,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Delhi, IN
                                        </Typography>
                                    </Box>

                                    {/* Dallas, USA */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: { xs: -8, md: -10 },
                                            right: { xs: -20, md: -24 },
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            zIndex: 2,
                                        }}
                                    >
                                        <LocationOnRoundedIcon
                                            sx={{
                                                fontSize: { xs: 20, md: 23 },
                                                color: colors.orange,
                                            }}
                                        />

                                        <Typography
                                            sx={{
                                                fontSize: { xs: 7, sm: 8, md: 9 },
                                                fontWeight: 700,
                                                color: colors.navy,
                                                lineHeight: 1,
                                                mt: 0.5,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Dallas, USA
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}