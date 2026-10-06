// import { Formik } from "formik";
// import * as Yup from "yup";
// import {
//   Avatar,
//   Box,
//   Button,
//   Container,
//   Paper,
//   TextField,
//   Typography,
//   Link as MuiLink,
// } from "@mui/material";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "./../../context/AuthContext";
// import ROLES from "../../context/Role";
// import { toast } from "react-toastify";
// import Saathi from "../../assets/saathilogo.png";
// import { useTheme, useMediaQuery } from "@mui/material";
// import { useState } from "react";
// import InputAdornment from "@mui/material/InputAdornment";
// import IconButton from "@mui/material/IconButton";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import ToastConfig from "../ToastConfig";


// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const toasts = ToastConfig();

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const [serverError, setServerError] = useState("");

//   const validationSchema = Yup.object({
//     email: Yup.string()
//       .trim()
//       .lowercase()
//       .email("Please enter a valid Email address")
//       .matches(
//         /^[a-z0-9]+(?:[._%+-][a-z0-9]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z]{2,})+$/,
//         "Please enter a valid email address"
//       )
//       .required("Email is required"),
//     // password: Yup.string()
//     //   .matches(/^[A-Z]/, "Password must start with an uppercase letter")
//     //   .matches(/[a-z]/, "Password must contain at least one lowercase letter")
//     //   .matches(/[0-9]/, "Password must contain at least one number")
//     //   .matches(
//     //     /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
//     //     "Password must contain at least one special character"
//     //   )
//     //   .min(8, "Password must be at least 8 characters")
//     //   .required("Password is required"),
//   });

//   const loginSubmit = async (values) => {
//     try {
//       const data = await login(values);
//       if (data?.user.refApprove === "Approved") {
//         toast.success("Login Successful!", toasts);
//       } else {
//         toast.info("Login successful! Waiting for admin approval.", toasts);
//       }
//       window.location.href =
//         data?.user.role === ROLES.ADMIN
//           ? "/admin/dashboard"
//           : data?.user.refApprove === "Approved"
//             ? "/find-ride"
//             : "/waiting-approval";
//     } catch (error) {
//       // toast.error(error.message, toasts);
//       setServerError(
//         error.message ||
//         "Something went wrong. Please try again."
//       );
//     }
//   };

//   const [showPassword, setShowPassword] = useState(false);

//   const handleClickShowPassword = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleMouseDownPassword = (event) => {
//     event.preventDefault();
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         // background: "#F1EFEA",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="xs">
//         <Paper
//           elevation={3}
//           sx={{
//             borderRadius: 4,
//             overflow: "hidden",
//           }}
//         >
//           {/* Banner */}
//           <Box
//             sx={{
//               height: 110,
//               background: "#FF9933",
//               position: "relative",
//             }}
//           />

//           <Box sx={{ display: "flex", justifyContent: "center", mt: "-50px" }}>
//             <Avatar
//               src={Saathi}
//               alt="Profile"
//               sx={{
//                 width: 125,
//                 height: 143,
//                 border: "4px solid #fff",
//                 backgroundColor: "#1A1A1A",
//               }}
//             />
//           </Box>

//           <Box sx={{ px: 4, pb: 4, pt: 2 }}>
//             <Formik
//               initialValues={{ email: "", password: "" }}
//               validationSchema={validationSchema}
//               onSubmit={(values) => loginSubmit(values)}
//             >
//               {({
//                 values,
//                 errors,
//                 touched,
//                 handleChange,
//                 handleBlur,
//                 handleSubmit,
//                 isSubmitting,
//                 setFieldValue,
//               }) => (
//                 <form onSubmit={handleSubmit}>
//                   <Typography
//                     variant="h5"
//                     align="center"
//                     fontWeight={800}
//                     sx={{ mb: 3 }}
//                   >
//                     Account Login
//                   </Typography>

