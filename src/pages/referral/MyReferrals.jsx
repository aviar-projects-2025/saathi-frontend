import React, { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    Button,
    Tabs,
    Modal,
    TextField,
    Tab,
    CircularProgress,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Select,
    MenuItem,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

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

const MyReferrals = () => {
    // =========================================================
    // STATES
    // =========================================================

    const [openShare, setOpenShare] = useState(false);

    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] = useState([]);

    const [tab, setTab] = useState(0);

    const [loading, setLoading] = useState(false);

    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    // =========================================================
    // SMS STATES
    // =========================================================

    const [mobile_number, setMobile_number] = useState("");
    const [countryCode, setCountryCode] = useState("+1");

    const [smsLoading, setSmsLoading] = useState(false);

    // =========================================================
    // CONTEXT
    // =========================================================

    const { notifications } = useNotifications();
    const { getPendingReferralCount } = useReferral();

    const { completion } = useUser();

    const toasts = ToastConfig();

    const theme = useTheme();

    const isTab = useMediaQuery(
        theme.breakpoints.down("sm")
    );

    const isProfileComplete = completion !== 100;

    // =========================================================
    // USER
    // =========================================================

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // =========================================================
    // SHARE LINK
    // =========================================================

    const shareLink =
        `${window.location.origin}/register?ref=${user?.referralCode}`;

    // =========================================================
    // OPEN SHARE MODAL
    // =========================================================

    const handleOpenShare = () => {
        setOpenShare(true);
    };

    // =========================================================
    // CLOSE SHARE MODAL
    // =========================================================

    const handleCloseShare = () => {
        setOpenShare(false);

        setMobile_number("");

        setCountryCode("+1");
    };

    // =========================================================
    // COPY LINK
    // =========================================================

    const handleCopy = (value) => {
        if (!value) return;

        navigator.clipboard
            .writeText(value)
            .then(() => {
                toast.success(
                    "Copied to Clipboard!",
                    toasts
                );
            })
            .catch(() => {
                toast.error(
                    "Failed to copy",
                    toasts
                );
            });
    };

    // =========================================================
    // GET REFERRALS
    // =========================================================

    const getReferrals = async () => {
        if (!user?.id) {
            return;
        }

        try {
            setLoading(true);

            const res = await axios.get(
                `${Api}/referrals/${user.id}`
            );

            const data = res?.data?.data || [];

            const waitingReferrals =
                data.filter(
                    (item) =>
                        item.refApprove === "Waiting"
                );

            const approved =
                data.filter(
                    (item) =>
                        item.refApprove === "Approved"
                );

            setMyReferrals(
                waitingReferrals
            );

            setApprovedReferrals(
                approved
            );

            getPendingReferralCount();

        } catch (error) {
            console.error(
                "Failed to fetch referrals:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to fetch referrals",
                toasts
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL FETCH
    // =========================================================

    useEffect(() => {
        getReferrals();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================
    // NOTIFICATION UPDATE
    // =========================================================

    useEffect(() => {
        if (!notifications?.length) {
            return;
        }

        const filtered =
            notifications.filter(
                (n) =>
                    n.type ===
                        "referral_pending" ||
                    n.type ===
                        "referral_approved" ||
                    n.type ===
                        "referral_rejected"
            );

        if (filtered.length) {
            getReferrals();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    // =========================================================
    // APPROVE REFERRAL
    // =========================================================

    const approveUser = async (id) => {
        if (!id) return;

        const confirmed =
            window.confirm(
                "Are you sure you want to approve this person?"
            );

        if (!confirmed) return;

        setApproveLoading(true);

        try {
            await axios.patch(
                `${Api}/referrals/${id}`,
                {
                    refApprove:
                        "Approved",
                }
            );

            toast.success(
                "Referral approved",
                toasts
            );

            await getReferrals();

            getPendingReferralCount();

        } catch (error) {
            console.error(
                "Approve referral error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to approve referral",
                toasts
            );

        } finally {
            setApproveLoading(false);
        }
    };

    // =========================================================
    // DECLINE REFERRAL
    // =========================================================

    const declineUser = async (id) => {
        if (!id) return;

        const confirmed =
            window.confirm(
                "Are you sure you want to decline this person?"
            );

        if (!confirmed) return;

        setRejectLoading(true);

        try {
            await axios.delete(
                `${Api}/referrals/${id}`
            );

            toast.success(
                "Referral declined",
                toasts
            );

            await getReferrals();

            getPendingReferralCount();

        } catch (error) {
            console.error(
                "Decline referral error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to decline referral",
                toasts
            );

        } finally {
            setRejectLoading(false);
        }
    };

    // =========================================================
    // SMS OPT-IN
    // =========================================================

    const handleSubmit = async () => {
        // Validate 10-digit number
        if (
            !mobile_number ||
            mobile_number.length !== 10
        ) {
            toast.error(
                "Enter a valid 10-digit mobile number",
                toasts
            );

            return;
        }

        // Create international number
        const fullMobileNumber =
            `${countryCode}${mobile_number}`;

        try {
            setSmsLoading(true);

            console.log(
                "Opt-in number:",
                fullMobileNumber
            );

            // =================================================
            // UPDATE REFERRAL
            // Backend searches ONLY by mobile
            // =================================================

            const res = await axios.patch(
                `${Api}/notification/optin`,
                {
                    messageNumber:
                        fullMobileNumber,
                }
            );

            console.log(
                "Opt-in updated:",
                res.data
            );

            // =================================================
            // UPDATE LOCAL STORAGE
            // =================================================

            const currentUser =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    )
                );

            const updatedUser = {
                ...currentUser,

                isMessageApproved:
                    true,

                messageNumber:
                    fullMobileNumber,
            };

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedUser
                )
            );

            toast.success(
                "SMS notifications enabled!",
                toasts
            );

            // Clear input
            setMobile_number("");

            // Reset country
            setCountryCode("+1");

            // Close modal
            setOpenShare(false);

        } catch (error) {
            console.error(
                "Opt-in update failed:",
                error
            );

            toast.error(
                error?.response?.data
                    ?.message ||
                    "Failed to subscribe",
                toasts
            );

        } finally {
            setSmsLoading(false);
        }
    };

    // =========================================================
    // EMPTY STATE
    // =========================================================

    const EmptyState = ({
        message1,
        message2,
    }) => (
        <Box
            sx={{
                py: {
                    xs: 6,
                    sm: 10,
                },

                textAlign: "center",
            }}
        >
            <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                sx={{
                    fontSize: {
                        xs: "0.95rem",
                        sm: "1.05rem",
                        md: "1.15rem",
                    },
                }}
            >
                {message1}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mt: 1,

                    fontSize: {
                        xs: "0.75rem",
                        sm: "0.85rem",
                        md: "0.95rem",
                    },
                }}
            >
                {message2}
            </Typography>

            <Button
                variant="contained"
                size="small"
                onClick={
                    handleOpenShare
                }
                sx={{
                    mt: 2.5,

                    textTransform:
                        "none",

                    borderRadius: 5,

                    fontWeight: 600,

                    fontSize: 12,

                    px: 3,

                    color: "#fff",

                    bgcolor:
                        "#FF9933",

                    "&:hover": {
                        bgcolor:
                            "#da9a3a",
                    },
                }}
                disabled={
                    isProfileComplete
                }
            >
                Refer Now
            </Button>
        </Box>
    );

    // =========================================================
    // REFERRAL CARD
    // =========================================================

    const ReferralCard = ({
        user: u,
        showActions = false,
    }) => {
        const [users, setUsers] =
            useState(null);

        const userData = {
            firstName:
                u?.data?.user
                    ?.firstName ||
                u?.firstName ||
                "",

            lastName:
                u?.data?.user
                    ?.lastName ||
                u?.lastName ||
                "",

            email:
                u?.data?.user
                    ?.email ||
                u?.email ||
                "",

            id:
                u?.data?.userId ||
                u?._id,
        };

        const userId =
            userData.id;

        // =====================================================
        // GET USER DATA
        // =====================================================

        useEffect(() => {
            const getUserData =
                async () => {
                    if (!userId) {
                        return;
                    }

                    try {
                        const res =
                            await axios.get(
                                `${Api}/users/${userId}`
                            );

                        setUsers(
                            res?.data
                                ?.data ||
                                res?.data ||
                                null
                        );

                    } catch (error) {
                        console.error(
                            "Failed to fetch user data:",
                            error
                        );

                        setUsers(null);
                    }
                };

            getUserData();
        }, [userId]);

        const profileImage =
            users?.profileImage;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 0.8,
                        sm: 2,
                    },

                    borderRadius: 2,

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    "&:hover": {
                        borderColor:
                            "primary.light",

                        bgcolor:
                            "action.hover",
                    },

                    transition:
                        "all 0.15s ease",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1.5}
                >
                    {/* LEFT SIDE */}

                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                            minWidth: 0,
                            flex: 1,
                        }}
                    >
                        <Avatar
                            src={
                                profileImage ||
                                undefined
                            }
                            alt={`${userData.firstName} ${userData.lastName}`}
                            onClick={() => {
                                if (!users)
                                    return;

                                setSelectedProfile(
                                    users
                                );

                                setProfileModalOpen(
                                    true
                                );
                            }}
                            sx={{
                                width: {
                                    xs: 40,
                                    sm: 44,
                                },

                                height: {
                                    xs: 40,
                                    sm: 44,
                                },

                                cursor: users
                                    ? "pointer"
                                    : "default",

                                bgcolor:
                                    "#FFF3E0",

                                color:
                                    SAFFRON,

                                fontWeight: 600,
                            }}
                        >
                            {!profileImage &&
                                getInitials(
                                    userData.firstName,
                                    userData.lastName
                                )}
                        </Avatar>

                        <Box
                            sx={{
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                fontWeight={600}
                                noWrap
                                sx={{
                                    fontSize: {
                                        xs: 13,
                                        sm: 15,
                                    },

                                    color:
                                        "text.primary",
                                }}
                            >
                                {
                                    userData.firstName
                                }{" "}
                                {
                                    userData.lastName
                                }
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{
                                    fontSize: {
                                        xs: 11,
                                        sm: 13,
                                    },
                                }}
                            >
                                {
                                    userData.email
                                }
                            </Typography>
                        </Box>
                    </Stack>

                    {/* ACTIONS */}

                    {showActions && (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{
                                flexShrink: 0,
                            }}
                        >
                            {/* MOBILE */}

                            <Box
                                sx={{
                                    display: {
                                        xs: "flex",
                                        sm: "none",
                                    },

                                    gap: 0.5,
                                }}
                            >
                                <Tooltip title="Approve">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            approveUser(
                                                userData.id
                                            )
                                        }
                                        disabled={
                                            approveLoading ||
                                            rejectLoading
                                        }
                                        sx={{
                                            bgcolor:
                                                "#E6F4EA",

                                            color:
                                                "#1E8E3E",

                                            width: 34,

                                            height: 34,
                                        }}
                                    >
                                        {approveLoading ? (
                                            <CircularProgress
                                                size={
                                                    18
                                                }
                                                color="inherit"
                                            />
                                        ) : (
                                            <CheckCircleIcon
                                                sx={{
                                                    fontSize:
                                                        18,
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Decline">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            declineUser(
                                                userData.id
                                            )
                                        }
                                        disabled={
                                            approveLoading ||
                                            rejectLoading
                                        }
                                        sx={{
                                            bgcolor:
                                                "#FCE8E8",

                                            color:
                                                "#D93025",

                                            width: 34,

                                            height: 34,
                                        }}
                                    >
                                        {rejectLoading ? (
                                            <CircularProgress
                                                size={
                                                    18
                                                }
                                                color="inherit"
                                            />
                                        ) : (
                                            <CancelIcon
                                                sx={{
                                                    fontSize:
                                                        18,
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* DESKTOP */}

                            <Box
                                sx={{
                                    display: {
                                        xs: "none",
                                        sm: "flex",
                                    },

                                    gap: 1,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={
                                        approveLoading ? (
                                            <CircularProgress
                                                size={
                                                    16
                                                }
                                                color="inherit"
                                            />
                                        ) : (
                                            <CheckCircleIcon
                                                sx={{
                                                    fontSize:
                                                        16,
                                                }}
                                            />
                                        )
                                    }
                                    onClick={() =>
                                        approveUser(
                                            userData.id
                                        )
                                    }
                                    disabled={
                                        approveLoading ||
                                        rejectLoading
                                    }
                                    disableElevation
                                    sx={{
                                        bgcolor:
                                            "#1E8E3E",

                                        color:
                                            "#fff",

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            600,

                                        fontSize:
                                            13,

                                        borderRadius:
                                            5,

                                        px: 2,

                                        height: 32,
                                    }}
                                >
                                    {approveLoading
                                        ? "Approving..."
                                        : "Approve"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={
                                        rejectLoading ? (
                                            <CircularProgress
                                                size={
                                                    16
                                                }
                                                color="inherit"
                                            />
                                        ) : (
                                            <CancelIcon
                                                sx={{
                                                    fontSize:
                                                        16,
                                                }}
                                            />
                                        )
                                    }
                                    onClick={() =>
                                        declineUser(
                                            userData.id
                                        )
                                    }
                                    disabled={
                                        approveLoading ||
                                        rejectLoading
                                    }
                                    sx={{
                                        color:
                                            "#D93025",

                                        borderColor:
                                            "#D93025",

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            600,

                                        fontSize:
                                            13,

                                        borderRadius:
                                            5,

                                        px: 2,

                                        height: 32,

                                        "&:hover": {
                                            bgcolor:
                                                "#FCE8E8",

                                            borderColor:
                                                "#B3261E",
                                        },
                                    }}
                                >
                                    {rejectLoading
                                        ? "Declining..."
                                        : "Decline"}
                                </Button>
                            </Box>
                        </Stack>
                    )}

                    {/* APPROVED BADGE */}

                    {!showActions && (
                        <Box
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "flex",
                                },

                                alignItems:
                                    "center",

                                gap: 0.5,

                                bgcolor:
                                    "#E6F4EA",

                                color:
                                    "#1E8E3E",

                                fontSize: 10,

                                fontWeight:
                                    600,

                                px: 1,

                                py: 0.5,

                                borderRadius: 5,

                                flexShrink: 0,
                            }}
                        >
                            <CheckCircleIcon
                                sx={{
                                    fontSize:
                                        14,
                                }}
                            />

                            Approved
                        </Box>
                    )}
                </Stack>

                {/* PROFILE MODAL */}

                <ProfileModal
                    open={
                        profileModalOpen
                    }
                    selectedProfile={
                        selectedProfile
                    }
                    onClose={() => {
                        setProfileModalOpen(
                            false
                        );

                        setSelectedProfile(
                            null
                        );
                    }}
                />
            </Paper>
        );
    };

    // =========================================================
    // INITIALS
    // =========================================================

    const getInitials = (
        firstName = "",
        lastName = ""
    ) =>
        `${firstName.charAt(
            0
        )}${lastName.charAt(
            0
        )}`.toUpperCase();

    // =========================================================
    // LOADING
    // =========================================================

    const LoadingSpinner = () => (
        <Box
            sx={{
                display: "flex",
                justifyContent:
                    "center",
                py: 8,
            }}
        >
            <CircularProgress
                size={36}
                thickness={4}
            />
        </Box>
    );

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <PageLayout>
            <Box
                sx={{
                    px: {
                        xs: 0.5,
                        sm: 0,
                    },

                    pb: 6,
                }}
            >
                {/* =====================================================
                    HEADER
                ====================================================== */}

                <Box
                    sx={{
                        mb: 1,
                        mt: 1,
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{
                            fontSize: {
                                xs: 16,
                                sm: 22,
                            },

                            color:
                                "text.primary",
                        }}
                    >
                        My Referrals
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 1,

                            fontSize: {
                                xs: 11,
                                sm: 15,
                            },
                        }}
                    >
                        Review and approve
                        members who joined
                        using your referral
                        code.
                    </Typography>
                </Box>

                {/* =====================================================
                    TABS
                ====================================================== */}

                <Tabs
                    value={tab}
                    onChange={(_, value) =>
                        setTab(value)
                    }
                    variant="fullWidth"
                    centered
                    sx={{
                        mb: 2,

                        "& .MuiTab-root": {
                            textTransform:
                                "none",

                            fontWeight:
                                600,

                            fontSize: {
                                xs: 10.2,
                                sm: 12,
                            },

                            minHeight: {
                                xs: 40,
                                sm: 48,
                            },

                            color:
                                "text.secondary",
                        },

                        "& .Mui-selected": {
                            color:
                                "primary.main",
                        },

                        "& .MuiTabs-indicator":
                            {
                                height: 2,

                                bgcolor:
                                    "primary.main",

                                borderRadius:
                                    "2px 2px 0 0",
                            },
                    }}
                >
                    <Tab
                        label={
                            <Stack
                                direction="row"
                                alignItems="center"
                            >
                                <span>
                                    {`Pending Approvals (${referrals.length})`}
                                </span>
                            </Stack>
                        }
                    />

                    <Tab
                        label={
                            <Stack
                                direction="row"
                                alignItems="center"
                            >
                                <span>
                                    {`Approved Referrals (${approvedReferrals.length})`}
                                </span>
                            </Stack>
                        }
                    />
                </Tabs>

                {/* =====================================================
                    PENDING
                ====================================================== */}

                {tab === 0 && (
                    loading ? (
                        <LoadingSpinner />
                    ) : referrals.length === 0 ? (
                        <EmptyState
                            message1="No Pending Referrals"
                            message2="You don't have any pending referrals at the moment."
                        />
                    ) : (
                        <Stack spacing={1.5}>
                            {referrals.map(
                                (u) => (
                                    <ReferralCard
                                        key={
                                            u._id
                                        }
                                        user={u}
                                        showActions
                                    />
                                )
                            )}
                        </Stack>
                    )
                )}

                {/* =====================================================
                    APPROVED
                ====================================================== */}

                {tab === 1 && (
                    loading ? (
                        <LoadingSpinner />
                    ) : approvedReferrals.length ===
                      0 ? (
                        <EmptyState
                            message1="No Approved Referrals"
                            message2="You don't have any approved referrals at the moment."
                        />
                    ) : (
                        <Stack spacing={1.5}>
                            {approvedReferrals.map(
                                (u) => (
                                    <ReferralCard
                                        key={
                                            u._id
                                        }
                                        user={u}
                                        showActions={
                                            false
                                        }
                                    />
                                )
                            )}
                        </Stack>
                    )
                )}

                {/* =====================================================
                    SHARE / SMS MODAL
                ====================================================== */}

                <Modal
                    open={openShare}
                    onClose={
                        handleCloseShare
                    }
                >
                    <Box
                        sx={{
                            position:
                                "fixed",

                            top: "50%",

                            left: "50%",

                            transform:
                                "translate(-50%, -50%)",

                            width: {
                                xs: "92%",
                                sm: "100%",
                            },

                            px: {
                                xs: 2,
                                sm: 0,
                            },
                        }}
                    >
                        <Box
                            sx={{
                                position:
                                    "relative",

                                bgcolor:
                                    "#fff",

                                width: {
                                    xs: "100%",
                                    sm: 380,
                                },

                                maxWidth: 380,

                                mx: "auto",

                                borderRadius: 2,

                                p: {
                                    xs: 2,
                                    sm: 3,
                                },

                                boxShadow: 24,
                            }}
                        >
                            {/* CLOSE */}

                            <IconButton
                                onClick={
                                    handleCloseShare
                                }
                                size="small"
                                sx={{
                                    position:
                                        "absolute",

                                    top: 8,

                                    right: 8,

                                    color:
                                        "grey.500",
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            {/* TITLE */}

                            <Typography
                                fontWeight={600}
                                sx={{
                                    fontSize: {
                                        xs: "0.9rem",
                                        sm: "1rem",
                                    },

                                    mb: 1.5,

                                    pr: 3,
                                }}
                            >
                                Share your
                                referral link
                            </Typography>

                            {/* REFERRAL LINK */}

                            <TextField
                                fullWidth
                                value={
                                    shareLink
                                }
                                size="small"
                                InputProps={{
                                    readOnly:
                                        true,

                                    sx: {
                                        fontSize:
                                            {
                                                xs: "0.75rem",
                                                sm: "0.85rem",
                                            },
                                    },
                                }}
                            />

                            {/* LINK BUTTONS */}

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    mt: 1.5,
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                        handleCopy(
                                            shareLink
                                        )
                                    }
                                    sx={{
                                        fontSize:
                                            {
                                                xs: "0.75rem",
                                                sm: "0.85rem",
                                            },

                                        textTransform:
                                            "none",

                                        bgcolor:
                                            "#FF9933",

                                        "&:hover":
                                            {
                                                bgcolor:
                                                    "#da9a3a",
                                            },
                                    }}
                                >
                                    Copy Link
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        if (
                                            navigator.share
                                        ) {
                                            navigator.share(
                                                {
                                                    title:
                                                        "Join using my referral",

                                                    text:
                                                        "Use my referral link",

                                                    url:
                                                        shareLink,
                                                }
                                            );
                                        } else {
                                            toast.info(
                                                "Sharing not supported on this device",
                                                toasts
                                            );
                                        }
                                    }}
                                    sx={{
                                        fontSize:
                                            {
                                                xs: "0.75rem",
                                                sm: "0.85rem",
                                            },

                                        textTransform:
                                            "none",

                                        color:
                                            "#09710f",

                                        borderColor:
                                            "#09710f",
                                    }}
                                >
                                    Share
                                </Button>
                            </Stack>

                            {/* =================================================
                                SMS SECTION
                            ================================================= */}

                            <Box
                                sx={{
                                    mt: 2.5,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    fontWeight={
                                        600
                                    }
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    Send referral
                                    by SMS
                                </Typography>

                                {/* COUNTRY + PHONE */}

                                <Box
                                    sx={{
                                        display:
                                            "flex",

                                        gap: 1,

                                        width:
                                            "100%",
                                    }}
                                >
                                    {/* COUNTRY CODE */}

                                    <Select
                                        value={
                                            countryCode
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setCountryCode(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        size="small"
                                        sx={{
                                            minWidth:
                                                {
                                                    xs: 95,
                                                    sm: 105,
                                                },

                                            bgcolor:
                                                "#fff",

                                            fontSize:
                                                {
                                                    xs: "0.75rem",
                                                    sm: "0.85rem",
                                                },

                                            borderRadius:
                                                1,

                                            "& .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor:
                                                        "#ddd",
                                                },

                                            "&:hover .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor:
                                                        "#FF9933",
                                                },

                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                {
                                                    borderColor:
                                                        "#FF9933",
                                                },
                                        }}
                                    >
                                        <MenuItem value="+1">
                                            🇺🇸 +1
                                        </MenuItem>

                                        <MenuItem value="+91">
                                            🇮🇳 +91
                                        </MenuItem>
                                    </Select>

                                    {/* MOBILE */}

                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="tel"
                                        value={
                                            mobile_number
                                        }
                                        placeholder="Enter mobile number"
                                        onChange={(
                                            e
                                        ) => {
                                            const value =
                                                e.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        10
                                                    );

                                            setMobile_number(
                                                value
                                            );
                                        }}
                                        inputProps={{
                                            maxLength: 10,

                                            inputMode:
                                                "numeric",
                                        }}
                                    />
                                </Box>

                                {/* INFO */}

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display:
                                            "block",

                                        mt: 0.75,

                                        fontSize:
                                            {
                                                xs: 10,
                                                sm: 11,
                                            },
                                    }}
                                >
                                    Enter the
                                    10-digit
                                    mobile number
                                    without the
                                    country code.
                                </Typography>

                                {/* SEND BUTTON */}

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    disabled={
                                        mobile_number.length !==
                                            10 ||
                                        smsLoading
                                    }
                                    onClick={
                                        handleSubmit
                                    }
                                    sx={{
                                        mt: 1.5,

                                        py: 0.8,

                                        textTransform:
                                            "none",

                                        fontWeight:
                                            600,

                                        bgcolor:
                                            "#09710f",

                                        "&:hover":
                                            {
                                                bgcolor:
                                                    "#065a0b",
                                            },
                                    }}
                                >
                                    {smsLoading ? (
                                        <CircularProgress
                                            size={
                                                20
                                            }
                                            color="inherit"
                                        />
                                    ) : (
                                        "Send SMS"
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </PageLayout>
    );
};

export default MyReferrals;