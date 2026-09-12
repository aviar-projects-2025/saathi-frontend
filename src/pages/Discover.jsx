import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Divider, Button, Grid, Skeleton, Avatar } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import axios from "axios";
import Api from "../Api.jsx";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import HistoryIcon from "@mui/icons-material/History";
import ProfileModal from "./Avatar.jsx";



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



const Discover = () => {
    const [topMembers, setTopMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

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
                    profileImage: rider.profileImage,
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

                                    <Avatar
                                        src={member?.profileImage || ""}
                                        alt={`${member?.name || ""}`}
                                        onClick={() => {
                                            setSelectedProfile(member);
                                            setProfileModalOpen(true);
                                        }}
                                        sx={{
                                            color: "#FF9933",
                                            bgcolor: "#FFF3E0",
                                            fontWeight: 800,
                                            flexShrink: 0,
                                            mt: { xs: 0.4, sm: 0.5 },
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",

                                            "&:hover": {
                                                transform: "scale(1.08)",
                                                boxShadow: "0 0 0 3px rgba(255, 153, 51, 0.3)",
                                            },
                                        }}
                                    >

                                        {`${member?.name?.[0]}`}
                                    </Avatar>

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

                    <ProfileModal
                        open={profileModalOpen}
                        selectedProfile={selectedProfile}
                        onClose={() => {
                            setProfileModalOpen(false);
                        }}
                    />

                </Grid>
            </Grid>
        </Box>
    );
};

export default Discover;