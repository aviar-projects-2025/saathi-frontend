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

const touchBtn = { minHeight: { xs: 44, sm: 42 }, fontSize: { xs: 14, sm: 15 } };
const wrapText = { overflowWrap: "anywhere", minWidth: 0 };

const TravelBuddyRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(location.state?.tab === "sent" ? "sent" : "received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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
      setError(err.response?.data?.message || "Could not load Travel Buddy requests.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (["sent", "received"].includes(location.state?.tab)) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const respondToRequest = async (request, action, contactConsent = false) => {
    const requestId = request?._id;
    if (!requestId || busyId) return;
    try {
      setBusyId(requestId);
      setError("");
      await axios.patch(
        `${Api}/travel-buddy/requests/${requestId}/respond`,
        { action, ...(action === "accept" ? { contactConsent } : {}) },
        { headers }
      );
      setConfirmRequest(null);
      await fetchRequests();
    } catch (err) {
      console.error("Failed to respond:", err);
      setError(err.response?.data?.message || `Failed to ${action} this request. Please try again.`);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (request, kind) => {
    const requestId = request?._id;
    if (!requestId || busyId) return;
    try {
      setBusyId(requestId);
      setError("");
      await axios.patch(`${Api}/travel-buddy/requests/${requestId}/cancel`, {}, { headers });
      setConfirmAction(null);
      await fetchRequests();
    } catch (err) {
      console.error(`Failed to ${kind} request:`, err);
      setError(err.response?.data?.message || `Failed to ${kind} this request. Please try again.`);
    } finally {
      setBusyId(null);
    }
  };

  const getUserName = (user) =>
    !user ? "Community member" : [user.firstName, user.lastName].filter(Boolean).join(" ") || "Community member";

  const getRoute = (trip) => {
    const flights = trip?.flights || [];
    if (!flights.length) return "Flight details unavailable";
    return [flights[0]?.fromCode, ...flights.map((flight) => flight?.toCode)].filter(Boolean).join(" → ");
  };

  const getFlightNumbers = (trip) =>
    trip?.flights?.map((flight) => flight.flightNumber).filter(Boolean).join(" · ") || "No flight numbers";

  const formatStatus = (status) => status ? status.replaceAll("_", " ") : "UNKNOWN";

  const activeItems = tab === "received" ? received : sent;
  const requestedId = location.state?.requestId;

  const sortedItems = [...activeItems].sort((a, b) =>
    a._id === requestedId ? -1 : b._id === requestedId ? 1 : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 720, md: 900 },
        mx: "auto",
        boxSizing: "border-box",
        overflowX: "hidden",
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        pt: { xs: 2, sm: 3, md: 4 },
        pb: {
          xs: "calc(24px + env(safe-area-inset-bottom, 0px))",
          sm: "calc(32px + env(safe-area-inset-bottom, 0px))",
        },
        pl: { xs: "max(16px, env(safe-area-inset-left, 0px))", sm: 3 },
        pr: { xs: "max(16px, env(safe-area-inset-right, 0px))", sm: 3 },
      }}
    >
      <Typography component="h1" sx={{ fontSize: { xs: 22, sm: 25, md: 27 }, fontWeight: 800, color: "#1B2A5C", lineHeight: 1.2 }}>
        Travel Buddy Requests
      </Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.5, mb: { xs: 2, sm: 3 }, fontSize: { xs: 13.5, sm: 15, md: 16 } }}>
        Review requests from community members and track your submitted requests.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(2, max-content)" }, gap: 1, mb: { xs: 2, sm: 3 } }}>
        <Button variant={tab === "received" ? "contained" : "outlined"} onClick={() => setTab("received")} sx={{ ...touchBtn, px: { sm: 3 } }}>
          Received ({received.length})
        </Button>
        <Button variant={tab === "sent" ? "contained" : "outlined"} onClick={() => setTab("sent")} sx={{ ...touchBtn, px: { sm: 3 } }}>
          Sent ({sent.length})
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: { xs: 13, sm: 14 }, ...wrapText }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 6, sm: 8 } }}>
          <CircularProgress />
        </Box>
      ) : sortedItems.length === 0 ? (
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
          <Typography sx={{ fontWeight: 700 }}>
            {tab === "received" ? "No incoming requests" : "You haven't sent any requests"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2, fontSize: { xs: 13.5, sm: 16 } }}>
            {tab === "received"
              ? "New requests to connect with your trip will appear here."
              : "Requests you submit to other travellers will appear here."}
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/travelBuddy")} sx={{ ...touchBtn, width: { xs: "100%", sm: "auto" } }}>
            Browse trips
          </Button>
        </Paper>
      ) : (
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          {sortedItems.map((request) => {
            const isPending = request.status === "PENDING";
            const isBusy = busyId === request._id;
            const otherUser = tab === "received" ? request.requesterId : request.recipientId;
            const submittedTrip = request.submittedTripId;
            const targetTrip = request.targetTripId;

            return (
              <Paper
                key={request._id}
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2.5 },
                  borderRadius: 3,
                  minWidth: 0,
                  borderColor: request._id === requestedId ? "#C2410C" : "#E4E0D8",
                  borderWidth: request._id === requestedId ? 2 : 1,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar src={otherUser?.profileImageUrl || undefined} sx={{ flexShrink: 0, width: { xs: 40, sm: 44 }, height: { xs: 40, sm: 44 } }}>
                    {getUserName(otherUser).charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, ...wrapText }}>
                      {getUserName(otherUser)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 14 }, ...wrapText }}>
                      {tab === "received" ? "Wants to connect with your trip" : "Your Travel Buddy request"}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={formatStatus(request.status)}
                    sx={{ flexShrink: 0, maxWidth: { xs: 110, sm: "none" }, fontSize: { xs: 11, sm: 12 } }}
                    color={request.status === "ACCEPTED" ? "success" : request.status === "REJECTED" ? "error" : "warning"}
                  />
                </Stack>

                <Stack spacing={1.5}>
                  {tab === "received" && (
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">Their submitted trip</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: { xs: 14.5, sm: 16 }, ...wrapText }}>
                        <FlightIcon sx={{ fontSize: 17, verticalAlign: "middle", mr: 0.5 }} />
                        {getRoute(submittedTrip)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 14 }, ...wrapText }}>
                        {getFlightNumbers(submittedTrip)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tab === "received" ? "Your original trip" : "Trip you requested to connect with"}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: { xs: 14.5, sm: 16 }, ...wrapText }}>
                      {getRoute(targetTrip)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12.5, sm: 14 }, ...wrapText }}>
                      {getFlightNumbers(targetTrip)}
                    </Typography>
                  </Box>
                </Stack>

                {tab === "received" && isPending && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button fullWidth variant="contained" disabled={Boolean(busyId)} onClick={() => setConfirmRequest(request)} sx={touchBtn}>
                      {isBusy ? <CircularProgress size={20} color="inherit" /> : "Approve"}
                    </Button>
                    <Button fullWidth variant="outlined" color="inherit" disabled={Boolean(busyId)} onClick={() => respondToRequest(request, "reject")} sx={touchBtn}>
                      Not Now
                    </Button>
                  </Stack>
                )}

                {tab === "sent" && isPending && (
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 13, sm: 14 } }}>
                      Waiting for the trip owner to respond.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={Boolean(busyId)}
                      onClick={() => setConfirmAction({ kind: "withdraw", request })}
                      sx={touchBtn}
                    >
                      Withdraw request
                    </Button>
                  </Stack>
                )}

                {request.status === "ACCEPTED" && (
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={Boolean(busyId)}
                    onClick={() => setConfirmAction({ kind: "cancel", request })}
                    sx={{ ...touchBtn, mt: 2 }}
                  >
                    Cancel match
                  </Button>
                )}

                {request.status === "ACCEPTED" && (
                  <Alert severity="success" sx={{ mt: 2, fontSize: { xs: 13, sm: 14 }, ...wrapText }}>
                    Request approved. Both trips are now matched. Contact details are available only if both members consented.
                  </Alert>
                )}
                {request.status === "REJECTED" && (
                  <Alert severity="info" sx={{ mt: 2, fontSize: { xs: 13, sm: 14 }, ...wrapText }}>
                    {request.publishOnReject
                      ? "This request was declined. Your submitted trip was set to public, as requested."
                      : "This request was declined. Your submitted trip remains private."}
                  </Alert>
                )}
                {request.status === "CANCELLED" && (
                  <Alert severity="warning" sx={{ mt: 2, fontSize: { xs: 13, sm: 14 }, ...wrapText }}>
                    This match has been cancelled. Both trips are back in the search pool.
                  </Alert>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      <Dialog
        open={Boolean(confirmRequest)}
        onClose={() => { if (!busyId) setConfirmRequest(null); }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "100%" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: { xs: 18, sm: 20 } }}>Approve Travel Buddy request?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: 14, sm: 16 } }}>
            If you approve this request, your registered contact details may be shared with this matched traveller so you can coordinate your journey. Your details will be available only after both members have consented and the request is approved.
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2, fontSize: { xs: 13, sm: 14 } }}>
            Only continue if you are comfortable sharing your contact details with this traveller.
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2, pt: 0, gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: "stretch",
            "& > :not(style) ~ :not(style)": { ml: 0 },
          }}
        >
          <Button onClick={() => setConfirmRequest(null)} disabled={Boolean(busyId)} color="inherit" sx={{ ...touchBtn, width: { xs: "100%", sm: "auto" } }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={Boolean(busyId)}
            onClick={() => { if (confirmRequest) respondToRequest(confirmRequest, "accept", true); }}
            sx={{ ...touchBtn, width: { xs: "100%", sm: "auto" } }}
          >
            {busyId === confirmRequest?._id ? <CircularProgress size={20} color="inherit" /> : "Agree & Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmAction)} onClose={() => !busyId && setConfirmAction(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {confirmAction?.kind === "withdraw" ? "Withdraw request?" : "Cancel match?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14 }}>
            {confirmAction?.kind === "withdraw"
              ? "Your request will be withdrawn. The trip owner's trip stays open for other requests."
              : "The match will be cancelled. Both trips will return to OPEN, and the other member will be notified. Your trip will re-enter the search pool immediately."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: { xs: "column-reverse", sm: "row" } }}>
          <Button onClick={() => setConfirmAction(null)} disabled={Boolean(busyId)} sx={{ width: { xs: "100%", sm: "auto" } }}>
            Keep
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={Boolean(busyId)}
            onClick={() => confirmAction && handleCancel(confirmAction.request, confirmAction.kind)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {confirmAction?.kind === "withdraw" ? "Withdraw request" : "Cancel match"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TravelBuddyRequests;