import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box } from '@mui/material';

import { AppProvider, useApp } from './context/Roles.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import FindRides from './pages/FindRides.jsx';
import PostRide from './pages/PostRide.jsx';
import Invite from './pages/Invite.jsx';
import Profile from './pages/Profile.jsx';
import InviteFriend from './pages/InviteFriend.jsx';
import Web from "./pages/Web.jsx";
import Login from "./pages/Login.jsx";
import ProtectedeRoute from "./routes/ProtectedRoute.jsx"
function App() {

  return (
    <>
      <BrowserRouter >
        <Routes>
          <Route path="/" element={<Web/>} />
          <Route path="/login" element={<Login/>}/>

          <Route element ={<ProtectedeRoute />}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/find" element={<FindRides />} />
          <Route path="/post" element={<PostRide />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
  
      <BottomNav />
  
          </BrowserRouter>
    </>
  );
}

export default App

