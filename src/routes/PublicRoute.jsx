import { Navigate, Outlet } from "react-router-dom";
import ROLES from "../context/Role";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
  const { loading, isAuthenticated, user } = useAuth();
  
  // Get role directly from user object (more reliable than localStorage)
  // Fallback to localStorage just in case
  const role = user?.role || localStorage.getItem("role");

  // 1. Wait for AuthContext to check the token
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading...
      </div>
    );
  }

  // 2. If logged in, kick them out of the public pages to their correct dashboard
  if (isAuthenticated) {
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // This was your bug! It was redirecting to /login instead of /find-ride
    if (role === ROLES.USER) {
      return <Navigate to="/find-ride" replace />; 
    }
  }

  // 3. If not logged in, allow access to /login, /register, etc.
  return <Outlet />;
};

export default PublicRoute;