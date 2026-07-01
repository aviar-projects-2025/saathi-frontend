import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link as MuiLink,
  Stack,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Api from "../../Api";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get("ref") || "";

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    referralCode: Yup.string().required('Referral Code is MUST'),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const registerSubmit = async (values, { setSubmitting }) => {
    try {
      setServerError("");

      const res = await axios.post(`${Api}/users/`, values);

      toast.success("Registration Success - Waiting for approval!");

      if (res?.data?.data?.refApprove === "Waiting") {
        navigate("/waiting-approval");
      }

    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold">
          Create Account
        </Typography>

        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          mt={1}
          mb={3}
        >
          Join and start finding your rides easily
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
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
                />

                {/* <TextField
                  fullWidth
                  // label="Date of Birth"
                  name="dob"
                  type="date"
                  value={values.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.dob && Boolean(errors.dob)}
                  helperText={touched.dob && errors.dob}
                  InputLabelProps={{
                    shrink: true,
                  }}
                /> */}

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
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
                  error={touched.referralCode && Boolean(errors.referralCode)}
                  helperText={touched.referralCode && errors.referralCode}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.4,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "16px",
                    fontWeight: 700,
                  }}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </Stack>
            </form>
          )}
        </Formik>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>

          <MuiLink
            component={Link}
            to="/login"
            underline="hover"
            sx={{ fontWeight: 600 }}
          >
            Login
          </MuiLink>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;