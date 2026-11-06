import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // =====================================================
    // VERIFY EXISTING USER
    // =====================================================

    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(
                    `${Api}/users/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log(res,'res user me')
                setUser(res.data);

            } catch (err) {

                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("user");

                    setToken(null);
                    setUser(null);
                }

            } finally {
                setLoading(false);
            }
        };

        verifyUser();

    }, [token]);


    // =====================================================
    // NORMAL LOGIN
    // =====================================================

    const login = async (credentials) => {
        try {

            const res = await axios.post(
                `${Api}/users/login`,
                credentials
            );

            const user = res.data.user;
            const token = res.data.token;


            // Store authentication data
            localStorage.setItem(
                "token",
                token
            );

            localStorage.setItem(
                "role",
                user.role
            );

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            // Update React authentication state
            setToken(token);
            setUser(user);


            return {
                success: true,
                user,
                token,
            };

        } catch (error) {

            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed";

            throw new Error(message);
        }
    };


    // =====================================================
    // MOBILE OTP LOGIN
    // =====================================================
    const loginWithOtp = async ({ mobileNumber, otp }) => {
        try {
            const res = await axios.post(
                `${Api}/auth/login/verify-otp`,
                {
                    mobileNumber,
                    otp,
                }
            );

            const user = res.data.user;
            const token = res?.data?.token;

            console.log("Response:", res);
            console.log("OTP Login Response:", res.data);
            console.log("TOKEN:", res.data.token);

            if (!token) {
                throw new Error("Token was not returned by the server");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setUser(user);

            return {
                success: true,
                user,
                token,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "OTP login failed";

            throw new Error(message);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

        window.location.replace("/login");
    };


    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                loginWithOtp,
                logout,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () =>
    useContext(AuthContext);