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
  MenuItem,
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
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import axios from "axios";
import Api from "../Api";
import Ridebook from "./Ridebook.jsx";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useRide } from "../context/RideContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageLayout from "../components/PageLayout";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";

const RequestRide = () => {
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [allMyRequests, setAllMyRequests] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userData, setUserData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const toasts = ToastConfig();

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
      if (!user?.id) return;
      setLoadingRequests(true);
      const res = await axios.get(`${Api}/bookride/send/${user.id}`);
      const requestUser = res.data.data.map((item) => item.members);
      setUserData(requestUser);

      setAllMyRequests(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setAllMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async (requestId) => {
    setOpenCancelDialog(false);
    setSelectedRequest(null);
    try {
      await axios.delete(`${Api}/bookride/${requestId}`);
      setAllMyRequests((prev) =>
        prev.filter((request) => request._id !== requestId),
      );
      toast.success("Ride request deleted successfully", toasts);

      fetchAllSends();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to delete ride request",
        toasts,
      );
    }
  };

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
      fetchAllSends();
    } catch (err) {
      console.error("Error cancelling request:", err);
    }
  };

  return (
    <PageLayout>
      <Box
        sx={{
          minHeight: "65vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          px: 2,
        }}
      >
        {allMyRequests.filter((req) => req?.rideId).length === 0 && (
          <DirectionsCarFilledOutlinedIcon
            sx={{
              fontSize: 55,
              color: "#bdbdbd",
              mb: 2,
            }}
          />
        )}
        <Typography
          sx={{
            fontSize: {
              xs: "1.4rem",
              sm: "1.7rem",
            },
            fontWeight: 100,
            mb: 2,
          }}
        >
          My Request Rides
        </Typography>
        <br />

        {loadingRequests ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : allMyRequests.filter((req) => req?.rideId).length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{
              maxWidth: "400px",
              fontSize: {
                xs: "0.9rem",
                sm: "1rem",
              },
              mb: 3,
            }}
          >
            {" "}
            No ride requests found.
          </Typography>
        ) : (
          <>
            {(() => {
              const uniqueRequests = allMyRequests.filter((req) => req?.rideId);
              const completed = uniqueRequests.filter(
                (request) => request.rideId?.travelStatus === "Completed",
              );
              const active = uniqueRequests.filter(
                (request) => request.rideId?.travelStatus !== "Completed",
              );

              return (
                <>
                  {completed.length > 0 && (
                    <Box
                      sx={{
                        mb: 3,
                        borderRadius: "16px",
                        border: "1px solid #f0d9c0",
                        bgcolor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      {completed.map((request, idx) => {
                        const user = request.rideId?.createdBy || {};
                        const initials =
                          `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

                        return (
                          <Box
                            key={request._id}
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedRide(request.rideId);
                              //   setOpenEditModal(true);
                            }}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              px: 2.5,
                              py: 1.5,
                              cursor: "pointer",
                              borderBottom:
                                idx !== completed.length - 1
                                  ? "1px solid #f0e6d8"
                                  : "none",
                              "&:hover": { bgcolor: "#FFF9F2" },
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              <Avatar
                                sx={{
                                  bgcolor: "#f5ddc2",
                                  color: "#7a4a00",
                                  width: 40,
                                  height: 40,
                                  fontSize: "0.9rem",
                                  fontWeight: 700,
                                }}
                              >
                                {initials || "U"}
                              </Avatar>
                              <VerifiedIcon
                                sx={{
                                  position: "absolute",
                                  bottom: -2,
                                  right: -2,
                                  fontSize: 14,
                                  color: "#1976d2",
                                  bgcolor: "#fff",
                                  borderRadius: "50%",
                                }}
                              />
                            </Box>

                            {/* Name + route/subtext */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography fontWeight={700} fontSize={14} noWrap>
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography
                                fontSize={12}
                                color="text.secondary"
                                noWrap
                              >
                                {request.rideId?.from} →{" "}
                                {request.rideId?.destination}
                              </Typography>
                            </Box>

                            {/* Right side value */}
                            <Box sx={{ textAlign: "right" }}>
                              <Typography fontWeight={700} fontSize={16}>
                                {new Date(
                                  request.createdAt,
                                ).toLocaleDateString()}
                              </Typography>
                              <Typography fontSize={11} color="text.secondary">
                                completed
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {active.map((request) => {
                    const requestCount = allMyRequests.filter(
                      (item) =>
                        item?.rideId &&
                        item?.rideId?.createdBy?._id ===
                          request?.rideId?.createdBy?._id,
                    ).length;

                    return (
                      <Card
                        key={request._id}
                        sx={{
                          width: "100%",
                          maxWidth: "1200px",
                          minHeight: "220px",
                          mb: 4,
                          borderRadius: "20px",
                          overflow: "hidden",
                          border: "1px solid #f0d9c0",
                          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        {/* Header bar */}
                        <Box
                          sx={{
                            bgcolor: "#1a1030",
                            px: 3,
                            py: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#fff",
                              fontWeight: 600,
                              fontSize: 15,
                            }}
                          >
                            {request.rideId?.createdBy?.firstName}{" "}
                            {request.rideId?.createdBy?.lastName}
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
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
                              onClick={() => {
                                setSelectedRequest(request);
                                setSelectedRide(request.rideId);
                                setOpenEditModal(true);
                              }}
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.1)",
                                color: "#fff",
                                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelClick(request);
                              }}
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
                        <Dialog
                          open={openCancelDialog}
                          onClose={() => setOpenCancelDialog(false)}
                          maxWidth="xs"
                          fullWidth
                        >
                          <DialogTitle>Delete Post</DialogTitle>

                          <DialogContent>
                            <Typography>
                              Are you sure you want to delete this request?
                            </Typography>
                          </DialogContent>

                          <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button
                              variant="contained"
                              onClick={() => setOpenCancelDialog(false)}
                              sx={{
                                bgcolor: "grey.500",
                                color: "#fff",
                                "&:hover": {
                                  bgcolor: "grey.700",
                                },
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => {
                                if (selectedRequest) {
                                  handleDelete(selectedRequest._id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </DialogActions>
                        </Dialog>
                        <CardContent
                          sx={{
                            p: 4,
                          }}
                        >
                          {" "}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "#FF9933",
                                  fontWeight: 600,
                                }}
                              >
                                FROM
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <LocationOnIcon
                                  sx={{ color: "#e2483d", fontSize: 18 }}
                                />
                                <Typography fontWeight={600}>
                                  {request.rideId?.from}
                                </Typography>
                              </Box>
                            </Box>
                            <ArrowForwardIcon sx={{ color: "#FF9933" }} />
                            <Box sx={{ textAlign: "right" }}>
                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "#FF9933",
                                  fontWeight: 600,
                                }}
                              >
                                TO
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  justifyContent: "flex-end",
                                }}
                              >
                                <LocationOnIcon
                                  sx={{ color: "#e2483d", fontSize: 18 }}
                                />
                                <Typography fontWeight={600}>
                                  {request.rideId?.destination}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ borderTop: "1px solid #f0e6d8", my: 2 }} />
                          <Box
                            sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                          >
                            <Box>
                              <Typography
                                sx={{ fontSize: 11, color: "text.secondary" }}
                              >
                                Date
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <CalendarMonthIcon
                                  sx={{ color: "#FF9933", fontSize: 16 }}
                                />
                                <Typography fontWeight={600} fontSize={13}>
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Box>
                              <Typography
                                sx={{ fontSize: 11, color: "text.secondary" }}
                              >
                                Time
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{ color: "#FF9933", fontSize: 16 }}
                                />
                                <Typography fontWeight={600} fontSize={13}>
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              );
            })()}
          </>
        )}
        <Ridebook
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          ride={selectedRide}
          setAllMyRequests={setAllMyRequests}
          allMyRequests={allMyRequests}
          maxSeats={selectedRide?.availableSeats ?? Infinity}
          // onSuccess={fetchAllSends}
          requestToEdit={selectedRequest}
        />
        {console.log("allMyRequests123", allMyRequests)}
      </Box>
    </PageLayout>
  );
};

export default RequestRide;
