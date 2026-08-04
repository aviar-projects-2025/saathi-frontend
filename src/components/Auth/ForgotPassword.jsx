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
import { useState } from "react";
import axios from "axios";
import ToastConfig from "../ToastConfig";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const toasts = ToastConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
    });

    const handleSubmit = async (values, { setFieldError, resetForm }) => {
        console.log("🚀 1. Form submitted with email:", values.email);
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            console.log("📡 2. Making API call to:", 'http://localhost:3000/api/v1/auth/forgot-password');
            console.log("📧 3. Sending data:", { email: values.email });
            
            const response = await axios.post(
                'http://localhost:3000/api/v1/auth/forgot-password',
                { email: values.email }
            );
            
            console.log("API Response:", response);
            console.log("Response data:", response.data);
            
            toast.success(response.data.message || "OTP sent to your email!", toasts);
            sessionStorage.setItem("resetEmail", values.email);
            
            console.log("🔄 6. Navigating to /verify-otp");
            navigate("/verify-otp");
            
        } catch (error) {
            let errorMessage = "Failed to send OTP";
            
            if (error.code === 'ERR_NETWORK') {
                errorMessage = "Cannot connect to server. Make sure backend is running on port 5000";
            } else if (error.response) {
                errorMessage = error.response.data?.message || "Server error";
            } else if (error.request) {
                errorMessage = "No response from server. Check if backend is running.";
            }
            
            toast.error(errorMessage, toasts);
            setFieldError("email", errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
            console.log("🏁 11. Finished submission");
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
                        Forgot Password
                    </Typography>
                    <Typography
                        variant="body2"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Enter your email address and we'll send you an OTP to reset your password.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Formik
                        initialValues={{ email: "" }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}  
                    >
                        {({ errors, touched, handleChange, handleBlur, values, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                    margin="normal"
                                    size="small"
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
                                        color: "#000",
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
                                            Sending OTP...
                                        </Box>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>

                                <Box sx={{ textAlign: "center", mt: 2 }}>
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

export default ForgotPassword;