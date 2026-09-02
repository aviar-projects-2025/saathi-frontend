import { Formik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Link as MuiLink,
    Alert,
    CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import axios from "axios";
import Api from "../../Api.jsx";
import ToastConfig from "../ToastConfig";

const VerifyOTP = () => {
    const navigate = useNavigate();
    const toasts = ToastConfig();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [mobile_number, setMobile_number] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedMobile = sessionStorage.getItem("resetMobile");

        if (!storedMobile) {
            navigate("/forgot-password");
        } else {
            setMobile_number(storedMobile);
        }
    }, [navigate]);

    if (mobile_number === null) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    const validationSchema = Yup.object({
        otp: Yup.string()
            .length(6, "OTP must be exactly 6 digits")
            .matches(/^\d+$/, "OTP must contain only numbers")
            .required("OTP is required"),
    });

    const handleSubmit = async (values) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(
                `${Api}/auth/forgot-password/verify-otp`,
                {
                    mobile_number,
                    otp: values.otp,
                }
            );

            console.log("OTP verification:", response.data);

            toast.success(
                response.data.message || "OTP verified successfully!",
                toasts
            );

            sessionStorage.setItem(
                "resetToken",
                response.data.token
            );

            sessionStorage.setItem(
                "resetMobile",
                mobile_number
            );

            // Store temporary reset token
            sessionStorage.setItem(
                "resetToken",
                response.data.token
            );

            navigate("/reset-password");

        } catch (error) {
            console.error("OTP verification error:", error);

            const errorMessage =
                error.response?.data?.message ||
                "Invalid or expired OTP";

            toast.error(errorMessage, toasts);
            setError(errorMessage);

        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError(null);

        try {
            const response = await axios.post(
                `${Api}/auth/forgot-password`,
                {
                    mobile_number,
                }
            );

            toast.success(
                response.data.message || "New OTP sent!",
                toasts
            );

        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to resend OTP";

            toast.error(errorMessage, toasts);
            setError(errorMessage);

        } finally {
            setIsResending(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                bgcolor: "#f5f5f5",
            }}
        >
            <Container maxWidth="xs">
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 4,
                        overflow: "hidden",
                        p: 4,
                    }}
                >
                    <Typography
                        variant="h5"
                        align="center"
                        fontWeight={800}
                        sx={{ mb: 1 }}
                    >
                        Verify OTP
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Enter the 6-digit OTP sent to your mobile number
                        <br />
                        <strong>+91 {mobile_number}</strong>
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Formik
                        initialValues={{ otp: "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="OTP Code"
                                    name="otp"
                                    value={values.otp}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6);

                                        handleChange({
                                            target: {
                                                name: "otp",
                                                value,
                                            },
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={
                                        touched.otp &&
                                        Boolean(errors.otp)
                                    }
                                    helperText={
                                        touched.otp &&
                                        errors.otp
                                    }
                                    margin="normal"
                                    size="small"
                                    inputMode="numeric"
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={
                                        isSubmitting ||
                                        values.otp.length !== 6
                                    }
                                    sx={{
                                        mt: 3,
                                        py: 1.2,
                                        background: "#FF9933",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        borderRadius: "999px",

                                        "&:hover": {
                                            background: "#e6862c",
                                        },

                                        "&:disabled": {
                                            background: "#ffcc80",
                                            color: "#666",
                                        },
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                            Verifying...
                                        </Box>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>

                                <Box
                                    sx={{
                                        textAlign: "center",
                                        mt: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Didn't receive OTP?{" "}

                                        <MuiLink
                                            component="button"
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={isResending}
                                            underline="hover"
                                            sx={{
                                                color: "#FF9933",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {isResending
                                                ? "Resending..."
                                                : "Resend"}
                                        </MuiLink>
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        textAlign: "center",
                                        mt: 1,
                                    }}
                                >
                                    <MuiLink
                                        component={Link}
                                        to="/login"
                                        underline="hover"
                                        sx={{
                                            fontSize: "14px",
                                            color: "#FF9933",
                                        }}
                                    >
                                        Back to Login
                                    </MuiLink>
                                </Box>
                            </form>
                        )}
                    </Formik>
                </Paper>
            </Container>
        </Box>
    );
};

export default VerifyOTP;