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

const RequestRide = () => {
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

  // FIX: track the actual request object that was clicked, not a shared boolean.
  // This ensures exactly one modal renders, showing the correct ride's details.
  const [selectedRideDetails, setSelectedRideDetails] = useState(null);

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

  const handleDelete = async (requestId) => {
    setDeleteLoading(true);
    setOpenCancelDialog(false);
    setSelectedRequest(null);
    try {
      // Soft delete - update status to DELETED
      await axios.patch(
        `${Api}/bookride/${requestId}/status?type=Cancel`,
        {
          status: "DELETED",
          cancelledBy: user?.id,
          cancelledAt: new Date().toISOString()
        }
      );

      // Remove from local state (hide from list)
      setAllMyRequests((prev) =>
        prev.filter((request) => request._id !== requestId),
      );

      toast.success("Ride request deleted successfully", toasts);

      // Refresh data and notify MyRides
      await fetchAllSends();
      window.dispatchEvent(new CustomEvent('rideDataChanged', {
        detail: { action: 'deleted', requestId: requestId }
      }));
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
          cancelledAt: new Date().toISOString()
        }
      );

      // Remove from local state (hide from list)
      setAllMyRequests((prev) =>
        prev.filter((request) => request._id !== selectedRequest._id),
      );

      handleCloseDialog();
      await fetchAllSends();

      // Notify MyRides to update history
      window.dispatchEvent(new CustomEvent('rideDataChanged', {
        detail: { action: 'cancelled', requestId: selectedRequest._id }
      }));

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
              cancelledAt: new Date().toISOString()
            },
          );

          // Remove from local state (hide from list)
          setAllMyRequests((prev) =>
            prev.filter((request) => request._id !== selectedRequest._id),
          );

          handleCloseDialog();
          await fetchAllSends();

          // Notify MyRides to update history
          window.dispatchEvent(new CustomEvent('rideDataChanged', {
            detail: { action: 'cancelled', requestId: selectedRequest._id }
          }));

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

  // Filter: Only show ACTIVE requests (not deleted/cancelled/rejected)
  const activeRequests = allMyRequests.filter(
    (req) =>
      req?.rideId &&
      req.status !== "DELETED" &&
      req.status !== "CANCELLED" &&
      req.status !== "REJECTED"
  );

  return (
    <PageLayout>
      <Box>
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
      </Box>

      <Box
        sx={{
          minHeight: "65vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          // px: 2,
        }}
      >
        {activeRequests.length === 0 && (
          <DirectionsCarFilledOutlinedIcon
            sx={{
              fontSize: 55,
              color: "#bdbdbd",
              mb: 2,
            }}
          />
        )}

        {/* <br /> */}

        {loadingRequests ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : activeRequests.length === 0 ? (
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
            No active ride requests found.
          </Typography>
        ) : (
          <>
            {activeRequests.map((request) => {
              return (
                <Card
                  key={request._id}
                  sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    minHeight: { xs: "auto", sm: "200px", md: "220px" },
                    mb: { xs: 2, sm: 3, md: 4 },
                    borderRadius: { xs: "14px", sm: "18px", md: "20px" },
                    overflow: "hidden",
                    border: "1px solid #f0d9c0",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                    transition: "all .3s ease",
                    "&:hover": {
                      transform: { xs: "none", sm: "translateY(-5px)" },
                    },
                  }}
                  // FIX: store the clicked request itself instead of flipping a shared boolean
                  onClick={() => setSelectedRideDetails(request)}
                >
                  {/* Header bar */}
                  <Box
                    sx={{
                      bgcolor: "#1a1030",
                      px: { xs: 1.5, sm: 2.5, md: 3 },
                      py: { xs: 1.25, sm: 1.75, md: 2 },
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
                        fontSize: { xs: 12.5, sm: 14, md: 15 },
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: { xs: "55%", sm: "70%" },
                      }}
                    >
                      {request.rideId?.createdBy?.firstName}{" "}
                      {request.rideId?.createdBy?.lastName}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 0.5, sm: 1 },
                      }}
                    >
                      <Chip
                        label={request.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: "20px",
                          fontSize: { xs: 10, sm: 11.5, md: 13 },
                          height: { xs: 22, sm: 26, md: 28 },
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
                        sx={{
                          color: "#fff",
                          p: { xs: 0.5, sm: 0.75, md: 1 },
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      // p: { xs: 2, sm: 3, md: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        textAlign: "left",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: { xs: 1, sm: 1.5 },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: 10, sm: 10.5, md: 11 },
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
                            minWidth: 0,
                            mt: 1
                          }}
                        >
                          <LocationOnIcon
                            sx={{ color: "#e2483d", fontSize: { xs: 15, sm: 17, md: 18 } }}
                          />
                          <Typography fontWeight={600}
                            sx={{
                              fontSize: { xs: 12.5, sm: 14, md: 16 },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {request.rideId?.from}
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowForwardIcon
                        sx={{
                          color: "#FF9933",
                          fontSize: { xs: 16, sm: 20, md: 24 },
                          flexShrink: 0,
                        }} />
                      <Box sx={{ textAlign: "right", minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontSize: { xs: 10, sm: 10.5, md: 11 },
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
                            minWidth: 0,
                            mt: 1
                          }}
                        >
                          <LocationOnIcon
                            sx={{ color: "#e2483d", fontSize: { xs: 15, sm: 17, md: 18 } }}
                          />
                          <Typography fontWeight={600}
                            sx={{
                              fontSize: { xs: 12.5, sm: 14, md: 16 },
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {request.rideId?.destination}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ borderTop: "1px solid #f0e6d8", my: { xs: 1.5, sm: 2 } }} />
                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 3, sm: 3, md: 3 },
                        flexWrap: "nowrap",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{ fontSize: { xs: 10, sm: 10.5, md: 11 }, color: "text.secondary" }}
                        >
                          Date
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.7
                          }}
                        >
                          <CalendarMonthIcon
                            sx={{ color: "#FF9933", fontSize: { xs: 14, sm: 15, md: 16 } }}
                          />
                          <Typography
                            fontWeight={600}
                            sx={{ fontSize: { xs: 11.5, sm: 12.5, md: 13 } }}
                          >
                            {new Date(
                              request.createdAt,
                            ).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{ fontSize: { xs: 10, sm: 10.5, md: 11 }, color: "text.secondary" }}
                        >
                          Time
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 0.7
                          }}
                        >
                          <AccessTimeIcon
                            sx={{ color: "#FF9933", fontSize: { xs: 14, sm: 15, md: 16 } }} />
                          <Typography
                            fontWeight={600}
                            sx={{ fontSize: { xs: 11.5, sm: 12.5, md: 13 } }} >
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
                color: "#757575",
                border: "1px solid #E2D7C3"
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