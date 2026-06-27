// Web.jsx
import React from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from "@mui/material";

import ShieldIcon from "@mui/icons-material/Shield";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import GroupsIcon from "@mui/icons-material/Groups";
import ChatIcon from "@mui/icons-material/Chat";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { keyframes } from "@mui/system";
import { useNavigate } from "react-router-dom";

const navy = "#0B1F3A";
const saffron = "#F28C28";
const lightBg = "#F7FAFF";
const softSaffron = "#FFF1E0";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
`;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(35px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(242, 140, 40, 0.28);
  }
  50% {
    box-shadow: 0 0 0 18px rgba(242, 140, 40, 0);
  }
`;

const features = [
  {
    icon: <ShieldIcon />,
    title: "Verified Members",
    text: "Every member joins through referrals and community-based approval.",
  },
  {
    icon: <DirectionsCarIcon />,
    title: "Shared Travel",
    text: "Find safe travel companions , share rides with trusted people.",
  },
  {
    icon: <GroupsIcon />,
    title: "Trusted Network",
    text: "Build real community connections through a verified referral system.",
  },
  {
    icon: <ChatIcon />,
    title: "Community Feed",
    text: "Post updates, request help, share tips, and support each other.",
  },
];

const steps = [
  "Create your profile",
  "Get referred by a member",
  "Join the verified community",
  "Find rides and travel safely",
];

