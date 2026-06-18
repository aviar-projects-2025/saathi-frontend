import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Avatar,
    Button,
    Chip,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageLayout from "../../components/PageLayout";
import axios from "axios";
import Api from "../../Api";
import { toast } from "react-toastify";

const MyReferrals = () => {

    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false)

    const user = JSON.parse(localStorage.getItem('user'))

    const getReferrals = async () => {
        try {
            setLoading(true)
            const res = await axios.get(
                Api + `/referrals/${user?.id}`
            );

            const waitingReferrals = res.data.data.filter(
                (item) => item.refApprove === "Waiting"
            );
            const approvedReferrals = res.data.data.filter(
                (item) => item.refApprove === "Approved"
            );

            setMyReferrals(waitingReferrals);
            setApprovedReferrals(approvedReferrals)
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getReferrals();
    }, [])

    const approveUser = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to approve this person?"
        );

        if (!confirmed) return;

        try {
            const payload = {
                refApprove: "Approved",
            };

            const res = await axios.patch(
                Api + `/referrals/${id}`,
                payload
            );
            toast.success("Referral approved");
            getReferrals();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const declineUser = async (id) => {
        const payload = {
            refApprove: "Declined"
        }
        try {
            axios.patch(Api + `/referrals/${id}`, payload)
                .then((res) => {
                    console.log(res, 'res')
                })
        } catch (error) {

        }
    }


    return (
        <PageLayout>
            <Box sx={{ maxWidth: 900, mx: "auto" }}>
                <Typography variant="h5" fontWeight={800}>
                    My Referrals
                </Typography>

                <Typography sx={{ fontSize: 13 }} color="text.secondary" mb={3}>
                    Review and approve members who joined using your referral code.
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        mb: 2.5,
                        '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
                        '& .Mui-selected': { color: 'primary.main' },
                        '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
                    }}
                >
                    <Tab label={`Pending Approvals`} />
                    <Tab label={`Approved Referrals `} />
                </Tabs>

                {tab === 0 && (
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {loading ?
                            <>
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CircularProgress size={50} />
                                </Box>
                            </>
                            :
                            <>
                                {referrals?.map((user) => (
                                    <Paper
                                        key={user._id}
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            border: "1px solid #F0E6DC",
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={2}
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                            sx={{
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A" }}></Avatar>
                                                <Box>
                                                    <Typography fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>

                                                    {/* <Stack direction="row" spacing={1} mt={1}>
                                            <Chip size="small" label={user.city} />
                                            <Chip
                                                size="small"
                                                label={user.status}
                                                sx={{
                                                    bgcolor: "#FFF4E8",
                                                    color: "#E8650A",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Stack> */}
                                                </Box>
                                            </Stack>

                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => {
                                                        approveUser(user?._id);
                                                    }}
                                                    sx={{
                                                        bgcolor: "#16a34a",
                                                        width: "100px",
                                                        height: "30px",
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    Approve
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => {
                                                        declineUser(user?._id);
                                                    }}
                                                    sx={{
                                                        width: "100px",
                                                        height: "30px",
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    Decline
                                                </Button>
                                            </Stack>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="caption" color="text.secondary">
                                            Requested {user.joinedAt}
                                        </Typography>
                                    </Paper>
                                ))}
                            </>}
                    </Stack>
                )}

                {tab === 1 && (

                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {loading ?
                            <>
                                <Box
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CircularProgress size={50} />
                                </Box>
                            </>
                            :
                            <>
                                {approvedReferrals?.map((user) => (
                                    <Paper
                                        key={user._id}
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 3,
                                            border: "1px solid #F0E6DC",
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={2}
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                            sx={{
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A" }}></Avatar>
                                                <Box>
                                                    <Typography fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>

                                                    {/* <Stack direction="row" spacing={1} mt={1}>
                                            <Chip size="small" label={user.city} />
                                            <Chip
                                                size="small"
                                                label={user.status}
                                                sx={{
                                                    bgcolor: "#FFF4E8",
                                                    color: "#E8650A",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Stack> */}
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                ))}
                            </>}
                    </Stack>
                )}


            </Box>
        </PageLayout>
    );
};

export default MyReferrals;