//                   <TextField
//                     fullWidth
//                     label="Email"
//                     name="email"
//                     value={values.email}
//                     // onChange={handleChange}
//                     onChange={(e) => {
//                       setFieldValue("email", e.target.value.toLowerCase());
//                     }}
//                     onBlur={handleBlur}
//                     error={touched.email && Boolean(errors.email)}
//                     helperText={touched.email && errors.email}
//                     margin="normal"
//                     size="small"
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         backgroundColor: "#FFFFFF",
//                         borderRadius: "12px",
//                         "& input:-webkit-autofill": {
//                           WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
//                           WebkitTextFillColor: "#000000",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           borderRadius: "12px",
//                         },
//                         "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                           borderColor: "#FF9933",
//                         },
//                       },
//                       "& .MuiInputLabel-root.Mui-focused": {
//                         color: "#FF9933",
//                       },
//                     }}
//                   />

//                   <TextField
//                     fullWidth
//                     type={showPassword ? "text" : "password"}
//                     label="Password"
//                     name="password"
//                     value={values.password}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     error={touched.password && Boolean(errors.password)}
//                     helperText={touched.password && errors.password}
//                     margin="normal"
//                     size="small"
//                     slotProps={{
//                       input: {
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <IconButton
//                               onClick={handleClickShowPassword}
//                               onMouseDown={handleMouseDownPassword}
//                               edge="end"
//                             >
//                               {showPassword ? (
//                                 <VisibilityOff />
//                               ) : (
//                                 <Visibility />
//                               )}
//                             </IconButton>
//                           </InputAdornment>
//                         ),
//                       },
//                     }}
//                     sx={{
//                       "& .MuiOutlinedInput-root": {
//                         backgroundColor: "#FFFFFF",
//                         borderRadius: "12px",
//                         "& input:-webkit-autofill": {
//                           WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",
//                           WebkitTextFillColor: "#000000",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           borderRadius: "12px",
//                         },
//                         "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                           borderColor: "#FF9933",
//                         },
//                       },
//                       "& .MuiInputLabel-root.Mui-focused": {
//                         color: "#FF9933",
//                       },
//                     }}
//                   />

//                   {serverError && (
//                     <Box
//                       sx={{
//                         mt: 1,
//                         px: 1.5,
//                         py: 1,
//                         borderRadius: 1.5,
//                         backgroundColor: "#FFF0F0",
//                         border: "1px solid #FFCDD2",
//                       }}
//                     >
//                       <Typography
//                         color="error"
//                         sx={{
//                           fontSize: { xs: "0.78rem", sm: "0.85rem" },
//                           fontWeight: 600,
//                         }}
//                       >
//                         {serverError}
//                       </Typography>
//                     </Box>
//                   )}

//                   <Button
//                     type="submit"
//                     disabled={isSubmitting}
//                     fullWidth
//                     sx={{
//                       mt: 3,
//                       py: 1.2,
//                       background: "#FF9933",
//                       color: "#ffff",
//                       textTransform: "none",
//                       fontSize: "14px",
//                       fontWeight: 700,
//                       borderRadius: "999px",
//                       "&:hover": { background: "#e6862c" },
//                     }}
//                   >
//                     {isSubmitting ? "Logging in..." : "Login"}
//                   </Button>

//                   <Box sx={{ textAlign: "center", mt: 3 }}>
//                     <Typography variant="body2" sx={{ color: "#333" }}>
//                       Don't have an account?{" "}
//                       <MuiLink
//                         component={Link}
//                         to="/register"
//                         underline="hover"
//                         sx={{ fontWeight: 600, color: "#FF9933" }}
//                       >
//                         Sign Up
//                       </MuiLink>
//                       <Box sx={{ textAlign: "center", mt: 1 }}>
//                         <MuiLink
//                           component={Link}
//                           to="/forget-password"
//                           underline="hover"
//                           sx={{
//                             fontWeight: 500,
//                             color: "#FF9933",
//                             fontSize: "14px",
//                           }}
//                         >
//                           Forgot Password?
//                         </MuiLink>
//                       </Box>
//                     </Typography>
//                   </Box>
//                 </form>
//               )}
//             </Formik>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Login;