const Web = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: lightBg, overflow: "hidden" }}>
      {/* Navbar */}
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 6 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #DDE7F3",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              bgcolor: saffron,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              animation: `${pulse} 2.5s infinite`,
            }}
          >
            <DirectionsCarIcon />
          </Box>

          <Typography variant="h5" fontWeight={900} color={navy}>
            Saathi
          </Typography>
        </Stack>

        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            bgcolor: navy,
            color: "#fff",
            borderRadius: 999,
            px: 3,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "0 10px 25px rgba(11,31,58,.25)",
            "&:hover": { bgcolor: "#07172B" },
          }}
        >
          Login
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Hero */}
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ animation: `${fadeUp} 0.8s ease both` }}>
              <Chip
                icon={<VerifiedUserIcon />}
                label="Referral Based Trusted Community"
                sx={{
                  bgcolor: softSaffron,
                  color: navy,
                  fontWeight: 900,
                  mb: 2,
                  border: `1px solid ${saffron}`,
                  "& .MuiChip-icon": {
                    color: saffron,
                  },
                }}
              />

              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  fontSize: { xs: "2.4rem", sm: "3rem", md: "4.3rem" },
                  lineHeight: 1.08,
                  color: navy,
                }}
              >
                Travel Together,
                <br />
                <Box component="span" sx={{ color: saffron }}>
                  Connect Safely.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2.5,
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  lineHeight: 1.9,
                  color: navy,
                  maxWidth: 560,
                  opacity: 0.82,
                }}
              >
                Saathi helps verified members find trusted travel companions,
                share rides, build connections, and support each other through a
                secure referral-based community.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} mt={4}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/signup")}
                  sx={{
                    bgcolor: saffron,
                    color: "#fff",
                    borderRadius: 999,
                    px: 4,
                    py: 1.3,
                    textTransform: "none",
                    fontWeight: 900,
                    boxShadow: "0 14px 35px rgba(242,140,40,.30)",
                    "&:hover": {
                      bgcolor: "#D97706",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Join Community
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    py: 1.3,
                    textTransform: "none",
                    fontWeight: 900,
                    borderColor: navy,
                    color: navy,
                    "&:hover": {
                      borderColor: navy,
                      bgcolor: "#EEF4FF",
                    },
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                animation: `${float} 4s ease-in-out infinite`,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: "36px",
                  bgcolor: "#fff",
                  border: "1px solid #DDE7F3",
                  boxShadow: "0 30px 80px rgba(11,31,58,0.13)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 190,
                    height: 190,
                    bgcolor: softSaffron,
                    borderRadius: "50%",
                    right: -60,
                    top: -60,
                  }}
                />

                <Box
                  component="img"
                  src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
                  alt="travel community"
                  sx={{
                    width: "100%",
                    maxWidth: 330,
                    display: "block",
                    mx: "auto",
                    position: "relative",
                    zIndex: 1,
                  }}
                />

                <Stack spacing={2.5} mt={3} position="relative" zIndex={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: 4,
                      bgcolor: "#F7FAFF",
                      border: "1px solid #DDE7F3",
                    }}
                  >
                    <Typography fontWeight={900} color={navy}>
                      Safe Ride Match
                    </Typography>
                    <Typography fontSize={13} color={navy} sx={{ opacity: 0.75 }}>
                      Connect with verified members before starting your trip.
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: 4,
                      bgcolor: softSaffron,
                      border: `1px solid ${saffron}`,
                    }}
                  >
                    <Typography fontWeight={900} color={navy}>
                      Community Approved
                    </Typography>
                    <Typography fontSize={13} color={navy} sx={{ opacity: 0.75 }}>
                      Trust starts from referrals and member verification.
                    </Typography>
                  </Paper>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Features */}
        <Grid container spacing={9} mt={9}>
          {features.map((item, index) => (
            <Grid item xs={12} sm={6} md={6} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  minHeight: 230,
                  height: "100%",
                  borderRadius: 5,
                  border: "1px solid #DDE7F3",
                  bgcolor: "#fff",
                  animation: `${fadeUp} .8s ease both`,
                  animationDelay: `${index * 0.12}s`,
                  transition: "0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: "0 22px 55px rgba(11,31,58,.15)",
                    borderColor: saffron,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 3,
                    bgcolor: softSaffron,
                    color: saffron,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                    "& svg": { fontSize: 30 },
                  }}
                >
                  {item.icon}
                </Box>

                <Typography fontWeight={900} color={navy} fontSize={20}>
                  {item.title}
                </Typography>

                <Typography
                  variant="body2"
                  mt={1.3}
                  lineHeight={1.8}
                  sx={{ color: navy, opacity: 0.78 }}
                >
                  {item.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

<Grid sx={{mt:10}}>
        {/* Why Saathi */}
        <Grid container spacing={9} alignItems="stretch" mb={5}>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 6,
                bgcolor: navy,
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                height: "100%",
                minHeight: 420,
              }}
            >
              <TravelExploreIcon
                sx={{
                  fontSize: 90,
                  color: "rgba(255,255,255,0.10)",
                  position: "absolute",
                  right: 20,
                  top: 20,
                }}
              />

              <Typography fontSize={14} fontWeight={900} color={saffron}>
                WHY CHOOSE SAATHI?
              </Typography>

              <Typography variant="h4" fontWeight={900} mt={1}>
                Built for trust, not just travel.
              </Typography>

              <Typography mt={2} lineHeight={1.8} color="rgba(255,255,255,.78)">
                Ordinary ride-sharing platforms connect strangers. Saathi
                connects people through referrals, verification, and community
                confidence.
              </Typography>

              <Stack spacing={1.6} mt={3}>
                <Typography>✅ Referral-based access</Typography>
                <Typography>✅ Member approval system</Typography>
                <Typography>✅ Safer ride companion discovery</Typography>
                <Typography>✅ Community-first travel experience</Typography>
              </Stack>
            </Paper>
          </Grid>


          <Grid item xs={12} md={7}>
            <Grid container spacing={4} >
              {steps.map((step, index) => (
                <Grid item xs={12} sm={6} key={step} sx={{mt:7}}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      bgcolor: "#fff",
                      border: "1px solid #DDE7F3",
                      minHeight: 190,
                      height: "100%",
                      transition: "0.3s",
                      "&:hover": {
                        bgcolor: "#F7FAFF",
                        transform: "scale(1.03)",
                        borderColor: saffron,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        bgcolor: saffron,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        mb: 2,
                      }}
                    >
                      {index + 1}
                    </Typography>

                    <Typography fontWeight={900} color={navy}>
                      {step}
                    </Typography>

                    <Typography mt={1} fontSize={14} sx={{ color: navy, opacity: 0.75 }}>
                      Saathi keeps every step simple, safe, and community
                      focused.
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
</Grid>
        {/* Final CTA */}
        <Paper
          elevation={0}
          sx={{
            mt: 10,
            p: { xs: 4, md: 6 },
            borderRadius: 7,
            textAlign: "center",
            background: "linear-gradient(135deg,#0B1F3A 0%,#102D52 100%)",
            border: `1px solid ${saffron}`,
            color: "#fff",
          }}
        >
          <FavoriteIcon sx={{ color: saffron, fontSize: 42, mb: 1 }} />

          <Typography
            variant="h3"
            fontWeight={900}
            sx={{ fontSize: { xs: "2rem", md: "3rem" }, color: "#fff" }}
          >
            Start your safer travel journey with Saathi.
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "rgba(255,255,255,.78)",
              maxWidth: 720,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Join a trusted community where every ride, referral, and connection
            is built with care, safety, and real human trust.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/signup")}
            sx={{
              mt: 4,
              bgcolor: saffron,
              borderRadius: 999,
              px: 5,
              py: 1.4,
              textTransform: "none",
              fontWeight: 900,
              "&:hover": { bgcolor: "#D97706" },
            }}
          >
            Get Started Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Web;