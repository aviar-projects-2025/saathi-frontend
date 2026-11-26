import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    Typography,
    IconButton,
    Button,
    Box,
    Stack,
    Divider,
    Skeleton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MessageIcon from "@mui/icons-material/Message";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarIcon from "@mui/icons-material/Star";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import axios from "axios";

import ProtectedAvatar from "../components/ProtectedAvatar";
import { useUser } from "../context/userConetext";
import { useChatModal } from "../context/ChatModalContext";
import Api from "../Api";

const SAFFRON = "#FF9933";

/* ─────────────────────────────────────────────────────────────
   Helpers — read the referrer ("who vouched") from the profile.
   Accepts several common field shapes so the modal works
   regardless of how the API nests it.
   ───────────────────────────────────────────────────────────── */
const getReferrerName = (p) => {
    if (!p) return "";

    if (typeof p.referredByName === "string" && p.referredByName.trim()) {
        return p.referredByName.trim();
    }
    if (typeof p.referrerName === "string" && p.referrerName.trim()) {
        return p.referrerName.trim();
    }

    const nested = p.referredBy || p.referrer || p.vouchedBy;
    if (nested && typeof nested === "object") {
        if (typeof nested.name === "string" && nested.name.trim()) {
            return nested.name.trim();
        }
        const composed = `${nested.firstName || ""} ${nested.lastName || ""}`.trim();
        if (composed) return composed;
    }

    return "";
};

const getApprovalDate = (p) => {
    if (!p) return null;
    return (
        p.approvedAt ||
        p.approvalDate ||
        (p.referredBy && p.referredBy.approvedAt) ||
        null
    );
};

const getMembersReferredCount = (p) => {
    if (!p) return null;
    if (typeof p.membersReferred === "number") return p.membersReferred;
    if (typeof p.referredMembers === "number") return p.referredMembers;
    if (Array.isArray(p.referredMembers)) return p.referredMembers.length;
    return null;
};

