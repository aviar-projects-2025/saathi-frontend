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

const RequestRide = () => {
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [allMyRequests, setAllMyRequests] = useState([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userData, setUserData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = Active, 1 = History
  const user = JSON.parse(localStorage.getItem("user"));

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

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;

    setIsCancelling(true);

    try {
      await axios.patch(
        `${Api}/bookride/${selectedRequest._id}/status?type=Cancel`,
        { status: "CANCELLED" },
      );

      handleCloseDialog();
      await fetchAllSends();
      toast.success("Ride request cancelled successfully", toasts);
    } catch (err) {
      console.error("Error cancelling request:", err);

      if (err.response?.data?.message?.toLowerCase().includes("invalid")) {
        try {
          await axios.patch(
            `${Api}/bookride/${selectedRequest._id}/status?type=Reject`,
            { status: "REJECTED" },
          );

          handleCloseDialog();
          await fetchAllSends();
          toast.success("Ride request cancelled successfully", toasts);
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

  // Filter requests based on tab
  const uniqueRequests = allMyRequests.filter((req) => req?.rideId);

  // Active requests (not completed and not cancelled/rejected)
  const activeRequests = uniqueRequests.filter(
    (request) =>
      request.rideId?.travelStatus !== "Completed" &&
      request.rideId?.travelStatus !== "Cancelled" &&
      request.status !== "CANCELLED" &&
      request.status !== "REJECTED",
  );

  // History requests (completed + cancelled/rejected)
  const historyRequests = uniqueRequests.filter(
    (request) =>
      request.rideId?.travelStatus === "Cfompleted" ||
      request.rideId?.travelStatus === "Cancelled" ||
      request.status === "CANCELLED" ||
      request.status === "REJECTED",
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render active request card
  const renderActiveRequest = (request) => (
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
            onClick={(event) => handleMenuOpen(event, request)}
            sx={{ color: "#fff" }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
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
              <LocationOnIcon sx={{ color: "#e2483d", fontSize: 18 }} />
              <Typography fontWeight={600}>{request.rideId?.from}</Typography>
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
              <LocationOnIcon sx={{ color: "#e2483d", fontSize: 18 }} />
              <Typography fontWeight={600}>
                {request.rideId?.destination}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ borderTop: "1px solid #f0e6d8", my: 2 }} />
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
              Date
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
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
  );

  // Render history item
  const renderHistoryItem = (request, idx) => {
    const user = request.rideId?.createdBy || {};
    const initials =
      `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
    const isCancelled =
      request.status === "CANCELLED" ||
      request.status === "REJECTED" ||
      request.rideId?.travelStatus === "Cancelled";

    return (
      <Box
        key={request._id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.5,
          cursor: "default",
          borderBottom:
            idx !== historyRequests.length - 1 ? "1px solid #f0e6d8" : "none",
          "&:hover": { bgcolor: "#FFF9F2" },
          opacity: isCancelled ? 0.7 : 1,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            sx={{
              bgcolor: isCancelled ? "#e0e0e0" : "#f5ddc2",
              color: isCancelled ? "#666" : "#7a4a00",
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
              color: isCancelled ? "#999" : "#1976d2",
              bgcolor: "#fff",
              borderRadius: "50%",
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={700} fontSize={14} noWrap>
              {user.firstName} {user.lastName}
            </Typography>
            {isCancelled && (
              <Chip
                label="CANCELLED"
                size="small"
                sx={{
                  bgcolor: "#FFEBEE",
                  color: "#9B2226",
                  fontWeight: 700,
                  fontSize: "0.6rem",
                  height: 20,
                }}
              />
            )}
          </Box>
          <Typography fontSize={12} color="text.secondary" noWrap>
            {request.rideId?.from} → {request.rideId?.destination}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography fontWeight={700} fontSize={14}>
            {new Date(request.createdAt).toLocaleDateString()}
          </Typography>
          <Typography fontSize={11} color="text.secondary">
            {isCancelled ? "❌ Cancelled" : "✅ Completed"}
          </Typography>
        </Box>
      </Box>
    );
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
        ) : uniqueRequests.length === 0 ? (
          <>
            <DirectionsCarFilledOutlinedIcon
              sx={{
                fontSize: 55,
                color: "#bdbdbd",
                mb: 2,
              }}
            />
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
              No ride requests found.
            </Typography>
          </>
        ) : (
          <>
            {/* Tabs */}
            <Box
              sx={{
                width: "100%",
                maxWidth: "1200px",
                borderBottom: "1px solid",
                borderColor: "divider",
                mb: 3,
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    minHeight: 48,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#FF9933",
                    height: 3,
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>Active Requests</span>
                      <Chip
                        label={activeRequests.length}
                        size="small"
                        sx={{
                          bgcolor: "#FF9933",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>History</span>
                      <Chip
                        label={historyRequests.length}
                        size="small"
                        sx={{
                          bgcolor: "#757575",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    </Box>
                  }
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ width: "100%", maxWidth: "1200px" }}>
              {tabValue === 0 && (
                <>
                  {activeRequests.length > 0 ? (
                    activeRequests.map((request) =>
                      renderActiveRequest(request),
                    )
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="text.secondary">
                        No active ride requests.
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {tabValue === 1 && (
                <>
                  {historyRequests.length > 0 ? (
                    <Box
                      sx={{
                        borderRadius: "16px",
                        border: "1px solid #f0d9c0",
                        bgcolor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        sx={{
                          px: 2.5,
                          py: 1.5,
                          bgcolor: "#f8f8f8",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "text.secondary",
                          borderBottom: "1px solid #f0e6d8",
                        }}
                      >
                        📜 History ({historyRequests.length})
                      </Typography>

                      {historyRequests.map((request, idx) =>
                        renderHistoryItem(request, idx),
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <Typography color="text.secondary">
                        No history found.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </>
        )}

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: "20px",
              minWidth: 250,
              p: 1,
              mt: 1,
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.12)",
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
              "&:hover": {
                bgcolor: "#EEF2FF",
              },
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: "#6C63FF" }} />
            </ListItemIcon>
            <Box>
              <Typography fontWeight={600} fontSize={14}>
                Update Ride
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
              "&:hover": {
                bgcolor: "#FFF1F2",
              },
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: "#E53935" }} />
            </ListItemIcon>
            <Box>
              <Typography fontWeight={600} fontSize={14} color="error">
                Cancel Ride Request
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cancel your current request
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={openCancelDialog}
          onClose={() => setOpenCancelDialog(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Cancel Ride Request
            <IconButton
              onClick={() => setOpenCancelDialog(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 2, color: "text.secondary" }}>
              Are you sure you want to cancel this ride request? This action
              cannot be undone.
            </Typography>

            {selectedRequest && (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FFF8F2",
                  border: "1px solid #F0E6DC",
                  borderRadius: 2,
                }}
                elevation={0}
              >
                <Typography fontWeight={600} fontSize={14}>
                  📍 {selectedRequest.rideId?.from} →{" "}
                  {selectedRequest.rideId?.destination}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  📅 {new Date(selectedRequest.createdAt).toLocaleDateString()}{" "}
                  at{" "}
                  {new Date(selectedRequest.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
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
              }}
              disabled={isCancelling}
            >
              Keep Request
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
              }}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Ride"}
            </Button>
          </DialogActions>
        </Dialog>

        <Ridebook
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          ride={selectedRide}
          setAllMyRequests={setAllMyRequests}
          allMyRequests={allMyRequests}
          maxSeats={selectedRide?.availableSeats ?? Infinity}
          requestToEdit={selectedRequest}
        />
      </Box>
    </PageLayout>
  );
};

export default RequestRide;
