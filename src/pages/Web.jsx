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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";

/* ---------------- Animations ---------------- */

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,101,10,0.35); }
  50% { box-shadow: 0 0 0 12px rgba(232,101,10,0); }
`;

/* ---------------- Theme tokens ---------------- */

const ORANGE = "#E8650A";
const ORANGE_DARK = "#C95208";
const BG = "#FFF8F2";
const BORDER = "#F0E6DC";
const TEXT_SECONDARY = "#6B6259";

const features = [
  {
    icon: <ShieldIcon fontSize="medium" />,
    title: "Verified Members",
    text: "Members join through referrals and community approval.",
  },
  {
    icon: <DirectionsCarIcon fontSize="medium" />,
    title: "Shared Travel",
    text: "Find trusted companions and share rides safely.",
  },
  {
    icon: <GroupsIcon fontSize="medium" />,
    title: "Trusted Community",
    text: "Build real connections through a verified network.",
  },
  {
    icon: <ChatIcon fontSize="medium" />,
    title: "Community Feed",
    text: "Share updates, ask for help, and support others.",
  },
];

const trustPoints = [
  "Referral-based access",
  "Member approval system",
  "Trusted ride companions",
  "Community-first travel experience",
];

const Web = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: BG,
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* ---------------- Navbar ---------------- */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          py: 1.75,
          px: { xs: 2.5, md: 6 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 900,
            color: ORANGE,
            letterSpacing: "-0.5px",
            fontSize: { xs: "1.4rem", md: "1.6rem" },
          }}
        >
          Saathi
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            bgcolor: ORANGE,
            borderRadius: 999,
            px: { xs: 2.5, md: 3.5 },
            py: 0.9,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            boxShadow: "0 4px 14px rgba(232,101,10,0.3)",
            transition: "all 0.25s ease",
            "&:hover": {
              bgcolor: ORANGE_DARK,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 18px rgba(232,101,10,0.4)",
            },
          }}
        >
          Login
        </Button>
      </Box>

      {/* ---------------- Hero ---------------- */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              animation: `${fadeUp} 0.8s ease both`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
                lineHeight: 1.15,
                letterSpacing: "-1px",
                color: "#1A1A1A",
              }}
            >
              Travel Together,{" "}
              <Box
                component="span"
                sx={{
                  color: ORANGE,
                  display: "inline-block",
                }}
              >
                Connect Safely.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.8,
                color: TEXT_SECONDARY,
                // maxWidth: 480,
              }}
            >
              Saathi is a trusted community platform where verified members can
              find travel companions, share rides, build connections, and
              support each other through referrals.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.5}
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  bgcolor: ORANGE,
                  borderRadius: 999,
                  px: 4,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "1rem",
                  boxShadow: "0 6px 18px rgba(232,101,10,0.35)",
                  animation: `${pulseGlow} 2.4s infinite ease-in-out`,
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    bgcolor: ORANGE_DARK,
                    transform: "translateY(-3px) scale(1.02)",
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
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: ORANGE,
                  color: ORANGE,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: ORANGE_DARK,
                    color: ORANGE_DARK,
                    bgcolor: "rgba(232,101,10,0.06)",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              animation: `${fadeUp} 0.9s ease 0.15s both`,
              mb: 4
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4.5 },
                borderRadius: 5,
                border: `1px solid ${BORDER}`,
                bgcolor: "#fff",
                boxShadow: "0 12px 40px rgba(232,101,10,0.08)",
                animation: `${float} 5s ease-in-out infinite`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  boxShadow: "0 16px 48px rgba(232,101,10,0.14)",
                },
              }}
            >
              <Typography
                sx={{ fontWeight: 900, fontSize: "1.4rem", mb: 2 }}
              >
                Why Saathi?
              </Typography>

              <Typography
                sx={{
                  color: TEXT_SECONDARY,
                  lineHeight: 1.8,
                  fontSize: "0.98rem",
                  mb: 3
                }}
              >
                Unlike ordinary ride-sharing platforms, Saathi is built on
                trust. Every member is connected through referrals and
                verified by the community before gaining full access.
              </Typography>

              <Stack spacing={2} mt={3.5}>
                {trustPoints.map((point, i) => (
                  <Box
                    key={point}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      animation: `${fadeUp} 0.6s ease ${0.2 + i * 0.1}s both`,
                    }}
                  >
                    <CheckCircleIcon
                      sx={{ color: ORANGE, fontSize: "1.2rem" }}
                    />
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
                      {point}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* ---------------- Features ---------------- */}
        <Grid container spacing={{ xs: 3, sm: 3, md: 4 }} mt={{ xs: 8, md: 10 }}>
          {features.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={item.title} sx={{mt:5}}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  height: "100%",
                  borderRadius: 4,
                  border: `1px solid ${BORDER}`,
                  bgcolor: "#fff",
                  textAlign: "left",
                  opacity: 0,
                  animation: `${fadeUp} 0.6s ease ${0.1 * i}s forwards`,
                  transition:
                    "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease",
                  willChange: "transform, opacity",
                  "&:hover": {
                    transform: { xs: "translateY(-4px)", md: "translateY(-8px) scale(1.02)" },
                    borderColor: ORANGE,
                    boxShadow: "0 16px 36px rgba(232,101,10,0.16)",
                  },
                  "&:hover .feature-icon": {
                    transform: "rotate(-8deg) scale(1.1)",
                    boxShadow: "0 8px 20px rgba(232,101,10,0.35)",
                  },
                }}
              >
                <Box
                  className="feature-icon"
                  sx={{
                    color: "#fff",
                    bgcolor: ORANGE,
                    width: { xs: 40, md: 44 },
                    height: { xs: 40, md: 44 },
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                    transition: "transform 0.35s ease, box-shadow 0.35s ease",
                  }}
                >
                  {item.icon}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1rem", md: "1.05rem" },
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", md: "0.9rem" },
                    color: TEXT_SECONDARY,
                    mt: 1,
                    lineHeight: 1.6,
                  }}
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