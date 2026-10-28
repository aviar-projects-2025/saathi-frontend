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
import PageLayout from "../components/PageLayout";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";
import { useUser } from "../context/userConetext";
import ProfileModal from "./Avatar.jsx";
import EditProfile from "./EditProfile.jsx";
import { useLocation } from "react-router-dom";

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
const Surface = ({ children, sx = {} }) => (
  <Box sx={{ bgcolor: C.paper, border: `1px solid ${C.line}`, borderRadius: RADIUS.card, ...sx }}>{children}</Box>
);

const SectionTitle = ({ title, count, action }) => (
  <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between",  mb: 2.5 }}>
    <Stack direction="row" sx={{ alignItems: "baseline",  gap: 1.25 }}>
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
  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline", gap: 2,  py: 1.25 }}>
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
const isCompleted = (ride) => String(ride?.travelStatus || ride?.status || ride?.rideId?.travelStatus || ride?.rideId?.status || "").toLowerCase() === "completed";
const placeLabel = (value) => typeof value === "object" ? value?.address || value?.name || "—" : value;
const routeParts = (ride) => {
  const item = ride?.rideId && typeof ride.rideId === "object" ? ride.rideId : ride;
  return [
    placeLabel(item?.from || item?.origin || item?.startLocation || "Origin"),
    placeLabel(item?.destination || item?.to || item?.endLocation || "Destination"),
  ];
};

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

  /* ---------- data loading (unchanged logic) ---------- */
  const loadProfileData = useCallback(async () => {
    if (!userId) return;
    let cancelled = false;
    setProfileLoading(true);
    setProfileError("");

    const [userResult, ridesResult, requestsResult, referralsResult] = await Promise.allSettled([
      axios.get(`${Api}/users/${userId}`, authConfig()),
      axios.get(`${Api}/rides/get`, { ...authConfig(), params: { page: 1, limit: 100 } }),
      axios.get(`${Api}/bookride/send/${userId}`, authConfig()),
      axios.get(`${Api}/users/${userId}/referrals`, authConfig()),
    ]);
    if (cancelled) return;

    let fetchedProfile = currentUser || null;
    if (userResult.status === "fulfilled") {
      fetchedProfile = unwrap(userResult.value) || fetchedProfile;
      setProfile(fetchedProfile);
    } else {
      setProfileError(userResult.reason?.response?.data?.message || "Some profile details could not be loaded.");
    }

    const referrer = fetchedProfile?.referredBy;
    if (referrer && typeof referrer === "object") {
      setInviter(referrer);
    } else if (referrer) {
      try {
        const referrerResponse = await axios.get(`${Api}/users/${idOf(referrer)}`, authConfig());
        if (!cancelled) setInviter(unwrap(referrerResponse));
      } catch {
        if (!cancelled) setInviter(null);
      }
    } else {
      setInviter(null);
    }

    if (ridesResult.status === "fulfilled") {
      const payload = ridesResult.value?.data;
      const ridesList = toArray(payload?.data ?? payload?.rides ?? payload);
      const ownCompleted = ridesList.filter((ride) => {
        const owner = ride?.createdBy?._id || ride?.createdBy?.id || ride?.createdBy || ride?.userId?._id || ride?.userId || ride?.owner?._id || ride?.owner;
        return (!owner || idOf(owner) === userId) && isCompleted(ride);
      });
      setOfferedRides(ownCompleted);
    } else {
      setOfferedRides([]);
    }

    if (requestsResult.status === "fulfilled") {
      const requests = toArray(requestsResult.value?.data?.data ?? requestsResult.value?.data);
      setTakenRides(requests.filter((request) => String(request?.status || "").toUpperCase() === "ACCEPTED" && isCompleted(request?.rideId || request)));
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

  /* ---------- derived values ---------- */
  const completedRideItems = useMemo(() => {
    const given = offeredRides.map((ride) => ({ ...ride, _kind: "Ride given" }));
    const taken = takenRides.map((request) => ({ ...(request.rideId && typeof request.rideId === "object" ? request.rideId : request), _kind: "Ride taken", _requestId: request._id || request.id }));
    const combined = [...given, ...taken];
    return combined.filter((ride, index) => {
      const id = idOf(ride?._id || ride?.id);
      return !id || combined.findIndex((other) => idOf(other?._id || other?.id) === id) === index;
    });
  }, [offeredRides, takenRides]);

  const profileCompletion = Math.max(0, Math.min(100, Number(completion ?? profile?.profileCompletion ?? 0) || 0));
  const rating = profile?.averageRating ?? profile?.rating;
  const reviews = Array.isArray(profile?.reviews) ? profile.reviews : [];
  const routeAlerts = Array.isArray(profile?.routeAlerts) ? profile.routeAlerts : [];
  const languageValue = profile?.languages ?? profile?.language ?? profile?.preferredLanguages;
  const languages = Array.isArray(languageValue) ? languageValue.join(", ") : languageValue || "Not added";
  const city = profile?.city || profile?.location?.city || "Location not added";
  const memberDate = profile?.createdAt || profile?.created_at || profile?.joinedAt;
  const memberSince = memberDate ? new Date(memberDate).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—";
  const name = displayNameOf(profile || currentUser);
  const inviterName = inviter ? displayNameOf(inviter) : (profile?.referredBy ? "Details unavailable" : "Not recorded");
  const phoneVerified = Boolean(profile?.isPhoneVerified ?? profile?.phoneVerified ?? profile?.isVerified);
  const admin = ["admin", "superadmin", "super_admin"].includes(String(profile?.role || "").toLowerCase());
  const vouchedCount = Number(profile?.vouchedForCount ?? profile?.vouchedMembers?.length ?? 0) || 0;
  const reportsCount = Number(profile?.reportsAgainstCount ?? profile?.reportCount ?? 0) || 0;
  const foundingMember = Boolean(profile?.isFoundingMember);
  const ridesGiven = offeredRides.length;
  const ridesTaken = takenRides.length;
  const ratingCount = Number(profile?.ratingCount ?? profile?.reviewCount ?? reviews.length) || 0;

  /* ---------- post actions (unchanged logic) ---------- */
  const openPostMenu = (event, post) => { setPostMenuAnchor(event.currentTarget); setSelectedPost(post); };
  const closePostMenu = () => setPostMenuAnchor(null);
  const startEditPost = () => {
    if (!selectedPost) return;
    setEditDescription(selectedPost.description || "");
    const image = Array.isArray(selectedPost.postImage) ? selectedPost.postImage[0] : selectedPost.postImage || "";
    setEditPreview(image);
    setEditFile(null);
    setEditPostOpen(true);
    closePostMenu();
  };
  const startDeletePost = () => { setDeletePostOpen(true); closePostMenu(); };
  const onEditFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };
  const savePost = async () => {
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
      setTotalPosts((count) => Math.max(0, count - 1));
      toast.success(response?.data?.message || "Post deleted", toasts);
      setDeletePostOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete post", toasts);
    } finally { setPostDeleting(false); }
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
      {reviews.length ? reviews.map((review, index) => {
        const author = review.reviewer || review;
        return (
          <Box key={review._id || review.id || index}>
            <Stack direction="row" sx={{ py: 2.5, gap: 2 }}>
              <Avatar src={author?.profileImage} sx={{ width: 40, height: 40, bgcolor: C.tint, color: C.saffron, fontWeight: 700, fontSize: "0.9rem" }}>
                {initials(author)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 650, fontSize: "0.92rem", color: C.ink }}>
                    {displayNameOf(author) || review.reviewerName || "Community member"}
                  </Typography>
                  {review.rating != null && (
                    <Typography sx={{ fontFamily: SERIF, fontWeight: 600, color: C.saffron, fontSize: "0.95rem" }}>{review.rating}/5</Typography>
                  )}
                </Stack>
                <Typography sx={{ mt: 0.75, color: C.body, lineHeight: 1.7, fontSize: "0.92rem" }}>
                  {review.comment || review.message || "No written review."}
                </Typography>
              </Box>
            </Stack>
            {index < reviews.length - 1 && <Divider sx={{ borderColor: C.line }} />}
          </Box>
        );
      }) : <EmptyState title="No reviews yet" hint="Reviews from riders and drivers will appear here after your first completed ride." />}
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
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  py: 2, gap: 2 }}>
                  {/* route line */}
                  <Stack sx={{ alignItems: "center",  width: 14, flexShrink: 0, alignSelf: "stretch", py: 0.5 }}>
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

  const renderReferrals = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="Referrals" count={referralCounts.total} />
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: C.line }} />} sx={{ mb: 3, p: 2, bgcolor: C.canvas, borderRadius: RADIUS.control }}>
        {[
          ["Approved", referralCounts.approved, "#2E7D32"],
          ["Pending", referralCounts.pending, "#B45309"],
          ["Rejected", referralCounts.rejected, "#B91C1C"],
        ].map(([label, value, color]) => (
          <Box key={label} sx={{ flex: 1, textAlign: "center" }}>
            <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.5rem", color }}>{value}</Typography>
            <Typography sx={{ fontSize: "0.78rem", color: C.muted }}>{label}</Typography>
          </Box>
        ))}
      </Stack>
      {referrals.length ? (
        <Box>
          {referrals.map((person, index) => (
            <Box key={person._id || person.id || index}>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between",  py: 1.75, gap: 2 }}>
                <Avatar src={person.profileImage || person.user?.profileImage} sx={{ bgcolor: C.tint, color: C.saffron, fontWeight: 700, width: 42, height: 42, fontSize: "0.9rem" }}>
                  {initials(person.user || person)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 650, fontSize: "0.92rem", color: C.ink, overflowWrap: "anywhere" }}>{displayNameOf(person.user || person)}</Typography>
                  <Typography noWrap sx={{ fontSize: "0.8rem", color: C.muted }}>{person.email || person.user?.email || "Community member"}</Typography>
                </Box>
                <Chip size="small" label={person.status || person.referralStatus || "Registered"} sx={{ bgcolor: C.canvas, color: C.body, fontWeight: 600, fontSize: "0.74rem", textTransform: "capitalize" }} />
              </Stack>
              {index < referrals.length - 1 && <Divider sx={{ borderColor: C.line }} />}
            </Box>
          ))}
        </Box>
      ) : <EmptyState title="No referrals yet" hint="Members you invite to Saathi will show up here with their approval status." />}
    </Surface>
  );

  const renderRouteAlerts = () => (
    <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
      <SectionTitle title="Route alerts" count={routeAlerts.length} />
      {routeAlerts.length ? (
        <Stack spacing={1.5}>
          {routeAlerts.map((alert, index) => (
            <Stack key={alert._id || alert.id || index} direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2,  p: 2, bgcolor: C.canvas, borderRadius: RADIUS.control }}>
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

  const renderPosts = () => (
    <Box>
      <SectionTitle title="Community posts" count={totalPosts} />
      {postsLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 } }}>{[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" sx={{ aspectRatio: "1", height: "auto", borderRadius: RADIUS.card }} />)}</Box>
      ) : posts.length ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.5, sm: 2 } }}>
          {posts.map((post) => {
            const image = Array.isArray(post.postImage) ? post.postImage[0] : post.postImage;
            return (
              <Surface key={post._id} sx={{ overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <Box sx={{ position: "relative" }}>
                    {image ? (
                      <Box component="img" src={image} alt="Community post" loading="lazy" sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block", bgcolor: C.canvas }} />
                    ) : (
                      <Box sx={{ aspectRatio: "1 / 1", bgcolor: C.tint }} />
                    )}
                    <IconButton
                      size="small"
                      aria-label="Post actions"
                      onClick={(event) => openPostMenu(event, post)}
                      sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.92)", "&:hover": { bgcolor: "#fff" } }}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ p: 1.75, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography sx={{
                      color: C.body, fontSize: "0.86rem", lineHeight: 1.55, overflowWrap: "anywhere",
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {post.description || "Community post"}
                    </Typography>
                    {post.createdAt && (
                      <Typography sx={{ mt: "auto", pt: 1, fontSize: "0.75rem", color: C.muted }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
</Surface>
            );
          })}
        </Box>
      ) : (
        <Surface><EmptyState title="No posts yet" hint="Photos and updates you share with the community will appear here." /></Surface>
      )}
      <div ref={loadMoreRef} />
      {postsLoadingMore && <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}><CircularProgress size={24} sx={{ color: C.saffron }} /></Box>}
      {!postsLoading && posts.length > 0 && !hasMorePosts && (
        <Typography sx={{ display: "block", textAlign: "center", py: 3, fontSize: "0.8rem", color: C.muted }}>You've reached the end.</Typography>
      )}
    </Box>
  );

  const tabLabels = [
    "About",
    `Reviews${ratingCount ? ` (${ratingCount})` : ""}`,
    `Rides${completedRideItems.length ? ` (${completedRideItems.length})` : ""}`,
    // `Referrals${referralCounts.total ? ` (${referralCounts.total})` : ""}`,
    // "Route alerts",
    // `Posts${totalPosts ? ` (${totalPosts})` : ""}`,
  ];

  return (
    <PageLayout>
      <Box sx={{ bgcolor: C.canvas, minHeight: "100%" }}>
        <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 1.5, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 8 }}>
          {profileError && <Alert severity="warning" sx={{ mb: 2.5, borderRadius: RADIUS.control }}>{profileError}</Alert>}

          {/* ---------- Identity header ---------- */}
          <Surface sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between",  gap: { xs: 2.5, sm: 3 } }}>
              <Stack direction="row" sx={{ alignItems: "center",  gap: { xs: 2, sm: 3 }, minWidth: 0, width: "100%" }}>
                <Avatar
                  src={profile?.profileImageUrl || ""}
                  onClick={() => { setSelectedProfile(profile); setProfileModalOpen(true); }}
                  sx={{
                    width: { xs: 72, sm: 104 }, height: { xs: 72, sm: 104 }, flexShrink: 0,
                    bgcolor: C.tint, color: C.saffron, fontFamily: SERIF, fontSize: { xs: 26, sm: 34 }, fontWeight: 600,
                    border: `3px solid ${C.band}`, cursor: "pointer",
                  }}
                >
                  {initials(profile)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography component="h1" sx={{ fontFamily: SERIF, fontWeight: 600, color: C.ink, fontSize: { xs: "1.45rem", sm: "2rem" }, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                    {name}
                  </Typography>
                  <Stack direction="row" sx={{ alignItems: "center",  mt: 0.75, gap: 0.5, color: C.muted, flexWrap: "wrap" }}>
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
                startIcon={<EditOutlinedIcon fontSize="small" />}
                onClick={() => setEditProfileOpen(true)}
                sx={{
                  flexShrink: 0, whiteSpace: "nowrap", textTransform: "none", fontWeight: 650, fontSize: "0.88rem",
                  borderRadius: "999px", px: 2.5, color: C.ink, borderColor: C.line,
                  "&:hover": { borderColor: C.saffron, bgcolor: C.tint, color: C.saffronDark },
                }}
              >
                Edit profile
              </Button>
            </Stack>

            {/* activity strip */}
            <Box sx={{
              display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              mt: { xs: 3, sm: 4 }, pt: { xs: 2.5, sm: 3 }, borderTop: `1px solid ${C.line}`,
            }}>
              <Stat value={ridesGiven} label="Rides given" />
              <Stat value={ridesTaken} label="Rides taken" />
              <Stat value={rating == null ? "—" : Number(rating).toFixed(1)} label={`Rating (${ratingCount})`} />
              <Stat value={referralCounts.total} label="Referrals" />
            </Box>
          </Surface>

          {/* ---------- Body: content + trust rail ---------- */}
          <Box sx={{
            display: "grid", mt: 3, gap: 3, alignItems: "start",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 320px" },
          }}>
            <Box sx={{ minWidth: 0, order: { xs: 2, md: 1 } }}>
              <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="scrollable"
                scrollButtons={isSmall ? "auto" : false}
                allowScrollButtonsMobile
                sx={{
                  mb: 3, minHeight: 44, borderBottom: `1px solid ${C.line}`,
                  "& .MuiTabs-indicator": { bgcolor: C.saffron, height: 2.5 },
                  "& .MuiTab-root": {
                    textTransform: "none", fontWeight: 600, fontSize: "0.92rem", color: C.muted,
                    minWidth: "auto", minHeight: 44, px: { xs: 1.5, sm: 2 },
                    "&.Mui-selected": { color: C.ink },
                  },
                }}
              >
                {tabLabels.map((label) => <Tab key={label} label={label} disableRipple />)}
              </Tabs>
              {tab === 0 && renderAbout()}
              {tab === 1 && renderReviews()}
              {tab === 2 && renderRides()}
              {tab === 3 && renderReferrals()}
              {tab === 4 && renderRouteAlerts()}
              {tab === 5 && renderPosts()}
            </Box>

            <Box sx={{ order: { xs: 1, md: 2 }, position: { md: "sticky" }, top: { md: 88 } }}>
              <Surface sx={{ p: 3 }}>
                <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: "1.15rem", color: C.ink, mb: 1.5 }}>Trust</Typography>
                <Stack divider={<Divider sx={{ borderColor: C.line }} />}>
                  <Fact label="Invited by" value={inviterName} />
                  <Fact label="Vouched for" value={`${vouchedCount} ${vouchedCount === 1 ? "member" : "members"}`} />
                  <Fact label="Reports against" value={reportsCount} />
                  <Fact label="Languages" value={languages} />
                </Stack>
                <Box sx={{ mt: 2.5, p: 2, bgcolor: C.canvas, borderRadius: RADIUS.control }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline",  mb: 1.25 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 650, color: C.ink }}>Profile completion</Typography>
                    <Typography sx={{ fontFamily: SERIF, fontWeight: 600, color: C.saffron }}>{profileCompletion}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={profileCompletion}
                    sx={{ height: 6, borderRadius: 6, bgcolor: "#F3DFCF", "& .MuiLinearProgress-bar": { bgcolor: C.saffron, borderRadius: 6 } }}
                  />
                  {profileCompletion < 100 && (
                    <Typography sx={{ mt: 1.25, fontSize: "0.78rem", color: C.muted, lineHeight: 1.5 }}>
                      A complete profile helps other members trust you.
                    </Typography>
                  )}
                </Box>
              </Surface>
            </Box>
          </Box>
        </Box>

        {/* ---------- Modals ---------- */}
        <ProfileModal open={profileModalOpen} selectedProfile={selectedProfile} onClose={() => setProfileModalOpen(false)} />
        {editProfileOpen && (
          <EditProfile
            open={editProfileOpen}
            onClose={() => { setEditProfileOpen(false); getuserData?.(); loadProfileData(); }}
          />
        )}

        <Menu
          anchorEl={postMenuAnchor}
          open={Boolean(postMenuAnchor)}
          onClose={closePostMenu}
          slotProps={{ paper: { sx: { borderRadius: RADIUS.control, border: `1px solid ${C.line}`, boxShadow: "0 8px 24px rgba(31,26,23,0.08)", minWidth: 170 } } }}
        >
          <MenuItem onClick={startEditPost}><EditOutlinedIcon fontSize="small" sx={{ mr: 1.25 }} /> Edit post</MenuItem>
          <MenuItem onClick={startDeletePost} sx={{ color: "error.main" }}><DeleteOutlineIcon fontSize="small" sx={{ mr: 1.25 }} /> Delete post</MenuItem>
        </Menu>

        <Dialog open={editPostOpen} onClose={() => !postSaving && setEditPostOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: RADIUS.card } }}>
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: SERIF, fontWeight: 600 }}>
            Edit post
            <IconButton onClick={() => setEditPostOpen(false)} disabled={postSaving} aria-label="Close"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {editPreview && (
                <Box component="img" src={editPreview} alt="Post preview" sx={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: RADIUS.control, bgcolor: C.canvas }} />
              )}
              <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlinedIcon />} sx={{ alignSelf: "flex-start", textTransform: "none", borderRadius: "999px", color: C.ink, borderColor: C.line }}>
                Change image
                <input hidden type="file" accept="image/*" onChange={onEditFileChange} />
              </Button>
              <TextField label="Description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} multiline minRows={3} fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditPostOpen(false)} disabled={postSaving} sx={{ textTransform: "none", color: C.muted }}>Cancel</Button>
            <Button
              variant="contained" disableElevation onClick={savePost} disabled={postSaving}
              sx={{ bgcolor: C.saffron, textTransform: "none", borderRadius: "999px", px: 3, fontWeight: 650, "&:hover": { bgcolor: C.saffronDark } }}
            >
              {postSaving ? <CircularProgress size={20} color="inherit" /> : "Save changes"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={deletePostOpen} onClose={() => !postDeleting && setDeletePostOpen(false)} PaperProps={{ sx: { borderRadius: RADIUS.card } }}>
          <DialogTitle sx={{ fontFamily: SERIF, fontWeight: 600 }}>Delete this post?</DialogTitle>
          <DialogContent><Typography sx={{ color: C.muted }}>This can't be undone.</Typography></DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDeletePostOpen(false)} disabled={postDeleting} sx={{ textTransform: "none", color: C.muted }}>Cancel</Button>
            <Button color="error" variant="contained" disableElevation onClick={deletePost} disabled={postDeleting} sx={{ textTransform: "none", borderRadius: "999px", px: 3, fontWeight: 650 }}>
              {postDeleting ? <CircularProgress size={20} color="inherit" /> : "Delete post"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
};

export default UserProfile;