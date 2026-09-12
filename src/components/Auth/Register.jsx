import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link as MuiLink,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Collapse,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Api from "../../Api";
import { toast } from "react-toastify";
import Saathi from "../../assets/saathilogo.png";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ToastConfig from "../ToastConfig";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";

const Register = () => {
  const navigate = useNavigate();
  const toasts = ToastConfig();
  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get("ref") || "";

  // State for OTP flow
  const [activeStep, setActiveStep] = useState(0);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    referralCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const otpInputRefs = useRef([]);

  // OTP timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Validation schema for registration
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z]{2,})+$/,
        "Please enter a valid email address"
      ),
    referralCode: Yup.string().required("Referral Code is required"),
    password: Yup.string()
      .matches(/^[A-Z]/, "Password must start with an uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
        "Password must contain at least one special character"
      )
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  // Send OTP
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number", toasts);
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {

      const res = await axios.post(`${Api}/referralInvite/check`,
        {
          mobile : mobileNumber
        }
      )

      console.log(res)

      if(res?.status === false){
        toast.warning(res?.message)
        return 
      }

      const response = await axios.post(`${Api}/auth/send-otp`, {
        mobileNumber: mobileNumber,
      });

      if (response.data.success) {
        setIsOtpSent(true);
        setOtpTimer(60);
        setCanResendOtp(false);
        toast.success("OTP sent successfully!", toasts);
        // Focus first OTP input after 500ms
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 500);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const response = await axios.post(`${Api}/auth/verify-otp`, {
        mobileNumber: mobileNumber,
        otp: otp,
      });

      if (response.data.success) {
        setIsOtpVerified(true);
        setActiveStep(1);
        toast.success("Mobile number verified successfully!", toasts);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP";
      setOtpError(message);
      toast.error(message, toasts);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    await handleSendOtp();
  };

  // Handle OTP input change (6-digit)
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split("");
      const newOtp = [...otp.split("")];
      otpArray.forEach((char, i) => {
        if (i < 6) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp.join(""));
      // Focus last filled input
      const lastIndex = Math.min(otpArray.length, 5);
      if (otpInputRefs.current[lastIndex]) {
        otpInputRefs.current[lastIndex].focus();
      }
      return;
    }

    const newOtp = otp.split("");
    newOtp[index] = value;
    setOtp(newOtp.join(""));

    // Auto-advance to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Registration submit
  const registerSubmit = async (values, { setSubmitting }) => {
    if (!isOtpVerified) {
      toast.error("Please verify your mobile number first", toasts);
      return;
    }

    try {
      setServerError("");
      setFieldErrors({
        email: "",
        referralCode: "",
      });

      // Add mobile number to values
      const payload = {
        ...values,
        mobileNumber: mobileNumber,
        isMobileVerified: true,
      };

      const res = await axios.post(`${Api}/users/`, payload);

      toast.success("Registration Success!", toasts);

      console.log(res,'res')

      if (res?.data?.data?.refApprove === "Approved") {
        navigate("/login");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";

      if (message.toLowerCase().includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes("referral")) {
        setFieldErrors((prev) => ({ ...prev, referralCode: message }));
      } else {
        setServerError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#FFFFFF",
      borderRadius: "12px",
      "& input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
        WebkitTextFillColor: "#000000",
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderRadius: "12px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#FF9933",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#FF9933",
    },
  };

  // Render OTP verification section
  const renderOtpSection = () => (
    <Box sx={{ mt: 2 }}>
      {/* Mobile Number Input */}
      <TextField
        fullWidth
        label="Enter Mobile Number"
        placeholder="Enter 10-digit mobile number"
        value={mobileNumber}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
          setMobileNumber(value);
          if (isOtpSent) {
            setIsOtpSent(false);
            setOtp("");
          }
        }}
        disabled={isOtpSent}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon sx={{ color: "#666" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {isOtpSent && (
                <CheckCircleIcon sx={{ color: "#4CAF50", fontSize: 20 }} />
              )}
            </InputAdornment>
          ),
        }}
        sx={inputSx}
        size="small"
      />

      {/* Send OTP Button */}
      {!isOtpSent && (
        <Button
          fullWidth
          variant="contained"
          onClick={handleSendOtp}
          disabled={isLoading || mobileNumber.length < 10}
          sx={{
            mt: 2,
            py: 1.2,
            background: "#FF9933",
            color: "#fff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "999px",
            "&:hover": { background: "#e6862c" },
            "&:disabled": {
              background: "#ccc",
              color: "#666",
            },
          }}
        >
          {isLoading ? "Sending..." : "Send OTP"}
        </Button>
      )}

      {/* OTP Input Section */}
      <Collapse in={isOtpSent}>
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: "#666", mb: 1, textAlign: "center" }}
          >
            Enter the 6-digit OTP sent to {mobileNumber}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            {[...Array(6)].map((_, index) => (
              <TextField
                key={index}
                inputRef={(el) => (otpInputRefs.current[index] = el)}
                value={otp[index] || ""}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "bold",
                  },
                }}
                sx={{
                  width: 48,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#FFFFFF",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FF9933",
                    },
                  },
                }}
                disabled={isOtpVerified}
                autoFocus={index === 0}
              />
            ))}
          </Stack>

          {otpError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
              {otpError}
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length < 6 || isOtpVerified}
              sx={{
                py: 1.2,
                background: "#4CAF50",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "999px",
                "&:hover": { background: "#388E3C" },
                "&:disabled": {
                  background: "#ccc",
                  color: "#666",
                },
              }}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </Stack>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {canResendOtp ? (
                <MuiLink
                  component="button"
                  onClick={handleResendOtp}
                  sx={{ fontWeight: 600, color: "#FF9933" }}
                >
                  Resend OTP
                </MuiLink>
              ) : (
                `Resend OTP in ${otpTimer}s`
              )}
            </Typography>
          </Box>
        </Box>
      </Collapse>

      {/* Verified Status */}
      {isOtpVerified && (
        <Alert
          icon={<CheckCircleIcon />}
          severity="success"
          sx={{
            mt: 2,
            borderRadius: "12px",
            bgcolor: "#E8F5E9",
          }}
        >
          Mobile number verified successfully!
        </Alert>
      )}
    </Box>
  );

  // Render registration form
  const renderRegistrationForm = () => (
    <Formik
      enableReinitialize
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        mobile : mobileNumber,
        role: "USER",
        referralCode: referralFromUrl,
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
      }) => (
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {serverError && (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                {serverError}
              </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                size="small"
                sx={inputSx}
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                size="small"
                sx={inputSx}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={values.email}
              onChange={(e) => {
                handleChange(e);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              onBlur={handleBlur}
              error={Boolean(
                (touched.email && errors.email) || fieldErrors.email
              )}
              helperText={
                (touched.email && errors.email) || fieldErrors.email
              }
              size="small"
              sx={inputSx}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />

            <TextField
              fullWidth
              type={"text"}
              label="Mobile Number"
              name="mobile"
              disabled
              value={mobileNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.mobile && Boolean(errors.mobile)}
              helperText={touched.mobile && errors.mobile}
              size="small"
              sx={inputSx}
            />

            <TextField
              fullWidth
              label="Referral Code"
              name="referralCode"
              type="text"
              value={values.referralCode}
              InputProps={{
                readOnly: !!referralFromUrl,
              }}
              onChange={(e) => {
                handleChange(e);
                setFieldErrors((prev) => ({
                  ...prev,
                  referralCode: "",
                }));
              }}
              onBlur={handleBlur}
              error={Boolean(
                (touched.referralCode && errors.referralCode) ||
                fieldErrors.referralCode
              )}
              helperText={
                (touched.referralCode && errors.referralCode) ||
                fieldErrors.referralCode
              }
              size="small"
              sx={inputSx}
            />

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              sx={{
                mt: 1,
                py: 1.2,
                background: "#FF9933",
                color: "#fff",
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 700,
                borderRadius: "999px",
                "&:hover": { background: "#e6862c" },
              }}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </Stack>
        </form>
      )}
    </Formik>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 100%)",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Banner */}
          <Box
            sx={{
              height: 110,
              background: "linear-gradient(135deg, #FF9933 0%, #FF7F00 100%)",
              position: "relative",
            }}
          />

          {/* Avatar straddling the seam */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: "-50px" }}>
            <Avatar
              src={Saathi}
              alt="Profile"
              sx={{
                width: 125,
                height: 143,
                border: "4px solid #fff",
                backgroundColor: "#1A1A1A",
              }}
            />
          </Box>

          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4, pt: 2 }}>
            <Typography
              variant="h5"
              align="center"
              fontWeight={800}
              sx={{ mb: 0.5 }}
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "#666", mb: 2 }}
            >
              {!isOtpVerified
                ? "Verify your mobile number to get started"
                : "Complete your profile"}
            </Typography>

            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 3,
                "& .MuiStepIcon-root.Mui-active": {
                  color: "#FF9933",
                },
                "& .MuiStepIcon-root.Mui-completed": {
                  color: "#4CAF50",
                },
                "& .MuiStepLabel-label.Mui-active": {
                  fontWeight: 600,
                  color: "#FF9933",
                },
              }}
            >
              <Step>
                <StepLabel>Verify Mobile</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete Profile</StepLabel>
              </Step>
            </Stepper>

            {/* Conditional Rendering */}
            <Fade in={!isOtpVerified} timeout={300}>
              <Box>{!isOtpVerified && renderOtpSection()}</Box>
            </Fade>

            <Fade in={isOtpVerified} timeout={300}>
              <Box>{isOtpVerified && renderRegistrationForm()}</Box>
            </Fade>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#333" }}>
                Already have an account?{" "}
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 600, color: "#FF9933" }}
                >
                  Login
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;