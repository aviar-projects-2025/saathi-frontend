import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: <ShieldIcon />,
    title: "Verified Members",
    text: "Members join through referrals and community approval.",
  },
  {
    icon: <DirectionsCarIcon />,
    title: "Shared Travel",
    text: "Find trusted companions and share rides safely.",
  },
  {
    icon: <GroupsIcon />,
    title: "Trusted Community",
    text: "Build real connections through a verified network.",
  },
  {
    icon: <ChatIcon />,
    title: "Community Feed",
    text: "Share updates, ask for help, and support others.",
  },
];

const Web = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FFF8F2" }}>
      {/* Navbar */}
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 5 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#fff",
          borderBottom: "1px solid #F0E6DC",
        }}
      >
        <Typography variant="h5" fontWeight={900} color="#E8650A">
          Saathi
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            bgcolor: "#E8650A",
            borderRadius: 999,
            px: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Login
        </Button>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              fontWeight={900}
              sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, lineHeight: 1.1 }}
            >
              Travel Together,{" "}
              <Box component="span" sx={{ color: "#E8650A" }}>
                Connect Safely.
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 2, fontSize: "1.1rem", lineHeight: 1.8 }}
            >
              Saathi is a trusted community platform where verified members can
              find travel companions, share rides, build connections, and
              support each other through referrals.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={4}>
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  bgcolor: "#E8650A",
                  borderRadius: 999,
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Join Community
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  px: 4,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 800,
                  borderColor: "#E8650A",
                  color: "#E8650A",
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 5,
                border: "1px solid #F0E6DC",
                bgcolor: "#fff",
              }}
            >
              <Typography variant="h5" fontWeight={900} mb={2}>
                Why Saathi?
              </Typography>

              <Typography color="text.secondary" lineHeight={1.8}>
                Unlike ordinary ride-sharing platforms, Saathi is built on
                trust. Every member is connected through referrals and verified
                by the community before gaining full access.
              </Typography>

              <Stack spacing={1.5} mt={3}>
                <Typography>✅ Referral-based access</Typography>
                <Typography>✅ Member approval system</Typography>
                <Typography>✅ Trusted ride companions</Typography>
                <Typography>✅ Community-first travel experience</Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Features */}
        <Grid container spacing={3} mt={6}>
          {features.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 4,
                  border: "1px solid #F0E6DC",
                  bgcolor: "#fff",
                }}
              >
                <Box sx={{ color: "#E8650A", mb: 1 }}>{item.icon}</Box>
                <Typography fontWeight={800}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {item.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Web;