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
import { RatingProvider } from "./context/RatingContext"
import './utils/axiosInterceptor'
import { ChatSocketProvider } from "./context/ChatSocketContext";
import { ChatModalProvider } from "./context/ChatModalContext";
import { PostProvider } from "./context/PostContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <ChatSocketProvider>
            <ChatModalProvider>
              <RideProvider>
                <ReferralProvider>
                  <PostProvider>
                    <AppProvider>
                      <RatingProvider>
                        <App />
                      </RatingProvider>
                    </AppProvider>
                  </PostProvider>
                </ReferralProvider>
              </RideProvider>
            </ChatModalProvider>
          </ChatSocketProvider>
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);