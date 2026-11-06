import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, user, loading, isAuthenticated } = useAuth();

  // ✅ FIXED: single source of truth — read role from user (context), not localStorage
  const role = user?.role || localStorage.getItem("role");

  // 1. Still verifying session
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Verifying session...
      </div>
    );
  }

  // 2. Not authenticated → login (checked BEFORE role check)
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ FIXED: null role is a transient "not-yet-hydrated" state, NOT "unauthorized".
  // Route to /login so a race during logout can never land on /unauthorized.
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // 3. Authenticated but wrong role → unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Authorized
  return <Outlet />;
};

export default ProtectedRoute;