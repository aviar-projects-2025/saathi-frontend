import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Default to true

    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${Api}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Handle both direct response and wrapped response { data: user }
                const userData = res.data.data || res.data;
                setUser(userData);
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

    const login = async (credentials) => {
        try {
            const res = await axios.post(`${Api}/users/login`, credentials);
            const user = res.data.user;
            const token = res.data.token;

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true, user, token };
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Login failed";
            throw new Error(message);
        }
    };

    const loginWithOtp = async ({ mobileNumber, otp }) => {
        try {
            const res = await axios.post(`${Api}/auth/login/verify-otp`, {
                mobileNumber,
                otp,
            });

            const user = res.data.user;
            const token = res.data.token;

            if (!token) throw new Error("Token was not returned by the server");

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true, user, token };
        } catch (error) {
            const message = error.response?.data?.message || error.message || "OTP login failed";
            throw new Error(message);
        }
    };

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
                // FIXED: Authenticated if token exists (even while loading user data)
                isAuthenticated: !!token, 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);