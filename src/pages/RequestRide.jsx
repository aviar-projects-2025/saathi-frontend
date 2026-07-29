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
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageLayout from "../components/PageLayout";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

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
    } finally {
      setDeleteLoading(false);
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
          // justifyContent: "center",
          // alignItems: "center",
          flexDirection: "column",
          // textAlign: "center",
          // px: 0.5,
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
              xs: "1rem",
              sm: "1.3rem",
            },
            fontWeight: 600,
          }}
        >
          My Request Rides
        </Typography>

        {/* <Typography variant="h5" sx={{ color: '#E8650A', fontWeight: 900, fontSize: { xs: "1.2rem", sm: "1.2rem", md: "1.35rem", lg: "1.5rem" } }}>
          My Request <span style={{ color: '#138808' }}>Rides</span>
        </Typography> */}

        <br />

        {loadingRequests ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
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
              mb: 2,
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
                        mb: 2,
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
                              gap: { xs: 1.25, sm: 1.5 },
                              p: { xs: 1, sm: 2 },
                              mb: 1,
                              cursor: "pointer",
                              // border: "1px solid #ece2d3",
                              borderRadius: 2,
                              bgcolor: "#fff",
                              transition: "border-color 0.15s ease, background-color 0.15s ease",
                              "&:hover": {
                                borderColor: "#e0b980",
                                bgcolor: "#FFFBF5",
                              },
                            }}
                          >
                            {/* Avatar */}
                            <Box sx={{ position: "relative", flexShrink: 0 }}>
                              <Avatar
                                sx={{
                                  bgcolor: "#f5ddc2",
                                  color: "#7a4a00",
                                  width: { xs: 36, sm: 40 },
                                  height: { xs: 36, sm: 40 },
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                                  fontSize: { xs: 12, sm: 14 },
                                  color: "#1976d2",
                                  bgcolor: "#fff",
                                  borderRadius: "50%",
                                }}
                              />
                            </Box>

                            {/* Name + route */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography fontWeight={700} sx={{ fontSize: { xs: 14, sm: 15 } }} noWrap>
                                {user.firstName} {user.lastName}
                              </Typography>
                              <Typography

                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: 12, sm: 14 },
                                  whiteSpace: { xs: "normal", sm: "nowrap" },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: { xs: "-webkit-box", sm: "block" },
                                  WebkitLineClamp: { xs: 2, sm: "unset" },
                                  WebkitBoxOrient: { xs: "vertical", sm: "unset" },
                                  lineHeight: 1.3,
                                  mt: 0.25,
                                }}
                              >
                                {request.rideId?.from} → {request.rideId?.destination}
                              </Typography>
                            </Box>

                            {/* Divider between content and value, only on sm+ */}
                            <Box
                              sx={{
                                display: { xs: "none", sm: "block" },
                                width: "1px",
                                alignSelf: "stretch",
                                bgcolor: "#ece2d3",
                                mx: 0.5,
                              }}
                            />

                            {/* Right side: date + status pill */}
                            <Box
                              sx={{
                                textAlign: "right",
                                flexShrink: 0,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 0.5,
                              }}
                            >
                              <Typography fontWeight={700} sx={{ fontSize: { xs: 12, sm: 14, md: 15 } }} noWrap>
                                {new Date(request.createdAt).toLocaleDateString()}
                              </Typography>
                              <Box
                                sx={{
                                  fontSize: { xs: 7, sm: 10 },
                                  fontWeight: 600,
                                  color: "#2e7d32",
                                  bgcolor: "#eaf5ea",
                                  border: "1px solid #cde8ce",
                                  borderRadius: 5,
                                  px: 0.9,
                                  py: 0.2,
                                  letterSpacing: 0.3,
                                  textTransform: "uppercase",
                                }}
                              >
                                completed
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box >
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
                          minHeight: { xs: "auto", sm: "200px", md: "220px" },
                          mb: { xs: 2.5, sm: 3, md: 4 },
                          borderRadius: { xs: "14px", sm: "18px", md: "20px" },
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
                            p: { xs: 2, sm: 3, md: 4 },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
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
                                }}
                              >
                                <LocationOnIcon
                                  sx={{ color: "#e2483d", fontSize: { xs: 15, sm: 17, md: 18 } }}
                                />
                                <Typography
                                  fontWeight={600}
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
                              }}
                            />

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
                                }}
                              >
                                <LocationOnIcon
                                  sx={{ color: "#e2483d", fontSize: { xs: 15, sm: 17, md: 18 } }}
                                />
                                <Typography
                                  fontWeight={600}
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
                              gap: { xs: 2, sm: 2.5, md: 3 },
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
                                  {new Date(request.createdAt).toLocaleDateString()}
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
                                  sx={{ color: "#FF9933", fontSize: { xs: 14, sm: 15, md: 16 } }}
                                />
                                <Typography
                                  fontWeight={600}
                                  sx={{ fontSize: { xs: 11.5, sm: 12.5, md: 13 } }}
                                >
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
                  })}

                  <Dialog
                    open={openCancelDialog}
                    onClose={(event, reason) => {
                      if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                      setOpenCancelDialog(false);
                    }}
                    fullWidth
                    maxWidth="xs"
                    PaperProps={{
                      sx: {
                        width: { xs: "95%", sm: "100%" },
                        m: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 2, sm: 3 },
                        p: { xs: 0.5, sm: 1 },
                      },
                    }}
                  >
                    <DialogTitle
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                        py: 2,
                      }}
                    >
                      <WarningAmberRoundedIcon
                        color="error"
                        sx={{ fontSize: { xs: 22, sm: 28 } }}
                      />
                      Cancel Ride Request?
                    </DialogTitle>

                    <DialogContent sx={{ pt: 0 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          color: "text.secondary",
                          lineHeight: 1.5,
                        }}
                      >
                        Are you sure you want to cancel this ride request?
                      </Typography>
                    </DialogContent>

                    <DialogActions
                      sx={{
                        px: { xs: 2, sm: 3 },
                        pb: { xs: 2, sm: 2.5 },
                        flexDirection: { xs: "column-reverse", sm: "row" },
                        gap: 1.3,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setOpenCancelDialog(false)}
                        disabled={deleteLoading}
                        sx={{
                          bgcolor: "grey.500",
                          color: "#fff",
                          fontSize: { xs: "0.8rem", sm: "0.85rem" },
                          fontWeight: 600,
                          textTransform: "none",
                          // py: 1,
                          "&:hover": {
                            bgcolor: "grey.700",
                          },
                        }}
                      >
                        No, Keep Request
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disabled={deleteLoading}
                        onClick={() => {
                          if (selectedRequest) {
                            handleDelete(selectedRequest._id);
                          }
                        }}
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.85rem" },
                          fontWeight: 600,
                          textTransform: "none",
                          // py: 1,
                        }}
                      >
                        {deleteLoading ? "Canceling Ride..." : "Yes, Cancel Ride"}
                      </Button>
                    </DialogActions>
                  </Dialog>

                </>
              );
            })()}
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
              bgcolor: "#F8FAFC", // Card Background Color
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
    </PageLayout >
  );
};

export default RequestRide;