import React, { useRef, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import ROLES from "../../context/Role";
import SaathiLogo from "../../assets/saathilogo.png";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { loginWithOtp } = useAuth();

    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [serverError, setServerError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL;

    const otpRefs = useRef([]);

    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOtp = async () => {
        setServerError("");

        const cleanedMobile = mobile.replace(/\D/g, "");

        if (!cleanedMobile) {
            setServerError("Please enter your mobile number.");
            return;
        }

        if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
            setServerError(
                "Please enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        try {
            setIsSendingOtp(true);

            const response = await fetch(
                `${API_URL}/auth/login/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobileNumber: cleanedMobile,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setMobile(cleanedMobile);
            setOtp(["", "", "", "", "", ""]);
            setOtpSent(true);

            toast.success("OTP sent successfully");

            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        } catch (error) {
            console.error("Send Login OTP Error:", error);

            setServerError(error.message || "Unable to send OTP");

            toast.error(error.message || "Unable to send OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // =====================================================
    // OTP CHANGE
    // =====================================================

    const handleOtpChange = (index, value) => {
        const numericValue = value.replace(/\D/g, "");

        if (!numericValue) {
            const newOtp = [...otp];
            newOtp[index] = "";

            setOtp(newOtp);
            setServerError("");

            return;
        }

        const newOtp = [...otp];

        // Handle paste / multiple digits
        if (numericValue.length > 1) {
            const digits = numericValue.slice(0, 6).split("");

            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });

            setOtp(newOtp);
            setServerError("");

            const nextIndex = Math.min(index + digits.length, 5);

            setTimeout(() => {
                otpRefs.current[nextIndex]?.focus();
            }, 0);

            return;
        }

        // Normal digit
        newOtp[index] = numericValue;

        setOtp(newOtp);
        setServerError("");

        if (index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // =====================================================
    // OTP KEYBOARD
    // =====================================================

    const handleOtpKeyDown = (index, event) => {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            otpRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowRight" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // =====================================================
    // VERIFY OTP + LOGIN
    // =====================================================

    const handleVerifyOtp = async () => {
        setServerError("");

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setServerError("Please enter the complete 6-digit OTP.");
            return;
        }

        try {
            setIsVerifyingOtp(true);

            const cleanedMobile = mobile.replace(/\D/g, "");

            const data = await loginWithOtp({
                mobileNumber: cleanedMobile,
                otp: otpValue,
            });

            if (data?.user?.refApprove === "Approved") {
                toast.success("Login successful");
            } else {
                toast.info(
                    "Your account is waiting for admin approval"
                );
            }

            console.log(data,'data')
            window.location.href =
                data?.user?.role === ROLES.ADMIN
                    ? "/admin/dashboard"
                    : data?.user?.refApprove === "Approved"
                    ? "/find-ride"
                    : "/waiting-approval";
        } catch (error) {
            console.error("Verify Login OTP Error:", error);

            setServerError(
                error.message || "Invalid or expired OTP"
            );

            toast.error(
                error.message || "Invalid or expired OTP"
            );
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    // =====================================================
    // CHANGE MOBILE NUMBER
    // =====================================================

    const handleChangeNumber = () => {
        setOtpSent(false);
        setOtp(["", "", "", "", "", ""]);
        setServerError("");
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(135deg, #fff8f0 0%, #ffffff 50%, #fff3e0 100%)",
                px: 2,
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 430,
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.10)",
                    px: isMobile ? 3 : 4,
                    py: isMobile ? 3.5 : 4.5,
                }}
            >
                {/* LOGO */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 1.5,
                    }}
                >
                    <Box
                        component="img"
                        src={SaathiLogo}
                        alt="Saathi Rides"
                        sx={{
                            width: 105,
                            height: "auto",
                        }}
                    />
                </Box>

                {/* TITLE */}

                <Typography
                    variant="h5"
                    sx={{
                        textAlign: "center",
                        fontWeight: 700,
                        color: "#222",
                        mb: 0.7,
                    }}
                >
                    Account Login
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        textAlign: "center",
                        color: "#777",
                        mb: 3.5,
                    }}
                >
                    Login securely using your mobile number
                </Typography>

                {/* MOBILE NUMBER */}

                <TextField
                    fullWidth
                    label="Mobile Number"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    disabled={otpSent}
                    onChange={(e) => {
                        const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                        setMobile(value);
                        setServerError("");
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Typography
                                    sx={{
                                        color: "#555",
                                        fontWeight: 500,
                                    }}
                                >
                                    +91
                                </Typography>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                            borderColor: "#FF9933",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                            color: "#FF9933",
                        },
                    }}
                />

                {/* SEND OTP */}

                {!otpSent && (
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        sx={{
                            height: 48,
                            borderRadius: "10px",
                            backgroundColor: "#FF9933",
                            fontWeight: 700,
                            fontSize: "15px",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "#e88920",
                            },
                        }}
                    >
                        {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                    </Button>
                )}

                {/* OTP */}

                {otpSent && (
                    <Box sx={{ mt: 1 }}>
                        <Box
                            sx={{
                                backgroundColor: "#fff8ef",
                                borderRadius: "10px",
                                px: 2,
                                py: 1.5,
                                mb: 2.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#555",
                                    textAlign: "center",
                                }}
                            >
                                Enter the 6-digit OTP sent to
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#222",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    mt: 0.3,
                                }}
                            >
                                +91 {mobile}
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: "#333",
                                mb: 1.2,
                            }}
                        >
                            Enter OTP
                        </Typography>

                        {/* OTP BOXES */}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: isMobile ? 1 : 1.3,
                                mb: 2.5,
                            }}
                        >
                            {otp.map((digit, index) => (
                                <TextField
                                    key={index}
                                    value={digit}
                                    inputRef={(element) => {
                                        otpRefs.current[index] = element;
                                    }}
                                    onChange={(e) =>
                                        handleOtpChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleOtpKeyDown(index, e)
                                    }
                                    inputProps={{
                                        maxLength: 1,
                                        inputMode: "numeric",
                                        autoComplete:
                                            index === 0
                                                ? "one-time-code"
                                                : "off",
                                    }}
                                    sx={{
                                        width: isMobile ? 43 : 50,
                                        "& .MuiOutlinedInput-root": {
                                            height: isMobile ? 50 : 56,
                                            borderRadius: "10px",
                                        },
                                        "& input": {
                                            textAlign: "center",
                                            fontSize: "21px",
                                            fontWeight: 700,
                                            padding: 0,
                                        },
                                    }}
                                />
                            ))}
                        </Box>

                        {/* VERIFY */}

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleVerifyOtp}
                            disabled={
                                isVerifyingOtp ||
                                otp.join("").length !== 6
                            }
                            sx={{
                                height: 48,
                                borderRadius: "10px",
                                backgroundColor: "#FF9933",
                                fontWeight: 700,
                                fontSize: "15px",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#e88920",
                                },
                            }}
                        >
                            {isVerifyingOtp
                                ? "Verifying..."
                                : "Verify & Login"}
                        </Button>

                        {/* CHANGE NUMBER */}

                        <Button
                            fullWidth
                            variant="text"
                            onClick={handleChangeNumber}
                            sx={{
                                mt: 1,
                                color: "#FF9933",
                                fontWeight: 600,
                                textTransform: "none",
                            }}
                        >
                            Change Mobile Number
                        </Button>
                    </Box>
                )}

                {/* ERROR */}

                {serverError && (
                    <Typography
                        sx={{
                            mt: 2,
                            color: "#d32f2f",
                            backgroundColor: "#fff1f1",
                            borderRadius: "8px",
                            padding: "9px 12px",
                            textAlign: "center",
                            fontSize: 13,
                        }}
                    >
                        {serverError}
                    </Typography>
                )}

                {/* SIGN UP */}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3,
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={{
                                color: "#FF9933",
                                fontWeight: 700,
                                textDecoration: "none",
                            }}
                        >
                            Sign Up
                        </Link>
                    </Typography>
                </Box>

                {/* FORGOT PASSWORD

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 1,
                    }}
                >
                    <Link
                        to="/forgot-password"
                        style={{
                            color: "#777",
                            fontSize: 13,
                            textDecoration: "none",
                        }}
                    >
                        Forgot Password?
                    </Link>
                </Box> */}
            </Box>
        </Box>
    );
};

export default Login;