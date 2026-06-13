import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ROLES from "./context/Role";

// Public Pages
import Web from "./pages/Web.jsx";
import Login from "./components/Auth/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Web />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public auth routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
        </Route>

        {/* ADMIN only routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* USER only routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/find" element={<FindRides />} />
          <Route path="/offerRide" element={<OfferRide />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/myRide" element={<MyRide />} />
          <Route path="/notification" element={<Notification />} />
        </Route>

        {/*Both ADMIN and USER */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.USER]} />}>
          <Route path="/invite" element={<Invite />} />
          <Route path="/community" element={<Community />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;