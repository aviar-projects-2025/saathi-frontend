import React, { useState, useEffect, useRef, useMemo } from "react";
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
    FormControl,
    Select,
    InputLabel,
    Chip,
    FormHelperText,
    FormControlLabel,
    Menu,
    ListItemText,
    MenuItem,
    IconButton,
    Slider,
} from "@mui/material";

import { Autocomplete, createFilterOptions } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "react-toastify";
import uploadToCloudinary from "../components/uploadToCloudinary.jsx";
import { useUser } from "../context/userConetext";
import Api from "../Api";
import US_Cities from "../config/US_Cities.json"
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Popper from "@mui/material/Popper";

const CustomPopper = (props) => {
    return (
        <Popper
            {...props}
            placement="bottom-start"
            modifiers={[
                {
                    name: "offset",
                    options: {
                        offset: [0, 4],
                    },
                },
            ]}
            sx={{
                zIndex: 1500,

                "& .MuiPaper-root": {
                    width: "100%",
                    borderRadius: 0,
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.15)",
                },

                "& .MuiAutocomplete-listbox": {
                    padding: 0,
                    maxHeight: "500px",
                    overflowY: "auto",
                },

                "& .MuiAutocomplete-option": {
                    minHeight: "50px",
                    padding: "8px 22px !important",
                    fontSize: "23px",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 0,

                    "&[aria-selected='true']": {
                        backgroundColor: "#eaf3fb !important",
                    },

                    "&.Mui-focused": {
                        backgroundColor: "#eaf3fb !important",
                    },
                },
            }}
        />
    );
};

const CROP_BOX_SIZE = 260;
const CROP_BOX_SIZE_MOBILE = 190;
const OUTPUT_SIZE = 500;
const SAFFRON = "#E8650A";
const fieldFont = {
    sx: {
        fontSize: { xs: "0.8rem", sm: "0.9rem" },
    },
};

