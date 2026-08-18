import React, { useEffect, useState, useRef } from "react";
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
  MenuItem,
  Dialog,
  DialogContent,
  Tooltip,
  Slider,
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import PageLayout from "../components/PageLayout";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";
import Mypost from "./Myprofile.jsx";

import PersonPinIcon from "@mui/icons-material/PersonPin";
import { Tabs, Tab, IconButton, Collapse } from "@mui/material";
import GridOnIcon from "@mui/icons-material/GridOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CommunityComments from "./CommunityComments.jsx";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import ToastConfig from "../components/ToastConfig.jsx";
import CircularProgress from "@mui/material/CircularProgress";

import ProfileModal from "./Avatar.jsx";

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";

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
// Shared wrapper that centers any modal content on every screen size
const modalCenterWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  minHeight: "100vh",
  p: { xs: 1, sm: 2, md: 3 },
  outline: "none",
};

// Instagram-style stat block used in the profile header
const StatBlock = ({ value, label }) => (
  <Box sx={{ textAlign: "center", minWidth: { xs: 52, sm: 64 } }}>
    <Typography
      fontWeight={800}
      sx={{
        fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
        lineHeight: 1.2,
      }}
    >
      {value}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem", md: "0.75rem" } }}
    >
      {label}
    </Typography>
  </Box>
);

