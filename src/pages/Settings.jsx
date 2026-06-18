import React from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import PageLayout from "../components/PageLayout";

const Settings = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography variant="h5" fontWeight={800}>
          Settings
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Manage your Saathi account, referrals, and preferences.
        </Typography>

        <Stack spacing={2.5}>
          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 58, height: 58, bgcolor: "#FFF0E3", color: "#E8650A" }}>
                {user?.firstName?.[0]}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={800}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Chip size="small" label={user?.role || "USER"} sx={{ mt: 1 }} />
              </Box>

              <Button variant="outlined" sx={{ textTransform: "none" }}>
                Edit Profile
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <PersonIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Account</Typography>
            </Stack>

            <Stack spacing={1.5}>
              <Button variant="text" sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                Update Profile Information
              </Button>
              <Button variant="text" sx={{ justifyContent: "flex-start", textTransform: "none" }}>
                Manage Ride Preferences
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <LockIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Security</Typography>
            </Stack>

            <Button variant="outlined" sx={{ textTransform: "none" }}>
              Change Password
            </Button>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <NotificationsIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Notifications</Typography>
            </Stack>

            <FormControlLabel control={<Switch defaultChecked />} label="Ride updates" />
            <FormControlLabel control={<Switch defaultChecked />} label="Referral requests" />
            <FormControlLabel control={<Switch />} label="Community likes and comments" />
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <CardGiftcardIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Referral</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Your referral code
            </Typography>

            <Chip label={user?.referralCode || "SAATHI-CODE"} sx={{ fontWeight: 700, mb: 2 }} />

            <Stack direction="row" spacing={1}>
              <Button variant="contained" sx={{ bgcolor: "#E8650A", textTransform: "none" }}>
                Copy Code
              </Button>
              <Button variant="outlined" sx={{ textTransform: "none" }}>
                Share Invite
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Typography fontWeight={800} mb={2}>
              Account Actions
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ textTransform: "none" }}
              >
                Logout
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                sx={{ textTransform: "none" }}
              >
                Delete Account
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </PageLayout>
  );
};

export default Settings;