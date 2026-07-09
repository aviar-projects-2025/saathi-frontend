import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { RideProvider } from "./context/RideContext";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ReferralProvider } from "./context/ReferralContext";
import { UserProvider } from "./context/userConetext";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <RideProvider>
        <AppProvider>
          <ReferralProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </ReferralProvider>
        </AppProvider>
        </RideProvider>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);