const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const ProfileModal = ({
    open,
    onClose,
    selectedProfile,
    onMessage,
    currentUser,
}) => {
    const user = useUser();
    const { openChatWith } = useChatModal();
    const isOwnProfile = selectedProfile?._id === user?.currentUser?._id;

    /* ─────────────────────────────────────────────────────────
       Fetch the FULL profile by id whenever the modal opens.
       `selectedProfile` is often a trimmed user object (from a
       ride/passenger list) with no referrer/bio/rating, so we
       hydrate it from GET /users/:id.
       ───────────────────────────────────────────────────────── */
    const [fullProfile, setFullProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const profileId = selectedProfile?._id || selectedProfile?.id;

    useEffect(() => {
        if (!open || !profileId) return;

        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                const token = localStorage.getItem("token");
                const res = await axios.get(`${Api}/users/${profileId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (cancelled) return;
                setFullProfile(res?.data?.data || null);
            } catch (err) {
                // Non-fatal: fall back to the partial profile
                if (!cancelled) setFullProfile(null);
            } finally {
                if (!cancelled) setLoadingProfile(false);
            }
        };

        console.log(fullProfile,'fullProfile')

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [open, profileId]);

    /* Merge: start with the partial, overlay the full profile */
    const p = { ...(selectedProfile || {}), ...(fullProfile || {}) };

    const fullName =
        `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
        p?.name ||
        "Community Member";

    const city = p?.city || p?.location?.city || "Location not added";
    const ratingValue = Number(p?.averageRating || p?.rating || 0);
    const rideCount = Number(p?.completedRideCount || 0);

    const memberSince = p?.createdAt
        ? new Date(p.createdAt).getFullYear()
        : null;

    const isVerified = Boolean(
        p?.isPhoneVerified || p?.phoneVerified || p?.isVerified
    );

    const bio =
        p?.bio ||
        p?.about ||
        p?.profession ||
        "This member hasn't written a bio yet.";

    /* ── Referral ("who vouched") data ── */
    const referrerName = getReferrerName(p);
    const approvedOn = formatDate(getApprovalDate(p));
    const membersReferred = getMembersReferredCount(p);
    const hasReferralInfo = Boolean(
        referrerName || approvedOn || membersReferred != null
    );

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return "Excellent";
        if (rating >= 4.0) return "Very Good";
        if (rating >= 3.0) return "Good";
        if (rating > 0) return "Fair";
        return "New Member";
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 5,
                        backgroundColor: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        boxShadow:
                            "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255, 255, 255, 0.5)",
                        overflow: "hidden",
                        position: "relative",
                    },
                },
                backdrop: {
                    sx: {
                        backgroundColor: "rgba(20, 15, 10, 0.6)",
                    },
                },
            }}
        >
            {/* Close Button */}
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    color: "#4A4A4A",
                    bgcolor: "rgba(255,255,255,0.6)",
                    "&:hover": { bgcolor: "#fff", color: "#000" },
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>

            <DialogContent sx={{ p: { xs: 3, sm: 4 }, overflow: "visible" }}>
                <Stack spacing={3} alignItems="center">
                    {/* ── Top: Avatar & Name ── */}
                    <Stack alignItems="center" spacing={1}>
                        <ProtectedAvatar
                            src={p?.profileImageUrl || ""}
                            alt={fullName}
                            sx={{
                                width: 100,
                                height: 100,
                                bgcolor: "rgba(255, 153, 51, 0.1)",
                                color: SAFFRON,
                                fontSize: "2.5rem",
                                fontWeight: 800,
                                border: "3px solid #fff",
                                boxShadow: "0 8px 24px rgba(255, 153, 51, 0.25)",
                            }}
                        >
                            {!p?.profileImageUrl &&
                                `${p?.firstName?.[0] || ""}${
                                    p?.lastName?.[0] || p?.name?.[0] || ""
                                }`.toUpperCase()}
                        </ProtectedAvatar>

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{ mt: 1 }}
                        >
                            <Typography
                                fontWeight={800}
                                fontSize="1.35rem"
                                color="#1F1A17"
                                letterSpacing={-0.5}
                            >
                                {fullName}
                            </Typography>
                            {isVerified && (
                                <VerifiedOutlinedIcon
                                    sx={{ color: "#2E7D32", fontSize: 22 }}
                                />
                            )}
                        </Stack>

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{ color: "#666" }}
                        >
                            <PlaceOutlinedIcon sx={{ fontSize: 16 }} />
                            <Typography fontSize="0.85rem" fontWeight={500}>
                                {city}
                            </Typography>
                            {memberSince && (
                                <>
                                    <Typography fontSize="0.85rem" sx={{ mx: 0.5 }}>
                                        •
                                    </Typography>
                                    <Typography fontSize="0.85rem" fontWeight={500}>
                                        Member since {memberSince}
                                    </Typography>
                                </>
                            )}
                        </Stack>
                    </Stack>

                    {/* ── TRUST PANEL: Who vouched for this member ── */}
                    {loadingProfile && !hasReferralInfo ? (
                        <Skeleton
                            variant="rounded"
                            height={64}
                            sx={{ width: "100%", borderRadius: 3 }}
                        />
                    ) : (
                        hasReferralInfo && (
                            <Box
                                sx={{
                                    width: "100%",
                                    bgcolor: "rgba(46, 125, 50, 0.06)",
                                    borderRadius: 3,
                                    border: "1px solid rgba(46, 125, 50, 0.2)",
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    alignItems="flex-start"
                                >
                                    <Box
                                        sx={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: "50%",
                                            bgcolor: "rgba(46, 125, 50, 0.12)",
                                            color: "#2E7D32",
                                            display: "grid",
                                            placeItems: "center",
                                            flexShrink: 0,
                                            mt: 0.2,
                                        }}
                                    >
                                        <PersonAddAlt1OutlinedIcon
                                            sx={{ fontSize: 18 }}
                                        />
                                    </Box>

                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        {referrerName && (
                                            <Typography
                                                fontSize="0.88rem"
                                                color="#1F1A17"
                                                lineHeight={1.5}
                                            >
                                                <strong>
                                                    Vouched for by {referrerName}
                                                </strong>
                                                {approvedOn && (
                                                    <Typography
                                                        component="span"
                                                        fontSize="0.88rem"
                                                        color="#555"
                                                    >
                                                        {" "}
                                                        · approved on {approvedOn}
                                                    </Typography>
                                                )}
                                            </Typography>
                                        )}

                                        {!referrerName && approvedOn && (
                                            <Typography
                                                fontSize="0.88rem"
                                                color="#1F1A17"
                                            >
                                                Approved on {approvedOn}
                                            </Typography>
                                        )}

                                        {/* {membersReferred != null && (
                                            <Typography
                                                fontSize="0.78rem"
                                                color="#555"
                                                sx={{ mt: 0.4 }}
                                            >
                                                {membersReferred}{" "}
                                                {membersReferred === 1
                                                    ? "member"
                                                    : "members"}{" "}
                                                vouched for
                                            </Typography>
                                        )} */}
                                    </Box>
                                </Stack>
                            </Box>
                        )
                    )}

                    {/* ── Middle: Rich Stats Box ── */}
                    <Box
                        sx={{
                            width: "100%",
                            bgcolor: "rgba(255, 255, 255, 0.6)",
                            borderRadius: 4,
                            border: "1px solid rgba(255, 255, 255, 0.8)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                            py: 2,
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}
                    >
                        <Stack alignItems="center" spacing={0.5}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <StarIcon
                                    sx={{ color: SAFFRON, fontSize: 22 }}
                                />
                                <Typography
                                    fontWeight={800}
                                    fontSize="1.2rem"
                                    color="#1F1A17"
                                >
                                    {ratingValue > 0
                                        ? ratingValue.toFixed(1)
                                        : "—"}
                                </Typography>
                            </Stack>
                            <Typography
                                fontSize="0.72rem"
                                fontWeight={600}
                                color="#777"
                                textTransform="uppercase"
                                letterSpacing={0.5}
                            >
                                {getRatingLabel(ratingValue)}
                            </Typography>
                        </Stack>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ borderColor: "rgba(0,0,0,0.06)" }}
                        />

                        <Stack alignItems="center" spacing={0.5}>
                            <Typography
                                fontWeight={800}
                                fontSize="1.2rem"
                                color="#1F1A17"
                            >
                                {rideCount}
                            </Typography>
                            <Typography
                                fontSize="0.72rem"
                                fontWeight={600}
                                color="#777"
                                textTransform="uppercase"
                                letterSpacing={0.5}
                            >
                                Rides Given
                            </Typography>
                        </Stack>
                    </Box>

                    {/* ── Bio ── */}
                    <Box sx={{ width: "100%", textAlign: "left" }}>
                        <Typography
                            fontSize="0.75rem"
                            fontWeight={700}
                            color="#888"
                            textTransform="uppercase"
                            letterSpacing={0.5}
                            mb={1}
                        >
                            About {p?.firstName}
                        </Typography>
                        <Typography
                            fontSize="0.92rem"
                            color="#3F3934"
                            lineHeight={1.6}
                            sx={{
                                fontStyle: !bio ? "italic" : "normal",
                                opacity: !bio ? 0.6 : 1,
                            }}
                        >
                            {bio}
                        </Typography>
                    </Box>

                    {/* ── Call to Action ── */}
                    {!isOwnProfile && profileId && (
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<MessageIcon />}
                            onClick={() => {
                                onMessage?.(p);
                                openChatWith(p);
                                onClose?.();
                            }}
                            sx={{
                                mt: 1,
                                py: 1.2,
                                borderRadius: 3,
                                backgroundColor: "#1F1A17",
                                color: "#fff",
                                fontWeight: 700,
                                textTransform: "none",
                                fontSize: "0.95rem",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                                "&:hover": {
                                    backgroundColor: "#000",
                                    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                                },
                            }}
                        >
                            Message {p?.firstName || "Member"}
                        </Button>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;