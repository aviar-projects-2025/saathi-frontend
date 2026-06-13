import { Formik } from "formik";
import * as Yup from "yup";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./../../context/AuthContext";
import ROLES from "../../context/Role";




const Login = () => {

    const { login } = useAuth();
    const role = localStorage.getItem('role');

    const navigate = useNavigate();
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
           const data =  await login(values);
            if (role === ROLES.ADMIN) {
                navigate("/admin/dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            console.log(error);
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
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    width: 380,
                    p: 4,
                    borderRadius: 3,
                }}
            >
                <Formik
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        loginSubmit(values);
                    }}
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
                            <Typography
                                variant="h4"
                                align="center"
                                fontWeight="bold"
                                mb={4}
                            >
                                Login
                            </Typography>

                            {/* Email */}
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                    touched.email && Boolean(errors.email)
                                }
                                helperText={
                                    touched.email && errors.email
                                }
                                margin="normal"
                            />

                            {/* Password */}
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                    touched.password && Boolean(errors.password)
                                }
                                helperText={
                                    touched.password && errors.password
                                }
                                margin="normal"
                            />

                            {/* Login Button */}
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{
                                    mt: 1,
                                    py: 1.5,
                                    textTransform: "none",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                }}
                            >
                                LOGIN
                            </Button>

                            {/* Register */}
                            <Box style={{ textAlign: "center" }} mt={4}>
                                <Typography variant="body2" mt={4}>
                                    Don't have an account?
                                </Typography>

                                <MuiLink
                                    component={Link}
                                    to="/register"
                                    underline="hover"
                                    sx={{
                                        fontWeight: 500,
                                        cursor: "pointer",
                                    }}
                                >
                                    Sign Up
                                </MuiLink>
                            </Box>
                        </form>
                    )}
                </Formik>
            </Paper>
        </Container>
    );
}

export default Login;