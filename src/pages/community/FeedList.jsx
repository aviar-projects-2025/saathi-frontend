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
      {/* Full-width wrapper so feed items fill the available space at every breakpoint */}
      <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 3, sm: 4 } }}>
            <CircularProgress sx={{ color: "#E8650A", width: { xs: "28px !important", sm: "34px !important" }, height: { xs: "28px !important", sm: "34px !important" } }} />
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 3 } }}>
            <Typography fontWeight={600} sx={{ fontSize: { xs: "0.95rem", sm: "1rem", md: "1.05rem" } }}>
              Nothing here yet
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: { xs: "0.84rem", sm: "0.92rem", md: "1rem" }, wordBreak: "break-word" }}
            >
              {emptyText}
            </Typography>
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
          <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 2, sm: 3 } }}>
            <CircularProgress sx={{ color: "#FF9933", width: { xs: "26px !important", sm: "30px !important" }, height: { xs: "26px !important", sm: "30px !important" } }} />
          </Box>
        )}
      </Box>

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