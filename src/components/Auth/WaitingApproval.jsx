import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
} from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../context/AuthContext";

export default function WaitingApproval() {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFF8F2",
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

        <Typography color="text.secondary" sx={{ mt: 1, mb: 1 }} >
          Your Saathi account has been created successfully.
          Saathi is built on trust and referrals.
          Your account is awaiting verification from the member who referred you.
          Once confirmed, you'll gain full access to the community and ride-sharing features.
        </Typography>

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
            Once approved, you can access rides, community posts, referrals, and
            other Saathi features.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <Button
            variant="contained"
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

          <Button
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
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}