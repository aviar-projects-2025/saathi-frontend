import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const [currentUser, setCurrentUser] = useState(null);
    const [savedPost, setSavedPost] = useState([]);

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
            getSavedPost();
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

    const removeSavedPost = async (postId) => {
        try {
            console.log(postId, 'postId');

            await axios.delete(
                `${Api}/save-post/${postId}/${currentUser._id}`
            );

            setSavedPost((prev) =>
                prev.filter((item) => item.postId._id !== postId)
            );

        } catch (error) {
            console.log(error);
        }
    };

    const getSavedPost = async () => {
        try {
            axios.get(Api + `/save-post/${storedUser.id}`)
                .then((res) => {
                    setSavedPost(res?.data?.savedPosts)
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                getuserData,
                completion,
                savedPost,
                setSavedPost,
                removeSavedPost
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