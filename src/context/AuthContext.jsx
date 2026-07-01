import { createContext, useContext, useState } from "react";
import Api from "../Api";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {


    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );



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
                "Login failed. Please try again.";

            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.clear();

        setToken(null);
        setRole(null);
        setUser(null);

        window.location.replace("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                user,
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