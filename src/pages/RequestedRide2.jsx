import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    CircularProgress,
    Paper,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../Api";
import Ridebook from "./Ridebook.jsx";
import ProfileModal from "./Avatar.jsx";
import RideDetailsModal from "./RideDetails.jsx";
import PageLayout from "../components/PageLayout";
import ToastConfig from "../components/ToastConfig.jsx";
import { useRide } from "../context/RideContext";

/* ───────────── Design tokens (same as RideCard) ───────────── */
const FONT = '"DM Sans", "Inter", "Segoe UI", Roboto, Arial, sans-serif';

const FS = {
    route: { xs: 11, sm: 12, md: 13, lg: 14 },
    subtitle: { xs: 9, sm: 10, md: 11, lg: 12 },
    chip: { xs: 8.5, sm: 9, md: 9.5, lg: 10 },
    date: { xs: 10, sm: 11, md: 11.5, lg: 12 },
    time: { xs: 9, sm: 9.5, md: 10, lg: 10.5 },
    avatar: { xs: 10, sm: 11, md: 12 },
};

const CHIP = {
    blue: { bg: "#C9E2FA", color: "#134F85" },
    green: { bg: "#C8EFD2", color: "#176128" },
    slate: { bg: "#D3DEE9", color: "#2B4258" },
    amber: { bg: "#F5DDB3", color: "#7A4200" },
    red: { bg: "#F7C8C3", color: "#A82219" },
    info: { bg: "#C6DDF5", color: "#0B54A8" },
};

const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;

/* ───────────── Status helpers ───────────── */
const getStatusChips = (request) => {
    const ride = request?.rideId;
    const status = request?.status;

    const isRejected = status === "REJECTED";
    const isAccepted = status === "ACCEPTED";

    const requestedByMe = Number(request?.seatsRequested || 0);
    const approvedSeats = Number(request?.approvedSeats || 0);
    const rejectedSeats = Number(request?.rejectedSeats || 0);
    const pendingReqSeats = Number(request?.pendingReqSeats || 0);

    const cancelledText =
        ride?.travelStatus === "Cancelled"
            ? "Ride Cancelled"
            : status === "CANCELLED"
                ? "You Cancelled"
                : pendingReqSeats > 0 && ride?.travelStatus === "Completed"
                    ? "Auto Rejected"
                    : null;

    const approvedAndRejected = `You have ${plural(
        approvedSeats,
        "approved seat",
    )} and ${plural(rejectedSeats, "rejected seat")}`;

    let label;
    if (status === "AUTO_REJECTED") label = "Auto Rejected";
    else if (isRejected)
        label =
            rejectedSeats > 0 && approvedSeats > 0 ? approvedAndRejected : "Rejected";
    else if (cancelledText) label = cancelledText;
    else if (isAccepted)
        label =
            rejectedSeats > 0
                ? approvedAndRejected
                : `You have ${plural(approvedSeats, "approved seat")}`;
    else label = `You applied for ${plural(requestedByMe, "seat")}`;

    const color = isAccepted
        ? CHIP.green
        : isRejected || status === "AUTO_REJECTED" || cancelledText
            ? CHIP.red
            : CHIP.info;

    const chips = [{ label, ...color }];

    if (isAccepted && pendingReqSeats > 0) {
        chips.push({
            label: `${plural(pendingReqSeats, "pending seat")}`,
            ...CHIP.amber,
        });
    }
    return chips;
};

