import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Grid,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { rideHistory } from "../data/mockData.jsx";

export default function Profile() {
  const { user } = useApp();

  const trustBreakdown = [
    { label: "Phone Verified", val: 100, color: "#2E7D52" },
    { label: "Community Trust", val: 88, color: "#E85D26" },
    { label: "Ride Completion", val: 96, color: "#1A3C5E" },
    { label: "Referral Quality", val: 85, color: "#7B5EA7" },
  ];

  const stats = [
    { label: "Rides Given", value: user.ridesGiven, icon: "🚗" },
    { label: "Rides Taken", value: user.ridesTaken, icon: "🙋" },
    { label: "Referrals", value: user.referralCount, icon: "👥" },
    { label: "Credits", value: `$${user.credits}`, icon: "💰" },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#F8FAFC", pb: 12 }}>
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0F2A43 0%, #1A3C5E 55%, #E85D26 100%)",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, md: 5 },
          boxShadow: "0 12px 30px rgba(15,42,67,0.18)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 82,
                height: 82,
                bgcolor: "#FF8A5B",
                fontWeight: 900,
                fontSize: "1.6rem",
                border: "3px solid white",
              }}
            >
              {user.avatar}
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={900} color="white">
                {user.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mt={0.8}>
                <VerifiedIcon sx={{ color: "#4FC3F7", fontSize: 19 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
                  {user.phone}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label="🏆 OG Member" sx={chipStyle} />
            <Chip label={`📍 ${user.city}`} sx={chipStyle} />
            <Chip label={`Since ${user.joined}`} sx={chipStyle} />
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 4, md: 6 }, mt: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(232,93,38,0.18)",
                boxShadow: "0 12px 30px rgba(15,42,67,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={800}>
                      TRUST SCORE
                    </Typography>

                    <Typography variant="h3" fontWeight={900} color="primary">
                      {user.trustScore}%
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: "50%",
                      background: `conic-gradient(#E85D26 ${
                        user.trustScore * 3.6
                      }deg, #E5E7EB 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <EmojiEventsIcon color="primary" />
                    </Box>
                  </Box>
                </Box>

                {trustBreakdown.map((t) => (
                  <Box key={t.label} mb={1.8}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={800}>
                        {t.label}
                      </Typography>

                      <Typography variant="body2" fontWeight={900} sx={{ color: t.color }}>
                        {t.val}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={t.val}
                      sx={{
                        height: 7,
                        borderRadius: 999,
                        bgcolor: "#E5E7EB",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: t.color,
                          borderRadius: 999,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Grid container spacing={2} mt={1}>
              {stats.map((s) => (
                <Grid item xs={6} key={s.label}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography fontSize={28}>{s.icon}</Typography>

                      <Typography variant="h5" fontWeight={900} color="primary">
                        {s.value}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" fontWeight={700}>
                        {s.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Languages
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {user.languages.map((l) => (
                    <Chip
                      key={l}
                      label={l}
                      sx={{
                        bgcolor: "#EEF2FF",
                        color: "#4338CA",
                        fontWeight: 800,
                      }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Referral Chain
                </Typography>

                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip label="Community" sx={{ bgcolor: "#1A3C5E", color: "white", fontWeight: 800 }} />
                  <Typography>→</Typography>
                  <Chip label={user.referredBy} sx={{ bgcolor: "#E85D26", color: "white", fontWeight: 800 }} />
                  <Typography>→</Typography>
                  <Chip label={user.name} sx={{ bgcolor: "#7B5EA7", color: "white", fontWeight: 800 }} />
                  <Typography>→</Typography>
                  <Chip label={`${user.referralCount} members`} sx={{ bgcolor: "#2E7D52", color: "white", fontWeight: 800 }} />
                </Stack>
              </CardContent>
            </Card>

            <Typography variant="h6" fontWeight={900} mb={1.5}>
              Ride History
            </Typography>

            <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
              <List disablePadding>
                {rideHistory.map((h, i) => (
                  <React.Fragment key={h.id}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem sx={{ py: 1.8 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: h.role === "Driver" ? "#E85D26" : "#1A3C5E",
                            width: 42,
                            height: 42,
                          }}
                        >
                          <DirectionsCarIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography fontWeight={800}>
                            {h.from} → {h.to}
                          </Typography>
                        }
                        secondary={`${h.date} · ${h.persons}`}
                      />

                      <Box textAlign="right">
                        <Typography
                          variant="body2"
                          fontWeight={900}
                          color={h.role === "Driver" ? "primary" : "secondary"}
                        >
                          {h.role}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {h.amount}
                        </Typography>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

const chipStyle = {
  bgcolor: "rgba(255,255,255,0.16)",
  color: "white",
  fontWeight: 800,
  backdropFilter: "blur(10px)",
};