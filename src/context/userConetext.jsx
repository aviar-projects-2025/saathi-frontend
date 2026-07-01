import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const [currentUser, setCurrentUser] = useState(null);

    const requiredFields = [
        "firstName",
        "lastName",
        "bio",
        "email",
        "mobile",
        "profileImage",
        "gender",
    ];

    const calculateProfileCompletion = (user) => {
        if (!user) return 0;

        let completed = 0;

        requiredFields.forEach((field) => {
            if (user[field] && user[field].toString().trim() !== "") {
                completed++;
            }
        });

        return Math.round((completed / requiredFields.length) * 100);
    };

    const completion = calculateProfileCompletion(currentUser);

    useEffect(() => {
        if (storedUser?.id) {
            getuserData();
        }
    }, []);

    const getuserData = async () => {
        try {
            const res = await axios.get(`${Api}/users/${storedUser.id}`);
            setCurrentUser(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                getuserData,
                completion,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used inside UserProvider");
    }

    return context;
};