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
      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, sm: 2, md: 0 } }}>
        <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          Settings
        </Typography>

        <Typography color="text.secondary" sx={{ mb: { xs: 2, sm: 3 } }}>
          Manage your Saathi account, referrals, and preferences.
        </Typography>

        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {/* Profile */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                <Avatar sx={{ width: 58, height: 58, color: "#050505", bgcolor: "#E8650A", flexShrink: 0,fontWeight: 800 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={800} sx={{ wordBreak: "break-word" }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                    {user?.email}
                  </Typography>
                  {/* <Chip size="small" label={user?.role || "USER"} sx={{ mt: 1,bgcolor: "#E8650A" }} /> */}
                </Box>
              </Stack>

              <Button
                variant="outlined"
                sx={{ textTransform: "none", minHeight: 44, width: { xs: "100%", sm: "auto" }, flexShrink: 0, color: "#050505", bgcolor: "#E8650A", fontWeight:700}}
              >
                Edit Profile
              </Button>
            </Stack>
          </Paper>

          {/* Account */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <PersonIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Account</Typography>
            </Stack>

            <Stack>
              <Button
                variant="text"
                sx={{ justifyContent: "flex-start", textTransform: "none", minHeight: 50 }}
              >
                Update Profile Information
              </Button>
              <Button
                variant="text"
                sx={{ justifyContent: "flex-start", textTransform: "none", minHeight: 15 }}
              >
                Manage Ride Preferences
              </Button>
            </Stack>
          </Paper>

          {/* Security */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <LockIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Security</Typography>
            </Stack>

            <Button
              variant="outlined"
              sx={{ textTransform: "none", minHeight: 15, width: { xs: "100%", sm: "auto" } , marginTop:"20px" }}
            >
              Change Password
            </Button>
          </Paper>

          {/* Notifications */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <NotificationsIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Notifications</Typography>
            </Stack>

            <Stack spacing={2} sx={{marginTop:"20px"}}>
              <FormControlLabel control={<Switch defaultChecked />} label="Ride updates" />
              <FormControlLabel control={<Switch defaultChecked />} label="Referral requests" />
              <FormControlLabel control={<Switch />} label="Community likes and comments" />
            </Stack>
          </Paper>

          {/* Referral */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <CardGiftcardIcon sx={{ color: "#E8650A" }} />
              <Typography fontWeight={800}>Referral</Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{marginTop:'15px'}}>
              Your referral code
            </Typography>

            <Chip label={user?.referralCode || "SAATHI-CODE"} sx={{ fontWeight: 700, mb: 2, mt:2 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                sx={{ bgcolor: "#E8650A", textTransform: "none", minHeight: 44 }}
              >
                Copy Code
              </Button>
              <Button variant="outlined" sx={{ textTransform: "none", minHeight: 44 }}>
                Share Invite
              </Button>
            </Stack>
          </Paper>

          {/* Account Actions */}
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid #F0E6DC" }} elevation={0}>
            <Typography fontWeight={800} mb={2}>
              Account Actions
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{mt:3}}>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ textTransform: "none", minHeight: 44 }}
              >
                Logout
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                sx={{ textTransform: "none", minHeight: 44 }}
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