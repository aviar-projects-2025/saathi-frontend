import React, { useRef, useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
    MenuItem,
    Stack,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ROLES from "../../context/Role";
import SaathiLogo from "../../assets/saathilogo.png";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const { loginWithOtp, loading, isAuthenticated, user } = useAuth();

    const [mobile, setMobile] = useState("");
    const [countryCode, setCountryCode] = useState("+1");

    const isProduction =
        import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "production";

    const isTesting =
        import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "testing";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [serverError, setServerError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL;
    const otpRefs = useRef([]);

    // =====================================================
    // PREVENT BACK BUTTON FROM REDIRECTING TO PREVIOUS PAGE
    // =====================================================
    useEffect(() => {
        // Replace current state so the back button has nowhere to go back to
        window.history.pushState(null, document.title, window.location.href);

        const handlePopState = () => {
            // If the user hits back, push them forward to login again
            window.history.pushState(null, document.title, window.location.href);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // =====================================================
    // AUTO-REDIRECT IF ALREADY LOGGED IN
    // =====================================================
    useEffect(() => {
        // Wait for AuthContext to finish verifying the token
        if (loading) return;

        if (isAuthenticated) {
            if (user?.role === ROLES.ADMIN) {
                navigate("/admin/dashboard", { replace: true });
            } else if (user?.refApprove === "Approved") {
                navigate("/find-ride", { replace: true });
            } else {
                navigate("/waiting-approval", { replace: true });
            }
        }
    }, [loading, isAuthenticated, user, navigate]);

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
        if (cleanedMobile.length !== 10) {
            setServerError("Please enter a valid 10-digit mobile number.");
            return;
        }
        if (countryCode === "+91" && !/^[6-9]\d{9}$/.test(cleanedMobile)) {
            setServerError("Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        const fullMobileNumber = `${countryCode}${cleanedMobile}`;

        try {
            setIsSendingOtp(true);
            const response = await fetch(`${API_URL}/auth/login/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobileNumber: fullMobileNumber }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setMobile(cleanedMobile);
            setOtp(["", "", "", "", "", ""]);
            setOtpSent(true);
            toast.success("OTP sent successfully");

            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (error) {
            setServerError(error.message || "Unable to send OTP");
            toast.error(error.message || "Unable to send OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // =====================================================
    // OTP CHANGE & KEYBOARD
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
        if (numericValue.length > 1) {
            const digits = numericValue.slice(0, 6).split("");
            digits.forEach((digit, i) => {
                if (index + i < 6) newOtp[index + i] = digit;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            setTimeout(() => otpRefs.current[nextIndex]?.focus(), 0);
            return;
        }

        newOtp[index] = numericValue;
        setOtp(newOtp);
        if (index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
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
            const fullMobileNumber = `${countryCode}${cleanedMobile}`;

            const data = await loginWithOtp({
                mobileNumber: fullMobileNumber,
                otp: otpValue,
            });

            if (data?.user?.refApprove === "Approved") {
                toast.success("Login successful");
            } else {
                toast.info("Your account is waiting for admin approval");
            }

            // Note: The useEffect above will catch the state change and redirect automatically,
            // but we keep this here just in case for instant feedback.
            if (data?.user?.role === ROLES.ADMIN) {
                window.location.href = "/admin/dashboard";
            } else if (data?.user?.refApprove === "Approved") {
                window.location.href = "/find-ride";
            } else {
                window.location.href = "/waiting-approval";
            }
        } catch (error) {
            setServerError(error.message || "Invalid or expired OTP");
            toast.error(error.message || "Invalid or expired OTP");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

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
                background: "linear-gradient(135deg, #fff8f0 0%, #ffffff 50%, #fff3e0 100%)",
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
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
                    <Box component="img" src={SaathiLogo} alt="Saathi Rides" sx={{ width: 105, height: "auto" }} />
                </Box>

                <Typography variant="h5" sx={{ textAlign: "center", fontWeight: 700, color: "#222", mb: 0.7 }}>
                    Account Login
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "center", color: "#777", mb: 3.5 }}>
                    Login securely using your mobile number
                </Typography>

                <Stack direction="row" spacing={1} sx={{ width: "100%", mb: 2 }}>
                    {isProduction && (
                        <TextField
                            size="small"
                            value="US +1"
                            disabled
                            sx={{ width: { xs: 105, sm: 115 }, "& .MuiInputBase-input.Mui-disabled": { color: "#555", WebkitTextFillColor: "#555" } }}
                        />
                    )}
                    {isTesting && (
                        <TextField
                            select
                            size="small"
                            value={countryCode}
                            disabled={otpSent}
                            onChange={(e) => {
                                setCountryCode(e.target.value);
                                setMobile("");
                                setOtp(["", "", "", "", "", ""]);
                                setServerError("");
                            }}
                            sx={{ width: { xs: 105, sm: 115 } }}
                        >
                            <MenuItem value="+91">🇮🇳 +91</MenuItem>
                            <MenuItem value="+1">🇺🇸 +1</MenuItem>
                        </TextField>
                    )}
                    <TextField
                        fullWidth
                        value={mobile}
                        type="text"
                        inputMode="numeric"
                        disabled={otpSent}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setMobile(value);
                            setServerError("");
                        }}
                        size="small"
                        placeholder="Enter mobile number"
                        InputProps={{ sx: { fontSize: { xs: "0.75rem", sm: "0.85rem" } } }}
                    />
                </Stack>

                {!otpSent && (
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        sx={{ height: 48, borderRadius: "10px", backgroundColor: "#FF9933", fontWeight: 700, fontSize: "15px", textTransform: "none", "&:hover": { backgroundColor: "#e88920" } }}
                    >
                        {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                    </Button>
                )}

                {otpSent && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ backgroundColor: "#fff8ef", borderRadius: "10px", px: 2, py: 1.5, mb: 2.5 }}>
                            <Typography variant="body2" sx={{ color: "#555", textAlign: "center" }}>
                                Enter the 6-digit OTP sent to
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#222", fontWeight: 700, textAlign: "center", mt: 0.3 }}>
                                {countryCode} {mobile}
                            </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#333", mb: 1.2 }}>
                            Enter OTP
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "center", gap: isMobile ? 1 : 1.3, mb: 2.5 }}>
                            {otp.map((digit, index) => (
                                <TextField
                                    key={index}
                                    value={digit}
                                    inputRef={(element) => { otpRefs.current[index] = element; }}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    inputProps={{ maxLength: 1, inputMode: "numeric", autoComplete: index === 0 ? "one-time-code" : "off" }}
                                    sx={{
                                        width: isMobile ? 43 : 50,
                                        "& .MuiOutlinedInput-root": { height: isMobile ? 50 : 56, borderRadius: "10px" },
                                        "& input": { textAlign: "center", fontSize: "21px", fontWeight: 700, padding: 0 },
                                    }}
                                />
                            ))}
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otp.join("").length !== 6}
                            sx={{ height: 48, borderRadius: "10px", backgroundColor: "#FF9933", fontWeight: 700, fontSize: "15px", textTransform: "none", "&:hover": { backgroundColor: "#e88920" } }}
                        >
                            {isVerifyingOtp ? "Verifying..." : "Verify & Login"}
                        </Button>

                        <Button fullWidth variant="text" onClick={handleChangeNumber} sx={{ mt: 1, color: "#FF9933", fontWeight: 600, textTransform: "none" }}>
                            Change Mobile Number
                        </Button>
                    </Box>
                )}

                {serverError && (
                    <Typography sx={{ mt: 2, color: "#d32f2f", backgroundColor: "#fff1f1", borderRadius: "8px", padding: "9px 12px", textAlign: "center", fontSize: 13 }}>
                        {serverError}
                    </Typography>
                )}

                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account?{" "}
                        <Link to="/register" style={{ color: "#FF9933", fontWeight: 700, textDecoration: "none" }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;