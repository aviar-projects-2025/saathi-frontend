import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Button,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Grid,
  Modal,
  TextField,
  Skeleton,
  Menu,
  ListItemText,
  ListItemIcon,
  MenuItem,
  DialogTitle,
  Dialog,
  DialogContent,
  Tooltip,
  DialogActions,
  Slider,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import GridOnIcon from "@mui/icons-material/GridOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ToastConfig from "../components/ToastConfig.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import ProfileModal from "./Avatar.jsx";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import EditProfile from "./EditProfile.jsx";

// --- Constants ---
const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";
const TEXT_DARK = "#1A1A1A";
const TEXT_GRAY = "#666666";
const GREEN = "#2E7D32";
const BLUE = "#1976D2";

const pillBtn = {
  textTransform: "none",
  border: "none",
  fontSize: { xs: "0.72rem", sm: "0.85rem", md: "0.9rem" },
  color: SAFFRON,
  fontWeight: 600,
};

const SectionCard = ({ children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: "12px 14px", sm: "16px 18px", md: "24px" },
      borderRadius: { xs: 2, sm: 3 },
      border: CARD_BORDER,
      bgcolor: "#fff",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

// Custom Tag Component
const Tag = ({ label, color, bg }) => (
  <Box
    sx={{
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      bgcolor: bg,
      color: color,
      fontSize: "0.75rem",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {label}
  </Box>
);

const UserProfile = () => {
  const theme = useTheme();
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const toasts = ToastConfig();
  const [imageDeleteLoading, setImageDeleteLoading] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const {
    currentUser,
    getuserData,
    savedPost,
    removeSavedPost,
    getSavedPost,
    savedPage,
    userLoading,
    savedHasNextPage,
    savedLoading,
    removeLoading,
  } = useUser();
  
  const savedPostObserverRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  const [editProfile, setEditProfile] = useState(
    location.state?.openEditProfile || false
  );
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [imagePostLoading, setImagePostLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [communityLoading, setCommunityLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [rawImage, setRawImage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (selectedPost) {
      setTimeout(() => {
        const element = document.getElementById(`post-${selectedPost._id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [selectedPost]);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const [communityPosts, setCommunityPosts] = useState([]);
  const [communityPage, setCommunityPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const observerRef = useRef(null);
  const [totalPostCount, setTotalPostCount] = useState(0);

  useEffect(() => {
    hasMoreRef.current = hasMorePosts;
  }, [hasMorePosts]);

  useEffect(() => {
    pageRef.current = communityPage;
  }, [communityPage]);

  useEffect(() => {
    if (currentUser) {
      setCommunityPosts([]);
      setCommunityPage(1);
      setHasMorePosts(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      isFetchingRef.current = false;
      getCommunityPost(1);
    }
  }, [currentUser]);

  const setLoadMoreRef = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (isFetchingRef.current) return;
        if (!hasMoreRef.current) return;
        isFetchingRef.current = true;
        getCommunityPost(pageRef.current + 1).finally(() => {
          isFetchingRef.current = false;
        });
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const getCommunityPost = async (page = 1) => {
    try {
      if (page === 1) setCommunityLoading(true);
      else setLoadingMorePosts(true);

      const postsRes = await axios.get(
        `${Api}/post-images/profile/${currentUser?._id}?page=${page}&limit=12`
      );
      const newPosts = postsRes.data.data || [];
      const pagination = postsRes.data.pagination;
      const totalCount = pagination?.totalCount ?? 0;
      setTotalPostCount(totalCount);

      if (page === 1) setCommunityPosts(newPosts);
      else setCommunityPosts((prev) => [...prev, ...newPosts]);

      setCommunityPage(page);
      pageRef.current = page;
      const hasMore = pagination?.hasMore ?? false;
      setHasMorePosts(hasMore);
      hasMoreRef.current = hasMore;
    } catch (error) {
      console.error("Get community posts error:", error);
    } finally {
      setCommunityLoading(false);
      setLoadingMorePosts(false);
    }
  };

  const [originalImage, setOriginalImage] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  
  // New Tab State for About, Reviews, Rides, Route Alerts
  const [mainTab, setMainTab] = useState(0);

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };
  
  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
  const isImageMenuOpen = Boolean(imageMenuAnchor);
  const openImageMenu = (e) => setImageMenuAnchor(e.currentTarget);
  const closeImageMenu = () => setImageMenuAnchor(null);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = (post) => {
    if (!post) return;
    setSelectedPost(post);
    setPreviewImage(
      Array.isArray(post.postImage) ? post.postImage[0] : post.postImage || ""
    );
    setOriginalImage(
      Array.isArray(post.postImage) ? post.postImage[0] : post.postImage || ""
    );
    setEditDescription(post.description || "");
    setEditImage(null);
    setEditOpen(true);
  };

  const onImageSelected = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setEditImage(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
    closeImageMenu();
    e.target.value = null;
  };

  const handleReset = () => {
    setEditImage(null);
    setPreviewImage(originalImage);
    setEditDescription(selectedPost?.description || "");
  };

  const handleDelete = async (postId) => {
    try {
      setImageDeleteLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.delete(`${Api}/community/${postId}`, {
        data: { userId: user.id },
      });
      setCommunityPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success(res.data.message, toasts);
      setDeleteOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete post", toasts);
    } finally {
      setImageDeleteLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setImagePostLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("description", editDescription);
      if (editImage) formData.append("postImage", editImage);

      const res = await axios.put(`${Api}/community/${selectedPost._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedPost = res.data?.data || {};
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === selectedPost._id
            ? {
                ...post,
                ...updatedPost,
                postImage: updatedPost.postImage ?? post.postImage,
                description: updatedPost.description ?? editDescription,
              }
            : post
        )
      );
      toast.success(res.data.message, toasts);
      setEditOpen(false);
      setOpenImage(false);
      setSelectedPost(null);
      setEditImage(null);
      setEditDescription("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post", toasts);
    } finally {
      setImagePostLoading(false);
    }
  };

  const [dropDown, setDropDown] = useState(null);
  const isdropdownMenuOpen = Boolean(dropDown);
  const handleDropdownMenuOpen = (event) => setDropDown(event.currentTarget);
  const handleDropdownMenuClose = () => setDropDown(null);

  useEffect(() => {
    if (mainTab !== 2) return; // Only trigger for Posts tab if needed, but for now adjusting for UI
    // Logic for infinite scroll might need to be adapted based on new tab structure
  }, [mainTab, savedPage, savedLoading, savedHasNextPage, getSavedPost]);

  const handleSettingClick = () => {
    handleDropdownMenuClose();
    navigate("/myprofile");
  };

  // --- RENDER HELPERS ---
  
  // Render Route Alerts Tab Content
  const renderRouteAlerts = () => (
    <Stack spacing={2.5}>
       {/* Add Alert Button Top Right */}
       <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button 
                variant="text" 
                sx={{ 
                    color: SAFFRON, 
                    fontWeight: 600, 
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
            >
                + Add alert
            </Button>
       </Box>

      <SectionCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: '1.1rem' }}>
          Route alerts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Get a text when a new ride is posted on a route you care about. Only visible to you.
        </Typography>

        <Stack spacing={2}>
            {/* Alert Item 1 */}
            <Box sx={{ 
                border: '1px solid #E0E0E0', 
                borderRadius: 1, 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <Typography variant="body1" fontSize="0.95rem">
                    Bloomington, IL → O'Hare (ORD), weekdays
                </Typography>
                <Button 
                    variant="text" 
                    size="small" 
                    sx={{ 
                        color: SAFFRON, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        minWidth: 'auto'
                    }}
                >
                    Remove
                </Button>
            </Box>

            {/* Alert Item 2 */}
            <Box sx={{ 
                border: '1px solid #E0E0E0', 
                borderRadius: 1, 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <Typography variant="body1" fontSize="0.95rem">
                    Normal, IL → Chicago, IL, any day
                </Typography>
                <Button 
                    variant="text" 
                    size="small" 
                    sx={{ 
                        color: SAFFRON, 
                        textTransform: 'none', 
                        fontWeight: 600,
                        minWidth: 'auto'
                    }}
                >
                    Remove
                </Button>
            </Box>
        </Stack>
      </SectionCard>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.75rem' }}>
          Replaces the old post grid. Others see the same layout (without Route alerts, email or phone) on the Public Profile screen.
      </Typography>
    </Stack>
  );

  // Render About Tab Content
  const renderAbout = () => (
    <Stack spacing={3}>
       {/* About Me Card */}
      <SectionCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, fontSize: '1rem', color: TEXT_DARK }}>
          About me
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6 }}>
          Software program manager and community volunteer. Happy to help new arrivals with airport pickups around Bloomington–Normal and Chicago.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
            Gender (private, only used for women-only rides): Prefer not to say
        </Typography>
      </SectionCard>

      {/* Spacer to push footer text down */}
      <Box sx={{ pt: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Replaces the old post grid. Others see the same layout (without Route alerts, email or phone) on the Public Profile screen.
          </Typography>
      </Box>
    </Stack>
  );

  return (
    <PageLayout>
      <Box sx={{ mx: "auto", px: { xs: 0, sm: 2, md: 0 }, pb: 5 }}>
        
        {/* Header Title */}
        <Box sx={{ pt: { xs: 2, sm: 0 }, mb: 1 }}>
          <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" } }}>
            My Profile
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: { xs: "0.72rem", sm: "0.9rem" } }}>
            Manage your Saathi account, referrals, and preferences.
          </Typography>
        </Box>

        <Stack spacing={3} sx={{ mt: 2 }}>
          
          {/* --- PROFILE CARD --- */}
          <SectionCard sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              
              {/* Avatar Section */}
              <Box sx={{ flexShrink: 0 }}>
                <Avatar
                  src={currentUser?.profileImage || ""}
                  onClick={() => {
                    setSelectedProfile(currentUser);
                    setProfileModalOpen(true);
                  }}
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    bgcolor: "#FAD7C5", // Light peach background
                    color: "#8B4513", // Brown text
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    border: "2px solid #2E7D32", // Green border
                    cursor: "pointer",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  {!currentUser?.profileImage && (
                    <>
                      {currentUser?.firstName?.[0] || ""}
                      {currentUser?.lastName?.[0] || ""}
                    </>
                  )}
                </Avatar>
              </Box>

              {/* Info Section */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ color: "#003366", mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                      {currentUser?.firstName} {currentUser?.lastName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.9rem' }}>
                      {currentUser?.city || "Normal, IL"} • Tamil, English, Hindi • Member since Oct 2026
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <Tag label="Founding member" bg="#FEF3C7" color="#92400E" />
                      <Tag label="Phone verified" bg="#D1FAE5" color="#065F46" />
                      <Tag label="Super Admin" bg="#DBEAFE" color="#1E40AF" />
                    </Stack>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => setEditProfile(true)}
                    sx={{
                      textTransform: 'none',
                      color: SAFFRON,
                      borderColor: SAFFRON,
                      borderRadius: 2,
                      px: 3,
                      py: 0.75,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: SAFFRON,
                        bgcolor: SAFFRON_LIGHT,
                      }
                    }}
                  >
                    Edit profile
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* --- TRUST & ACTIVITY CARDS --- */}
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              {/* Trust Card */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2.5, border: '1px solid #E0E0E0', borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 1, color: TEXT_GRAY, mb: 2, display: 'block' }}>
                    TRUST
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Invited by:</strong> Founder (root of the chain)
                    </Typography>
                    <Typography variant="body2">
                      <strong>Vouched for:</strong> 14 members
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reports against:</strong> 0
                    </Typography>
                    <Typography variant="body2">
                      <strong>Profile:</strong> 100% complete
                    </Typography>
                  </Stack>
                </Box>
              </Grid>

              {/* Activity Card */}
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2.5, border: '1px solid #E0E0E0', borderRadius: 2, height: '100%' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 1, color: TEXT_GRAY, mb: 2, display: 'block' }}>
                    ACTIVITY
                  </Typography>
                  <Stack direction="row" spacing={4} alignItems="center" sx={{ height: '80%' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#003366" }}>12</Typography>
                      <Typography variant="caption" color="text.secondary">Rides given</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#003366" }}>5</Typography>
                      <Typography variant="caption" color="text.secondary">Rides taken</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#003366" }}>4.9</Typography>
                      <Typography variant="caption" color="text.secondary">Rating (9)</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>

          {/* --- MAIN TABS --- */}
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={mainTab}
              onChange={(e, val) => setMainTab(val)}
              sx={{
                minHeight: 48,
                borderBottom: '1px solid #E0E0E0',
                '& .MuiTabs-indicator': { backgroundColor: SAFFRON, height: 3 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: TEXT_GRAY,
                  minWidth: 'auto',
                  mr: 4,
                  px: 0,
                  '&.Mui-selected': { color: SAFFRON },
                },
              }}
            >
              <Tab label="About" />
              <Tab label="Reviews (9)" />
              <Tab label="Rides (17)" />
              <Tab label="Route alerts (2)" />
            </Tabs>

            {/* Tab Content Area */}
            <Box sx={{ mt: 3 }}>
              {mainTab === 0 && renderAbout()}
              {mainTab === 1 && <Typography sx={{ p: 3, textAlign: 'center', color: TEXT_GRAY }}>Reviews content coming soon...</Typography>}
              {mainTab === 2 && <Typography sx={{ p: 3, textAlign: 'center', color: TEXT_GRAY }}>Rides content coming soon...</Typography>}
              {mainTab === 3 && renderRouteAlerts()}
            </Box>
          </Box>

        </Stack>

        {/* --- Modals & Dialogs (Keeping existing logic) --- */}
        <ProfileModal
          open={profileModalOpen}
          selectedProfile={selectedProfile}
          onClose={() => setProfileModalOpen(false)}
        />
        
        {editProfile && (
            <EditProfile open={editProfile} onClose={() => setEditProfile(false)} />
        )}
        
        {/* Post Edit/Delete Dialogs and other logic can remain hidden or reused as needed, 
            but visually are removed from the main screen as per new design */}
      </Box>
    </PageLayout>
  );
};

export default UserProfile;