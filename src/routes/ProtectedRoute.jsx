import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, loading, isAuthenticated } = useAuth();
  const role = localStorage.getItem("role");

  // 1. Wait for AuthContext to finish checking the token
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Verifying session...
      </div>
    );
  }

  // 2. No token -> Login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Wrong role -> Unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Authorized -> Render the page
  return <Outlet />;
};

export default ProtectedRoute;