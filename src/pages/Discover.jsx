import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, Button, Grid, Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";
import Api from "../Api.jsx";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import HistoryIcon from "@mui/icons-material/History";



const activities = [
    { text: "Vijay P. gave a free temple ride to 4 members", time: "2h ago", icon: "🛕" },
    { text: "Deepa I. helped Neel K.'s parents from the airport", time: "5h ago", icon: "✈️" },
    { text: "Rahul S. completed his 34th community ride!", time: "1d ago", icon: "🎉" },
    { text: "3 new members joined from Houston", time: "2d ago", icon: "👋" },
    { text: "Sunita M. got 5 ride offers for her family trip", time: "3d ago", icon: "🙏" },
];

const getInitials = (firstName = "", lastName = "") =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const getBadge = (rank) => {
    if (rank === 0) return "🏅 Founding member";
    if (rank === 1) return "⭐ Community elder";
    return null;
};

// Simple avatar
const UserAvatar = ({ initials, verified }) => (
    <Box
        sx={{
            width: { xs: 34, sm: 40 },
            height: { xs: 34, sm: 40 },
            flexShrink: 0,
            borderRadius: "50%",
            background: "#FFE8D6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: { xs: 12, sm: 14 },
            position: "relative",
        }}
    >
        {initials}
        {verified && (
            <Box
                sx={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    background: "#2196f3",
                    color: "#fff",
                    borderRadius: "50%",
                    width: { xs: 12, sm: 14 },
                    height: { xs: 12, sm: 14 },
                    fontSize: { xs: 8, sm: 10 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                ✓
            </Box>
        )}
    </Box>
);

const Discover = () => {
    const [topMembers, setTopMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const fetchTopRiders = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${Api}/users/top-riders`);
                const riders = res.data?.data || [];
                const formatted = riders.map((rider, index) => ({
                    name: `${rider.firstName} ${rider.lastName}`,
                    initials: getInitials(rider.firstName, rider.lastName),
                    rides: rider.completedRideCount,
                    // city: rider.city || "",
                    badge: getBadge(index),
                    verified: rider.isVerified,
                }));

                setTopMembers(formatted);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopRiders();
    }, []);

    return (
        <Box sx={{
            minHeight: "100vh",
            pb: { xs: 4, sm: 0 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowX: "hidden",
            px: { xs: 1, sm: 2, md: 0 }
        }}>
            {isMobile && (
                <Typography variant="h5" fontWeight={800} sx={{ color: '#E8650A', mb: 2, mt: 1, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                    Saathi <span style={{ color: '#138808' }}>Community Members</span>
                </Typography>)}

            <Grid spacing={{ xs: 2, md: 2 }} sx={{ mt: { xs: 1, sm: 0 } }}>

                {/* TOP MEMBERS */}
                <Grid item xs={12} md={7} sx={{ mb: { xs: 1, sm: 3 } }} >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 1.5, sm: 2.5 },
                            borderRadius: 3,
                            border: "1px solid #F0E6DC",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <EmojiEventsIcon sx={{ color: "#F4A261", fontSize: { xs: 20, sm: 24 } }} />
                            <Typography fontWeight={700} fontSize={{ xs: "0.9rem", sm: "1rem" }}>
                                Top Community Members
                            </Typography>
                        </Box>

                        {loading && (
                            <Box>
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} height={56} sx={{ mb: 0.5 }} />
                                ))}
                            </Box>
                        )}

                        {!loading && error && (
                            <Typography color="error" fontSize={{ xs: 12, sm: 14 }}>
                                Failed to load top members: {error}
                            </Typography>
                        )}

                        {!loading && !error && topMembers.length === 0 && (
                            <Typography color="text.secondary" fontSize={{ xs: 12, sm: 14 }}>
                                No completed rides yet. Be the first!
                            </Typography>
                        )}

                        {!loading && !error && topMembers.map((member, index) => (
                            <Box key={member.name}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: { xs: 1, sm: 1.5 },
                                        py: 1.2,
                                        flexWrap: "nowrap",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            width: { xs: 16, sm: 20 },
                                            flexShrink: 0,
                                            fontWeight: 800,
                                            color: "text.secondary",
                                            fontSize: { xs: 12, sm: 14 },
                                        }}
                                    >
                                        {index + 1}
                                    </Typography>

                                    <UserAvatar initials={member.initials} verified={member.verified} />

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            fontWeight={600}
                                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {member.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {member.city}
                                        </Typography>
                                        {member.badge && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    color: "#E8650A",
                                                    fontWeight: 600,
                                                    fontSize: { xs: 10, sm: 12 },
                                                }}
                                            >
                                                {member.badge}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box textAlign="right" sx={{ flexShrink: 0, pl: 1 }}>
                                        <Typography fontWeight={700} color="primary.main" fontSize={{ xs: 13, sm: 15 }}>
                                            {member.rides}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontSize={{ xs: 10, sm: 12 }}>
                                            rides
                                        </Typography>
                                    </Box>
                                </Box>

                                {index !== topMembers.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* ACTIVITY + INVITE */}
                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 1.5, sm: 2.5 },
                            borderRadius: 3,
                            border: "1px solid #F0E6DC",
                            mb: 2,
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <HistoryIcon sx={{ color: "#F4A261", fontSize: { xs: 23, sm: 26 } }} />
                            <Typography fontWeight={700}
                                sx={{ fontSize: { xs: "1.05rem", sm: "1.2em" } }} >
                                Recent Activity
                            </Typography>
                        </Box>


                        {activities.map((a, index) => (
                            <Box key={index} sx={{ display: "flex", gap: 1.2, mb: 1.5 }}>
                                <Typography fontSize={{ xs: 16, sm: 18 }} sx={{ flexShrink: 0 }}>
                                    {a.icon}
                                </Typography>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontSize={{ xs: 12, sm: 14 }}>
                                        {a.text}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {a.time}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Paper>

                    {/* INVITE */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 1.5, sm: 2.5 },
                            borderRadius: 3,
                            background: "linear-gradient(135deg, #E8650A, #FF8C42)",
                            color: "#fff",
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                        }}
                    >
                        <Typography fontWeight={800} mb={1} fontSize={{ xs: "0.9rem", sm: "1rem" }}>
                            Invite a friend 🙏
                        </Typography>
                        <Typography variant="body2" fontSize={{ xs: 12, sm: 14 }} sx={{ opacity: 0.9, mb: 2 }}>
                            Saathi grows through trust. Invite someone from your community to join.
                        </Typography>
                        <Box sx={{
                            display: "flex",
                            justifyContent: { sm: "flex-end" }
                        }}>
                            <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                sx={{
                                    background: "#fff",
                                    color: "#E8650A",
                                    fontWeight: 700,
                                    maxWidth: { xs: "100%", sm: "fit-content" },
                                    "&:hover": { background: "#FFF8F2" },
                                }}
                            >
                                Share invite link
                            </Button>
                        </Box>

                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default Discover;