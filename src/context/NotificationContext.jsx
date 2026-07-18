import { createContext, useContext, useEffect, useState } from "react";
import notificationSound from "../sounds/notifysound.wav";
import { toast } from "react-toastify";
import socket from "../socket";
import axios from "axios";
import Api from "../Api";
import { useTheme, useMediaQuery } from '@mui/material';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [allRequests, setAllRequests] = useState([]);
    const [allMyRequests, setAllMyRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'))
    const [tabNotification, setTabNotification] = useState([]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(Api + `/notification/${user.id}/`)
            setTabNotification(res?.data?.data)
        } catch (error) {
            toast.error(error.message, {
                position: isMobile ? "top-center" : "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeButton: false,
                style: {
                    width: isMobile ? "90vw" : "360px",
                    maxWidth: isMobile ? "320px" : "360px",
                    fontSize: isMobile ? "13px" : "15px",
                    padding: isMobile ? "8px 12px" : "12px 16px",
                    borderRadius: isMobile ? "8px" : "10px",
                    minHeight: isMobile ? "42px" : "52px",
                    margin: "0 auto",
                },
            });
            console.log(error)
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user?.id])


    useEffect(() => {
        if (!user?.id) return;
        socket.emit("join", user.id);
        // console.log('joined ', user.id)
        const handleEvent = (payload) => {
            const { type, data, message, category } = payload;
            const audio = new Audio(notificationSound);
            audio.currentTime = 0;
            audio.play();

            // console.log(payload,'payload')
            const newNotification = {
                _id: data._id || Date.now(),
                type,
                category: category || "general",
                data,
                message,
                isRead: type == "ride_started" ? true : false,
                createdAt: new Date()
            };

            setNotifications((prev) => [newNotification, ...prev]);
            setTabNotification((prev) => [newNotification, ...prev]);

            toast.info(message || "New notification", {
                position: isMobile ? "top-center" : "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeButton: false,
                style: {
                    width: isMobile ? "90vw" : "360px",
                    maxWidth: isMobile ? "320px" : "360px",
                    fontSize: isMobile ? "13px" : "15px",
                    padding: isMobile ? "8px 12px" : "12px 16px",
                    borderRadius: isMobile ? "8px" : "10px",
                    minHeight: isMobile ? "42px" : "52px",
                    margin: "0 auto",
                },
            });
        };

        socket.on("notification", handleEvent);

        return () => {
            socket.off("notification", handleEvent);
        };
    }, [user?.id]);

    return (
        <NotificationContext.Provider
            value={{
                allRequests,
                setAllRequests,
                allMyRequests,
                setAllMyRequests,
                notifications,
                tabNotification,
                fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);