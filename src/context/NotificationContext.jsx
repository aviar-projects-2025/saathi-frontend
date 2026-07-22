import { createContext, useContext, useEffect, useState } from "react";
import notificationSound from "../sounds/notifysound.wav";
import { toast } from "react-toastify";
import socket from "../socket";
import axios from "axios";
import Api from "../Api";
import { useTheme, useMediaQuery } from '@mui/material';
import ToastConfig from "../components/ToastConfig";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [allRequests, setAllRequests] = useState([]);
    const [allMyRequests, setAllMyRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'))
    const [tabNotification, setTabNotification] = useState([]);

    const toasts = ToastConfig();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(Api + `/notification/${user.id}/`)
            setTabNotification(res?.data?.data)
        } catch (error) {
            toast.error(error.message, toasts);
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

            toast.info(message || "New notification", toasts);
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