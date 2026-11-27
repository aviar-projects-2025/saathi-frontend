
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

const MAX_OTP_ATTEMPTS = 3;

const getOtpLockKey = (mobileNumber) => {
    return `otp-lock-${mobileNumber}`;
};

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

    // OTP attempts and lock states
    const [attemptsRemaining, setAttemptsRemaining] =
        useState(MAX_OTP_ATTEMPTS);

    const [lockedUntil, setLockedUntil] = useState(null);
    const [lockedPhone, setLockedPhone] = useState(null);
    const [lockSeconds, setLockSeconds] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL;
    const otpRefs = useRef([]);

    const cleanedMobile = mobile.replace(/\D/g, "");
    const fullMobileNumber = `${countryCode}${cleanedMobile}`;

    const isCurrentNumberLocked =
        lockSeconds > 0 &&
        lockedPhone === fullMobileNumber;

    const formattedCountdown = `${Math.floor(lockSeconds / 60)
        .toString()
        .padStart(2, "0")}:${(lockSeconds % 60)
            .toString()
            .padStart(2, "0")}`;

    // =====================================================
    // PREVENT BACK BUTTON
    // =====================================================

    useEffect(() => {
        window.history.pushState(
            null,
            document.title,
            window.location.href
        );

        const handlePopState = () => {
            window.history.pushState(
                null,
                document.title,
                window.location.href
            );
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // =====================================================
    // AUTO REDIRECT IF ALREADY LOGGED IN
    // =====================================================

    useEffect(() => {
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
    // RESTORE LOCK AFTER REFRESH / NUMBER ENTRY
    // =====================================================

    useEffect(() => {
        if (cleanedMobile.length !== 10) {
            return;
        }

        const phone = `${countryCode}${cleanedMobile}`;
        const lockKey = getOtpLockKey(phone);

        const savedLock = localStorage.getItem(lockKey);

        if (savedLock) {
            const remaining =
                new Date(savedLock).getTime() - Date.now();

            if (remaining > 0) {
                setLockedPhone(phone);
                setLockedUntil(savedLock);
                setAttemptsRemaining(0);

                // Do not show OTP entry while locked
                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);

                setServerError(
                    "This mobile number is temporarily locked."
                );

                return;
            }

            // Remove expired lock
            localStorage.removeItem(lockKey);
        }

        // No active lock for this number
        setLockedPhone(null);
        setLockedUntil(null);
        setAttemptsRemaining(MAX_OTP_ATTEMPTS);
        setServerError("");
    }, [mobile, countryCode]);

    // =====================================================
    // LOCK COUNTDOWN
    // =====================================================

    useEffect(() => {
        if (!lockedUntil || !lockedPhone) {
            setLockSeconds(0);
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.ceil(
                    (
                        new Date(lockedUntil).getTime() -
                        Date.now()
                    ) / 1000
                )
            );

            setLockSeconds(remaining);

            if (remaining === 0) {
                localStorage.removeItem(
                    getOtpLockKey(lockedPhone)
                );

                setLockedUntil(null);
                setLockedPhone(null);

                setAttemptsRemaining(MAX_OTP_ATTEMPTS);

                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);

                setServerError(
                    "Your verification lock has expired. You can request an OTP again."
                );

                toast.info("You can try logging in again.");
            }
        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [lockedUntil, lockedPhone]);

    // =====================================================
    // SEND OTP
    // =====================================================

    const handleSendOtp = async () => {
        setServerError("");

        const cleaned = mobile.replace(/\D/g, "");

        if (!cleaned) {
            setServerError("Please enter your mobile number.");
            return;
        }

        if (cleaned.length !== 10) {
            setServerError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (
            countryCode === "+91" &&
            !/^[6-9]\d{9}$/.test(cleaned)
        ) {
            setServerError(
                "Please enter a valid 10-digit Indian mobile number."
            );
            return;
        }

        const phone = `${countryCode}${cleaned}`;

          console.log(phone,'phone')
        // Check saved lock before sending OTP
        const lockKey = getOtpLockKey(phone);
        const savedLock = localStorage.getItem(lockKey);

        if (savedLock) {
            const remaining =
                new Date(savedLock).getTime() - Date.now();

            if (remaining > 0) {
                setLockedPhone(phone);
                setLockedUntil(savedLock);
                setAttemptsRemaining(0);

                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);

                setServerError(
                    "Too many incorrect OTP attempts. Please wait until the lock expires."
                );

                return;
            }

            localStorage.removeItem(lockKey);
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
                        mobileNumber: phone,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Also handle a lock response from send-OTP API
                if (data.lockedUntil) {
                    localStorage.setItem(
                        lockKey,
                        data.lockedUntil
                    );

                    setLockedPhone(phone);
                    setLockedUntil(data.lockedUntil);
                    setAttemptsRemaining(0);
                    setOtpSent(false);
                }

                throw new Error(
                    data.message || "Failed to send OTP"
                );
            }

            setMobile(cleaned);
            setOtp(["", "", "", "", "", ""]);
            setOtpSent(true);

            setAttemptsRemaining(MAX_OTP_ATTEMPTS);

            toast.success("OTP sent successfully");

            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);

        } catch (error) {
            setServerError(
                error.message || "Unable to send OTP"
            );

            toast.error(
                error.message || "Unable to send OTP"
            );
        } finally {
            setIsSendingOtp(false);
        }
    };

    // =====================================================
    // OTP INPUT CHANGE
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
                if (index + i < 6) {
                    newOtp[index + i] = digit;
                }
            });

            setOtp(newOtp);

            const nextIndex = Math.min(
                index + digits.length,
                5
            );

            setTimeout(() => {
                otpRefs.current[nextIndex]?.focus();
            }, 0);

            return;
        }

        newOtp[index] = numericValue;

        setOtp(newOtp);

        setServerError("");

        if (index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // =====================================================
    // OTP KEYBOARD NAVIGATION
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

        if (isCurrentNumberLocked) {
            setServerError(
                "This mobile number is temporarily locked."
            );
            return;
        }

        const otpValue = otp.join("");

        if (otpValue.length !== 6) {
            setServerError(
                "Please enter the complete 6-digit OTP."
            );
            return;
        }

        try {
            setIsVerifyingOtp(true);

            const phone = `${countryCode}${cleanedMobile}`;

            const data = await loginWithOtp({
                mobileNumber: phone,
                otp: otpValue,
            });

            // Successful login: clear saved lock
            localStorage.removeItem(
                getOtpLockKey(phone)
            );

            setLockedUntil(null);
            setLockedPhone(null);
            setAttemptsRemaining(MAX_OTP_ATTEMPTS);

            if (data?.user?.refApprove === "Approved") {
                toast.success("Login successful");
            } else {
                toast.info(
                    "Your account is waiting for admin approval"
                );
            }

            if (data?.user?.role === ROLES.ADMIN) {
                window.location.href = "/admin/dashboard";
            } else if (
                data?.user?.refApprove === "Approved"
            ) {
                window.location.href = "/find-ride";
            } else {
                window.location.href = "/waiting-approval";
            }

        } catch (error) {
            const errorData = error.response?.data || {};

            if (errorData.lockedUntil) {
                const phone = `${countryCode}${cleanedMobile}`;

                // Save lock for browser refresh
                localStorage.setItem(
                    getOtpLockKey(phone),
                    errorData.lockedUntil
                );

                setLockedPhone(phone);
                setLockedUntil(errorData.lockedUntil);
                setAttemptsRemaining(0);

                // Hide OTP input immediately
                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);

                setServerError(
                    "Too many incorrect attempts. Please try again after 10 minutes."
                );

            } else {
                if (
                    typeof errorData.attemptsRemaining === "number"
                ) {
                    setAttemptsRemaining(
                        errorData.attemptsRemaining
                    );
                }

                setServerError(
                    errorData.message ||
                    error.message ||
                    "Invalid or expired OTP"
                );
            }

            toast.error(
                errorData.message ||
                error.message ||
                "OTP verification failed"
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

                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        width: "100%",
                        mb: 2,
                    }}
                >
                    {isProduction && (
                        <TextField
                            size="small"
                            value="US +1"
                            disabled
                            sx={{
                                width: {
                                    xs: 105,
                                    sm: 115,
                                },
                                "& .MuiInputBase-input.Mui-disabled": {
                                    color: "#555",
                                    WebkitTextFillColor: "#555",
                                },
                            }}
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
                            sx={{
                                width: {
                                    xs: 105,
                                    sm: 115,
                                },
                            }}
                        >
                            <MenuItem value="+91">
                                🇮🇳 +91
                            </MenuItem>

                            <MenuItem value="+1">
                                🇺🇸 +1
                            </MenuItem>
                        </TextField>
                    )}

                    <TextField
                        fullWidth
                        value={mobile}
                        type="text"
                        inputMode="numeric"
                        disabled={otpSent}
                        onChange={(e) => {
                            const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);

                            setMobile(value);
                            setServerError("");
                        }}
                        size="small"
                        placeholder="Enter mobile number"
                        InputProps={{
                            sx: {
                                fontSize: {
                                    xs: "0.75rem",
                                    sm: "0.85rem",
                                },
                            },
                        }}
                    />
                </Stack>

                {/* SEND OTP */}

                {!otpSent && (
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSendOtp}
                        disabled={
                            isSendingOtp ||
                            isCurrentNumberLocked
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
                        {isCurrentNumberLocked
                            ? `Locked · ${formattedCountdown}`
                            : isSendingOtp
                                ? "Sending OTP..."
                                : "Send OTP"}
                    </Button>
                )}

                {/* LOCK SCREEN */}

                {!otpSent && isCurrentNumberLocked && (
                    <Box
                        sx={{
                            mt: 2,
                            p: 2.5,
                            borderRadius: "12px",
                            backgroundColor: "#fff1f1",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#d32f2f",
                                mb: 1,
                            }}
                        >
                            Verification temporarily locked
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Too many incorrect OTP attempts.
                            Please wait before trying again.
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 32,
                                fontWeight: 800,
                                color: "#d32f2f",
                                mt: 1.5,
                                fontVariantNumeric: "tabular-nums",
                            }}
                        >
                            {formattedCountdown}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Time remaining
                        </Typography>
                    </Box>
                )}

                {/* OTP INPUT */}

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
                                {countryCode} {mobile}
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
                                mb: 2,
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

                        {/* REMAINING ATTEMPTS */}

                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: "center",
                                mb: 2,
                                color:
                                    attemptsRemaining === 1
                                        ? "#d32f2f"
                                        : "#777",
                            }}
                        >
                            {attemptsRemaining} OTP attempt
                            {attemptsRemaining !== 1
                                ? "s"
                                : ""} remaining
                        </Typography>

                        {/* VERIFY BUTTON */}

                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleVerifyOtp}
                            disabled={
                                isVerifyingOtp ||
                                otp.join("").length !== 6 ||
                                isCurrentNumberLocked
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

                {/* SERVER ERROR */}

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
                        sx={{
                            fontSize: { xs: 13, sm: 13.5 },
                            color: "#6B7280",
                            textAlign: "center",
                            lineHeight: 1.55,
                        }}
                    >
                        Saathi is invite-only. Ask a member for a link.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
