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
    useMediaQuery
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PageLayout from "../../components/PageLayout";
import axios from "axios";
import Api from "../../Api";
import { useUser } from "../../context/userConetext.jsx";
import { toast } from "react-toastify";
import { useNotifications } from "../../context/NotificationContext";
import { useReferral } from "../../context/ReferralContext";
import ToastConfig from "../../components/ToastConfig";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ProfileModal from '../Avatar.jsx'

const SAFFRON = "#E8650A";

const pillBtn = {
    textTransform: "none",
    border: "none",
    fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
    color: SAFFRON,
    fontWeight: 600,
};

const MyReferrals = () => {
    const [openShare, setOpenShare] = useState(false);
    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [approveLoading, setApproveLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [mobile_number, setMobile_number] = useState("");
    const [shareLink, setShareLink] = useState("");

    const { notifications } = useNotifications();
    const { getPendingReferralCount } = useReferral();
    const { completion, currentUser } = useUser();
    const toasts = ToastConfig();
    const theme = useTheme();
    const isTab = useMediaQuery(theme.breakpoints.down("sm"));

    // Get user from localStorage safely
    const getUser = () => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error parsing user data:", error);
            return null;
        }
    };

    const user = getUser();

    const isProfileComplete = completion !== 100;

    const handleOpenShare = () => setOpenShare(true);
    const handleCloseShare = () => setOpenShare(false);

    // Set share link when user is available
    useEffect(() => {
        if (user?.referralCode) {
            setShareLink(`${window.location.origin}/register?ref=${user.referralCode}`);
        }
    }, [user]);

    const handleCopy = (value) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value)
                .then(() => toast.success("Copied to Clipboard!", toasts))
                .catch(() => toast.error("Failed to copy", toasts));
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = value;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
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
            const res = await axios.get(Api + `/referrals/${user.id}`);
            const data = res.data?.data || [];

            const waitingReferrals = data.filter((item) => item.refApprove === "Waiting");
            const approved = data.filter((item) => item.refApprove === "Approved");

            setMyReferrals(waitingReferrals);
            setApprovedReferrals(approved);

            if (getPendingReferralCount) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to fetch referrals";
            toast.error(errorMsg, toasts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getReferrals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle notifications
    useEffect(() => {
        if (notifications?.length) {
            const filtered = notifications.filter(n =>
                n.type === "referral_pending" ||
                n.type === "referral_approved" ||
                n.type === "referral_rejected"
            );

            if (filtered.length) {
                getReferrals();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    const approveUser = async (id) => {
        if (!id) {
            toast.error("Invalid user ID", toasts);
            return;
        }

        const confirmed = window.confirm("Are you sure you want to approve this person?");
        if (!confirmed) return;

        setApproveLoading(true);

        try {
            await axios.patch(Api + `/referrals/${id}`, { refApprove: "Approved" });
            toast.success("Referral approved successfully!", toasts);
            await getReferrals();
            if (getPendingReferralCount) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to approve referral";
            toast.error(errorMsg, toasts);
        } finally {
            setApproveLoading(false);
        }
    };

    const declineUser = async (id) => {
        if (!id) {
            toast.error("Invalid user ID", toasts);
            return;
        }

        const confirmed = window.confirm("Are you sure you want to decline this person?");
        if (!confirmed) return;

        setRejectLoading(true);
        try {
            await axios.delete(Api + `/referrals/${id}`);
            toast.success("Referral declined", toasts);
            await getReferrals();
            if (getPendingReferralCount) {
                getPendingReferralCount();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to decline referral";
            toast.error(errorMsg, toasts);
        } finally {
            setRejectLoading(false);
        }
    };

    const getInitials = (firstName = "", lastName = "") =>
        `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || "?";

    const EmptyState = ({ message1, message2 }) => (
        <Box sx={{ py: { xs: 6, sm: 10 }, textAlign: "center" }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 50, color: "text.disabled", mb: 2 }} />
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
                onClick={handleOpenShare}
                sx={{
                    mt: 2.5,
                    textTransform: "none",
                    borderRadius: 5,
                    fontWeight: 600,
                    fontSize: 12,
                    px: 3,
                    color: "#fff",
                    bgcolor: "#FF9933",
                    "&:hover": { bgcolor: "#da9a3a" },
                }}
                disabled={isProfileComplete}
            >
                Refer Now
            </Button>
        </Box>
    );

    const handlelink = async () => {
        if (!mobile_number || mobile_number.length !== 10) {
            alert("Enter a valid 10-digit mobile number");
            return;
        }

        try {
            const response = await axios.post(
                `${Api}/referrals/send`,
                {
                    mobile_number,
                    shareLink,
                    referrerId: user?.referralCode,
                },
                {
                    withCredentials: true,
                }
            );

            console.log(response.data);

            alert("Referral link sent successfully!");

        } catch (error) {
            console.error(
                "Referral SMS error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to send referral SMS"
            );
        }
    };

    const ReferralCard = ({ user: u, showActions = false }) => {
        const [users, setUsers] = useState(null);

        // Safely extract user data
        const userData = {
            firstName: u?.data?.user?.firstName || u?.firstName || "",
            lastName: u?.data?.user?.lastName || u?.lastName || "",
            email: u?.data?.user?.email || u?.email || "",
            id: u?.data?.userId || u?._id || u?.id,
        };

        const userId = userData.id;

        const getUserData = async () => {
            if (!userId) return;

            try {
                const res = await axios.get(`${Api}/users/${userId}`);
                setUsers(res?.data?.data || res?.data || null);
            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setUsers(null);
            }
        };

        useEffect(() => {
            getUserData();
        }, [userId]);

        const profileImage = users?.profileImage;

        return (
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 0.8, sm: 1.5, md: 2 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                        borderColor: "primary.light",
                        bgcolor: "action.hover",
                    },
                    transition: "all 0.15s ease",
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1.5}
                >
                    {/* Left: Avatar + Info */}
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
                            src={profileImage || undefined}
                            alt={`${userData.firstName} ${userData.lastName}`}
                            onClick={() => {
                                if (!users) return;
                                setSelectedProfile(users);
                                setProfileModalOpen(true);
                            }}
                            sx={{
                                width: { xs: 40, sm: 44 },
                                height: { xs: 40, sm: 44 },
                                cursor: users ? "pointer" : "default",
                                bgcolor: users?.profileImage ? "transparent" : "primary.main",
                            }}
                        >
                            {!users?.profileImage && getInitials(userData.firstName, userData.lastName)}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                fontWeight={600}
                                noWrap
                                sx={{
                                    fontSize: {
                                        xs: 13,
                                        sm: 15,
                                    },
                                    color: "text.primary",
                                }}
                            >
                                {userData.firstName || "Unknown"} {userData.lastName || ""}
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
                                {userData.email || "No email provided"}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right: Actions */}
                    {showActions ? (
                        <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                            sx={{ flexShrink: 0 }}
                        >
                            {/* Mobile buttons */}
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
                                        onClick={() => approveUser(userId)}
                                        disabled={approveLoading || rejectLoading || !userId}
                                        sx={{
                                            bgcolor: "#E6F4EA",
                                            color: "#1E8E3E",
                                            width: 34,
                                            height: 34,
                                            "&:hover": {
                                                bgcolor: "#C8E6C9",
                                            },
                                        }}
                                    >
                                        {approveLoading ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Decline">
                                    <IconButton
                                        size="small"
                                        onClick={() => declineUser(userId)}
                                        disabled={approveLoading || rejectLoading || !userId}
                                        sx={{
                                            bgcolor: "#FCE8E8",
                                            color: "#D93025",
                                            width: 34,
                                            height: 34,
                                            "&:hover": {
                                                bgcolor: "#F5C6C6",
                                            },
                                        }}
                                    >
                                        {rejectLoading ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <CancelIcon sx={{ fontSize: 18 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Desktop buttons */}
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
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                                        )
                                    }
                                    onClick={() => approveUser(userId)}
                                    disabled={approveLoading || rejectLoading || !userId}
                                    disableElevation
                                    sx={{
                                        bgcolor: "#1E8E3E",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        borderRadius: 5,
                                        px: 2,
                                        height: 32,
                                        "&:hover": {
                                            bgcolor: "#176D30",
                                        },
                                    }}
                                >
                                    {approveLoading ? "Approving..." : "Approve"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={
                                        rejectLoading ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <CancelIcon sx={{ fontSize: 16 }} />
                                        )
                                    }
                                    onClick={() => declineUser(userId)}
                                    disabled={approveLoading || rejectLoading || !userId}
                                    sx={{
                                        color: "#D93025",
                                        borderColor: "#D93025",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        borderRadius: 5,
                                        px: 2,
                                        height: 32,
                                        "&:hover": {
                                            bgcolor: "#FCE8E8",
                                            borderColor: "#B3261E",
                                        },
                                    }}
                                >
                                    {rejectLoading ? "Declining..." : "Decline"}
                                </Button>
                            </Box>
                        </Stack>
                    ) : (
                        // Approved badge
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "#E6F4EA",
                                color: "#1E8E3E",
                                fontSize: 10,
                                fontWeight: 600,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 5,
                                flexShrink: 0,
                            }}
                        >
                            <CheckCircleIcon sx={{ fontSize: 14 }} />
                            Approved
                        </Box>
                    )}
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
    };

    const LoadingSpinner = () => (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} thickness={4} />
        </Box>
    );

    const handleInvite = () => {
        if (!mobile_number || mobile_number.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number", toasts);
            return;
        }

        if (navigator.share) {
            navigator.share({
                title: "Join using my referral",
                text: `Use my referral link: ${shareLink}`,
                url: shareLink,
            }).catch(() => {
                // User cancelled share
            });
        } else {
            toast.info("Sharing not supported on this device", toasts);
        }
    };

    return (
        <PageLayout>
            <Box sx={{ px: { xs: 0.5, sm: 0, md: 0 }, pb: 6 }}>

                {/* Header */}
                <Box sx={{ mb: 1, mt: 1 }}>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ fontSize: { xs: 16, sm: 22 }, color: "text.primary" }}
                    >
                        My Referrals
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, fontSize: { xs: 11, sm: 15 } }}
                    >
                        Review and approve members who joined using your referral code.
                    </Typography>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    centered
                    sx={{
                        mb: 2,
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: { xs: 10.2, sm: 12 },
                            minHeight: { xs: 40, sm: 48 },
                            color: "text.secondary",
                        },
                        "& .Mui-selected": {
                            color: "primary.main",
                        },
                        "& .MuiTabs-indicator": {
                            height: 2,
                            bgcolor: "primary.main",
                            borderRadius: "2px 2px 0 0",
                        },
                    }}
                >
                    <Tab
                        label={`Pending Approvals (${referrals.length})`}
                    />
                    <Tab
                        label={`Approved Referrals (${approvedReferrals.length})`}
                    />
                </Tabs>

                {/* Tab: Pending */}
                {tab === 0 && (
                    loading ? <LoadingSpinner /> :
                        referrals.length === 0 ? (
                            <EmptyState
                                message1="No Pending Referrals"
                                message2="You don't have any pending referrals at the moment."
                            />
                        ) : (
                            <Stack spacing={1.5}>
                                {referrals.map((u) => (
                                    <ReferralCard key={u._id || u.id} user={u} showActions />
                                ))}
                            </Stack>
                        )
                )}

                {/* Tab: Approved */}
                {tab === 1 && (
                    loading ? <LoadingSpinner /> :
                        approvedReferrals.length === 0 ? (
                            <EmptyState
                                message1="No Approved Referrals"
                                message2="You don't have any approved referrals at the moment."
                            />
                        ) : (
                            <Stack spacing={1.5}>
                                {approvedReferrals.map((u) => (
                                    <ReferralCard key={u._id || u.id} user={u} showActions={false} />
                                ))}
                            </Stack>
                        )
                )}

                {/* Share Modal */}
                <Modal open={openShare} onClose={handleCloseShare}>
                    <Box
                        sx={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: { xs: "92%", sm: "100%" },
                            px: { xs: 2, sm: 0 },
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                bgcolor: "white",
                                width: { xs: "100%", sm: 380 },
                                maxWidth: 380,
                                borderRadius: { xs: 2, sm: 2 },
                                p: { xs: 2, sm: 3 },
                                boxShadow: 24,
                            }}
                        >
                            <IconButton
                                onClick={handleCloseShare}
                                size="small"
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    color: "grey.500",
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>

                            <Typography
                                fontWeight={600}
                                sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                    mb: { xs: 1.5, sm: 2 },
                                    pr: 3,
                                }}
                            >
                                Invite your friends
                            </Typography>

                            {/* Referral Link - Copyable */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    mb: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    bgcolor: "#f5f5f5",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        flex: 1,
                                        mr: 1,
                                    }}
                                >
                                    {shareLink}
                                </Typography>
                                <Tooltip title="Copy link">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopy(shareLink)}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Paper>

                            <TextField
                                fullWidth
                                value={mobile_number}
                                type="text"
                                inputMode="numeric"
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setMobile_number(value);
                                }}
                                size="small"
                                placeholder="Enter mobile number"
                                InputProps={{
                                    sx: {
                                        fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    },
                                }}
                            />

                            <Stack
                                direction="row"
                                spacing={{ xs: 1, sm: 1 }}
                                sx={{ mt: { xs: 1.5, sm: 2 } }}
                            >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                        py: { xs: 0.5, sm: 0.75 },
                                        textTransform: "none",
                                        bgcolor: "#FF9933",
                                        "&:hover": { bgcolor: "#da9a3a" },
                                    }}
                                    onClick={() => setMobile_number('')}
                                >
                                    Clear
                                </Button>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                        py: { xs: 0.5, sm: 0.75 },
                                        textTransform: "none",
                                        bgcolor: "#09710f",
                                        "&:hover": { bgcolor: "#065a0b" },
                                    }}
                                    onClick={() => handlelink(mobile_number)}
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