const EXCLUDED = ["AS", "FM", "GU", "MH", "MP", "PW", "PR", "VI", "AE", "AP"];
const tfSx = {
    "& .MuiInputBase-input": { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
};
const selectSx = { fontSize: { xs: "0.8rem", sm: "0.9rem" } };
const ilSx = { fontSize: { xs: "0.8rem", sm: "0.9rem" } };
// 1. Every city paired with its state (must come first)
const OPTIONS = US_Cities.filter((s) => !EXCLUDED.includes(s.abbr)).flatMap((s) =>
    s.cities.map((city) => ({
        city,
        state: s.state,
        abbr: s.abbr,
        label: `${city}, ${s.state}`,
    }))
);

// 2. "Other" option, then the full list that uses OPTIONS
const OTHER_OPTION = {
    city: "Other",
    state: "",
    abbr: "OTHER",
    label: "Other (my city is not listed)",
};
const AUTOCOMPLETE_OPTIONS = [...OPTIONS, OTHER_OPTION];

const filterOptions = (options, { inputValue }) => {
    const words = inputValue.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matches = [];
    for (const o of options) {
        if (o.abbr === "OTHER") continue;
        const hay = `${o.city} ${o.state} ${o.abbr}`.toLowerCase();
        if (words.every((w) => hay.includes(w))) {
            matches.push(o);
            if (matches.length === 50) break;
        }
    }
    return [...matches, OTHER_OPTION];
};
const buildFormData = (user) => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    // email: user?.email || "",
    language: user?.language || "",
    mobile: user?.mobile || "",
    dob: user?.dob ? dayjs(user.dob) : null,
    gender: user?.gender || "",
    bio: user?.bio || "",
    city: user?.city || "",
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


    // First Name
    if (!formData.city?.trim()) {
        errors.city = "City is required";
    }

    const phone = formData.mobile?.trim();
    if (!phone) {
        errors.mobile = "Mobile number is required";
    } else if (!/^\+?\d{10,15}$/.test(phone)) {
        errors.mobile = "Please enter a valid mobile number (10–15 digits)";
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
    const [changeMobile, setChangeMobile] = useState(false);
    const [newMobile, setNewMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [mobileLoading, setMobileLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [mobileError, setMobileError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (currentUser) {
            setFormData(buildFormData(currentUser));
            setProfileImage(currentUser?.profileImage || "");
            setProfileFile(null);
            syncCityUI(currentUser?.city);   // add
        }
    }, [currentUser]);

    const resetForm = () => {
        setFormData(buildFormData(currentUser));
        syncCityUI(currentUser?.city);       // add
    };

    const handleCloseProfile = () => {
        onClose?.();
    };


    const sendMobileOtp = async () => {
        if (!/^\+?\d{10,15}$/.test(newMobile)) {
            setMobileError("Enter a valid mobile number");
            return;
        }

        if (newMobile === formData.mobile) {
            setMobileError("Enter a different mobile number");
            return;
        }

        try {
            setMobileLoading(true);
            setMobileError("");

            await axios.post(
                `${Api}/auth/send-change-mobile-otp`,
                {
                    mobileNumber: newMobile,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOtpSent(true);
            toast.success("OTP sent successfully");
        } catch (error) {
            setMobileError(
                error?.response?.data?.message ||
                "Failed to send OTP"
            );
        } finally {
            setMobileLoading(false);
        }
    };

    const [otherLanguage, setOtherLanguage] = useState("");
    const verifyMobileOtp = async () => {
        if (!otp || otp.length !== 6) {
            setMobileError("Enter a valid 6-digit OTP");
            return;
        }

        try {
            setOtpLoading(true);
            setMobileError("");

            const response = await axios.post(
                `${Api}/auth/verify-change-mobile-otp`,
                {
                    mobileNumber: newMobile,
                    otp,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFormData((prev) => ({
                ...prev,
                mobile: response?.data?.mobile || newMobile,
            }));

            setChangeMobile(false);
            setOtpSent(false);
            setNewMobile("");
            setOtp("");

            // Refresh user data
            await getuserData();

            toast.success(
                response?.data?.message ||
                "Mobile number updated successfully"
            );
        } catch (error) {
            setMobileError(
                error?.response?.data?.message ||
                "Invalid or expired OTP"
            );
        } finally {
            setOtpLoading(false);
        }
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

    const update = (key, val) => {
        setFormData((prev) => ({ ...prev, [key]: val }));
        setErrors((prev) => {
            const newErrors = { ...prev };

            if (val && String(val).trim() !== "") {
                delete newErrors[key];
            }

            return newErrors;
        });
    };

    const languages = [
        "English",
        "Tamil",
        "Hindi",
        "Bengali",
        "Telugu",
        "Marathi",
        "Gujarati",
        "Kannada",
        "Malayalam",
        "Punjabi",
  
    ];

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
    const [value, setValue] = useState(null);
    const [isOtherCity, setIsOtherCity] = useState(false);
    const [otherCityState, setOtherCityState] = useState("");

    // Fills the city field from a saved string like "Austin, Texas"
    const syncCityUI = (saved = "") => {
        const match = AUTOCOMPLETE_OPTIONS.find(
            (o) => o.abbr !== "OTHER" && o.label === saved
        );
        if (match) {
            setValue(match); setIsOtherCity(false); setOtherCityState("");
        } else if (saved) {
            setValue(OTHER_OPTION); setIsOtherCity(true); setOtherCityState(saved);
        } else {
            setValue(null); setIsOtherCity(false); setOtherCityState("");
        }
    };
    const [languageOpen, setLanguageOpen] = useState(false);
    const handleCitiesChange = (event, newValue) => {
        const other = newValue?.abbr === "OTHER";
        setValue(newValue);
        setIsOtherCity(other);
        setOtherCityState("");
        setFormData((prev) => ({ ...prev, city: other ? "" : newValue?.label || "" }));
        setErrors((prev) => ({ ...prev, city: "" }));
    };

    const handleOtherCityChange = (e) => {
        setOtherCityState(e.target.value);
        setFormData((prev) => ({ ...prev, city: e.target.value }));
        setErrors((prev) => ({ ...prev, city: "" }));
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
                mobile: currentUser?.mobile,
                dob: formData.dob ? formData.dob.format("YYYY-MM-DD") : "",
                gender: formData.gender,
                bio: formData.bio,
                language: formData?.language,
                city: formData.city,
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
                                    {formData?.firstName?.[0]}{formData?.lastName?.[0]}
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
                                        <CameraAltIcon
                                            sx={{
                                                mr: 1,
                                                color: "#E8650A",
                                                fontSize: {
                                                    xs: "16px",
                                                    sm: "17px",
                                                    md: "18px",
                                                    lg: "20px",
                                                },
                                            }}
                                        />
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
                                        <InsertDriveFileIcon
                                            sx={{
                                                mr: 1,
                                                color: "#E8650A",
                                                fontSize: {
                                                    xs: "16px",
                                                    sm: "17px",
                                                    md: "18px",
                                                    lg: "20px",
                                                },
                                            }}
                                        />
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

                            {/* Mobile Number */}
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        mb: 0.7,
                                    }}
                                >
                                    Mobile Number
                                </Typography>

                                {!changeMobile ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 1,
                                            px: 1.5,
                                            py: 1,
                                            border: "1px solid #E0E0E0",
                                            borderRadius: 1.5,
                                            bgcolor: "#FAFAFA",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "0.9rem",
                                                color: "text.primary",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {formData?.mobile || "No mobile number"}
                                        </Typography>

                                        <Button
                                            size="small"
                                            onClick={() => {
                                                setChangeMobile(true);
                                                setMobileError("");
                                            }}
                                            sx={{
                                                minWidth: "auto",
                                                px: 1,
                                                textTransform: "none",
                                                color: "#E8650A",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Change
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            border: "1px solid #E8E8E8",
                                            borderRadius: 2,
                                            p: 1.5,
                                            bgcolor: "#FFFDFB",
                                        }}
                                    >
                                        {!otpSent ? (
                                            <>
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.8rem",
                                                        color: "text.secondary",
                                                        mb: 1,
                                                    }}
                                                >
                                                    Enter your new mobile number
                                                </Typography>

                                                <TextField
                                                    fullWidth
                                                    label="New Mobile Number"
                                                    size="small"
                                                    value={newMobile}
                                                    onChange={(e) => {
                                                        setNewMobile(
                                                            e.target.value
                                                                .replace(/[^\d+]/g, "")
                                                                .replace(/(?!^)\+/g, "")
                                                        );
                                                        setMobileError("");
                                                    }}
                                                    error={!!mobileError}
                                                    helperText={mobileError}
                                                    InputProps={fieldFont}
                                                    InputLabelProps={fieldFont}
                                                />

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ mt: 1.2 }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={sendMobileOtp}
                                                        disabled={mobileLoading}
                                                        sx={{
                                                            px: 2,
                                                            textTransform: "none",
                                                            bgcolor: "#E8650A",
                                                            "&:hover": {
                                                                bgcolor: "#D95D08",
                                                            },
                                                        }}
                                                    >
                                                        {mobileLoading ? "Sending..." : "Send OTP"}
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setChangeMobile(false);
                                                            setNewMobile("");
                                                            setMobileError("");
                                                        }}
                                                        sx={{
                                                            px: 1.5,
                                                            textTransform: "none",
                                                            color: "text.secondary",
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Stack>
                                            </>
                                        ) : (
                                            <>
                                                <Box
                                                    sx={{
                                                        mb: 1.2,
                                                        p: 1,
                                                        borderRadius: 1.5,
                                                        bgcolor: "#FFF5EC",
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: "0.78rem",
                                                            color: "#8A4B20",
                                                        }}
                                                    >
                                                        OTP sent to{" "}
                                                        <strong>{newMobile}</strong>
                                                    </Typography>
                                                </Box>

                                                <TextField
                                                    fullWidth
                                                    label="Enter OTP"
                                                    size="small"
                                                    value={otp}
                                                    onChange={(e) => {
                                                        setOtp(
                                                            e.target.value
                                                                .replace(/\D/g, "")
                                                                .slice(0, 6)
                                                        );
                                                        setMobileError("");
                                                    }}
                                                    error={!!mobileError}
                                                    helperText={mobileError}
                                                    inputProps={{
                                                        maxLength: 6,
                                                        inputMode: "numeric",
                                                    }}
                                                    InputProps={fieldFont}
                                                    InputLabelProps={fieldFont}
                                                />

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ mt: 1.2 }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={verifyMobileOtp}
                                                        disabled={otpLoading}
                                                        sx={{
                                                            px: 2,
                                                            textTransform: "none",
                                                            bgcolor: "#E8650A",
                                                            "&:hover": {
                                                                bgcolor: "#D95D08",
                                                            },
                                                        }}
                                                    >
                                                        {otpLoading
                                                            ? "Verifying..."
                                                            : "Verify OTP"}
                                                    </Button>

                                                    <Button
                                                        size="small"
                                                        onClick={() => {
                                                            setOtpSent(false);
                                                            setOtp("");
                                                            setMobileError("");
                                                        }}
                                                        sx={{
                                                            px: 1.5,
                                                            textTransform: "none",
                                                            color: "#E8650A",
                                                        }}
                                                    >
                                                        Change Number
                                                    </Button>
                                                </Stack>
                                            </>
                                        )}
                                    </Box>
                                )}
                            </Box>
                            <FormControl fullWidth>
                                <InputLabel sx={ilSx}>
                                  Languages I Speak
                                </InputLabel>

                                <Select
                              
                                    multiple
                                    open={languageOpen}
                                    onOpen={() => setLanguageOpen(true)}
                                    onClose={() => setLanguageOpen(false)}
                                    value={
                                        Array.isArray(formData?.language)
                                            ? formData.language
                                            : []
                                    }
                                     label="Languages I Speak"
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        update(
                                            "language",
                                            typeof value === "string"
                                                ? value.split(",")
                                                : value
                                        );
                                    }}
                                    sx={selectSx}
                                    renderValue={(selected) => (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 0.5,
                                                pr: 1,
                                            }}
                                        >
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    size="small"
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onDelete={(e) => {
                                                        e.stopPropagation();

                                                        update(
                                                            "language",
                                                            selected.filter(
                                                                (item) => item !== value
                                                            )
                                                        );

                                                        // Clear custom language
                                                        if (value === otherLanguage) {
                                                            setOtherLanguage("");
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        disablePortal: true,
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 300,
                                            },
                                        },
                                        MenuListProps: {
                                            sx: {
                                                pb: 0,
                                            },
                                        },
                                    }}
                                >
                                    {languages.map((lang) => (
                                        <MenuItem
                                            key={lang}
                                            value={lang}
                                        >
                                            {lang}
                                        </MenuItem>
                                    ))}

                                    {/* Select Button */}
                                    <Box
                                        sx={{
                                            position: "sticky",
                                            bottom: 0,
                                            backgroundColor: "#fff",
                                            borderTop: "1px solid #e0e0e0",
                                            p: 1,
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            zIndex: 2,
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setLanguageOpen(false);
                                            }}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 3,
                                                minWidth: 80,
                                                color: "#fff",
                                                mt: 0.5,
                                                bgcolor: "#E8650A",
                                                "&:hover": {
                                                    bgcolor: "#D95D08",
                                                },
                                            }}
                                        >
                                            Select
                                        </Button>
                                    </Box>
                                </Select>
                            </FormControl>
                            {/* {formData?.language?.includes("Other") && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Other Language"
                                    value={otherLanguage}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        setOtherLanguage(value);

                                        const existingLanguages = (
                                            formData?.language || []
                                        ).filter(
                                            (lang) =>
                                                languages.includes(lang) ||
                                                lang === "Other"
                                        );

                                        if (value.trim()) {
                                            update("language", [
                                                ...existingLanguages.filter(
                                                    (lang) => lang !== "Other"
                                                ),
                                                value.trim(),
                                            ]);
                                        }
                                    }}
                                    sx={{
                                        mt: 1.5,
                                    }}
                                    InputProps={fieldFont}
                                    InputLabelProps={fieldFont}
                                />
                            )} */}
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
                                        label="Date of Birth (Optional)"
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
                                                // error: !!errors.dob,
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

                            <Autocomplete
                                fullWidth
                                size="small"

                                options={AUTOCOMPLETE_OPTIONS}
                                value={value}

                                onChange={handleCitiesChange}
                                filterOptions={filterOptions}

                                getOptionLabel={(o) => o?.label || ""}

                                getOptionKey={(o) => `${o.abbr}-${o.city}`}

                                isOptionEqualToValue={(a, b) =>
                                    a.abbr === b.abbr && a.city === b.city
                                }

                                noOptionsText="No matching city"

                                slots={{
                                    popper: CustomPopper,
                                }}

                                slotProps={{
                                    listbox: {
                                        sx: {
                                            maxHeight: "200px",

                                            "& .MuiAutocomplete-option": {
                                                padding: "12px 20px",
                                                fontSize: "16px",
                                                textAlign: "left",
                                            },
                                        },
                                    },
                                }}

                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City, State"
                                        placeholder="Type a city or state"
                                        error={!isOtherCity && !!errors.city}
                                        helperText={!isOtherCity ? errors.city : ""}
                                    />
                                )}
                            />

                            {isOtherCity && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Enter City, State"
                                    placeholder="Enter your city and state"
                                    value={otherCityState}
                                    onChange={handleOtherCityChange}
                                    error={!!errors.city}
                                    helperText={errors.city}
                                />
                            )}
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
