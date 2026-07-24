import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Divider,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Api from "../Api";
import axios from "axios";
import moment from "moment/moment";

/* ── defined OUTSIDE so React never remounts it on re-render ── */
const CommentInput = ({ value, onChange, onSend, placeholder }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
    <TextField
      fullWidth
      multiline
      minRows={1}
      maxRows={4}
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.82rem" },
          py: 0.3,
          px: 0.5,
        },
        "& .MuiOutlinedInput-input": {
          py: 0.6,
        },
      }}
    />
    <IconButton
      size="small"
      onClick={onSend}
      color="primary"
      sx={{ p: { xs: 0.5, sm: 0.75 }, flexShrink: 0 }}
    >
      <SendIcon sx={{ fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" } }} />
    </IconButton>
  </Box>
);

const CommunityComments = ({ post, user, onCommentsChanged }) => {
  const [comment, setComment] = useState("");
  const [commentsFetched, setCommentsFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [isReply, setIsReply] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState({});

  useEffect(() => {
    getComments();
  }, [post]);

  const sendComment = async (postId) => {
    try {
      await axios.post(Api + `/community/comments/${postId}/${user.id}`, {
        comment,
      });
      setComment("");
      getComments();
    } catch (error) {
      console.log(error.message);
    }
  };

  const getComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(Api + `/community/comments/${post?._id}`);
      const list = res.data.data.comments;
      setCommentsFetched(list);
      onCommentsChanged?.(list.length);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const replySend = async (postId, parentId) => {
    try {
      await axios.post(
        Api + `/community/comments/${postId}/reply/${parentId}/${user.id}`,
        { reply },
      );
      setReply("");
      getComments();
    } catch (error) {
      console.log(error.message);
    }
  };

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const likeComment = async (commentId) => {
    try {
      const res = await axios.post(
        Api + `/community/likes/comment/${commentId}/${user.id}`,
      );
      setCommentsFetched((prev) =>
        prev.map((item) =>
          item._id === commentId
            ? {
                ...item,
                likes: res.data.likes,
                likedByCurrentUser: res.data.liked,
              }
            : item,
        ),
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const parentComments = commentsFetched.filter(
    (c) => c.parentCommentId === null,
  );
  const getReplies = (parentId) =>
    commentsFetched.filter((c) => c.parentCommentId === parentId);

  return (
    <Box sx={{ px: { xs: 0.5, sm: 1 } }}>
      {/* top comment input */}
      <Box sx={{ mb: 0.75 }}>
        <CommentInput
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onSend={() => sendComment(post._id)}
          placeholder="Write a comment…"
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: { xs: "0.68rem", sm: "0.72rem" }, fontWeight: 600 }}
      >
        Comments ({commentsFetched.length})
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box sx={{ mt: 0.75 }}>
          {parentComments.map((item, index) => {
            const replies = getReplies(item._id);

            return (
              <Box key={item._id}>
                {/* parent comment */}
                <Stack
                  direction="row"
                  spacing={{ xs: 0.75, sm: 1 }}
                  sx={{ py: 0.75 }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 24, sm: 28, md: 30 },
                      height: { xs: 24, sm: 28, md: 30 },
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        bgcolor: "#F7F7F7",
                        borderRadius: 2.5,
                        px: { xs: 1, sm: 1.25 },
                        py: { xs: 0.5, sm: 0.75 },
                      }}
                    >
                      <Typography
                        fontWeight={700}
                        noWrap
                        sx={{
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.75rem",
                            md: "0.8rem",
                          },
                        }}
                      >
                        {item.userId?.firstName} {item.userId?.lastName}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: "0.72rem",
                            sm: "0.78rem",
                            md: "0.82rem",
                          },
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.comment}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        mt: 0.2,
                        ml: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.62rem", sm: "0.65rem" } }}
                      >
                        {moment(item.createdAt).fromNow()}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={
                          item.likedByCurrentUser ? "primary" : "text.secondary"
                        }
                        onClick={() => likeComment(item._id)}
                        sx={{
                          fontSize: { xs: "0.62rem", sm: "0.65rem" },
                          ml: 0.75,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        · {item.likedByCurrentUser ? "Liked" : "Like"}
                        {item.likes > 0 ? ` (${item.likes})` : ""} ·
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        onClick={() =>
                          setIsReply((pre) =>
                            pre === item._id ? null : item._id,
                          )
                        }
                        sx={{
                          fontSize: { xs: "0.62rem", sm: "0.65rem" },
                          ml: 0.75,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        Reply
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                {/* reply input for parent */}
                {isReply === item._id && (
                  <Box sx={{ ml: { xs: 3.5, sm: 4.5, md: 5 }, mb: 0.75 }}>
                    <CommentInput
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onSend={() => replySend(post._id, item._id)}
                      placeholder="Write a reply…"
                    />
                  </Box>
                )}

                {/* toggle replies */}
                {replies.length > 0 && (
                  <Typography
                    variant="caption"
                    onClick={() => toggleReplies(item._id)}
                    sx={{
                      ml: { xs: 3.5, sm: 4.5, md: 5 },
                      display: "block",
                      cursor: "pointer",
                      fontWeight: 600,
                      color: "#0085e4",
                      fontSize: { xs: "0.62rem", sm: "0.65rem" },
                      mb: 0.5,
                    }}
                  >
                    {visibleReplies[item._id]
                      ? "Hide replies"
                      : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                  </Typography>
                )}

                {/* reply list */}
                {visibleReplies[item._id] &&
                  replies.map((replyItem) => (
                    <Box
                      key={replyItem._id}
                      sx={{ ml: { xs: 3.5, sm: 4.5, md: 5 }, mt: 0.5 }}
                    >
                      <Stack direction="row" spacing={{ xs: 0.5, sm: 0.75 }}>
                        <Avatar
                          sx={{
                            width: { xs: 20, sm: 22, md: 24 },
                            height: { xs: 20, sm: 22, md: 24 },
                            flexShrink: 0,
                            mt: 0.25,
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              bgcolor: "#F7F7F7",
                              borderRadius: 2.5,
                              px: { xs: 0.9, sm: 1.1 },
                              py: { xs: 0.4, sm: 0.6 },
                            }}
                          >
                            <Typography
                              fontWeight={700}
                              noWrap
                              sx={{
                                fontSize: {
                                  xs: "0.65rem",
                                  sm: "0.7rem",
                                  md: "0.75rem",
                                },
                              }}
                            >
                              {replyItem.userId.firstName}{" "}
                              {replyItem.userId.lastName}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "0.68rem",
                                  sm: "0.74rem",
                                  md: "0.78rem",
                                },
                                lineHeight: 1.4,
                                wordBreak: "break-word",
                              }}
                            >
                              {replyItem.comment}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              mt: 0.2,
                              ml: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                              }}
                            >
                              {moment(replyItem.createdAt).fromNow()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={
                                replyItem.likedByCurrentUser
                                  ? "primary"
                                  : "text.secondary"
                              }
                              onClick={() => likeComment(replyItem._id)}
                              sx={{
                                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                                ml: 0.75,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              ·{" "}
                              {replyItem.likedByCurrentUser ? "Liked" : "Like"}
                              {replyItem.likes > 0
                                ? ` (${replyItem.likes})`
                                : ""}{" "}
                              ·
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              onClick={() =>
                                setIsReply((pre) =>
                                  pre === replyItem._id ? null : replyItem._id,
                                )
                              }
                              sx={{
                                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                                ml: 0.75,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              Reply
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>

                      {/* nested reply input */}
                      {isReply === replyItem._id && (
                        <Box
                          sx={{ ml: { xs: 2.5, sm: 3.5 }, mt: 0.5, mb: 0.75 }}
                        >
                          <CommentInput
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            onSend={() => replySend(post._id, replyItem._id)}
                            placeholder="Write a reply…"
                          />
                        </Box>
                      )}
                    </Box>
                  ))}

                {index < parentComments.length - 1 && (
                  <Divider sx={{ mt: 0.75 }} />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CommunityComments;
