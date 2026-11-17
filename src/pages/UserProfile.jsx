import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Alert, Avatar, Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, LinearProgress,
  Menu, MenuItem, Skeleton, Stack, Tab, Tabs, TextField, Typography,
  useMediaQuery, useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarIcon from "@mui/icons-material/Star";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PageLayout from "../components/PageLayout";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import { useUser } from "../context/userConetext";
import ProfileModal from "./Avatar.jsx";
import EditProfile from "./EditProfile.jsx";
import { useLocation } from "react-router-dom";
import ProtectedAvatar from "../components/ProtectedAvatar.jsx";

/* ---------- design tokens ---------- */
const C = {
  saffron: "#E8650A",
  saffronDark: "#C95406",
  tint: "#FDF0E6",
  band: "#F8E3D0",
  ink: "#1F1A17",
  body: "#3F3934",
  muted: "#7A7168",
  line: "#EDE5DC",
  paper: "#FFFFFF",
  canvas: "#FBF8F4",
  navy: "#123B5D",
};
const SERIF = "'Fraunces', 'Georgia', 'Times New Roman', serif";
const RADIUS = { card: "20px", control: "12px" };

/* ---------- small building blocks ---------- */
const Surface = ({ children, sx = {}, ...rest }) => (
  <Box
    {...rest}
    sx={{ bgcolor: C.paper, border: `1px solid ${C.line}`, borderRadius: RADIUS.card, ...sx }}
  >
    {children}
  </Box>
);

const SectionTitle = ({ title, count, action }) => (
  <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 2.5 }}>
    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.25 }}>
      <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: { xs: "1.25rem", sm: "1.4rem" }, color: C.ink }}>{title}</Typography>
      {count != null && <Typography sx={{ color: C.muted, fontSize: "0.9rem" }}>{count}</Typography>}
    </Stack>
    {action}
  </Stack>
);

const EmptyState = ({ title, hint }) => (
  <Box sx={{ py: 7, px: 2, textAlign: "center" }}>
    <Typography sx={{ fontFamily: SERIF, fontSize: "1.1rem", color: C.ink }}>{title}</Typography>
    {hint && <Typography sx={{ color: C.muted, fontSize: "0.88rem", mt: 0.75, maxWidth: 360, mx: "auto" }}>{hint}</Typography>}
  </Box>
);

const Stat = ({ value, label }) => (
  <Box sx={{
    minWidth: 0, px: { xs: 1, sm: 3 },
    "&:first-of-type": { pl: 0 },
    "&:not(:first-of-type)": { borderLeft: `1px solid ${C.line}` },
  }}>
    <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: { xs: "1.4rem", sm: "1.85rem" }, lineHeight: 1.1, color: C.navy }}>{value}</Typography>
    <Typography sx={{ color: C.muted, fontSize: { xs: "0.72rem", sm: "0.8rem" }, mt: 0.75, lineHeight: 1.35 }}>{label}</Typography>
  </Box>
);

const Fact = ({ label, value }) => (
  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", gap: 2, py: 1.25 }}>
    <Typography sx={{ color: C.muted, fontSize: "0.85rem" }}>{label}</Typography>
    <Typography sx={{ color: C.ink, fontSize: "0.9rem", fontWeight: 600, textAlign: "right", overflowWrap: "anywhere" }}>{value}</Typography>
  </Stack>
);

/* ---------- helpers ---------- */
const initials = (user) => `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}` || "S";
const displayNameOf = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "Saathi member";
const unwrap = (response) => response?.data?.data?.user || response?.data?.data || response?.data?.user || response?.data || null;
const toArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const idOf = (value) => String(value?._id || value?.id || value || "");
const isCompleted = (ride) => String(ride?.travelStatus || ride?.status || "").toLowerCase() === "completed";
const placeLabel = (value) => typeof value === "object" ? value?.address || value?.name || "—" : value;
const routeParts = (ride) => {
  const item = ride?.rideId && typeof ride.rideId === "object" ? ride.rideId : ride;
  return [
    placeLabel(item?.from || item?.origin || item?.startLocation || "Origin"),
    placeLabel(item?.destination || item?.to || item?.endLocation || "Destination"),
  ];
};

/* Resolve the displayable image URL — prefer the signed URL if present. */
const resolvePostImage = (post) => {
  if (!post) return "";
  const url = post.postImageUrl;
  if (url) return Array.isArray(url) ? url[0] || "" : url;
  const raw = post.postImage;
  if (!raw) return "";
  return Array.isArray(raw) ? raw[0] || "" : raw;
};

