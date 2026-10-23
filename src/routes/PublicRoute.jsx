import { Navigate, Outlet } from "react-router-dom";
import ROLES from "../context/Role";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token) {
    if (role === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    console.log(ROLES.USER,'ROLES.USER')
    console.log(role,'role')


    if (role === ROLES.USER) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;