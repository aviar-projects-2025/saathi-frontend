import { createContext, useContext, useEffect, useState } from "react";
import { currentUser } from "../data/mockData";
import Api from "../Api";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const user = JSON.parse(localStorage.getItem('user'))
    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        getuserData()
    }, [user?.id])

    const getuserData = () => {
        try {
            axios.get(Api + `/users/${user?.id}`)
                .then((res) => {
                    setCurrentUser(res.data.data)
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser
            }}
        >
            {children}
        </UserContext.Provider>
    )
};

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUser must be used inside AppProvider");
    }

    return context;
};