import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ReferralProvider } from "./context/ReferralContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <ReferralProvider>
          <App />
        </ReferralProvider>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);