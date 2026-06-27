import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "../Navbar/footer.jsx";

const adminMenus = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Users", path: "/admin/users" },
  { label: "Community", path: "/community" },
  { label: "Invite", path: "/invite" },
];

const AdminLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar/>

      <Box component="main" sx={{ flex: 1, p: 3 }}>
        <Outlet />
      </Box>
       <Footer/>
    </Box>
  );
};

export default AdminLayout;