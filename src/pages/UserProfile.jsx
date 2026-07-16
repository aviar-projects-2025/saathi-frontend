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
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import PageLayout from "../components/PageLayout";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";
import Mypost from './Myprofile.jsx'

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

const SAFFRON = "#E8650A";
const SAFFRON_LIGHT = "#FDF0E8";
const CARD_BORDER = "1px solid #F0E6DC";

import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";



const pillBtn = {
    textTransform: "none",
    border: "none",
    fontSize: { xs: "0.60rem", sm: "0.8rem", md: "0.875rem" },
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
            sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" }, lineHeight: 1.2 }}
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


    const [openComments, setOpenComments] = useState({});
    const handleToggleComments = (id) => {
        setOpenComments((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const { currentUser, getuserData } = useUser()

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [editProfile, setEditProfile] = useState(false)
    const [profileImage, setProfileImage] = useState(currentUser?.profileImage || "");
    const [profileFile, setProfileFile] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false)
    const [passwordModel, setPasswordModel] = useState('')
    const user = JSON.parse(localStorage.getItem('user'))
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();

    const [openShare, setOpenShare] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const handleOpenShare = () => setOpenShare(true);
    const handleCloseShare = () => setOpenShare(false);


    const [openImage, setOpenImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const shareLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
    });

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

    const handleProfileImage = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setProfileFile(file);
        setProfileImage(URL.createObjectURL(file));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
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


            const postsRes = await axios.get(Api + "/community/");
            console.log("postsRes", postsRes)
            // Only current user's posts
            const myPosts = postsRes.data.data.filter(
                (item) => item.authorId?._id === currentUser?._id
            );

            setCommunityPosts(myPosts);

        } catch (error) {
            console.error(error);
        }
    };
    const handleUpdateProfile = async () => {
        try {
            setSubmitLoading(true)
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

            await axios.post(Api + `/users/update/${user?.id}`, data)
            getuserData()
            toast.success("Profile updated")
            setEditProfile(false)
        } catch (error) {
            console.log(error);
        } finally {
            setSubmitLoading(false)
        }
    };

    const [tab, setTab] = useState(0);
    const handleCopy = (value) => {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard!");
    };

    return (
        <PageLayout>
            <Box sx={{ mx: "auto", px: { xs: 0, sm: 2, md: 0 } }}>
                {/* Page heading */}
                <Box sx={{ px: { xs: 1.5, sm: 0 }, pt: { xs: 2, sm: 0 }, mb: 1, flexShrink: 0 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' } }}>
                        My Profile
                    </Typography>
                </Box>

                <Typography
                    color="text.secondary"
                    sx={{ mt: { xs: 1, sm: 1 }, fontSize: { xs: "0.72rem", sm: "1rem", md: "1rem" } }}
                >
                    Manage your Saathi account, referrals, and preferences.
                </Typography>

                <Stack spacing={{ xs: 1.25, sm: 1.75, md: 3 }}
                    sx={{ mt: 2 }}>

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
                                    sx={{
                                        width: { xs: 64, sm: 84, md: 96 },
                                        height: { xs: 64, sm: 84, md: 96 },
                                        bgcolor: SAFFRON,
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
                                        flexShrink: 0,
                                    }}
                                >
                                    {!currentUser?.profileImage &&
                                        `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
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
                            sx={{ mt: { xs: 1.5, sm: 2 } }}
                        >
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setEditProfile(true)}
                                sx={{ ...pillBtn, borderColor: "#EADFD3" }}
                            >
                                Edit Profile
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleOpenShare}
                                sx={{ ...pillBtn, borderColor: "#EADFD3" }}
                            >
                                Share Profile
                            </Button>
                        </Stack>
                    </SectionCard>

                    <SectionCard>
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
                                mb: 3
                            }}
                        >
                            <Tab icon={<GridOnIcon fontSize="small" />} />
                            <Tab icon={<BookmarkBorderIcon fontSize="small" />} />
                        </Tabs>
                        {tab === 0 && !selectedPost && (
                            <Grid container spacing={{ xs: "12px", sm: "15px", md: "20px" }}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignContent: "center",
                                    alignItems: "center"
                                }} >
                                {communityPosts.map((post) => (
                                    <Grid item xs={4} key={post._id} sx={{ mt: 1 }}>
                                        {post.postImage && (
                                            <Box
                                                // onClick={() => setSelectedPost(post)}
                                                onClick={() => {
                                                    setSelectedImage(
                                                        Array.isArray(post.postImage)
                                                            ? post.postImage[0]
                                                            : post.postImage
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
                                                    alignItems: "center"
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
                                                    <Stack direction="row" spacing={2} sx={{ color: "#fff" }}>
                                                        <ThumbUpOffAltIcon fontSize="small" />
                                                        <ChatIcon fontSize="small" />
                                                    </Stack>
                                                </Box>
                                            </Box>
                                        )}
                                    </Grid>
                                ))}
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
                            <IconButton
                                onClick={() => setOpenImage(false)}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    color: "#fff",
                                    bgcolor: "rgba(0,0,0,0.5)",
                                    "&:hover": {
                                        bgcolor: "rgba(0,0,0,0.7)",
                                    },
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
                        </Dialog>

                    </SectionCard>
                </Stack>
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
                            <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ width: "100%" }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                        fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.25rem" },
                                        mb: { xs: 0.5, sm: 1 },
                                    }}
                                >
                                    Edit Profile
                                </Typography>

                                <Stack alignItems="center" spacing={1}>
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
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                        sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                                    >
                                        Change Photo
                                        <input
                                            hidden
                                            type="file"
                                            accept="image/*"
                                            onChange={handleProfileImage}
                                        />
                                    </Button>
                                </Stack>

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={{ xs: 1.5, sm: 2 }}
                                    sx={{ width: "100%" }}
                                >
                                    <TextField
                                        name="firstName"
                                        label="First Name"
                                        size="small"
                                        fullWidth
                                        value={formData?.firstName}
                                        onChange={handleChange}
                                        InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                        InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                    />

                                    <TextField
                                        label="Last Name"
                                        name="lastName"
                                        size="small"
                                        fullWidth
                                        value={formData?.lastName}
                                        onChange={handleChange}
                                        InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                        InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
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
                                        disabled
                                        InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                        InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                    />

                                    <TextField
                                        label="Mobile Number"
                                        name="mobile"
                                        size="small"
                                        fullWidth
                                        value={formData?.mobile}
                                        onChange={handleChange}
                                        InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                        InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
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
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    dob: newValue,
                                                }));
                                            }}
                                            slotProps={{
                                                textField: {
                                                    size: "small",
                                                    fullWidth: true,
                                                    InputProps: { sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } },
                                                    InputLabelProps: { sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } },
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
                                        InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                        InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                    >
                                        <MenuItem value="Male" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Male</MenuItem>
                                        <MenuItem value="Female" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Female</MenuItem>
                                        <MenuItem value="Other" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>Other</MenuItem>
                                    </TextField>
                                </Stack>

                                <TextField
                                    label="Bio"
                                    name="bio"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={formData?.bio}
                                    onChange={handleChange}
                                    InputProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                    InputLabelProps={{ sx: { fontSize: { xs: "0.8rem", sm: "0.9rem" } } }}
                                />

                                <Stack
                                    direction={{ xs: "row-reverse", sm: "row" }}
                                    spacing={{ xs: 1, sm: 1.5 }}
                                    // justifyContent="flex-end"
                                    // alignItems="center"
                                    sx={{ width: "100%", mt: { xs: 0.5, sm: 1 }, display: "flex", justifyContent: "end" }}
                                >
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            width: { xs: "100%", sm: "auto" },
                                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                                            py: { xs: 0.5, sm: 0.75 },
                                            px: { xs: 1.5, sm: 2.5 },
                                            minWidth: { xs: "auto", sm: 90 },
                                        }}
                                        onClick={() => {
                                            setProfileImage("");
                                            setEditProfile(false);
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
                                        }}
                                        onClick={handleUpdateProfile}
                                        disabled={submitLoading}
                                    >
                                        Save Changes
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </Box>
                }
            />

        </PageLayout>
    );
};

export default UserProfile;




