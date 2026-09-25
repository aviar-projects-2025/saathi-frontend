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

import { Tabs, Tab, IconButton, Collapse } from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ToastConfig from "../components/ToastConfig.jsx";
import CircularProgress from "@mui/material/CircularProgress";

import ProfileModal from "./Avatar.jsx";

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate, useLocation } from "react-router-dom";

import EditProfile from "./EditProfile.jsx";

// Size (px) of the square adjust/crop box
const CROP_BOX_SIZE = 260;
// Output resolution of the final cropped image
const OUTPUT_SIZE = 500;

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
      p: { xs: "12px 14px", sm: "16px 18px", md: "20px 24px" },
      borderRadius: { xs: 2, sm: 3 },
      border: CARD_BORDER,
      ...sx,
    }}
  >
    {children}
  </Paper>
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
    savedHasNextPage,
    savedLoading,
  } = useUser();
  const savedPostObserverRef = useRef(null);
  const onImageSelected = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setEditImage(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
    closeImageMenu();
    e.target.value = null; // allow re-selecting same file next time
  };
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


  // const theme = useTheme();
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
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [selectedPost]);


  const [anchorEl, setAnchorEl] = useState(null);
  // const [selectedPost, setSelectedPost] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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
    if (currentUser?._id) {
      setCommunityPosts([]);
      setCommunityPage(1);
      setHasMorePosts(true);
      pageRef.current = 1;
      hasMoreRef.current = true;
      isFetchingRef.current = false;

      getCommunityPost(1);
    }
  }, [currentUser?._id]);


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
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const getCommunityPost = async (page = 1) => {
    try {
      if (page === 1) {
        setCommunityLoading(true);
      } else {
        setLoadingMorePosts(true);
      }

      const postsRes = await axios.get(
        `${Api}/post-images/profile/${currentUser?._id}?page=${page}&limit=12`
      );

      const newPosts = postsRes.data.data || [];
      const pagination = postsRes.data.pagination;


      const totalCount = pagination?.totalCount ?? 0;

      setTotalPostCount(totalCount);

      if (page === 1) {
        // First 12 posts
        setCommunityPosts(newPosts);
      } else {
        // Add next 12 posts
        setCommunityPosts((prev) => [
          ...prev,
          ...newPosts,
        ]);
      }

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };
  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
  const isImageMenuOpen = Boolean(imageMenuAnchor);

  const openImageMenu = (e) => setImageMenuAnchor(e.currentTarget);
  const closeImageMenu = () => setImageMenuAnchor(null);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleEdit = (post) => {
    setSelectedPost(post);

    setPreviewImage(post.postImage);

    setOriginalImage(post.postImage);

    setEditImage(null);
    setEditOpen(true);
  };
  const handleReset = () => {
    setEditImage(null);
    setPreviewImage(originalImage);
  };

  const handleDelete = async (postId) => {

    try {

      setImageDeleteLoading(true);

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

      setDeleteOpen(false);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete post", toasts);
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
              postImage: res.data.data.postImage,
            }
            : post
        )
      );

      toast.success(res.data.message, toasts);

      setEditOpen(false);
      setSelectedPost(null);
      setEditImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update post", toasts);
    } finally {
      setImagePostLoading(false);
    }
  };
  const [dropDown, setDropDown] = useState(null);

  const isdropdownMenuOpen = Boolean(dropDown);

  const handleDropdownMenuOpen = (event) => {
    setDropDown(event.currentTarget);
  };

  const handleDropdownMenuClose = () => {
    setDropDown(null);
  };
  useEffect(() => {
    if (tab !== 1) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !savedLoading &&
          savedHasNextPage
        ) {
          getSavedPost(savedPage + 1);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = savedPostObserverRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    tab,
    savedPage,
    savedLoading,
    savedHasNextPage,
    getSavedPost,
  ]);

  const handleSettingClick = () => {
    handleDropdownMenuClose();
    navigate("/myprofile");
  };


  return (
    <PageLayout>
      <Box sx={{ mx: "auto", px: { xs: 0, sm: 2, md: 0 } }}>
        {/* Page heading */}
        <Box sx={{ pt: { xs: 2, sm: 0 }, mb: 1, flexShrink: 0 }}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.1rem", sm: "1.35rem", md: "1.5rem" } }}
          >
            My Profile
          </Typography>
        </Box>

        <Typography
          color="text.secondary"
          sx={{
            mt: { xs: 1, sm: 1 },
            fontSize: { xs: "0.72rem", sm: "1rem", md: "1rem" },
          }}
        >
          Manage your Saathi account, referrals, and preferences.
        </Typography>

        <Stack spacing={{ xs: 1.25, sm: 1.75, md: 3 }} sx={{ mt: 2 }}>
          {/* ── Profile (Instagram-style header) ── */}
          <SectionCard>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 2, sm: 3 }}
                alignItems="center"
                sx={{ flex: 1 }}
              >
                <Avatar
                  src={currentUser?.profileImage || ""}
                  alt={`${currentUser?.firstName || ""} ${currentUser?.lastName || ""
                    }`}
                  onClick={() => {
                    setSelectedProfile(currentUser);
                    setProfileModalOpen(true);
                  }}
                  sx={{
                    width: { xs: 64, sm: 84, md: 96 },
                    height: { xs: 64, sm: 84, md: 96 },
                    bgcolor: SAFFRON,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",

                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 0 0 4px rgba(232, 101, 10, 0.25)",
                    },
                  }}
                >
                  {!currentUser?.profileImage &&
                    `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""
                    }`}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "0.82rem", sm: "0.9rem", md: "1rem" },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {currentUser?.firstName} {currentUser?.lastName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.68rem", sm: "0.75rem", md: "0.8rem" },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      mb: { xs: 1, sm: 1.5 },
                    }}
                  >
                    {currentUser?.email}
                  </Typography>

                  <Stack direction="row" spacing={{ xs: 2, sm: 3.5 }}>
                    <Typography>
                      Posts: {totalPostCount}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <IconButton
                onClick={handleDropdownMenuOpen}
                sx={{
                  color: "#555",
                  ml: 1,
                }}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={dropDown}
                open={isdropdownMenuOpen}
                onClose={handleDropdownMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem
                  onClick={handleSettingClick}
                  sx={{
                    "&:hover": {
                      // backgroundColor: "#FFF3E0",
                      color: "#E8650A",
                    },
                  }}
                >
                  <ListItemText primary="Settings" />
                </MenuItem>
              </Menu>
            </Box>

            {currentUser?.bio && (
              <Typography
                sx={{
                  mt: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.85rem" },
                  color: "text.primary",
                }}
              >
                {currentUser.bio}
              </Typography>
            )}

            <Stack
              direction="row"
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{
                mt: { xs: 0.5, sm: 1 },
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                onClick={() => {
                  console.log("Edit Profile clicked");
                  setEditProfile(true);
                }}
                sx={{ ...pillBtn, borderColor: "#EADFD3" }}
              >
                Edit Profile
              </Button>
              {editProfile && (
                <EditProfile
                  open={editProfile}
                  onClose={() => setEditProfile(false)}
                />

              )}

            </Stack>
          </SectionCard>

          {/* <SectionCard> */}
          <Box>

            <Tabs
              value={tab}
              onChange={(e, value) => {
                setTab(value);
                setSelectedPost(null);
              }}
              centered
              sx={{
                minHeight: { xs: 36, sm: 44 },
                "& .MuiTab-root": { minHeight: { xs: 36, sm: 44 }, py: 0 },
                "& .MuiTabs-indicator": { backgroundColor: SAFFRON },
                "& .Mui-selected": { color: `${SAFFRON} !important` },
                mb: 3,
              }}
            >
              <Tab icon={<GridOnIcon fontSize="small" />} />
              <Tab icon={<BookmarkBorderIcon fontSize="small" />} />
            </Tabs>

            {tab === 0 && (
              <>
                <Grid
                  container
                  spacing={{
                    xs: "12px",
                    sm: "15px",
                    md: "20px",
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >

                  {communityLoading ? (
                    <>
                      {Array.from({ length: 12 }).map((_, index) => (
                        <Grid
                          item
                          xs={4}
                          key={`community-skeleton-${index}`}
                          sx={{ mt: 1 }}
                        >
                          <Skeleton
                            variant="rectangular"
                            animation="wave"
                            sx={{
                              width: {
                                xs: 108,
                                sm: 125,
                                md: 150,
                                lg: 175,
                              },
                              height: {
                                xs: 150,
                                sm: 200,
                                md: 225,
                                lg: 250,
                              },
                              borderRadius: {
                                xs: 0.5,
                                sm: 1,
                              },
                            }}
                          />
                        </Grid>
                      ))}
                    </>
                  ) : communityPosts.length === 0 ? (
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: {
                          xs: "100%",
                          sm: 440,
                          md: 480,
                        },

                        textAlign: "center",

                        flexDirection: "column",

                        mx: "auto",

                        display: "flex",

                        justifyContent: "center",

                        alignItems: "center",

                        mt: {
                          xs: "35%",
                          sm: "7%",
                        },
                      }}
                    >

                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          fontSize: {
                            xs: "0.95rem",
                            sm: "1.05rem",
                            md: "1.15rem",
                          },
                        }}
                      >
                        No Community Posts Yet
                      </Typography>


                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,

                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.85rem",
                            md: "0.95rem",
                          },
                        }}
                      >
                        Community posts will appear here when available.
                      </Typography>

                    </Box>

                  ) : (
                    communityPosts.map((post) => (

                      <Grid
                        item
                        xs={4}
                        key={post._id}
                        sx={{
                          mt: 1,
                        }}
                      >

                        {post.postImage && (
                          <>
                            <Box
                              onClick={() => {
                                setSelectedPost(
                                  post
                                );

                                setSelectedImage(
                                  Array.isArray(
                                    post.postImage
                                  )
                                    ? post
                                      .postImage[0]
                                    : post.postImage
                                );

                                setOpenImage(
                                  true
                                );
                              }}
                              sx={{
                                position:
                                  "relative",
                                cursor:
                                  "pointer",
                                width: { xs: 108, sm: 125, md: 150, lg: 175 },
                                height: { xs: 150, sm: 200, md: 225, lg: 250 },
                                overflow:
                                  "hidden",
                                borderRadius:
                                {
                                  xs: 0.5,
                                  sm: 1,
                                },
                              }}
                            >
                              <IconButton
                                onClick={(
                                  e
                                ) => {
                                  e.stopPropagation();

                                  handleMenuOpen(
                                    e,
                                    post
                                  );
                                }}
                                sx={{
                                  position:
                                    "absolute",
                                  top: 5,
                                  right: 5,
                                  zIndex: 2,
                                  width: 24,
                                  height: 24,
                                  padding: 0,
                                  color:
                                    "#fff",
                                  backgroundColor:
                                    "rgba(0,0,0,0.5)",

                                  "&:hover":
                                  {
                                    backgroundColor:
                                      "rgba(0,0,0,0.7)",
                                  },

                                  "& .MuiSvgIcon-root":
                                  {
                                    fontSize: 16,
                                  },
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>

                              <img
                                src={
                                  Array.isArray(
                                    post.postImage
                                  )
                                    ? post
                                      .postImage[0]
                                    : post.postImage
                                }
                                alt=""
                                style={{
                                  width:
                                    "100%",
                                  height:
                                    "100%",
                                  objectFit:
                                    "cover",
                                  display:
                                    "block",
                                }}
                              />
                            </Box>

                            <Menu
                              anchorEl={
                                anchorEl
                              }
                              open={Boolean(
                                anchorEl
                              )}
                              onClose={
                                handleMenuClose
                              }
                            >
                              <MenuItem
                                onClick={() => {
                                  handleMenuClose();
                                  handleEdit(
                                    selectedPost
                                  );
                                }}
                              >
                                <ListItemIcon>
                                  <EditIcon fontSize="small" />
                                </ListItemIcon>

                                <ListItemText>
                                  Edit
                                </ListItemText>
                              </MenuItem>

                              <MenuItem
                                onClick={() => {
                                  handleMenuClose();
                                  setDeleteOpen(
                                    true
                                  );
                                }}
                              >
                                <ListItemIcon>
                                  <DeleteIcon
                                    fontSize="small"
                                    color="error"
                                  />
                                </ListItemIcon>

                                <ListItemText>
                                  Delete
                                </ListItemText>
                              </MenuItem>
                            </Menu>

                            <Dialog
                              open={
                                deleteOpen
                              }
                              onClose={(
                                event,
                                reason
                              ) => {
                                if (
                                  reason ===
                                  "backdropClick"
                                ) {
                                  return;
                                }

                                setDeleteOpen(
                                  false
                                );
                              }}
                              fullWidth
                              maxWidth="xs"
                              PaperProps={{
                                sx: {
                                  width: {
                                    xs: "95%",
                                    sm: "100%",
                                  },
                                  m: {
                                    xs: 1.5,
                                    sm: 2,
                                  },
                                  borderRadius:
                                  {
                                    xs: 2,
                                    sm: 3,
                                  },
                                },
                              }}
                            >
                              <DialogTitle
                                sx={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: 1,
                                  fontWeight:
                                    600,
                                }}
                              >
                                <WarningAmberRoundedIcon color="error" />

                                Delete Post ?
                              </DialogTitle>

                              <DialogContent
                                sx={{
                                  pt: 1,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize:
                                    {
                                      xs: "0.9rem",
                                      sm: "1rem",
                                    },
                                    color:
                                      "text.secondary",
                                  }}
                                >
                                  Are you
                                  sure you
                                  want to
                                  delete
                                  this
                                  post?
                                </Typography>
                              </DialogContent>

                              <DialogActions
                                sx={{
                                  px: {
                                    xs: 2,
                                    sm: 3,
                                  },
                                  pb: {
                                    xs: 2,
                                    sm: 3,
                                  },
                                  gap: 1,
                                }}
                              >
                                <Button
                                  variant="contained"
                                  onClick={() =>
                                    setDeleteOpen(
                                      false
                                    )
                                  }
                                  sx={{
                                    flex: 1,
                                    py: 1,
                                    fontSize:
                                    {
                                      xs: "0.8rem",
                                      sm: "0.9rem",
                                    },
                                    fontWeight:
                                      600,
                                    color:
                                      "#ffff",
                                    bgcolor:
                                      "grey.700",
                                    textTransform:
                                      "none",
                                  }}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  variant="contained"
                                  color="error"
                                  disabled={
                                    imageDeleteLoading
                                  }
                                  onClick={() => {
                                    const postId =
                                      selectedPost._id;

                                    handleMenuClose();

                                    handleDelete(
                                      postId
                                    );
                                  }}
                                  sx={{
                                    flex: 1,
                                    py: 1,
                                    fontSize:
                                    {
                                      xs: "0.8rem",
                                      sm: "0.9rem",
                                    },
                                    fontWeight:
                                      600,
                                    textTransform:
                                      "none",
                                  }}
                                >
                                  {imageDeleteLoading
                                    ? "Deleting..."
                                    : "Delete"}
                                </Button>
                              </DialogActions>
                            </Dialog>

                            <Dialog
                              open={
                                editOpen
                              }
                              onClose={(
                                event,
                                reason
                              ) => {
                                if (
                                  reason ===
                                  "backdropClick"
                                ) {
                                  return;
                                }

                                setEditOpen(
                                  false
                                );
                              }}
                              fullWidth
                              maxWidth="sm"
                              PaperProps={{
                                sx: {
                                  borderRadius:
                                  {
                                    xs: 0,
                                    sm: 3,
                                  },
                                  m: {
                                    xs: 0,
                                    sm: 2,
                                  },
                                },
                              }}
                            >
                              <DialogTitle
                                sx={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "space-between",
                                  fontWeight:
                                    600,
                                  fontSize:
                                  {
                                    xs: "1rem",
                                    sm: "1.15rem",
                                  },
                                  py: 1.5,
                                  px: 2,
                                }}
                              >
                                Edit Post

                                <IconButton
                                  onClick={() =>
                                    setEditOpen(
                                      false
                                    )
                                  }
                                  size="small"
                                  sx={{
                                    color:
                                      "#666",
                                    "&:hover":
                                    {
                                      bgcolor:
                                        "#f5f5f5",
                                    },
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </DialogTitle>

                              <DialogContent
                                dividers
                                sx={{
                                  px: {
                                    xs: 1.5,
                                    sm: 3,
                                  },
                                  py: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    mt: 2,
                                  }}
                                >
                                  {previewImage && (
                                    <Box
                                      component="img"
                                      src={
                                        editImage
                                          ? URL.createObjectURL(
                                            editImage
                                          )
                                          : previewImage
                                      }
                                      alt="Preview"
                                      sx={{
                                        width:
                                          "100%",
                                        height:
                                        {
                                          xs: 160,
                                          sm: 220,
                                          md: 280,
                                        },
                                        objectFit:
                                          "contain",
                                        borderRadius: 2,
                                        mb: 1.5,
                                      }}
                                    />
                                  )}

                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={
                                      openImageMenu
                                    }
                                    sx={{
                                      width:
                                        "fit-content",
                                      minWidth:
                                        "unset",
                                      height: 36,
                                      bgcolor:
                                        "#FF9933",
                                      color:
                                        "#fff",
                                      fontWeight:
                                        600,
                                      fontSize:
                                        "0.8rem",
                                      textTransform:
                                        "none",
                                      borderRadius: 2,
                                      px: 2,

                                      "&:hover":
                                      {
                                        bgcolor:
                                          "#E68A00",
                                      },
                                    }}
                                  >
                                    {!previewImage
                                      ? "Add Image"
                                      : "Change Image"}
                                  </Button>

                                  <Menu
                                    anchorEl={
                                      imageMenuAnchor
                                    }
                                    open={
                                      isImageMenuOpen
                                    }
                                    onClose={
                                      closeImageMenu
                                    }
                                    anchorOrigin={{
                                      vertical:
                                        "top",
                                      horizontal:
                                        "center",
                                    }}
                                    transformOrigin={{
                                      vertical:
                                        "bottom",
                                      horizontal:
                                        "center",
                                    }}
                                  >
                                    <MenuItem
                                      component="label"
                                      dense
                                    >
                                      <ListItemIcon>
                                        <CameraAltIcon
                                          fontSize="small"
                                          sx={{
                                            color:
                                              "#FF9933",
                                          }}
                                        />
                                      </ListItemIcon>

                                      <ListItemText
                                        primaryTypographyProps={{
                                          fontSize:
                                            "0.85rem",
                                        }}
                                      >
                                        Camera
                                      </ListItemText>

                                      <input
                                        hidden
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={
                                          onImageSelected
                                        }
                                      />
                                    </MenuItem>

                                    <MenuItem
                                      component="label"
                                      dense
                                    >
                                      <ListItemIcon>
                                        <InsertDriveFileIcon
                                          fontSize="small"
                                          sx={{
                                            color:
                                              "#FF9933",
                                          }}
                                        />
                                      </ListItemIcon>

                                      <ListItemText
                                        primaryTypographyProps={{
                                          fontSize:
                                            "0.85rem",
                                        }}
                                      >
                                        Gallery
                                      </ListItemText>

                                      <input
                                        hidden
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                          onImageSelected
                                        }
                                      />
                                    </MenuItem>
                                  </Menu>
                                </Box>
                              </DialogContent>

                              <DialogActions
                                sx={{
                                  p: {
                                    xs: 1.5,
                                    sm: 2,
                                  },
                                  display:
                                    "flex",
                                  flexDirection:
                                  {
                                    xs: "column",
                                    sm: "row",
                                  },
                                  gap: 1,
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  justifyContent="flex-end"
                                  sx={{
                                    pt: 2,
                                  }}
                                >
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={
                                      handleReset
                                    }
                                    sx={{
                                      width:
                                        "fit-content",
                                      minWidth:
                                        "unset",
                                      px: 2,
                                      height: 36,
                                      backgroundColor:
                                        "#838282",
                                      color:
                                        "#fff",
                                      fontWeight:
                                        600,
                                      fontSize:
                                        "0.8rem",
                                      textTransform:
                                        "none",
                                      borderRadius: 2,
                                    }}
                                  >
                                    Reset
                                  </Button>

                                  <Button
                                    variant="contained"
                                    size="small"
                                    disabled={
                                      imagePostLoading
                                    }
                                    onClick={
                                      handleUpdate
                                    }
                                    sx={{
                                      width:
                                        "fit-content",
                                      minWidth:
                                        "unset",
                                      px: 2,
                                      height: 36,
                                      bgcolor:
                                        "#FF9933",
                                      color:
                                        "#fff",
                                      fontWeight:
                                        600,
                                      fontSize:
                                        "0.8rem",
                                      textTransform:
                                        "none",
                                      borderRadius: 2,

                                      "&:hover":
                                      {
                                        bgcolor:
                                          "#E68A00",
                                      },
                                    }}
                                  >
                                    {imagePostLoading
                                      ? "Saving..."
                                      : "Save"}
                                  </Button>
                                </Stack>
                              </DialogActions>
                            </Dialog>

                            {editImage && (
                              <img
                                src={URL.createObjectURL(
                                  editImage
                                )}
                                alt="Preview"
                                width={150}
                                style={{
                                  marginTop: 10,
                                  borderRadius: 8,
                                }}
                              />
                            )}
                          </>
                        )}

                      </Grid>

                    ))

                  )}

                </Grid>

                {communityPosts.length > 0 && (
                  <Box
                    ref={setLoadMoreRef}

                    sx={{
                      width: "100%",

                      minHeight: 70,

                      display: "flex",

                      justifyContent: "center",

                      alignItems: "center",

                      py: 3,
                    }}
                  >

                    {loadingMorePosts && (
                      <CircularProgress
                        size={28}
                        thickness={4}
                        sx={{
                          color: "#FF9933",
                        }}
                      />
                    )}


                    {!loadingMorePosts &&
                      !hasMorePosts && (
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: "0.8rem",
                          }}
                        >
                          No more posts
                        </Typography>
                      )}

                  </Box>
                )}

              </>
            )}
            {tab === 1 && (
              <Grid
                container
                spacing={{
                  xs: "12px",
                  sm: "15px",
                  md: "20px",
                }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Initial loading - show skeletons */}
                {savedLoading && savedPost?.length === 0 ? (
                  <>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <Grid
                        item
                        xs={4}
                        key={`saved-skeleton-${index}`}
                        sx={{ mt: 0.2 }}
                      >
                        <Skeleton
                          variant="rectangular"
                          animation="wave"
                          sx={{
                            width: {
                              xs: 108,
                              sm: 125,
                              md: 150,
                              lg: 175,
                            },
                            height: {
                              xs: 150,
                              sm: 200,
                              md: 225,
                              lg: 250,
                            },
                            borderRadius: {
                              xs: 0.5,
                              sm: 1,
                            },
                          }}
                        />
                      </Grid>
                    ))}
                  </>
                ) : savedPost?.length === 0 ? (
                  /* No saved posts */
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: {
                        xs: "100%",
                        sm: 440,
                        md: 480,
                      },
                      textAlign: "center",
                      flexDirection: "column",
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: {
                        xs: "35%",
                        sm: "7%",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                      sx={{
                        fontSize: {
                          xs: "0.95rem",
                          sm: "1.05rem",
                          md: "1.15rem",
                        },
                      }}
                    >
                      No Saved Posts Yet
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.85rem",
                          md: "0.95rem",
                        },
                      }}
                    >
                      Saved posts will appear here when available.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Saved Posts */}
                    {savedPost?.map((post) => (
                      <Grid
                        item
                        xs={4}
                        key={post._id}
                        sx={{ mt: 0.2 }}
                      >
                        {post.postId?.postImage && (
                          <Box
                            onClick={() => {
                              setSelectedPost(post);

                              setSelectedImage(
                                Array.isArray(
                                  post.postId.postImage
                                )
                                  ? post.postId.postImage[0]
                                  : post.postId.postImage
                              );

                              setOpenImage(true);
                            }}
                            sx={{
                              position: "relative",
                              cursor: "pointer",
                              width: {
                                xs: 108,
                                sm: 125,
                                md: 150,
                                lg: 175,
                              },
                              height: {
                                xs: 150,
                                sm: 200,
                                md: 225,
                                lg: 250,
                              },
                              overflow: "hidden",
                              borderRadius: {
                                xs: 0.5,
                                sm: 1,
                              },
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <img
                              src={
                                Array.isArray(
                                  post.postId.postImage
                                )
                                  ? post.postId.postImage[0]
                                  : post.postId.postImage
                              }
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </Box>
                        )}
                      </Grid>
                    ))}

                    {/* Loading next page */}
                    {savedLoading && savedPost?.length > 0 && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Grid
                            item
                            xs={4}
                            key={`next-skeleton-${index}`}
                            sx={{ mt: 0.2 }}
                          >
                            <Skeleton
                              variant="rectangular"
                              animation="wave"
                              sx={{
                                width: {
                                  xs: 108,
                                  sm: 125,
                                  md: 150,
                                  lg: 175,
                                },
                                height: {
                                  xs: 150,
                                  sm: 200,
                                  md: 225,
                                  lg: 250,
                                },
                                borderRadius: {
                                  xs: 0.5,
                                  sm: 1,
                                },
                              }}
                            />
                          </Grid>
                        ))}
                      </>
                    )}

                    {/* Scroll detection element */}
                    {savedHasNextPage && (
                      <Box
                        ref={savedPostObserverRef}
                        sx={{
                          width: "100%",
                          height: "30px",
                        }}
                      />
                    )}
                  </>
                )}
              </Grid>
            )}
            <Dialog
              open={openImage}
              onClose={(event, reason) => {
                if (reason === "backdropClick") {
                  return;
                }

                setOpenImage(false);
              }}
              maxWidth={false}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: "transparent",
                    boxShadow: "none",
                    overflow: "hidden",
                    width: "auto",
                    maxWidth: "95vw",
                    maxHeight: "95vh",
                    m: 1,
                  },
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                {tab === 1 && (
                  <IconButton
                    onClick={async () => {
                      if (!selectedPost?.postId?._id) {

                        return;
                      }
                      await removeSavedPost(selectedPost.postId._id);
                      setOpenImage(false);
                      setSelectedPost(null);
                    }}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      color: "#fff",
                      bgcolor: "rgba(0,0,0,0.5)",
                      "&:hover": { bgcolor: "#ffff" },
                      zIndex: 10,
                    }}
                  >
                    <Tooltip title="Remove from saved">
                      <BookmarkBorderIcon
                        fontSize="small"
                        sx={{ color: "#ff5e00ff" }}
                      />
                    </Tooltip>
                  </IconButton>
                )}

                <IconButton
                  size="small"
                  onClick={() => setOpenImage(false)}
                  sx={{
                    position: "absolute",
                    top: { xs: 4, sm: 6, md: 8 },
                    right: { xs: 4, sm: 6, md: 8 },

                    width: { xs: 24, sm: 28, md: 32 },
                    height: { xs: 24, sm: 28, md: 32 },

                    color: "#fff",
                    bgcolor: "rgba(0,0,0,0.5)",

                    "&:hover": {
                      color: "rgba(0,0,0,0.7)",
                      backgroundColor: "#fff",
                    },

                    zIndex: 10,
                  }}
                >
                  <CloseIcon
                    sx={{
                      fontSize: {
                        xs: 15,
                        sm: 18,
                        md: 20,
                      },
                    }}
                  />
                </IconButton>

                <DialogContent
                  sx={{
                    p: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "transparent",
                  }}
                >
                  <Box
                    component="img"
                    src={selectedImage}
                    alt="Post"
                    sx={{
                      display: "block",
                      maxWidth: "95vw",
                      maxHeight: "90vh",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 2,
                    }}
                  />
                </DialogContent>
              </Box>
            </Dialog>
          </Box>
        </Stack>

        <ProfileModal
          open={profileModalOpen}
          selectedProfile={selectedProfile}
          onClose={() => {
            setProfileModalOpen(false);
          }}
        />
      </Box>
    </PageLayout>
  );
};

export default UserProfile;
