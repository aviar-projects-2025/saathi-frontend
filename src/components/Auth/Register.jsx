import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Modal,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import CloseIcon from "@mui/icons-material/Close";

import Api from "../../Api";
import ToastConfig from "../ToastConfig";
import uploadToCloudinary from "../uploadToCloudinary";

const ORANGE = "#C83F08";
const NAVY = "#132858";
const BG = "#FAF8F5";

const CROP_BOX_SIZE = 260;
const CROP_BOX_SIZE_MOBILE = 190;
const OUTPUT_SIZE = 500;

const LANGUAGES = [
  "Tamil",
  "English",
  "Hindi",
  "Telugu",
  "Gujarati",
  "Punjabi",
  "Malayalam",
  "Kannada",
  "Marathi",
  "Bengali",
];

const Register = () => {
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const [searchParams] = useSearchParams();

  const invitationToken = searchParams.get("ref") || "";

  const [step, setStep] = useState(0);
  const [invitation, setInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [invitationError, setInvitationError] = useState("");

  const [countryCode, setCountryCode] = useState("+1");
  const [mobileNumber, setMobileNumber] = useState("");
  const fullMobileNumber = `${countryCode}${mobileNumber}`;

  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ---------- Photo: matches EditProfile pattern ---------- */
  const [profileFile, setProfileFile] = useState(null); // raw File after crop
  const [profileImage, setProfileImage] = useState(""); // preview (blob:)
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

  const otpInputRefs = useRef([]);
  const fileInputRef = useRef(null);

  const isProduction =
    import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "production";
  const isTesting =
    import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "testing";

  useEffect(() => {
    if (isProduction) setCountryCode("+1");
  }, [isProduction]);

  /* ---------- Validate invitation ---------- */
  useEffect(() => {
    let cancelled = false;

    const validateInvitation = async () => {
      setInvitationLoading(true);
      setInvitationError("");
      setInvitation(null);

      if (!invitationToken) {
        setInvitationError(
          "A valid Saathi Rides invitation link is required."
        );
        setInvitationLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${Api}/referralInvite/validate`,
          { params: { token: invitationToken } }
        );

        if (cancelled) return;

        if (response.data?.success && response.data?.invitation) {
          setInvitation(response.data.invitation);
        } else {
          setInvitationError(
            response.data?.message || "This invitation link is invalid."
          );
        }
      } catch (error) {
        if (!cancelled) {
          setInvitationError(
            error.response?.data?.message ||
              "This invitation is invalid or has expired."
          );
        }
      } finally {
        if (!cancelled) setInvitationLoading(false);
      }
    };

    validateInvitation();

    return () => {
      cancelled = true;
    };
  }, [invitationToken]);

  /* ---------- OTP timer ---------- */
  useEffect(() => {
    if (otpTimer <= 0) return undefined;
    const timer = setTimeout(() => {
      setOtpTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpTimer]);

  /* ---------- Cleanup preview URL ---------- */
  useEffect(() => {
    return () => {
      if (profileImage?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  /* ================= Styles ================= */
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#FFFFFF",
      borderRadius: "10px",
      "& fieldset": { borderColor: "#DDD5CC" },
      "&:hover fieldset": { borderColor: ORANGE },
      "&.Mui-focused fieldset": { borderColor: ORANGE },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
  };

  const primaryButtonSx = {
    minHeight: 52,
    borderRadius: "12px",
    backgroundColor: ORANGE,
    color: "#FFFFFF",
    textTransform: "none",
    fontSize: 15,
    fontWeight: 700,
    boxShadow: "none",
    "&:hover": { backgroundColor: "#A93205", boxShadow: "none" },
    "&.Mui-disabled": {
      backgroundColor: "#E3C9BE",
      color: "#FFFFFF",
    },
  };

  const headingSx = {
    color: NAVY,
    fontWeight: 800,
    letterSpacing: "-0.4px",
  };

  /* ================= OTP actions ================= */
  const handleSendOtp = async () => {
    if (!invitation || invitationError || invitationLoading) {
      toast.error("Please use a valid invitation link.", toasts);
      return;
    }
    if (mobileNumber.length !== 10) {
      setOtpError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(`${Api}/auth/send-otp`, {
        mobileNumber: fullMobileNumber,
        invitationToken,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setIsOtpVerified(false);
      setOtp("");
      setOtpTimer(60);
      setStep(1);

      toast.success("OTP sent successfully!", toasts);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(`${Api}/auth/verify-otp`, {
        mobileNumber: fullMobileNumber,
        otp,
        invitationToken,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Invalid OTP");
      }

      setIsOtpVerified(true);
      setStep(2);
      toast.success("Mobile number verified successfully!", toasts);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Invalid OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length > 1) {
      const pastedOtp = digits.slice(0, 6);
      setOtp(pastedOtp);
      const focusIndex = Math.min(pastedOtp.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
      return;
    }

    const updated = otp.split("");
    updated[index] = digits;
    const nextOtp = updated.join("").slice(0, 6);

    setOtp(nextOtp);
    setOtpError("");

    if (digits && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0 || isLoading) return;
    await handleSendOtp();
  };

  /* ================= Photo crop (copied from EditProfile) ================= */
  const getBaseScale = (w, h, cropSize) =>
    w && h ? Math.max(cropSize / w, cropSize / h) : 1;

  const getDisplayedSize = (cropSize) => {
    const baseScale = getBaseScale(naturalSize.w, naturalSize.h, cropSize);
    return {
      displayedW: naturalSize.w * baseScale * zoom,
      displayedH: naturalSize.h * baseScale * zoom,
      scale: baseScale * zoom,
    };
  };

  const clampOffset = (nextOffset, displayedW, displayedH, cropSize) => {
    const minX = cropSize - displayedW;
    const minY = cropSize - displayedH;
    return {
      x: Math.min(0, Math.max(minX, nextOffset.x)),
      y: Math.min(0, Math.max(minY, nextOffset.y)),
    };
  };

  const cropSize = CROP_BOX_SIZE; // register uses same size for all breakpoints

  const handleCropImageLoad = (e) => {
    const w = e.target.naturalWidth;
    const h = e.target.naturalHeight;
    setNaturalSize({ w, h });

    const baseScale = getBaseScale(w, h, cropSize);
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
    const { displayedW, displayedH } = getDisplayedSize(cropSize);
    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    const next = {
      x: dragState.current.startOffset.x + dx,
      y: dragState.current.startOffset.y + dy,
    };
    setOffset(clampOffset(next, displayedW, displayedH, cropSize));
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
    const { displayedW: oldW, displayedH: oldH } = getDisplayedSize(cropSize);

    if (!oldW || !oldH) {
      setZoom(value);
      return;
    }

    const centerX = cropSize / 2 - offset.x;
    const centerY = cropSize / 2 - offset.y;

    setZoom(value);

    const baseScale = getBaseScale(naturalSize.w, naturalSize.h, cropSize);
    const newW = naturalSize.w * baseScale * value;
    const newH = naturalSize.h * baseScale * value;
    const ratioX = newW / oldW;
    const ratioY = newH / oldH;

    const newOffset = {
      x: cropSize / 2 - centerX * ratioX,
      y: cropSize / 2 - centerY * ratioY,
    };

    setOffset(clampOffset(newOffset, newW, newH, cropSize));
  };

  const handleAdjustSave = () => {
    const { scale } = getDisplayedSize(cropSize);

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

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image.", toasts);
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Your photo must be 5 MB or smaller.", toasts);
      e.target.value = "";
      return;
    }

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

  /* ================= Validation ================= */
  const validationSchema = Yup.object({
    firstName: Yup.string().trim().required("First name is required"),
    lastName: Yup.string().trim().required("Last name is required"),
    city: Yup.string().trim().required("City is required"),
    gender: Yup.string().default(""),
    languages: Yup.array().of(Yup.string()),
  });

  /* ================= Submit ================= */
  const registerSubmit = async (values, { setSubmitting }) => {
    if (!isOtpVerified) {
      toast.error("Please verify your mobile number first.", toasts);
      setSubmitting(false);
      return;
    }

    if (!invitationToken || !invitation?.referralCode) {
      setServerError("Your invitation is invalid or has expired.");
      setSubmitting(false);
      return;
    }

    if (!profileFile) {
      setServerError("Please add a profile photo to continue.");
      setSubmitting(false);
      return;
    }

    setServerError("");
    setSubmitting(true);

    try {
      // 1. Upload cropped photo to Cloudinary (same helper as EditProfile)
      const uploaded = await uploadToCloudinary(profileFile);

      // 2. Send plain JSON with Cloudinary URL
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        gender: values.gender || "",
        mobile: fullMobileNumber,
        city: values.city.trim(),
        languages: values.languages || [],
        language: values.languages || [],
        referralCode: invitation.referralCode,
        invitationToken,
        profileImage: uploaded.url,
        imagePublicId: uploaded.publicId,
      };

      const response = await axios.post(`${Api}/users/`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Registration failed.");
      }

      setStep(3);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      setServerError(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= Shared brand ================= */
  const renderBrand = () => (
    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 3 }}>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          backgroundColor: ORANGE,
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        S
      </Avatar>
      <Typography
        sx={{
          color: NAVY,
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-0.4px",
        }}
      >
        Saathi
      </Typography>
    </Stack>
  );

  /* ================= STEP 0 — invitation ================= */
  const renderInvitationStep = () => (
    <>
      {renderBrand()}

      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h4" sx={headingSx}>
          You're invited
        </Typography>
        <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.55 }}>
          Saathi is a referral-only community. Your invite comes from a
          member who will vouch for you.
        </Typography>
      </Box>

      {invitationLoading ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <CircularProgress size={22} sx={{ color: ORANGE }} />
          <Typography>Validating your invitation...</Typography>
        </Paper>
      ) : invitationError ? (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
          {invitationError}
        </Alert>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 1.8,
            mb: 3,
            borderRadius: 3,
            borderColor: "#E8DED4",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#FFE0C8",
              color: "#9D350E",
              fontWeight: 800,
              width: 48,
              height: 48,
            }}
          >
            {(invitation?.referrerName || "S")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} color="#25211E">
              {invitation?.referrerName} invited you
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {invitation?.memberSince || "Oct 2026"} ·{" "}
              {invitation?.city || "Dallas, TX"}
            </Typography>
          </Box>
        </Paper>
      )}

      <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
        {countryCode === "+1" ? "US" : "International"} mobile number
      </Typography>

      <Stack direction="row" spacing={1}>
        {isProduction && (
          <TextField value="+1" disabled sx={{ width: 74, ...inputSx }} />
        )}

        {isTesting && (
          <TextField
            select
            value={countryCode}
            onChange={(event) => {
              setCountryCode(event.target.value);
              setMobileNumber("");
              setOtp("");
              setIsOtpSent(false);
              setIsOtpVerified(false);
              setOtpError("");
            }}
            sx={{ width: 100, ...inputSx }}
          >
            <MenuItem value="+1">🇺🇸 +1</MenuItem>
            <MenuItem value="+91">🇮🇳 +91</MenuItem>
          </TextField>
        )}

        <TextField
          fullWidth
          placeholder="(555) 010-0142"
          value={mobileNumber}
          disabled={isOtpSent}
          onChange={(event) => {
            setMobileNumber(
              event.target.value.replace(/\D/g, "").slice(0, 10)
            );
            setOtpError("");
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: "#777" }} />
              </InputAdornment>
            ),
          }}
          sx={inputSx}
        />
      </Stack>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 0.7, color: "#625D57" }}
      >
        We will text you a 6-digit code.
      </Typography>

      <FormControlLabel
        sx={{ mt: 2, alignItems: "flex-start" }}
        control={
          <Checkbox
            size="small"
            defaultChecked
            sx={{
              color: ORANGE,
              "&.Mui-checked": { color: ORANGE },
              pt: 0.2,
            }}
          />
        }
        label={
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            I agree to receive SMS from Saathi for verification codes and
            ride updates. Message and data rates may apply. Reply STOP to
            opt out, HELP for help.{" "}
            <Link to="/sms-terms" style={{ color: ORANGE }}>
              SMS terms
            </Link>
          </Typography>
        }
      />

      <FormControlLabel
        sx={{ mt: 0.2, mb: 2 }}
        control={
          <Checkbox
            size="small"
            defaultChecked
            sx={{
              color: ORANGE,
              "&.Mui-checked": { color: ORANGE },
            }}
          />
        }
        label={
          <Typography variant="body2">
            I accept the{" "}
            <Link to="/terms" style={{ color: ORANGE }}>
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" style={{ color: ORANGE }}>
              Privacy Policy
            </Link>
            .
          </Typography>
        }
      />

      {otpError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {otpError}
        </Alert>
      )}

      <Button
        fullWidth
        onClick={handleSendOtp}
        disabled={
          isLoading ||
          invitationLoading ||
          Boolean(invitationError) ||
          !invitation ||
          mobileNumber.length !== 10
        }
        sx={primaryButtonSx}
      >
        {isLoading ? "Sending code..." : "Send code"}
      </Button>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 2,
          color: "#625D57",
          textAlign: "center",
        }}
      >
        Saathi is a community coordination tool, not a licensed
        transportation service.
      </Typography>
    </>
  );

  /* ================= STEP 1 — OTP ================= */
  const renderOtpStep = () => (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => setStep(0)}
        sx={{
          color: ORANGE,
          textTransform: "none",
          fontWeight: 700,
          px: 0,
          mb: 2,
        }}
      >
        Back
      </Button>

      <Typography variant="h4" sx={headingSx}>
        Enter your code
      </Typography>

      <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.55 }}>
        We sent a 6-digit code to {countryCode} {mobileNumber}. It expires
        in 10 minutes.
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        sx={{ mt: 3.5, mb: 1.5 }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <TextField
            key={index}
            inputRef={(element) => {
              otpInputRefs.current[index] = element;
            }}
            value={otp[index] || ""}
            onChange={(event) =>
              handleOtpChange(index, event.target.value)
            }
            onKeyDown={(event) => handleOtpKeyDown(index, event)}
            inputProps={{
              inputMode: "numeric",
              maxLength: 1,
              "aria-label": `OTP digit ${index + 1}`,
              style: {
                textAlign: "center",
                fontSize: 23,
                fontWeight: 800,
                padding: "12px 0",
              },
            }}
            sx={{
              width: "16%",
              ...inputSx,
            }}
          />
        ))}
      </Stack>

      <Typography variant="body2" sx={{ color: "#625D57", mb: 2.5 }}>
        Didn't get it?{" "}
        <Button
          onClick={handleResendOtp}
          disabled={otpTimer > 0 || isLoading}
          sx={{
            minWidth: 0,
            p: 0,
            textTransform: "none",
            color: ORANGE,
            fontWeight: 700,
            "&.Mui-disabled": { color: "#B99A8E" },
          }}
        >
          Resend code
        </Button>{" "}
        {otpTimer > 0
          ? `(available in 0:${String(otpTimer).padStart(2, "0")})`
          : ""}
      </Typography>

      {otpError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {otpError}
        </Alert>
      )}

      <Button
        fullWidth
        onClick={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        sx={primaryButtonSx}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>
    </>
  );

  /* ================= STEP 2 — Profile ================= */
  const renderProfileStep = () => {
    const displayed = getDisplayedSize(cropSize);

    return (
      <>
        <Typography variant="h4" sx={headingSx}>
          Create your profile
        </Typography>

        <Typography sx={{ mt: 0.7, mb: 2.5, color: "#57534E" }}>
          Real name and a clear photo help the person who invited you
          approve you.
        </Typography>

        {/* Photo picker — opens crop modal just like EditProfile */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handlePickImage}
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 76,
              height: 88,
              minWidth: 76,
              border: `2px dashed ${ORANGE}`,
              borderRadius: 3,
              color: ORANGE,
              textTransform: "none",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {profileImage ? (
              <Avatar src={profileImage} sx={{ width: 62, height: 62 }} />
            ) : (
              <>
                <AddAPhotoOutlinedIcon />
                <Typography fontSize={12} fontWeight={700}>
                  Add photo
                </Typography>
              </>
            )}
          </Button>

          <Typography variant="body2" color="#625D57">
            Required. A clear photo of your face. JPG, PNG or WebP, up to
            5 MB.
          </Typography>
        </Stack>

        <Formik
          enableReinitialize
          initialValues={{
            firstName: "",
            lastName: "",
            city: "",
            gender: "",
            languages: ["Tamil", "English"],
          }}
          validationSchema={validationSchema}
          onSubmit={registerSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {serverError && (
                  <Alert
                    severity="error"
                    onClose={() => setServerError("")}
                    sx={{ borderRadius: 2 }}
                  >
                    {serverError}
                  </Alert>
                )}

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    fullWidth
                    label="First name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    sx={inputSx}
                  />
                  <TextField
                    fullWidth
                    label="Last name"
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    sx={inputSx}
                  />
                </Stack>

                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  select
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city && Boolean(errors.city)}
                  helperText={touched.city && errors.city}
                  sx={inputSx}
                >
                  {[
                    "Chicago, IL",
                    "Dallas, TX",
                    "Houston, TX",
                    "Los Angeles, CA",
                    "New York, NY",
                    "San Francisco, CA",
                    "Other",
                  ].map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </TextField>

                <Box>
                  <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                    Languages spoken{" "}
                    <Typography component="span" variant="caption">
                      (optional)
                    </Typography>
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" gap={0.8}>
                    {LANGUAGES.map((language) => {
                      const selected = values.languages.includes(language);
                      return (
                        <Chip
                          key={language}
                          label={language}
                          clickable
                          onClick={() => {
                            const nextLanguages = selected
                              ? values.languages.filter(
                                  (item) => item !== language
                                )
                              : [...values.languages, language];
                            setFieldValue("languages", nextLanguages);
                          }}
                          sx={{
                            borderRadius: "20px",
                            backgroundColor: selected
                              ? ORANGE
                              : "#FFFFFF",
                            color: selected ? "#FFFFFF" : "#25211E",
                            border: "1px solid #DDD5CC",
                            fontWeight: selected ? 700 : 400,
                            "&:hover": {
                              backgroundColor: selected
                                ? "#A93205"
                                : "#F3E9E1",
                            },
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>

                <FormControl fullWidth>
                  <TextField
                    select
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    sx={inputSx}
                  >
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                  <Typography
                    variant="caption"
                    sx={{ color: "#625D57", mt: 0.5 }}
                  >
                    Used only for women-only rides.
                  </Typography>
                </FormControl>

                <TextField
                  fullWidth
                  label="Referral code"
                  value={invitation?.referralCode || ""}
                  disabled
                  sx={inputSx}
                />

                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#E8F0FE",
                    color: "#1A3E8A",
                    "& .MuiAlert-icon": { color: "#1A3E8A" },
                  }}
                >
                  Profile 80% complete. Add a photo to finish. Posting and
                  requesting unlock at 100% and after approval.
                </Alert>

                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting || submitting || !isOtpVerified}
                  sx={{ ...primaryButtonSx, mt: 1 }}
                >
                  {isSubmitting || submitting
                    ? "Submitting..."
                    : "Submit for approval"}
                </Button>
              </Stack>
            </form>
          )}
        </Formik>

        {/* ---- Crop modal (identical to EditProfile) ---- */}
        <Modal open={showAdjustModal} onClose={handleAdjustCancel}>
          <Box
            sx={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "80%", sm: 340 },
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3, fontSize: "1.05rem" }}
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
                width: cropSize,
                height: cropSize,
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
                sx={{
                  bgcolor: "#757575",
                  color: "#fff",
                  textTransform: "none",
                }}
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

  /* ================= STEP 3 — Waiting ================= */
  const renderWaitingStep = () => (
    <>
      {renderBrand()}

      <Box
        sx={{
          mt: 2,
          mb: 2,
          width: 64,
          height: 64,
          borderRadius: "50%",
          backgroundColor: "#FFF1C2",
          color: "#9C4A0A",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography variant="h4" sx={headingSx}>
        Waiting for {invitation?.referrerName || "your referrer"} to approve
      </Typography>

      <Typography sx={{ mt: 1, color: "#57534E", lineHeight: 1.6 }}>
        We texted {invitation?.referrerName || "your referrer"} to review
        your request. Once they approve, you can find and post rides.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          borderColor: "#E8DED4",
        }}
      >
        {[
          { label: "Phone verified", sub: null },
          { label: "Profile submitted", sub: null },
          {
            label: `Approval from ${
              invitation?.referrerName || "your referrer"
            }`,
            sub: "Reminder sent after 48 hours. Expires in 14 days.",
          },
        ].map((item, index) => {
          const isDone = index < 2;
          const isCurrent = index === 2;
          return (
            <Stack
              key={item.label}
              direction="row"
              alignItems="flex-start"
              spacing={1.5}
              sx={{ mb: index === 2 ? 0 : 2 }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                  backgroundColor: isDone
                    ? "#176B3A"
                    : isCurrent
                    ? "#FFF1C2"
                    : "#EFEFEF",
                  color: isDone
                    ? "#FFFFFF"
                    : isCurrent
                    ? "#9C4A0A"
                    : "#666",
                  border: isCurrent ? "2px solid #C65B11" : "none",
                }}
              >
                {isDone ? <CheckCircleIcon fontSize="small" /> : index + 1}
              </Avatar>

              <Box sx={{ pt: 0.2 }}>
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>
                  {item.label}
                </Typography>
                {item.sub && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25 }}
                  >
                    {item.sub}
                  </Typography>
                )}
              </Box>
            </Stack>
          );
        })}
      </Paper>

      <Typography
        variant="body2"
        sx={{ mt: 2.5, color: "#57534E", lineHeight: 1.6 }}
      >
        While you wait you can edit your profile. Browsing, posting and
        requesting are locked until you are approved.
      </Typography>

      <Button
        fullWidth
        onClick={() => navigate("/login")}
        sx={{
          ...primaryButtonSx,
          mt: 3,
          backgroundColor: "#FFFFFF",
          color: ORANGE,
          border: `1.5px solid ${ORANGE}`,
          "&:hover": {
            backgroundColor: "#FFF3EC",
            borderColor: ORANGE,
          },
        }}
      >
        Go to login
      </Button>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: BG,
        display: "flex",
        justifyContent: "center",
        alignItems: { xs: "flex-start", sm: "center" },
        px: 2,
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ width: "100%" }}>
          {step === 0 && renderInvitationStep()}
          {step === 1 && renderOtpStep()}
          {step === 2 && renderProfileStep()}
          {step === 3 && renderWaitingStep()}
        </Box>
      </Container>
    </Box>
  );
};

export default Register;