const RequestRide = () => {
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [allMyRequests, setAllMyRequests] = useState([]);
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [selectedRide, setSelectedRide] = useState();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedRideDetails, setSelectedRideDetails] = useState(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const toasts = ToastConfig();
    const { refreshRide } = useRide();

    useEffect(() => {
        fetchAllSends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshRide]);

    async function fetchAllSends() {
        try {
            setLoadingRequests(true);
            if (!user?.id) return;
            const res = await axios.get(`${Api}/bookride/send/${user.id}`);
            setAllMyRequests(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setAllMyRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    }

    /* ───────────── Menu / dialog handlers ───────────── */
    const handleMenuOpen = (event, request) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedRequest(request);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleCancelClick = (request) => {
        setSelectedRequest(request);
        setOpenCancelDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenCancelDialog(false);
        setSelectedRequest(null);
        setIsCancelling(false);
    };

    const notifyChange = (action, requestId) =>
        window.dispatchEvent(
            new CustomEvent("rideDataChanged", { detail: { action, requestId } }),
        );

    const patchCancel = (id, type) =>
        axios.patch(`${Api}/bookride/${id}/status?type=${type}`, {
            status: "CANCELLED",
            cancelledBy: user?.id,
            cancelledAt: new Date().toISOString(),
        });

    const handleConfirmCancel = async () => {
        if (!selectedRequest) return;
        const requestId = selectedRequest._id;
        setIsCancelling(true);

        const finish = async () => {
            setAllMyRequests((prev) => prev.filter((r) => r._id !== requestId));
            handleCloseDialog();
            await fetchAllSends();
            notifyChange("cancelled", requestId);
            toast.success("Ride request cancelled successfully", toasts);
        };

        try {
            await patchCancel(requestId, "Cancel");
            await finish();
        } catch (err) {
            console.error("Error cancelling request:", err);

            if (err.response?.data?.message?.toLowerCase().includes("invalid")) {
                try {
                    await patchCancel(requestId, "Reject");
                    await finish();
                } catch (retryErr) {
                    toast.error(
                        retryErr.response?.data?.message || "Failed to cancel ride request",
                        toasts,
                    );
                }
            } else {
                toast.error(
                    err.response?.data?.message || "Failed to cancel ride request",
                    toasts,
                );
            }
        } finally {
            setIsCancelling(false);
        }
    };

    /* ───────────── Derived data ───────────── */
    const now = new Date();
    const activeRequests = allMyRequests.filter((item) => {
        const startTime = new Date(item.rideId?.startTime);
        if (item.status === "REJECTED") return startTime > now;
        return true;
    });

    const visibleRequests = activeRequests.filter(
        (r) =>
            r?.rideId?.travelStatus !== "Completed" &&
            r?.rideId?.travelStatus !== "Cancelled",
    );

    const isFlightForEdit = selectedRide?.modeOfTravel === "Flight";
    const isAcceptedForEdit = selectedRequest?.status === "ACCEPTED";
    const requestedByMeForEdit = Number(selectedRequest?.seatsRequested || 0);
    const pendingSeatsByMeForEdit = isAcceptedForEdit ? 0 : requestedByMeForEdit;

    const remainingSeatsForUserEdit = isFlightForEdit
        ? null
        : Math.max(
            Number(selectedRide?.availableSeats || 0) - pendingSeatsByMeForEdit,
            0,
        );

    const maxSeatsForEditDialog = isFlightForEdit
        ? Infinity
        : remainingSeatsForUserEdit + requestedByMeForEdit;

    /* ───────────── Single request card (RideCard UI) ───────────── */
    const renderRequestCard = (request) => {
        const ride = request?.rideId || {};
        const creator = ride?.createdBy || {};
        const isFlight = ride?.modeOfTravel === "Flight";

        const userName =
            `${creator.firstName || ""} ${creator.lastName || ""}`.trim() ||
            "Saathi User";
        const initials = `${creator.firstName?.[0] || ""}${creator.lastName?.[0] || ""}`.toUpperCase();

        const routeFrom = isFlight ? ride.fromAirport || ride.from : ride.from;
        const routeTo = isFlight
            ? ride.toAirport || ride.destination
            : ride.destination;

        const dateObj = ride.startTime ? new Date(ride.startTime) : null;
        const dateStr = dateObj
            ? dateObj.toLocaleDateString("en-US", {
                weekday: "short",
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
            })
            : "No date";
        const timeStr = dateObj
            ? dateObj.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            })
            : "";

        const languages = Array.isArray(creator?.language)
            ? creator.language.join(", ")
            : "";

        const subtitle = [
            userName,
            isFlight ? "Flight companion" : ride.modeOfTravel,
            languages,
        ]
            .filter(Boolean)
            .join(" · ");

        const chips = ride.modeOfTravel
            ? [{ label: ride.modeOfTravel, ...CHIP.blue }]
            : [];
        const statusItems = getStatusChips(request);

        const showMenu =
            (request?.status === "ACCEPTED" && ride?.travelStatus === "Waiting") ||
            (request?.status !== "CANCELLED" &&
                request?.status !== "REJECTED" &&
                ride?.travelStatus !== "CANCELLED" &&
                ride?.travelStatus !== "Cancelled" &&
                new Date() <= new Date(ride?.startTime));

        return (
            <Box
                key={request._id}
                sx={{ width: "100%", mb: { xs: 0.75, sm: 1, md: 1.25 } }}
            >
                <Paper
                    elevation={0}
                    onClick={() => setSelectedRideDetails(request)}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "stretch",
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 1, sm: 1.5, md: 2 },
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: { xs: "8px", md: "10px" },
                        border: "1px solid #E6E6E6",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        bgcolor: "#fff",
                        fontFamily: FONT,
                        cursor: "pointer",
                        overflow: "hidden",
                    }}
                >
                    <Avatar
                        src={creator?.profileImageUrl || ""}
                        alt={userName}
                        onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProfile(creator);
                            setProfileModalOpen(true);
                        }}
                        sx={{
                            width: { xs: 28, sm: 32, md: 36 },
                            height: { xs: 28, sm: 32, md: 36 },
                            bgcolor: "#FDE5D0",
                            color: "#C2531B",
                            fontSize: FS.avatar,
                            fontWeight: 600,
                            fontFamily: FONT,
                            flexShrink: 0,
                            cursor: "pointer",
                            alignSelf: "center",
                        }}
                    >
                        {initials}
                    </Avatar>

                    {/* Middle: route, subtitle, status chips */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: FONT,
                                fontSize: FS.route,
                                fontWeight: 700,
                                color: "#1A1A1A",
                                lineHeight: 1.3,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }}
                        >
                            {`${routeFrom || "—"} → ${routeTo || "—"}`}
                        </Typography>

                        <Typography
                            noWrap
                            sx={{
                                fontFamily: FONT,
                                fontSize: FS.subtitle,
                                color: "#6B6B6B",
                            }}
                        >
                            {subtitle}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                mt: 0.5,
                                gap: { xs: 0.55, md: 0.85 },
                                width: "100%",
                                minWidth: 0,
                            }}
                        >
                            {chips.map((chip) => (
                                <Chip
                                    key={chip.label}
                                    label={chip.label}
                                    size="small"
                                    sx={{
                                        flexShrink: 1,
                                        minWidth: 0,
                                        maxWidth: { xs: 160, sm: 220, md: 300 },
                                        height: { xs: 16, sm: 18, md: 20 },
                                        borderRadius: "10px",
                                        bgcolor: chip.bg,
                                        color: chip.color,
                                        fontFamily: FONT,
                                        fontSize: FS.chip,
                                        fontWeight: 500,
                                        "& .MuiChip-label": {
                                            display: "block",
                                            minWidth: 0,
                                            px: { xs: 0.75, md: 1 },
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        {/* Status – separate row below the info chips */}
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                columnGap: 0.75,
                                rowGap: 0.25,
                                mt: 0.75,
                                pt: 0.75,
                                borderTop: "1px dashed #E6E6E6",
                                minWidth: 0,
                            }}
                        >
                            {statusItems.map((item) => (
                                <Box
                                    key={item.label}
                                    sx={{ display: "flex", alignItems: "center", gap: 0.6, minWidth: 0 }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: 6, md: 7 },
                                            height: { xs: 6, md: 7 },
                                            borderRadius: "50%",
                                            bgcolor: item.color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontFamily: FONT,
                                            fontSize: { xs: 10, sm: 11, md: 12 },
                                            fontWeight: 600,
                                            color: item.color,
                                            lineHeight: 1.3,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {item.label}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Right: date / time + actions menu */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: 0.75,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: FONT,
                                    fontSize: FS.date,
                                    fontWeight: 700,
                                    color: "#1A1A1A",
                                    lineHeight: 1.3,
                                }}
                            >
                                {dateStr}
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: FONT,
                                    fontSize: FS.time,
                                    color: "#6B6B6B",
                                    lineHeight: 1.3,
                                }}
                            >
                                {timeStr} {ride?.timeZone?.match(/\(([^)]+)\)/)?.[1]}
                            </Typography>
                        </Box>

                        {showMenu && (
                            <IconButton
                                size="small"
                                onClick={(event) => handleMenuOpen(event, request)}
                                aria-label="Request actions"
                                sx={{
                                    color: "#1A1A1A",
                                    border: "1px solid #E6E6E6",
                                    borderRadius: "6px",
                                    p: { xs: 0.25, sm: 0.5 },
                                    "&:hover": { bgcolor: "#F5F5F5" },
                                }}
                            >
                                <MoreVertIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                            </IconButton>
                        )}
                    </Box>
                </Paper>
            </Box>
        );
    };

    /* ───────────── Render ───────────── */
    return (
        <PageLayout>
            <Box>
                <Typography
                    sx={{
                        fontFamily: FONT,
                        fontSize: { xs: "1.2rem", md: "1.35rem", lg: "1.5rem" },
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        mb: 0.5,
                    }}
                >
                    My Request Rides
                </Typography>
                <Typography
                    sx={{
                        fontFamily: FONT,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        color: "text.secondary",
                        mb: 3,
                    }}
                >
                    Track and manage the ride requests you've sent out
                </Typography>
            </Box>

            <Box sx={{ minHeight: "65vh", display: "flex", flexDirection: "column" }}>
                {loadingRequests ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flex: 1,
                            minHeight: "40vh",
                        }}
                    >
                        <CircularProgress sx={{ color: "#B5440F" }} />
                    </Box>
                ) : visibleRequests.length === 0 ? (
                    <Box
                        sx={{
                            width: "100%",
                            minHeight: "60vh",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                            No ride requests yet
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, maxWidth: 320 }}
                        >
                            Your requested rides will appear here.
                        </Typography>
                    </Box>
                ) : (
                    visibleRequests.map(renderRequestCard)
                )}

                {selectedRideDetails && (
                    <RideDetailsModal
                        onClose={() => setSelectedRideDetails(null)}
                        ride={selectedRideDetails.rideId}
                    />
                )}

                {/* Actions menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    slotProps={{
                        paper: {
                            elevation: 0,
                            sx: {
                                borderRadius: "12px",
                                minWidth: { xs: 60, sm: 120 },
                                // mt: 1,
                                bgcolor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.14)",
                            },
                        },
                    }}
                >
                    {/* Update */}
                    <MenuItem
                        onClick={() => {
                            setSelectedRide(selectedRequest?.rideId);
                            setOpenEditModal(true);
                            handleMenuClose();
                        }}
                        sx={{
                            borderRadius: "10px",
                            bgcolor: "#FFFFFF",
                            // py: { xs: 0.75, sm: 1 },
                            // px: { xs: 1, sm: 1.5 },
                            "&:hover": { bgcolor: "#EEF2FF" },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: { xs: 24, sm: 30 },
                            }}
                        >
                            <EditIcon
                                sx={{
                                    color: "#6C63FF",
                                    fontSize: { xs: 15, sm: 18, md: 20 },
                                }}
                            />
                        </ListItemIcon>

                        <Typography
                            fontWeight={600}
                            sx={{
                                fontSize: { xs: 12, sm: 13, md: 14 },
                            }}
                            color="text.primary"
                        >
                            Update
                        </Typography>
                    </MenuItem>

                    {/* Cancel */}
                    <MenuItem
                        onClick={() => {
                            handleCancelClick(selectedRequest);
                            handleMenuClose();
                        }}
                        sx={{
                            borderRadius: "10px",
                            bgcolor: "#FFFFFF",
                            // py: { xs: 0.75, sm: 1 },
                            // px: { xs: 1, sm: 1.5 },
                            "&:hover": { bgcolor: "#FFF1F2" },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: { xs: 24, sm: 30 },
                            }}
                        >
                            <DeleteIcon
                                sx={{
                                    color: "#E53935",
                                    fontSize: { xs: 15, sm: 18, md: 20 },
                                }}
                            />
                        </ListItemIcon>

                        <Typography
                            fontWeight={600}
                            sx={{
                                fontSize: { xs: 12, sm: 13, md: 14 },
                            }}
                            color="error.main"
                        >
                            Cancel
                        </Typography>
                    </MenuItem>
                </Menu>
                {/* Cancel confirmation */}
                <Dialog
                    open={openCancelDialog}
                    onClose={(event, reason) => {
                        if (reason === "backdropClick") return;
                        setOpenCancelDialog(false);
                    }}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, m: { xs: 2, sm: 4 } } }}
                >
                    <DialogTitle sx={{ fontWeight: 700, pb: 1, pr: 7 }}>
                        Cancel ride request?
                        <IconButton
                            onClick={() => setOpenCancelDialog(false)}
                            sx={{ position: "absolute", right: 12, top: 12 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <Stack direction="row" spacing={1.25}>
                            <WarningAmberRoundedIcon
                                sx={{ color: "#E67E22", mt: "2px" }}
                                fontSize="small"
                            />
                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: 500,
                                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                                    lineHeight: 1.5,
                                }}
                            >
                                If you cancel this ride, you won't be able to request the same
                                ride again.
                            </Typography>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button
                            variant="contained"
                            onClick={() => setOpenCancelDialog(false)}
                            disabled={isCancelling}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                flex: 1,
                                minHeight: 44,
                                fontWeight: 600,
                                backgroundColor: "#757575",
                                color: "#fff",
                                "&:hover": { backgroundColor: "#9E9E9E" },
                                "&.Mui-disabled": { backgroundColor: "#D0D0D0", color: "#fff" },
                            }}
                        >
                            Keep request
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleConfirmCancel}
                            disabled={isCancelling}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                flex: 1,
                                minHeight: 44,
                                boxShadow: "none",
                            }}
                        >
                            {isCancelling ? "Cancelling..." : "Cancel Request"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <ProfileModal
                    open={profileModalOpen}
                    selectedProfile={selectedProfile}
                    onClose={() => setProfileModalOpen(false)}
                />

                <Ridebook
                    open={openEditModal}
                    onClose={() => setOpenEditModal(false)}
                    ride={selectedRide}
                    setAllMyRequests={setAllMyRequests}
                    allMyRequests={allMyRequests}
                    maxSeats={maxSeatsForEditDialog}
                    requestToEdit={selectedRequest}
                    remainingSeatsForUser={remainingSeatsForUserEdit}
                />
            </Box>
        </PageLayout>
    );
};

export default RequestRide;