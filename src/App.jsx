import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Box } from '@mui/material';

import { AppProvider, useApp } from './context/AppContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import FindRides from './pages/FindRides.jsx';
import PostRide from './pages/PostRide.jsx';
import Invite from './pages/Invite.jsx';
import Profile from './pages/Profile.jsx';
import InviteFriend from './pages/InviteFriend.jsx'
import Login from './components/Auth/Login.jsx'
import SignupForm from './components/Auth/SignUp.jsx'

function AppContent() {
  const { snackbar, closeSnackbar } = useApp();
  return (
    <>
      <Box >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/sign" element={<SignupForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/find" element={<FindRides />} />
          <Route path="/post" element={<PostRide />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Box>
      <BottomNav />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%', fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function App() {
  return (
    <>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProvider>
    </>
  );
}
