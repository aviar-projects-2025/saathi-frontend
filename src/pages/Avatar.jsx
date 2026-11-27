
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
const GREEN = "#2E7D32";
const DARK = "#1F1A17";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

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
        p.referredBy?.approvedAt ||
        null
    );
};

const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const getRatingLabel = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.0) return "Good";
    if (rating > 0) return "Fair";

    return "New Member";
};

/* ─────────────────────────────────────────────
   Reusable Section Heading
───────────────────────────────────────────── */

const SectionLabel = ({ children }) => (
    <Typography
        sx={{
            fontSize: { xs: "0.68rem", sm: "0.72rem" },
            fontWeight: 700,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            mb: 0.8,
        }}
    >
        {children}
    </Typography>
);

/* ─────────────────────────────────────────────
   Profile Modal
───────────────────────────────────────────── */

const ProfileModal = ({
    open,
    onClose,
    selectedProfile,
    onMessage,
    currentUser,
}) => {
    const user = useUser();
    const { openChatWith } = useChatModal();

    const profileId = selectedProfile?._id || selectedProfile?.id;

    const currentUserId =
        currentUser?._id ||
        user?.currentUser?._id;

    const isOwnProfile =
        String(profileId || "") === String(currentUserId || "");

    const [fullProfile, setFullProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    /* ─────────────────────────────────────────
       Fetch full profile
    ───────────────────────────────────────── */

    useEffect(() => {
        if (!open || !profileId) {
            setFullProfile(null);
            setLoadingProfile(false);
            return;
        }

        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setLoadingProfile(true);
                setFullProfile(null);

                const token = localStorage.getItem("token");

                const res = await axios.get(
                    `${Api}/users/${profileId}`,
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    }
                );

                if (!cancelled) {
                    setFullProfile(res?.data?.data || null);
                }
            } catch (error) {
                console.error("Failed to fetch profile:", error);

                if (!cancelled) {
                    setFullProfile(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingProfile(false);
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [open, profileId]);

    /* ─────────────────────────────────────────
       Merge profile data
    ───────────────────────────────────────── */

    const p = {
        ...(selectedProfile || {}),
        ...(fullProfile || {}),
    };

    const fullName =
        `${p?.firstName || ""} ${p?.lastName || ""}`.trim() ||
        p?.name ||
        "Community Member";

    const city =
        p?.city ||
        p?.location?.city ||
        "Location not added";

    const ratingValue = Number(
        p?.averageRating || p?.rating || 0
    );

    const rideCount = Number(
        p?.completedRideCount || 0
    );

    const memberSince = p?.createdAt
        ? new Date(p.createdAt).getFullYear()
        : null;

    const isVerified = Boolean(
        p?.isPhoneVerified ||
        p?.phoneVerified ||
        p?.isVerified
    );

    const bio =
        p?.bio ||
        p?.about ||
        p?.profession ||
        "This member hasn't written a bio yet.";

    /* Referral details */

    const referrerName = getReferrerName(p);
    const approvedOn = formatDate(getApprovalDate(p));

    const hasReferralInfo = Boolean(
        referrerName || approvedOn
    );

    /* ─────────────────────────────────────────
       Loading state for profile switch
    ───────────────────────────────────────── */

    const profileLoading = loadingProfile && !fullProfile;

    /* ─────────────────────────────────────────
       UI
    ───────────────────────────────────────── */

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            scroll="paper"
            slotProps={{
                paper: {
                    sx: {
                        width: {
                            xs: "calc(100% - 24px)",
                            sm: "90%",
                            md: "520px",
                            lg: "560px",
                        },

                        maxWidth: "560px",

                        maxHeight: {
                            xs: "calc(100% - 24px)",
                            sm: "90vh",
                            md: "88vh",
                        },

                        m: {
                            xs: "12px",
                            sm: "24px",
                        },

                        borderRadius: {
                            xs: "18px",
                            sm: "24px",
                        },

                        backgroundColor: "rgba(255,255,255,0.97)",

                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",

                        boxShadow:
                            "0 20px 60px rgba(0,0,0,0.16)",

                        border: "1px solid rgba(255,255,255,0.7)",

                        overflow: "hidden",
                    },
                },

                backdrop: {
                    sx: {
                        backgroundColor: "rgba(20,15,10,0.6)",
                        backdropFilter: "blur(3px)",
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
                    top: { xs: 10, sm: 14 },
                    right: { xs: 10, sm: 14 },
                    zIndex: 10,

                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },

                    color: "#4A4A4A",
                    bgcolor: "rgba(255,255,255,0.85)",

                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",

                    "&:hover": {
                        bgcolor: "#fff",
                        color: "#000",
                    },
                }}
            >
                <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>

            <DialogContent
                sx={{
                    p: {
                        xs: 2,
                        sm: 3,
                        md: 3.5,
                    },

                    overflowY: "auto",
                    overflowX: "hidden",

                    "&::-webkit-scrollbar": {
                        width: "5px",
                    },

                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ddd",
                        borderRadius: "10px",
                    },
                }}
            >
                <Stack
                    spacing={{
                        xs: 2,
                        sm: 2.5,
                    }}
                    alignItems="center"
                    sx={{
                        width: "100%",
                        minWidth: 0,
                    }}
                >
                    {/* ─────────────────────────
                        Avatar & Name
                    ───────────────────────── */}

                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{
                            width: "100%",
                            pt: { xs: 1, sm: 0.5 },
                        }}
                    >
                        {profileLoading ? (
                            <>
                                <Skeleton
                                    variant="circular"
                                    width={90}
                                    height={90}
                                />

                                <Skeleton
                                    width="55%"
                                    height={28}
                                />

                                <Skeleton
                                    width="70%"
                                    height={20}
                                />
                            </>
                        ) : (
                            <>
                                <ProtectedAvatar
                                    src={p?.profileImageUrl || ""}
                                    alt={fullName}
                                    sx={{
                                        width: {
                                            xs: 76,
                                            sm: 90,
                                            md: 100,
                                        },

                                        height: {
                                            xs: 76,
                                            sm: 90,
                                            md: 100,
                                        },

                                        bgcolor: "rgba(255,153,51,0.1)",
                                        color: SAFFRON,

                                        fontSize: {
                                            xs: "1.9rem",
                                            sm: "2.2rem",
                                            md: "2.5rem",
                                        },

                                        fontWeight: 800,

                                        border: "3px solid #fff",

                                        boxShadow:
                                            "0 8px 24px rgba(255,153,51,0.2)",
                                    }}
                                >
                                    {!p?.profileImageUrl &&
                                        `${p?.firstName?.[0] || ""}${p?.lastName?.[0] ||
                                            p?.name?.[0] ||
                                            ""
                                            }`.toUpperCase()}
                                </ProtectedAvatar>

                                {/* Name */}

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={0.6}
                                    sx={{
                                        maxWidth: "100%",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 800,

                                            fontSize: {
                                                xs: "1.1rem",
                                                sm: "1.25rem",
                                                md: "1.4rem",
                                            },

                                            color: DARK,
                                            letterSpacing: "-0.4px",
                                            textAlign: "center",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {fullName}
                                    </Typography>

                                    {isVerified && (
                                        <VerifiedOutlinedIcon
                                            sx={{
                                                color: GREEN,
                                                fontSize: {
                                                    xs: 19,
                                                    sm: 21,
                                                },
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                </Stack>

                                {/* Location and member since */}

                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexWrap="wrap"
                                    useFlexGap
                                    spacing={0.6}
                                    sx={{
                                        color: "#666",
                                        maxWidth: "100%",
                                        rowGap: 0.5,
                                    }}
                                >
                                    <PlaceOutlinedIcon
                                        sx={{
                                            fontSize: 16,
                                            flexShrink: 0,
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: {
                                                xs: "0.76rem",
                                                sm: "0.83rem",
                                            },
                                            fontWeight: 500,
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {city}
                                    </Typography>

                                    {memberSince && (
                                        <>
                                            <Typography
                                                sx={{
                                                    fontSize: "0.8rem",
                                                    mx: 0.3,
                                                }}
                                            >
                                                •
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.76rem",
                                                        sm: "0.83rem",
                                                    },
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Member since {memberSince}
                                            </Typography>
                                        </>
                                    )}
                                </Stack>
                            </>
                        )}
                    </Stack>

                    {/* ─────────────────────────
                        Vouched For / Trust Panel
                    ───────────────────────── */}

                    {profileLoading ? (
                        <Skeleton
                            variant="rounded"
                            height={65}
                            sx={{
                                width: "100%",
                                borderRadius: 3,
                            }}
                        />
                    ) : (
                        hasReferralInfo && (
                            <Box
                                sx={{
                                    width: "100%",
                                    boxSizing: "border-box",

                                    bgcolor: "rgba(46,125,50,0.06)",

                                    borderRadius: {
                                        xs: 2.5,
                                        sm: 3,
                                    },

                                    border:
                                        "1px solid rgba(46,125,50,0.2)",

                                    px: {
                                        xs: 1.5,
                                        sm: 2,
                                    },

                                    py: {
                                        xs: 1.25,
                                        sm: 1.5,
                                    },
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.2}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: {
                                                xs: 30,
                                                sm: 34,
                                            },

                                            height: {
                                                xs: 30,
                                                sm: 34,
                                            },

                                            borderRadius: "50%",

                                            bgcolor:
                                                "rgba(46,125,50,0.12)",

                                            color: GREEN,

                                            display: "grid",
                                            placeItems: "center",

                                            flexShrink: 0,
                                        }}
                                    >
                                        <PersonAddAlt1OutlinedIcon
                                            sx={{
                                                fontSize: 19,
                                            }}
                                        />
                                    </Box>

                                    <Box
                                        sx={{
                                            minWidth: 0,
                                            flex: 1,
                                        }}
                                    >
                                        {referrerName && (
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.79rem",
                                                        sm: "0.88rem",
                                                    },

                                                    color: DARK,
                                                    lineHeight: 1.5,
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    Vouched for by {referrerName}
                                                </Box>

                                                {approvedOn && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            color: "#666",
                                                            fontWeight: 400,
                                                        }}
                                                    >
                                                        {" "}· approved on {approvedOn}
                                                    </Box>
                                                )}
                                            </Typography>
                                        )}

                                        {!referrerName && approvedOn && (
                                            <Typography
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.79rem",
                                                        sm: "0.88rem",
                                                    },
                                                    color: DARK,
                                                }}
                                            >
                                                Approved on {approvedOn}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        )
                    )}

                    {/* ─────────────────────────
                        Statistics
                    ───────────────────────── */}

                    <Box
                        sx={{
                            width: "100%",
                            boxSizing: "border-box",

                            bgcolor: "#FAFAFA",

                            borderRadius: {
                                xs: 2.5,
                                sm: 3,
                            },

                            border: "1px solid #EEEEEE",

                            py: {
                                xs: 1.5,
                                sm: 2,
                            },

                            px: 1,

                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}
                    >
                        {/* Rating */}

                        <Stack

                            spacing={0.5}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                alignItems: "center",
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.4}
                            >
                                <StarIcon
                                    sx={{
                                        color: SAFFRON,
                                        fontSize: {
                                            xs: 19,
                                            sm: 22,
                                        },
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontWeight: 800,

                                        fontSize: {
                                            xs: "1.05rem",
                                            sm: "1.2rem",
                                        },

                                        color: DARK,
                                    }}
                                >
                                    {ratingValue > 0
                                        ? ratingValue.toFixed(1)
                                        : "—"}
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: "0.62rem",
                                        sm: "0.72rem",
                                    },

                                    fontWeight: 700,
                                    color: "#777",
                                    textTransform: "uppercase",
                                    letterSpacing: {
                                        xs: 0.2,
                                        sm: 0.5,
                                    },

                                    textAlign: "center",
                                }}
                            >
                                {getRatingLabel(ratingValue)}
                            </Typography>
                        </Stack>

                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                borderColor: "#E5E5E5",
                            }}
                        />

                        {/* Rides */}

                        <Stack

                            spacing={0.5}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                alignItems: "center"
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 800,

                                    fontSize: {
                                        xs: "1.05rem",
                                        sm: "1.2rem",
                                    },

                                    color: DARK,
                                }}
                            >
                                {rideCount}
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: "0.62rem",
                                        sm: "0.72rem",
                                    },

                                    fontWeight: 700,
                                    color: "#777",
                                    textTransform: "uppercase",
                                    letterSpacing: {
                                        xs: 0.2,
                                        sm: 0.5,
                                    },

                                    textAlign: "center",
                                }}
                            >
                                Rides Given
                            </Typography>
                        </Stack>
                    </Box>

                    {/* ─────────────────────────
                        About / Bio
                    ───────────────────────── */}

                    <Box
                        sx={{
                            width: "100%",
                            minWidth: 0,
                            textAlign: "left",
                        }}
                    >
                        <SectionLabel>
                            About {p?.firstName || "Member"}
                        </SectionLabel>

                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "0.82rem",
                                    sm: "0.9rem",
                                    md: "0.93rem",
                                },

                                color: "#3F3934",
                                lineHeight: {
                                    xs: 1.55,
                                    sm: 1.65,
                                },

                                overflowWrap: "anywhere",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {bio}
                        </Typography>
                    </Box>

                    {/* ─────────────────────────
                        Message Button
                    ───────────────────────── */}

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
                                mt: 0.5,

                                py: {
                                    xs: 1,
                                    sm: 1.2,
                                },

                                borderRadius: 2.5,

                                backgroundColor: DARK,
                                color: "#fff",

                                fontWeight: 700,
                                textTransform: "none",

                                fontSize: {
                                    xs: "0.84rem",
                                    sm: "0.93rem",
                                },

                                minHeight: {
                                    xs: 42,
                                    sm: 46,
                                },

                                boxShadow:
                                    "0 6px 16px rgba(0,0,0,0.12)",

                                "&:hover": {
                                    backgroundColor: "#000",

                                    boxShadow:
                                        "0 8px 20px rgba(0,0,0,0.18)",
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
