import { Formik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    MenuItem,
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
    const [mobileNumber, setMobileNumber] = useState();
    const [countryCode, setCountryCode] = useState("+1");
    const validationSchema = Yup.object({
        mobileNumber: Yup.string()
            .matches(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number")
            .required("Mobile number is required"),
    });
       
    const handleSubmit = async (values, { setFieldError }) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const fullMobileNumber =
                `${countryCode}${values.mobileNumber}`;
        
            const response = await axios.post(
                `${Api}/auth/forgot-password`,
                {
                    mobileNumber: fullMobileNumber,
                }
            );
            toast.success(
                response.data.message || "OTP sent successfully!",
                toasts
            );

            sessionStorage.setItem(
                "resetMobile",
                fullMobileNumber
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
                errorMessage =
                    "Please check your network connection.";
            }

            toast.error(errorMessage, toasts);

            setFieldError("mobileNumber", errorMessage);
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    const isProduction =
        import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "Production";

    const isTesting =
        import.meta.env.VITE_COUNTRY_CODE_VALIDATION === "Testing";
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
                            mobileNumber: "",
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
                            setFieldValue,
                            handleSubmit,
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{
                                        width: "100%",
                                    }}
                                >
                                    {/* Production: Fixed US +1 */}
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

                                    {/* Testing: Select country code */}
                                    {isTesting && (
                                        <TextField
                                            select
                                            size="small"
                                            value={countryCode}
                                            onChange={(e) => {
                                                setCountryCode(e.target.value);
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

                                    {/* Mobile Number */}
                                    <TextField
                                        fullWidth
                                        size="small"
                                        name="mobileNumber"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Enter 10-digit mobile number"
                                        value={values.mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10);

                                            setFieldValue("mobileNumber", value);
                                        }}
                                        onBlur={handleBlur}
                                        // error={
                                        //     touched.mobileNumber &&
                                        //     Boolean(errors.mobileNumber)
                                        // }
                                        // helperText={
                                        //     touched.mobileNumber
                                        //         ? errors.mobileNumber
                                        //         : ""
                                        // }
                                    />
                                </Stack>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={
                                        isSubmitting ||
                                        values.mobileNumber.length !== 10
                                    }
                                    sx={{
                                        mt: 3,
                                        py: 1.2,
                                        backgroundColor: "#FF9933",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        borderRadius: "999px",

                                        "&:hover": {
                                            backgroundColor: "#e6862c",
                                        },

                                        "&:disabled": {
                                            backgroundColor: "#ffcc80",
                                            color: "#666",
                                        },
                                    }}
                                >
                                    {isSubmitting ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
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