import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ReferralProvider } from "./context/ReferralContext";
import { UserProvider } from "./context/userConetext";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <AppProvider>
          <ReferralProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </ReferralProvider>
        </AppProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);