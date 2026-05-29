import React, { createContext, useContext, useState } from 'react';
import { rides as initialRides, currentUser } from '../data/mockData.jsx';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [rides, setRides] = useState(initialRides);
  const [user] = useState(currentUser);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const addRide = (ride) => {
    setRides(prev => [{ ...ride, id: `r${Date.now()}`, driver: { name: user.name, avatar: user.avatar, trustScore: user.trustScore, referredBy: user.referredBy, languages: user.languages } }, ...prev]);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <AppContext.Provider value={{ rides, addRide, user, snackbar, showSnackbar, closeSnackbar }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
