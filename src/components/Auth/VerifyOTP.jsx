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
    const [email, setEmail] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedEmail = sessionStorage.getItem("resetEmail");
        if (!storedEmail) {
            navigate("/forgot-password");
        } else {
            setEmail(storedEmail);
        }
    }, [navigate]);

    if (email === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
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
                `${Api}/auth/verify-otp`,
                {
                    email: email,
                    otp: values.otp,
                }
            );
            
            toast.success(response.data.message || "OTP verified successfully!", toasts);
            sessionStorage.setItem("resetToken", response.data.token);
            navigate("/reset-password");
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Invalid OTP";
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
                `${Api}/auth/resend-otp`,
                { email: email }
            );
            
            toast.success(response.data.message || "New OTP sent to your email!", toasts);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to resend OTP";
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
                        Enter the 6-digit OTP sent to your email
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Formik
                        initialValues={{ otp: "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="OTP Code"
                                    name="otp"
                                    value={values.otp}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.otp && Boolean(errors.otp)}
                                    helperText={touched.otp && errors.otp}
                                    margin="normal"
                                    size="small"
                                    inputProps={{ maxLength: 6 }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '12px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '12px',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#FF9933',
                                            },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: '#FF9933',
                                        },
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={{
                                        mt: 3,
                                        py: 1.2,
                                        background: "#FF9933",
                                        color: "#ffff",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        borderRadius: "999px",
                                        "&:hover": { background: "#e6862c" },
                                        "&:disabled": {
                                            background: "#ffcc80",
                                            color: "#666",
                                        }
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" />
                                            Verifying...
                                        </Box>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </Button>

                                <Box sx={{ textAlign: "center", mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Didn't receive OTP?{" "}
                                        <MuiLink
                                            component="button"
                                            onClick={handleResendOTP}
                                            disabled={isResending}
                                            underline="hover"
                                            sx={{ 
                                                color: "#FF9933", 
                                                fontWeight: 600,
                                                cursor: isResending ? "not-allowed" : "pointer"
                                            }}
                                        >
                                            {isResending ? "Resending..." : "Resend"}
                                        </MuiLink>
                                    </Typography>
                                </Box>

                                <Box sx={{ textAlign: "center", mt: 1 }}>
                                    <MuiLink
                                        component={Link}
                                        to="/login"
                                        underline="hover"
                                        sx={{ fontSize: "14px", color: "#FF9933" }}
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