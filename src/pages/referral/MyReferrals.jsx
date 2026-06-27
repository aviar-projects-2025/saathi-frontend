// import React, { useEffect, useState } from "react";
// import {
//     Box,
//     Typography,
//     Paper,
//     Stack,
//     Avatar,
//     Button,
//     Chip,
//     Divider,
//     Tabs,
//     Tab,
//     CircularProgress,
// } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import CancelIcon from "@mui/icons-material/Cancel";
// import PageLayout from "../../components/PageLayout";
// import axios from "axios";
// import Api from "../../Api";
// import { toast } from "react-toastify";

// const MyReferrals = () => {

//     const [referrals, setMyReferrals] = useState([]);
//     const [approvedReferrals, setApprovedReferrals] = useState([]);
//     const [tab, setTab] = useState(0);
//     const [loading, setLoading] = useState(false)

//     const user = JSON.parse(localStorage.getItem('user'))

//     const getReferrals = async () => {
//         try {
//             setLoading(true)
//             const res = await axios.get(
//                 Api + `/referrals/${user?.id}`
//             );

//             console.log(res, 'res')

//             const waitingReferrals = res.data.data.filter(
//                 (item) => item.refApprove === "Waiting"
//             );
//             const approvedReferrals = res.data.data.filter(
//                 (item) => item.refApprove === "Approved"
//             );
//             setMyReferrals(waitingReferrals);
//             setApprovedReferrals(approvedReferrals)
//         } catch (error) {
//             toast.error(error.message);
//         } finally {
//             setLoading(false)
//         }
//     }

//     useEffect(() => {
//         getReferrals();
//     }, [])

//     const approveUser = async (id) => {
//         const confirmed = window.confirm(
//             "Are you sure you want to approve this person?"
//         );

//         if (!confirmed) return;

//         try {
//             const payload = {
//                 refApprove: "Approved",
//             };

//             const res = await axios.patch(
//                 Api + `/referrals/${id}`,
//                 payload
//             );
//             toast.success("Referral approved");
//             getReferrals();
//         } catch (error) {
//             toast.error(error.response?.data?.message || error.message);
//         }
//     };

//     const declineUser = async (id) => {
//         // const payload = {
//         //     refApprove: "Declined"
//         // }
//         try {
//             axios.delete(Api + `/referrals/${id}`)
//                 .then((res) => {
//                     console.log(res, 'res')
//                     getReferrals()
//                 })
//         } catch (error) {

//         }
//     }


//     return (
//         <PageLayout>
//             <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, sm: 2, md: 0 } }}>
//                 <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: 20, sm: 24 } }}>
//                     My Referrals
//                 </Typography>

//                 <Typography sx={{ fontSize: 13 }} color="text.secondary" sx={{ marginTop: '15px' }}>
//                     Review and approve members who joined using your referral code.
//                 </Typography>

//                 <Tabs
//                     value={tab}
//                     onChange={(_, v) => setTab(v)}
//                     variant="scrollable"
//                     scrollButtons="auto"
//                     allowScrollButtonsMobile
//                     sx={{
//                         mb: 3.5,
//                         mt: 2.5,
//                         minHeight: { xs: 36, sm: 48 },
//                         '& .MuiTab-root': {
//                             fontWeight: 600,
//                             textTransform: 'none',
//                             fontSize: { xs: 12, sm: 14 },
//                             minHeight: { xs: 36, sm: 48 },
//                             px: { xs: 1.5, sm: 2 },
//                             minWidth: { xs: "auto", sm: 90 },
//                         },
//                         '& .Mui-selected': { color: 'primary.main' },
//                         '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
//                     }}
//                 >
//                     <Tab label={`Pending Approvals`} />
//                     <Tab label={`Approved Referrals `} />
//                 </Tabs>

