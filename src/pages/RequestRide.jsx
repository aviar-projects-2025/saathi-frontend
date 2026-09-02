import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  FormControl,
  Grid,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Slider,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  DialogContentText,
  Badge,
  Collapse,
  Avatar,
  useTheme,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import axios from "axios";
import Api from "../Api";
import Ridebook from "./Ridebook.jsx";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useRide } from "../context/RideContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageLayout from "../components/PageLayout";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import RideDetailsModal from "./RideDetails.jsx";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ProfileModal from './Avatar.jsx';

const ACCENT = "#FF9933";
const ACCENT_DARK = "#E67E22";
const HEADER_BG = "#1a1030"
// "#1a1030"
const CARD_BORDER = "#F0E4D6";

const statusStyles = (status) => {
  switch (status) {
    case "ACCEPTED":
      return { bg: "#E8F7EE", fg: "#1E8E3E", dot: "#2FBE5C" };
    case "REJECTED":
      return { bg: "#FCEAEA", fg: "#C0392B", dot: "#E5564A" };
    default:
      return { bg: "#FDF1DE", fg: "#B5690D", dot: "#F5A623" };
  }
};

const RequestRide = ({ ride }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [allMyRequests, setAllMyRequests] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userData, setUserData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [rejectedSeats,setRejectedSeats] = useState();
  const [remainingSeatsForUser, setRemainingSeatsForUser] = useState();
  const totalSeats = ride?.totalSeats;
  const [selectedRideDetails, setSelectedRideDetails] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const toasts = ToastConfig();
  const open = Boolean(anchorEl);
  const { refreshRide } = useRide();

  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchAllSends();
  }, []);

  useEffect(() => {
    fetchAllSends();
  }, [refreshRide]);

  async function fetchAllSends() {
    try {
      setLoadingRequests(true);

      if (!user?.id) return;
      const res = await axios.get(`${Api}/bookride/send/${user.id}`);
      console.log(res,'res')
      const requestUser = res.data.data.map((item) => item.members);
      const rejectedreq = res.data.data.map((item)=>item.rejectedSeats);
      setRejectedSeats(res.data.data.map((item)=>item.rejectedSeats))
      setUserData(requestUser);
      const availableSeat = res.data.data.map(
        (item) => item.rideId?.availableSeats
      );
      setRemainingSeatsForUser(availableSeat)

      setAllMyRequests(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setAllMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }
  console.log("juyyyvvyh", allMyRequests)
  const handleMenuOpen = (event, request) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCancelClick = (request) => {
    setSelectedRequest(request);
    setOpenCancelDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCancelDialog(false);
    setSelectedRequest(null);
    setIsCancelling(false);
  };

  const handleDelete = async (requestId) => {
    setDeleteLoading(true);
    setOpenCancelDialog(false);
    setSelectedRequest(null);
    try {
      // Soft delete - update status to DELETED
      await axios.patch(`${Api}/bookride/${requestId}/status?type=Cancel`, {
        status: "DELETED",
        cancelledBy: user?.id,
        cancelledAt: new Date().toISOString(),
      });

      // Remove from local state (hide from list)
      setAllMyRequests((prev) =>
        prev.filter((request) => request._id !== requestId),
      );

      toast.success("Ride request deleted successfully", toasts);

      // Refresh data and notify MyRides
      await fetchAllSends();
      window.dispatchEvent(
        new CustomEvent("rideDataChanged", {
          detail: { action: "deleted", requestId: requestId },
        }),
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete ride request",
        toasts,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;

    setIsCancelling(true);

    try {
      // Soft delete - update status to DELETED
      await axios.patch(
        `${Api}/bookride/${selectedRequest._id}/status?type=Cancel`,
        {
          status: "DELETED",
          cancelledBy: user?.id,
          cancelledAt: new Date().toISOString(),
        },
      );

      // Remove from local state (hide from list)
      setAllMyRequests((prev) =>
        prev.filter((request) => request._id !== selectedRequest._id),
      );

      handleCloseDialog();
      await fetchAllSends();

      // Notify MyRides to update history
      window.dispatchEvent(
        new CustomEvent("rideDataChanged", {
          detail: { action: "cancelled", requestId: selectedRequest._id },
        }),
      );

      toast.success("Ride request cancelled successfully", toasts);
    } catch (err) {
      console.error("Error cancelling request:", err);

      if (err.response?.data?.message?.toLowerCase().includes("invalid")) {
        try {
          await axios.patch(
            `${Api}/bookride/${selectedRequest._id}/status?type=Reject`,
            {
              status: "CANCELLED",
              cancelledBy: user?.id,
              cancelledAt: new Date().toISOString(),
            },
          );

          // Remove from local state (hide from list)
          setAllMyRequests((prev) =>
            prev.filter((request) => request._id !== selectedRequest._id),
          );

          handleCloseDialog();
          await fetchAllSends();

          // Notify MyRides to update history
          window.dispatchEvent(
            new CustomEvent("rideDataChanged", {
              detail: {
                action: "cancelled",
                requestId: selectedRequest._id,
              },
            }),
          );

          toast.success("Ride request cancelled successfully", toasts);
        } catch (retryErr) {
          toast.error(
            retryErr.response?.data?.message ||
            "Failed to cancel ride request",
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

  // Filter: Only show ACTIVE requests (not deleted/cancelled/rejected)
  const activeRequests = allMyRequests.filter(
    (req) =>
      req?.rideId &&
      // req.status !== "DELETED" &&
      req.status !== "CANCELLED" &&
      req.status !== "REJECTED",
  );

  return (
    <PageLayout>
      <Box>
        <Typography
          sx={{
            fontSize: { xs: "1.4rem", sm: "1.7rem" },
            fontWeight: 700,
            letterSpacing: "-0.01em",
            mb: 0.5,
          }}
        >
          My Request Rides
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            color: "text.secondary",
            mb: 3,
          }}
        >
          Track and manage the ride requests you've sent out
        </Typography>
      </Box>

      <Box
        sx={{
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
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
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        ) : activeRequests.length === 0 ? (
          <Box
            sx={{
              width: "100%",
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            {/* <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#FFF3E4",
                mb: 2.5,
              }}
            >
              <DirectionsCarFilledOutlinedIcon
                sx={{ fontSize: 36, color: ACCENT_DARK }}
              />
            </Box> */}

            <Typography variant="h6" fontWeight={700} color="text.primary">
              No ride requests yet
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 320 }}
            >
              "Your requested rides will appear here."
            </Typography>
          </Box>
        ) : (
          <>
            {activeRequests.map((request) => {
              const s = statusStyles(request.status);

              const pendingReqSeats = Number(request?.pendingReqSeats || 0);

              const isRejected = request?.status === "REJECTED";
              const isCancelled = request?.status === "Cancelled";
              const isAccepted = request?.status === "ACCEPTED";
              // const rejectedSeats = Number(request?.rejectedReq || 0);
              const requestedByMe = Number(request?.seatsRequested || 0);
              const approvedSeats = Number(request?.approvedSeats || 0);
              console.log("hyyuininhbbuu",rejectedSeats)
              const mainText = isRejected
                ? rejectedSeats > 0 && approvedSeats > 0
                  ? `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""
                  } and ${rejectedSeats} rejected seat${rejectedSeats > 1 ? "s" : ""
                  }`
                  : "Rejected"
                : isCancelled
                  ? "Cancelled"
                  : isAccepted
                    ? rejectedSeats > 0
                      ? `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""
                      } and ${rejectedSeats} rejected seat${rejectedSeats > 1 ? "s" : ""
                      }`
                      : `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""
                      }`
                    : `You applied for ${requestedByMe} seat${requestedByMe > 1 ? "s" : ""
                    }`; 
                    console.log("gvhbjnkml;'gfx viuyfg",rejectedSeats)

              const pendingText =
                isAccepted && pendingReqSeats > 0
                  ? `and ${pendingReqSeats} pending seat${pendingReqSeats > 1 ? "s" : ""
                  }`
                  : null;

              return (
                <Card
                  key={request._id}
                  elevation={0}
                  sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    minHeight: { xs: "auto", sm: "150px", md: "160px" },
                    mb: { xs: 1.5, sm: 2, md: 2.25 },
                    borderRadius: { xs: "16px", sm: "20px" },
                    overflow: "hidden",
                    border: `1px solid ${CARD_BORDER}`,
                    boxShadow: "0 4px 16px rgba(20, 10, 40, 0.06)",
                    cursor: "pointer",
                    transition: "box-shadow .25s ease, transform .25s ease",
                    "&:hover": {
                      boxShadow: "0 12px 28px rgba(20, 10, 40, 0.12)",
                      transform: { xs: "none", sm: "translateY(-3px)" },
                    },
                  }}

                >
                  {/* Header bar */}
                  <Box
                    sx={{
                      // bgcolor: HEADER_BG,
                      // backgroundImage:
                      //   "linear-gradient(135deg, #1a1030 0%, #241645 100%)",
                      bgcolor: HEADER_BG,
                      px: { xs: 1.75, sm: 2.5, md: 3 },
                      py: { xs: 1, sm: 1.1, md: 1.25 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      sx={{ minWidth: 0 }}
                    >
                      <Avatar
                        src={request?.rideId?.createdBy?.profileImage || ""}
                        alt={
                          request?.rideId?.createdBy?.firstName
                            ? `${request.rideId.createdBy.firstName} ${request.rideId.createdBy.lastName || ""
                            }`
                            : "Profile Image"
                        }
                        onClick={() => {
                          setSelectedProfile(request?.rideId?.createdBy);
                          setProfileModalOpen(true);
                        }}
                        sx={{
                          width: { xs: 26, sm: 35 },
                          height: { xs: 26, sm: 35 },
                          fontSize: { xs: 12, sm: 13 },
                          fontWeight: 700,
                          bgcolor: ACCENT,
                          color: "#1a1030",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      {/* {(request?.rideId?.createdBy?.firstName || "?")
                          .charAt(0)
                          .toUpperCase()} */}
                      {/* </Avatar> */}

                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: { xs: 12.5, sm: 14, md: 15.2 },
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minWidth: 0,
                        }}
                      >
                        {request?.rideId?.createdBy?.firstName || "Unknown"}{" "}
                        {request?.rideId?.createdBy?.lastName || ""}
                      </Typography>
                    </Stack>

                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
                      {/* <Chip
                        label={request.status}
                        size="small"
                        // icon={
                        //   <Box
                        //     component="span"
                        //     sx={{
                        //       width: 6,
                        //       height: 6,
                        //       borderRadius: "50%",
                        //       bgcolor: s.dot,
                        //       ml: "8px !important",
                        //     }}
                        //   />
                        // }
                        sx={{
                          fontWeight: 700,
                          borderRadius: "20px",
                          fontSize: { xs: 9, sm: 10.5, md: 12.5 },
                          height: { xs: 22, sm: 26, md: 28 },
                          bgcolor: s.bg,
                          color: s.fg,
                          "& .MuiChip-icon": { color: s.dot },
                        }}
                      /> */}

                      <Chip
                        label={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography
                              component="span"
                              sx={{
                                fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                fontWeight: 600,
                                color: isAccepted ? "#2E7D32" : "#f30b0b",
                              }}
                            >
                              {mainText}
                            </Typography>

                            {pendingText && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                  fontWeight: 600,
                                  color: "#F57C00",
                                }}
                              >
                                {pendingText}
                              </Typography>
                            )}
                          </Box>
                        }
                        color={isAccepted ? "success" : "info"}
                        sx={{
                          height: { xs: 18, sm: 25 },
                          bgcolor: isAccepted ? "#E8F5E9" : "#f4f7f9",
                          "& .MuiChip-label": {
                            px: { xs: 0.5, sm: 1 },
                          },
                        }}
                      />

                      {request?.status != "Cancelled" &&
                        <IconButton
                          onClick={(event) => handleMenuOpen(event, request)}
                          sx={{
                            color: "#fff",
                            p: { xs: 0.5, sm: 0.75, md: 1 },
                            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </IconButton>
                      }
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      p: {
                        xs: "12px !important",
                        sm: "14px 20px !important",
                        md: "15px 26px !important",
                      },
                      "&:last-child": { pb: { xs: "12px", sm: "14px", md: "15px" } },
                    }}
                    onClick={() => setSelectedRideDetails(request)}
                  >
                    <Box sx={{ width: "100%" }}>

                      <Box
                        sx={{
                          display: { xs: "block", md: "flex" },
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        {/* ================= FROM / TO ================= */}
                        <Box
                          sx={{
                            display: "flex",
                            width: { xs: "100%", md: "38%" },
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: { xs: 1, sm: 1.5 },
                            pb: { xs: 1, sm: 0 },
                            minWidth: 0,
                            mt: { xs: 0.2, sm: 2.2 },
                          }}
                        >
                          {/* FROM */}
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              sx={{
                                color: ACCENT_DARK,
                                fontWeight: 700,
                                letterSpacing: 0.8,
                                fontSize: { xs: "0.58rem", sm: "0.65rem", md: "0.68rem" },
                              }}
                            >
                              FROM
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0, mt: 0.25 }}>
                              <LocationOnIcon
                                sx={{
                                  color: "#e2483d",
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  flexShrink: 0,
                                }}
                              />

                              <Typography
                                fontWeight={700}
                                sx={{
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: { xs: "0.78rem", sm: "0.88rem", md: "0.95rem" },
                                  lineHeight: 1.3,
                                }}
                              >
                                {request?.rideId?.from || "—"}
                              </Typography>
                            </Box>
                          </Box>

                          {/* ARROW */}
                          <Box
                            sx={{
                              width: { xs: 20, sm: 24, md: 26 },
                              height: { xs: 20, sm: 24, md: 26 },
                              borderRadius: "50%",
                              bgcolor: "#FFF3E4",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              mx: { xs: 0.5, sm: 1, md: 1.25 },
                            }}
                          >
                            <ArrowForwardIcon
                              sx={{
                                color: ACCENT_DARK,
                                fontSize: { xs: 12, sm: 14, md: 15 },
                              }}
                            />
                          </Box>

                          {/* TO */}
                          <Box sx={{ minWidth: 0, flex: 1, textAlign: "right" }}>
                            <Typography
                              sx={{
                                color: ACCENT_DARK,
                                fontWeight: 700,
                                letterSpacing: 0.8,
                                fontSize: { xs: "0.58rem", sm: "0.65rem", md: "0.68rem" },
                              }}
                            >
                              TO
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 0.5,
                                minWidth: 0,
                                mt: 0.25,
                              }}
                            >
                              <LocationOnIcon
                                sx={{
                                  color: "#e2483d",
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  flexShrink: 0,
                                }}
                              />

                              <Typography
                                fontWeight={700}
                                sx={{
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: { xs: "0.78rem", sm: "0.88rem", md: "0.95rem" },
                                  lineHeight: 1.3,
                                }}
                              >
                                {request?.rideId?.destination || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ display: { xs: "none", md: "block" }, mx: 2.5, my: -1.7, mt: 1 }}
                        />

                        {/* ================= DATE / TIME / OTHER DETAILS ================= */}
                        <Box
                          sx={{
                            display: "flex",
                            width: { xs: "100%", md: "50%" },
                            justifyContent: { xs: 'flex-start', sm: "flex-start", md: "space-around" },
                            alignItems: "center",
                            flexWrap: { xs: "wrap", sm: "nowrap" },
                            gap: { xs: 3, sm: 7, md: 2 },
                            minWidth: 0,
                            mt: { xs: 1, sm: 2.2 },
                          }}
                        >
                          {/* DATE & TIME */}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.62rem", sm: "0.68rem", md: "0.7rem" },
                                color: "text.secondary",
                                mb: 0.5,
                              }}
                            >
                              Date
                            </Typography>

                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                              <CalendarTodayIcon
                                sx={{
                                  color: ACCENT,
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  flexShrink: 0,
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {request?.createdAt
                                  ? new Date(request.createdAt).toLocaleDateString()
                                  : "—"}{" "}
                              </Typography>
                            </Stack>
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.62rem", sm: "0.68rem", md: "0.7rem" },
                                color: "text.secondary",
                                mb: 0.5,
                              }}
                            >
                              Time
                            </Typography>

                            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                              <AccessTimeIcon
                                sx={{
                                  color: ACCENT,
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  flexShrink: 0,
                                }}
                              />

                              <Typography
                                sx={{
                                  fontSize: {
                                    xs: "0.7rem",
                                    sm: "0.8rem",
                                    md: "0.875rem",
                                  },
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {request?.createdAt
                                  ? new Date(request.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : "—"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {selectedRideDetails && (
          <RideDetailsModal
            onClose={() => setSelectedRideDetails(null)}
            ride={selectedRideDetails.rideId}
          />
        )}

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "18px",
              minWidth: 260,
              p: 1,
              mt: 1,
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.14)",
              overflow: "hidden",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setSelectedRide(selectedRequest?.rideId);
              setOpenEditModal(true);
              handleMenuClose();
            }}
            sx={{
              borderRadius: "14px",
              py: 1.5,
              mb: 0.5,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#EEF2FF" },
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: "#6C63FF" }} />
            </ListItemIcon>
            <Box>
              <Typography fontWeight={600} fontSize={14}>
                Update ride
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Modify your ride request
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCancelClick(selectedRequest);
              handleMenuClose();
            }}
            sx={{
              borderRadius: "14px",
              py: 1.5,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#FFF1F2" },
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "#E53935" }} />
            </ListItemIcon>
            <Box>
              <Typography fontWeight={600} fontSize={14} color="error">
                Cancel ride request
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cancel your current request
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Cancel ride request
            <IconButton
              onClick={() => setOpenCancelDialog(false)}
              sx={{ position: "absolute", right: 12, top: 12 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Stack direction="row" spacing={1.25} sx={{ mb: 2 }}>
              <WarningAmberRoundedIcon sx={{ color: "#E67E22", mt: "2px" }} fontSize="small" />
              <Typography sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.9rem" }}>
                If you cancel ride, you won't be able to request the
                same ride again.
              </Typography>
            </Stack>

            {selectedRequest && (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FFF8F2",
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 3,
                }}
                elevation={0}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationOnIcon sx={{ color: "#e2483d", fontSize: 18 }} />
                  <Typography fontWeight={700} fontSize={14}>
                    {selectedRequest.rideId?.from} → {selectedRequest.rideId?.destination}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
                  <CalendarTodayIcon sx={{ color: ACCENT, fontSize: 15 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(selectedRequest.createdAt).toLocaleDateString()} at{" "}
                    {new Date(selectedRequest.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenCancelDialog(false)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                flex: 1,
                minHeight: 44,
                fontWeight: 600,
                borderColor: "#D9D9D9",
                color: "text.primary",
              }}
              disabled={isCancelling}
            >
              Keep request
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmCancel}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                flex: 1,
                minHeight: 44,
                boxShadow: "none",
              }}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel ride"}
            </Button>
          </DialogActions>
        </Dialog>

        <ProfileModal
          open={profileModalOpen}
          selectedProfile={selectedProfile}
          onClose={() => {
            setProfileModalOpen(false);
          }}
        />

        <Ridebook
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          ride={selectedRide}
          setAllMyRequests={setAllMyRequests}
          allMyRequests={allMyRequests}
          maxSeats={selectedRide?.availableSeats ?? Infinity}
          requestToEdit={selectedRequest}
          remainingSeatsForUser={remainingSeatsForUser}
        />

      </Box>
    </PageLayout>
  );
};

export default RequestRide;