
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
    Box, Typography, Tabs, Tab, Paper, Chip, Button, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, IconButton, Stack, FormControl, Grid,
    InputLabel, Select, MenuItem, FormControlLabel, Switch, Slider,
    CircularProgress, Card, CardContent, Divider, useMediaQuery, DialogContentText,
    Badge, Collapse, Avatar
} from '@mui/material';
import axios from 'axios';
import Api from '../Api';
import { useRide } from "../context/RideContext";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageLayout from '../components/PageLayout';

const RequestRide = () => {

    // const [allRequests, setAllRequests] = useState([]);
    const [allMyRequests, setAllMyRequests] = useState([]);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [userData, setUserData] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    const { refreshRide } = useRide();

    useEffect(() => {
        fetchAllSends();
    }, []);

    useEffect(() => {
        fetchAllSends();
    }, [refreshRide]);

    // const fetchAllRequests = async () => {
    //     try {
    //         const res = await axios.get(`${Api}/bookride/${user.id}?type=received`);
    //         setAllRequests(res.data.data || []);
    //     } catch (error) {
    //         console.error('Error fetching requests:', error);
    //     }
    // };
    async function fetchAllSends() {
        try {
            if (!user?.id) return;

            const res = await axios.get(`${Api}/bookride/send/${user.id}`);
            const requestUser = res.data.data.map((item) => item.members)
            setUserData(requestUser);
            setAllMyRequests(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setAllMyRequests([]);
        }
    }


    const handleCancelClick = (request) => {
        setSelectedRequest(request);
        setOpenCancelDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCancelDialog(false);
        setSelectedRequest(null);
    };

    const handleConfirmCancel = async () => {
        if (!selectedRequest) return;

        try {
            await axios.delete(`${Api}/bookride/${selectedRequest._id}`);

            handleCloseDialog();

            // Refresh request list
            fetchAllSends();
        } catch (err) {
            console.error("Error cancelling request:", err);
        }
    };

    return (
        <PageLayout>
            <Box
                sx={{
                    flex: 1,
                    minWidth: { lg: 340 },
                    maxHeight: "90vh",
                    overflowY: "auto",
                    position: "sticky",
                    top: 30,
                }}
            >
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                    My Requests
                </Typography>
                <br />
                {allMyRequests.filter(req => req?.rideId).length === 0 ? (
                    <Typography
                        textAlign="center"
                        color="text.secondary"
                        sx={{ mt: 4 }}
                    >
                        No ride requests found.
                    </Typography>
                ) : (
                    allMyRequests
                        .filter(req => req?.rideId)
                        .map((request) => (
                            <Card
                                key={request._id}
                                sx={{
                                    mb: 3,
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: "1px solid #f0d9c0",
                                    boxShadow: "none",
                                }}
                            >
                                {/* Header bar */}
                                <Box
                                    sx={{
                                        bgcolor: "#1a1030",
                                        px: 2.5,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
                                        {request.rideId?.createdBy?.firstName}{" "}
                                        {request.rideId?.createdBy?.lastName}
                                    </Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Chip
                                            label={request.status}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                borderRadius: "20px",
                                                bgcolor:
                                                    request.status === "ACCEPTED"
                                                        ? "#e8f7e8"
                                                        : request.status === "REJECTED"
                                                            ? "#fbe7e6"
                                                            : "#fdf1e0",
                                                color:
                                                    request.status === "ACCEPTED"
                                                        ? "#1e7d1e"
                                                        : request.status === "REJECTED"
                                                            ? "#b1362f"
                                                            : "#b56b0d",
                                            }}
                                        />

                                        <IconButton
                                            onClick={() => handleCancelClick(request)}
                                            size="small"
                                            sx={{
                                                bgcolor: "rgba(255,255,255,0.1)",
                                                color: "#fff",
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {/* Body */}
                                <CardContent sx={{ p: 2.5 }}>
                                    {/* Route */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography sx={{ fontSize: 11, color: "#FF9933", fontWeight: 600 }}>
                                                FROM
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <LocationOnIcon sx={{ color: "#e2483d", fontSize: 18 }} />
                                                <Typography fontWeight={600}>{request.rideId?.from}</Typography>
                                            </Box>
                                        </Box>

                                        <ArrowForwardIcon sx={{ color: "#FF9933" }} />

                                        <Box sx={{ textAlign: "right" }}>
                                            <Typography sx={{ fontSize: 11, color: "#FF9933", fontWeight: 600 }}>
                                                TO
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                                                <LocationOnIcon sx={{ color: "#e2483d", fontSize: 18 }} />
                                                <Typography fontWeight={600}>{request.rideId?.destination}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ borderTop: "1px solid #f0e6d8", my: 2 }} />

                                    {/* Date & time */}
                                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                        <Box>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                Date
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <CalendarMonthIcon sx={{ color: "#FF9933", fontSize: 16 }} />
                                                <Typography fontWeight={600} fontSize={13}>
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                                                Time
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <AccessTimeIcon sx={{ color: "#FF9933", fontSize: 16 }} />
                                                <Typography fontWeight={600} fontSize={13}>
                                                    {new Date(request.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        )))}
                <Dialog
                    open={openCancelDialog}
                    onClose={handleCloseDialog}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle>Cancel Ride Request</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this ride request?
                            <br />
                            This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseDialog}>
                            No
                        </Button>

                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleConfirmCancel}
                        >
                            Yes, Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </PageLayout>
    )
}

export default RequestRide;
