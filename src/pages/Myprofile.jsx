import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  Stack,
  Switch,
} from "@mui/material";
import { useUser } from "../context/userConetext.jsx";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import { useNavigate } from "react-router-dom";

/* ── Design Tokens ── */
const RUST = "#C83F08";
const RUST_DARK = "#A93205";
const NAVY = "#1B2A4E";
const BG = "#FAF8F5";
const BORDER = "#E7E0D8";
const TEXT_PRIMARY = "#1F2937";
const TEXT_MUTED = "#6B7280";

/* ── Reusable Section Wrapper ── */
const Section = ({ title, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      width: "100%",
      p: { xs: 2.5, sm: 3.5 },
      mb: 2.5,
      borderRadius: 2.5,
      border: `1px solid ${BORDER}`,
      bgcolor: "#fff",
      boxSizing: "border-box",
      ...sx,
    }}
  >
    {title && (
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, mb: 2.5 }}>
        {title}
      </Typography>
    )}
    {children}
  </Paper>
);

/* ── Row: text left, control right (FULL WIDTH) ── */
const Row = ({ children, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: 2,
      ...sx,
    }}
  >
    {children}
  </Box>
);

const MyProfileSettings = () => {
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const { currentUser } = useUser();

  /* ── SMS Preferences State ── */
  const [smsPrefs, setSmsPrefs] = useState({
    rideRequests: true,
    referralApprovals: true,
    routeAlerts: true,
    communityNews: false,
  });

  const handlePrefChange = (key) => (event) => {
    setSmsPrefs((prev) => ({ ...prev, [key]: event.target.checked }));
  };

  const handleCopy = (value) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!", toasts);
  };

  const handleShare = () => {
    const message = `Join me on Saathi Rides using my invite code: ${currentUser?.referralCode || ""}`;
    if (navigator.share) {
      navigator.share({ title: "Saathi Invite", text: message }).catch(() => { });
    } else {
      navigator.clipboard.writeText(message);
      toast.success("Invite message copied!", toasts);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion requested. Support will contact you.", toasts);
    }
  };

  /* ── Switch styling ── */
  const switchSx = {
    flexShrink: 0,
    "& .MuiSwitch-switchBase.Mui-checked": { color: RUST },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: RUST },
    "& .MuiSwitch-track": { bgcolor: "#D1D5DB" },
  };

  return (
    <Box sx={{
      bgcolor: BG,
      minHeight: "100vh",
      py: { xs: 1, sm: 2 },
      px: { xs: 1, sm: 2 }
    }}>
      <Box sx={{ maxWidth: 900, mx: "auto", width: "100%" }}>

        {/* ─── Page Header ─── */}
        <Typography sx={{ fontSize: { xs: 24, sm: 28 }, fontWeight: 800, color: NAVY, mb: 3 }}>
          Settings
        </Typography>

        {/* ─── 1. Account ─── */}
        <Section title="Account">
          <Stack spacing={0}>
            {/* Mobile Row */}
            <Row sx={{ py: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Mobile number
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                <Typography sx={{ fontSize: 14, color: TEXT_MUTED }}>
                  {currentUser?.mobile ? `+1 (***) ***-${currentUser.mobile.slice(-4)}` : "+1 (***) ***-XXXX"}
                </Typography>
                <Button
                  onClick={() => navigate("/user-profile")}
                  disableRipple
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    color: RUST,
                    fontSize: 14,
                    minWidth: 0,
                    p: 0,
                    "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                  }}
                >
                  Change
                </Button>
              </Box>
            </Row>

            <Divider sx={{ borderColor: BORDER }} />

            {/* Email Row */}
            <Row sx={{ py: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                  Email
                </Typography>
                <Typography sx={{ fontSize: 13, color: TEXT_MUTED }}>
                  (optional, never shown)
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 14, color: TEXT_MUTED, flexShrink: 0 }}>
                {currentUser?.email || "Not provided"}
              </Typography>
            </Row>
          </Stack>
        </Section>

        {/* ─── 2. Your Invite Code ─── */}
        <Section title="Your invite code">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              width: "100%",
            }}
          >
            {/* The Code Input */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                px: 2.5,
                py: 1.75,
                bgcolor: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                fontSize: 15,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 0.5,
                fontFamily: "monospace",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              {currentUser?.referralCode || "NOT_SET"}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
              <Button
                variant="contained"
                disableElevation
                onClick={() => handleCopy(currentUser?.referralCode)}
                sx={{
                  bgcolor: RUST,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  height: 48,
                  borderRadius: 1.5,
                  minWidth: 100,
                  "&:hover": { bgcolor: RUST_DARK },
                }}
              >
                Copy
              </Button>
              <Button
                variant="outlined"
                onClick={handleShare}
                sx={{
                  color: RUST,
                  borderColor: RUST,
                  borderWidth: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  height: 48,
                  borderRadius: 1.5,
                  minWidth: 100,
                  "&:hover": { borderWidth: 1.5, bgcolor: "#FFF5EC" },
                }}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Section>

        {/* ─── 3. SMS Preferences ─── */}
        <Section title="Text message (SMS) preferences">
          <Stack spacing={0}>
            {/* Row 1 */}
            <Row sx={{ py: 2 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                  Ride requests and acceptances
                </Typography>
                <Typography sx={{ fontSize: 13, color: TEXT_MUTED, mt: 0.25 }}>
                  Needed for rides to work
                </Typography>
              </Box>
              <Switch
                checked={smsPrefs.rideRequests}
                onChange={handlePrefChange("rideRequests")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 2 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Referral approval requests
              </Typography>
              <Switch
                checked={smsPrefs.referralApprovals}
                onChange={handlePrefChange("referralApprovals")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 3 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Route alerts
              </Typography>
              <Switch
                checked={smsPrefs.routeAlerts}
                onChange={handlePrefChange("routeAlerts")}
                sx={switchSx}
              />
            </Row>
            <Divider sx={{ borderColor: BORDER }} />

            {/* Row 4 */}
            <Row sx={{ py: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: TEXT_PRIMARY }}>
                Community news and tips
              </Typography>
              <Switch
                checked={smsPrefs.communityNews}
                onChange={handlePrefChange("communityNews")}
                sx={switchSx}
              />
            </Row>
          </Stack>

          <Typography sx={{ fontSize: 12.5, color: TEXT_MUTED, mt: 2, lineHeight: 1.6 }}>
            Message and data rates may apply. Reply STOP to opt out, HELP for help. Verification codes are always sent.
          </Typography>
        </Section>

        {/* ─── 4. Legal Links ─── */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2, sm: 2.5 },
            mb: 2.5,
            borderRadius: 2.5,
            border: `1px solid ${BORDER}`,
            bgcolor: "#fff",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 4 },
            }}
          >
            <Typography component="a" href="/terms" sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Terms of Service
            </Typography>
            <Typography component="a" href="/privacy" sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Privacy Policy
            </Typography>
            <Typography component="a" href="/sms-terms" sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              SMS terms
            </Typography>
            <Typography component="a" href="/guidelines" sx={{ fontSize: 13.5, color: RUST, fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Community guidelines
            </Typography>
          </Box>
        </Paper>

        {/* ─── 5. Delete Account ─── */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 2.5,
            border: `1px solid #F4C7C3`,
            bgcolor: "#FDF2F2",
            boxSizing: "border-box",
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#991B1B", mb: 1 }}>
            Delete my account
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: "#7A1F1A", mb: 3, lineHeight: 1.6 }}>
            Removes your profile and posts. Reviews you wrote stay anonymously. Members you vouched for keep their access. This can't be undone.
          </Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={handleDeleteAccount}
            sx={{
              bgcolor: "#991B1B",
              color: "#fff",
              textTransform: "none",
              fontWeight: 700,
              px: 3.5,
              py: 1.25,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#7A1F1A" },
            }}
          >
            Delete account
          </Button>
        </Paper>

      </Box>
    </Box>
  );
};

export default MyProfileSettings;