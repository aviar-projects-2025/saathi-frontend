import { createContext, useContext, useEffect, useState } from "react";
import Api from "../Api";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const [currentUser, setCurrentUser] = useState(null);
    const [savedPost, setSavedPost] = useState([]);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [savingPostId, setSavingPostId] = useState(null);

    const requiredFields = [
        "firstName",
        "lastName",
        "bio",
        "language",
        "mobile",
        "profileImage",
        "gender",
        "zipcode",
    ];

    const calculateProfileCompletion = (user) => {
        if (!user) return 0;
        let completed = 0;
        requiredFields.forEach((field) => {
            if (user[field] && user[field].toString().trim() !== "") completed++;
        });
        return Math.round((completed / requiredFields.length) * 100);
    };

    const completion = calculateProfileCompletion(currentUser);

    const authConfig = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });

    useEffect(() => {
        if (storedUser?.id) {
            getuserData();
            getSavedPost();
        }
    }, []);

    const getuserData = async () => {
        try {
            const res = await axios.get(`${Api}/users/${storedUser.id}`, authConfig());
            setCurrentUser(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    /* ─────────────── saved-post list ─────────────── */
    const [savedPage, setSavedPage] = useState(1);
    const [savedHasNextPage, setSavedHasNextPage] = useState(true);
    const [savedLoading, setSavedLoading] = useState(false);

    const getSavedPost = async (pageNumber = 1) => {
        if (savedLoading || !savedHasNextPage) return;
        try {
            setSavedLoading(true);
            const res = await axios.get(
                `${Api}/save-post/${storedUser.id}?page=${pageNumber}&limit=12`,
                authConfig()
            );
            const newPosts = res?.data?.savedPosts || [];
            const pagination = res?.data?.pagination;

            setSavedPost((prev) => (pageNumber === 1 ? newPosts : [...prev, ...newPosts]));
            setSavedPage(pageNumber);
            setSavedHasNextPage(pagination?.hasNextPage ?? false);
        } catch (error) {
            console.log(error);
        } finally {
            setSavedLoading(false);
        }
    };

    /* ─────────────── single-post helpers ─────────────── */
    const isSaved = (postId) =>
        savedPost.some((item) => String(item?._id || item?.postId?._id) === String(postId));

    // ★ Removes the current user's save of the post.
    //   Optimistically updates savedPost, and rolls back on failure.
    const removeSavedPost = async (postId) => {
        if (!postId || !currentUser?._id) return false;
        if (savingPostId === postId) return false;

        const prev = savedPost;
        setSavingPostId(postId);
        setRemoveLoading(true);

        // optimistic remove
        setSavedPost((list) =>
            list.filter((item) => String(item?._id || item?.postId?._id) !== String(postId))
        );

        try {
            await axios.delete(
                `${Api}/save-post/${postId}/${currentUser._id}`,
                authConfig()
            );
            return true;
        } catch (error) {
            // rollback
            setSavedPost(prev);
            console.log(error);
            return false;
        } finally {
            setSavingPostId(null);
            setRemoveLoading(false);
        }
    };

    // ★ Saves the post (no-op if already saved).
    const savePost = async (post) => {
        const postId = post?._id;
        if (!postId || !currentUser?._id) return false;
        if (savingPostId === postId) return false;
        if (isSaved(postId)) return true;

        setSavingPostId(postId);
        setSaveLoading(true);

        // optimistic add
        const optimistic = { ...post, isSaved: true, savedAt: new Date().toISOString() };
        setSavedPost((list) => [optimistic, ...list]);

        try {
            await axios.post(
                `${Api}/save-post/${postId}/${currentUser._id}`,
                {},
                authConfig()
            );
            return true;
        } catch (error) {
            // rollback
            setSavedPost((list) =>
                list.filter((item) => String(item?._id) !== String(postId))
            );
            console.log(error);
            return false;
        } finally {
            setSavingPostId(null);
            setSaveLoading(false);
        }
    };

    // ★ One call to rule them all — the UI just calls toggleSave(post).
    const toggleSave = async (post) => {
        if (!post?._id) return false;
        return isSaved(post._id) ? removeSavedPost(post._id) : savePost(post);
    };

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                getuserData,
                completion,

                savedPost,
                setSavedPost,
                getSavedPost,
                savedPage,
                savedHasNextPage,
                savedLoading,

                savePost,
                removeSavedPost,
                toggleSave,
                isSaved,
                savingPostId,
                saveLoading,
                removeLoading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used inside UserProvider");
    return context;
};