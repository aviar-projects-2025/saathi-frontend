import { Navigate, Outlet } from "react-router-dom";
import ROLES from "../context/Role";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { loading, isAuthenticated, user } = useAuth();

  const role = user?.role || localStorage.getItem("role");

  // 1. Wait for AuthContext to finish
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
        Loading...
      </div>
    );
  }

  // 2. If logged in, redirect to the correct dashboard
  if (isAuthenticated) {
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === ROLES.USER) {
      // ✅ FIXED: respect refApprove so unapproved users go to waiting-approval,
      // not /find-ride (which otherwise causes a bounce that can hit /unauthorized).
      if (user?.refApprove === "Approved") {
        return <Navigate to="/find-ride" replace />;
      }
      return <Navigate to="/waiting-approval" replace />;
    }
  }

  // 3. Not logged in → allow public pages
  return <Outlet />;
};

export default PublicRoute;