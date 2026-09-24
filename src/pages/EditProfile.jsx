import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    Stack,
    Avatar,
    Button,
    useMediaQuery,
    useTheme,
    Modal,
    TextField,
    Menu,
    ListItemText,
    MenuItem,
    IconButton,
    Slider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import uploadToCloudinary from "../components/uploadToCloudinary.jsx";
import { useUser } from "../context/userConetext";
import Api from "../Api";

const CROP_BOX_SIZE = 260;
const CROP_BOX_SIZE_MOBILE = 190;
const OUTPUT_SIZE = 500;
const SAFFRON = "#E8650A";
const fieldFont = {
    sx: {
        fontSize: { xs: "0.8rem", sm: "0.9rem" },
    },
};

const buildFormData = (user) => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    dob: user?.dob ? dayjs(user.dob) : null,
    gender: user?.gender || "",
    bio: user?.bio || "",
    profileImage: user?.profileImage || "",
    zipcode: user?.zipcode || "",
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

    if (!formData.email) {
        errors.email = "Email is required";
    } else {
        const emailRegex =
            /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z]{2,})+$/i;
        if (!emailRegex.test(formData.email)) {
            errors.email =
                "Please enter a valid email address (e.g., name@domain.com)";
        }
    }

    // Mobile
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


    const zipcode = formData.zipcode?.trim();
    if (!zipcode) {
        errors.zipcode = "ZipCode is required";
    } else if (!/^[A-Za-z0-9](?:[A-Za-z0-9\s-]{0,14}[A-Za-z0-9])?$/.test(zipcode)) {
        errors.zipcode = "Please enter a valid ZipCode / Postal Code";
    }

    return errors;
};