/* ---------- ★ Post detail modal ---------- */
function PostDetailDialog({
  post,
  open,
  onClose,
  isOwner,
  isSaved,
  savingPostId,
  onToggleSave,
  onEdit,
  onDelete,
}) {
  if (!post) return null;
  const image = resolvePostImage(post);
  const created = post.createdAt ? new Date(post.createdAt) : null;
  const createdLabel = created && !isNaN(created.getTime())
    ? created.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";
  const ownerName =
    post.createdBy && typeof post.createdBy === "object"
      ? displayNameOf(post.createdBy)
      : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // Disable scroll-lock on the body to avoid layout shift; keep the close
      // behaviour intact. This also prevents the modal from being unexpectedly
      // hidden if a parent has odd overflow.
      disableScrollLock
      // Force the modal to render as a direct child of <body>, ignoring any
      // transformed ancestors (which would otherwise break fixed positioning).
      // MUI Dialog portals to document.body by default, but this is explicit.
      slotProps={{
        root: {
          sx: { zIndex: (theme) => theme.zIndex.modal + 10 },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 2, sm: RADIUS.card },
          overflow: "hidden",
          bgcolor: C.paper,
          m: { xs: 1.5, sm: 3 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: SERIF,
          fontWeight: 600,
          pb: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: { xs: "1.05rem", sm: "1.2rem" }, color: C.ink }}>
            Community post
          </Typography>
          {ownerName && (
            <Typography sx={{ fontSize: "0.78rem", color: C.muted, mt: 0.25 }}>
              by {ownerName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Close" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: C.canvas }}>
        {image ? (
          <Box
            component="img"
            src={image}
            alt={post.description || "Community post"}
            sx={{
              display: "block",
              width: "100%",
              maxHeight: "60vh",
              objectFit: "contain",
              bgcolor: "#ffff",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16 / 10",
              bgcolor: C.tint,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.muted,
              fontSize: "0.85rem",
            }}
          >
            No image
          </Box>
        )}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {post.description && (
            <Typography
              sx={{
                color: C.body,
                fontSize: { xs: "0.92rem", sm: "0.98rem" },
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {post.description}
            </Typography>
          )}
          {createdLabel && (
            <Typography sx={{ mt: 1.5, fontSize: "0.75rem", color: C.muted }}>
              Posted {createdLabel}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "space-between",
          borderTop: `1px solid ${C.line}`,
        }}
      >
        <Button
          variant="outlined"
          startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          onClick={() => onToggleSave?.(post)}
          disabled={savingPostId === post._id}
          sx={{
            textTransform: "none",
            borderRadius: "999px",
            fontWeight: 650,
            color: isSaved ? C.saffron : C.ink,
            borderColor: isSaved ? C.saffron : C.line,
            "&:hover": { borderColor: C.saffron, bgcolor: C.tint },
          }}
        >
          {savingPostId === post._id
            ? "Working..."
            : isSaved
              ? "Unsave post"
              : "Save post"}
        </Button>

        {isOwner && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              onClick={() => onEdit?.(post)}
              sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 650, color: C.ink, borderColor: C.line, "&:hover": { borderColor: C.saffron } }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => onDelete?.(post)}
              sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 650, color: "#B91C1C", borderColor: "#B91C1C", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#991B1B" } }}
            >
              Delete
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}

const UserProfile = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const toasts = ToastConfig();
  const { currentUser, completion, getuserData } = useUser();

  const storedUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, []);
  const userId = idOf(currentUser?._id || currentUser?.id || storedUser?.id || storedUser?._id);

  const authConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  }), []);

  const [profile, setProfile] = useState(currentUser || null);
  const [inviter, setInviter] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [referralCounts, setReferralCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [offeredRides, setOfferedRides] = useState([]);
  const [takenRides, setTakenRides] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [tab, setTab] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(Boolean(location.state?.openEditProfile));
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postMenuAnchor, setPostMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [deletePostOpen, setDeletePostOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [postSaving, setPostSaving] = useState(false);
  const [postDeleting, setPostDeleting] = useState(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const fetchingRef = useRef(false);

  // ★ Post detail modal state
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [postDetailPost, setPostDetailPost] = useState(null);
  const [postDetailSource, setPostDetailSource] = useState("posts"); // "posts" | "saved"

  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [savedTotal, setSavedTotal] = useState(0);
  const [savingPostId, setSavingPostId] = useState(null);
  const [savedMenuAnchor, setSavedMenuAnchor] = useState(null);
  const [savedMenuPost, setSavedMenuPost] = useState(null);
  const savedObserverRef = useRef(null);
  const savedLoadMoreRef = useRef(null);
  const savedFetchingRef = useRef(false);

  /* ---------- data loading ---------- */
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError("");

    const [
      userResult,
      ridesGivenResult,
      ridesTakenResult,
      referralsResult,
    ] = await Promise.allSettled([
      axios.get(`${Api}/users/${userId}`, authConfig()),
      axios.get(`${Api}/rides/get`, {
        ...authConfig(),
        params: { type: "my", category: "posts", page: 1, limit: 100 },
      }),
      axios.get(`${Api}/bookride/send/${userId}`, authConfig()),
      axios.get(`${Api}/users/${userId}/referrals`, authConfig()),
    ]);

    if (cancelled) return;

    let fetchedProfile = currentUser || null;
    if (userResult.status === "fulfilled") {
      fetchedProfile = unwrap(userResult.value) || fetchedProfile;
      setProfile(fetchedProfile);
    } else {
      if (userResult.reason?.response?.status === 404) {
        setProfileError("This profile could not be found.");
      } else {
        setProfileError(userResult.reason?.response?.data?.message || "Some profile details could not be loaded.");
      }
    }

    const referrer = fetchedProfile?.referredBy;
    if (referrer && typeof referrer === "object" && (referrer.firstName || referrer.lastName)) {
      setInviter(referrer);
    } else if (referrer && typeof referrer === "string") {
      try {
        const referrerResponse = await axios.get(`${Api}/users/${idOf(referrer)}`, authConfig());
        if (!cancelled) setInviter(unwrap(referrerResponse));
      } catch {
        if (!cancelled) setInviter(null);
      }
    } else {
      setInviter(null);
    }

    if (ridesGivenResult.status === "fulfilled") {
      const payload = ridesGivenResult.value?.data;
      const ridesList = toArray(payload?.data ?? payload?.rides ?? payload);
      setOfferedRides(ridesList.filter((ride) => isCompleted(ride)));
    } else {
      setOfferedRides([]);
    }

    if (ridesTakenResult.status === "fulfilled") {
      const requests = toArray(ridesTakenResult.value?.data?.data ?? ridesTakenResult.value?.data);
      setTakenRides(
        requests.filter((request) => {
          if (String(request?.status || "").toUpperCase() !== "ACCEPTED") return false;
          const ride = request?.rideId;
          if (!ride || typeof ride !== "object") return false;
          if (!isCompleted(ride)) return false;
          if (String(ride?.createdBy?._id || ride?.createdBy || "") === String(userId)) return false;
          return true;
        })
      );
    } else {
      setTakenRides([]);
    }

    if (referralsResult.status === "fulfilled") {
      const body = referralsResult.value?.data?.data ?? referralsResult.value?.data;
      const all = Array.isArray(body) ? body : [...(body?.pending || []), ...(body?.approved || []), ...(body?.rejected || [])];
      setReferrals(all);
      const counts = body?.counts || {};
      setReferralCounts({
        pending: Number(counts.pending ?? body?.pending?.length ?? 0),
        approved: Number(counts.approved ?? body?.approved?.length ?? 0),
        rejected: Number(counts.rejected ?? body?.rejected?.length ?? 0),
        total: Number(counts.total ?? all.length),
      });
    } else {
      setReferrals([]);
      setReferralCounts({ pending: 0, approved: 0, rejected: 0, total: 0 });
    }

    setProfileLoading(false);
    return () => { cancelled = true; };
  }, [userId, currentUser, authConfig]);

  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  /* ---------- reviews ---------- */
  const loadReviews = useCallback(async () => {
    if (!userId) return;
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const res = await axios.get(`${Api}/reviews/user/${userId}`, authConfig());
      const body = res?.data || {};
      const list = Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : [];
      setReviews(list.filter((r) => !r.autoRated));
    } catch (err) {
      if (err?.response?.status !== 404) {
        setReviewsError(err?.response?.data?.message || "Could not load reviews");
      }
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [userId, authConfig]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* ---------- posts ---------- */
  const loadPosts = useCallback(async (page = 1) => {
    if (!userId) return;
    if (page === 1) setPostsLoading(true); else setPostsLoadingMore(true);
    try {
      const response = await axios.get(`${Api}/post-images/profile/${userId}?page=${page}&limit=12`, authConfig());
      const body = response?.data || {};
      const items = toArray(body?.data);
      const pagination = body?.pagination || {};
      setPosts((previous) => page === 1 ? items : [...previous, ...items.filter((post) => !previous.some((old) => old._id === post._id))]);
      setPostPage(page);
      setHasMorePosts(Boolean(pagination.hasMore));
      setTotalPosts(Number(pagination.totalCount ?? items.length));
    } catch {
      if (page === 1) setPosts([]);
    } finally {
      setPostsLoading(false);
      setPostsLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [userId, authConfig]);

  useEffect(() => {
    setPosts([]);
    setPostPage(1);
    setHasMorePosts(false);
    loadPosts(1);
  }, [loadPosts]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMorePosts || postsLoading || postsLoadingMore) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !fetchingRef.current && hasMorePosts) {
        fetchingRef.current = true;
        loadPosts(postPage + 1);
      }
    }, { rootMargin: "200px" });
    observerRef.current.observe(node);
    return () => observerRef.current?.disconnect();
  }, [hasMorePosts, postsLoading, postsLoadingMore, postPage, loadPosts]);

  /* ---------- saved posts ---------- */
  const loadSavedPosts = useCallback(async (page = 1) => {
    if (!userId) return;
    if (page === 1) setSavedLoading(true);
    try {
      const response = await axios.get(
        `${Api}/save-post/${userId}?page=${page}&limit=12`,
        authConfig()
      );
      const body = response?.data || {};
      const items = Array.isArray(body.savedPosts) ? body.savedPosts : [];
      setSavedPosts((previous) =>
        page === 1
          ? items
          : [...previous, ...items.filter((post) => !previous.some((old) => old._id === post._id))]
      );
      setSavedPage(page);
      setSavedHasMore(Boolean(body.hasMore));
      setSavedTotal(Number(body.totalCount ?? items.length));
      setSavedError("");
    } catch (err) {
      setSavedError(err?.response?.data?.message || "Could not load saved posts.");
      if (page === 1) setSavedPosts([]);
    } finally {
      setSavedLoading(false);
      savedFetchingRef.current = false;
    }
  }, [userId, authConfig]);

  useEffect(() => {
    if (tab === 4) {
      setSavedPosts([]);
      setSavedPage(1);
      setSavedHasMore(false);
      loadSavedPosts(1);
    }
  }, [tab, loadSavedPosts]);

  useEffect(() => {
    const node = savedLoadMoreRef.current;
    if (!node || !savedHasMore || savedLoading) return;
    savedObserverRef.current?.disconnect();
    savedObserverRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !savedFetchingRef.current && savedHasMore) {
        savedFetchingRef.current = true;
        loadSavedPosts(savedPage + 1);
      }
    }, { rootMargin: "200px" });
    savedObserverRef.current.observe(node);
    return () => savedObserverRef.current?.disconnect();
  }, [savedHasMore, savedLoading, savedPage, loadSavedPosts]);

  /* ---------- toggle save ---------- */
  const isPostSaved = useCallback(
    (postId) =>
      savedPosts.some((post) => String(post._id) === String(postId)),
    [savedPosts]
  );

  const toggleSavePost = useCallback(
    async (post) => {
      const postId = post?._id;
      if (!postId || !userId) return;
      if (savingPostId === postId) return;
      setSavingPostId(postId);

      const alreadySaved = isPostSaved(postId);

      try {
        if (alreadySaved) {
          await axios.delete(`${Api}/save-post/${postId}/${userId}`, authConfig());
          setSavedPosts((prev) => prev.filter((item) => String(item._id) !== String(postId)));
          setSavedTotal((prev) => Math.max(0, prev - 1));
          toast.success("Removed from saved", toasts);
        } else {
          await axios.post(`${Api}/save-post/${postId}/${userId}`, {}, authConfig());
          setSavedPosts((prev) => {
            if (prev.some((item) => String(item._id) === String(postId))) return prev;
            return [{ ...post, isSaved: true, savedAt: new Date().toISOString() }, ...prev];
          });
          setSavedTotal((prev) => prev + 1);
          toast.success("Post saved", toasts);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not update save", toasts);
      } finally {
        setSavingPostId(null);
      }
    },
    [Api, userId, authConfig, isPostSaved, savingPostId, toasts]
  );

  /* ---------- derived ---------- */
  const completedRideItems = useMemo(() => {
    const given = offeredRides.map((ride) => ({ ...ride, _kind: "Ride given" }));
    const taken = takenRides
      .map((request) => {
        const ride = request?.rideId && typeof request.rideId === "object" ? request.rideId : null;
        if (!ride) return null;
        return { ...ride, _kind: "Ride taken", _requestId: request._id || request.id };
      })
      .filter(Boolean);
    const combined = [...given, ...taken];
    const seen = new Set();
    return combined.filter((ride) => {
      const id = idOf(ride?._id || ride?.id);
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [offeredRides, takenRides]);

  const profileCompletion = Math.max(0, Math.min(100, Number(completion ?? profile?.profileCompletion ?? 0) || 0));

  const averageRating = useMemo(() => {
    if (!reviews.length) return profile?.averageRating ?? profile?.rating ?? null;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
  }, [reviews, profile]);

  const ratingCount = reviews.length;
  const routeAlerts = Array.isArray(profile?.routeAlerts) ? profile.routeAlerts : [];
  const languageValue = profile?.languages ?? profile?.language ?? profile?.preferredLanguages;
  const languages = Array.isArray(languageValue) ? languageValue.join(", ") : languageValue || "Not added";
  const city = profile?.city || profile?.location?.city || "Location not added";

  const memberDate = profile?.createdAt || profile?.created_at || profile?.joinedAt;
  let memberSince = "—";
  if (memberDate) {
    const d = new Date(memberDate);
    if (!isNaN(d.getTime())) {
      memberSince = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    }
  }
  if (memberSince === "—" && profile?._id) {
    try {
      const ts = parseInt(String(profile._id).substring(0, 8), 16) * 1000;
      if (!isNaN(ts)) {
        memberSince = new Date(ts).toLocaleDateString(undefined, { month: "short", year: "numeric" });
      }
    } catch { }
  }

  const name = displayNameOf(profile || currentUser);
  const inviterName = inviter ? displayNameOf(inviter) : (profile?.referredBy ? "Details unavailable" : "Not recorded");
  const phoneVerified = Boolean(profile?.isPhoneVerified ?? profile?.phoneVerified ?? profile?.isVerified);
  const admin = ["admin", "superadmin", "super_admin"].includes(String(profile?.role || "").toLowerCase());
  const reportsCount = Number(profile?.reportsAgainstCount ?? profile?.reportCount ?? 0) || 0;
  const foundingMember = Boolean(profile?.isFoundingMember);

  const ridesGiven = offeredRides.length;
  const ridesTaken = takenRides.length;

  /* ---------- post actions ---------- */
  const openPostMenu = (event, post) => { setPostMenuAnchor(event.currentTarget); setSelectedPost(post); };
  const closePostMenu = () => setPostMenuAnchor(null);
  const startEditPost = () => {
    if (!selectedPost) return;
    setEditDescription(selectedPost.description || "");
    const image = resolvePostImage(selectedPost);
    setEditPreview(image);
    setEditFile(null);
    setEditPostOpen(true);
    closePostMenu();
    setPostDetailOpen(false);
  };
  const startDeletePost = () => { setDeletePostOpen(true); closePostMenu(); setPostDetailOpen(false); };
  const onEditFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };
  const savePostEdits = async () => {
    if (!selectedPost?._id) return;
    setPostSaving(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("description", editDescription);
      if (editFile) formData.append("postImage", editFile);
      const response = await axios.put(`${Api}/community/${selectedPost._id}`, formData, {
        ...authConfig(), headers: { ...authConfig().headers, "Content-Type": "multipart/form-data" },
      });
      const updated = response?.data?.data || {};
      setPosts((old) => old.map((post) => post._id === selectedPost._id ? { ...post, ...updated, description: updated.description ?? editDescription, postImage: updated.postImage ?? (editFile ? editPreview : post.postImage) } : post));
      setSavedPosts((old) => old.map((post) => post._id === selectedPost._id ? { ...post, ...updated } : post));
      setPostDetailPost((prev) => (prev && prev._id === selectedPost._id ? { ...prev, ...updated } : prev));
      toast.success(response?.data?.message || "Post updated", toasts);
      setEditPostOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update post", toasts);
    } finally { setPostSaving(false); }
  };
  const deletePost = async () => {
    if (!selectedPost?._id) return;
    setPostDeleting(true);
    try {
      const response = await axios.delete(`${Api}/community/${selectedPost._id}`, { ...authConfig(), data: { userId } });
      setPosts((old) => old.filter((post) => post._id !== selectedPost._id));
      setSavedPosts((old) => old.filter((post) => post._id !== selectedPost._id));
      setTotalPosts((count) => Math.max(0, count - 1));
      setSavedTotal((count) => Math.max(0, count - 1));
      toast.success(response?.data?.message || "Post deleted", toasts);
      setDeletePostOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete post", toasts);
    } finally { setPostDeleting(false); }
  };

  /* ---------- open post detail ---------- */
  const openPostDetail = (post, source = "posts") => {
    if (!post || !post._id) return;
    // Close any other top-level modals/menus so MUI doesn't silently drop the
    // new Dialog (MUI refuses to stack two Dialog modals in some cases).
    setEditProfileOpen(false);
    setProfileModalOpen(false);
    setPostMenuAnchor(null);
    setSavedMenuAnchor(null);
    setPostDetailPost(post);
    setPostDetailSource(source);
    setPostDetailOpen(true);
  };
  const closePostDetail = () => {
    setPostDetailOpen(false);
    setTimeout(() => setPostDetailPost(null), 200);
  };

  /* ---------- tab panels ---------- */
  const renderAbout = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="About" />
      <Typography sx={{ lineHeight: 1.85, color: C.body, whiteSpace: "pre-wrap", fontSize: "0.98rem", maxWidth: 640 }}>
        {profile?.bio || profile?.about || profile?.description || "Tell the community a little about yourself — where you travel, and what makes you a good travel companion."}
      </Typography>
      <Divider sx={{ my: 3, borderColor: C.line }} />
      <Box>
        {[
          ["City", city],
          ["Languages", languages],
          ["Member since", memberSince],
          ...(profile?.gender || profile?.genderPreference ? [["Gender preference", profile.gender || profile.genderPreference]] : []),
        ].map(([label, value], i, arr) => (
          <Box key={label} sx={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none" }}>
            <Fact label={label} value={value} />
          </Box>
        ))}
      </Box>
    </Surface>
  );

  const renderReviews = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="Reviews" count={ratingCount} />
      {reviewsLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((n) => (
            <Stack key={n} direction="row" spacing={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="90%" height={18} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" width="60%" height={18} />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : reviewsError ? (
        <Alert severity="warning" sx={{ borderRadius: RADIUS.control }}>{reviewsError}</Alert>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews yet" hint="Reviews from riders and drivers will appear here after your first completed ride." />
      ) : (
        reviews.map((review, index) => {
          const author = review.reviewerId || review.reviewer || {};
          const authorName = displayNameOf(author) || review.reviewerName || "Community member";
          const authorAvatar = author?.profileImageUrl || author?.profileImage || "";
          const tags = Array.isArray(review.tags) ? review.tags : [];
          const ratingValue = Number(review.rating) || 0;
          const reviewDate = review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";

          return (
            <Box key={review._id || review.id || index}>
              <Stack direction="row" sx={{ py: 2.5, gap: 2 }}>
                <ProtectedAvatar src={authorAvatar} sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: C.tint, color: C.saffron, fontWeight: 700, fontSize: "0.9rem" }}>
                  {initials(author)}
                </ProtectedAvatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, flexWrap: "wrap" }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 650, fontSize: "0.92rem", color: C.ink }}>{authorName}</Typography>
                      {reviewDate && <Typography sx={{ fontSize: "0.75rem", color: C.muted, mt: 0.25 }}>{reviewDate}</Typography>}
                    </Box>
                    {ratingValue > 0 && (
                      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <StarIcon sx={{ fontSize: 16, color: C.saffron }} />
                        <Typography sx={{ fontFamily: SERIF, fontWeight: 600, color: C.ink, fontSize: "0.95rem" }}>{ratingValue}/5</Typography>
                      </Stack>
                    )}
                  </Stack>
                  {tags.length > 0 && (
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, flexWrap: "wrap", gap: 0.75 }}>
                      {tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ bgcolor: C.canvas, color: C.body, fontSize: "0.72rem", height: 22, borderRadius: "6px", fontWeight: 500 }} />
                      ))}
                    </Stack>
                  )}
                  {review.comment && (
                    <Typography sx={{ mt: 1.25, color: C.body, lineHeight: 1.7, fontSize: "0.92rem" }}>{review.comment}</Typography>
                  )}
                </Box>
              </Stack>
              {index < reviews.length - 1 && <Divider sx={{ borderColor: C.line }} />}
            </Box>
          );
        })
      )}
    </Surface>
  );

  const renderRides = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="Completed rides" count={completedRideItems.length} />
      {profileLoading ? (
        <Stack spacing={1.5}>{[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={64} sx={{ borderRadius: RADIUS.control }} />)}</Stack>
      ) : completedRideItems.length ? (
        <Box>
          {completedRideItems.map((ride, index) => {
            const [from, to] = routeParts(ride);
            const date = ride.startTime || ride.rideId?.startTime;
            return (
              <Box key={ride._id || ride.id || ride._requestId || index}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 2, gap: 2 }}>
                  <Stack sx={{ alignItems: "center", width: 14, flexShrink: 0, alignSelf: "stretch", py: 0.5 }}>
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", border: `2px solid ${C.saffron}` }} />
                    <Box sx={{ flex: 1, width: "1.5px", bgcolor: C.line, my: 0.25 }} />
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: C.saffron }} />
                  </Stack>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 600, color: C.ink }}>{from}</Typography>
                    <Typography noWrap sx={{ fontSize: "0.92rem", fontWeight: 600, color: C.ink, mt: 0.5 }}>{to}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: ride._kind === "Ride given" ? C.saffron : C.navy }}>
                      {ride._kind || "Completed"}
                    </Typography>
                    {date && <Typography sx={{ fontSize: "0.78rem", color: C.muted, mt: 0.25 }}>{new Date(date).toLocaleDateString()}</Typography>}
                  </Box>
                </Stack>
                {index < completedRideItems.length - 1 && <Divider sx={{ borderColor: C.line }} />}
              </Box>
            );
          })}
        </Box>
      ) : <EmptyState title="No completed rides yet" hint="Rides you offer or join will be listed here once they finish." />}
    </Surface>
  );

  const renderRouteAlerts = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="Route alerts" count={routeAlerts.length} />
      {routeAlerts.length ? (
        <Stack spacing={1.5}>
          {routeAlerts.map((alert, index) => (
            <Stack key={alert._id || alert.id || index} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2, p: 2, bgcolor: C.canvas, borderRadius: RADIUS.control }}>
              <Typography sx={{ fontWeight: 650, fontSize: "0.92rem", color: C.ink, overflowWrap: "anywhere" }}>
                {alert.from || alert.origin || alert.source || "Origin"} → {alert.to || alert.destination || alert.target || "Destination"}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: C.muted, flexShrink: 0 }}>
                {alert.frequency || (Array.isArray(alert.days) ? alert.days.join(", ") : alert.days) || "Alert on"}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : <EmptyState title="No route alerts" hint="Save a route to get notified when a matching ride is posted." />}
    </Surface>
  );

  const renderPostGrid = (items, { emptyTitle, emptyHint, isOwner = true, source = "posts" } = {}) => {
    if (!items.length) {
      return <Surface><EmptyState title={emptyTitle} hint={emptyHint} /></Surface>;
    }
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 } }}>
        {items.map((post) => {
          const image = resolvePostImage(post);
          const saved = isPostSaved(post._id);
          return (
            <Surface
              key={post._id}
              onClick={() => openPostDetail(post, source)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPostDetail(post, source);
                }
              }}
              sx={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                cursor: "pointer",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": { boxShadow: "0 8px 24px rgba(31,26,23,0.08)" },
                "&:active": { transform: "scale(0.99)" },
                "&:focus-visible": { outline: `2px solid ${C.saffron}`, outlineOffset: 2 },
              }}
            >
              <Box sx={{ position: "relative", pointerEvents: "none" }}>
                {image ? (
                  <Box component="img" src={image} alt="Community post" loading="lazy" sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "fill", display: "block", bgcolor: C.canvas }} />
                ) : (
                  <Box sx={{ aspectRatio: "1 / 1", bgcolor: C.tint }} />
                )}

                {saved && (
                  <Box sx={{ position: "absolute", top: 8, left: 8, bgcolor: "rgba(255,255,255,0.92)", borderRadius: "50%", p: 0.5, display: "flex" }}>
                    <BookmarkIcon sx={{ color: C.saffron, fontSize: 16 }} />
                  </Box>
                )}
              </Box>

              <IconButton
                size="small"
                aria-label="Post actions"
                onClick={(event) => {
                  event.stopPropagation();
                  if (isOwner) {
                    openPostMenu(event, post);
                  } else {
                    setSavedMenuAnchor(event.currentTarget);
                    setSavedMenuPost(post);
                  }
                }}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "rgba(255,255,255,0.92)",
                  "&:hover": { bgcolor: "#fff" },
                  pointerEvents: "auto",
                  zIndex: 2,
                }}
              />

              <Box sx={{ p: 1.75, flex: 1, display: "flex", flexDirection: "column", pointerEvents: "none" }}>
                <Typography sx={{ color: C.body, fontSize: "0.86rem", lineHeight: 1.55, overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {post.description || "Community post"}
                </Typography>
                {post.createdAt && (
                  <Typography sx={{ mt: "auto", pt: 1, fontSize: "0.75rem", color: C.muted }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              {/* Re-add the MoreHoriz icon inside the absolutely positioned IconButton
                  via a pseudo-overlay. Because the wrapper has pointerEvents: none,
                  the icon itself must be a sibling — done below. */}
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                <MoreHorizIcon fontSize="small" sx={{ color: C.ink, opacity: 0.85 }} />
              </Box>
            </Surface>
          );
        })}
      </Box>
    );
  };

  const renderPosts = () => (
    <Box>
      <SectionTitle title="Community posts" count={totalPosts} />
      {postsLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 } }}>
          {[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" sx={{ aspectRatio: "1", height: "auto", borderRadius: RADIUS.card }} />)}
        </Box>
      ) : (
        renderPostGrid(posts, {
          emptyTitle: "No posts yet",
          emptyHint: "Photos and updates you share with the community will appear here.",
          isOwner: true,
          source: "posts",
        })
      )}
      <div ref={loadMoreRef} />
      {postsLoadingMore && <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><CircularProgress size={24} sx={{ color: C.saffron }} /></Box>}
      {!postsLoading && posts.length > 0 && !hasMorePosts && (
        <Typography sx={{ display: "block", textAlign: "center", py: 3, fontSize: "0.8rem", color: C.muted }}>You've reached the end.</Typography>
      )}
    </Box>
  );

  const renderSaved = () => (
    <Box>
      <SectionTitle title="Saved posts" count={savedTotal} />
      {savedError && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: RADIUS.control }}>{savedError}</Alert>
      )}
      {savedLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 } }}>
          {[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" sx={{ aspectRatio: "1", height: "auto", borderRadius: RADIUS.card }} />)}
        </Box>
      ) : (
        renderPostGrid(savedPosts, {
          emptyTitle: "Nothing saved yet",
          emptyHint: "Tap the ⋯ menu on any post and choose Save. Your bookmarked posts will appear here.",
          isOwner: false,
          source: "saved",
        })
      )}
      <div ref={savedLoadMoreRef} />
      {savedHasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} sx={{ color: C.saffron }} />
        </Box>
      )}
    </Box>
  );

  const tabLabels = [
    "About",
    `Reviews${ratingCount ? ` (${ratingCount})` : ""}`,
    `Rides${completedRideItems.length ? ` (${completedRideItems.length})` : ""}`,
    `Posts${totalPosts ? ` (${totalPosts})` : ""}`,
    `Saved${savedTotal ? ` (${savedTotal})` : ""}`,
  ];

  return (
    <>
      <PageLayout>
        <Box sx={{ bgcolor: C.canvas, minHeight: "100%" }}>
          <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 1.5, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 8 }}>
            {profileError && <Alert severity="warning" sx={{ mb: 2.5, borderRadius: RADIUS.control }}>{profileError}</Alert>}

            <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" sx={{ alignItems: "center", gap: { xs: 2, sm: 3 }, minWidth: 0, width: "100%" }}>
                  <ProtectedAvatar
                    src={profile?.profileImageUrl || ""}
                    onClick={() => { setSelectedProfile(profile); setProfileModalOpen(true); }}
                    sx={{
                      width: { xs: 72, sm: 104 }, height: { xs: 72, sm: 104 }, flexShrink: 0,
                      bgcolor: C.tint, color: C.saffron, fontFamily: SERIF, fontSize: { xs: 26, sm: 34 }, fontWeight: 600,
                      border: `3px solid ${C.band}`, cursor: "pointer",
                    }}
                  >
                    {initials(profile)}
                  </ProtectedAvatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="h1" sx={{ fontFamily: SERIF, fontWeight: 600, color: C.ink, fontSize: { xs: "1.45rem", sm: "2rem" }, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                      {name}
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: "center", mt: 0.75, gap: 0.5, color: C.muted, flexWrap: "wrap" }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 17 }} />
                      <Typography sx={{ fontSize: "0.88rem", mr: 1 }}>{city}</Typography>
                      <Typography sx={{ fontSize: "0.88rem" }}>Joined {memberSince}</Typography>
                    </Stack>
                    {(foundingMember || phoneVerified || admin) && (
                      <Stack direction="row" sx={{ mt: 1.5, gap: 1, flexWrap: "wrap" }}>
                        {phoneVerified && (
                          <Chip size="small" icon={<VerifiedOutlinedIcon sx={{ fontSize: 16, color: "#065F46 !important" }} />} label="Verified" sx={{ bgcolor: "#E3F5EC", color: "#065F46", fontWeight: 650 }} />
                        )}
                        {foundingMember && <Chip size="small" label="Founding member" sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 650 }} />}
                        {admin && <Chip size="small" label={profile?.role || "Admin"} sx={{ bgcolor: "#E3EEFB", color: "#1E40AF", fontWeight: 650, textTransform: "capitalize" }} />}
                      </Stack>
                    )}
                  </Box>
                </Stack>
                <Button
                  variant="outlined"
                  startIcon={<EditOutlinedIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                  onClick={() => setEditProfileOpen(true)}
                  sx={{
                    flexShrink: 0, whiteSpace: "nowrap", textTransform: "none", fontWeight: 650,
                    fontSize: { xs: "0.72rem", sm: "0.82rem" }, borderRadius: "999px",
                    px: { xs: 1.25, sm: 2 }, py: { xs: 0.5, sm: 0.75 },
                    ml: { xs: "auto", sm: 0 }, color: C.ink, borderColor: C.line,
                    "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 1 } },
                    "&:hover": { borderColor: C.saffron, bgcolor: C.tint, color: C.saffronDark },
                  }}
                >
                  Edit profile
                </Button>
              </Stack>

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", mt: { xs: 3, sm: 4 }, pt: { xs: 2.5, sm: 3 }, borderTop: `1px solid ${C.line}` }}>
                <Stat value={ridesGiven} label="Rides given" />
                <Stat value={ridesTaken} label="Rides taken" />
                <Stat value={averageRating == null ? "—" : Number(averageRating).toFixed(1)} label={`Rating (${ratingCount})`} />
                <Stat value={referralCounts.total} label="Referrals" />
              </Box>
            </Surface>

            <Box sx={{ display: "grid", mt: 3, gap: 3, alignItems: "start", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 320px" } }}>
              <Box sx={{ minWidth: 0, order: { xs: 2, md: 1 } }}>
                <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons={isSmall ? "auto" : false} allowScrollButtonsMobile
                  sx={{
                    mb: 3, minHeight: 44, borderBottom: `1px solid ${C.line}`,
                    "& .MuiTabs-indicator": { bgcolor: C.saffron, height: 2.5 },
                    "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.92rem", color: C.muted, minWidth: "auto", minHeight: 44, px: { xs: 1.5, sm: 2 }, "&.Mui-selected": { color: C.ink } },
                  }}>
                  {tabLabels.map((label) => <Tab key={label} label={label} disableRipple />)}
                </Tabs>
                {tab === 0 && renderAbout()}
                {tab === 1 && renderReviews()}
                {tab === 2 && renderRides()}
                {tab === 3 && renderPosts()}
                {tab === 4 && renderSaved()}
              </Box>

              <Box sx={{ order: { xs: 1, md: 2 }, position: { md: "sticky" }, top: { md: 88 } }}>
                <Surface sx={{ p: 3 }}>
                  <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.15rem", color: C.ink, mb: 1.5 }}>Trust</Typography>
                  <Stack divider={<Divider sx={{ borderColor: C.line }} />}>
                    <Fact label="Invited by" value={inviterName === "Admin A" ? 'Admin' : inviterName} />
                    <Fact label="Vouched for" value={`${referralCounts.total} ${referralCounts.total === 1 ? "member" : "members"}`} />
                    <Fact label="Reports against" value={reportsCount} />
                    <Fact label="Languages" value={languages} />
                  </Stack>
                  <Box sx={{ mt: 2.5, p: 2, bgcolor: C.canvas, borderRadius: RADIUS.control }}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", mb: 1.25 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 650, color: C.ink }}>Profile completion</Typography>
                      <Typography sx={{ fontFamily: SERIF, fontWeight: 600, color: C.saffron }}>{profileCompletion}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={profileCompletion} sx={{ height: 6, borderRadius: 6, bgcolor: "#F3DFCF", "& .MuiLinearProgress-bar": { bgcolor: C.saffron, borderRadius: 6 } }} />
                    {profileCompletion < 100 && (
                      <Typography sx={{ mt: 1.25, fontSize: "0.78rem", color: C.muted, lineHeight: 1.5 }}>A complete profile helps other members trust you.</Typography>
                    )}
                  </Box>
                </Surface>
              </Box>
            </Box>
          </Box>

          <ProfileModal open={profileModalOpen} currentUser={currentUser} selectedProfile={selectedProfile} onClose={() => setProfileModalOpen(false)} />
          {editProfileOpen && (
            <EditProfile open={editProfileOpen} onClose={() => { setEditProfileOpen(false); getuserData?.(); loadProfileData(); loadReviews(); }} />
          )}

          <Menu anchorEl={postMenuAnchor} open={Boolean(postMenuAnchor)} onClose={closePostMenu}
            slotProps={{ paper: { sx: { borderRadius: RADIUS.control, border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(31,26,23,0.08)", minWidth: 190 } } }}>
            <MenuItem onClick={startEditPost}><EditOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} /> Edit post</MenuItem>
            {selectedPost && (
              <MenuItem
                onClick={() => { const p = selectedPost; closePostMenu(); toggleSavePost(p); }}
                disabled={savingPostId === selectedPost?._id}
              >
                {isPostSaved(selectedPost?._id) ? (
                  <><BookmarkIcon fontSize="small" sx={{ mr: 1.25, color: C.saffron }} /> Unsave post</>
                ) : (
                  <><BookmarkBorderIcon fontSize="small" sx={{ mr: 1.25 }} /> Save post</>
                )}
              </MenuItem>
            )}
            <MenuItem onClick={startDeletePost} sx={{ color: "error.main" }}><DeleteOutlineIcon fontSize="small" sx={{ mr: 1.25 }} /> Delete post</MenuItem>
          </Menu>

          <Menu anchorEl={savedMenuAnchor} open={Boolean(savedMenuAnchor)} onClose={() => { setSavedMenuAnchor(null); setSavedMenuPost(null); }}
            slotProps={{ paper: { sx: { borderRadius: RADIUS.control, border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(31,26,23,0.08)", minWidth: 170 } } }}>
            <MenuItem
              onClick={() => { const p = savedMenuPost; setSavedMenuAnchor(null); setSavedMenuPost(null); if (p) toggleSavePost(p); }}
            >
              <BookmarkIcon fontSize="small" sx={{ mr: 1.25, color: C.saffron }} /> Unsave post
            </MenuItem>
          </Menu>

          <Dialog open={editPostOpen} onClose={() => !postSaving && setEditPostOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: RADIUS.card } }}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: SERIF, fontWeight: 600 }}>
              Edit post
              <IconButton onClick={() => setEditPostOpen(false)} disabled={postSaving} aria-label="Close"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {editPreview && <Box component="img" src={editPreview} alt="Post preview" sx={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: RADIUS.control, bgcolor: C.canvas }} />}
                <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlinedIcon />} sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: "999px", color: C.ink, borderColor: C.line }}>
                  Change image
                  <input hidden type="file" accept="image/*" onChange={onEditFileChange} />
                </Button>
                <TextField label="Description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} multiline minRows={3} fullWidth />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditPostOpen(false)} disabled={postSaving} sx={{ textTransform: "none", color: C.muted }}>Cancel</Button>
              <Button variant="contained" disableElevation onClick={savePostEdits} disabled={postSaving}
                sx={{ bgcolor: C.saffron, textTransform: "none", borderRadius: "999px", px: 3, fontWeight: 650, "&:hover": { bgcolor: C.saffronDark } }}>
                {postSaving ? <CircularProgress size={20} color="inherit" /> : "Save changes"}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={deletePostOpen}
            onClose={() => !postDeleting && setDeletePostOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
              sx: {
                width: "100%",
                maxWidth: { xs: "calc(100% - 32px)", sm: 400 },
                borderRadius: "16px",
                m: 2,
                overflow: "hidden",
              },
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                px: 3,
                pt: 3,
                pb: 1,
              }}
            >
              Delete this post?
            </DialogTitle>

            <DialogContent sx={{ px: 3, py: 1.5 }}>
              <Typography
                sx={{
                  color: C.muted,
                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                  lineHeight: 1.6,
                }}
              >
                Are you sure you want to delete this post? This action cannot be undone.
              </Typography>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                pb: 3,
                pt: 2,
                gap: 1,
              }}
            >
              <Button
                onClick={() => setDeletePostOpen(false)}
                disabled={postDeleting}
                sx={{
                  textTransform: "none",
                  color: C.muted,
                  borderRadius: "999px",
                  px: 2.5,
                  minHeight: 40,
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>

              <Button
                color="error"
                variant="contained"
                disableElevation
                onClick={deletePost}
                disabled={postDeleting}
                sx={{
                  textTransform: "none",
                  borderRadius: "999px",
                  px: 3,
                  minHeight: 40,
                  minWidth: 115,
                  fontWeight: 650,
                  fontSize: "0.875rem",
                }}
              >
                {postDeleting ? (
                  "Deleting..."
                ) : (
                  "Delete post"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </PageLayout>

      {/* ★ Post detail modal is rendered OUTSIDE <PageLayout> so that any
          transform / overflow / stacking context inside PageLayout cannot
          hide or reposition the modal. MUI Dialog portals to document.body,
          but this is the simplest way to remove all ambiguity. */}
      <PostDetailDialog
        post={postDetailPost}
        open={postDetailOpen}
        onClose={closePostDetail}
        isOwner={postDetailSource === "posts"}
        isSaved={postDetailPost ? isPostSaved(postDetailPost._id) : false}
        savingPostId={savingPostId}
        onToggleSave={toggleSavePost}
        onEdit={(p) => { setSelectedPost(p); startEditPost(); }}
        onDelete={(p) => { setSelectedPost(p); startDeletePost(); }}
      />
    </>
  );
};

export default UserProfile;