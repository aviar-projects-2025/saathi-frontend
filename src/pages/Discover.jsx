import React from "react";
import { Box, Paper, Typography, Divider, Button } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

// Data
const topMembers = [
    { name: "Vijay Patel", initials: "VP", rides: 67, city: "Frisco", badge: "🏅 Founding member", verified: true },
    { name: "Deepa Iyer", initials: "DI", rides: 42, city: "Plano", badge: "⭐ Community elder", verified: true },
    { name: "Rahul Sharma", initials: "RS", rides: 34, city: "Dallas", badge: null, verified: true },
    { name: "Ananya Krishnan", initials: "AK", rides: 18, city: "Houston", badge: null, verified: true },
    { name: "Sunita Mehta", initials: "SM", rides: 12, city: "Chicago", badge: null, verified: false },
];

const activities = [
    { text: "Vijay P. gave a free temple ride to 4 members", time: "2h ago", icon: "🛕" },
    { text: "Deepa I. helped Neel K.'s parents from the airport", time: "5h ago", icon: "✈️" },
    { text: "Rahul S. completed his 34th community ride!", time: "1d ago", icon: "🎉" },
    { text: "3 new members joined from Houston", time: "2d ago", icon: "👋" },
    { text: "Sunita M. got 5 ride offers for her family trip", time: "3d ago", icon: "🙏" },
];

const CQ = "discoverRoot";
const cq = (minWidth) => `@container ${CQ} (min-width: ${minWidth}px)`;

// Simple avatar
const UserAvatar = ({ initials, verified }) => (
    <Box
        sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            background: "#FFE8D6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 12,
            position: "relative",
            [cq(420)]: { width: 40, height: 40, fontSize: 14 },
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

const Discover = () => (
    <Box
        sx={{
            containerType: "inline-size",
            containerName: CQ,
            minHeight: "100vh",
            // pb: 3,
            px: 1.5,
            width: "100%",
            boxSizing: "border-box",
            [cq(700)]: { px: 3 },
        }}
    >
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                // mt: 1,
                [cq(700)]: { gap: 3, mt: 3 },
                [cq(800)]: { flexDirection: "row", alignItems: "flex-start" },
            }}
        >
            {/* TOP MEMBERS */}
            <Box sx={{ width: "100%", [cq(800)]: { flex: "1 1 58%", minWidth: 0 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid #F0E6DC",
                        [cq(700)]: { p: 2.5 },
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <EmojiEventsIcon sx={{ color: "#F4A261" }} />
                        <Typography fontWeight={700} sx={{ fontSize: "0.9rem", [cq(700)]: { fontSize: "1rem" } }}>
                            Top Community Members
                        </Typography>
                    </Box>

                    {topMembers.map((member, index) => (
                        <Box key={member.name}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.2, [cq(700)]: { gap: 1.5 } }}>
                                <Typography
                                    sx={{
                                        width: 16,
                                        flexShrink: 0,
                                        fontWeight: 800,
                                        color: "text.secondary",
                                        fontSize: 12,
                                        [cq(700)]: { width: 20, fontSize: 14 },
                                    }}
                                >
                                    {index + 1}
                                </Typography>

                                <UserAvatar initials={member.initials} verified={member.verified} />

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        fontWeight={600}
                                        noWrap
                                        sx={{
                                            fontSize: "0.8rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            [cq(700)]: { fontSize: "0.9rem" },
                                        }}
                                    >
                                        {member.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                                        {member.city}
                                    </Typography>
                                    {member.badge && (
                                        <Typography
                                            variant="caption"
                                            noWrap
                                            sx={{
                                                display: "block",
                                                color: "#E8650A",
                                                fontWeight: 600,
                                                fontSize: 10,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                [cq(700)]: { fontSize: 12 },
                                            }}
                                        >
                                            {member.badge}
                                        </Typography>
                                    )}
                                </Box>

                                <Box textAlign="right" sx={{ flexShrink: 0, pl: 1 }}>
                                    <Typography fontWeight={700} color="primary.main" sx={{ fontSize: 13, [cq(700)]: { fontSize: 15 } }}>
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
            </Box>

            {/* ACTIVITY + INVITE */}
            <Box sx={{ width: "100%", [cq(800)]: { flex: "1 1 42%", minWidth: 0 } }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid #F0E6DC",
                        mb: 2,
                        [cq(700)]: { p: 2.5 },
                    }}
                >
                    <Typography fontWeight={700} mb={2} sx={{ fontSize: "0.9rem", [cq(700)]: { fontSize: "1rem" } }}>
                        Recent Activity
                    </Typography>

                    {activities.map((a, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 1.2, mb: 1.5 }}>
                            <Typography fontSize={18} sx={{ flexShrink: 0 }}>
                                {a.icon}
                            </Typography>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontSize: 12, [cq(700)]: { fontSize: 14 } }}>
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
                        p: 2,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #E8650A, #FF8C42)",
                        color: "#fff",
                        [cq(700)]: { p: 2.5 },
                    }}
                >
                    <Typography fontWeight={800} mb={1} sx={{ fontSize: "0.95rem", [cq(700)]: { fontSize: "1rem" } }}>
                        Invite a friend 🙏
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                        Saathi grows through trust. Invite someone from your community to join.
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        sx={{
                            background: "#fff",
                            color: "#E8650A",
                            fontWeight: 700,
                            [cq(500)]: { width: "auto" },
                            "&:hover": { background: "#FFF8F2" },
                        }}
                    >
                        Share invite link
                    </Button>
                </Paper>
            </Box>
        </Box>
    </Box>
);

export default Discover;