import React, { useEffect, useState } from "react";
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
  useMediaQuery,
  useTheme,
  Grid,
  Modal,
  TextField,
  MenuItem
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import PageLayout from "../components/PageLayout";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";

const SectionCard = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: "12px 14px", sm: "16px 18px", md: "20px 24px" },
      borderRadius: { xs: 2, sm: 3 },
      border: CARD_BORDER,
      ...sx,
    }}
  >
    {children}
  </Paper>
);

const SectionHeader = ({ icon, label }) => (
  <Stack direction="row" spacing={1} alignItems="center" mb={{ xs: 1, sm: 1.5 }}>
    {React.cloneElement(icon, {
      sx: { color: SAFFRON, fontSize: { xs: 18, sm: 20 } },
    })}
    <Typography
      fontWeight={700}
      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
    >
      {label}
    </Typography>
  </Stack>
);

const compactBtn = {
  textTransform: "none",
  fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
  minHeight: { xs: 12, sm: 36, md: 40 },
  px: { xs: 1.5, sm: 2, md: 2.5 },
  py: { xs: 0.5, sm: 0.75 },
  borderRadius: 2,
};

// Pill outlined style (mobile) matching the reference button
const pillBtn = {
  textTransform: "none",
  border: "none",
  fontSize: { xs: "0.60rem", sm: "0.8rem", md: "0.875rem" },
  color: SAFFRON,
  fontWeight: 600,
  // "&:hover": {
  //   bgcolor: "#FDF0E8",
  //   borderColor: SAFFRON,
  //   border: `1.5px solid ${SAFFRON}`
  // },
  // minHeight: { xs: 32, sm: 36, md: 40 },
  // borderRadius: { xs: "999px", sm: "8px" },
  // px: { xs: 0.7, sm: 2, md: 2.5 },
  // py: { xs: 0.5, sm: 0.75 },
};

