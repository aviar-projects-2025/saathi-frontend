import { createContext, useContext, useState } from "react";
import Api from "../Api";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));



    const login = async (credentials) => {
        try {
            const res = await axios.post(`${Api}/users/login`, credentials);

            const user = res.data.user;
            const token = res.data.token;

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setRole(user.role);

            return {
                success: true,
                user,
                token,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please try again.";

            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.clear();
        window.location.replace('/login')

        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);