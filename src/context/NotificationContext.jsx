import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../Api";
import socket, { connectSocket } from "../socket";
import notificationSound from "../sounds/notifysound.wav";

const NotificationContext = createContext(null);

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getUserId = (user) => user?.id || user?._id || user?.userId || null;

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const p = token.split(".")[1];
    const b = p.replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(atob(b.padEnd(Math.ceil(b.length / 4) * 4, "=")));
    return d.id || d._id || d.userId || d.sub || null;
  } catch {
    return null;
  }
};

const getNotificationId = (item) =>
  String(
    item?._id ||
      item?.id ||
      item?.data?._id ||
      item?.data?.rideId ||
      item?.data?.requestId ||
      ""
  );

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function mergeNotifications(existing, incoming) {
  const byId = new Map();
  [...incoming, ...existing].forEach((item) => {
    const id = getNotificationId(item);
    if (id) {
      byId.set(id, { ...byId.get(id), ...item });
    } else {
      const synthetic = `_noid_${JSON.stringify(item).slice(0, 40)}_${Math.random()}`;
      byId.set(synthetic, { ...item, _syntheticId: synthetic });
    }
  });
  return [...byId.values()].sort(
    (a, b) =>
      new Date(b.createdAt || b.updatedAt || 0) -
      new Date(a.createdAt || a.updatedAt || 0)
  );
}

export function NotificationProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const userId = getUserId(user) || getUserIdFromToken();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  const handledRealtimeIds = useRef(new Set());
  const audioRef = useRef(null);

  /* ─── Sound ─── */
  useEffect(() => {
    try {
      audioRef.current = new Audio(notificationSound);
      audioRef.current.preload = "auto";
    } catch (error) {
      console.debug("[NOTIFICATIONS] Audio unavailable", error?.message);
    }
  }, []);

  /* ─── Fetch via HTTP ─── */
  const fetchNotifications = useCallback(async () => {
    const latestUser = getStoredUser();
    const id = getUserId(latestUser) || getUserIdFromToken() || userId;
    if (!id) {
      console.warn("⚠️ [NOTIFICATIONS] fetch — no userId, skipping");
      setNotifications([]);
      return [];
    }

    setLoading(true);
    setNotificationError(null);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const response = await axios.get(`${Api}/notification/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = normalizeList(response.data);
      setNotifications((previous) => mergeNotifications(previous, list));
      console.log("📥 [NOTIFICATIONS] fetched:", list.length, "items");
      return list;
    } catch (error) {
      setNotificationError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to load notifications"
      );
      console.error(
        "❌ [NOTIFICATIONS] fetch error:",
        error?.response?.data || error.message
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /* ─── Sound helper ─── */
  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, []);

  /* ─── Realtime handler ─── */
  const handleIncomingNotification = useCallback(
    (incoming) => {
      if (!incoming || typeof incoming !== "object") return;

      const id = getNotificationId(incoming);
      console.log("📨 [NOTIFICATIONS] SOCKET received:", incoming.type, "id =", id);

      if (id && handledRealtimeIds.current.has(id)) {
        console.log("⏭️ [NOTIFICATIONS] duplicate ignored:", id);
        return;
      }
      if (id) handledRealtimeIds.current.add(id);

      const enriched = {
        ...incoming,
        createdAt: incoming.createdAt || new Date().toISOString(),
      };

      setNotifications((previous) => mergeNotifications(previous, [enriched]));

      if (incoming?.isSilent !== true) {
        playNotificationSound();
        const message = incoming.message || incoming.title;
        if (message) {
          toast.info(message, { toastId: id || undefined, autoClose: 4500 });
        }
      }
    },
    [playNotificationSound]
  );

  /* ─── Re-sync on localStorage auth change ─── */
  useEffect(() => {
    const refreshStoredUser = () => setUser(getStoredUser());
    window.addEventListener("storage", refreshStoredUser);
    window.addEventListener("authChanged", refreshStoredUser);
    return () => {
      window.removeEventListener("storage", refreshStoredUser);
      window.removeEventListener("authChanged", refreshStoredUser);
    };
  }, []);

  /* ─── THE CRITICAL FIX: connect socket + subscribe ─── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ [NOTIFICATIONS] no token — cannot connect socket");
      return undefined;
    }

    console.log("🔌 [NOTIFICATIONS] connecting socket...");
    connectSocket();

    socket.on("notification", handleIncomingNotification);

    const onConnect = () => {
      console.log("🔗 [NOTIFICATIONS] socket connected, id =", socket.id);
      fetchNotifications();
    };
    socket.on("connect", onConnect);

    if (socket.connected) {
      console.log("🔗 [NOTIFICATIONS] already connected, fetching now");
      fetchNotifications();
    }

    return () => {
      socket.off("notification", handleIncomingNotification);
      socket.off("connect", onConnect);
    };
  }, [handleIncomingNotification, fetchNotifications]);

  /* ─── Mark read ─── */
  const markNotificationRead = useCallback(async (notification) => {
    const id = getNotificationId(notification);
    if (!id || notification?.isRead) return;

    setNotifications((previous) =>
      previous.map((item) =>
        getNotificationId(item) === id ? { ...item, isRead: true } : item
      )
    );
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      await axios.patch(
        `${Api}/notification/${id}`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
    } catch (error) {
      setNotifications((previous) =>
        previous.map((item) =>
          getNotificationId(item) === id ? { ...item, isRead: false } : item
        )
      );
      console.error(
        "❌ [NOTIFICATIONS] mark read error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  }, []);

  /* ─── Mark all read ─── */
  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) return;
    const unread = notifications.filter((item) => !item.isRead);
    if (!unread.length) return;

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, isRead: true }))
    );
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      await axios.patch(
        `${Api}/notification/read-all/${userId}`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
    } catch (error) {
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: false }))
      );
      console.error(
        "❌ [NOTIFICATIONS] mark all read error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  }, [notifications, userId]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => !item.isRead && item.type !== "ride_started"
      ).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      tabNotification: notifications,
      unreadCount,
      loading,
      notificationError,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      notificationError,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}