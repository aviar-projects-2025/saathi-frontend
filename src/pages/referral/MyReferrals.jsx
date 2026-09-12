import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    Button,
    Divider,
    Tabs,
    Modal,
    TextField,
    Tab,
    CircularProgress,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    MenuItem,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

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

const pillBtn = {
    textTransform: "none",
    border: "none",
    fontSize: {
        xs: "0.72rem",
        sm: "0.8rem",
        md: "0.875rem",
    },
    color: SAFFRON,
    fontWeight: 600,
};

const MyReferrals = () => {
    const [openShare, setOpenShare] = useState(false);

    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] =
        useState([]);

    const [tab, setTab] = useState(0);

    const [loading, setLoading] = useState(false);
    const [approveLoading, setApproveLoading] =
        useState(false);
    const [rejectLoading, setRejectLoading] =
        useState(false);

    const [profileModalOpen, setProfileModalOpen] =
        useState(false);

    const [selectedProfile, setSelectedProfile] =
        useState(null);

    /*
     * Mobile number
     */
    const [mobile_number, setMobile_number] =
        useState("");

    /*
     * Country code
     *
     * Default = India
     */
    const [countryCode, setCountryCode] =
        useState("+91");

    const [shareLink, setShareLink] =
        useState("");

    const { notifications } =
        useNotifications();

    const { getPendingReferralCount } =
        useReferral();

    const { completion, currentUser } =
        useUser();

    const toasts = ToastConfig();

    const theme = useTheme();

    const isTab = useMediaQuery(
        theme.breakpoints.down("sm")
    );

    // ==========================================
    // GET USER FROM LOCAL STORAGE
    // ==========================================

    const getUser = () => {
        try {
            const userData =
                localStorage.getItem("user");

            return userData
                ? JSON.parse(userData)
                : null;
        } catch (error) {
            console.error(
                "Error parsing user data:",
                error
            );

            return null;
        }
    };

    const user = getUser();

    const isProfileComplete =
        completion !== 100;

    // ==========================================
    // SHARE MODAL
    // ==========================================

    const handleOpenShare = () => {
        setOpenShare(true);
    };

    const handleCloseShare = () => {
        setOpenShare(false);
    };

    // ==========================================
    // SET SHARE LINK
    // ==========================================

    useEffect(() => {
        if (user?.referralCode) {
            setShareLink(
                `https://saathirides.net/register?ref=${user.referralCode}`
            );
        }
    }, [user]);

    // ==========================================
    // COPY
    // ==========================================

    const handleCopy = (value) => {
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(value)
                .then(() =>
                    toast.success(
                        "Copied to Clipboard!",
                        toasts
                    )
                )
                .catch(() =>
                    toast.error(
                        "Failed to copy",
                        toasts
                    )
                );
        } else {
            const textArea =
                document.createElement(
                    "textarea"
                );

            textArea.value = value;

            document.body.appendChild(
                textArea
            );

            textArea.select();

            try {
                document.execCommand(
                    "copy"
                );

                toast.success(
                    "Copied to Clipboard!",
                    toasts
                );
            } catch (err) {
                toast.error(
                    "Failed to copy",
                    toasts
                );
            }

            document.body.removeChild(
                textArea
            );
        }
    };

    // ==========================================
    // GET REFERRALS
    // ==========================================

    const getReferrals = async () => {
        if (!user?.id) {
            toast.error(
                "User not found",
                toasts
            );

            return;
        }

        try {
            setLoading(true);

            const res = await axios.get(
                Api +
                    `/referrals/${user.id}`
            );

            const data =
                res.data?.data || [];

            const waitingReferrals =
                data.filter(
                    (item) =>
                        item.refApprove ===
                        "Waiting"
                );

            const approved =
                data.filter(
                    (item) =>
                        item.refApprove ===
                        "Approved"
                );

            setMyReferrals(
                waitingReferrals
            );

            setApprovedReferrals(
                approved
            );

            if (
                getPendingReferralCount
            ) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg =
                error.response?.data
                    ?.message ||
                error.message ||
                "Failed to fetch referrals";

            toast.error(
                errorMsg,
                toasts
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        getReferrals();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ==========================================
    // HANDLE NOTIFICATIONS
    // ==========================================

    useEffect(() => {
        if (notifications?.length) {
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
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    // ==========================================
    // APPROVE USER
    // ==========================================

    const approveUser = async (id) => {
        if (!id) {
            toast.error(
                "Invalid user ID",
                toasts
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to approve this person?"
            );

        if (!confirmed) return;

        setApproveLoading(true);

        try {
            await axios.patch(
                Api +
                    `/referrals/${id}`,
                {
                    refApprove:
                        "Approved",
                }
            );

            toast.success(
                "Referral approved successfully!",
                toasts
            );

            await getReferrals();

            if (
                getPendingReferralCount
            ) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg =
                error.response?.data
                    ?.message ||
                error.message ||
                "Failed to approve referral";

            toast.error(
                errorMsg,
                toasts
            );
        } finally {
            setApproveLoading(false);
        }
    };

    // ==========================================
    // DECLINE USER
    // ==========================================

    const declineUser = async (id) => {
        if (!id) {
            toast.error(
                "Invalid user ID",
                toasts
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to decline this person?"
            );

        if (!confirmed) return;

        setRejectLoading(true);

        try {
            await axios.delete(
                Api +
                    `/referrals/${id}`
            );

            toast.success(
                "Referral declined",
                toasts
            );

            await getReferrals();

            if (
                getPendingReferralCount
            ) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg =
                error.response?.data
                    ?.message ||
                error.message ||
                "Failed to decline referral";

            toast.error(
                errorMsg,
                toasts
            );
        } finally {
            setRejectLoading(false);
        }
    };

    // ==========================================
    // INITIALS
    // ==========================================

    const getInitials = (
        firstName = "",
        lastName = ""
    ) =>
        `${firstName?.charAt(0) || ""}${
            lastName?.charAt(0) || ""
        }`
            .toUpperCase() || "?";

    // ==========================================
    // EMPTY STATE
    // ==========================================

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
            <PeopleAltOutlinedIcon
                sx={{
                    fontSize: 50,
                    color: "text.disabled",
                    mb: 2,
                }}
            />

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
        </Box>
    );

    // ==========================================
    // SEND REFERRAL SMS
    // ==========================================

    const handlelink = async () => {
        if (
            !mobile_number ||
            mobile_number.length !== 10
        ) {
            alert(
                "Enter a valid 10-digit mobile number"
            );

            return;
        }

        if (!user?.id) {
            alert("User not found");
            return;
        }

        /*
         * Build international number.
         *
         * India:
         * +919600698331
         *
         * USA:
         * +12145551234
         */
        const fullMobileNumber =
            `${countryCode}${mobile_number}`;

        console.log(
            "Country Code:",
            countryCode
        );

        console.log(
            "Mobile Number:",
            mobile_number
        );

        console.log(
            "Full Mobile Number:",
            fullMobileNumber
        );

        try {
            // ==================================
            // STORE REFERRAL INVITATION
            // ==================================

            const stored =
                await axios.post(
                    `${Api}/referralInvite/`,
                    {
                        referredBy: user.id,

                        /*
                         * Store international number
                         */
                        mobile:
                            fullMobileNumber,

                        status: "Waiting",
                    }
                );

            console.log(
                "Referral invite stored:",
                stored.data
            );

            /*
             * Check backend response.
             *
             * Your existing backend appears
             * to return:
             *
             * { status: true }
             */
            if (
                stored.data.status === true
            ) {
                // ==================================
                // SEND SMS THROUGH TWILIO
                // ==================================

                const response =
                    await axios.post(
                        `${Api}/referrals/send`,
                        {
                            /*
                             * IMPORTANT
                             *
                             * Send:
                             *
                             * +919600698331
                             *
                             * OR
                             *
                             * +12145551234
                             */
                            mobile_number:
                                fullMobileNumber,

                            shareLink,

                            referrerId:
                                user?.referralCode,
                        },
                        {
                            withCredentials:
                                true,
                        }
                    );

                console.log(
                    "Referral SMS response:",
                    response.data
                );

                alert(
                    `Referral link sent successfully to ${fullMobileNumber}`
                );

                /*
                 * Clear mobile after
                 * successful SMS
                 */
                setMobile_number("");
            } else {
                alert(
                    stored.data?.message ||
                        "Unable to create referral invitation"
                );
            }
        } catch (error) {
            console.error(
                "Referral SMS error:",
                error.response?.data ||
                    error.message
            );

            alert(
                error.response?.data
                    ?.message ||
                    "Failed to send referral SMS"
            );
        }
    };

    // ==========================================
    // REFERRAL CARD
    // ==========================================

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
                u?.data?.user?.lastName ||
                u?.lastName ||
                "",

            email:
                u?.data?.user?.email ||
                u?.email ||
                "",

            id:
                u?.data?.userId ||
                u?._id ||
                u?.id,
        };

        const userId =
            userData.id;

        const getUserData =
            async () => {
                if (!userId) return;

                try {
                    const res =
                        await axios.get(
                            `${Api}/users/${userId}`
                        );

                    setUsers(
                        res?.data?.data ||
                            null
                    );
                } catch (err) {
                    console.error(
                        "Failed to fetch user data:",
                        err
                    );

                    setUsers(null);
                }
            };

        useEffect(() => {
            getUserData();

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const profileImage =
            users?.profileImage;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 0.8,
                        sm: 1.5,
                        md: 2,
                    },
                    borderRadius: 2,
                    border: "1px solid",
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
                    {/* Left */}
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
                                profileImage
                            }
                            alt={`${users?.firstName || ""} ${
                                users?.lastName ||
                                ""
                            }`}
                            onClick={() => {
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

                                fontWeight: 600,
                            }}
                        >
                            {!profileImage && (
                                <>
                                    <Box
                                        component="span"
                                        sx={{
                                            color:
                                                "#FF9933",
                                        }}
                                    >
                                        {
                                            users
                                                ?.firstName?.[0]
                                        }
                                    </Box>

                                    <Box
                                        component="span"
                                        sx={{
                                            color:
                                                "#FF9933",
                                        }}
                                    >
                                        {
                                            users
                                                ?.lastName?.[0]
                                        }
                                    </Box>
                                </>
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
                                    users?.firstName
                                }{" "}
                                {
                                    users?.lastName
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
                                {users?.email ||
                                    ""}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right */}
                    {showActions ? (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{
                                flexShrink: 0,
                            }}
                        >
                            {/* Mobile */}
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
                                                userId
                                            )
                                        }
                                        disabled={
                                            approveLoading ||
                                            rejectLoading ||
                                            !userId
                                        }
                                        sx={{
                                            bgcolor:
                                                "#E6F4EA",

                                            color:
                                                "#1E8E3E",

                                            width: 34,
                                            height: 34,

                                            "&:hover":
                                                {
                                                    bgcolor:
                                                        "#C8E6C9",
                                                },
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
                                                    fontSize: 18,
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
                                                userId
                                            )
                                        }
                                        disabled={
                                            approveLoading ||
                                            rejectLoading ||
                                            !userId
                                        }
                                        sx={{
                                            bgcolor:
                                                "#FCE8E8",

                                            color:
                                                "#D93025",

                                            width: 34,
                                            height: 34,

                                            "&:hover":
                                                {
                                                    bgcolor:
                                                        "#F5C6C6",
                                                },
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
                                                    fontSize: 18,
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Desktop */}
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
                                                    fontSize: 16,
                                                }}
                                            />
                                        )
                                    }
                                    onClick={() =>
                                        approveUser(
                                            userId
                                        )
                                    }
                                    disabled={
                                        approveLoading ||
                                        rejectLoading ||
                                        !userId
                                    }
                                    disableElevation
                                    sx={{
                                        bgcolor:
                                            "#1E8E3E",

                                        color:
                                            "#fff",

                                        textTransform:
                                            "none",

                                        fontWeight: 600,

                                        fontSize: 13,

                                        borderRadius: 5,

                                        px: 2,

                                        height: 32,

                                        "&:hover":
                                            {
                                                bgcolor:
                                                    "#176D30",
                                            },
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
                                                    fontSize: 16,
                                                }}
                                            />
                                        )
                                    }
                                    onClick={() =>
                                        declineUser(
                                            userId
                                        )
                                    }
                                    disabled={
                                        approveLoading ||
                                        rejectLoading ||
                                        !userId
                                    }
                                    sx={{
                                        color:
                                            "#D93025",

                                        borderColor:
                                            "#D93025",

                                        textTransform:
                                            "none",

                                        fontWeight: 600,

                                        fontSize: 13,

                                        borderRadius: 5,

                                        px: 2,

                                        height: 32,

                                        "&:hover":
                                            {
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
                    ) : (
                        <Box
                            sx={{
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                gap: 0.5,
                                bgcolor:
                                    "#E6F4EA",
                                color:
                                    "#1E8E3E",
                                fontSize: 10,
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 5,
                                flexShrink: 0,
                            }}
                        >
                            <CheckCircleIcon
                                sx={{
                                    fontSize: 14,
                                }}
                            />

                            Approved
                        </Box>
                    )}
                </Stack>

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

    // ==========================================
    // LOADING
    // ==========================================

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
                sx={{
                    color: "#FF9933",
                }}
            />
        </Box>
    );

    // ==========================================
    // SHARE
    // ==========================================

    const handleInvite = () => {
        if (
            !mobile_number ||
            mobile_number.length < 10
        ) {
            toast.error(
                "Please enter a valid 10-digit mobile number",
                toasts
            );

            return;
        }

        if (navigator.share) {
            navigator
                .share({
                    title:
                        "Join using my referral",

                    text: `Use my referral link: ${shareLink}`,

                    url: shareLink,
                })
                .catch(() => {
                    // User cancelled
                });
        } else {
            toast.info(
                "Sharing not supported on this device",
                toasts
            );
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <PageLayout>
            <Box
                sx={{
                    px: {
                        xs: 0.5,
                        sm: 0,
                        md: 0,
                    },

                    pb: 6,
                }}
            >
                {/* HEADER */}
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

                {/* REFER BUTTON */}
                <Button
                    variant="contained"
                    size="small"
                    onClick={
                        handleOpenShare
                    }
                    sx={{
                        mt: {
                            xs: 0.5,
                            sm: 1.5,
                        },

                        textTransform:
                            "none",

                        borderRadius: 5,

                        fontWeight: 600,

                        fontSize: {
                            xs: 10.2,
                            sm: 11.5,
                        },

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

                {/* TABS */}
                <Tabs
                    value={tab}
                    onChange={(_, v) =>
                        setTab(v)
                    }
                    variant="fullWidth"
                    centered
                    sx={{
                        mb: 2,

                        "& .MuiTab-root":
                            {
                                textTransform:
                                    "none",

                                fontWeight: 600,

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

                        "& .Mui-selected":
                            {
                                color:
                                    "#FF6B35 !important",
                            },

                        "& .MuiTabs-indicator":
                            {
                                height: 2,

                                bgcolor:
                                    "#FF6B35",

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
                                <span
                                    style={{
                                        color:
                                            "#FF6B35",

                                        fontWeight:
                                            600,
                                    }}
                                >
                                    {`Approved Referrals (${approvedReferrals.length})`}
                                </span>
                            </Stack>
                        }
                    />
                </Tabs>

                {/* APPROVED */}
                {tab === 0 &&
                    (loading ? (
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
                                            u._id ||
                                            u.id
                                        }
                                        user={u}
                                        showActions={
                                            false
                                        }
                                    />
                                )
                            )}
                        </Stack>
                    ))}

                {/* ==================================
                    SHARE MODAL
                    ================================== */}

                <Modal
                    open={openShare}
                    onClose={(
                        event,
                        reason
                    ) => {
                        if (
                            reason ===
                            "backdropClick"
                        ) {
                            return;
                        }

                        handleCloseShare();
                    }}
                >
                    <Box
                        sx={{
                            position:
                                "fixed",

                            top: "50%",

                            left: "50%",

                            transform:
                                "translate(-50%, -50%)",

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

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
                                    "white",

                                width: {
                                    xs: "100%",
                                    sm: 380,
                                },

                                maxWidth: 380,

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

                            <Typography
                                fontWeight={600}
                                sx={{
                                    fontSize: {
                                        xs: "0.9rem",
                                        sm: "1rem",
                                    },

                                    mb: {
                                        xs: 1.5,
                                        sm: 2,
                                    },

                                    pr: 3,
                                }}
                            >
                                Invite your
                                friends
                            </Typography>

                            {/* REFERRAL LINK */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,

                                    mb: 2,

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "space-between",

                                    bgcolor:
                                        "#f5f5f5",

                                    borderRadius: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize:
                                            {
                                                xs: "0.7rem",
                                                sm: "0.8rem",
                                            },

                                        overflow:
                                            "hidden",

                                        textOverflow:
                                            "ellipsis",

                                        whiteSpace:
                                            "nowrap",

                                        flex: 1,

                                        mr: 1,
                                    }}
                                >
                                    {
                                        shareLink
                                    }
                                </Typography>

                                <Tooltip title="Copy link">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            handleCopy(
                                                shareLink
                                            )
                                        }
                                        sx={{
                                            flexShrink:
                                                0,
                                        }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Paper>

                            {/* ==================================
                                COUNTRY + MOBILE NUMBER
                                ================================== */}

                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    width: "100%",
                                }}
                            >
                                {/* COUNTRY CODE */}
                                <TextField
                                    select
                                    size="small"
                                    value={
                                        countryCode
                                    }
                                    onChange={(
                                        e
                                    ) => {
                                        setCountryCode(
                                            e
                                                .target
                                                .value
                                        );

                                        /*
                                         * Clear the
                                         * previous number
                                         * when country
                                         * changes.
                                         */
                                        setMobile_number(
                                            ""
                                        );
                                    }}
                                    sx={{
                                        width: {
                                            xs: 105,
                                            sm: 115,
                                        },
                                    }}
                                >
                                    <MenuItem value="+91">
                                        🇮🇳 +91
                                    </MenuItem>

                                    <MenuItem value="+1">
                                        🇺🇸 +1
                                    </MenuItem>
                                </TextField>

                                {/* MOBILE */}
                                <TextField
                                    fullWidth
                                    value={
                                        mobile_number
                                    }
                                    type="text"
                                    inputMode="numeric"
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
                                    size="small"
                                    placeholder="Enter 10-digit mobile number"
                                />
                            </Stack>

                            {/* NUMBER PREVIEW */}
                            {mobile_number.length >
                                0 && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        display:
                                            "block",

                                        mt: 0.75,
                                    }}
                                >
                                    SMS will be
                                    sent to:{" "}
                                    <strong>
                                        {
                                            countryCode
                                        }
                                        {
                                            mobile_number
                                        }
                                    </strong>
                                </Typography>
                            )}

                            {/* BUTTONS */}
                            <Stack
                                direction="row"
                                spacing={{
                                    xs: 1,
                                    sm: 1,
                                }}
                                sx={{
                                    mt: {
                                        xs: 1.5,
                                        sm: 2,
                                    },
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.85rem",
                                        },

                                        py: {
                                            xs: 0.5,
                                            sm: 0.75,
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
                                    onClick={() =>
                                        setMobile_number(
                                            ""
                                        )
                                    }
                                >
                                    Clear
                                </Button>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.85rem",
                                        },

                                        py: {
                                            xs: 0.5,
                                            sm: 0.75,
                                        },

                                        textTransform:
                                            "none",

                                        bgcolor:
                                            "#09710f",

                                        "&:hover":
                                            {
                                                bgcolor:
                                                    "#065a0b",
                                            },
                                    }}
                                    onClick={
                                        handlelink
                                    }
                                >
                                    Invite
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