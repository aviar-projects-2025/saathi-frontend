import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, Button, Grid, Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";
import Api from "../Api.jsx";
// Static for now — hook this up to a real activity feed endpoint later if needed
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
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "#FFE8D6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
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
                    width: 14,
                    height: 14,
                    fontSize: 10,
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

    useEffect(() => {
        const fetchTopRiders = async () => {
            try {
                setLoading(true);
                console.log("@@@@@@@@")
                const res = await axios.get(`${Api}/users/top-riders?limit=`);
                console.log("resvbnm",res)
                const riders = res.data?.data || [];
  
                const formatted = riders.map((rider, index) => ({
                    name: `${rider.firstName} ${rider.lastName}`,
                    initials: getInitials(rider.firstName, rider.lastName),
                    rides: rider.completedRideCount,
                    city: rider.city || "",
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
            boxSizing: "border-box",
            maxWidth: { xs: '100%', sm: 0 },
            px: { xs: 1, sm: 0 }
        }}>
            <Grid sx={{ mt: 3 }}>

                {/* TOP MEMBERS */}
                <Grid item xs={12} md={7} sx={{ mb: 3 }}>
                    <Paper
                        elevation={0}
                        sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: "1px solid #F0E6DC" }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <EmojiEventsIcon sx={{ color: "#F4A261" }} />
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
                            <Typography color="error" fontSize={14}>
                                Failed to load top members: {error}
                            </Typography>
                        )}

                        {!loading && !error && topMembers.length === 0 && (
                            <Typography color="text.secondary" fontSize={14}>
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
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            width: 20,
                                            fontWeight: 800,
                                            color: "text.secondary",
                                            fontSize: { xs: 12, sm: 14 },
                                        }}
                                    >
                                        {index + 1}
                                    </Typography>

                                    <UserAvatar initials={member.initials} verified={member.verified} />

                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={600} fontSize={{ xs: "0.8rem", sm: "0.9rem" }}>
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

                                    <Box textAlign="right">
                                        <Typography fontWeight={700} color="primary.main" fontSize={{ xs: 13, sm: 15 }}>
                                            {member.rides}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
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
                        sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3, border: "1px solid #F0E6DC", mb: 2 }}
                    >
                        <Typography fontWeight={700} mb={2}>
                            Recent Activity
                        </Typography>

                        {activities.map((a, index) => (
                            <Box key={index} sx={{ display: "flex", gap: 1.2, mb: 1.5 }}>
                                <Typography fontSize={18}>{a.icon}</Typography>
                                <Box>
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
                            p: 2.5,
                            borderRadius: 3,
                            background: "linear-gradient(135deg, #E8650A, #FF8C42)",
                            color: "#fff",
                        }}
                    >
                        <Typography fontWeight={800} mb={1}>
                            Invite a friend 🙏
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                            Saathi grows through trust. Invite someone from your community to join.
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            sx={{
                                background: "#fff",
                                color: "#E8650A",
                                fontWeight: 700,
                                "&:hover": { background: "#FFF8F2" },
                            }}
                        >
                            Share invite link
                        </Button>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default Discover;