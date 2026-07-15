// import React, { useEffect } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import ProtectedRoute from "./routes/ProtectedRoute.jsx";
// import ROLES from "./context/Role";

// // Public Pages
// import Web from "./pages/Web.jsx";
// import Login from "./components/Auth/Login.jsx";
// import Register from "./components/Auth/Register.jsx";
// import Unauthorized from "./pages/Unauthorized.jsx";
// import PublicRoute from "./routes/PublicRoute.jsx";

// // Shared (both roles)
// import BottomNav from "./components/BottomNav.jsx";
// import Invite from "./pages/Invite.jsx";

// // USER pages
// import Home from "./pages/Home.jsx";
// import FindRides from "./pages/FindRides.jsx";
// import Profile from "./pages/Profile.jsx";
// import Community from "./pages/Community.jsx";
// import Myprofile from "./pages/Myprofile.jsx";
// import Discover from "./pages/Discover.jsx";
// import UserProfile from "./pages/UserProfile.jsx";

// // import myRides from "./pages/MyRides.jsx";
// import Notification from "./pages/Notification.jsx";
// import OfferRide from "./pages/OfferRide.jsx";

// // ADMIN pages
// import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
// import AdminUsers from "./pages/admin/AdminUsers.jsx";
// import { ToastContainer } from "react-toastify";
// import AdminLayout from "./components/AdminLayout.jsx";
// import MyRides from "./pages/MyRides.jsx";
// import UserLayout from "./components/UserLayout.jsx";
// import WaitingApproval from "./components/Auth/WaitingApproval.jsx";
// import MyReferrals from "./pages/referral/MyReferrals.jsx";
// import Settings from "./pages/Settings.jsx";
// import RequestRide from "./pages/RequestRide.jsx";

// function App() {

//   useEffect(() => {
//     const handleClose = () => {
//       sessionStorage.clear(); // or localStorage.clear()
//     };

//     window.addEventListener("beforeunload", handleClose);

//     return () => {
//       window.removeEventListener("beforeunload", handleClose);
//     };
//   }, []);

//   return (  
//     <BrowserRouter>
//       <ToastContainer
//         hideProgressBar
//         draggable={true}
//         closeButton={false}
//         position="top-center"
//         autoClose={3000}
//         theme="light"
//       />
//       <Routes>
//         <Route path="/" element={<Web />} />
//         <Route path="/unauthorized" element={<Unauthorized />} />

//         {/* Public auth routes */}
//         <Route element={<PublicRoute />}>
//           <Route path="/login" element={<Login />} />
//           <Route path="/waiting-approval" element={<WaitingApproval />} />
//           <Route path="/register" element={<Register />} />
//         </Route>

//         {/* ADMIN only routes */}
//         <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
//           <Route element={<AdminLayout />}>
//             <Route path="/admin/dashboard" element={<AdminDashboard />} />
//             <Route path="/admin/users" element={<AdminUsers />} />
//           </Route>
//         </Route>

//         {/* USER only routes */}
//         <Route element={<ProtectedRoute allowedRoles={[ROLES.USER]} />}>
//           <Route element={<UserLayout />}>
//             <Route path="/home" element={<Home />} />
//             <Route path="/find-ride" element={<FindRides />} />
//             <Route path="/offer-ride" element={<OfferRide />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/myprofile" element ={<Myprofile/>}/>
//             <Route path="/myride" element={<MyRides />} />
//             <Route path ="/user-profile" element={<UserProfile/>}/>
//             <Route path="/notification" element={<Notification />} />
//             <Route path="/discover" element={<Discover />} />
//             <Route path="/request-ride" element={<RequestRide />} />

//           </Route>
//         </Route>

//         {/*Both ADMIN and USER */}
//         <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.USER]} />}>
//           <Route element={<UserLayout />}>
//             <Route path="/invite" element={<Invite />} />
//             <Route path="/community" element={<Community />} />
//             <Route path="/my-referalls" element={<MyReferrals />} />
//             <Route path="/settings" element={<Settings />} />


//           </Route>
//         </Route>

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/login" replace />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import ROLES from "./context/Role";
import { ToastContainer } from "react-toastify";

// Layouts (kept eager since they wrap routes and load immediately anyway)
import AdminLayout from "./components/AdminLayout.jsx";
import UserLayout from "./components/UserLayout.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";

// ---------- Lazy-loaded Pages ----------

// Public Pages
const Web = React.lazy(() => import("./pages/Web.jsx"));
const Login = React.lazy(() => import("./components/Auth/Login.jsx"));
const Register = React.lazy(() => import("./components/Auth/Register.jsx"));
const Unauthorized = React.lazy(() => import("./pages/Unauthorized.jsx"));
const WaitingApproval = React.lazy(() =>
  import("./components/Auth/WaitingApproval.jsx")
);

// Shared (both roles)
const Invite = React.lazy(() => import("./pages/Invite.jsx"));

// USER pages
const Home = React.lazy(() => import("./pages/Home.jsx"));
const FindRides = React.lazy(() => import("./pages/FindRides.jsx"));
const Profile = React.lazy(() => import("./pages/Profile.jsx"));
const Community = React.lazy(() => import("./pages/Community.jsx"));
const Myprofile = React.lazy(() => import("./pages/Myprofile.jsx"));
const Discover = React.lazy(() => import("./pages/Discover.jsx"));
const UserProfile = React.lazy(() => import("./pages/UserProfile.jsx"));
const Notification = React.lazy(() => import("./pages/Notification.jsx"));
const OfferRide = React.lazy(() => import("./pages/OfferRide.jsx"));
const MyRides = React.lazy(() => import("./pages/MyRides.jsx"));
const MyReferrals = React.lazy(() =>
  import("./pages/referral/MyReferrals.jsx")
);
const Settings = React.lazy(() => import("./pages/Settings.jsx"));
const RequestRide = React.lazy(() => import("./pages/RequestRide.jsx"));

// ADMIN pages
const AdminDashboard = React.lazy(() =>
  import("./pages/admin/AdminDashboard.jsx")
);
const AdminUsers = React.lazy(() => import("./pages/admin/AdminUsers.jsx"));

// ---------- Fallback Loader ----------
const Loader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.2rem",
    }}
  >
    Loading...
  </div>
);

function App() {
  useEffect(() => {
    const handleClose = () => {
      sessionStorage.clear(); // or localStorage.clear()
    };

    window.addEventListener("beforeunload", handleClose);

    return () => {
      window.removeEventListener("beforeunload", handleClose);
    };
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer
        hideProgressBar
        draggable={true}
        closeButton={false}
        position="top-center"
        autoClose={3000}
        theme="light"
      />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Web />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Public auth routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/waiting-approval" element={<WaitingApproval />} />
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
              <Route path="/home" element={<Home />} />
              <Route path="/find-ride" element={<FindRides />} />
              <Route path="/offer-ride" element={<OfferRide />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/myprofile" element={<Myprofile />} />
              <Route path="/myride" element={<MyRides />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/notification" element={<Notification />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/request-ride" element={<RequestRide />} />
            </Route>
          </Route>

          {/* Both ADMIN and USER */}
          <Route
            element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.USER]} />}
          >
            <Route element={<UserLayout />}>
              <Route path="/invite" element={<Invite />} />
              <Route path="/community" element={<Community />} />
              <Route path="/my-referalls" element={<MyReferrals />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;