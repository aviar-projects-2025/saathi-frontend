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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ p: { xs: 1.75, sm: 2 } }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Avatar
              src={profileImage || undefined}
              sx={{
                width: 44,
                height: 44,
                bgcolor: bg,
                color: color,
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {!profileImage &&
                `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                fontWeight={700}
                sx={{ fontSize: { xs: 14.5, sm: 15.5 }, color: "#1a1a1a" }}
              >
                {firstName} {lastName}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "text.secondary",
                  mt: 0.25,
                  overflowWrap: "anywhere",
                }}
              >
                {[city, language, "phone verified", "requested 2 days ago", "expires in 12 days"]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
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
                bgcolor: GREEN,
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13.5,
                px: 2.5,
                py: 0.85,
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
                color: RED,
                borderColor: RED,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13.5,
                px: 2.5,
                py: 0.85,
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
            px: { xs: 1.75, sm: 2 },
            py: 1.25,
          }}
        >
          <Typography
            sx={{ fontSize: 12.5, color: "#6B4E00", lineHeight: 1.5 }}
          >
            By approving, you are vouching for{" "}
            <Box component="span" sx={{ fontWeight: 700, color: SAFFRON_DARK }}>
              {firstName}
            </Box>
            . If she breaks community rules, your own standing is affected.
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
        spacing={1.5}
      >
        <Stack
          direction="row"
          spacing={1.5}
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
              width: { xs: 38, sm: 42 },
              height: { xs: 38, sm: 42 },
              cursor: users ? "pointer" : "default",
              bgcolor: bg,
              color: color,
              fontWeight: 700,
              fontSize: { xs: 14, sm: 15 },
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
              sx={{ fontSize: { xs: 13, sm: 14.5 }, color: "text.primary" }}
            >
              {firstName} {lastName}
            </Typography>
            <Typography
              color="text.secondary"
              noWrap
              sx={{ fontSize: { xs: 11, sm: 12.5 }, mt: 0.25 }}
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
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.3,
            px: 1.25,
            py: 0.4,
            borderRadius: 5,
            flexShrink: 0,
          }}
        >
          {isApproved ? (
            <CheckCircleIcon sx={{ fontSize: 13 }} />
          ) : (
            <CancelIcon sx={{ fontSize: 13 }} />
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
     Generate a fresh tokenized invite link from the backend.
     Always returns the raw URL so callers can use it immediately.
  ----------------------------------------------------------- */
  const generateShareLink = async () => {
    if (!user?.id) return null;
    setShareLinkLoading(true);
    try {
      const res = await axios.post(`${Api}/referralInvite/link`, {
        referredBy: user.id,
      });
      if (res.data?.status && res.data?.link) {
        setShareLink(res.data.link);
        return res.data.link;
      } else {
        toast.error("Unable to generate invite link", toasts);
        return null;
      }
    } catch (error) {
      console.error("Generate invite link error:", error);
      toast.error(
        error.response?.data?.message || "Unable to generate invite link",
        toasts
      );
      return null;
    } finally {
      setShareLinkLoading(false);
    }
  };

  /* Pre-generate on mount so the link text isn't empty */
  useEffect(() => {
    if (user?.id) {
      generateShareLink();
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

  const LoadingSpinner = () => (
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} thickness={4} sx={{ color: "#FF9933" }} />
    </Box>
  );

  const EmptyState = ({ title, subtitle }) => (
    <Box sx={{ py: { xs: 5, sm: 7 }, textAlign: "center" }}>
      <PeopleAltOutlinedIcon
        sx={{ fontSize: 44, color: "text.disabled", mb: 1.5 }}
      />
      <Typography
        fontWeight={600}
        color="text.primary"
        sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
      >
        {title}
      </Typography>
      <Typography
        color="text.secondary"
        sx={{ mt: 0.75, fontSize: { xs: "0.78rem", sm: "0.85rem" } }}
      >
        {subtitle}
      </Typography>
    </Box>
  );

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
        minHeight: 56,
        px: 2,
        "&.Mui-expanded": { minHeight: 56 },
      },
      "& .MuiAccordionSummary-content": {
        my: 1.5,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        "&.Mui-expanded": { my: 1.5 },
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

  return (
    <PageLayout>
      <Box
        sx={{
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, sm: 3 },
          pb: 6,
          width: "100%",
          maxWidth: 980,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ color: "text.primary", mb: 2.5, fontSize: { xs: 20, sm: 24 } }}
        >
          My Referrals
        </Typography>

        {/* Invite Link Card */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            borderRadius: 3,
            borderColor: "divider",
            bgcolor: "#FFFDF9",
            backgroundImage:
              "linear-gradient(135deg, #FFFDF9 0%, #FFF9F2 100%)",
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: SAFFRON_LIGHT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LinkIcon sx={{ fontSize: 18, color: SAFFRON }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ letterSpacing: 0.6, fontSize: 10.5 }}
                >
                  YOUR INVITE LINK
                </Typography>
                {/* <Typography
                  fontWeight={600}
                  sx={{
                    overflowWrap: "anywhere",
                    fontSize: { xs: "0.82rem", sm: "0.9rem" },
                    color: "text.primary",
                    lineHeight: 1.4,
                    wordBreak: "break-all",
                  }}
                >
                  {shareLinkLoading
                    ? "Generating your invite link..."
                    : shareLink || "Unable to load invite link"}
                </Typography> */}
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
                disabled={shareLinkLoading}
                onClick={async () => {
                  const link = await generateShareLink();
                  if (link) handleCopy(link);
                }}
                sx={{
                  bgcolor: SAFFRON,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: SAFFRON_DARK, boxShadow: "none" },
                  "&.Mui-disabled": { bgcolor: "#E3C9BE", color: "#fff" },
                }}
              >
                {shareLinkLoading ? "Generating..." : "Copy link"}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<WhatsAppIcon sx={{ fontSize: 16 }} />}
                disabled={shareLinkLoading}
                onClick={async () => {
                  const link = await generateShareLink();
                  if (!link) return;

                  const message = `Hi! Join me on Saathi Rides — a trusted community for rides and travel companionship.

Sign up with my invite link:
${link}`;

                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(message)}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                sx={{
                  color: SAFFRON,
                  borderColor: `${SAFFRON}55`,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
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
                  color: SAFFRON,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
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
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                fontWeight={700}
                sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" } }}
              >
                Pending your approval
              </Typography>
              <Box
                sx={{
                  bgcolor: referrals.length ? SAFFRON : "#e0e0e0",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 22,
                  height: 22,
                  borderRadius: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 0.75,
                }}
              >
                {referrals.length}
              </Box>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pt: 0, pb: 2 }}>
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

        {/* ---------- APPROVED + REJECTED (single accordion) ---------- */}
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
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Typography
                fontWeight={700}
                sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" } }}
              >
                {historyTitle}
              </Typography>

              {approvedCount > 0 && (
                <Box
                  sx={{
                    bgcolor: GREEN,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 22,
                    height: 22,
                    borderRadius: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.75,
                  }}
                >
                  {approvedCount}
                </Box>
              )}

              {rejectedCount > 0 && (
                <Box
                  sx={{
                    bgcolor: RED,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 22,
                    height: 22,
                    borderRadius: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.75,
                  }}
                >
                  {rejectedCount}
                </Box>
              )}
            </Stack>
          </AccordionSummary>

          <AccordionDetails sx={{ px: { xs: 1.5, sm: 2 }, pt: 0, pb: 2 }}>
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
                        fontSize: 11,
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
                        fontSize: 11,
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
              width: { xs: "92%", sm: "auto" },
            }}
          >
            <Box
              sx={{
                position: "relative",
                bgcolor: "white",
                width: { xs: "100%", sm: 400 },
                maxWidth: 400,
                borderRadius: 3,
                p: { xs: 2.5, sm: 3 },
                boxShadow: 24,
              }}
            >
              <IconButton
                onClick={handleCloseShare}
                size="small"
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
                sx={{ fontSize: "1rem", mb: 0.5, pr: 3 }}
              >
                Invite your friends
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: 12.5, mb: 2.5 }}
              >
                Send a referral link directly to their phone
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.25,
                  mb: 2.5,
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
                    fontSize: 12,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    mr: 1,
                    color: "text.secondary",
                  }}
                >
                  {shareLinkLoading ? "Generating link..." : shareLink}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton
                    size="small"
                    disabled={shareLinkLoading}
                    onClick={async () => {
                      const link = await generateShareLink();
                      if (link) handleCopy(link);
                    }}
                    sx={{ flexShrink: 0, color: SAFFRON }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Paper>

              <Stack
                direction="row"
                spacing={1}
                sx={{ width: "100%", mb: 2.5 }}
              >
                {isProduction && (
                  <TextField
                    size="small"
                    value="US +1"
                    disabled
                    sx={{
                      width: 100,
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
                    sx={{ width: 100 }}
                  >
                    <MenuItem value="+91">🇮🇳 +91</MenuItem>
                    <MenuItem value="+1">🇺🇸 +1</MenuItem>
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
                  InputProps={{ sx: { fontSize: 13.5 } }}
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
                    fontSize: 13,
                    py: 0.85,
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
                    fontSize: 13,
                    py: 0.85,
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