import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../../Api.jsx";
import { useUser } from "../../context/userConetext.jsx";
import ToastConfig from "../../components/ToastConfig.jsx";
import uploadImageToS3 from "../../utils/s3Upload.js";

const PAGE_SIZE = 10;

/* ── zipcode proximity (from the old Community page) ── */
const normalizePostal = (code) =>
  String(code || "").trim().toUpperCase().replace(/\s+/g, "");

const commonPrefixLen = (a, b) => {
  let i = 0;
  const len = Math.min(a.length, b.length);
  while (i < len && a[i] === b[i]) i++;
  return i;
};

const proximityScore = (postZip, userZip) => {
  const a = normalizePostal(postZip);
  const b = normalizePostal(userZip);
  if (!a || !b) return Infinity;
  if (a === b) return 0;
  if (a.length !== b.length) return 100;
  return a.length - commonPrefixLen(a, b);
};

const sortByZipProximity = (posts, userZip) =>
  [...posts].sort((p, q) => {
    // a post's own zipcode wins; fall back to the author's profile zipcode
    const sa = proximityScore(p.zipcode || p.authorId?.zipcode, userZip);
    const sb = proximityScore(q.zipcode || q.authorId?.zipcode, userZip);
    return sa === sb ? 0 : sa < sb ? -1 : 1; // safe with Infinity
  });

/**
 * One hook powering both the Community home feed and each Room page.
 * Handles: fetch, infinite scroll, like, save, edit (with image), delete.
 */
export default function useCommunityFeed({
  room = "all",
  subCategory = "All",
  sortByProximity = false,
} = {}) {
  const { currentUser, savedPost, setSavedPost, removeSavedPost } = useUser();
  const toasts = ToastConfig();
  const userId = currentUser?._id;
  const userZip = currentUser?.zipcode;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const requestRef = useRef(0); // ignore stale responses when room / sub-category changes

  const fetchPage = useCallback(
    async (page) => {
      const params = { page, limit: PAGE_SIZE };
      if (room && room !== "all") params.room = room;
      if (subCategory && subCategory !== "All") params.subCategory = subCategory;

      const [postsRes, likesRes] = await Promise.all([
        axios.get(`${Api}/community`, { params }),
        axios.get(`${Api}/likes/liked-posts/${userId}`),
      ]);

      const liked = new Set(likesRes?.data?.data || []);
      const items = (postsRes?.data?.data || []).map((p) => ({
        ...p,
        isLiked: liked.has(p._id),
        commentCount: p.commentCount ?? p.comments?.length ?? 0,
      }));

      return { items, more: postsRes?.data?.pagination?.hasMore ?? false };
    },
    [room, subCategory, userId]
  );

  /* ── first page / refresh ── */
  const refresh = useCallback(async () => {
    if (!userId) return;
    const reqId = ++requestRef.current;
    try {
      setLoading(true);
      const { items, more } = await fetchPage(1);
      if (reqId !== requestRef.current) return;
      setPosts(sortByProximity ? sortByZipProximity(items, userZip) : items);
      pageRef.current = 1;
      setHasMore(more);
    } catch (error) {
      console.error("Community feed error:", error.response?.data || error);
      if (reqId === requestRef.current) toast.error("Failed to load feed", toasts);
    } finally {
      if (reqId === requestRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage, sortByProximity, userZip, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ── infinite scroll ── */
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const reqId = requestRef.current;
    try {
      const next = pageRef.current + 1;
      const { items, more } = await fetchPage(next);
      if (reqId !== requestRef.current) return;
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...items.filter((p) => !seen.has(p._id))];
      });
      pageRef.current = next;
      setHasMore(more);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading]);

  /* ── like ── */
  const toggleLike = useCallback(
    async (postId, isLiked) => {
      const apply = (liked) =>
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, isLiked: liked, likes: Math.max((p.likes || 0) + (liked ? 1 : -1), 0) }
              : p
          )
        );

      apply(!isLiked); // optimistic
      try {
        const res = isLiked
          ? await axios.delete(`${Api}/likes/${postId}/${userId}`)
          : await axios.post(`${Api}/likes/${postId}/${userId}`);

        // sync with the server's truth when it returns it
        const { isLiked: serverLiked, likesCount } = res?.data || {};
        if (typeof likesCount === "number") {
          setPosts((prev) =>
            prev.map((p) =>
              p._id === postId
                ? { ...p, isLiked: typeof serverLiked === "boolean" ? serverLiked : p.isLiked, likes: likesCount }
                : p
            )
          );
        }
      } catch (error) {
        console.error(error);
        apply(isLiked); // revert
      }
    },
    [userId]
  );

  /* ── save ── */
  const isPostSaved = useCallback(
    (postId) => !!savedPost?.some((item) => item.postId?._id === postId),
    [savedPost]
  );

  const toggleSave = useCallback(
    async (post) => {
      if (isPostSaved(post._id)) {
        removeSavedPost(post._id);
        return;
      }
      try {
        const res = await axios.post(`${Api}/save-post/${post._id}/${userId}`);
        setSavedPost((prev) => [...prev, { _id: res.data.data._id, postId: post, userId }]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to save post", toasts);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPostSaved, removeSavedPost, setSavedPost, userId]
  );

  /* ── delete ── returns true / false */
  const deletePost = useCallback(
    async (postId) => {
      try {
        const res = await axios.delete(`${Api}/community/${postId}`, { data: { userId } });
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success(res.data.message, toasts);
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete post", toasts);
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId]
  );

  /* ── edit (text + optional new image) ── returns true / false */
  const updatePost = useCallback(
    async (postId, { title, description, imageFile, when }) => {
      try {
        let imageKey;
        if (imageFile) {
          const { key } = await uploadImageToS3(imageFile, "community");
          imageKey = key;
        }

        const res = await axios.put(`${Api}/community/${postId}`, {
          userId,
          ...(title !== undefined && { title }),
          ...(when !== undefined && { when }),
          description,
          ...(imageKey && { postImage: imageKey }),
        });

        const updated = res.data.data;
        console.log(updated,'updated')
        setPosts((prev) =>
          prev.map((p) =>(
            p._id === postId
              ? {
                  ...p,
                  title: updated.title,
                  timeframe : updated.timeframe,
                  description: updated.description,
                  postImage: updated.postImage,
                  postImageUrl: updated.postImageUrl,
                }
              : p
          ))
        );
        toast.success(res.data.message || "Post updated", toasts);
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update post", toasts);
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId]
  );

  return {
    currentUser,
    posts,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    toggleLike,
    toggleSave,
    isPostSaved,
    deletePost,
    updatePost,
  };
}
