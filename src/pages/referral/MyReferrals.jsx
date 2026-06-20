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

            console.log(res, 'res')

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
        // const payload = {
        //     refApprove: "Declined"
        // }
        try {
            axios.delete(Api + `/referrals/${id}`)
                .then((res) => {
                    console.log(res, 'res')
                    getReferrals()
                })
        } catch (error) {

        }
    }


    return (
        <PageLayout>
            <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, sm: 2, md: 0 } }}>
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 20, sm: 24 } }}>
                    My Referrals
                </Typography>

                <Typography sx={{ fontSize: 13 }} color="text.secondary" sx={{ marginTop: '15px' }}>
                    Review and approve members who joined using your referral code.
                </Typography>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        mb: 3.5,
                        mt: 2.5,
                        minHeight: { xs: 36, sm: 48 },
                        '& .MuiTab-root': {
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: { xs: 12, sm: 14 },
                            minHeight: { xs: 36, sm: 48 },
                            px: { xs: 1.5, sm: 2 },
                            minWidth: { xs: "auto", sm: 90 },
                        },
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
                                {
                                    referrals?.length <= 0 ?
                                        <Box
                                            sx={{
                                                py: { xs: 5, sm: 8 },
                                                px: 2,
                                                textAlign: { xs: "center", sm: "start" },
                                                
                                                // border: "1px dashed #E0E0E0",
                                                // borderRadius: 3,
                                                // bgcolor: "#FAFAFA",
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: 16, sm: 18 } }}
                                            >
                                                No Referrals Found
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 1, fontSize: { xs: 13, sm: 14 } }}
                                            >
                                                You don't have any referral requests at the moment.
                                            </Typography>

                                            <Button>
                                                Refer Now
                                            </Button>
                                        </Box>
                                        :
                                        <>
                                            {referrals?.map((user) => (
                                                <Paper
                                                    key={user._id}
                                                    elevation={0}
                                                    sx={{
                                                        p: { xs: 1.75, sm: 2.5 },
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
                                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
                                                            <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A", flexShrink: 0 }}></Avatar>
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Typography
                                                                    fontWeight={700}
                                                                    sx={{
                                                                        fontSize: { xs: 14, sm: 16 },
                                                                        overflowWrap: "break-word",
                                                                    }}
                                                                >
                                                                    {user.firstName} {user.lastName}
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        fontSize: { xs: 12, sm: 14 },
                                                                        wordBreak: "break-word",
                                                                    }}
                                                                >
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

                                                        <Stack
                                                            direction="row"
                                                            spacing={1}
                                                            sx={{
                                                                width: { xs: "100%", sm: "auto" },
                                                            }}
                                                        >
                                                            <Button
                                                                variant="contained"
                                                                startIcon={<CheckCircleIcon />}
                                                                onClick={() => {
                                                                    approveUser(user?._id);
                                                                }}
                                                                sx={{
                                                                    bgcolor: "#16a34a",
                                                                    width: { xs: "50%", sm: "100px" },
                                                                    height: "30px",
                                                                    textTransform: "none",
                                                                    fontSize: { xs: 12, sm: 14 },
                                                                    "&:hover": { bgcolor: "#15803d" },
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
                                                                    width: { xs: "50%", sm: "100px" },
                                                                    height: "30px",
                                                                    textTransform: "none",
                                                                    fontSize: { xs: 12, sm: 14 },
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
                                        </>
                                }
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
                                {approvedReferrals.length <= 0 ?
                                    <>
                                        <Box
                                            sx={{
                                                py: { xs: 5, sm: 8 },
                                                px: 2,
                                                textAlign: { xs: "center", sm: "start" },
                                                // border: "1px dashed #E0E0E0",
                                                // borderRadius: 3,
                                                // bgcolor: "#FAFAFA",
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: 16, sm: 18 } }}
                                            >
                                                No Referrals Found
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 1, fontSize: { xs: 13, sm: 14 } }}
                                            >
                                                You don't have any referrals
                                            </Typography>

                                            <Button>
                                                Refer Now
                                            </Button>
                                        </Box>
                                    </>
                                    :
                                    <>
                                        {approvedReferrals?.map((user) => (
                                            <Paper
                                                key={user._id}
                                                elevation={0}
                                                sx={{
                                                    p: { xs: 1.75, sm: 2.5 },
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
                                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
                                                        <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A", flexShrink: 0 }}></Avatar>
                                                        <Box sx={{ minWidth: 0 }}>
                                                            <Typography
                                                                fontWeight={700}
                                                                sx={{
                                                                    fontSize: { xs: 14, sm: 16 },
                                                                    overflowWrap: "break-word",
                                                                }}
                                                            >
                                                                {user.firstName} {user.lastName}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontSize: { xs: 12, sm: 14 },
                                                                    wordBreak: "break-word",
                                                                }}
                                                            >
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
                            </>}
                    </Stack>
                )}


            </Box>
        </PageLayout>
    );
};

export default MyReferrals;