//                 {tab === 0 && (
//                     <Stack spacing={2} sx={{ mt: 2 }}>
//                         {loading ?
//                             <>
//                                 <Box
//                                     sx={{
//                                         width: '100%',
//                                         display: 'flex',
//                                         justifyContent: 'center',
//                                     }}
//                                 >
//                                     <CircularProgress size={50} />
//                                 </Box>
//                             </>
//                             :
//                             <>
//                                 {
//                                     referrals?.length <= 0 ?
//                                         <Box
//                                             sx={{
//                                                 py: { xs: 5, sm: 8 },
//                                                 px: 2,
//                                                 textAlign: { xs: "center", sm: "start" },

//                                                 // border: "1px dashed #E0E0E0",
//                                                 // borderRadius: 3,
//                                                 // bgcolor: "#FAFAFA",
//                                             }}
//                                         >
//                                             <Typography
//                                                 variant="h6"
//                                                 fontWeight={700}
//                                                 color="text.secondary"
//                                                 sx={{ fontSize: { xs: 16, sm: 18 } }}
//                                             >
//                                                 No Referrals Found
//                                             </Typography>

//                                             <Typography
//                                                 variant="body2"
//                                                 color="text.secondary"
//                                                 sx={{ mt: 1, fontSize: { xs: 13, sm: 14 } }}
//                                             >
//                                                 You don't have any referral requests at the moment.
//                                             </Typography>

//                                             <Button>
//                                                 Refer Now
//                                             </Button>
//                                         </Box>
//                                         :
//                                         <>
//                                             {referrals?.map((user) => (
//                                                 <Paper
//                                                     key={user._id}
//                                                     elevation={0}
//                                                     sx={{
//                                                         p: { xs: 1.75, sm: 2.5 },
//                                                         borderRadius: 3,
//                                                         border: "1px solid #F0E6DC",
//                                                     }}
//                                                 >
//                                                     <Stack
//                                                         direction={{ xs: "column", sm: "row" }}
//                                                         spacing={2}
//                                                         alignItems={{ xs: "flex-start", sm: "center" }}
//                                                         sx={{
//                                                             justifyContent: 'space-between'
//                                                         }}
//                                                     >
//                                                         <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
//                                                             <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A", flexShrink: 0 }}></Avatar>
//                                                             <Box sx={{ minWidth: 0 }}>
//                                                                 <Typography
//                                                                     fontWeight={700}
//                                                                     sx={{
//                                                                         fontSize: { xs: 14, sm: 16 },
//                                                                         overflowWrap: "break-word",
//                                                                     }}
//                                                                 >
//                                                                     {user.firstName} {user.lastName}
//                                                                 </Typography>
//                                                                 <Typography
//                                                                     variant="body2"
//                                                                     color="text.secondary"
//                                                                     sx={{
//                                                                         fontSize: { xs: 12, sm: 14 },
//                                                                         wordBreak: "break-word",
//                                                                     }}
//                                                                 >
//                                                                     {user.email}
//                                                                 </Typography>

//                                                                 {/* <Stack direction="row" spacing={1} mt={1}>
//                                             <Chip size="small" label={user.city} />
//                                             <Chip
//                                                 size="small"
//                                                 label={user.status}
//                                                 sx={{
//                                                     bgcolor: "#FFF4E8",
//                                                     color: "#E8650A",
//                                                     fontWeight: 700,
//                                                 }}
//                                             />
//                                         </Stack> */}
//                                                             </Box>
//                                                         </Stack>

//                                                         <Stack
//                                                             direction="row"
//                                                             spacing={1}
//                                                             sx={{
//                                                                 width: { xs: "100%", sm: "auto" },
//                                                             }}
//                                                         >
//                                                             <Button
//                                                                 variant="contained"
//                                                                 startIcon={<CheckCircleIcon />}
//                                                                 onClick={() => {
//                                                                     approveUser(user?._id);
//                                                                 }}
//                                                                 sx={{
//                                                                     bgcolor: "#16a34a",
//                                                                     width: { xs: "50%", sm: "100px" },
//                                                                     height: "30px",
//                                                                     textTransform: "none",
//                                                                     fontSize: { xs: 12, sm: 14 },
//                                                                     "&:hover": { bgcolor: "#15803d" },
//                                                                 }}
//                                                             >
//                                                                 Approve
//                                                             </Button>

