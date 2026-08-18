import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Avatar, Button,
  Divider, Stack, LinearProgress,
  TextField,
  CircularProgress,
  Tooltip,
  useTheme,
  IconButton,
  useMediaQuery
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import UserAvatar from '../components/UserAvatar.jsx';
import PageLayout from '../components/PageLayout.jsx';
import ChatIcon from '@mui/icons-material/Chat';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ShareIcon from '@mui/icons-material/Share';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import CloseIcon from '@mui/icons-material/Close';
import Api from '../Api.jsx';
import axios from 'axios';
import Discover from './Discover.jsx'

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { toast } from 'react-toastify';
import CommunityImage from '../components/CommunityImage.jsx';
import CommunityComments from './CommunityComments.jsx';
import { useUser } from '../context/userConetext.jsx';
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ToastConfig from '../components/ToastConfig.jsx';
import ProfileModal from './Avatar.jsx';

const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }; // MUI defaults

function getTier(width) {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  return 'xl';
}

function useResponsiveTier() {
  const [tier, setTier] = useState(
    typeof window !== 'undefined' ? getTier(window.innerWidth) : 'md'
  );
  useEffect(() => {
    const handleResize = () => setTier(getTier(window.innerWidth));
    // Run once on mount in case the initial state above was computed
    // before layout/zoom settled.
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return tier;
}

export default function Community() {
  const [post, setPost] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [postId, setPostId] = useState([])
  const [editImage, setEditImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [openMediaDialog, setOpenMediaDialog] = useState(false);
  const { currentUser } = useUser()
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltip2Open, setTooltip2Open] = useState(false);
  const [imagePostLoading, setImagePostLoading] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [commentCounts, setCommentCounts] = useState({});
  const toasts = ToastConfig();

  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [originalDescription, setOriginalDescription] = useState("");
  const [originalImage, setOriginalImage] = useState(null);

  const handleMediaClick = () => {
    if (!isProfileComplete) return;

    if (isMobile) {
      setOpenMediaDialog(true);
    } else {
      fileInputRef.current?.click();
    }
  };
  // Lower score = closer / higher priority
  const getZipcodeProximityScore = (authorZip, currentZip) => {
    if (!currentZip || !authorZip) return 3; // no data → lowest priority
    const a = String(authorZip);
    const b = String(currentZip);

    if (a === b) return 0;               // exact same zipcode
    if (a.slice(0, 3) === b.slice(0, 3)) return 1; // same local area
    if (a.slice(0, 1) === b.slice(0, 1)) return 2; // same broad region
    return 3;                             // everything else
  };

  const sortPostsByProximity = (posts, currentZip) => {
    return [...posts].sort(
      (a, b) =>
        getZipcodeProximityScore(a?.authorId?.zipcode, currentZip) -
        getZipcodeProximityScore(b?.authorId?.zipcode, currentZip)
    );
  };

  const getCommmunityPost = async () => {
    try {
      setPostLoading(true);
      const postsRes = await axios.get(Api + "/community/");
      const likesRes = await axios.get(Api + `/likes/liked-posts/${user.id}`);
      const likedPostIds = likesRes?.data?.data || [];
      const updatedPosts = postsRes?.data?.data?.map((post) => ({
        ...post,
        isLiked: likedPostIds.includes(post._id),
      }));

      // 👇 sort so nearby users (by zipcode) appear first
      const sortedPosts = sortPostsByProximity(updatedPosts, currentUser?.zipcode);

      const postIds = postsRes.data.data.map((item) => item._id);
      setCommunityPosts(sortedPosts);
      setPostId(postIds);

      const countEntries = await Promise.all(
        sortedPosts.map(async (p) => {
          try {
            const res = await axios.get(Api + `/community/comments/${p._id}/${user.id}`);
            return [p._id, res.data.data.comments.length];
          } catch {
            return [p._id, 0];
          }
        })
      );
      setCommentCounts(Object.fromEntries(countEntries));
    } catch (error) {
      console.error(error.message);
    } finally {
      setPostLoading(false);
    }
  };

  const getComments = async (postId) => {
    try {
      // setLoading(true);
      const res = await axios.get(Api + `/community/comments/${postId}`);
      setCommentCounts((prev) => ({ ...prev, [postId]: res.data.data.comments.length }));
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (post) => {
    try {
      const res = await axios.post(
        `${Api}/save-post/${post._id}/${currentUser._id}`
      );

      setSavedPost((prev) => [
        ...prev,
        {
          _id: res.data.data._id,
          postId: post,
          userId: currentUser._id,
        },
      ]);

    } catch (error) {
      console.log(error);
    }
  };



  const isPostSaved = (postId) => {
    return savedPost?.some(
      (item) => item.postId?._id === postId
    );
  };

  // inside your component:
  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
  const isImageMenuOpen = Boolean(imageMenuAnchor);

  const openImageMenu = (e) => setImageMenuAnchor(e.currentTarget);
  const closeImageMenu = () => setImageMenuAnchor(null);

  const onImageSelected = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setEditImage(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
    closeImageMenu();
    e.target.value = null; // allow re-selecting same file next time
  };


  const tier = useResponsiveTier();
  const isMobile = tier === 'xs';                 // phones
  const isTablet = tier === 'sm'; // tablets / small laptops
  const isDesktop = tier === 'md' || tier === 'lg' || tier === 'xl'; // laptops and up

  const showSidebar = !isMobile;

  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const POST_BOX_WIDTH_SX = { xs: '100%', sm: '100%', md: '600px', lg: '640px', xl: '640px' };

  const avatarSize = isMobile ? 30 : isTablet ? 33 : 35;
  const iconFontSize = isMobile ? 'small' : 'medium';
  const btnFontSize = isMobile ? '0.5rem' : isTablet ? '0.65rem' : '0.7rem';
  const bodyFontSize = isMobile ? '0.7rem' : isTablet ? '0.76rem' : '0.8rem';
  const captionSize = isMobile ? '0.6rem' : '0.6rem';
  const avatarFontSize = isMobile ? '0.6rem' : isTablet ? '0.9rem' : '1.1rem';
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMedia(file);

    setPreview(URL.createObjectURL(file));
    e.target.value = "";

    setOpenMediaDialog(false);
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const { completion, savedPost, setSavedPost, removeSavedPost } = useUser();

  const isProfileComplete = completion === 100;
  const SIDEBAR_SCROLL_HEIGHT = 'calc(100vh - 120px)';
  const zipcode = currentUser?.zipcode
  // ── Profile completion modal ──
  // Shows once per page-load whenever the user's profile is under 100%.
  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const hasCheckedProfileGateRef = useRef(false);

  useEffect(() => {
    // Only decide ONCE, and only after currentUser has actually finished
    // loading. `completion` is 0 (a valid number) for a brief moment while
    // the user context is still fetching, so checking `typeof completion
    // === "number"` alone fires too early and causes the modal to flash
    // open and then immediately close once the real completion (100) comes in.
    if (hasCheckedProfileGateRef.current) return;
    if (currentUser && currentUser._id && typeof completion === "number") {
      hasCheckedProfileGateRef.current = true;
      setProfileGateOpen(completion !== 100);
    }
  }, [currentUser, completion]);

  const handleCloseProfileGate = () => {
    setProfileGateOpen(false);
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditDescription(post.description);
    setPreviewImage(post.postImage);

    setOriginalDescription(post.description);
    setOriginalImage(post.postImage);

    setEditImage(null);
    setEditOpen(true);
  };
  const handleUpdate = async () => {
    try {
      setImagePostLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("description", editDescription);

      if (editImage) {
        formData.append("postImage", editImage);
      }

      const res = await axios.put(
        `${Api}/community/${selectedPost._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCommunityPosts((prev) =>

        prev.map((post) =>
          post._id === selectedPost._id
            ? {
              ...post,
              description: res.data.data.description,
              postImage: res.data.data.postImage,
            }
            : post
        )
      );

      toast.success(res.data.message, toasts);

      setEditOpen(false);
      setSelectedPost(null);
      setEditImage(null);
      setImagePostLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post", toasts);
    } finally {
      setImagePostLoading(false);
    }
  };

  const handleReset = () => {
    setEditDescription(originalDescription);

    setEditImage(null);               // remove selected File
    setPreviewImage(originalImage);   // restore original image URL
  };

  const handleCreatePost = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("description", post);
      formData.append("authorId", user?.id);
      formData.append("name", "Daniel Arun");
      formData.append("city", "Saathi Community");
      formData.append("time", "Just now");
      formData.append("initials", "DA");
      formData.append("verified", true);
      if (media) formData.append("postImage", media);

      await axios.post(Api + "/community/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPost("");
      setMedia(null);
      setPreview("");
      toast.success("Posted!...", toasts);
    } catch (error) {
      console.log(error);
      // toast.error(error.message, {
      //   position: isMobile ? "top-center" : "top-right",
      // });
      toast.error(error.message, toasts);

    } finally {
      setLoading(false);
      getCommmunityPost();
    }
  };



  useEffect(() => {
    getCommmunityPost();
  }, []);


  const formattedDateTime = (createdAt) =>
    new Date(createdAt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });

  const addLike = async (id) => {
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post._id === id
          ? {
            ...post,
            isLiked: true,
            likes: (post.likes || 0) + 1,
          }
          : post
      )
    );
    try {
      const res = await axios.post(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) {
      console.error(error);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
              ...post,
              isLiked: false,
              likes: (post.likes || 1) - 1,
            }
            : post
        )
      );
    }
  };
  const handleDelete = async (postId) => {

    try {

      setImagePostLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.delete(`${Api}/community/${postId}`, {
        data: {
          userId: user.id,
        },
      });

      setCommunityPosts((prev) =>
        prev.filter((post) => post._id !== postId)
      );

      toast.success(res.data.message, toasts);


    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete post", toasts);
    } finally {
      setImagePostLoading(false);
    }
  };
  const removeLike = async (id) => {
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post._id === id
          ? {
            ...post,
            isLiked: false,
            likes: Math.max((post.likes || 1) - 1, 0),
          }
          : post
      )
    );
    try {
      const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) {
      console.error(error);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
              ...post,
              isLiked: true,
              likes: (post.likes || 0) + 1,
            }
            : post
        )
      );
    }
  };


  return (
    <>
    
      <PageLayout>
        {/* Page header */}
        <Typography variant="h5" fontWeight={800} sx={{ mb: { xs: 0.5, sm: 0.5 }, fontSize: { xs: "1rem", sm: "1.2rem", md: "1.35rem", lg: "1.5rem" } }}>
          Saathi <span style={{ color: '#E8650A' }}>Community</span>
        </Typography>
        <Typography color="text.secondary" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1.05rem", lg: "1.2rem" } }}>
          Built on trust, referrals, and shared roots
        </Typography>

        {/* Main layout: Community box + SidebarContent box, single flex row, gap 2, responsive */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            // gap: 1,
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: "1200px"
          }}
        >

          {/* ── Community feed box ── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: '100%',
            }}
          >

            <Box
              sx={{
                p: { xs: 1, sm: 1.5, md: 2 },
                borderRadius: 3,
                border: CARD_BORDER,
                mb: 2,
                width: POST_BOX_WIDTH_SX,
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'flex-start' }}>
                <UserAvatar
                  size={avatarSize}
                  verified
                  currentUser={currentUser}
                />

                <Tooltip
                  title="Complete your profile to 100% before creating a post."
                  arrow
                  open={!isProfileComplete && tooltipOpen}
                  onClose={() => setTooltipOpen(false)}
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: {
                          xs: "10px",
                          sm: "12px",
                          md: "13px",
                        },
                        py: {
                          xs: 0.5,
                          sm: 1,
                        },
                        px: {
                          xs: 1,
                          sm: 1.5,
                        },
                        maxWidth: {
                          xs: 180,
                          sm: 250,
                        },
                        textAlign: "center",
                      },
                    },
                    arrow: {
                      sx: {
                        fontSize: {
                          xs: "0.6rem",
                          sm: "0.8rem",
                        },
                      },
                    },
                  }}
                >
                  <span
                    style={{ display: "block", width: "100%" }}
                    onClick={() => {
                      if (!isProfileComplete) {
                        setTooltipOpen(true);
                        setTimeout(() => setTooltipOpen(false), 5000);
                      }
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={5}
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      placeholder="Make a post"
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onKeyDown={() => {
                        if (!isProfileComplete) {
                          setTooltipOpen(true);
                          setTimeout(() => setTooltipOpen(false), 3000);
                        }
                      }}
                      inputProps={{
                        style: {
                          fontSize: bodyFontSize,
                          readOnly: !isProfileComplete,
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          alignItems: "flex-start",
                          fontSize: { xs: "10px", sm: "12px" },
                        },
                      }}
                    />
                  </span>
                </Tooltip>

              </Box>

              {/* Image preview */}
              {preview && (
                <Box
                  sx={{
                    mt: 2,
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                  }}
                >
                  <Box
                    component="img"
                    src={preview}
                    alt="preview"
                    sx={{
                      width: '100%',
                      maxHeight: { xs: 200, sm: 240, md: 280, lg: 300 },
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => { setMedia(null); setPreview(""); }}
                    sx={{
                      position: 'absolute', top: 8, right: 8,
                      minWidth: 0, bgcolor: '#fff', borderRadius: '50%',
                      width: isMobile ? 28 : 34, height: isMobile ? 28 : 34,
                    }}
                  >
                    <CloseIcon fontSize={iconFontSize} />
                  </Button>
                </Box>
              )}

              <Divider sx={{ my: 1.5 }} />

              <Stack direction="row" alignItems="center" justifyContent="space-between">

                <Box component="span">
                  <Tooltip
                    title="Complete your profile to 100% before creating a post."
                    arrow
                    open={!isProfileComplete && tooltip2Open}
                    onClose={() => setTooltip2Open(false)}
                    slotProps={{
                      tooltip: {
                        sx: {
                          fontSize: {
                            xs: "10px",
                            sm: "12px",
                            md: "13px",
                          },
                          py: {
                            xs: 0.5,
                            sm: 1,
                          },
                          px: {
                            xs: 1,
                            sm: 1.5,
                          },
                          maxWidth: {
                            xs: 180,
                            sm: 250,
                          },
                          textAlign: "center",
                        },
                      },
                      arrow: {
                        sx: {
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.8rem",
                          },
                        },
                      },
                    }}
                  >
                    <span
                      style={{ display: "inline-block", width: "100%" }}
                      onClick={() => {
                        if (!isProfileComplete) {
                          setTooltip2Open(true);

                          setTimeout(() => {
                            setTooltip2Open(false);
                          }, 5000);
                        }
                      }}
                    >
                      <Button
                        onClick={() => {
                          if (isProfileComplete) {
                            // setOpenMediaDialog((prev) => !prev);
                            isDesktop
                              ? fileInputRef.current?.click()
                              : setOpenMediaDialog(true);
                          }
                        }}
                        disabled={!isProfileComplete}
                        startIcon={<PermMediaIcon fontSize={iconFontSize} />}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          textTransform: "none",
                          fontSize: btnFontSize,
                          "&.Mui-disabled": {
                            color: "#9e9e9e",
                          },
                        }}
                      >
                        Media
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          disabled={!isProfileComplete}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setMedia(file);
                            setPreview(URL.createObjectURL(file));
                            e.target.value = "";
                          }}
                        />
                      </Button>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleMediaSelect}
                      />

                    </span>
                  </Tooltip>


                  {openMediaDialog && (
                    <>
                      <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
                        <Button
                          startIcon={<CameraAltIcon />}
                          onClick={() => cameraInputRef.current?.click()}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            textTransform: "none",
                            fontSize: { xs: "9px", sm: "10px" },
                            borderRadius: 5,
                            px: 1.5,
                            bgcolor: "#1976d2",
                            color: "#fff",

                            "& .MuiButton-startIcon svg": {
                              fontSize: { xs: "13px", sm: "14px" } // 14px, 16px, 18px, etc.
                            },

                            "&:hover": {
                              bgcolor: "#1565c0",
                            },
                          }}
                        >
                          {isMobile ? "Camera" : "Camera / Webcam"}
                        </Button>

                        <Button
                          // variant="contained"
                          startIcon={<FolderIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            textTransform: "none",
                            fontSize: { xs: "9px", sm: "10px" },
                            borderRadius: 5,
                            px: 1.5,
                            bgcolor: "#2e7d32",
                            color: "#fff",
                            "& .MuiButton-startIcon svg": {
                              fontSize: { xs: "13px", sm: "14px" } // 14px, 16px, 18px, etc.
                            },

                            "&:hover": {
                              bgcolor: "#1b5e20",

                            },
                          }}
                        >
                          {isMobile ? "Gallery" : "File"}
                        </Button>
                      </Stack>

                      {/* Hidden Camera Input */}
                      <input
                        ref={cameraInputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleMediaSelect}
                      />

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleMediaSelect}
                      />
                    </>
                  )}

                </Box>

                <Tooltip
                  title={
                    !isProfileComplete
                      ? "Complete your profile to 100% before creating a post."
                      : ""
                  }
                  arrow
                >
                  <Box component="span" sx={{ ml: "auto" }}>
                    <Button
                      variant="contained"
                      disabled={
                        loading ||
                        (!post.trim() && !media) ||
                        !isProfileComplete
                      }
                      onClick={handleCreatePost}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderRadius: 999,
                        textTransform: "none",
                        bgcolor: "#E8650A",
                        fontSize: btnFontSize,

                        "&:hover": {
                          bgcolor: "#c85608",
                        },

                        "&.Mui-disabled": {
                          bgcolor: "#d1d5db",
                          color: "#6b7280",
                        },
                      }}
                    >
                      {loading ? "Posting…" : "Post"}
                    </Button>
                  </Box>
                </Tooltip>
              </Stack>
            </Box>

            {/* Posts list */}
            {postLoading ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={isMobile ? 36 : 50} />
              </Box>
            ) : communityPosts.length == 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                  textAlign: "center",
                }}
              >
                <InboxOutlinedIcon
                  sx={{
                    fontSize: { xs: 40, sm: 64 },
                    color: "text.disabled",
                    mb: 2,
                  }}
                />

                <Typography variant="h6" fontWeight={600} color="text.primary">
                  No Posts Yet
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, maxWidth: 320 }}
                >
                  There are no posts to display at the moment.
                </Typography>
              </Box>
            ) : (
              communityPosts?.map((post, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    borderRadius: 3, border: CARD_BORDER, mb: 2, overflow: 'hidden',
                    width: POST_BOX_WIDTH_SX,
                    boxSizing: 'border-box',
                  }}
                >
                  <Box sx={{ p: isMobile ? 1.5 : 2 }}>
                    {/* Post header */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 1 : 1.5 }}>
                      <Avatar
                        src={post?.authorId?.profileImage}
                        alt={`${post?.authorId?.firstName || ""} ${post?.authorId?.lastName || ""}`}
                        onClick={() => {
                          setSelectedProfile(post?.authorId);
                          setProfileModalOpen(true);
                        }}
                        sx={{
                          width: avatarSize,
                          height: avatarSize,
                          bgcolor: SAFFRON,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: avatarFontSize,
                          flexShrink: 0,
                          mt: { xs: 0.4, sm: 0.5 }
                        }}
                      >
                        {!post?.authorId?.profileImage &&
                          `${post?.authorId?.firstName?.[0] || ""}${post?.authorId?.lastName?.[0] || ""
                          }`}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700}
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.92rem" } }}
                          noWrap>
                          {post?.authorId?.firstName} {post?.authorId?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize={captionSize}
                          sx={{ fontSize: { xs: "0.6rem", sm: "0.72rem" } }}>
                          {formattedDateTime(post?.createdAt)}
                        </Typography>
                      </Box>

                      {post?.authorId?._id === currentUser._id && (
                        <>
                          <IconButton onClick={(e) => handleMenuOpen(e, post)}>
                            <MoreHorizIcon
                              fontSize={iconFontSize}
                              sx={{ color: "text.secondary" }}
                            />
                          </IconButton>

                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                          >
                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                handleEdit(selectedPost);
                              }}
                            >
                              <ListItemIcon>
                                <EditIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText>Edit</ListItemText>
                            </MenuItem>

                            <MenuItem
                              onClick={() => {
                                handleMenuClose();
                                setDeleteOpen(true);
                              }}
                            >
                              <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText>Delete</ListItemText>
                            </MenuItem>
                          </Menu>
                          <Dialog
                            open={deleteOpen}
                            onClose={() => setDeleteOpen(false)}
                            fullWidth
                            maxWidth="xs"
                            PaperProps={{
                              sx: {
                                width: { xs: "95%", sm: "100%" },
                                m: { xs: 1.5, sm: 2 },
                                borderRadius: { xs: 2, sm: 3 },
                              },
                            }}
                          >
                            <DialogTitle
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontWeight: 600,
                              }}
                            >
                              <WarningAmberRoundedIcon color="error" />
                              Delete Post ?
                            </DialogTitle>

                            <DialogContent sx={{ pt: 1 }}>
                              <Typography
                                sx={{
                                  fontSize: { xs: "0.9rem", sm: "1rem" },
                                  color: "text.secondary",
                                }}
                              >
                                Are you sure you want to delete this post?
                              </Typography>
                            </DialogContent>

                            <DialogActions
                              sx={{
                                px: { xs: 2, sm: 3 },
                                pb: { xs: 2, sm: 3 },
                                gap: 1,
                              }}
                            >
                              <Button
                                variant="contained"
                                onClick={() => setDeleteOpen(false)}
                                sx={{
                                  flex: 1,
                                  py: 1,
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                  fontWeight: 600,
                                  color: "#ffff",
                                  bgcolor: "grey.700",

                                }}
                              >
                                Cancel
                              </Button>

                              <Button
                                variant="contained"
                                color="error"
                                disabled={imagePostLoading}
                                onClick={() => {
                                  const postId = selectedPost._id;
                                  handleMenuClose();
                                  handleDelete(postId);
                                  setDeleteOpen(false);
                                }}
                                sx={{
                                  flex: 1,
                                  py: 1,
                                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                                  fontWeight: 600,
                                }}
                              >
                                {imagePostLoading ? "Deleting..." : "Delete"}
                              </Button>
                            </DialogActions>
                          </Dialog>

                          {/* Edit post of Community Image */}

                          <Dialog
                            open={editOpen}
                            onClose={() => setEditOpen(false)}
                            fullWidth
                            maxWidth="sm"
                            // fullScreen// pass in `useMediaQuery(theme.breakpoints.down('sm'))`
                            PaperProps={{
                              sx: {
                                borderRadius: { xs: 0, sm: 3 },
                                m: { xs: 0, sm: 2 },
                              },
                            }}
                          >
                            {/* Dialog Header */}
                            <DialogTitle
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontWeight: 600,
                                fontSize: { xs: "1rem", sm: "1.15rem" },
                                py: 1.5,
                                px: 2,
                              }}
                            >
                              Edit Post

                              <IconButton
                                onClick={() => setEditOpen(false)}
                                size="small"
                                sx={{
                                  color: "#666",
                                  "&:hover": { bgcolor: "#f5f5f5" },
                                }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </DialogTitle>

                            {/* Dialog Content */}
                            <DialogContent dividers sx={{ px: { xs: 1.5, sm: 3 }, py: 2 }}>
                              <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                margin="dense"
                                size="small"
                                label="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              />

                              <Box sx={{ mt: 2 }}>

                                {previewImage && (
                                  <Box
                                    component="img"
                                    src={editImage ? URL.createObjectURL(editImage) : previewImage}
                                    alt="Preview"
                                    sx={{
                                      width: "100%",
                                      height: { xs: 160, sm: 220, md: 280 },
                                      objectFit: "contain",
                                      borderRadius: 2,
                                      // border: "1px solid #eee",
                                      mb: 1.5,
                                    }}
                                  />
                                )}

                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={openImageMenu}
                                  sx={{
                                    width: "fit-content", // or "auto"
                                    minWidth: "unset",    // optional: removes MUI's default minimum width
                                    height: 36,
                                    bgcolor: "#FF9933",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 2, // horizontal padding
                                    "&:hover": {
                                      bgcolor: "#E68A00",
                                    },
                                  }}
                                >
                                  {!previewImage ? "Add Image" : "Change Image"}
                                </Button>


                                {/* Image Menu */}
                                <Menu
                                  anchorEl={imageMenuAnchor}
                                  open={isImageMenuOpen}
                                  onClose={closeImageMenu}
                                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                                  transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                                >
                                  <MenuItem component="label" dense >
                                    <ListItemIcon>
                                      <CameraAltIcon fontSize="small" sx={{ color: "#FF9933" }} />
                                    </ListItemIcon>
                                    <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>
                                      Camera
                                    </ListItemText>
                                    <input
                                      hidden
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={onImageSelected}
                                    />
                                  </MenuItem>

                                  <MenuItem component="label" dense>
                                    <ListItemIcon>
                                      <InsertDriveFileIcon fontSize="small" sx={{ color: "#FF9933" }} />
                                    </ListItemIcon>
                                    <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>
                                      Gallery
                                    </ListItemText>
                                    <input
                                      hidden
                                      type="file"
                                      accept="image/*"
                                      onChange={onImageSelected}
                                    />
                                  </MenuItem>
                                </Menu>
                              </Box>
                            </DialogContent>

                            {/* Dialog Footer */}
                            <DialogActions
                              sx={{
                                p: { xs: 1.5, sm: 2 },
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 1,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                justifyContent="flex-end"
                                sx={{ pt: 2 }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={handleReset}
                                  sx={{
                                    width: "fit-content",
                                    minWidth: "unset",
                                    px: 2,
                                    height: 36,
                                    backgroundColor: "#838282",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    textTransform: "none",
                                    borderRadius: 2,
                                  }}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  variant="contained"
                                  size="small"
                                  disabled={imagePostLoading}
                                  onClick={handleUpdate}
                                  sx={{
                                    width: "fit-content",
                                    minWidth: "unset",
                                    px: 2,
                                    height: 36,
                                    bgcolor: "#FF9933",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "0.8rem",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    "&:hover": {
                                      bgcolor: "#E68A00",
                                    },
                                  }}
                                >
                                  {imagePostLoading ? "Saving..." : "Save"}
                                </Button>
                              </Stack>
                            </DialogActions>
                          </Dialog>


                          {editImage && (
                            <img
                              src={URL.createObjectURL(editImage)}
                              alt="Preview"
                              width={150}
                              style={{ marginTop: 10, borderRadius: 8 }}
                            />
                          )}
                        </>
                      )}

                    </Box>

                    {/* Post body */}
                    <Typography sx={{ mt: 1.5, fontSize: bodyFontSize, lineHeight: 1.6 }}>
                      {post.description}
                    </Typography>
                  </Box>

                  {/* Post image */}
                  {post.postImage && <CommunityImage src={post.postImage} />}

                  < Divider />

                  {/* Action buttons */}
                  < Stack
                    direction="row"
                    sx={{
                      py: isMobile ? 0.25 : 0.5,
                      px: isMobile ? 0.5 : 2,
                      gap: isMobile ? 0 : 5,
                      // justifyContent: isMobile ? 'space-around' : 'flex-start',
                      justifyContent: 'space-around',
                    }}
                  >
                    <Button
                      onClick={() => post.isLiked ? removeLike(post._id) : addLike(post._id)}
                      startIcon={
                        post.isLiked
                          ? <ThumbUpIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
                          : <ThumbUpOffAltIcon fontSize={iconFontSize} />
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                    >
                      {post?.likes || 0}
                    </Button>

                    <Button
                      startIcon={
                        activeCommentPostId === post._id
                          ? <ChatIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
                          : <ChatIcon fontSize={iconFontSize} />
                      }
                      onClick={() => {
                        const next = activeCommentPostId === post._id ? null : post._id;
                        setActiveCommentPostId(next);
                        if (next) getComments(next);
                      }}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                    >
                      {commentCounts[post._id] ?? 0}

                    </Button>

                    <Button
                      onClick={() => {
                        isPostSaved(post._id)
                          ? removeSavedPost(post._id)
                          : savePost(post);
                      }}
                      startIcon={
                        isPostSaved(post._id)
                          ? <BookmarkBorderIcon sx={{ color: "#0084ff" }} fontSize={iconFontSize} />
                          : <BookmarkBorderIcon fontSize={iconFontSize} />
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        textTransform: 'none',
                        color: isPostSaved(post._id) ? '#0084ff' : 'text.secondary',
                        fontSize: btnFontSize
                      }}
                    >
                      {isPostSaved(post._id) ? "Saved" : "Save"}
                    </Button>
                  </Stack>

                  <Divider />

                  {activeCommentPostId === post._id && (
                    <Box sx={{ margin: isMobile ? 1 : 1.5 }}>
                      <CommunityComments
                        post={post}
                        user={user}
                        onCommentsChanged={(newCount) =>
                          setCommentCounts((prev) => ({ ...prev, [post._id]: newCount }))
                        }
                      />
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Box>

          <ProfileModal
            open={profileModalOpen}
            selectedProfile={selectedProfile}
            onClose={() => {
              setProfileModalOpen(false);
            }}
          />

          {/* SidebarContent */}
          {showSidebar && (
            <Box
              sx={{
                flex: {
                  sm: "0 0 300px",
                  md: "0 0 340px",
                  lg: "0 0 360px",
                  xl: "0 0 380px",
                },
                width: "100%",
                maxWidth: {
                  sm: 300,
                  md: 340,
                  lg: 360,
                  xl: 380,
                },
                minWidth: {
                  sm: 260,
                  md: 280,
                  lg: 300,
                },
                flexShrink: 0,

                position: "sticky",
                top: 20,
                height: SIDEBAR_SCROLL_HEIGHT,
                maxHeight: SIDEBAR_SCROLL_HEIGHT,

                overflowY: "auto",
                overflowX: "hidden",

                "&::-webkit-scrollbar": {
                  width: 1,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E0D4C8",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#D4C4B4",
                },
                scrollbarWidth: "thin",
                scrollbarColor: "#E0D4C8 transparent",
              }}
            >
              <Discover />
            </Box>
          )}
        </Box >
      </PageLayout >
    </>


  );
}
