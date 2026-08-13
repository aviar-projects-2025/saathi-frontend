import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ VERIFY USER ON APP LOAD
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

                console.log(res, 'res')

                setUser(res.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [token]);

    // ✅ LOGIN
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
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed";

            throw new Error(message);
        }
    };

    // ✅ LOGOUT
    const logout = () => {
        localStorage.removeItem("token");

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
                logout,
                loading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);