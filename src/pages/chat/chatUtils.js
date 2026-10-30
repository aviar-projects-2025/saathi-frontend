export const SAFFRON = "#FF9933";
export const API_BASE = (await import("../../Api")).default.replace(/\/+$/, "");

export const getToken = () => localStorage.getItem("token");

export const getCurrentUserId = () => {
  try {
    const t = getToken();
    if (!t) return null;

    const p = t.split(".")[1];
    if (!p) return null;

    const b = p.replace(/-/g, "+").replace(/_/g, "/");
    const d = JSON.parse(atob(b.padEnd(Math.ceil(b.length / 4) * 4, "=")));

    // Try every common JWT field name so we never miss it
    const id =
      d.id ||
      d._id ||
      d.userId ||
      d.user_id ||
      d.sub ||
      d.user?._id ||
      d.user?.id ||
      "";

    return String(id);
  } catch {
    return null;
  }
};

export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const extractSenderId = (raw) => {
  if (!raw) return "";
  if (typeof raw === "object") {
    return String(raw._id || raw.id || "");
  }
  return String(raw);
};

export const normalizeMessage = (msg, myId) => {
  const senderId = extractSenderId(msg?.senderId);
  const me = String(myId || "");

  return {
    id: String(msg?._id || msg?.id || ""),
    senderId,
    sender: senderId && me && senderId === me ? "me" : "other",
    text: msg?.text || "",
    time: msg?.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      : "",
    status: String(msg?.status || "SENT").toLowerCase(),
    createdAt: msg?.createdAt || null,
    deletedForEveryone:
      Boolean(msg?.deletedForEveryone) || Boolean(msg?.tombstone),
    deletedFor: Array.isArray(msg?.deletedFor)
      ? msg.deletedFor.map(String)
      : [],
    chatId: String(msg?.chatId?._id || msg?.chatId || ""),
  };
};

export const mergeMessages = (existing, incoming) => {
  const byId = new Map();
  [...existing, ...incoming].forEach((m) => {
    if (!m.id) return;
    const prev = byId.get(m.id);
    byId.set(m.id, prev ? { ...prev, ...m } : m);
  });
  return [...byId.values()].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );
};

export const isWithin15Min = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
};

export const formatListTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const getUserName = (u) =>
  `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || u?.name || "User";

export const getInitials = (u) =>
  `${u?.firstName?.[0] || u?.name?.[0] || ""}${u?.lastName?.[0] || ""}`
    .toUpperCase() || "U";