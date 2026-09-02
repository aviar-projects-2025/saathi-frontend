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
        mobile_number: Yup.string()
            .matches(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number")
            .required("Mobile number is required"),
    });

    const handleSubmit = async (values, { setFieldError }) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await axios.post(
                `${Api}/auth/forgot-password`,
                {
                    mobile_number: values.mobile_number,
                }
            );

            console.log(response.data);

            toast.success(
                response.data.message || "OTP sent successfully!",
                toasts
            );

            // Store mobile number for OTP verification page
            sessionStorage.setItem(
                "resetMobile",
                values.mobile_number
            );

            navigate("/verify-otp");

        } catch (error) {
            console.error("Forgot password error:", error);

            let errorMessage = "Failed to send OTP";

            if (error.code === "ERR_NETWORK") {
                errorMessage = "Please check your network connection.";
            } else if (error.response) {
                errorMessage =
                    error.response.data?.message || "Server error";
            } else if (error.request) {
                errorMessage = "Please check your network connection.";
            }

            toast.error(errorMessage, toasts);

            setFieldError("mobile_number", errorMessage);
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
                        Enter your mobile number and we'll send you an OTP
                        to reset your password.
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
                        initialValues={{
                            mobile_number: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            values,
                            handleSubmit,
                        }) => (
                            <form onSubmit={handleSubmit}>

                                <TextField
                                    fullWidth
                                    label="Mobile Number"
                                    name="mobile_number"
                                    type="text"
                                    inputMode="numeric"
                                    value={values.mobile_number}
                                    onChange={(e) => {
                                        const value = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 10);

                                        handleChange({
                                            target: {
                                                name: "mobile_number",
                                                value,
                                            },
                                        });
                                    }}
                                    onBlur={handleBlur}
                                    error={
                                        touched.mobile_number &&
                                        Boolean(errors.mobile_number)
                                    }
                                    helperText={
                                        touched.mobile_number &&
                                        errors.mobile_number
                                    }
                                    margin="normal"
                                    size="small"
                                    placeholder="Enter 10-digit mobile number"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "12px",

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
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={
                                        isSubmitting ||
                                        values.mobile_number.length !== 10
                                    }
                                    sx={{
                                        mt: 3,
                                        py: 1.2,
                                        background: "#FF9933",
                                        color: "#ffff",
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
                                            Sending OTP...
                                        </Box>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>

                                <Box
                                    sx={{
                                        textAlign: "center",
                                        mt: 2,
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

export default ForgotPassword;