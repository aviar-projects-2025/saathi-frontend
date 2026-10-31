import React, { useState, useMemo, useCallback } from "react";
import PageLayout from "../components/PageLayout";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Typography,
  CircularProgress,
} from "@mui/material";
import moment from "moment";
import { useNotifications } from "../context/NotificationContext";
import { useReferral } from "../context/ReferralContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "./Avatar.jsx";
import ProtectedAvatar from "../components/ProtectedAvatar.jsx";
import Api from "../Api";

const Notifications = () => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [markingIds, setMarkingIds] = useState([]);

  const { tabNotification, fetchNotifications } = useNotifications();
  const { getPendingReferralCount } = useReferral();
  const navigate = useNavigate();

  /* ─── Deduplicate by stable id ─── */
  const uniqueNotifications = useMemo(() => {
    const map = new Map();
    (Array.isArray(tabNotification) ? tabNotification : []).forEach((item) => {
      const id = String(
        item?._id ||
          item?.id ||
          item?.data?._id ||
          item?.data?.rideId ||
          item?.data?.requestId ||
          ""
      );
      if (!id) return;
      map.set(id, item);
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  }, [tabNotification]);

  const getNotificationId = (item) =>
    String(
      item?._id ||
        item?.id ||
        item?.data?._id ||
        item?.data?.rideId ||
        item?.data?.requestId ||
        ""
    );

  const getRideId = (item) =>
    item?.data?.rideId?._id ||
    item?.data?.rideId ||
    item?.data?.ride?._id ||
    null;

  /* ─── Navigation ─── */
  const handleNavigation = useCallback(
    (item) => {
      const type = item?.type;
      const rideId = getRideId(item);

      switch (type) {
        case "new_request":
        case "ride_request_update":
        case "request_rejected":
        case "request_cancelled":
          navigate("/myride", {
            state: { tab: 2, ...(rideId ? { rideId } : {}) },
          });
          break;

        case "request_accepted":
          navigate("/request-ride", {
            state: { ...(rideId ? { rideId } : {}) },
          });
          break;

        case "ride_started":
        case "ride_completed":
          navigate("/myride", { state: { tab: 0 } });
          break;

        case "referral_pending":
        case "referral_rejected":
        case "referral_approved":
          navigate("/my-referalls");
          break;

        case "travel_buddy_request":
          navigate("/travelbuddy/requests", {
            state: { requestId: item?.data?.requestId, tab: "received" },
          });
          break;

        case "travel_buddy_request_accepted":
        case "travel_buddy_request_rejected":
          navigate("/travelbuddy/requests", {
            state: { requestId: item?.data?.requestId, tab: "sent" },
          });
          break;

        case "help_proposal_received":
        case "help_proposal_accepted":
        case "help_proposal_rejected":
        case "help_proposal_updated":
          navigate("/myride", {
            state: { tab: 2, ...(rideId ? { rideId } : {}) },
          });
          break;

        default:
          navigate("/");
      }
    },
    [navigate]
  );

  /* ─── Mark single notification as read ───
     NOTE: uses the same endpoint as NotificationTab → consistency.
     If your backend uses /notification/:id instead, swap the URL. */
  const handleIsRead = useCallback(
    async (id, item) => {
      if (!id || item?.isRead) return;
      if (markingIds.includes(id)) return;

      setMarkingIds((prev) => [...prev, id]);

      try {
        await axios.patch(
          `${Api}/notification/single/${encodeURIComponent(id)}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );

        await Promise.allSettled([
          Promise.resolve().then(() => fetchNotifications()),
          Promise.resolve().then(() => getPendingReferralCount()),
        ]);
      } catch (err) {
        console.error(
          "[Notifications] mark read failed:",
          err?.response?.data || err.message
        );
      } finally {
        setMarkingIds((prev) => prev.filter((x) => x !== id));
      }
    },
    [markingIds, fetchNotifications, getPendingReferralCount]
  );

  /* ─── Click handler ─── */
  const handleClick = async (item) => {
    const id = getNotificationId(item);
    handleNavigation(item);
    if (id) await handleIsRead(id, item);
  };

  return (
    <PageLayout>
      <List
        sx={{
          py: 0,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
        }}
      >
        {uniqueNotifications.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            No notifications
          </Typography>
        ) : (
          uniqueNotifications.map((item) => {
            const itemId = getNotificationId(item);
            const isUnread = !item?.isRead;
            const isMarking = markingIds.includes(itemId);

            const profile =
              item?.actorId && typeof item.actorId === "object"
                ? item.actorId
                : item?.data?.actor || item?.data?.profile;

            const firstName = profile?.firstName || "";
            const lastName = profile?.lastName || "";

            return (
              <React.Fragment key={itemId}>
                <ListItem
                  onClick={() => handleClick(item)}
                  alignItems="flex-start"
                  sx={{
                    borderRadius: 3,
                    marginBottom: 1,
                    bgcolor: isUnread ? "#e3f2fd" : "#f4f4f4ff",
                    transition: "0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: isUnread ? "#bbdefb" : "#f5f5f5",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <ProtectedAvatar
                      src={
                        profile?.profileImageUrl ||
                        item?.data?.profileImage ||
                        undefined
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        if (profile && typeof profile === "object") {
                          setSelectedProfile(profile);
                          setProfileModalOpen(true);
                        }
                      }}
                    >
                      {firstName?.[0]?.toUpperCase() || "U"}
                    </ProtectedAvatar>
                  </ListItemAvatar>

                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isUnread ? 700 : 500,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.title || item.category || "Notification"}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "gray",
                            fontSize: 11,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.createdAt
                            ? moment(item.createdAt).fromNow()
                            : ""}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 0.3 }}>
                        {(firstName || lastName) && (
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: isUnread ? 400 : 300,
                              fontSize: 11,
                            }}
                          >
                            {`${firstName} ${lastName}`.trim()}
                            {" — "}
                          </Typography>
                        )}
                        <Typography
                          component="span"
                          sx={{ fontSize: 11 }}
                        >
                          {item.message || "You have a new notification."}
                        </Typography>
                      </Box>
                    </Box>

                    {isMarking ? (
                      <CircularProgress
                        size={12}
                        sx={{ ml: 1, mt: 0.8, flexShrink: 0 }}
                      />
                    ) : (
                      isUnread && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "#1976d2",
                            ml: 1,
                            mt: 1,
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
    </PageLayout>
  );
};

export default Notifications;