import React, { useEffect, useState, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkIcon from "@mui/icons-material/Link";
import PageLayout from "../../components/PageLayout";
import axios from "axios";
import Api from "../../Api";
import { useUser } from "../../context/userConetext.jsx";
import { toast } from "react-toastify";
import { useNotifications } from "../../context/NotificationContext";
import { useReferral } from "../../context/ReferralContext";
import ToastConfig from "../../components/ToastConfig";
import ProfileModal from "../Avatar.jsx";

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FFF3E8";
const SAFFRON_DARK = "#CF5206";
const GREEN = "#1E8E3E";
const GREEN_DARK = "#166A2E";
const GREEN_LIGHT = "#E6F4EA";
const RED = "#C5221F";
const RED_LIGHT = "#FCE8E6";

const isProduction =
  import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "production";
const isTesting = import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "testing";

/* ----------------------------------------------------------------
   Fluid font sizes — scale smoothly from 320px phones to large
   desktops. clamp(min, preferred, max)
---------------------------------------------------------------- */
const FS = {
  title: "clamp(1.25rem, 1.05rem + 1vw, 1.75rem)", // page heading
  h2: "clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem)", // accordion titles
  name: "clamp(0.88rem, 0.82rem + 0.35vw, 1rem)", // user names
  body: "clamp(0.8rem, 0.76rem + 0.25vw, 0.9rem)", // body text
  small: "clamp(0.72rem, 0.7rem + 0.18vw, 0.82rem)", // sub text
  tiny: "clamp(0.64rem, 0.62rem + 0.12vw, 0.72rem)", // badges, captions
  btn: "clamp(0.78rem, 0.75rem + 0.25vw, 0.88rem)", // buttons
  input: "clamp(0.85rem, 0.8rem + 0.25vw, 0.95rem)", // inputs (>=14px avoids iOS zoom)
};

/* ---------- Avatar color palette (deterministic per name) ---------- */
const AVATAR_COLORS = [
  { bg: "#FCE8E6", color: "#C5221F" },
  { bg: "#E8F0FE", color: "#1A73E8" },
  { bg: "#E6F4EA", color: "#1E8E3E" },
  { bg: "#F3E8FD", color: "#8430CE" },
  { bg: "#FEF7E0", color: "#B06000" },
];

const colorFor = (name = "") => {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

/* ---------- Shared sx helpers ---------- */
const countBadgeSx = (bg) => ({
  bgcolor: bg,
  color: "#fff",
  fontSize: FS.tiny,
  fontWeight: 700,
  minWidth: 22,
  height: 22,
  borderRadius: "11px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: 0.75,
  flexShrink: 0,
});

/* ================================================================
   SMALL SHARED COMPONENTS (defined outside the page so they are
   not re-created on every render)
   ================================================================ */
const LoadingSpinner = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 4, sm: 6 } }}>
    <CircularProgress size={32} thickness={4} sx={{ color: "#FF9933" }} />
  </Box>
);

const EmptyState = ({ title, subtitle }) => (
  <Box sx={{ py: { xs: 4, sm: 6, md: 7 }, px: 1, textAlign: "center" }}>
    <PeopleAltOutlinedIcon
      sx={{ fontSize: { xs: 36, sm: 44 }, color: "text.disabled", mb: 1.5 }}
    />
    <Typography fontWeight={600} color="text.primary" sx={{ fontSize: FS.name }}>
      {title}
    </Typography>
    <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: FS.small }}>
      {subtitle}
    </Typography>
  </Box>
);

/* ================================================================
   PENDING CARD
   ================================================================ */
