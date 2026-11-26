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

    /* ─────────────────────────────────────────────────────────────
       BRD 6.2 — User Profile (Trust Profile)

       Required: first name, last name, verified phone (private),
                 city, profile photo.
       Optional: languages, profession, zip, bio, gender, DOB.

       A profile must be 100% complete (all REQUIRED fields filled)
       before the member can post or request a ride. Optional fields
       must NOT count toward the gate.
       ───────────────────────────────────────────────────────────── */
    const requiredFields = [
        "firstName",
        "lastName",
        "mobile",       // verified phone (private)
        "city",
        "profileImage", // profile photo
    ];

    const calculateProfileCompletion = (user) => {
        if (!user) return 0;

        let completed = 0;
        requiredFields.forEach((field) => {
            let value = user[field];

            // A photo may be stored as `profileImage` (S3 key) or
            // exposed as `profileImageUrl` (signed URL). Accept either
            // so a member with a photo isn't reported incomplete.
            if (field === "profileImage") {
                value = user.profileImage || user.profileImageUrl || "";
            }

            if (value && String(value).trim() !== "") completed++;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getuserData = async () => {
        try {
            const res = await axios.get(`${Api}/users/${storedUser.id}`, authConfig());
            setCurrentUser(res.data.data);
        } catch (error) {
            console.log("Failed to fetch user data:", error);
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
            console.log("Failed to fetch saved posts:", error);
        } finally {
            setSavedLoading(false);
        }
    };

    /* ─────────────── single-post helpers ─────────────── */
    const isSaved = (postId) =>
        savedPost.some((item) => String(item?._id || item?.postId?._id) === String(postId));

    // ★ Removes the current user's save of the post.
    const removeSavedPost = async (postId) => {
        // Use fallback for userId to prevent race conditions on load
        const userId = currentUser?._id || storedUser?.id;

        if (!postId || !userId) return false;
        if (savingPostId === postId) return false;

        const prev = savedPost;
        setSavingPostId(postId);
        setRemoveLoading(true);

        // Optimistic remove
        setSavedPost((list) =>
            list.filter((item) => String(item?._id || item?.postId?._id) !== String(postId))
        );

        try {
            await axios.delete(
                `${Api}/save-post/${postId}/${userId}`,
                authConfig()
            );
            return true;
        } catch (error) {
            // If it's a 404, the backend says it's already unsaved. Treat as success.
            if (error.response?.status === 404) {
                return true;
            }
            // Real error: rollback
            setSavedPost(prev);
            console.log("Failed to unsave:", error.response?.data || error.message);
            return false;
        } finally {
            setSavingPostId(null);
            setRemoveLoading(false);
        }
    };

    // ★ Saves the post (no-op if already saved).
    const savePost = async (post) => {
        const postId = post?._id;
        // Use fallback for userId to prevent race conditions on load
        const userId = currentUser?._id || storedUser?.id;

        if (!postId || !userId) return false;
        if (savingPostId === postId) return false;
        if (isSaved(postId)) return true;

        setSavingPostId(postId);
        setSaveLoading(true);

        // Optimistic add
        const optimistic = { ...post, isSaved: true, savedAt: new Date().toISOString() };
        setSavedPost((list) => [optimistic, ...list]);

        try {
            await axios.post(
                `${Api}/save-post/${postId}/${userId}`,
                {},
                authConfig()
            );
            return true;
        } catch (error) {
            // Rollback
            setSavedPost((list) =>
                list.filter((item) => String(item?._id) !== String(postId))
            );
            console.log("Failed to save:", error.response?.data || error.message);
            return false;
        } finally {
            setSavingPostId(null);
            setSaveLoading(false);
        }
    };

    // ★ One call to rule them all.
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