const Settings = () => {
  const theme = useTheme();
  const { currentUser } = useUser()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [editProfile, setEditProfile] = useState(false)
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
  const [profileFile, setProfileFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))

  console.log(currentUser, 'currentUser')
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
    dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
    gender: currentUser?.gender || "",
    bio: currentUser?.bio || "",
  });

  useEffect(() => {
  if (currentUser) {
    setFormData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      mobile: currentUser?.mobile || "",
      dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
      gender: currentUser?.gender || "",
      bio: currentUser?.bio || "",
    });

    setProfileImage(currentUser?.profileImage || "");
  }
}, [currentUser]);

  const logout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

  const handleProfileImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProfileFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setSubmitLoading(true)
      const data = new FormData();

      if (profileFile) {
        data.append("profileImage", profileFile);
      }

      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("mobile", formData.mobile);
      data.append("dob", formData.dob ? formData.dob.format("YYYY-MM-DD") : "");
      data.append("gender", formData.gender);
      data.append("bio", formData.bio);

      await axios.post(Api + `/users/update/${user?.id}`, data)
      toast.success("Profile updated")
      setEditProfile(false)
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitLoading(false)
    }
  };
  return (
    <PageLayout>
      <Box sx={{ maxWidth: 860, mx: "auto", px: { xs: 1.5, sm: 2, md: 0 } }}>
        {/* Page heading */}
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" } }}
        >
          Settings
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ mt: { xs: 1, sm: 2 }, fontSize: { xs: "0.72rem", sm: "1rem", md: "1rem" } }}
        >
          Manage your Saathi account, referrals, and preferences.
        </Typography>

        <Stack spacing={{ xs: 1.25, sm: 1.75, md: 2 }}
          sx={{ mt: 2 }}>

          {/* ── Profile ── */}
          <SectionCard>
            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems="center"
            >
              <Avatar
                src={currentUser?.profileImage || ""}
                sx={{
                  width: { xs: 40, sm: 48, md: 54 },
                  height: { xs: 40, sm: 48, md: 54 },
                  bgcolor: SAFFRON,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: "0.85rem", sm: "1rem", md: "1.15rem" },
                  flexShrink: 0,
                }}
              >
                {!currentUser?.profileImage &&
                  `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "0.82rem", sm: "0.9rem", md: "1rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.firstName} {currentUser?.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.68rem", sm: "0.75rem", md: "0.8rem" },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser?.email}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                onClick={() => { setEditProfile(true) }}
                sx={{
                  ...pillBtn,
                  flexShrink: 0,
                  width: { xs: "auto", sm: "auto" },
                }}
              >
                Edit Profile
              </Button>
            </Stack>
          </SectionCard>

          {/* ── Account ── */}

          <SectionCard>
            <SectionHeader icon={<PersonIcon />} label="Account" />
            <Divider sx={{ mt: 1 }} />
            <Stack>
              <Button
                variant="text"
                sx={{
                  ...compactBtn,
                  justifyContent: "flex-start",
                  color: SAFFRON,
                  px: 0,
                  minHeight: { xs: 34, sm: 40 },
                  mt: 1.2
                }}
              >
                Update profile information
              </Button>
              <Button
                variant="text"
                sx={{
                  ...compactBtn,
                  justifyContent: "flex-start",
                  color: SAFFRON,
                  px: 0,
                  minHeight: { xs: 34, sm: 40 },
                }}
              >
                Manage ride preferences
              </Button>
            </Stack>
          </SectionCard>


          {/* ── Security ── */}

          <SectionCard>
            <SectionHeader icon={<LockIcon />} label="Security" />
            <Divider sx={{ mt: 1 }} />
            <Grid sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}>


              <Button
                variant="outlined"
                sx={{
                  ...pillBtn,
                  width: { xs: "auto", sm: "auto" },
                  mt: 1.5,
                }}
              >
                Change Password
              </Button>
            </Grid>
          </SectionCard>



          {/* ── Notifications ── */}
          <SectionCard>
            <SectionHeader icon={<NotificationsIcon />} label="Notifications" />
            <Divider sx={{ mt: 1 }} />
            <Stack spacing={0} divider={<Divider />}>
              {[
                { label: "Ride updates", checked: true },
                { label: "Referral requests", checked: true },
                { label: "Community likes and comments", checked: false },
              ].map(({ label, checked }) => (
                <FormControlLabel
                  key={label}
                  control={
                    <Switch
                      defaultChecked={checked}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: SAFFRON },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          bgcolor: SAFFRON,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.875rem" } }}>
                      {label}
                    </Typography>
                  }
                  labelPlacement="start"
                  sx={{
                    mx: 0,
                    justifyContent: "space-between",
                    py: { xs: 0.75, sm: 1 },
                  }}
                />
              ))}
            </Stack>
          </SectionCard>

          {/* ── Referral ── */}
          <SectionCard>
            <SectionHeader icon={<CardGiftcardIcon />} label="Referral" />
            <Divider sx={{ mt: 1.5 }} />

            <Grid
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
              }}>
              <Grid>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.68rem", sm: "0.8rem" }, mt: 1.5 }}
                >
                  Your referral code
                </Typography>

                <Chip
                  label={currentUser?.referralCode || "SAATHI-CODE"}
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    fontSize: { xs: "0.72rem", sm: "0.75rem" },
                    height: { xs: 26, sm: 30 },
                    color: SAFFRON,
                    bgcolor: SAFFRON_LIGHT,
                  }}
                />
              </Grid>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  sx={{
                    ...pillBtn,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Copy code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  sx={{
                    ...pillBtn,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Share invite
                </Button>
              </Stack>

            </Grid>
          </SectionCard>

          {/* ── Account Actions ── */}
          <SectionCard>
            <SectionHeader icon={<SettingsIcon />} label="Account actions" />
            <Divider sx={{ mt: 1 }} />
            <Grid
              sx={{
                display: 'flex',
                justifyContent: { xs: "center", sm: "end" },
                mt: 2,
                mx: 1
              }}>
              <Stack direction={{ xs: "row", sm: "row" }} spacing={2}>

                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon sx={{ fontSize: { xs: 15, sm: 17 } }} />}
                  onClick={logout}
                  sx={{
                    ...pillBtn,
                    width: { xs: "auto", sm: "auto" },

                  }}
                >
                  Logout
                </Button>
                <Button
                  startIcon={<DeleteIcon sx={{ fontSize: { xs: 5, sm: 17 } }} />}
                  sx={{
                    ...pillBtn,
                    width: { xs: "100%", sm: "auto" },
                    // border: "1.5px solid #E24B4A",
                    // color: "#A32D2D",
                    // bgcolor: "#FFFAFA",
                    // "&:hover": { bgcolor: "#FCEBEB", borderColor: "#E24B4A" },
                  }}
                >
                  Delete Account
                </Button>
              </Stack>
            </Grid>
          </SectionCard>

        </Stack>
      </Box>

      <Modal
        open={editProfile}
        children={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100vh",
              p: 2,
            }}
          >
            <Box
              sx={{
                bgcolor: "white",
                width: { xs: "100%", sm: 450 },
                borderRadius: 2,
                boxShadow: 24,
                p: 3,
                maxHeight: "90vh",
                overflowY: "auto",
                justifyContent: 'center', alignItems: 'center', display: 'flex'
              }}
            >
              <Stack spacing={2.5} >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Edit Profile
                </Typography>

                <Stack alignItems="center" spacing={1}>
                  <Avatar
                    src={profileImage || formData?.profileImage}
                    sx={{
                      width: 90,
                      height: 90,
                      fontSize: 32,
                    }}
                  />

                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Change Photo

                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImage}
                    />
                  </Button>
                </Stack>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    size="small"
                    value={formData?.firstName}
                    onChange={handleChange}
                    sx={{ width: "48%" }}
                  />

                  <TextField
                    label="Last Name"
                    name="lastName"
                    sx={{ width: "48%" }}
                    size="small"
                    value={formData?.lastName}
                    onChange={handleChange}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Email"
                    name="email"
                    sx={{ width: "48%" }}
                    size="small"
                    value={formData?.email}
                    onChange={handleChange}
                    disabled
                  />

                  <TextField
                    label="Mobile Number"
                    name="mobile"
                    sx={{ width: "48%" }}
                    size="small"
                    value={formData?.mobile}
                    onChange={handleChange}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData?.dob}
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          dob: newValue,
                        }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { width: "48%" },
                        },
                      }}
                    />
                  </LocalizationProvider>

                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    sx={{ width: "48%" }}
                    size="small"
                    value={formData?.gender}
                    onChange={handleChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData?.bio}
                  onChange={handleChange}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setProfileImage('')
                      setEditProfile(false)
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    disabled={submitLoading}
                  >
                    Save Changes
                  </Button>
                </Stack>

              </Stack>
            </Box>
          </Box>
        }
      />
    </PageLayout>
  );
};

export default Settings;