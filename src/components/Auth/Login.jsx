import { Formik } from "formik";
import * as Yup from "yup";
import {
    Avatar,
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Link as MuiLink,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./../../context/AuthContext";
import ROLES from "../../context/Role";
import { toast } from "react-toastify";
import Saathi from '../../assets/saathilogo.png';
import { useTheme, useMediaQuery } from "@mui/material";
import { useState } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// LAYOUT 4: Card with a colored top banner and a centered avatar badge
// straddling the seam — a classic "app-like" login card, softly modernized.

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const theme = useTheme();
    const isTab = useMediaQuery(theme.breakpoints.down("sm"));

    const validationSchema = Yup.object({
        email: Yup.string()
            .min(3, "email must be at least 3 characters")
            .required("email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    const loginSubmit = async (values) => {
        try {
            const data = await login(values);
            toast.success("Ride created successfully!", {
                position: isTab ? "top-center" : "top-right",
                autoClose: 1000,
                hideProgressBar: true,
                closeButton: false,
                style: {
                    width: isTab ? "280px" : "360px",
                    fontSize: isTab ? "13px" : "15px",
                    padding: isTab ? "8px 12px" : "12px 16px",
                    borderRadius: isTab ? "8px" : "10px",
                    minHeight: isTab ? "42px" : "52px",
                },
            });
            window.location.href = data?.user.role === ROLES.ADMIN
                ? "/admin/dashboard"
                : data?.user.refApprove === "Approved"
                    ? "/community"
                    : "/waiting-approval";
        } catch (error) {
            toast.error(error.message);
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                // background: "#F1EFEA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
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
                            background: "#FF9933",
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

                    <Box sx={{ px: 4, pb: 4, pt: 2 }}>
                        <Formik
                            initialValues={{ email: "", password: "" }}
                            validationSchema={validationSchema}
                            onSubmit={(values) => loginSubmit(values)}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                                <form onSubmit={handleSubmit}>
                                    <Typography
                                        variant="h5"
                                        align="center"
                                        fontWeight={800}
                                        sx={{ mb: 3 }}
                                    >
                                        Account Login
                                    </Typography>

                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
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
                                                '& input:-webkit-autofill': {
                                                    WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset',
                                                    WebkitTextFillColor: '#000000',
                                                },
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
                                        margin="normal"
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
                                        sx={{
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
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        fullWidth
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
                                        }}
                                    >
                                        {isSubmitting ? "Logging in..." : "Login"}
                                    </Button>

                                    <Box sx={{ textAlign: "center", mt: 3 }}>
                                        <Typography variant="body2" sx={{ color: "#333" }}>
                                            Don't have an account?{" "}
                                            <MuiLink
                                                component={Link}
                                                to="/register"
                                                underline="hover"
                                                sx={{ fontWeight: 600, color: "#FF9933" }}
                                            >
                                                Sign Up
                                            </MuiLink>
                                        </Typography>
                                    </Box>
                                </form>
                            )}
                        </Formik>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;