//                                                             <Button
//                                                                 variant="outlined"
//                                                                 color="error"
//                                                                 startIcon={<CancelIcon />}
//                                                                 onClick={() => {
//                                                                     declineUser(user?._id);
//                                                                 }}
//                                                                 sx={{
//                                                                     width: { xs: "50%", sm: "100px" },
//                                                                     height: "30px",
//                                                                     textTransform: "none",
//                                                                     fontSize: { xs: 12, sm: 14 },
//                                                                 }}
//                                                             >
//                                                                 Decline
//                                                             </Button>
//                                                         </Stack>
//                                                     </Stack>

//                                                     <Divider sx={{ my: 2 }} />

//                                                     <Typography variant="caption" color="text.secondary">
//                                                         Requested {user.joinedAt}
//                                                     </Typography>
//                                                 </Paper>
//                                             ))}
//                                         </>
//                                 }
//                             </>}
//                     </Stack>
//                 )}

//                 {tab === 1 && (

//                     <Stack spacing={2} sx={{ mt: 2 }}>
//                         {loading ?
//                             <>
//                                 <Box
//                                     sx={{
//                                         width: '100%',
//                                         display: 'flex',
//                                         justifyContent: 'center',
//                                     }}
//                                 >
//                                     <CircularProgress size={50} />
//                                 </Box>
//                             </>
//                             :
//                             <>
//                                 {approvedReferrals.length <= 0 ?
//                                     <>
//                                         <Box
//                                             sx={{
//                                                 py: { xs: 5, sm: 8 },
//                                                 px: 2,
//                                                 textAlign: { xs: "center", sm: "start" },
//                                                 // border: "1px dashed #E0E0E0",
//                                                 // borderRadius: 3,
//                                                 // bgcolor: "#FAFAFA",
//                                             }}
//                                         >
//                                             <Typography
//                                                 variant="h6"
//                                                 fontWeight={700}
//                                                 color="text.secondary"
//                                                 sx={{ fontSize: { xs: 16, sm: 18 } }}
//                                             >
//                                                 No Referrals Found
//                                             </Typography>

//                                             <Typography
//                                                 variant="body2"
//                                                 color="text.secondary"
//                                                 sx={{ mt: 1, fontSize: { xs: 13, sm: 14 } }}
//                                             >
//                                                 You don't have any referrals
//                                             </Typography>

//                                             <Button>
//                                                 Refer Now
//                                             </Button>
//                                         </Box>
//                                     </>
//                                     :
//                                     <>
//                                         {approvedReferrals?.map((user) => (
//                                             <Paper
//                                                 key={user._id}
//                                                 elevation={0}
//                                                 sx={{
//                                                     p: { xs: 1.75, sm: 2.5 },
//                                                     borderRadius: 3,
//                                                     border: "1px solid #F0E6DC",
//                                                 }}
//                                             >
//                                                 <Stack
//                                                     direction={{ xs: "column", sm: "row" }}
//                                                     spacing={2}
//                                                     alignItems={{ xs: "flex-start", sm: "center" }}
//                                                     sx={{
//                                                         justifyContent: 'space-between'
//                                                     }}
//                                                 >
//                                                     <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, width: { xs: "100%", sm: "auto" } }}>
//                                                         <Avatar sx={{ bgcolor: "#FFF0E3", color: "#E8650A", flexShrink: 0 }}></Avatar>
//                                                         <Box sx={{ minWidth: 0 }}>
//                                                             <Typography
//                                                                 fontWeight={700}
//                                                                 sx={{
//                                                                     fontSize: { xs: 14, sm: 16 },
//                                                                     overflowWrap: "break-word",
//                                                                 }}
//                                                             >
//                                                                 {user.firstName} {user.lastName}
//                                                             </Typography>
//                                                             <Typography
//                                                                 variant="body2"
//                                                                 color="text.secondary"
//                                                                 sx={{
//                                                                     fontSize: { xs: 12, sm: 14 },
//                                                                     wordBreak: "break-word",
//                                                                 }}
//                                                             >
//                                                                 {user.email}
//                                                             </Typography>

