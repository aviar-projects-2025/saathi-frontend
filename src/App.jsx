import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ROLES from "./context/Role";

// Public Pages
import Web from "./pages/Web.jsx";
import Login from "./components/Auth/Login.jsx";
import Register from "./pages/Register.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

// Shared (both roles)
import BottomNav from "./components/BottomNav.jsx";
import Invite from "./pages/Invite.jsx";

// USER pages
import Home from "./pages/Home.jsx";
import FindRides from "./pages/FindRides.jsx";
import Profile from "./pages/Profile.jsx";
import Community from "./pages/Community.jsx";
import MyRide from "./pages/MyRide.jsx";
import Notification from "./pages/Notification.jsx";
import OfferRide from "./pages/OfferRide.jsx";

// ADMIN pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import { ToastContainer } from "react-toastify";
import AdminLayout from "./components/AdminLayout.jsx";
import MyRides from "./pages/MyRides.jsx";
import UserLayout from "./components/UserLayout.jsx";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Web />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ADMIN only routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* USER only routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
          <Route element={<UserLayout />}>
            <Route path="/find-ride" element={<FindRides />} />
            <Route path="/offer-ride" element={<OfferRide />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/myride" element={<MyRides />} />
            <Route path="/notification" element={<Notification />} />
          </Route>
        </Route>

        {/*Both ADMIN and USER */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.USER]} />}>
          <Route element={<UserLayout />}>
            <Route path="/invite" element={<Invite />} />
            <Route path="/community" element={<Community />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;