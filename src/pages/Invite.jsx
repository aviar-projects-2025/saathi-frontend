import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  InputAdornment,
  IconButton,
  LinearProgress,
  Grid,
  Stack,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useApp } from "../context/Roles.jsx";
import { referrals } from "../data/mockData.jsx";

export default function Invite() {
  const { user, showSnackbar } = useApp();
  const [phone, setPhone] = useState("");

  const activeReferrals = referrals.filter((r) => r.status === "active").length;
  const progress = Math.min((user.referralCount / 20) * 100, 100);

  const copyCode = () => {
    navigator.clipboard?.writeText(user.referralCode);
    showSnackbar("✅ Referral code copied!");
  };

  const sendInvite = () => {
    if (!phone) {
      showSnackbar("Please enter a phone number", "error");
      return;
    }

    showSnackbar(`📱 Invite sent to ${phone}!`);
    setPhone("");
  };

  const whatsappMsg = `🙏 Hey! Join Saathi — a trusted ride-sharing app for our Indian community. Join with my code: ${user.referralCode} → https://saathi.app/join`;

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
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Typography variant="h4" fontWeight={900} color="white">
            Invite & Earn
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.78)",
              mt: 1,
              maxWidth: 620,
            }}
          >
            Share Saathi with trusted community members and earn $5 ride credit
            after their first completed ride.
          </Typography>
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
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  YOUR REFERRAL CODE
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    color="primary"
                    letterSpacing={3}
                    flex={1}
                  >
                    {user.referralCode}
                  </Typography>

                  <IconButton
                    onClick={copyCode}
                    sx={{
                      bgcolor: "#FFF3ED",
                      color: "#E85D26",
                      "&:hover": { bgcolor: "#FFE2D3" },
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 3,
                    mb: 1,
                    height: 8,
                    borderRadius: 999,
                    bgcolor: "#E5E7EB",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      bgcolor: "#E85D26",
                    },
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  {user.referralCount} / 20 invites used · ${user.credits} credits earned
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3, borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Share Quickly
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<WhatsAppIcon />}
                    onClick={() =>
                      window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`)
                    }
                    sx={{
                      bgcolor: "#25D366",
                      "&:hover": { bgcolor: "#1EBE57" },
                    }}
                  >
                    WhatsApp
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={() => showSnackbar("Link copied to clipboard!")}
                  >
                    Copy Link
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3, borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  Invite by Phone
                </Typography>

                <TextField
                  fullWidth
                  placeholder="+1 (972) 555-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">📱</InputAdornment>
                    ),
                  }}
                />

                <Button fullWidth variant="contained" onClick={sendInvite}>
                  Send Invite SMS
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 4, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} mb={2}>
                  How It Works
                </Typography>

                {[
                  "Share your code with a trusted community member",
                  "They join and verify their phone number",
                  "They complete their first ride on Saathi",
                  "You get $5 ride credit automatically",
                ].map((text, index) => (
                  <Box key={text} display="flex" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: "#E85D26",
                        width: 30,
                        height: 30,
                        fontSize: "0.8rem",
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </Avatar>

                    <Typography fontWeight={600}>{text}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Typography variant="h6" fontWeight={900} mb={1.5}>
              Your Community ({referrals.length} members)
            </Typography>

            <Card sx={{ borderRadius: 4, overflow: "hidden" }}>
              <List disablePadding>
                {referrals.map((r, i) => (
                  <React.Fragment key={r.name}>
                    {i > 0 && <Divider component="li" />}
                    <ListItem sx={{ py: 1.7 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: r.status === "active" ? "#E85D26" : "#CBD5E1",
                            fontWeight: 900,
                          }}
                        >
                          {r.avatar}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography fontWeight={800}>{r.name}</Typography>
                        }
                        secondary={`${r.rides} rides · Joined ${r.date}`}
                      />

                      <Chip
                        icon={
                          r.status === "active" ? (
                            <CheckCircleIcon />
                          ) : (
                            <ScheduleIcon />
                          )
                        }
                        label={r.status === "active" ? "Active" : "Pending"}
                        size="small"
                        color={r.status === "active" ? "success" : "default"}
                        sx={{ fontWeight: 800 }}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Card>

            <Box
              mt={3}
              p={2.5}
              bgcolor="#ECFDF3"
              border="1px solid #BBF7D0"
              borderRadius={4}
            >
              <Typography color="#166534" fontWeight={900}>
                🏆 OG Member Bonus
              </Typography>

              <Typography variant="body2" color="text.secondary">
                First 100 members keep their founder badge forever. You are member #
                {activeReferrals + 1} in Dallas.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}