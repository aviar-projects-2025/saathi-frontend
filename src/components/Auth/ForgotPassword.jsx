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
import Api from "../../Api.jsx";
import ToastConfig from "../ToastConfig";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const toasts = ToastConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const validationSchema = Yup.object({
        email: Yup.string()
            .trim()
            .lowercase()
            .email("Please enter a valid email address")
            .matches(
                /^[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/,
                "Please enter a valid email address"
            )
            .required("Email is required"),
    });

    const handleSubmit = async (values, { setFieldError, resetForm }) => {
        setIsSubmitting(true);
        setError(null);

        try {

            const response = await axios.post(
                `${Api}/auth/forgot-password`,
                { email: values.email }
            );
            toast.success(response.data.message || "OTP sent to your email!", toasts);
            sessionStorage.setItem("resetEmail", values.email);
            navigate("/verify-otp");

        } catch (error) {
            let errorMessage = "Failed to send OTP";

            if (error.code === 'ERR_NETWORK') {
                errorMessage = "Please check your network connection.";
            } else if (error.response) {
                errorMessage = error.response.data?.message || "Server error";
            } else if (error.request) {
                errorMessage = "Please check your network connection.";
            }

            toast.error(errorMessage, toasts);
            setFieldError("email", errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
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