
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../Api";

const TravelBuddyRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(
    location.state?.tab === "sent" ? "sent" : "received"
  );
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const getItems = (response) => {
    const data = response?.data?.data ?? response?.data;
    return Array.isArray(data) ? data : [];
  };

  const fetchRequests = useCallback(async () => {
    if (!token) {
      setError("Please log in to view your requests.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [receivedRes, sentRes] = await Promise.all([
        axios.get(`${Api}/travel-buddy/requests/received`, { headers }),
        axios.get(`${Api}/travel-buddy/requests/sent`, { headers }),
      ]);

      setReceived(getItems(receivedRes));
      setSent(getItems(sentRes));
    } catch (err) {
      console.error("Failed to fetch Travel Buddy requests:", err);
      setError(
        err.response?.data?.message ||
          "Could not load Travel Buddy requests."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (["sent", "received"].includes(location.state?.tab)) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const respondToRequest = async (
    request,
    action,
    contactConsent = false
  ) => {
    const requestId = request?._id;

    if (!requestId || busyId) return;

    try {
      setBusyId(requestId);
      setError("");

      await axios.patch(
        `${Api}/travel-buddy/requests/${requestId}/respond`,
        {
          action,
          ...(action === "accept" ? { contactConsent } : {}),
        },
        { headers }
      );

      setConfirmRequest(null);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to respond to Travel Buddy request:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${action} this request. Please try again.`
      );
    } finally {
      setBusyId(null);
    }
  };

  const getUserName = (user) =>
    !user
      ? "Community member"
      : [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ") || "Community member";

  const getRoute = (trip) => {
    const flights = trip?.flights || [];

    if (!flights.length) return "Flight details unavailable";

    return [
      flights[0]?.fromCode,
      ...flights.map((flight) => flight?.toCode),
    ]
      .filter(Boolean)
      .join(" → ");
  };

  const getFlightNumbers = (trip) =>
    trip?.flights
      ?.map((flight) => flight.flightNumber)
      .filter(Boolean)
      .join(" · ") || "No flight numbers";

  const formatStatus = (status) =>
    status ? status.replaceAll("_", " ") : "UNKNOWN";

  const activeItems = tab === "received" ? received : sent;
  const requestedId = location.state?.requestId;

  const sortedItems = [...activeItems].sort((a, b) =>
    a._id === requestedId
      ? -1
      : b._id === requestedId
        ? 1
        : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: 3,
      }}
    >
      <Typography
        component="h1"
        sx={{ fontSize: 27, fontWeight: 800, color: "#1B2A5C" }}
      >
        Travel Buddy Requests
      </Typography>

      <Typography sx={{ color: "text.secondary", mt: 0.5, mb: 3 }}>
        Review requests from community members and track your submitted
        requests.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Button
          variant={tab === "received" ? "contained" : "outlined"}
          onClick={() => setTab("received")}
        >
          Received ({received.length})
        </Button>

        <Button
          variant={tab === "sent" ? "contained" : "outlined"}
          onClick={() => setTab("sent")}
        >
          Sent ({sent.length})
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sortedItems.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 700 }}>
            {tab === "received"
              ? "No incoming requests"
              : "You haven't sent any requests"}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1, mb: 2 }}
          >
            {tab === "received"
              ? "New requests to connect with your trip will appear here."
              : "Requests you submit to other travellers will appear here."}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate("/travelBuddy")}
          >
            Browse trips
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {sortedItems.map((request) => {
            const isPending = request.status === "PENDING";
            const isBusy = busyId === request._id;

            const otherUser =
              tab === "received"
                ? request.requesterId
                : request.recipientId;

            const submittedTrip = request.submittedTripId;
            const targetTrip = request.targetTripId;

            return (
              <Paper
                key={request._id}
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  borderColor:
                    request._id === requestedId
                      ? "#C2410C"
                      : "#E4E0D8",
                  borderWidth: request._id === requestedId ? 2 : 1,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Avatar src={otherUser?.profileImage || undefined}>
                    {getUserName(otherUser).charAt(0)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {getUserName(otherUser)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {tab === "received"
                        ? "Wants to connect with your trip"
                        : "Your Travel Buddy request"}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={formatStatus(request.status)}
                    color={
                      request.status === "ACCEPTED"
                        ? "success"
                        : request.status === "REJECTED"
                          ? "error"
                          : "warning"
                    }
                  />
                </Stack>

                <Stack spacing={1.5}>
                  {tab === "received" && (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Their submitted trip
                      </Typography>

                      <Typography sx={{ fontWeight: 700 }}>
                        <FlightIcon
                          sx={{
                            fontSize: 17,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {getRoute(submittedTrip)}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {getFlightNumbers(submittedTrip)}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {tab === "received"
                        ? "Your original trip"
                        : "Trip you requested to connect with"}
                    </Typography>

                    <Typography sx={{ fontWeight: 600 }}>
                      {getRoute(targetTrip)}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {getFlightNumbers(targetTrip)}
                    </Typography>
                  </Box>
                </Stack>

                {tab === "received" && isPending && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ mt: 2.5 }}
                  >
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={Boolean(busyId)}
                      onClick={() => setConfirmRequest(request)}
                    >
                      {isBusy ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Approve"
                      )}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      disabled={Boolean(busyId)}
                      onClick={() => respondToRequest(request, "reject")}
                    >
                      Not Now
                    </Button>
                  </Stack>
                )}

                {tab === "sent" && isPending && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                  >
                    Waiting for the trip owner to respond.
                  </Typography>
                )}

                {request.status === "ACCEPTED" && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Request approved. Both trips are now matched. Contact
                    details are available only if both members consented.
                  </Alert>
                )}

                {request.status === "REJECTED" && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {request.publishOnReject
                      ? "This request was declined. Your submitted trip was set to public, as requested."
                      : "This request was declined. Your submitted trip remains private."}
                  </Alert>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(confirmRequest)}
        onClose={() => {
          if (!busyId) setConfirmRequest(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Approve Travel Buddy request?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            If you approve this request, your registered contact details may
            be shared with this matched traveller so you can coordinate your
            journey. Your details will be available only after both members
            have consented and the request is approved.
          </DialogContentText>

          <Alert severity="info" sx={{ mt: 2 }}>
            Only continue if you are comfortable sharing your contact
            details with this traveller.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setConfirmRequest(null)}
            disabled={Boolean(busyId)}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={Boolean(busyId)}
            onClick={() => {
              if (confirmRequest) {
                respondToRequest(confirmRequest, "accept", true);
              }
            }}
          >
            {busyId === confirmRequest?._id ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Agree & Approve"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelBuddyRequests;
