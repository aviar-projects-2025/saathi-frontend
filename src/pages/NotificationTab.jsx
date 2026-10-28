import React, { useMemo, useState, useCallback } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { useNotifications } from "../context/NotificationContext";
import Api from "../Api";
import { useReferral } from "../context/ReferralContext";
import ProfileModal from "./Avatar.jsx";

export default function NotificationTab({
  handleCloseNotifications = () => {},
}) {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [markingIds, setMarkingIds] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);

  const {
    tabNotification,
    fetchNotifications,
  } = useNotifications();

  const { getPendingReferralCount } = useReferral();
  const navigate = useNavigate();

  /*
   * Deduplicate notifications by database ID.
   * Supports notification objects using either id or _id.
   */
  const uniqueNotifications = useMemo(() => {
    const notificationMap = new Map();

    (Array.isArray(tabNotification) ? tabNotification : []).forEach(
      (item) => {
        const id = item?._id || item?.id;

        if (id) {
          notificationMap.set(String(id), item);
        }
      }
    );

    return Array.from(notificationMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [tabNotification]);

  const getNotificationId = (item) =>
    item?._id || item?.id;

  /*
   * Safely extract the ride ID from different event payload shapes.
   */
  const getRideId = (item) =>
    item?.data?.rideId?._id ||
    item?.data?.rideId ||
    item?.data?.ride?._id ||
    item?.data?.requestId?.rideId?._id ||
    item?.data?.requestId?.rideId ||
    item?.rideId?._id ||
    item?.rideId ||
    null;

  /*
   * Navigate according to notification type.
   * Unknown event types fall back to the home page.
   */
  const handleNavigation = useCallback(
    (item) => {
      const type = item?.type;
      const rideId = getRideId(item);

      console.log("[NotificationTab] Opening notification:", {
        type,
        notificationId: getNotificationId(item),
        rideId,
        data: item?.data,
      });

      switch (type) {
        // Incoming booking requests and updates received by the ride owner.
        case "new_request":
        case "ride_request_update":
        case "request_rejected":
        case "request_cancelled":
          navigate("/myride", {
            state: {
              tab: 2,
              ...(rideId ? { rideId } : {}),
            },
          });
          break;

        // Accepted booking notifications for the passenger.
        case "request_accepted":
          navigate("/request-ride", {
            state: {
              ...(rideId ? { rideId } : {}),
            },
          });
          break;

        // Ride started/completed notifications.
        case "ride_started":
        case "ride_completed":
          navigate("/myride", {
            state: { tab: 0 },
          });
          break;

        // Help proposal events.
        case "help_proposal_received":
        case "help_proposal_created":
        case "help_proposal_pending":
        case "help_proposal_accepted":
        case "help_proposal_rejected":
        case "help_proposal_cancelled":
        case "help_proposal_updated":
        case "help_accepted":
        case "help_rejected":
        case "help_cancelled":
          navigate("/myride", {
            state: {
              tab: 2,
              ...(rideId ? { rideId } : {}),
              notificationType: type,
              helpProposalId:
                item?.data?.helpProposalId ||
                item?.data?.proposalId ||
                item?.data?.proposal?._id ||
                null,
            },
          });
          break;

        // Referral notifications.
        case "referral_approved":
          navigate("/my-referalls");
          break;

        case "referral_pending":
        case "referral_rejected":
          navigate("/my-referalls");
          break;
        
        // Travel Buddy: incoming request for the original trip owner
        case "travel_buddy_request":
          navigate("/travelbuddy/requests", {
            state: {
              requestId: item?.data?.requestId,
              tab: "received",
            },
          });
          break;

        // Travel Buddy: updates for the person who sent the request
        case "travel_buddy_request_accepted":
        case "travel_buddy_request_rejected":
          navigate("/travelbuddy/requests", {
            state: {
              requestId: item?.data?.requestId,
              tab: "sent",
            },
          });
          break;


        default:
          navigate("/");
          break;
      }
    },
    [navigate]
  );

  /*
   * Mark one notification as read.
   *
   * Important:
   * Use await so that the catch block catches rejected Axios requests.
   */
  const handleIsRead = useCallback(
    async (id, item) => {
      if (!id || item?.isRead) return;

      const normalizedId = String(id);

      if (markingIds.includes(normalizedId)) return;

      setMarkingIds((previous) => [...previous, normalizedId]);

      try {
        console.log("[NotificationTab] Marking notification as read:", id);

        await axios.patch(
          `${Api}/notification/single/${encodeURIComponent(id)}`
        );

        await Promise.allSettled([
          Promise.resolve().then(() => fetchNotifications()),
          Promise.resolve().then(() => getPendingReferralCount()),
        ]);

        console.log("[NotificationTab] Marked as read:", id);
      } catch (error) {
        console.error(
          "[NotificationTab] Failed to mark notification as read:",
          error?.response?.data || error.message
        );

        toast.error(
          error?.response?.data?.message ||
            "Unable to mark notification as read"
        );
      } finally {
        setMarkingIds((previous) =>
          previous.filter((currentId) => currentId !== normalizedId)
        );
      }
    },
    [markingIds, fetchNotifications, getPendingReferralCount]
  );

  /*
   * Mark all currently unread notifications as read.
   *
   * This uses the existing single-notification endpoint, so it does not
   * assume that a mark-all backend endpoint exists.
   */
  const handleMarkAllRead = async () => {
    const unreadNotifications = uniqueNotifications.filter(
      (item) => !item?.isRead
    );

    if (!unreadNotifications.length || markingAll) return;

    setMarkingAll(true);

    try {
      const results = await Promise.allSettled(
        unreadNotifications.map((item) => {
          const id = getNotificationId(item);

          if (!id) return Promise.resolve();

          return axios.patch(
            `${Api}/notification/single/${encodeURIComponent(id)}`
          );
        })
      );

      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;

      await Promise.allSettled([
        Promise.resolve().then(() => fetchNotifications()),
        Promise.resolve().then(() => getPendingReferralCount()),
      ]);

      if (failedCount) {
        toast.warning(
          `${failedCount} notification(s) could not be marked as read`
        );
      } else {
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error(
        "[NotificationTab] Mark-all error:",
        error?.response?.data || error.message
      );

      toast.error("Unable to mark notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (item) => {
    handleCloseNotifications();

    // Navigate immediately rather than waiting for the read API.
    handleNavigation(item);

    const id = getNotificationId(item);

    if (id) {
      await handleIsRead(id, item);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 360,
        maxHeight: 450,
        bgcolor: "background.paper",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Notification header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          Notifications
        </Typography>

        {uniqueNotifications.some((item) => !item?.isRead) && (
          <Tooltip title="Mark all as read">
            <span>
              <IconButton
                size="small"
                disabled={markingAll}
                onClick={handleMarkAllRead}
                aria-label="Mark all notifications as read"
              >
                {markingAll ? (
                  <CircularProgress size={18} />
                ) : (
                  <CheckBoxOutlineBlankIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>

      <List
        sx={{
          width: "100%",
          maxHeight: 400,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "background.paper",
          py: 0,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        {uniqueNotifications.length === 0 ? (
          <Typography
            sx={{
              p: 3,
              textAlign: "center",
              color: "text.secondary",
              fontSize: 13,
            }}
          >
            No notifications
          </Typography>
        ) : (
          uniqueNotifications.map((item) => {
            const itemId = getNotificationId(item);
            const isUnread = !item?.isRead;
            const isMarking = markingIds.includes(String(itemId));

            const profile =
              item?.actorId && typeof item.actorId === "object"
                ? item.actorId
                : item?.data?.actor || item?.data?.profile || item?.data;

            const firstName =
              profile?.firstName ||
              item?.requestedById?.firstName ||
              "";

            const lastName =
              profile?.lastName ||
              item?.requestedById?.lastName ||
              "";

            return (
              <React.Fragment key={String(itemId)}>
                <ListItem
                  onClick={() => handleNotificationClick(item)}
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: isUnread ? "#e3f2fd" : "transparent",
                    transition: "background-color 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: isUnread ? "#bbdefb" : "#f5f5f5",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={
                        profile?.profileImage ||
                        item?.data?.profileImage ||
                        undefined
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        if (profile && typeof profile === "object") {
                          setSelectedProfile(profile);
                          setProfileModalOpen(true);
                        }
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      {firstName?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  </ListItemAvatar>

                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      minWidth: 0,
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            minWidth: 0,
                            fontSize: 13,
                            fontWeight: isUnread ? 700 : 500,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {item?.title || item?.category || "Notification"}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: 10,
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {item?.createdAt
                            ? moment(item.createdAt).fromNow()
                            : ""}
                        </Typography>
                      </Box>

                      {(firstName || lastName) && (
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: isUnread ? 500 : 300,
                          }}
                        >
                          {`${firstName} ${lastName}`.trim()}
                          {" — "}
                        </Typography>
                      )}

                      <Typography
                        component="span"
                        sx={{
                          fontSize: 11,
                          fontWeight: isUnread ? 400 : 300,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item?.message || "You have a new notification."}
                      </Typography>
                    </Box>

                    {isMarking ? (
                      <CircularProgress
                        size={12}
                        sx={{ mt: 1, flexShrink: 0 }}
                      />
                    ) : (
                      isUnread && (
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            bgcolor: "#1976d2",
                            ml: 0.5,
                            mt: 0.8,
                            flexShrink: 0,
                          }}
                        />
                      )
                    )}
                  </Box>
                </ListItem>

                <Divider variant="inset" component="li" />
              </React.Fragment>
            );
          })
        )}
      </List>

      <ProfileModal
        open={profileModalOpen}
        selectedProfile={selectedProfile}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedProfile(null);
        }}
      />
    </Box>
  );
}