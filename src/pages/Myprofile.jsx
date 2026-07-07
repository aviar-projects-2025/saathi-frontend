import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Api from "../Api.jsx";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  FormControlLabel,
  useMediaQuery,
  Stack,
  Switch,
  Chip,
  useTheme,
  Grid,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import ShareIcon from "@mui/icons-material/Share";
import { useUser } from "../context/userConetext.jsx";
import CommunityComments from "./CommunityComments.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";
const compactBtn = {
  textTransform: "none",
  fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
  minHeight: { xs: 12, sm: 36, md: 40 },
  px: { xs: 1.5, sm: 2, md: 2.5 },
  py: { xs: 0.5, sm: 0.75 },
  borderRadius: 2,
};
const user = JSON.parse(localStorage.getItem('user'))
// Pill outlined style (mobile) matching the reference button
const pillBtn = {
  textTransform: "none",
  border: "none",
  fontSize: { xs: "0.60rem", sm: "0.8rem", md: "0.875rem" },
  color: SAFFRON,
  fontWeight: 600,
};

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
const Myprofile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentUser, getuserData } = useUser()
  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);
  const feedRef = useRef(null);
  const logout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };
  const [communityPosts, setCommunityPosts] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      getCommunityPost();
    }
  }, [currentUser]);
  const getCommunityPost = async () => {

    try {


      const postsRes = await axios.get(Api + "/community/");

      // Only current user's posts
      const myPosts = postsRes.data.data.filter(
        (item) => item.authorId?._id === currentUser?._id
      );

      setCommunityPosts(myPosts);

    } catch (error) {
      console.error(error);
    }
  };
  const StatBlock = ({ value, label }) => (
    <Box sx={{ textAlign: "center", minWidth: { xs: 52, sm: 64 } }}>
      <Typography
        fontWeight={800}
        sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" }, lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem", md: "0.75rem" } }}
      >
        {label}
      </Typography>
    </Box>
  );
  const shareLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        px: 2,
        py: 3,
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 2, sm: 3 }}
        alignItems="center"
        sx={{ flex: 1 }}
      >
        <Avatar
          src={currentUser?.profileImage || ""}
          sx={{
            width: { xs: 64, sm: 84, md: 96 },
            height: { xs: 64, sm: 84, md: 96 },
            bgcolor: SAFFRON,
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
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
              mb: { xs: 1, sm: 1.5 },
            }}
          >
            {currentUser?.email}
          </Typography>


        </Box>
      </Stack>
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
            onClick={() => { setPasswordModel(true) }}
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
              onClick={() => handleCopy(user?.referralCode)}
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
              onClick={handleOpenShare}
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
              }}
            >
              Hide Account From Users
            </Button>
          </Stack>
        </Grid>
      </SectionCard>
    </Box>
  );
};

export default Myprofile;