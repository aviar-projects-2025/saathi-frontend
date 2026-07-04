import { createContext, useContext, useEffect, useState } from "react";
import notificationSound from "../sounds/notifysound.wav";
import { toast } from "react-toastify";
import socket from "../socket";
import axios from "axios";
import Api from "../Api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [allRequests, setAllRequests] = useState([]);
    const [allMyRequests, setAllMyRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'))
    const [tabNotification, setTabNotification] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(Api + `/notification/${user.id}/`)
            console.log(res, 'res')
            setTabNotification(res?.data?.data)
        } catch (error) {
            toast.error(error.message)
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
        console.log('joined ', user.id)
        const handleEvent = (payload) => {
            const { type, data, message, category } = payload;

            const audio = new Audio(notificationSound);
            audio.currentTime = 0;
            audio.play();

            const newNotification = {
                id: data._id || Date.now(),
                type,
                category: category || "general",
                data,
                message,
                read: false,
                createdAt: new Date()
            };

            setNotifications((prev) => [newNotification, ...prev]);

            toast.info(message || "New notification");

            // switch (type) {
            //     case "new_request":
            //         setAllRequests((prev) => [data, ...prev]);
            //         break;

            //     case "request_update":
            //         setAllRequests((prev) =>
            //             prev.map((r) => r._id === data._id ? data : r)
            //         );
            //         break;

            //     default:
            //         console.log("Unhandled event:", type);
            // }
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
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);