const EditProfile = ({ open, onClose }) => {
    const { currentUser, getuserData } = useUser();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const cropSize = isMobile ? CROP_BOX_SIZE_MOBILE : CROP_BOX_SIZE;
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [profileImage, setProfileImage] = useState(
        currentUser?.profileImage || ""
    );
    const [profileFile, setProfileFile] = useState(null);
    const [formData, setFormData] = useState(buildFormData(currentUser));


    const [photoMenuAnchor, setPhotoMenuAnchor] = useState(null);
    const isPhotoMenuOpen = Boolean(photoMenuAnchor);
    const cameraFileRef = useRef(null);
    const galleryFileRef = useRef(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [rawImage, setRawImage] = useState("");
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const cropImgRef = useRef(null);
    const dragState = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        startOffset: { x: 0, y: 0 },
    });

    useEffect(() => {
        if (currentUser) {
            setFormData(buildFormData(currentUser));
            setProfileImage(currentUser?.profileImage || "");
            setProfileFile(null);
        }
    }, [currentUser]);

    const handleCloseProfile = () => {
        onClose?.();
    };

    const getBaseScale = (w, h) =>
        w && h ? Math.max(cropSize / w, cropSize / h) : 1;

    const getDisplayedSize = () => {
        const baseScale = getBaseScale(naturalSize.w, naturalSize.h);
        return {
            displayedW: naturalSize.w * baseScale * zoom,
            displayedH: naturalSize.h * baseScale * zoom,
            scale: baseScale * zoom,
        };
    };

    const clampOffset = (nextOffset, displayedW, displayedH) => {
        const minX = cropSize - displayedW;
        const minY = cropSize - displayedH;
        return {
            x: Math.min(0, Math.max(minX, nextOffset.x)),
            y: Math.min(0, Math.max(minY, nextOffset.y)),
        };
    };

    const handleCropImageLoad = (e) => {
        const w = e.target.naturalWidth;
        const h = e.target.naturalHeight;
        setNaturalSize({ w, h });

        const baseScale = getBaseScale(w, h);
        const displayedW = w * baseScale;
        const displayedH = h * baseScale;

        setOffset({
            x: (cropSize - displayedW) / 2,
            y: (cropSize - displayedH) / 2,
        });
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

    const handleZoomChange = (e, value) => {
        const { displayedW: oldW, displayedH: oldH } = getDisplayedSize();


        if (!oldW || !oldH) {
            setZoom(value);
            return;
        }

        const centerX = cropSize / 2 - offset.x;
        const centerY = cropSize / 2 - offset.y;

        setZoom(value);

        const baseScale = getBaseScale(naturalSize.w, naturalSize.h);
        const newW = naturalSize.w * baseScale * value;
        const newH = naturalSize.h * baseScale * value;
        const ratioX = newW / oldW;
        const ratioY = newH / oldH;

        const newOffset = {
            x: cropSize / 2 - centerX * ratioX,
            y: cropSize / 2 - centerY * ratioY,
        };

        setOffset(clampOffset(newOffset, newW, newH));
    };

    const handleAdjustSave = () => {
        const { scale } = getDisplayedSize();

        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext("2d");

        const sx = -offset.x / scale;
        const sy = -offset.y / scale;
        const sSize = cropSize / scale;

        ctx.drawImage(
            cropImgRef.current,
            sx,
            sy,
            sSize,
            sSize,
            0,
            0,
            OUTPUT_SIZE,
            OUTPUT_SIZE
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                const previewUrl = URL.createObjectURL(blob);

                // free the previous preview to avoid a memory leak
                if (profileImage?.startsWith("blob:")) {
                    URL.revokeObjectURL(profileImage);
                }

                setProfileFile(file);
                setProfileImage(previewUrl);

                setShowAdjustModal(false);
                setRawImage("");
                setZoom(1);
                setOffset({ x: 0, y: 0 });
            },
            "image/jpeg",
            0.92
        );
    };

    const handleAdjustCancel = () => {
        setShowAdjustModal(false);
        setRawImage("");
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };



    const handlePhotoMenuOpen = (event) => setPhotoMenuAnchor(event.currentTarget);
    const handlePhotoMenuClose = () => setPhotoMenuAnchor(null);

    const handlePickImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setRawImage(reader.result);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setShowAdjustModal(true);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleCameraClick = () => {
        handlePhotoMenuClose();
        cameraFileRef.current?.click();
    };

    const handleFileClick = () => {
        handlePhotoMenuClose();
        galleryFileRef.current?.click();
    };

    const resetForm = () => {
        setFormData(buildFormData(currentUser));
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

    const handleUpdateProfile = async () => {
        try {
            setSubmitLoading(true);

            const validationErrors = validateForm(formData);

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            let uploadedImage = null;


            if (profileFile) {
                uploadedImage = await uploadToCloudinary(profileFile);
            }

            const data = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                mobile: formData.mobile,
                dob: formData.dob ? formData.dob.format("YYYY-MM-DD") : "",
                gender: formData.gender,
                bio: formData.bio,
                zipcode: formData.zipcode,

                ...(uploadedImage && {
                    profileImage: uploadedImage?.url,
                    profileImagePublicId: uploadedImage?.publicId,
                }),
            };

            await axios.post(`${Api}/users/update/${currentUser?._id}`, data);

            getuserData();

            toast.success("Profile Updated", toast);

            handleCloseProfile();
        } catch (error) {
            console.log(error.response);
        } finally {
            setSubmitLoading(false);
        }
    };

    const displayed = getDisplayedSize();

    return (
        <>

            <Modal
                open={!!open}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") {
                        return;
                    }
                    handleCloseProfile();
                }}
            >
                <Box
                    sx={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: {
                            xs: "92%",
                            sm: "100%",
                        },
                        px: {
                            xs: 2,
                            sm: 0,
                        },
                        outline: "none",
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "white",
                            width: {
                                xs: "100%",
                                sm: "85%",
                                md: 480,
                                lg: 500,
                            },
                            maxWidth: 500,
                            borderRadius: 2,
                            boxShadow: 24,
                            p: {
                                xs: 2,
                                sm: 3,
                            },
                            maxHeight: {
                                xs: "85vh",
                                sm: "90vh",
                            },
                            overflowY: "auto",
                        }}
                    >
                        {/* Modal Header */}
                        <Box
                            sx={{
                                position: "relative",
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 2,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.15rem",
                                        md: "1.25rem",
                                    },
                                }}
                            >
                                Edit Profile
                            </Typography>

                            <IconButton
                                aria-label="close"
                                onClick={handleCloseProfile}
                                sx={{
                                    position: "absolute",
                                    right: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "text.secondary",
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                    },
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>


                        <Box
                            sx={{
                                mb: 2.5,
                                p: {
                                    xs: 1.5,
                                    sm: 2,
                                },
                                borderRadius: 2,
                                backgroundColor: "#FFF8F2",
                                border: "1px solid #F4D8C2",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: "0.78rem",
                                        sm: "0.85rem",
                                    },
                                    fontWeight: 700,
                                    color: "#5D4037",
                                    mb: 0.5,
                                }}
                            >
                                🔒 Your information helps us keep Saathi Rides safe
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: "0.7rem",
                                        sm: "0.78rem",
                                    },
                                    lineHeight: 1.5,
                                    color: "text.secondary",
                                }}
                            >
                                Some details may be requested to help us verify accounts,
                                maintain a trusted community, and improve the safety and
                                security of Saathi Rides. We understand that personal
                                information is sensitive, so we only ask for information
                                that helps support these purposes.
                            </Typography>
                        </Box>

                        <Stack
                            spacing={{
                                xs: 1.5,
                                sm: 2.5,
                            }}
                            sx={{
                                width: "100%",
                            }}
                        >
                            {/* Profile Image */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Avatar
                                    src={profileImage || formData.profileImage || ""}
                                    sx={{
                                        width: {
                                            xs: 60,
                                            sm: 85,
                                            md: 110,
                                        },
                                        height: {
                                            xs: 60,
                                            sm: 85,
                                            md: 110,
                                        },
                                        fontSize: {
                                            xs: 18,
                                            sm: 24,
                                            md: 32,
                                        },
                                        bgcolor: SAFFRON,
                                    }}
                                >
                                    {!profileImage &&
                                        !formData.profileImage &&
                                        `${formData?.firstName?.[0] || ""}${formData?.lastName?.[0] || ""}`}
                                </Avatar>

                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handlePhotoMenuOpen}
                                    sx={{
                                        width: { xs: "100px", sm: "120px" },
                                        minWidth: 0,
                                        height: { xs: "30px", sm: "34px" },
                                        px: 1,
                                        py: 0,
                                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                        textTransform: "none",
                                        color: "#fff",
                                        bgcolor: "#FF9933",
                                        "&:hover": {
                                            bgcolor: "#e68a2e",
                                        },
                                    }}
                                >
                                    Change Photo
                                </Button>

                                {/* Photo options */}
                                <Menu
                                    anchorEl={photoMenuAnchor}
                                    open={isPhotoMenuOpen}
                                    onClose={handlePhotoMenuClose}
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
                                        onClick={handleCameraClick}
                                        sx={{
                                            "&:hover": {
                                                color: "#E8650A",
                                            },
                                        }}
                                    >
                                        <ListItemText primary="Camera" />
                                    </MenuItem>

                                    <MenuItem
                                        onClick={handleFileClick}
                                        sx={{
                                            "&:hover": {
                                                color: "#E8650A",
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box>
                                                    <Box sx={{ display: { xs: "block", sm: "none" } }}>
                                                        Gallery
                                                    </Box>

                                                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                                                        File
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                    </MenuItem>
                                </Menu>

                                {/* Camera input */}
                                <input
                                    ref={cameraFileRef}
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePickImage}
                                />

                                {/* File input */}
                                <input
                                    ref={galleryFileRef}
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePickImage}
                                />
                            </Box>

                            {/* First Name / Last Name */}
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={{
                                    xs: 2,
                                    sm: 3,
                                }}
                                sx={{
                                    width: "100%",
                                }}
                            >
                                <TextField
                                    name="firstName"
                                    label="First Name"
                                    size="small"
                                    fullWidth
                                    value={formData?.firstName}
                                    onChange={handleChange}
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
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
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
                                />
                            </Stack>

                            {/* Email / Mobile */}
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={{
                                    xs: 1.5,
                                    sm: 2,
                                }}
                                sx={{
                                    width: "100%",
                                }}
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
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
                                />

                                <TextField
                                    label="Mobile Number"
                                    name="mobile"
                                    disabled
                                    size="small"
                                    fullWidth
                                    value={formData?.mobile || ""}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/[^\d+]/g, "")
                                            .replace(/(?!^)\+/g, "")
                                            .slice(0, 16);

                                        handleChange({
                                            target: {
                                                name: "mobile",
                                                value,
                                            },
                                        });
                                    }}
                                    error={!!errors.mobile}
                                    helperText={errors.mobile}
                                    inputProps={{
                                        maxLength: 16,
                                    }}
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
                                />
                            </Stack>


                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={{
                                    xs: 1.5,
                                    sm: 2,
                                }}
                                sx={{
                                    width: "100%",
                                }}
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

                                            setErrors((prev) => ({
                                                ...prev,
                                                dob: "",
                                            }));
                                        }}
                                        slotProps={{
                                            textField: {
                                                size: "small",
                                                error: !!errors.dob,
                                                helperText: errors.dob,
                                                fullWidth: true,
                                                InputProps: fieldFont,
                                                InputLabelProps: fieldFont,
                                            },
                                        }}
                                        sx={{
                                            width: {
                                                xs: "100%",
                                                sm: "48%",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>

                                <TextField
                                    select
                                    label="Gender"
                                    name="gender"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "48%",
                                        },
                                    }}
                                    value={formData?.gender}
                                    onChange={handleChange}
                                    error={!!errors.gender}
                                    helperText={errors.gender}
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
                                >
                                    <MenuItem value="Male" sx={fieldFont.sx}>
                                        Male
                                    </MenuItem>

                                    <MenuItem value="Female" sx={fieldFont.sx}>
                                        Female
                                    </MenuItem>
                                </TextField>
                            </Stack>

                            {/* Profession */}
                            <TextField
                                label="Profession"
                                name="bio"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData?.bio}
                                error={!!errors.bio}
                                helperText={
                                    errors.bio ||
                                    "You can share your profession. For example: Software Engineer, Doctor, Teacher."
                                }
                                onChange={handleChange}
                                placeholder="Share a little about what you do..."
                                InputProps={fieldFont}
                                InputLabelProps={fieldFont}
                            />

                            {/* Zip Code */}
                            <TextField
                                label="ZipCode"
                                name="zipcode"
                                fullWidth
                                value={formData?.zipcode || ""}
                                error={!!errors.zipcode}
                                helperText={errors.zipcode}
                                onChange={handleChange}
                                inputProps={{
                                    maxLength: 16,
                                }}
                                InputProps={fieldFont}
                                InputLabelProps={fieldFont}
                            />

                            {/* Buttons */}
                            <Stack
                                direction="row"
                                spacing={{
                                    xs: 1,
                                    sm: 1.5,
                                }}
                                sx={{
                                    width: "100%",
                                    mt: {
                                        xs: 0.5,
                                        sm: 1,
                                    },
                                    display: "flex",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "auto",
                                        },
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.85rem",
                                        },
                                        py: {
                                            xs: 0.5,
                                            sm: 0.75,
                                        },
                                        px: {
                                            xs: 1.5,
                                            sm: 2.5,
                                        },
                                        minWidth: {
                                            xs: "auto",
                                            sm: 90,
                                        },
                                        bgcolor: "#757575",
                                        color: "#fff",
                                        textTransform: "none",
                                    }}
                                    onClick={() => {
                                        setProfileImage(currentUser?.profileImage || "");
                                        setProfileFile(null);
                                        resetForm();
                                        setErrors({});
                                    }}
                                >
                                    Reset
                                </Button>

                                <Button
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        width: {
                                            xs: "100%",
                                            sm: "auto",
                                        },
                                        fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.85rem",
                                        },
                                        py: {
                                            xs: 0.5,
                                            sm: 0.75,
                                        },
                                        px: {
                                            xs: 1.5,
                                            sm: 2.5,
                                        },
                                        minWidth: {
                                            xs: "auto",
                                            sm: 110,
                                        },
                                        bgcolor: "#FF9933",
                                        color: "#fff",
                                        textTransform: "none",
                                        "&:hover": {
                                            bgcolor: "#ef9104",
                                        },
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
            </Modal>


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
                        aria-label="close"
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
                            width: { xs: CROP_BOX_SIZE_MOBILE, sm: CROP_BOX_SIZE },
                            height: { xs: CROP_BOX_SIZE_MOBILE, sm: CROP_BOX_SIZE },
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
                                    width: displayed.displayedW || "auto",
                                    height: displayed.displayedH || "auto",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                }}
                            />
                        )}
                    </Box>


                    <Box sx={{ px: 1, mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Zoom
                        </Typography>
                        <Slider
                            aria-label="Zoom"
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
        </>
    );
};

export default EditProfile;
