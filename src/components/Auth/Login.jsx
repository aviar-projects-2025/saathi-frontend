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
import {
    Instagram,
    Facebook,
    X,
    Google,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";


function Login() {

    const navigate = useNavigate();

    const validationSchema = Yup.object({
        username: Yup.string()
            .min(3, "Username must be at least 3 characters")
            .required("Username is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    return (
        <Container
            maxWidth={false}
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f8f9fa",
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
                        username: "",
                        password: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        console.log("Submitted:", values);
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

                            {/* Username */}
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={values.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                    touched.username && Boolean(errors.username)
                                }
                                helperText={
                                    touched.username && errors.username
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
                                    mt: 3,
                                    py: 1.5,
                                    background:
                                        "linear-gradient(45deg, #ff0000, #0000ff)",
                                    textTransform: "none",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                }}
                            >
                                LOGIN
                            </Button>

                            {/* Social Login */}
                            {/* <Box textAlign="center" mt={4}>
                                <Typography variant="h6">
                                    Sign In Using
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={3}
                                    justifyContent="center"
                                    mt={2}
                                >
                                    <MuiLink
                                        href="https://instagram.com"
                                        target="_blank"
                                    >
                                        <Instagram
                                            sx={{
                                                color: "#E1306C",
                                                fontSize: 32,
                                            }}
                                        />
                                    </MuiLink>

                                    <MuiLink
                                        href="https://facebook.com"
                                        target="_blank"
                                    >
                                        <Facebook
                                            sx={{
                                                color: "#1877F2",
                                                fontSize: 32,
                                            }}
                                        />
                                    </MuiLink>

                                    <MuiLink
                                        href="https://x.com"
                                        target="_blank"
                                    >
                                        <X
                                            sx={{
                                                color: "#000",
                                                fontSize: 32,
                                            }}
                                        />
                                    </MuiLink>

                                    <MuiLink
                                        href="https://google.com"
                                        target="_blank"
                                    >
                                        <Google
                                            sx={{
                                                color: "#DB4437",
                                                fontSize: 32,
                                            }}
                                        />
                                    </MuiLink>
                                </Stack>
                            </Box> */}

                            {/* Register */}
                            <Box textAlign="center" mt={4}>
                                <Typography variant="body2" mt={4}>
                                    Don't have an account?
                                </Typography>

                                <MuiLink
                                    component={Link}
                                    to="/register"
                                    underline="hover"
                                    sx={{
                                        fontWeight: 600,
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