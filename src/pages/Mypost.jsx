import React, { useState, useEffect } from "react";
import axios from "axios";
import Api from "../Api";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import ShareIcon from "@mui/icons-material/Share";
import { useUser } from "../context/userConetext";
import CommunityComments from "./CommunityComments.jsx";

const Mypost = () => {
  const { currentUser } = useUser();

  const [communityPosts, setCommunityPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(false);

  const formattedDateTime = (createdAt) => {
    return new Date(createdAt).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCommunityPost = async () => {
    try {
      setPostLoading(true);

      const postsRes = await axios.get(Api + "/community/");

      // Only current user's posts
      const myPosts = postsRes.data.data.filter(
        (item) => item.authorId?._id === currentUser?._id
      );

      setCommunityPosts(myPosts);
    } catch (error) {
      console.error(error);
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) {
      getCommunityPost();
    }
  }, [currentUser]);

  if (postLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 700,
        mx: "auto",
        px: 2,
        py: 3,
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={3}>
        My Posts
      </Typography>

      {communityPosts.length === 0 ? (
        <Typography align="center">No posts found.</Typography>
      ) : (
        communityPosts.map((post) => (
          <Paper
            key={post._id}
            elevation={2}
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
       
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
              }}
            >
              <Avatar
                src={post.authorId?.profileImage}
                sx={{ width: 45, height: 45 }}
              />

              <Box ml={2}>
                <Typography fontWeight={700}>
                  {post.authorId?.firstName} {post.authorId?.lastName}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {formattedDateTime(post.createdAt)}
                </Typography>
              </Box>
            </Box>
           
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
              }}
            >
            {post.description && (
              <Typography px={2} pb={2}>
                {post.description}
              </Typography>
            )}
            </Box>
            {Array.isArray(post.postImage) ? (
              post.postImage.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "cover",
                  }}
                />
              ))
            ) : post.postImage ? (
              <img
                src={post.postImage}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "cover",
                }}
              />
            ) : null}

            <Divider />

            {/* Actions */}
            <Stack
              direction="row"
              justifyContent="space-around"
              sx={{ py: 1 }}
            >
              <Button startIcon={<ThumbUpOffAltIcon />}>
                {Array.isArray(post.likes)
                  ? post.likes.length
                  : post.likes || 0}
              </Button>

              <Button startIcon={<ChatIcon />}>
                {post.comments?.length || 0}
              </Button>

              <Button startIcon={<ShareIcon />}>
                Share
              </Button>
            </Stack>

            <Divider />

            {/* Comments */}
            <CommunityComments
              post={post}
              user={currentUser}
            />
          </Paper>
        ))
      )}
    </Box>
  );
};

export default Mypost;