//                                                             {/* <Stack direction="row" spacing={1} mt={1}>
//                                             <Chip size="small" label={user.city} />
//                                             <Chip
//                                                 size="small"
//                                                 label={user.status}
//                                                 sx={{
//                                                     bgcolor: "#FFF4E8",
//                                                     color: "#E8650A",
//                                                     fontWeight: 700,
//                                                 }}
//                                             />
//                                         </Stack> */}
//                                                         </Box>
//                                                     </Stack>
//                                                 </Stack>
//                                             </Paper>
//                                         ))}
//                                     </>}
//                             </>}
//                     </Stack>
//                 )}


//             </Box>
//         </PageLayout>
//     );
// };

// export default MyReferrals;


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

const MyReferrals = () => {

    const [referrals, setMyReferrals] = useState([]);
    const [approvedReferrals, setApprovedReferrals] = useState([]);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);

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
            <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: 15, sm: 16 } }}>
                No referrals found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, fontSize: { xs: 12, sm: 13 } }}>
                {message}
            </Typography>
            <Button
                variant="outlined"
                size="small"
                sx={{
                    mt: 2.5,
                    textTransform: "none",
                    borderRadius: 5,
                    fontWeight: 600,
                    fontSize: 13,
                    px: 3,
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.50" },
                }}
            >
                Refer Now
            </Button>
        </Box>
    );

    const ReferralCard = ({ user: u, showActions = false }) => (
        <Paper
            key={u._id}
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2 },
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
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar
                        sx={{
                            bgcolor: "#E8F0FE",
                            color: "#1A73E8",
                            fontWeight: 700,
                            fontSize: { xs: 13, sm: 14 },
                            width: { xs: 40, sm: 44 },
                            height: { xs: 40, sm: 44 },
                            flexShrink: 0,
                        }}
                    >
                        {getInitials(u.firstName, u.lastName)}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            fontWeight={600}
                            noWrap
                            sx={{ fontSize: { xs: 13, sm: 15 }, color: "text.primary" }}
                        >
                            {u.firstName} {u.lastName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ fontSize: { xs: 11, sm: 13 } }}
                        >
                            {u.email}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: { xs: 10, sm: 11 }, display: { xs: "block", sm: "none" }, mt: 0.25 }}
                        >
                            Requested {u.joinedAt}
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
                                onClick={() => approveUser(u._id)}
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
                                }}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                                onClick={() => declineUser(u._id)}
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
                            fontSize: 12,
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

            {/* Timestamp – desktop only for pending */}
            {showActions && (
                <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: { xs: "none", sm: "block" }, mt: 1.5, fontSize: 11 }}
                >
                    Requested {u.joinedAt}
                </Typography>
            )}
        </Paper>
    );

    const LoadingSpinner = () => (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} thickness={4} />
        </Box>
    );

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 680, mx: "auto", px: { xs: 1.5, sm: 2, md: 0 }, pb: 6 }}>

                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ fontSize: { xs: 18, sm: 22 }, color: "text.primary" }}
                    >
                        My Referrals
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, fontSize: { xs: 12, sm: 16 } }}
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
                        mb: 3,
                        // borderBottom: "1px solid",
                        // borderColor: "divider",
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: { xs: 10.3, sm: 14 },
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

                {/* Tab: Pending */}
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