import { Navigate, Outlet } from "react-router-dom";
import ROLES from "../context/Role";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (role === ROLES.USER) {
      return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;