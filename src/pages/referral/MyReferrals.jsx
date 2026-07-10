
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
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PageLayout from "../../components/PageLayout";
import axios from "axios";
import Api from "../../Api";
import { toast } from "react-toastify";
import { useNotifications } from "../../context/NotificationContext";

const MyReferrals = () => {
    const handleOpenShare = () => setOpenShare(true);
    const handleCloseShare = () => setOpenShare(false);
    const [openShare, setOpenShare] = useState(false);
    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const { notifications } = useNotifications()



    useEffect(() => {
        if (notifications?.length) {
            setMyReferrals((pre) => [
                ...notifications,
                ...pre
            ]);
        }
    }, [notifications]);

    const user = JSON.parse(localStorage.getItem('user'));

    const SAFFRON = "#E8650A";

    const getReferrals = async () => {
        try {
            setLoading(true);
            const res = await axios.get(Api + `/referrals/${user?.id}`);
            const waitingReferrals = res.data.data.filter((item) => item.refApprove === "Waiting");
            const approved = res.data.data.filter((item) => item.refApprove === "Approved");
            setMyReferrals(waitingReferrals);
            setApprovedReferrals(approved);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getReferrals();
    }, []);

    const approveUser = async (id) => {
        const confirmed = window.confirm("Are you sure you want to approve this person?");
        if (!confirmed) return;
        try {
            await axios.patch(Api + `/referrals/${id}`, { refApprove: "Approved" });
            toast.success("Referral approved");
            getReferrals();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const declineUser = async (id) => {
        try {
            axios.delete(Api + `/referrals/${id}`).then(() => getReferrals());
        } catch (error) { }
    };

    const getInitials = (firstName = "", lastName = "") =>
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    const EmptyState = ({ message }) => (
        <Box sx={{ py: { xs: 6, sm: 10 }, textAlign: "center" }}>
            <PeopleAltOutlinedIcon sx={{ fontSize: 35, color: "text.disabled", mb: 1 }} />
            <Typography fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: 15, sm: 16 } }}>
                No referrals found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, fontSize: { xs: 11, sm: 13 } }}>
                {message}
            </Typography>
            <Button
                variant="outlined"
                size="small"
                onClick={handleOpenShare}
                sx={{
                    mt: 2.5,
                    textTransform: "none",
                    borderRadius: 5,
                    fontWeight: 600,
                    fontSize: 12,
                    px: 3,
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.50" },
                }}
            >
                Refer Now
            </Button>
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
                            bgcolor: "white",
                            width: { xs: "100%", sm: 320 },
                            maxWidth: 320,
                            borderRadius: { xs: 2, sm: 2 },
                            p: { xs: 2, sm: 3 },
                            boxShadow: 24,
                        }}
                    >
                        <Typography
                            fontWeight={600}
                            sx={{
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                mb: { xs: 1.5, sm: 2 },
                            }}
                        >
                            Share your referral link
                        </Typography>

                        <TextField
                            fullWidth
                            value={shareLink}
                            size="small"
                            InputProps={{
                                readOnly: true,
                                sx: { fontSize: { xs: "0.75rem", sm: "0.85rem" } },
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
                                }}
                                onClick={() => handleCopy(shareLink)}
                            >
                                Copy Link
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                    py: { xs: 0.5, sm: 0.75 },
                                }}
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: "Join using my referral",
                                            text: "Use my referral link",
                                            url: shareLink,
                                        });
                                    } else {
                                        toast.info("Sharing not supported on this device");
                                    }
                                }}
                            >
                                Share
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );

    const ReferralCard = ({ user: u, showActions = false }) => {


        const userData = {
            firstName: u?.data?.user?.firstName || u?.firstName || "",
            lastName: u?.data?.user?.lastName || u?.lastName || "",
            email: u?.data?.user?.email || u?.email || "",
            id: u?.data?.userId || u?._id
        };

        return (
            <Paper
                key={userData.id}
                elevation={0}
                sx={{
                    p: { xs: 0.8, sm: 2 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { borderColor: "primary.light", bgcolor: "action.hover" },
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
                        sx={{ minWidth: 0, flex: 1 }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: "#f0ebe3",
                                color: "#ff8400",
                                fontWeight: 700,
                                fontSize: { xs: 12, sm: 14 },
                                width: { xs: 40, sm: 44 },
                                height: { xs: 40, sm: 44 },
                                flexShrink: 0,
                            }}
                        >
                            {getInitials(userData.firstName, userData.lastName)}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                fontWeight={600}
                                noWrap
                                sx={{ fontSize: { xs: 13, sm: 15 }, color: "text.primary" }}
                            >
                                {userData.firstName} {userData.lastName}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                noWrap
                                sx={{ fontSize: { xs: 11, sm: 13 } }}
                            >
                                {userData.email}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Right: Actions */}
                    {showActions && (
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                            {/* Mobile: icon-only buttons */}
                            <Box sx={{ display: { xs: "flex", sm: "none" }, gap: 0.5 }}>
                                <Tooltip title="Approve">
                                    <IconButton
                                        size="small"
                                        onClick={() => approveUser(u._id)}
                                        sx={{
                                            bgcolor: "#E6F4EA",
                                            color: "#1E8E3E",
                                            width: 34,
                                            height: 34,
                                            "&:hover": { bgcolor: "#C8E6C9" },
                                        }}
                                    >
                                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Decline">
                                    <IconButton
                                        size="small"
                                        onClick={() => declineUser(u._id)}
                                        sx={{
                                            bgcolor: "#FCE8E8",
                                            color: "#D93025",
                                            width: 34,
                                            height: 34,
                                            "&:hover": { bgcolor: "#F5C6C6" },
                                        }}
                                    >
                                        <CancelIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {/* Desktop: labeled buttons */}
                            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => approveUser(userData?.id)}
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
                                        "&:hover": { bgcolor: "#176D30" },
                                        mt: 0.5
                                    }}
                                >
                                    Approve
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => declineUser(userData?.id)}
                                    sx={{
                                        color: "#D93025",
                                        borderColor: "#D93025",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        borderRadius: 5,
                                        px: 2,
                                        height: 32,
                                        "&:hover": { bgcolor: "#FCE8E8", borderColor: "#B3261E" },
                                        mt: 0.5
                                    }}
                                >
                                    Decline
                                </Button>
                            </Box>
                        </Stack>
                    )}

                    {/* Approved badge for tab 1 */}
                    {!showActions && (
                        <Box
                            sx={{
                                display: { xs: "none", sm: "flex" },
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "#E6F4EA",
                                color: "#1E8E3E",
                                fontSize: 11,
                                fontWeight: 600,
                                px: 1,
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
            </Paper>
        );
    };

    const LoadingSpinner = () => (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} thickness={4} />
        </Box>
    );
    const shareLink = `${window.location.origin}/register?ref=${user?.referralCode}`;
    return (
        <PageLayout>
            <Box sx={{ maxWidth: 680, mx: "auto", px: { xs: 0, sm: 2, md: 0 }, pb: 6 }}>

                {/* Header */}
                <Box sx={{ mb: 1.5 }}>
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

                {/* <Divider sx={{ mb: 0 }} /> */}

                {/* Tabs */}
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    centered
                    sx={{
                        mb: 2,
                        // borderBottom: "1px solid",
                        // borderColor: "divider",
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
                        label={
                            <Stack direction="row" alignItems="center">
                                <span>{`Pending Approvals (${referrals.length})`} </span>
                                {/* {referrals.length > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            bgcolor: tab === 0 ? "primary.main" : "action.selected",
                                            color: tab === 0 ? "#fff" : "text.secondary",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            borderRadius: 10,
                                            px: 0.75,
                                            py: 0.1,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {referrals.length}
                                    </Box>
                                )} */}
                            </Stack>
                        }
                    />
                    <Tab
                        label={
                            <Stack direction="row" alignItems="center">
                                <span>{`Approved Referrals (${approvedReferrals.length})`} </span>
                                {/* {approvedReferrals.length > 0 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            bgcolor: tab === 1 ? "primary.main" : "action.selected",
                                            color: tab === 1 ? "#fff" : "text.secondary",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            borderRadius: 10,
                                            px: 0.75,
                                            py: 0.1,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {approvedReferrals.length}
                                    </Box>
                                )} */}
                            </Stack>
                        }
                    />
                </Tabs>


                {tab === 0 && (
                    loading ? <LoadingSpinner /> :
                        referrals.length === 0
                            ? <EmptyState message="You don't have any referral requests at the moment." />
                            : (
                                <Stack spacing={1.5}>
                                    {referrals.map((u) => (
                                        <ReferralCard key={u._id} user={u} showActions />
                                    ))}
                                </Stack>
                            )
                )}

                {/* Tab: Approved */}
                {tab === 1 && (
                    loading ? <LoadingSpinner /> :
                        approvedReferrals.length === 0
                            ? <EmptyState message="You don't have any approved referrals yet." />
                            : (
                                <Stack spacing={1.5}>
                                    {approvedReferrals.map((u) => (
                                        <ReferralCard key={u._id} user={u} showActions={false} />
                                    ))}
                                </Stack>
                            )
                )}

            </Box>
        </PageLayout>
    );
};

export default MyReferrals;