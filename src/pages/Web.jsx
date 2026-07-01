import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip
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
    text: "Members join through referrals and community approval.",
  },
  {
    icon: <DirectionsCarIcon />,
    title: "Shared Travel",
    text: "Find trusted companions and share rides safely.",
  },
  {
    icon: <GroupsIcon />,
    title: "Trusted Network",
    text: "Build real community connections through a verified referral system.",
  },
  {
    icon: <ChatIcon />,
    title: "Community Feed",
    text: "Share updates, ask for help, and support others.",
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
            <Stack sx={{ animation: `${fadeUp} 0.8s ease both` }}>
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
                Join Community
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  mt: 2.5,
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  lineHeight: 1.9,
                  color: navy,
                  maxWidth: 560,
                  opacity: 0.82,
                }}
              >
                Learn More
              </Button>
            </Stack>
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
      </Container>
    </Box>
  );
};

export default Web;