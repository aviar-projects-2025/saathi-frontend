import React from "react";
import { Box, Paper, Typography, Button, Stack, Avatar } from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LogoutIcon from "@mui/icons-material/Logout";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function WaitingApproval() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleCheckStatus = () => {
    // Option 1: force re-login
    logout();
    navigate("/login");

    // Option 2 (better UX if you have API):
    // call API to refresh user status instead of logout
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: 4,
          borderRadius: 4,
          textAlign: "center",
          border: "1px solid #F0E6DC",
        }}
      >
        <Avatar
          sx={{
            width: 76,
            height: 76,
            mx: "auto",
            mb: 2,
            bgcolor: "#FFF0E3",
            color: "#E8650A",
          }}
        >
          <HourglassTopIcon fontSize="large" />
        </Avatar>

        <Typography variant="h5" fontWeight={800} mb={1}>
          Waiting for Approval
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          Your account has been created successfully. You'll receive a
          confirmation email shortly, and your referrer will receive your
          approval request. Once your account is approved, you'll be ready to
          enjoy Saathi.
        </Typography>

        {/* 🔥 Referral Contact Section */}
        <Box
          sx={{
            bgcolor: "#FFF3E8",
            border: "1px solid #FFD9B8",
            borderRadius: 3,
            p: 2,
            mb: 2,
          }}
        >
          <Typography fontWeight={700} color="#E8650A" mb={0.5}>
            Ready to join the community?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            our account is waiting for your referrer's approval. If you know
            them, you can send them a quick reminder to review your request{" "}
          </Typography>

          {/* OPTIONAL: show referral details */}
          {user?.referredBy && (
            <Typography mt={1} fontWeight={600}>
              Referred by: {user.referredBy.name}
            </Typography>
          )}
        </Box>

        {/* Existing Info */}
        <Box
          sx={{
            bgcolor: "#FFF8F2",
            border: "1px dashed #E8650A",
            borderRadius: 3,
            p: 2,
            mb: 3,
          }}
        >
          <Typography fontWeight={700} color="#E8650A" mb={0.5}>
            What happens next?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            After your referrer approves your request, you'll be able to sign in
            and start using Saathi's rides, community, referrals, and more.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {/* 🔥 Updated Check Status */}
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleCheckStatus}
            sx={{
              bgcolor: "#E8650A",
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#cf5708" },
            }}
          >
            Check Status
          </Button>

          {/* <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#E8650A",
              color: "#E8650A",
            }}
          >
            Logout
          </Button> */}
        </Stack>
      </Paper>
    </Box>
  );
}
