import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import CommunityFeedItem from "./CommunityFeedItem.jsx";
import ProfileModal from "../Avatar.jsx";
import ChatModal from "../ChatModal";

/**
 * Renders a feed returned by useCommunityFeed():
 * loading / empty states, items, infinite scroll, and the profile + chat modals.
 */
export default function FeedList({ feed, emptyText = "No posts yet. Be the first!" }) {
  const {
    currentUser, posts, loading, loadingMore, hasMore, loadMore,
    toggleLike, toggleSave, isPostSaved, deletePost, updatePost,
  } = feed;

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState(null);

  /* infinite scroll sentinel */
  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, posts.length]);

  const openProfile = (user) => {
    if (!user) return;
    setSelectedProfile(user);
    setProfileOpen(true);
  };

  const openChat = (user) => {
    if (!user) return;
    setProfileOpen(false);
    setChatUser(user);
    setChatOpen(true);
  };

  return (
    <>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={34} sx={{ color: "#E8650A" }} />
        </Box>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography fontWeight={600}>Nothing here yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{emptyText}</Typography>
        </Box>
      ) : (
        posts.map((post) => (
          <CommunityFeedItem
            key={post._id}
            post={post}
            currentUser={currentUser}
            isPostSaved={isPostSaved}
            onToggleLike={toggleLike}
            onToggleSave={toggleSave}
            onDeletePost={deletePost}
            onUpdatePost={updatePost}
            onUserClick={openProfile}
            onMessage={openChat}
          />
        ))
      )}

      {!loading && hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

      {loadingMore && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={30} sx={{ color: "#FF9933" }} />
        </Box>
      )}

      <ProfileModal
        open={profileOpen}
        selectedProfile={selectedProfile}
        currentUser={currentUser}
        onClose={() => setProfileOpen(false)}
        onMessage={openChat}
      />
      <ChatModal
        open={chatOpen}
        selectedUser={chatUser}
        onClose={() => { setChatOpen(false); setChatUser(null); }}
      />
    </>
  );
}
