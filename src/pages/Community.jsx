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
import ShareIcon from '@mui/icons-material/Share';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import CloseIcon from '@mui/icons-material/Close';
import Api from '../Api.jsx';
import axios from 'axios';

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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


  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleMediaClick = () => {
    if (!isProfileComplete) return;

    if (isMobile) {
      setOpenMediaDialog(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  //Edit Community Post Image

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
  const isTablet = tier === 'sm' || tier === 'md'; // tablets / small laptops
  const isDesktop = tier === 'lg' || tier === 'xl'; // laptops and up

  const showSidebar = !isMobile;

  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const POST_BOX_WIDTH_SX = { xs: '100%', sm: '100%', md: '560px', lg: '600px', xl: '640px' };

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
  const { completion } = useUser();

  const isProfileComplete = completion === 100;
  const SIDEBAR_SCROLL_HEIGHT = 'calc(100vh - 130px)';
  const handleEdit = (post) => {
    setSelectedPost(post);
    setEditDescription(post.description);
    setPreviewImage(post.postImage);
    setEditImage(null);
    setEditOpen(true);
  };
  const handleUpdate = async () => {
    try {
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

      toast.success(res.data.message, {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });

      setEditOpen(false);
      setSelectedPost(null);
      setEditImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });
    }
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
      toast.success("Posted!...", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });
    } catch (error) {
      console.log(error);
      // toast.error(error.message, {
      //   position: isMobile ? "top-center" : "top-right",
      // });
      toast.error(error.message, {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });

    } finally {
      setLoading(false);
      getCommmunityPost();
    }
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
      const postIds = postsRes.data.data.map((item) => item._id

      )
      setCommunityPosts(updatedPosts);
      setPostId(postIds)

    } catch (error) {
      console.error(error.message);
    } finally {
      setPostLoading(false);
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
    try {
      const res = await axios.post(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) { }
  };
  const handleDelete = async (postId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.delete(`${Api}/community/${postId}`, {
        data: {
          userId: user.id,
        },
      });

      setCommunityPosts((prev) =>
        prev.filter((post) => post._id !== postId)
      );

      toast.success(res.data.message, {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete post", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });
    }
  };
  const removeLike = async (id) => {
    try {
      const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
            : post
        )
      );
    } catch (error) { }
  };

  // ── Discover data ──────────────────────────────────────────────────────────────
  const topMembers = [
    { name: "Vijay Patel", initials: "VP", rides: 67, city: "Frisco", badge: "🏅 Founding member", verified: true },
    { name: "Deepa Iyer", initials: "DI", rides: 42, city: "Plano", badge: "⭐ Community elder", verified: true },
    { name: "Rahul Sharma", initials: "RS", rides: 34, city: "Dallas", badge: null, verified: true },
    { name: "Ananya Krishnan", initials: "AK", rides: 18, city: "Houston", badge: null, verified: true },
    { name: "Sunita Mehta", initials: "SM", rides: 12, city: "Chicago", badge: null, verified: false },
  ];

  const activities = [
    { text: "Vijay P. gave a free temple ride to 4 members", time: "2h ago", icon: "🛕" },
    { text: "Deepa I. helped Neel K.'s parents from the airport", time: "5h ago", icon: "✈️" },
    { text: "Rahul S. completed his 34th community ride!", time: "1d ago", icon: "🎉" },
    { text: "3 new members joined from Houston", time: "2d ago", icon: "👋" },
    { text: "Sunita M. got 5 ride offers for her family trip", time: "3d ago", icon: "🙏" },
  ];

  // ── Small avatar used in the leaderboard ─────────────────────────────────────
  const LeaderAvatar = ({ initials, verified }) => (
    <Box sx={{
      width: 36, height: 36, borderRadius: '50%', background: '#FFE8D6',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 13, position: 'relative', flexShrink: 0
    }}>
      {initials}
      {verified && (
        <Box sx={{
          position: 'absolute', right: -2, bottom: -2, background: '#2196f3',
          color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ✓
        </Box>
      )}
    </Box>
  );

  // ── Sidebar content extracted for reuse ──────────────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ width: '100%' }}>
      {/* Top Members */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <EmojiEventsIcon sx={{ color: '#F4A261', fontSize: 20 }} />
          <Typography fontWeight={700} fontSize="0.9rem">Top Community Members</Typography>
        </Box>

        {topMembers.map((member, index) => (
          <Box key={member.name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1 }}>
              <Typography sx={{ width: 18, fontWeight: 800, color: 'text.secondary', fontSize: 12 }}>
                {index + 1}
              </Typography>
              <LeaderAvatar initials={member.initials} verified={member.verified} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} fontSize="0.8rem" noWrap>{member.name}</Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                  {member.city}
                </Typography>
                {member.badge && (
                  <Typography variant="caption" sx={{
                    display: 'block', color: '#E8650A',
                    fontWeight: 600, fontSize: '0.65rem'
                  }}>
                    {member.badge}
                  </Typography>
                )}
              </Box>
              <Box textAlign="right" sx={{ flexShrink: 0 }}>
                <Typography fontWeight={700} color="primary.main" fontSize={13}>
                  {member.rides}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                  rides
                </Typography>
              </Box>
            </Box>
            {index !== topMembers.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      {/* Recent Activity */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
        <Typography fontWeight={700} fontSize="0.9rem" mb={1.5} sx={{ mb: 2 }}>Recent Activity</Typography>
        {activities.map((a, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.2 }}>
            <Typography fontSize={16}>{a.icon}</Typography>
            <Box>
              <Typography variant="body2" fontSize="0.78rem">{a.text}</Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{a.time}</Typography>
            </Box>
          </Box>
        ))}
      </Paper>

      {/* Invite */}
      <Paper elevation={0} sx={{
        p: 2, borderRadius: 3,
        background: 'linear-gradient(135deg, #E8650A, #FF8C42)', color: '#fff'
      }}>
        <Typography fontWeight={800} mb={0.5} fontSize="0.9rem">Invite a friend 🙏</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.78rem' }}>
          Saathi grows through trust. Invite someone from your community to join.
        </Typography>
        <Button size="small" variant="contained"
          sx={{
            background: '#fff', color: '#E8650A', fontWeight: 700,
            '&:hover': { background: '#FFF8F2' }, fontSize: '0.75rem'
          }}>
          Share invite link
        </Button>
      </Paper>
    </Box>
  );

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
            gap: 2,
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
                            setOpenMediaDialog((prev) => !prev);
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
                      </Button>
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
                        {!currentUser?.profileImage &&
                          `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700}
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.92rem" } }}
                          noWrap>
                          {post?.authorId?.firstName} {post?.authorId?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize={captionSize}
                          sx={{ fontSize: { xs: "0.6rem", sm: "0.72rem" } }}>
                          {'tvm'} | {formattedDateTime(post?.createdAt)}
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
                            maxWidth="xs"
                            fullWidth
                          >
                            <DialogTitle>Delete Post</DialogTitle>

                            <DialogContent>
                              <Typography>
                                Are you sure you want to delete this post?
                              </Typography>
                            </DialogContent>

                            <DialogActions sx={{ px: 3, pb: 2 }}>
                              <Button
                                variant="contained"
                                onClick={() => setDeleteOpen(false)}
                                sx={{
                                  bgcolor: "grey.500",
                                  color: "#fff",
                                  "&:hover": {
                                    bgcolor: "grey.700",
                                  },
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                  const postId = selectedPost._id;
                                  handleMenuClose();
                                  handleDelete(postId);
                                  setDeleteOpen(false);
                                }}
                              >
                                Delete
                              </Button>
                            </DialogActions>
                          </Dialog>
                          <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                            <DialogTitle>Edit Post</DialogTitle>

                            <DialogContent dividers>
                              <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                margin="dense"
                                label="Description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                              />

                              <Box sx={{ mt: 2 }}>
                                <img
                                  src={editImage ? URL.createObjectURL(editImage) : previewImage}
                                  alt="Post"
                                  style={{
                                    width: "100%",
                                    maxHeight: "250px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    marginBottom: "16px",
                                  }}
                                />

                                <Button
                                  variant="contained"
                                  fullWidth
                                  onClick={openImageMenu}
                                  sx={{
                                    bgcolor: "#FF9933",
                                    color: "#fff",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    "&:hover": { bgcolor: "#e68a00" },
                                  }}
                                >
                                  Change Image
                                </Button>

                                <Menu
                                  anchorEl={imageMenuAnchor}
                                  open={isImageMenuOpen}
                                  onClose={closeImageMenu}
                                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                                  transformOrigin={{ vertical: "top", horizontal: "center" }}
                                >
                                  <MenuItem component="label">
                                    <ListItemIcon>
                                      <CameraAltIcon fontSize="small" sx={{ color: "#FF9933" }} />
                                    </ListItemIcon>
                                    <ListItemText>Camera</ListItemText>
                                    <input
                                      hidden
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={onImageSelected}
                                    />
                                  </MenuItem>

                                  <MenuItem component="label">
                                    <ListItemIcon>
                                      <InsertDriveFileIcon fontSize="small" sx={{ color: "#FF9933" }} />
                                    </ListItemIcon>
                                    <ListItemText>File</ListItemText>
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

                            <DialogActions
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                gap: 1,
                                p: 2,
                                "& > button": { flex: { xs: "1 1 auto", sm: "0 1 auto" } },
                              }}
                            >
                              <Button
                                onClick={() => setEditOpen(false)}
                                variant="contained"
                                fullWidth
                                sx={{ bgcolor: "#9E9E9E", color: "#fff", "&:hover": { bgcolor: "#757575" } }}
                              >
                                Cancel
                              </Button>

                              <Button
                                variant="contained"
                                onClick={handleUpdate}
                                fullWidth
                                sx={{ bgcolor: "#FF9933", "&:hover": { bgcolor: "#e68a00" } }}
                              >
                                Save
                              </Button>
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

                  <Divider />

                  {/* Action buttons */}
                  <Stack
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
                      onClick={() =>
                        setActiveCommentPostId((prev) => prev === post._id ? null : post._id)
                      }
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                    >
                      Comments
                    </Button>

                    <Button
                      startIcon={<ShareIcon fontSize={iconFontSize} />}
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
                    >
                      Share
                    </Button>
                  </Stack>

                  <Divider />

                  {activeCommentPostId === post._id && (
                    <Box sx={{ margin: isMobile ? 1 : 1.5 }}>
                      <CommunityComments post={post} user={user} />
                    </Box>
                  )}
                </Paper>
              ))
            )}
          </Box>

          {/* ── SidebarContent box (visible on sm and up, sticky scroll) ── */}
          {showSidebar && (
            <Box
              sx={{
                width: { sm: '200px', md: '260px', lg: '300px', xl: '320px' },
                minWidth: { sm: '200px', md: '260px', lg: '300px', xl: '320px' },
                flexShrink: 0,
                position: 'sticky',
                top: 20,
                height: SIDEBAR_SCROLL_HEIGHT,
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': { width: 3 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#E0D4C8', borderRadius: 4 },
              }}
            >
              <SidebarContent />
            </Box>
          )}
        </Box>
      </PageLayout>
    </>


  );
}


// import React, { useEffect, useState, useRef } from 'react';
// import {
//   Box, Typography, Grid, Paper, Chip, Avatar, Button,
//   Divider, Stack, LinearProgress,
//   TextField,
//   CircularProgress,
//   Tooltip,
//   useTheme,
//   IconButton,
//   useMediaQuery
// } from '@mui/material';
// import GroupsIcon from '@mui/icons-material/Groups';
// import StarIcon from '@mui/icons-material/Star';
// import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import UserAvatar from '../components/UserAvatar.jsx';
// import PageLayout from '../components/PageLayout.jsx';
// import ChatIcon from '@mui/icons-material/Chat';
// import ShareIcon from '@mui/icons-material/Share';
// import PermMediaIcon from '@mui/icons-material/PermMedia';
// import CloseIcon from '@mui/icons-material/Close';
// import Api from '../Api.jsx';
// import axios from 'axios';

// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
// } from "@mui/material";
// import { toast } from 'react-toastify';
// import CommunityImage from '../components/CommunityImage.jsx';
// import CommunityComments from './CommunityComments.jsx';
// import { useUser } from '../context/userConetext.jsx';
// import CameraAltIcon from "@mui/icons-material/CameraAlt";
// import FolderIcon from "@mui/icons-material/Folder";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// const BREAKPOINTS = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 }; // MUI defaults

// function getTier(width) {
//   if (width < BREAKPOINTS.sm) return 'xs';
//   if (width < BREAKPOINTS.md) return 'sm';
//   if (width < BREAKPOINTS.lg) return 'md';
//   if (width < BREAKPOINTS.xl) return 'lg';
//   return 'xl';
// }

// function useResponsiveTier() {
//   const [tier, setTier] = useState(
//     typeof window !== 'undefined' ? getTier(window.innerWidth) : 'md'
//   );

//   useEffect(() => {
//     const handleResize = () => setTier(getTier(window.innerWidth));
//     // Run once on mount in case the initial state above was computed
//     // before layout/zoom settled.
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return tier;
// }

// export default function Community() {
//   const [post, setPost] = useState("");
//   const [media, setMedia] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [postLoading, setPostLoading] = useState(false);
//   const [communityPosts, setCommunityPosts] = useState([]);
//   const [activeCommentPostId, setActiveCommentPostId] = useState(null);
//   const user = JSON.parse(localStorage.getItem('user'));
//   const [postId, setPostId] = useState([])
//   const [editImage, setEditImage] = useState(null);
//   const [previewImage, setPreviewImage] = useState("");
//   const [openMediaDialog, setOpenMediaDialog] = useState(false);
//   const { currentUser } = useUser()
//   const [tooltipOpen, setTooltipOpen] = useState(false);
//   const [tooltip2Open, setTooltip2Open] = useState(false);


//   const theme = useTheme();
//   const isTab = useMediaQuery(theme.breakpoints.down("sm"));

//   const cameraInputRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const handleMediaClick = () => {
//     if (!isProfileComplete) return;

//     if (isMobile) {
//       setOpenMediaDialog(true);
//     } else {
//       fileInputRef.current?.click();
//     }
//   };

//   //Edit Community Post Image

//   // inside your component:
//   const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
//   const isImageMenuOpen = Boolean(imageMenuAnchor);

//   const openImageMenu = (e) => setImageMenuAnchor(e.currentTarget);
//   const closeImageMenu = () => setImageMenuAnchor(null);

//   const onImageSelected = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       setEditImage(selectedFile);
//       setPreviewImage(URL.createObjectURL(selectedFile));
//     }
//     closeImageMenu();
//     e.target.value = null; // allow re-selecting same file next time
//   };


//   const tier = useResponsiveTier();
//   const isMobile = tier === 'xs';                 // phones
//   const isTablet = tier === 'sm' || tier === 'md'; // tablets / small laptops
//   const isDesktop = tier === 'lg' || tier === 'xl'; // laptops and up

//   const showSidebar = !isMobile;

//   const SAFFRON = "#E8650A";
//   const CARD_BORDER = "1px solid #F0E6DC";

//   const POST_BOX_WIDTH_SX = { xs: '100%', sm: '100%', md: '560px', lg: '600px', xl: '640px' };

//   const avatarSize = isMobile ? 30 : isTablet ? 33 : 35;
//   const iconFontSize = isMobile ? 'small' : 'medium';
//   const btnFontSize = isMobile ? '0.5rem' : isTablet ? '0.65rem' : '0.7rem';
//   const bodyFontSize = isMobile ? '0.7rem' : isTablet ? '0.76rem' : '0.8rem';
//   const captionSize = isMobile ? '0.6rem' : '0.6rem';
//   const avatarFontSize = isMobile ? '0.6rem' : isTablet ? '0.9rem' : '1.1rem';
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [selectedPost, setSelectedPost] = useState(null);

//   const handleMenuOpen = (event, post) => {
//     setAnchorEl(event.currentTarget);
//     setSelectedPost(post);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleMediaSelect = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setMedia(file);

//     setPreview(URL.createObjectURL(file));
//     e.target.value = "";

//     setOpenMediaDialog(false);
//   };

//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [editOpen, setEditOpen] = useState(false);
//   const [editDescription, setEditDescription] = useState("");
//   const { completion } = useUser();

//   const isProfileComplete = completion === 100;
//   const SIDEBAR_SCROLL_HEIGHT = 'calc(100vh - 130px)';
//   const handleEdit = (post) => {
//     setSelectedPost(post);
//     setEditDescription(post.description);
//     setPreviewImage(post.postImage);
//     setEditImage(null);
//     setEditOpen(true);
//   };
//   const handleUpdate = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));

//       const formData = new FormData();
//       formData.append("userId", user.id);
//       formData.append("description", editDescription);

//       if (editImage) {
//         formData.append("postImage", editImage);
//       }

//       const res = await axios.put(
//         `${Api}/community/${selectedPost._id}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setCommunityPosts((prev) =>
//         prev.map((post) =>
//           post._id === selectedPost._id
//             ? {
//               ...post,
//               description: res.data.data.description,
//               postImage: res.data.data.postImage,
//             }
//             : post
//         )
//       );

//       toast.success(res.data.message, {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "90vw" : "360px",
//           maxWidth: isTab ? "320px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//           margin: "0 auto",
//         },
//       });

//       setEditOpen(false);
//       setSelectedPost(null);
//       setEditImage(null);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to update post", {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "90vw" : "360px",
//           maxWidth: isTab ? "320px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//           margin: "0 auto",
//         },
//       });
//     }
//   };
//   const handleCreatePost = async () => {
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("description", post);
//       formData.append("authorId", user?.id);
//       formData.append("name", "Daniel Arun");
//       formData.append("city", "Saathi Community");
//       formData.append("time", "Just now");
//       formData.append("initials", "DA");
//       formData.append("verified", true);
//       if (media) formData.append("postImage", media);

//       await axios.post(Api + "/community/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setPost("");
//       setMedia(null);
//       setPreview("");
//       toast.success("Posted!...", {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 3000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "280px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//         },
//       });
//     } catch (error) {
//       console.log(error);
//       // toast.error(error.message, {
//       //   position: isMobile ? "top-center" : "top-right",
//       // });
//       toast.error(error.message, {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 3000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "280px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//         },
//       });

//     } finally {
//       setLoading(false);
//       getCommmunityPost();
//     }
//   };

//   const getCommmunityPost = async () => {
//     try {
//       setPostLoading(true);
//       const postsRes = await axios.get(Api + "/community/");
//       const likesRes = await axios.get(Api + `/likes/liked-posts/${user.id}`);
//       const likedPostIds = likesRes?.data?.data || [];
//       const updatedPosts = postsRes?.data?.data?.map((post) => ({
//         ...post,
//         isLiked: likedPostIds.includes(post._id),
//       }));
//       const postIds = postsRes.data.data.map((item) => item._id

//       )
//       setCommunityPosts(updatedPosts);
//       setPostId(postIds)

//     } catch (error) {
//       console.error(error.message);
//     } finally {
//       setPostLoading(false);
//     }
//   };

//   useEffect(() => {
//     getCommmunityPost();
//   }, []);


//   const formattedDateTime = (createdAt) =>
//     new Date(createdAt).toLocaleString("en-IN", {
//       day: "numeric", month: "short", year: "numeric",
//       hour: "numeric", minute: "2-digit",
//     });

//   const addLike = async (id) => {
//     try {
//       const res = await axios.post(Api + `/likes/${id}/${user.id}`);
//       setCommunityPosts((prev) =>
//         prev.map((post) =>
//           post._id === id
//             ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
//             : post
//         )
//       );
//     } catch (error) { }
//   };
//   const handleDelete = async (postId) => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));

//       const res = await axios.delete(`${Api}/community/${postId}`, {
//         data: {
//           userId: user.id,
//         },
//       });

//       setCommunityPosts((prev) =>
//         prev.filter((post) => post._id !== postId)
//       );

//       toast.success(res.data.message, {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "90vw" : "360px",
//           maxWidth: isTab ? "320px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//           margin: "0 auto",
//         },
//       });
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Failed to delete post", {
//         position: isTab ? "top-center" : "top-right",
//         autoClose: 3000,
//         hideProgressBar: true,
//         closeButton: false,
//         style: {
//           width: isTab ? "280px" : "360px",
//           fontSize: isTab ? "13px" : "15px",
//           padding: isTab ? "8px 12px" : "12px 16px",
//           borderRadius: isTab ? "8px" : "10px",
//           minHeight: isTab ? "42px" : "52px",
//         },
//       });
//     }
//   };
//   const removeLike = async (id) => {
//     try {
//       const res = await axios.delete(Api + `/likes/${id}/${user.id}`);
//       setCommunityPosts((prev) =>
//         prev.map((post) =>
//           post._id === id
//             ? { ...post, isLiked: res.data.isLiked, likes: res.data.likesCount }
//             : post
//         )
//       );
//     } catch (error) { }
//   };

//   // ── Discover data ──────────────────────────────────────────────────────────────
//   const topMembers = [
//     { name: "Vijay Patel", initials: "VP", rides: 67, city: "Frisco", badge: "🏅 Founding member", verified: true },
//     { name: "Deepa Iyer", initials: "DI", rides: 42, city: "Plano", badge: "⭐ Community elder", verified: true },
//     { name: "Rahul Sharma", initials: "RS", rides: 34, city: "Dallas", badge: null, verified: true },
//     { name: "Ananya Krishnan", initials: "AK", rides: 18, city: "Houston", badge: null, verified: true },
//     { name: "Sunita Mehta", initials: "SM", rides: 12, city: "Chicago", badge: null, verified: false },
//   ];

//   const activities = [
//     { text: "Vijay P. gave a free temple ride to 4 members", time: "2h ago", icon: "🛕" },
//     { text: "Deepa I. helped Neel K.'s parents from the airport", time: "5h ago", icon: "✈️" },
//     { text: "Rahul S. completed his 34th community ride!", time: "1d ago", icon: "🎉" },
//     { text: "3 new members joined from Houston", time: "2d ago", icon: "👋" },
//     { text: "Sunita M. got 5 ride offers for her family trip", time: "3d ago", icon: "🙏" },
//   ];

//   // ── Small avatar used in the leaderboard ─────────────────────────────────────
//   const LeaderAvatar = ({ initials, verified }) => (
//     <Box sx={{
//       width: 36, height: 36, borderRadius: '50%', background: '#FFE8D6',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       fontWeight: 800, fontSize: 13, position: 'relative', flexShrink: 0
//     }}>
//       {initials}
//       {verified && (
//         <Box sx={{
//           position: 'absolute', right: -2, bottom: -2, background: '#2196f3',
//           color: '#fff', borderRadius: '50%', width: 13, height: 13, fontSize: 9,
//           display: 'flex', alignItems: 'center', justifyContent: 'center'
//         }}>
//           ✓
//         </Box>
//       )}
//     </Box>
//   );

//   // ── Sidebar content extracted for reuse ──────────────────────────────────────
//   const SidebarContent = () => (
//     <Box sx={{ width: '100%' }}>
//       {/* Top Members */}
//       <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
//           <EmojiEventsIcon sx={{ color: '#F4A261', fontSize: 20 }} />
//           <Typography fontWeight={700} fontSize="0.9rem">Top Community Members</Typography>
//         </Box>

//         {topMembers.map((member, index) => (
//           <Box key={member.name}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1 }}>
//               <Typography sx={{ width: 18, fontWeight: 800, color: 'text.secondary', fontSize: 12 }}>
//                 {index + 1}
//               </Typography>
//               <LeaderAvatar initials={member.initials} verified={member.verified} />
//               <Box sx={{ flex: 1, minWidth: 0 }}>
//                 <Typography fontWeight={600} fontSize="0.8rem" noWrap>{member.name}</Typography>
//                 <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
//                   {member.city}
//                 </Typography>
//                 {member.badge && (
//                   <Typography variant="caption" sx={{
//                     display: 'block', color: '#E8650A',
//                     fontWeight: 600, fontSize: '0.65rem'
//                   }}>
//                     {member.badge}
//                   </Typography>
//                 )}
//               </Box>
//               <Box textAlign="right" sx={{ flexShrink: 0 }}>
//                 <Typography fontWeight={700} color="primary.main" fontSize={13}>
//                   {member.rides}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
//                   rides
//                 </Typography>
//               </Box>
//             </Box>
//             {index !== topMembers.length - 1 && <Divider />}
//           </Box>
//         ))}
//       </Paper>

//       {/* Recent Activity */}
//       <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #F0E6DC', mb: 2 }}>
//         <Typography fontWeight={700} fontSize="0.9rem" mb={1.5} sx={{ mb: 2 }}>Recent Activity</Typography>
//         {activities.map((a, i) => (
//           <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.2 }}>
//             <Typography fontSize={16}>{a.icon}</Typography>
//             <Box>
//               <Typography variant="body2" fontSize="0.78rem">{a.text}</Typography>
//               <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{a.time}</Typography>
//             </Box>
//           </Box>
//         ))}
//       </Paper>

//       {/* Invite */}
//       <Paper elevation={0} sx={{
//         p: 2, borderRadius: 3,
//         background: 'linear-gradient(135deg, #E8650A, #FF8C42)', color: '#fff'
//       }}>
//         <Typography fontWeight={800} mb={0.5} fontSize="0.9rem">Invite a friend 🙏</Typography>
//         <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5, fontSize: '0.78rem' }}>
//           Saathi grows through trust. Invite someone from your community to join.
//         </Typography>
//         <Button size="small" variant="contained"
//           sx={{
//             background: '#fff', color: '#E8650A', fontWeight: 700,
//             '&:hover': { background: '#FFF8F2' }, fontSize: '0.75rem'
//           }}>
//           Share invite link
//         </Button>
//       </Paper>
//     </Box>
//   );

//   return (
//     <>
//       <Box sx={{
//         display: "flex",
//         gap: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
//       }}>
//         <PageLayout>
//           {/* Page header */}
//           <Typography variant="h5" fontWeight={800} sx={{ mb: { xs: 0.5, sm: 0.5 }, fontSize: { xs: "1rem", sm: "1.2rem", md: "1.35rem", lg: "1.5rem" } }}>
//             Saathi <span style={{ color: '#E8650A' }}>Community</span>
//           </Typography>
//           <Typography color="text.secondary" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "0.7rem", sm: "0.9rem", md: "1.05rem", lg: "1.2rem" } }}>
//             Built on trust, referrals, and shared roots
//           </Typography>

//           {/* Main layout: feed + sidebar side by side on sm+ */}
//           <Box
//             sx={{
//               display: 'flex',
//               gap: { xs: 0, sm: 2, md: 3 },
//               alignItems: 'flex-start',
//               width: '100%',
//               maxWidth: "1200px"
//             }}
//           >

//             <Box
//               sx={{
//                 flex: 1,
//                 minWidth: 0,
//                 pr: { xs: 0.5, sm: 1 },
//               }}
//             >

//               <Box
//                 sx={{
//                   p: { xs: 1, sm: 1.5, md: 2 },
//                   borderRadius: 3,
//                   border: CARD_BORDER,
//                   mb: 2,
//                   width: POST_BOX_WIDTH_SX,
//                   boxSizing: 'border-box',
//                 }}
//               >
//                 <Box sx={{ display: 'flex', gap: isMobile ? 1 : 1.5, alignItems: 'flex-start' }}>
//                   <UserAvatar
//                     size={avatarSize}
//                     verified
//                     currentUser={currentUser}
//                   />

//                   {/* <TextField
//                     fullWidth
//                     multiline
//                     minRows={1}
//                     maxRows={5}
//                     value={post}
//                     onChange={(e) => setPost(e.target.value)}
//                     disabled={!isProfileComplete}
//                     placeholder="Make a post"
//                     variant="outlined"
//                     size={isMobile ? 'small' : 'medium'}
//                     inputProps={{ style: { fontSize: bodyFontSize } }}
//                     sx={{
//                       '& .MuiOutlinedInput-root': {
//                         borderRadius: 3,
//                         alignItems: 'flex-start',
//                         fontSize: { xs: "10px", sm: "12px" }
//                       },
//                     }}
//                   /> */}

//                   {/* <Tooltip
//                     title="Complete your profile to 100% before creating a post."
//                     arrow
//                     open={!isProfileComplete && tooltipOpen}
//                     onClose={() => setTooltipOpen(false)}
//                   >
//                     <span
//                       style={{ display: "block", width: "100%" }}
//                       onClick={() => {
//                         if (!isProfileComplete) {
//                           setTooltipOpen(true);

//                           setTimeout(() => {
//                             setTooltipOpen(false);
//                           }, 3000);
//                         }
//                       }}
//                     >
//                       <TextField
//                         fullWidth
//                         multiline
//                         minRows={1}
//                         maxRows={5}
//                         value={post}
//                         onChange={(e) => setPost(e.target.value)}
//                         // disabled={!isProfileComplete}
//                         placeholder="Make a post"
//                         variant="outlined"
//                         size={isMobile ? "small" : "medium"}
//                         onKeyDown={() => {
//                           if (!isProfileComplete) {
//                             setTooltipOpen(true);

//                             setTimeout(() => setTooltipOpen(false), 3000);
//                           }
//                         }}
//                         inputProps={{
//                           style: {
//                             fontSize: bodyFontSize,
//                             readOnly: !isProfileComplete,
//                           },
//                         }}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             borderRadius: 3,
//                             alignItems: "flex-start",
//                             fontSize: { xs: "10px", sm: "12px" },
//                           },
//                         }}
//                       />
//                     </span>
//                   </Tooltip> */}


//                   <Tooltip
//                     title="Complete your profile to 100% before creating a post."
//                     arrow
//                     open={!isProfileComplete && tooltipOpen}
//                     onClose={() => setTooltipOpen(false)}
//                     slotProps={{
//                       tooltip: {
//                         sx: {
//                           fontSize: {
//                             xs: "10px",
//                             sm: "12px",
//                             md: "13px",
//                           },
//                           py: {
//                             xs: 0.5,
//                             sm: 1,
//                           },
//                           px: {
//                             xs: 1,
//                             sm: 1.5,
//                           },
//                           maxWidth: {
//                             xs: 180,
//                             sm: 250,
//                           },
//                           textAlign: "center",
//                         },
//                       },
//                       arrow: {
//                         sx: {
//                           fontSize: {
//                             xs: "0.6rem",
//                             sm: "0.8rem",
//                           },
//                         },
//                       },
//                     }}
//                   >
//                     <span
//                       style={{ display: "block", width: "100%" }}
//                       onClick={() => {
//                         if (!isProfileComplete) {
//                           setTooltipOpen(true);
//                           setTimeout(() => setTooltipOpen(false), 5000);
//                         }
//                       }}
//                     >
//                       <TextField
//                         fullWidth
//                         multiline
//                         minRows={1}
//                         maxRows={5}
//                         value={post}
//                         onChange={(e) => setPost(e.target.value)}
//                         placeholder="Make a post"
//                         variant="outlined"
//                         size={isMobile ? "small" : "medium"}
//                         onKeyDown={() => {
//                           if (!isProfileComplete) {
//                             setTooltipOpen(true);
//                             setTimeout(() => setTooltipOpen(false), 3000);
//                           }
//                         }}
//                         inputProps={{
//                           style: {
//                             fontSize: bodyFontSize,
//                             readOnly: !isProfileComplete,
//                           },
//                         }}
//                         sx={{
//                           "& .MuiOutlinedInput-root": {
//                             borderRadius: 3,
//                             alignItems: "flex-start",
//                             fontSize: { xs: "10px", sm: "12px" },
//                           },
//                         }}
//                       />
//                     </span>
//                   </Tooltip>

//                 </Box>

//                 {/* Image preview */}
//                 {preview && (
//                   <Box
//                     sx={{
//                       mt: 2,
//                       position: 'relative',
//                       borderRadius: 3,
//                       overflow: 'hidden',
//                       border: '1px solid #eee',
//                     }}
//                   >
//                     <Box
//                       component="img"
//                       src={preview}
//                       alt="preview"
//                       sx={{
//                         width: '100%',
//                         maxHeight: { xs: 200, sm: 240, md: 280, lg: 300 },
//                         objectFit: 'cover',
//                         display: 'block',
//                       }}
//                     />
//                     <Button
//                       size="small"
//                       onClick={() => { setMedia(null); setPreview(""); }}
//                       sx={{
//                         position: 'absolute', top: 8, right: 8,
//                         minWidth: 0, bgcolor: '#fff', borderRadius: '50%',
//                         width: isMobile ? 28 : 34, height: isMobile ? 28 : 34,
//                       }}
//                     >
//                       <CloseIcon fontSize={iconFontSize} />
//                     </Button>
//                   </Box>
//                 )}

//                 <Divider sx={{ my: 1.5 }} />

//                 <Stack direction="row" alignItems="center" justifyContent="space-between">

//                   <Box component="span">
//                     {/* <Tooltip
//                       title={
//                         !isProfileComplete
//                           ? "Complete your profile to 100% before creating a post."
//                           : ""
//                       }
//                       arrow
//                     >
//                       <span>
//                         <Button
//                           onClick={() => setOpenMediaDialog((prev) => !prev)}
//                           disabled={!isProfileComplete}
//                           startIcon={<PermMediaIcon fontSize={iconFontSize} />}
//                           size={isMobile ? "small" : "medium"}
//                           sx={{
//                             textTransform: "none",
//                             fontSize: btnFontSize,
//                             "&.Mui-disabled": {
//                               color: "#9e9e9e",
//                             },
//                           }}
//                         >
//                           Media
//                         </Button>
//                       </span>
//                     </Tooltip> */}

//                     <Tooltip
//                       title="Complete your profile to 100% before creating a post."
//                       arrow
//                       open={!isProfileComplete && tooltip2Open}
//                       onClose={() => setTooltip2Open(false)}
//                       slotProps={{
//                         tooltip: {
//                           sx: {
//                             fontSize: {
//                               xs: "10px",
//                               sm: "12px",
//                               md: "13px",
//                             },
//                             py: {
//                               xs: 0.5,
//                               sm: 1,
//                             },
//                             px: {
//                               xs: 1,
//                               sm: 1.5,
//                             },
//                             maxWidth: {
//                               xs: 180,
//                               sm: 250,
//                             },
//                             textAlign: "center",
//                           },
//                         },
//                         arrow: {
//                           sx: {
//                             fontSize: {
//                               xs: "0.6rem",
//                               sm: "0.8rem",
//                             },
//                           },
//                         },
//                       }}
//                     >
//                       <span
//                         style={{ display: "inline-block", width: "100%" }}
//                         onClick={() => {
//                           if (!isProfileComplete) {
//                             setTooltip2Open(true);

//                             setTimeout(() => {
//                               setTooltip2Open(false);
//                             }, 5000);
//                           }
//                         }}
//                       >
//                         <Button
//                           onClick={() => {
//                             if (isProfileComplete) {
//                               setOpenMediaDialog((prev) => !prev);
//                             }
//                           }}
//                           disabled={!isProfileComplete}
//                           startIcon={<PermMediaIcon fontSize={iconFontSize} />}
//                           size={isMobile ? "small" : "medium"}
//                           sx={{
//                             textTransform: "none",
//                             fontSize: btnFontSize,
//                             "&.Mui-disabled": {
//                               color: "#9e9e9e",
//                             },
//                           }}
//                         >
//                           Media
//                         </Button>
//                       </span>
//                     </Tooltip>


//                     {openMediaDialog && (
//                       <>
//                         <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
//                           <Button
//                             startIcon={<CameraAltIcon />}
//                             onClick={() => cameraInputRef.current?.click()}
//                             size={isMobile ? "small" : "medium"}
//                             sx={{
//                               textTransform: "none",
//                               fontSize: { xs: "9px", sm: "10px" },
//                               borderRadius: 5,
//                               px: 1.5,
//                               bgcolor: "#1976d2",
//                               color: "#fff",

//                               "& .MuiButton-startIcon svg": {
//                                 fontSize: { xs: "13px", sm: "14px" } // 14px, 16px, 18px, etc.
//                               },

//                               "&:hover": {
//                                 bgcolor: "#1565c0",
//                               },
//                             }}
//                           >
//                             {isMobile ? "Camera" : "Camera / Webcam"}
//                           </Button>

//                           <Button
//                             // variant="contained"
//                             startIcon={<FolderIcon />}
//                             onClick={() => fileInputRef.current?.click()}
//                             size={isMobile ? "small" : "medium"}
//                             sx={{
//                               textTransform: "none",
//                               fontSize: { xs: "9px", sm: "10px" },
//                               borderRadius: 5,
//                               px: 1.5,
//                               bgcolor: "#2e7d32",
//                               color: "#fff",
//                               "& .MuiButton-startIcon svg": {
//                                 fontSize: { xs: "13px", sm: "14px" } // 14px, 16px, 18px, etc.
//                               },

//                               "&:hover": {
//                                 bgcolor: "#1b5e20",

//                               },
//                             }}
//                           >
//                             {isMobile ? "Gallery" : "File"}
//                           </Button>
//                         </Stack>

//                         {/* Hidden Camera Input */}
//                         <input
//                           ref={cameraInputRef}
//                           hidden
//                           type="file"
//                           accept="image/*"
//                           capture="environment"
//                           onChange={handleMediaSelect}
//                         />

//                         {/* Hidden File Input */}
//                         <input
//                           ref={fileInputRef}
//                           hidden
//                           type="file"
//                           accept="image/*"
//                           onChange={handleMediaSelect}
//                         />
//                       </>
//                     )}

//                   </Box>

//                   <Tooltip
//                     title={
//                       !isProfileComplete
//                         ? "Complete your profile to 100% before creating a post."
//                         : ""
//                     }
//                     arrow
//                   >
//                     <Box component="span" sx={{ ml: "auto" }}>
//                       <Button
//                         variant="contained"
//                         disabled={
//                           loading ||
//                           (!post.trim() && !media) ||
//                           !isProfileComplete
//                         }
//                         onClick={handleCreatePost}
//                         size={isMobile ? "small" : "medium"}
//                         sx={{
//                           borderRadius: 999,
//                           textTransform: "none",
//                           bgcolor: "#E8650A",
//                           fontSize: btnFontSize,

//                           "&:hover": {
//                             bgcolor: "#c85608",
//                           },

//                           "&.Mui-disabled": {
//                             bgcolor: "#d1d5db",
//                             color: "#6b7280",
//                           },
//                         }}
//                       >
//                         {loading ? "Posting…" : "Post"}
//                       </Button>
//                     </Box>
//                   </Tooltip>
//                 </Stack>
//               </Box>

//               {/* Posts list */}
//               {postLoading ? (
//                 <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
//                   <CircularProgress size={isMobile ? 36 : 50} />
//                 </Box>
//               ) : (
//                 communityPosts?.map((post, index) => (
//                   <Paper
//                     key={index}
//                     elevation={0}
//                     sx={{
//                       borderRadius: 3, border: CARD_BORDER, mb: 2, overflow: 'hidden',
//                       width: POST_BOX_WIDTH_SX,  
//                       boxSizing: 'border-box',
//                     }}
//                   >
//                     <Box sx={{ p: isMobile ? 1.5 : 2 }}>
//                       {/* Post header */}
//                       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 1 : 1.5 }}>
//                         <Avatar
//                           src={post?.authorId?.profileImage}
//                           sx={{
//                             width: avatarSize,
//                             height: avatarSize,
//                             bgcolor: SAFFRON,
//                             color: '#fff',
//                             fontWeight: 800,
//                             fontSize: avatarFontSize,
//                             flexShrink: 0,
//                             mt: { xs: 0.4, sm: 0.5 }
//                           }}
//                         >
//                           {!currentUser?.profileImage &&
//                             `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`}
//                         </Avatar>

//                         <Box sx={{ flex: 1, minWidth: 0 }}>
//                           <Typography fontWeight={700}
//                             sx={{ fontSize: { xs: "0.7rem", sm: "0.92rem" } }}
//                             noWrap>
//                             {post?.authorId?.firstName} {post?.authorId?.lastName}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary" fontSize={captionSize}
//                             sx={{ fontSize: { xs: "0.6rem", sm: "0.72rem" } }}>
//                             {'tvm'} | {formattedDateTime(post?.createdAt)}
//                           </Typography>
//                         </Box>

//                         {post?.authorId?._id === currentUser._id && (
//                           <>
//                             <IconButton onClick={(e) => handleMenuOpen(e, post)}>
//                               <MoreHorizIcon
//                                 fontSize={iconFontSize}
//                                 sx={{ color: "text.secondary" }}
//                               />
//                             </IconButton>

//                             <Menu
//                               anchorEl={anchorEl}
//                               open={Boolean(anchorEl)}
//                               onClose={handleMenuClose}
//                             >
//                               <MenuItem
//                                 onClick={() => {
//                                   handleMenuClose();
//                                   handleEdit(selectedPost);
//                                 }}
//                               >
//                                 <ListItemIcon>
//                                   <EditIcon fontSize="small" />
//                                 </ListItemIcon>
//                                 <ListItemText>Edit</ListItemText>
//                               </MenuItem>

//                               <MenuItem
//                                 onClick={() => {
//                                   handleMenuClose();
//                                   setDeleteOpen(true);
//                                 }}
//                               >
//                                 <ListItemIcon>
//                                   <DeleteIcon fontSize="small" color="error" />
//                                 </ListItemIcon>
//                                 <ListItemText>Delete</ListItemText>
//                               </MenuItem>
//                             </Menu>
//                             <Dialog
//                               open={deleteOpen}
//                               onClose={() => setDeleteOpen(false)}
//                               maxWidth="xs"
//                               fullWidth
//                             >
//                               <DialogTitle>Delete Post</DialogTitle>

//                               <DialogContent>
//                                 <Typography>
//                                   Are you sure you want to delete this post?
//                                 </Typography>
//                               </DialogContent>

//                               <DialogActions sx={{ px: 3, pb: 2 }}>
//                                 <Button
//                                   variant="contained"
//                                   onClick={() => setDeleteOpen(false)}
//                                   sx={{
//                                     bgcolor: "grey.500",
//                                     color: "#fff",
//                                     "&:hover": {
//                                       bgcolor: "grey.700",
//                                     },
//                                   }}
//                                 >
//                                   Cancel
//                                 </Button>
//                                 <Button
//                                   variant="contained"
//                                   color="error"
//                                   onClick={() => {
//                                     const postId = selectedPost._id;
//                                     handleMenuClose();
//                                     handleDelete(postId);
//                                     setDeleteOpen(false);
//                                   }}
//                                 >
//                                   Delete
//                                 </Button>
//                               </DialogActions>
//                             </Dialog>
//                             <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
//                               <DialogTitle>Edit Post</DialogTitle>

//                               <DialogContent dividers>
//                                 <TextField
//                                   fullWidth
//                                   multiline
//                                   minRows={2}
//                                   margin="dense"
//                                   label="Description"
//                                   value={editDescription}
//                                   onChange={(e) => setEditDescription(e.target.value)}
//                                 />

//                                 <Box sx={{ mt: 2 }}>
//                                   <img
//                                     src={editImage ? URL.createObjectURL(editImage) : previewImage}
//                                     alt="Post"
//                                     style={{
//                                       width: "100%",
//                                       maxHeight: "250px",
//                                       objectFit: "cover",
//                                       borderRadius: "8px",
//                                       marginBottom: "16px",
//                                     }}
//                                   />

//                                   <Button
//                                     variant="contained"
//                                     fullWidth
//                                     onClick={openImageMenu}
//                                     sx={{
//                                       bgcolor: "#FF9933",
//                                       color: "#fff",
//                                       fontWeight: 600,
//                                       textTransform: "none",
//                                       "&:hover": { bgcolor: "#e68a00" },
//                                     }}
//                                   >
//                                     Change Image
//                                   </Button>

//                                   <Menu
//                                     anchorEl={imageMenuAnchor}
//                                     open={isImageMenuOpen}
//                                     onClose={closeImageMenu}
//                                     anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//                                     transformOrigin={{ vertical: "top", horizontal: "center" }}
//                                   >
//                                     <MenuItem component="label">
//                                       <ListItemIcon>
//                                         <CameraAltIcon fontSize="small" sx={{ color: "#FF9933" }} />
//                                       </ListItemIcon>
//                                       <ListItemText>Camera</ListItemText>
//                                       <input
//                                         hidden
//                                         type="file"
//                                         accept="image/*"
//                                         capture="environment"
//                                         onChange={onImageSelected}
//                                       />
//                                     </MenuItem>

//                                     <MenuItem component="label">
//                                       <ListItemIcon>
//                                         <InsertDriveFileIcon fontSize="small" sx={{ color: "#FF9933" }} />
//                                       </ListItemIcon>
//                                       <ListItemText>File</ListItemText>
//                                       <input
//                                         hidden
//                                         type="file"
//                                         accept="image/*"
//                                         onChange={onImageSelected}
//                                       />
//                                     </MenuItem>
//                                   </Menu>
//                                 </Box>
//                               </DialogContent>

//                               <DialogActions
//                                 sx={{
//                                   display: "flex",
//                                   flexDirection: { xs: "column", sm: "row" },
//                                   gap: 1,
//                                   p: 2,
//                                   "& > button": { flex: { xs: "1 1 auto", sm: "0 1 auto" } },
//                                 }}
//                               >
//                                 <Button
//                                   onClick={() => setEditOpen(false)}
//                                   variant="contained"
//                                   fullWidth
//                                   sx={{ bgcolor: "#9E9E9E", color: "#fff", "&:hover": { bgcolor: "#757575" } }}
//                                 >
//                                   Cancel
//                                 </Button>

//                                 <Button
//                                   variant="contained"
//                                   onClick={handleUpdate}
//                                   fullWidth
//                                   sx={{ bgcolor: "#FF9933", "&:hover": { bgcolor: "#e68a00" } }}
//                                 >
//                                   Save
//                                 </Button>
//                               </DialogActions>
//                             </Dialog>
//                             {editImage && (
//                               <img
//                                 src={URL.createObjectURL(editImage)}
//                                 alt="Preview"
//                                 width={150}
//                                 style={{ marginTop: 10, borderRadius: 8 }}
//                               />
//                             )}
//                           </>
//                         )}

//                       </Box>

//                       {/* Post body */}
//                       <Typography sx={{ mt: 1.5, fontSize: bodyFontSize, lineHeight: 1.6 }}>
//                         {post.description}
//                       </Typography>
//                     </Box>

//                     {/* Post image */}
//                     {post.postImage && <CommunityImage src={post.postImage} />}

//                     <Divider />

//                     {/* Action buttons */}
//                     <Stack
//                       direction="row"
//                       sx={{
//                         py: isMobile ? 0.25 : 0.5,
//                         px: isMobile ? 0.5 : 2,
//                         gap: isMobile ? 0 : 5,
//                         // justifyContent: isMobile ? 'space-around' : 'flex-start',
//                         justifyContent: 'space-around',
//                       }}
//                     >
//                       <Button
//                         onClick={() => post.isLiked ? removeLike(post._id) : addLike(post._id)}
//                         startIcon={
//                           post.isLiked
//                             ? <ThumbUpIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
//                             : <ThumbUpOffAltIcon fontSize={iconFontSize} />
//                         }
//                         size={isMobile ? 'small' : 'medium'}
//                         sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
//                       >
//                         {post?.likes || 0}
//                       </Button>

//                       <Button
//                         startIcon={
//                           activeCommentPostId === post._id
//                             ? <ChatIcon fontSize={iconFontSize} sx={{ color: '#0084ff' }} />
//                             : <ChatIcon fontSize={iconFontSize} />
//                         }
//                         onClick={() =>
//                           setActiveCommentPostId((prev) => prev === post._id ? null : post._id)
//                         }
//                         size={isMobile ? 'small' : 'medium'}
//                         sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
//                       >
//                         Comments
//                       </Button>

//                       <Button
//                         startIcon={<ShareIcon fontSize={iconFontSize} />}
//                         size={isMobile ? 'small' : 'medium'}
//                         sx={{ textTransform: 'none', color: 'text.secondary', fontSize: btnFontSize }}
//                       >
//                         Share
//                       </Button>
//                     </Stack>

//                     <Divider />

//                     {activeCommentPostId === post._id && (
//                       <Box sx={{ margin: isMobile ? 1 : 1.5 }}>
//                         <CommunityComments post={post} user={user} />
//                       </Box>
//                     )}
//                   </Paper>
//                 ))
//               )}
//             </Box>
//           </Box>
//         </PageLayout>

//         {/* ── Right: Sidebar (visible on sm and up, independent fixed scroll) ── */}
//         {showSidebar && (
//           <Grid
//             sx={{
//               mt: { sm: 5, md: 7, lg: 10, xl: 12 },
//               width: { sm: '200px', md: '260px', lg: '300px', xl: '320px' },
//               minWidth: { sm: '200px', md: '260px', lg: '300px', xl: '320px' },
//               flexShrink: 0,
//               position: 'sticky',
//               top: 20,
//               height: SIDEBAR_SCROLL_HEIGHT,
//               overflowY: 'auto',
//               overflowX: 'hidden',
//               pr: 6,
//               '&::-webkit-scrollbar': { width: 3 },
//               '&::-webkit-scrollbar-thumb': { backgroundColor: '#E0D4C8', borderRadius: 4 },
//             }}
//           >
//             <SidebarContent />
//           </Grid>
//         )}
//       </Box>
//     </>


//   );
// }

