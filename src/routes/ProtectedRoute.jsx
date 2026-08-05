import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  console.log(role,'rolerole')

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  console.log(allowedRoles,'allowedRoles')
  console.log(role,'role')


  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;