const UserProfile = () => {
  const theme = useTheme();

  const toasts = ToastConfig();

  const [openComments, setOpenComments] = useState({});
  const handleToggleComments = (id) => {
    setOpenComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const { currentUser, getuserData, savedPost, removeSavedPost } = useUser();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [editProfile, setEditProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(
    currentUser?.profileImage || "",
  );
  const [profileFile, setProfileFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordModel, setPasswordModel] = useState("");
  const [errors, setErrors] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [openShare, setOpenShare] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const handleOpenShare = () => setOpenShare(true);
  const handleCloseShare = () => setOpenShare(false);

  // const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [communityLoading, setCommunityLoading] = useState(false);

  const shareLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  /* ---------------------------------------------------------------- */
  /*  PHOTO ADJUST / CROP BOX STATE                                    */
  /* ---------------------------------------------------------------- */
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [rawImage, setRawImage] = useState(""); // dataURL of the freshly picked file
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // top-left of displayed image relative to box
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 },
  });
  const cropImgRef = useRef(null);

  const getBaseScale = (w, h) => Math.max(CROP_BOX_SIZE / w, CROP_BOX_SIZE / h);

  const clampOffset = (nextOffset, displayedW, displayedH) => {
    const minX = CROP_BOX_SIZE - displayedW;
    const minY = CROP_BOX_SIZE - displayedH;
    return {
      x: Math.min(0, Math.max(minX, nextOffset.x)),
      y: Math.min(0, Math.max(minY, nextOffset.y)),
    };
  };

  const handlePickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setShowAdjustModal(true);
    };
    reader.readAsDataURL(file);

    // allow re-selecting the same file later
    e.target.value = "";
  };

  const handleCropImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setNaturalSize({ w, h });

    const baseScale = getBaseScale(w, h);
    const displayedW = w * baseScale;
    const displayedH = h * baseScale;

    setOffset({
      x: (CROP_BOX_SIZE - displayedW) / 2,
      y: (CROP_BOX_SIZE - displayedH) / 2,
    });
  };

  const getDisplayedSize = () => {
    const baseScale = getBaseScale(naturalSize.w, naturalSize.h);
    return {
      displayedW: naturalSize.w * baseScale * zoom,
      displayedH: naturalSize.h * baseScale * zoom,
      scale: baseScale * zoom,
    };
  };

  const handleZoomChange = (e, value) => {
    const { displayedW: oldW, displayedH: oldH } = getDisplayedSize();

    // find the point currently at box-center, in old displayed coords
    const centerX = CROP_BOX_SIZE / 2 - offset.x;
    const centerY = CROP_BOX_SIZE / 2 - offset.y;

    setZoom(value);

    const baseScale = getBaseScale(naturalSize.w, naturalSize.h);
    const newW = naturalSize.w * baseScale * value;
    const newH = naturalSize.h * baseScale * value;
    const ratioX = newW / oldW;
    const ratioY = newH / oldH;

    const newOffset = {
      x: CROP_BOX_SIZE / 2 - centerX * ratioX,
      y: CROP_BOX_SIZE / 2 - centerY * ratioY,
    };

    setOffset(clampOffset(newOffset, newW, newH));
  };

  const startDrag = (clientX, clientY) => {
    dragState.current = {
      dragging: true,
      startX: clientX,
      startY: clientY,
      startOffset: { ...offset },
    };
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragState.current.dragging) return;
    const { displayedW, displayedH } = getDisplayedSize();
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    const next = {
      x: dragState.current.startOffset.x + dx,
      y: dragState.current.startOffset.y + dy,
    };
    setOffset(clampOffset(next, displayedW, displayedH));
  };

  const endDrag = () => {
    dragState.current.dragging = false;
  };

  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
  const handleMouseUp = () => endDrag();

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => endDrag();

  const handleAdjustCancel = () => {
    setShowAdjustModal(false);
    setRawImage("");
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleAdjustSave = () => {
    const { scale } = getDisplayedSize();

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = CROP_BOX_SIZE / scale;

    ctx.drawImage(
      cropImgRef.current,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        setProfileFile(file);
        setProfileImage(previewUrl);

        setShowAdjustModal(false);
        setRawImage("");
      },
      "image/jpeg",
      0.92,
    );
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: currentUser?.firstName,
      lastName: currentUser?.lastName,
      email: currentUser?.email,
      mobile: currentUser?.mobile || "",
      dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
      gender: currentUser?.gender || "",
      bio: currentUser?.bio || "",
      profileImage: currentUser?.profileImage || "",
      zipcode: currentUser?.zipcode || "",
    });
  };

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
    dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
    gender: currentUser?.gender || "",
    bio: currentUser?.bio || "",
    profileImage: currentUser?.profileImage || "",
    zipcode: currentUser?.zipcode || "",
  });

  const validateForm = (formData) => {
    const errors = {};

    // First Name
    if (!formData.firstName?.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      errors.firstName = "Minimum 2 characters required";
    }

    // Last Name
    if (!formData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    // Email
    if (!formData.email) {
      errors.email = "Email is required";
    } else {
      const emailRegex =
        /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email =
          "Please enter a valid email address (e.g., name@domain.com) || (e.g., avair123@aviartech.com) ";
      }
    }

    const phone = formData.mobile?.trim();

    if (!phone) {
      errors.mobile = "Mobile number is required";
    } else if (!/^\+?\d{10,15}$/.test(phone)) {
      errors.mobile = "Please enter a valid mobile number (10–15 digits)";
    }

    // DOB (Age >= 18)
    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const today = new Date();
      const dob = new Date(formData.dob);
      let age = today.getFullYear() - dob.getFullYear();

      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        errors.dob = "You must be at least 18 years old";
      }
    }
    // ZipCode / Postal Code
    const zipcode = formData.zipcode?.trim();

    if (!zipcode) {
      errors.zipcode = "ZipCode is required";
    } else if (!/^[A-Za-z0-9](?:[A-Za-z0-9\s-]{0,14}[A-Za-z0-9])?$/.test(zipcode)) {
      errors.zipcode = "Please enter a valid ZipCode / Postal Code";
    }
    return errors;
  };

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
        email: currentUser?.email || "",
        mobile: currentUser?.mobile || "",
        dob: currentUser?.dob ? dayjs(currentUser.dob) : null,
        gender: currentUser?.gender || "",
        bio: currentUser?.bio || "",
        profileImage: currentUser?.profileImage || "",
        zipcode: currentUser?.zipcode || "",
      });

      setProfileImage(currentUser?.profileImage || "");
      setProfileFile(null);
    }
  }, [currentUser]);
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
  const feedRef = useRef(null);
  const logout = () => {
    localStorage.clear();
    window.location.replace("/login");
  };

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

  useEffect(() => {
    if (currentUser?._id) {
      getCommunityPost();
    }
  }, [currentUser]);
  const getCommunityPost = async () => {
    try {
      setCommunityLoading(true);
      const postsRes = await axios.get(Api + "/community/");
      const myPosts = postsRes.data.data.filter(
        (item) => item.authorId?._id === currentUser?._id,
      );

      setCommunityPosts(myPosts);
    } catch (error) {
      console.error(error);
    } finally {
      setCommunityLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSubmitLoading(true);
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      const data = new FormData();

      if (profileFile) {
        data.append("profileImage", profileFile);
      }

      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("mobile", formData.mobile);
      data.append("dob", formData.dob ? formData.dob.format("YYYY-MM-DD") : "");
      data.append("gender", formData.gender);
      data.append("bio", formData.bio);
      data.append("zipcode", formData.zipcode);

      await axios.post(Api + `/users/update/${user?.id}`, data);
      getuserData();
      toast.success("Profile Updated", toasts);
      setEditProfile(false);
    } catch (error) {
      console.log(error.response);
      toast.error(error.response.data.message, toasts);
    } finally {
      setSubmitLoading(false);
    }
  };

  const [tab, setTab] = useState(0);

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to Clipboard!", toasts);
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
                  alt={`${currentUser?.firstName || ""} ${
                    currentUser?.lastName || ""
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
                    `${currentUser?.firstName?.[0] || ""}${
                      currentUser?.lastName?.[0] || ""
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
                    <StatBlock value={communityPosts.length} label="Posts" />
                  </Stack>
                </Box>
              </Stack>

              <IconButton
                onClick={() => navigate("/myprofile")}
                sx={{
                  color: "#555",
                  ml: 1,
                }}
              >
                <MoreVertIcon />
              </IconButton>
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
                onClick={() => setEditProfile(true)}
                sx={{ ...pillBtn, borderColor: "#EADFD3" }}
              >
                Edit Profile
              </Button>
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
            {tab === 0 && !selectedPost && (
              <Grid
                container
                spacing={{ xs: "12px", sm: "15px", md: "20px" }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                {communityLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 45,
                      height: 45,
                    }}
                  >
                    <CircularProgress
                      size={30}
                      thickness={5}
                      sx={{ color: "#FF9933" }}
                    />
                  </Box>
                ) : communityPosts.length == 0 ? (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: { xs: "100%", sm: 440, md: 480 },
                      textAlign: "center",
                      flexDirection: "column",
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: { xs: '35%', sm: '7%' }
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
                    <Grid item xs={4} key={post._id} sx={{ mt: 1 }}>
                      {post.postImage && (
                        <Box
                          onClick={() => {
                            setSelectedPost(post);
                            setSelectedImage(
                              Array.isArray(post.postImage)
                                ? post.postImage[0]
                                : post.postImage,
                            );
                            setOpenImage(true);
                          }}
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            width: { xs: 90, sm: 100, md: 130, lg: 150 },
                            height: { xs: 110, sm: 130, md: 160, lg: 180 },
                            overflow: "hidden",
                            borderRadius: { xs: 0.5, sm: 1 },
                            "&:hover .postOverlay": { opacity: 1 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              Array.isArray(post.postImage)
                                ? post.postImage[0]
                                : post.postImage
                            }
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover ",
                              display: "block",
                            }}
                          />
                          <Box
                            className="postOverlay"
                            sx={{
                              position: "absolute",
                              inset: 0,
                              bgcolor: "rgba(0,0,0,0.15)",
                              opacity: 0,
                              transition: "opacity 0.15s ease",
                              display: { xs: "none", sm: "flex" },
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ color: "#fff" }}
                            >
                              <ThumbUpOffAltIcon fontSize="small" />
                              <ChatIcon fontSize="small" />
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {tab === 1 && !selectedPost && (
              <Grid
                container
                spacing={{ xs: "12px", sm: "15px", md: "20px" }}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                {communityLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 45,
                      height: 45,
                    }}
                  >
                    <CircularProgress
                      size={30}
                      thickness={5}
                      sx={{ color: "#FF9933" }}
                    />
                  </Box>
                ) : savedPost?.length <= 3 ? (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: { xs: "100%", sm: 440, md: 480 },
                      textAlign: "center",
                      flexDirection: "column",
                      mx: "auto",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: { xs: '35%', sm: '7%' }
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
                  savedPost?.map((post) => (
                    <Grid item xs={4} key={post._id} sx={{ mt: 1 }}>
                      {post.postId?.postImage && (
                        <Box
                          onClick={() => {
                            setSelectedPost(post);
                            setSelectedImage(
                              Array.isArray(post.postId.postImage)
                                ? post.postId.postImage[0]
                                : post.postId.postImage,
                            );
                            setOpenImage(true);
                          }}
                          sx={{
                            position: "relative",
                            cursor: "pointer",
                            width: { xs: 90, sm: 100, md: 130, lg: 150 },
                            height: { xs: 110, sm: 130, md: 160, lg: 180 },
                            overflow: "hidden",
                            borderRadius: { xs: 0.5, sm: 1 },
                            "&:hover .postOverlay": { opacity: 1 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={
                              Array.isArray(post.postId.postImage)
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

                          <Box
                            className="postOverlay"
                            sx={{
                              position: "absolute",
                              inset: 0,
                              bgcolor: "rgba(0,0,0,0.15)",
                              opacity: 0,
                              transition: "opacity 0.15s ease",
                              display: { xs: "none", sm: "flex" },
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{ color: "#fff" }}
                            >
                              <ThumbUpOffAltIcon fontSize="small" />
                              <ChatIcon fontSize="small" />
                            </Stack>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            <Dialog
              open={openImage}
              onClose={() => setOpenImage(false)}
              maxWidth={false}
              PaperProps={{
                sx: {
                  bgcolor: "transparent",
                  boxShadow: "none",
                  overflow: "hidden",
                  width: "auto",
                  maxWidth: "95vw",
                  maxHeight: "95vh",
                  m: 1,
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <IconButton
                  onClick={async () => {
                    if (!selectedPost?.postId?._id) {
                      console.log("Saved post ID missing");
                      return;
                    }

                    console.log(
                      "Removing saved post:",
                      selectedPost.postId._id,
                    );

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
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
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

                <IconButton
                  onClick={() => setOpenImage(false)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    color: "#fff",
                    bgcolor: "rgba(0,0,0,0.5)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    zIndex: 10,
                  }}
                >
                  <CloseIcon />
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
            {/* </SectionCard> */}
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

      {/* ── Edit Profile Modal ── */}
      <Modal
        open={editProfile}
        children={
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: "92%", sm: "100%" },
              px: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                bgcolor: "white",
                width: { xs: "100%", sm: "85%", md: 480, lg: 500 },
                maxWidth: 500,
                borderRadius: 2,
                boxShadow: 24,
                p: { xs: 2, sm: 3 },
                maxHeight: { xs: "85vh", sm: "90vh" },
                overflowY: "auto",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                  }}
                >
                  Edit Profile
                </Typography>

                <IconButton
                  aria-label="close"
                  onClick={() => setEditProfile(false)}
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ width: "100%" }}>
                <Stack alignItems="center" spacing={2}>
                  <Avatar
                    src={profileImage || formData.profileImage || ""}
                    sx={{
                      width: { xs: 60, sm: 75, md: 90 },
                      height: { xs: 60, sm: 75, md: 90 },
                      fontSize: { xs: 18, sm: 24, md: 32 },
                      bgcolor: SAFFRON,
                    }}
                  >
                    {!profileImage &&
                      !formData.profileImage &&
                      `${formData?.firstName?.[0] || ""}${formData?.lastName?.[0] || ""}`}
                  </Avatar>

                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    sx={{
                      fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                      textTransform: "none",
                      color: "#ffff",
                      bgcolor: "#FF9933",
                    }}
                  >
                    Change Photo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handlePickImage}
                    />
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ width: "100%" }}
                >
                  <TextField
                    name="firstName"
                    label="First Name"
                    size="small"
                    fullWidth
                    value={formData?.firstName}
                    onChange={handleChange}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />

                  <TextField
                    label="Last Name"
                    name="lastName"
                    size="small"
                    fullWidth
                    value={formData?.lastName}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    onChange={handleChange}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ width: "100%" }}
                >
                  <TextField
                    label="Email"
                    name="email"
                    size="small"
                    fullWidth
                    value={formData?.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />

                  <TextField
                    label="Mobile Number"
                    name="mobile"
                    size="small"
                    fullWidth
                    value={formData?.mobile || ""}
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value
                        .replace(/[^\d+]/g, "")
                        .replace(/(?!^)\+/g, "")
                        .slice(0, 16);

                      handleChange({ target: { name: "mobile", value } });
                    }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                    inputProps={{ maxLength: 16 }}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  sx={{ width: "100%" }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Date of Birth"
                      value={formData?.dob}
                      onChange={(newValue) => {
                        setFormData((prev) => ({ ...prev, dob: newValue }));
                        setErrors((prev) => ({ ...prev, dob: "" }));
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          error: !!errors.dob,
                          helperText: errors.dob,
                          fullWidth: true,
                          InputProps: {
                            sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                          },
                          InputLabelProps: {
                            sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                          },
                        },
                      }}
                      sx={{ width: { xs: "100%", sm: "48%" } }}
                    />
                  </LocalizationProvider>

                  <TextField
                    select
                    label="Gender"
                    name="gender"
                    size="small"
                    fullWidth
                    sx={{ width: { xs: "100%", sm: "48%" } }}
                    value={formData?.gender}
                    onChange={handleChange}
                    error={!!errors.gender}
                    helperText={errors.gender}
                    InputProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                    InputLabelProps={{
                      sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                    }}
                  >
                    <MenuItem
                      value="Male"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Male
                    </MenuItem>
                    <MenuItem
                      value="Female"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Female
                    </MenuItem>
                    <MenuItem
                      value="Other"
                      sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                    >
                      Other
                    </MenuItem>
                  </TextField>
                </Stack>

                <TextField
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData?.bio}
                  error={!!errors.bio}
                  helperText={errors.bio}
                  onChange={handleChange}
                  InputProps={{
                    sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                  }}
                  InputLabelProps={{
                    sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
                  }}
                />
                <TextField
                  label="ZipCode"
                  name="zipcode"
                  fullWidth
                  value={formData?.zipcode || ""}

                  error={!!errors.zipcode}
                  helperText={errors.zipcode}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      zipcode: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      zipcode: "",
                    }));
                  }}
                  inputProps={{ maxLength: 16 }}
                  InputProps={{
                    sx: {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    },
                  }}
                />

                <Stack
                  direction={{ xs: "row", sm: "row" }}
                  spacing={{ xs: 1, sm: 1.5 }}
                  sx={{
                    width: "100%",
                    mt: { xs: 0.5, sm: 1 },
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1.5, sm: 2.5 },
                      minWidth: { xs: "auto", sm: 90 },
                      bgcolor: "#757575",
                      color: "#ffff",
                      textTransform: "none",
                    }}
                    onClick={() => {
                      setProfileImage("");
                      resetForm();
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      py: { xs: 0.5, sm: 0.75 },
                      px: { xs: 1.5, sm: 2.5 },
                      minWidth: { xs: "auto", sm: 110 },
                      bgcolor: "#FF9933",
                      color: "#fff",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#ef9104" },
                    }}
                    onClick={handleUpdateProfile}
                    disabled={submitLoading}
                  >
                    {submitLoading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        }
      />

      {/* ── Adjust Photo Modal (shows selected image, drag + zoom, then submit) ── */}
      <Modal open={showAdjustModal} onClose={handleAdjustCancel}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "62%", sm: 340 },
            bgcolor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 2,
            outline: "none",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: "1.05rem",
            }}
          >
            Adjust Photo
          </Typography>

          <IconButton
            onClick={handleAdjustCancel}
            sx={{
              position: "absolute",
              top: 7,
              right: 10,
              zIndex: 2,
              color: "rgba(0,0,0,0.8)",
              bgcolor: "#fff",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.6)",
                color: "#fff",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Draggable / zoomable preview box */}
          <Box
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              position: "relative",
              width: { xs: 190, sm: CROP_BOX_SIZE },
              height: { xs: 190, sm: CROP_BOX_SIZE },
              mx: "auto",
              borderRadius: "50%",
              overflow: "hidden",
              bgcolor: "#222",
              cursor: "grab",
              touchAction: "none",
              border: "2px solid #FF9933",
            }}
          >
            {rawImage && (
              <img
                ref={cropImgRef}
                src={rawImage}
                alt="Selected"
                onLoad={handleCropImageLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  left: offset.x,
                  top: offset.y,
                  width: getDisplayedSize().displayedW || "auto",
                  height: getDisplayedSize().displayedH || "auto",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>

          {/* Zoom slider */}
          <Box sx={{ px: 1, mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.05}
              onChange={handleZoomChange}
              sx={{ color: "#FF9933" }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "#757575", color: "#fff", textTransform: "none" }}
              onClick={handleAdjustCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#FF9933",
                color: "#fff",
                textTransform: "none",
                "&:hover": { bgcolor: "#ef9104" },
              }}
              onClick={handleAdjustSave}
            >
              Use Photo
            </Button>
          </Stack>
        </Box>
      </Modal>
    </PageLayout>
  );
};

export default UserProfile;
