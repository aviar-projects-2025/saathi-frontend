import {Navigate, Outlet} from "react-router-dom"
import roles from "../context/Role";
const ProtectedRoute = ()=>{
    const token = localStorage.getItem ("token");

    return token ? <Outlet/>: <Navigate to ="/login" replace />;
}

export default ProtectedRoute