const PendingCard = memo(
  ({ user: u, onApprove, onReject, loading, actionType }) => {
    const firstName = u?.firstName || u?.data?.user?.firstName || "";
    const lastName = u?.lastName || u?.data?.user?.lastName || "";
    const userId = u?._id || u?.id || u?.data?.userId;
    const profileImage = u?.profileImage || u?.data?.profileImage || "";
    const city = u?.city || "";
    const language = Array.isArray(u?.language)
      ? u.language.join(", ")
      : u?.language || "";

    const { bg, color } = colorFor(`${firstName}${lastName}`);
    const isApproveLoading = loading && actionType === "approve";
    const isRejectLoading = loading && actionType === "reject";

    return (
      <Paper
        elevation={0}
        sx={{
          border: `1.5px solid ${SAFFRON}`,
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ p: { xs: 1.5, sm: 2 } }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1.25, sm: 1.5 }}
            alignItems="center"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Avatar
              src={profileImage || undefined}
              sx={{
                width: { xs: 40, sm: 44 },
                height: { xs: 40, sm: 44 },
                bgcolor: bg,
                color: color,
                fontWeight: 700,
                fontSize: FS.body,
                flexShrink: 0,
              }}
            >
              {!profileImage &&
                `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={700}
                sx={{
                  fontSize: FS.name,
                  color: "#1a1a1a",
                  overflowWrap: "anywhere",
                  lineHeight: 1.3,
                }}
              >
                {firstName} {lastName}
              </Typography>
              <Typography
                sx={{
                  fontSize: FS.small,
                  color: "text.secondary",
                  mt: 0.25,
                  overflowWrap: "anywhere",
                  lineHeight: 1.4,
                }}
              >
                {[city, language, "phone verified"]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Box>
          </Stack>

          {/* Buttons: equal-width row on mobile, natural width on desktop */}
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              flexShrink: 0,
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Button
              variant="contained"
              size="small"
              disabled={loading}
              onClick={() => onApprove?.(userId)}
              startIcon={
                isApproveLoading ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : null
              }
              sx={{
                flex: { xs: 1, md: "none" },
                bgcolor: GREEN,
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                fontSize: FS.btn,
                px: { xs: 1.5, sm: 2.5 },
                py: 0.85,
                minHeight: 38,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: GREEN_DARK, boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "#9bc5a5", color: "#fff" },
              }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={loading}
              onClick={() => onReject?.(userId)}
              sx={{
                flex: { xs: 1, md: "none" },
                color: RED,
                borderColor: RED,
                textTransform: "none",
                fontWeight: 700,
                fontSize: FS.btn,
                px: { xs: 1.5, sm: 2.5 },
                py: 0.85,
                minHeight: 38,
                borderRadius: 2,
                borderWidth: 1.5,
                "&:hover": {
                  borderColor: RED,
                  borderWidth: 1.5,
                  bgcolor: RED_LIGHT,
                },
                "&.Mui-disabled": {
                  color: "#d99c9a",
                  borderColor: "#d99c9a",
                },
              }}
            >
              {isRejectLoading ? "Rejecting..." : "Reject"}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            bgcolor: "#FFF8E1",
            borderTop: `1px solid ${SAFFRON}33`,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.25 },
          }}
        >
          <Typography
            sx={{ fontSize: FS.small, color: "#6B4E00", lineHeight: 1.5 }}
          >
            By approving, you are vouching for{" "}
            <Box component="span" sx={{ fontWeight: 700, color: SAFFRON_DARK }}>
              {firstName}
            </Box>
            . If He/she breaks community rules, your own standing is affected.
            Only approve people you know personally.
          </Typography>
        </Box>
      </Paper>
    );
  }
);

/* ================================================================
   APPROVED / REJECTED ROW
   ================================================================ */
const StatusRow = memo(({ user: u, status }) => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [users] = useState(null);

  const firstName = u?.data?.user?.firstName || u?.firstName || "";
  const lastName = u?.data?.user?.lastName || u?.lastName || "";
  const profileImage = u?.data?.profileImage || u?.profileImage || "";
  const phone = u?.mobile || u?.mobileNumber || "";

  const { bg, color } = colorFor(`${firstName}${lastName}`);
  const isApproved = status === "Approved";

  const formatMaskedPhone = (phone) => {
    if (!phone) return "";
    const digits = String(phone).replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return isTesting
      ? `+91 (XXX) XXX-${last4}`
      : `+1 (XXX) XXX-${last4}`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.25, sm: 1.75 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: isApproved ? GREEN : RED,
          bgcolor: isApproved ? GREEN_LIGHT : RED_LIGHT,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={{ xs: 1, sm: 1.5 }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1.25, sm: 1.5 }}
          alignItems="center"
          sx={{ minWidth: 0, flex: 1 }}
        >
          <Avatar
            src={profileImage || undefined}
            alt={`${firstName} ${lastName}`}
            onClick={() => {
              if (!users) return;
              setSelectedProfile(users);
              setProfileModalOpen(true);
            }}
            sx={{
              width: { xs: 36, sm: 42 },
              height: { xs: 36, sm: 42 },
              cursor: users ? "pointer" : "default",
              bgcolor: bg,
              color: color,
              fontWeight: 700,
              fontSize: FS.body,
              flexShrink: 0,
            }}
          >
            {!profileImage && (
              <>
                {firstName?.[0]?.toUpperCase()}
                {lastName?.[0]?.toUpperCase()}
              </>
            )}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={600}
              noWrap
              sx={{ fontSize: FS.name, color: "text.primary" }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography
              color="text.secondary"
              noWrap
              sx={{ fontSize: FS.small, mt: 0.25 }}
            >
              {formatMaskedPhone(phone)}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            bgcolor: isApproved ? GREEN_LIGHT : RED_LIGHT,
            color: isApproved ? GREEN : RED,
            fontSize: FS.tiny,
            fontWeight: 700,
            letterSpacing: 0.3,
            px: { xs: 1, sm: 1.25 },
            py: 0.4,
            borderRadius: 5,
            flexShrink: 0,
          }}
        >
          {isApproved ? (
            <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
          ) : (
            <CancelIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
          )}
          {isApproved ? "Approved" : "Rejected"}
        </Box>
      </Stack>

      <ProfileModal
        open={profileModalOpen}
        selectedProfile={selectedProfile}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedProfile(null);
        }}
      />
    </Paper>
  );
});

/* ================================================================
   MAIN PAGE
   ================================================================ */
const MyReferrals = () => {
  const [openShare, setOpenShare] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [referrals, setMyReferrals] = useState([]);
  const [approvedReferrals, setApprovedReferrals] = useState([]);
  const [rejectedReferrals, setRejectedReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionState, setActionState] = useState({ id: null, type: null });
  const [mobile_number, setMobile_number] = useState("");
  const [countryCode, setCountryCode] = useState("+1");

  // Permanent Link State
  const [shareLink, setShareLink] = useState("");
  const [shareLinkLoading, setShareLinkLoading] = useState(false);

  const { notifications } = useNotifications();
  const { getPendingReferralCount } = useReferral();
  const { completion } = useUser();
  const toasts = ToastConfig();

  const getUser = () => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  const user = getUser();

  /* -----------------------------------------------------------
     Fetch the PERMANENT tokenized invite link from the backend.
     This runs once on mount. The token does not change.
  ----------------------------------------------------------- */
  const fetchShareLink = async () => {
    if (!user?.id) return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    setShareLinkLoading(true);
    try {
      const res = await axios.post(
        `${Api}/referralInvite/link`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status && res.data?.link) {
        setShareLink(res.data.link);
        return res.data.link;
      } else {
        toast.error("Unable to load invite link", toasts);
        return null;
      }
    } catch (error) {
      console.error("Fetch invite link error:", error);
      toast.error(
        error.response?.data?.message || "Unable to load invite link",
        toasts
      );
      return null;
    } finally {
      setShareLinkLoading(false);
    }
  };

  // Fetch permanent link on mount
  useEffect(() => {
    if (user?.id) {
      fetchShareLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCopy = (value) => {
    if (!value) return;
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
        .then(() => toast.success("Copied to Clipboard!", toasts))
        .catch(() => toast.error("Failed to copy", toasts));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Copied to Clipboard!", toasts);
      } catch (err) {
        toast.error("Failed to copy", toasts);
      }
      document.body.removeChild(textArea);
    }
  };

  const getReferrals = async () => {
    if (!user?.id) {
      toast.error("User not found", toasts);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(`${Api}/users/${user.id}/referrals`);

      const {
        pending = [],
        approved = [],
        rejected = [],
      } = res.data?.data || {};

      setMyReferrals(pending);
      setApprovedReferrals(approved);
      setRejectedReferrals(rejected);

      if (getPendingReferralCount) getPendingReferralCount();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch referrals";
      toast.error(errorMsg, toasts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReferrals();
  }, []);

  useEffect(() => {
    if (notifications?.length) {
      const filtered = notifications.filter(
        (n) =>
          n.type === "referral_pending" ||
          n.type === "referral_approved" ||
          n.type === "referral_rejected"
      );
      if (filtered.length) getReferrals();
    }
  }, [notifications]);

  const handleApprove = async (userId) => {
    if (!userId) return;
    try {
      setActionState({ id: userId, type: "approve" });
      await axios.patch(`${Api}/referrals/${userId}`, {
        refApprove: "Approved",
      });
      toast.success("Referral approved!", toasts);
      getReferrals();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve",
        toasts
      );
    } finally {
      setActionState({ id: null, type: null });
    }
  };

  const handleReject = async (userId) => {
    if (!userId) return;
    try {
      setActionState({ id: userId, type: "reject" });
      await axios.patch(`${Api}/referrals/${userId}`, {
        refApprove: "Rejected",
      });
      toast.success("Referral rejected", toasts);
      getReferrals();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject",
        toasts
      );
    } finally {
      setActionState({ id: null, type: null });
    }
  };

  const handlelink = async () => {
    if (!mobile_number || mobile_number.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number", toasts);
      return;
    }
    if (!user?.id) {
      toast.error("User not found", toasts);
      return;
    }

    setInviteLoading(true);
    const fullMobileNumber = `${countryCode}${mobile_number}`;

    try {
      const response = await axios.post(
        `${Api}/referralInvite/`,
        { referredBy: user.id, mobile: fullMobileNumber },
        { withCredentials: true }
      );

      if (response.data.status) {
        toast.success(
          `Referral link sent to ${fullMobileNumber}`,
          toasts
        );
        setMobile_number("");
        handleCloseShare();
      } else {
        toast.error(
          response.data.message || "Unable to send invitation",
          toasts
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send referral invitation",
        toasts
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);

  const accordionSx = {
    disableGutters: true,
    elevation: 0,
    sx: {
      borderRadius: "12px !important",
      overflow: "hidden",
      "&:before": { display: "none" },
      border: "1px solid",
      borderColor: "divider",
      "& .MuiAccordionSummary-root": {
        minHeight: { xs: 50, sm: 56 },
        px: { xs: 1.5, sm: 2 },
        "&.Mui-expanded": { minHeight: { xs: 50, sm: 56 } },
      },
      "& .MuiAccordionSummary-content": {
        my: { xs: 1, sm: 1.5 },
        minWidth: 0,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        "&.Mui-expanded": { my: { xs: 1, sm: 1.5 } },
      },
      "& .MuiAccordionSummary-expandIconWrapper": {
        color: "text.secondary",
      },
    },
  };

  const approvedCount = approvedReferrals.length;
  const rejectedCount = rejectedReferrals.length;
  const totalHistory = approvedCount + rejectedCount;

  const historyTitleParts = [];
  if (approvedCount > 0) historyTitleParts.push(`Approved (${approvedCount})`);
  if (rejectedCount > 0) historyTitleParts.push(`Rejected (${rejectedCount})`);

  const historyTitle =
    historyTitleParts.length > 0
      ? historyTitleParts.join(" · ")
      : "Referral history";

  /* Shared styles for the three invite-link action buttons */
  const actionBtnBase = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: FS.btn,
    px: 2,
    py: 0.75,
    minHeight: 38,
    borderRadius: 2,
    whiteSpace: "nowrap",
    width: { xs: "100%", sm: "auto" },
  };

  return (
    <PageLayout>
      <Box
        sx={{
          px: { xs: 1.25, sm: 2, md: 3 },
          py: { xs: 2, sm: 3 },
          pb: { xs: 5, sm: 6 },
          width: "100%",
          maxWidth: 980,
          mx: "auto",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            color: "text.primary",
            mb: { xs: 2, sm: 2.5 },
            fontSize: FS.title,
          }}
        >
          My Referrals
        </Typography>

        {/* Invite Link Card */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            mb: { xs: 2, sm: 3 },
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "#FFFDF9",
            backgroundImage:
              "linear-gradient(135deg, #FFFDF9 0%, #FFF9F2 100%)",
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <Stack
              direction="row"
              alignItems="flex-start"
              spacing={{ xs: 1.25, sm: 1.5 }}
            >
              <Box
                sx={{
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  borderRadius: 2,
                  bgcolor: SAFFRON_LIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <LinkIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: SAFFRON }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{
                    display: "block",
                    letterSpacing: 0.6,
                    fontSize: FS.tiny,
                  }}
                >
                  YOUR PERMANENT INVITE LINK
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{
                    fontSize: FS.body,
                    color: "text.primary",
                    lineHeight: 1.4,
                    wordBreak: "break-all",
                    overflowWrap: "anywhere",
                    mb: 0.5,
                  }}
                >
                  {shareLinkLoading
                    ? "Generating your invite link..."
                    : shareLink || "Unable to load invite link"}
                </Typography>

                {/* Referral Code Display */}
                {user?.referralCode && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", fontSize: FS.tiny }}
                    >
                      Your Referral Code:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: FS.small,
                        fontWeight: 800,
                        color: SAFFRON_DARK,
                        letterSpacing: 0.5,
                        bgcolor: SAFFRON_LIGHT,
                        px: 1,
                        py: 0.2,
                        borderRadius: 1,
                        wordBreak: "break-all",
                      }}
                    >
                      {user.referralCode}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                size="small"
                onClick={() => handleCopy(shareLink)}
                disabled={!shareLink || shareLinkLoading}
                sx={{
                  ...actionBtnBase,
                  bgcolor: SAFFRON,
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": { bgcolor: SAFFRON_DARK, boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#E3C9BE", color: "#fff" },
                }}
              >
                Copy link
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                disabled={!shareLink || shareLinkLoading}
                onClick={() => {
                  if (!shareLink) return;
                  const message = `Hi! Join me on Saathi Rides — a trusted community for rides and travel companionship.

Sign up with my invite link:
${shareLink}`;

                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(message)}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                sx={{
                  ...actionBtnBase,
                  color: SAFFRON,
                  borderColor: `${SAFFRON}55`,
                  "&:hover": {
                    borderColor: SAFFRON,
                    bgcolor: SAFFRON_LIGHT,
                  },
                  "&.Mui-disabled": {
                    color: "#B99A8E",
                    borderColor: "#E3C9BE",
                  },
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={handleOpenShare}
                disabled={completion !== 100}
                sx={{
                  ...actionBtnBase,
                  color: SAFFRON,
                  "&:hover": { bgcolor: SAFFRON_LIGHT },
                }}
              >
                Invite by phone
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* ---------- PENDING ---------- */}
        <Accordion
          defaultExpanded
          {...accordionSx}
          sx={{
            ...accordionSx.sx,
            mb: 2,
            borderColor: referrals.length ? `${SAFFRON}66` : "divider",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ minWidth: 0 }}
            >
              <Typography fontWeight={700} sx={{ fontSize: FS.h2 }}>
                Pending your approval
              </Typography>
              <Box sx={countBadgeSx(referrals.length ? SAFFRON : "#e0e0e0")}>
                {referrals.length}
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, pt: 0, pb: 2 }}>
            {loading ? (
              <LoadingSpinner />
            ) : referrals.length === 0 ? (
              <EmptyState
                title="No Pending Approvals"
                subtitle="You don't have any pending referrals at the moment."
              />
            ) : (
              <Stack spacing={1.5}>
                {referrals.map((u) => (
                  <PendingCard
                    key={u._id || u.id}
                    user={u}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={actionState.id === (u._id || u.id)}
                    actionType={actionState.type}
                  />
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        {/* ---------- APPROVED + REJECTED ---------- */}
        <Accordion
          defaultExpanded
          {...accordionSx}
          sx={{
            ...accordionSx.sx,
            borderColor: totalHistory ? `${GREEN}33` : "divider",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              flexWrap="wrap"
              useFlexGap
              sx={{ minWidth: 0 }}
            >
              <Typography fontWeight={700} sx={{ fontSize: FS.h2 }}>
                {historyTitle}
              </Typography>

              {approvedCount > 0 && (
                <Box sx={countBadgeSx(GREEN)}>{approvedCount}</Box>
              )}

              {rejectedCount > 0 && (
                <Box sx={countBadgeSx(RED)}>{rejectedCount}</Box>
              )}
            </Stack>
          </AccordionSummary>

          <AccordionDetails sx={{ px: { xs: 1, sm: 2 }, pt: 0, pb: 2 }}>
            {loading ? (
              <LoadingSpinner />
            ) : totalHistory === 0 ? (
              <EmptyState
                title="No Referral History"
                subtitle="Approved and rejected members will appear here."
              />
            ) : (
              <Stack spacing={2.5}>
                {approvedCount > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: FS.tiny,
                        fontWeight: 700,
                        color: GREEN,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      Approved
                    </Typography>
                    <Stack spacing={1.25}>
                      {approvedReferrals.map((u) => (
                        <StatusRow
                          key={u._id || u.id}
                          user={u}
                          status="Approved"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {rejectedCount > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: FS.tiny,
                        fontWeight: 700,
                        color: RED,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        mb: 1,
                      }}
                    >
                      Rejected
                    </Typography>
                    <Stack spacing={1.25}>
                      {rejectedReferrals.map((u) => (
                        <StatusRow
                          key={u._id || u.id}
                          user={u}
                          status="Rejected"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Invite Modal */}
        <Modal
          open={openShare}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;
            handleCloseShare();
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "calc(100% - 24px)", sm: "auto" },
              maxHeight: "calc(100dvh - 24px)",
              display: "flex",
              justifyContent: "center",
              outline: "none",
            }}
          >
            <Box
              sx={{
                position: "relative",
                bgcolor: "white",
                width: { xs: "100%", sm: 420 },
                maxWidth: 420,
                maxHeight: "calc(100dvh - 24px)",
                overflowY: "auto",
                boxSizing: "border-box",
                borderRadius: 3,
                p: { xs: 2, sm: 3 },
                boxShadow: 24,
              }}
            >
              <IconButton
                onClick={handleCloseShare}
                size="small"
                aria-label="Close"
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "grey.500",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <Typography
                fontWeight={700}
                sx={{ fontSize: FS.name, mb: 0.5, pr: 4 }}
              >
                Invite by phone
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: FS.small, mb: { xs: 2, sm: 2.5 } }}
              >
                Send an SMS invite directly to their phone
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.25,
                  mb: { xs: 2, sm: 2.5 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#FAFAFA",
                  borderRadius: 2,
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontSize: FS.small,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                    mr: 1,
                    color: "text.secondary",
                  }}
                >
                  {shareLinkLoading ? "Loading link..." : shareLink}
                </Typography>
                <Tooltip title="Copy link">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Copy link"
                      disabled={shareLinkLoading || !shareLink}
                      onClick={() => handleCopy(shareLink)}
                      sx={{ flexShrink: 0, color: SAFFRON }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Paper>

              <Stack
                direction="row"
                spacing={1}
                sx={{ width: "100%", mb: { xs: 2, sm: 2.5 } }}
              >
                {isProduction && (
                  <TextField
                    size="small"
                    value="US +1"
                    disabled
                    sx={{
                      width: { xs: 84, sm: 100 },
                      flexShrink: 0,
                      "& .MuiInputBase-input": { fontSize: FS.input },
                      "& .MuiInputBase-input.Mui-disabled": {
                        color: "#555",
                        WebkitTextFillColor: "#555",
                      },
                    }}
                  />
                )}

                {isTesting && (
                  <TextField
                    select
                    size="small"
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      setMobile_number("");
                    }}
                    sx={{
                      width: { xs: 94, sm: 108 },
                      flexShrink: 0,
                      "& .MuiInputBase-input": { fontSize: FS.input },
                    }}
                  >
                    <MenuItem value="+91" sx={{ fontSize: FS.input }}>
                      🇮🇳 +91
                    </MenuItem>
                    <MenuItem value="+1" sx={{ fontSize: FS.input }}>
                      🇺🇸 +1
                    </MenuItem>
                  </TextField>
                )}

                <TextField
                  fullWidth
                  value={mobile_number}
                  type="text"
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setMobile_number(value);
                  }}
                  size="small"
                  placeholder="Mobile number"
                  InputProps={{ sx: { fontSize: FS.input } }}
                  sx={{ minWidth: 0 }}
                />
              </Stack>

              <Stack direction="row" spacing={1.25}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{
                    color: "text.secondary",
                    borderColor: "divider",
                    fontSize: FS.btn,
                    py: 0.85,
                    minHeight: 38,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: "grey.400",
                      bgcolor: "#fafafa",
                    },
                  }}
                  onClick={() => setMobile_number("")}
                >
                  Clear
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  sx={{
                    fontSize: FS.btn,
                    py: 0.85,
                    minHeight: 38,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    bgcolor: SAFFRON,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: SAFFRON_DARK,
                      boxShadow: "none",
                    },
                  }}
                  onClick={handlelink}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>
      </Box>
    </PageLayout>
  );
};

export default MyReferrals;