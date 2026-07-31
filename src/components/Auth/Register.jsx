import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link as MuiLink,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Api from "../../Api";
import { toast } from "react-toastify";
import Saathi from "../../assets/saathilogo.png";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ToastConfig from "../ToastConfig";

const Register = () => {
  const navigate = useNavigate();

  const toasts = ToastConfig();

  const [serverError, setServerError] = useState("");
  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get("ref") || "";

  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    referralCode: Yup.string().required("Referral Code is MUST"),
    password: Yup.string()
      .matches(/^[A-Z]/, "Password must start with an uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character",
      )
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const registerSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError("");

      const res = await axios.post(`${Api}/users/`, values);
      toast.success("Registration Success - Waiting for approval!", toasts);

      if (res?.data?.data?.refApprove === "Waiting") {
        navigate("/waiting-approval");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputSx = {
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
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
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
            <Typography
              variant="h5"
              align="center"
              fontWeight={800}
              sx={{ mb: 1 }}
            >
              Create Account
            </Typography>

            <Typography
              variant="body2"
              align="center"
              sx={{ color: "#666", mb: 2 }}
            >
              Join and start finding your rides easily
            </Typography>

            {serverError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
                {serverError}
              </Alert>
            )}

            <Formik
              enableReinitialize
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                dob: "",
                password: "",
                role: "USER",
                referralCode: referralFromUrl,
              }}
              validationSchema={validationSchema}
              onSubmit={registerSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3.5}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      <TextField
                        fullWidth
                        label="First Name"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                        margin="normal"
                        size="small"
                        sx={inputSx}
                      />

                      <TextField
                        fullWidth
                        label="Last Name"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                        margin="normal"
                        size="small"
                        sx={inputSx}
                      />
                    </Stack>

                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      margin="normal"
                      size="small"
                      sx={inputSx}
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
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={inputSx}
                    />

                    <TextField
                      fullWidth
                      label="Referral Code"
                      name="referralCode"
                      type="text"
                      value={values.referralCode}
                      InputProps={{
                        readOnly: !!referralFromUrl,
                      }}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.referralCode && Boolean(errors.referralCode)
                      }
                      helperText={touched.referralCode && errors.referralCode}
                      margin="normal"
                      size="small"
                      sx={inputSx}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      disabled={isSubmitting}
                      sx={{
                        mt: 2,
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
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Stack>
                </form>
              )}
            </Formik>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" sx={{ color: "#333" }}>
                Already have an account?{" "}
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 600, color: "#FF9933" }}
                >
                  Login
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
