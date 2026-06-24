import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Stack, Divider, TextField, Button, CircularProgress } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import Api from "../Api";
import axios from "axios";
import moment from "moment/moment";

const dummyComments = [
  {
    name: "Rahul Sharma",
    comment: "Very nice post brother 🙌",
    time: "2 min ago",
  },
  {
    name: "Deepa Iyer",
    comment: "This is really helpful for our community.",
    time: "10 min ago",
  },
  {
    name: "Vijay Patel",
    comment: "Great update! Keep sharing.",
    time: "1 hour ago",
  },
];

const CommunityComments = ({ post, user }) => {

  const [comment, setComment] = useState('')
  const [commentsFetched, setCommentsFetched] = useState([])
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState('')
  const [isReply, setIsReply] = useState(null)
  const [visibleReplies, setVisibleReplies] = useState({});


  useEffect(() => {
    getComments();
  }, [post])

  const sendComment = async (postId) => {
    try {
      const res = await axios.post(Api + `/community/comments/${postId}/${user.id}`, { comment })
      setComment("")
      getComments()
    } catch (error) {
      console.log(error.message)
    }
  }

  const getComments = async () => {
    try {
      setLoading(true)
      const res = await axios.get(Api + `/community/comments/${post?._id}`)
      setCommentsFetched(res.data.data.comments)
    } catch (error) {
      console.log(error.message)
    } finally {
      setLoading(false)
    }
  }

  const replySend = async (postId, parentId) => {
    try {
      const res = await axios.post(Api + `/community/comments/${postId}/reply/${parentId}/${user.id}`, { comment: reply })
      setReply('')
      getComments();
    } catch (error) {
      console.log(res)
    }
  }

  const toggleReplies = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const likeComment = async (commentId) => {
    try {
      const res = await axios.post(
        Api + `/community/likes/comment/${commentId}/${user.id}`
      );

      setCommentsFetched((prev) =>
        prev.map((item) =>
          item._id === commentId
            ? {
              ...item,
              likes: res.data.likes,
              likedByCurrentUser: res.data.liked,
            }
            : item
        )
      );
    } catch (error) {
      console.log(error.message);
    }
  };


  const parentComments = commentsFetched.filter(
    (c) => c.parentCommentId === null
  );

  const getReplies = (parentId) =>
    commentsFetched.filter((c) => c.parentCommentId === parentId);


  return (
    <Box>
      <Box>
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Make a comment"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  margin: 1,
                  alignItems: "center",
                },
              }}
            />
            <Button onClick={() => { sendComment(post._id) }}>
              <SendIcon />
            </Button>
          </Box>
        </Box>

        Comments ({commentsFetched.length})
      </Box>

      {loading ?
        <>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={50} />
          </Box>
        </>
        :
        <Box sx={{ mt: 1 }}>
          {parentComments.map((item, index) => {
            const replies = getReplies(item._id);

            return (
              <Box key={item._id}>
                <Stack direction="row" spacing={1.5} sx={{ py: 1.2 }}>
                  <Avatar sx={{ width: 34, height: 34 }} />

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        bgcolor: "#F7F7F7",
                        borderRadius: 3,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography fontWeight={700} fontSize="0.85rem">
                        {item.userId.firstName} {item.userId.lastName}
                      </Typography>

                      <Typography fontSize="0.9rem">
                        {item.comment}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {moment(item.createdAt).fromNow()}
                    </Typography>

                    <Typography
                      variant="caption"
                      color={item.likedByCurrentUser ? "primary" : "text.secondary"}
                      sx={{ ml: 1, cursor: "pointer" }}
                      onClick={() => likeComment(item._id)}
                    >
                      · {item.likedByCurrentUser ? "Liked" : "Like"}{" "}
                      {item.likes > 0 ? `(${item.likes})` : ""} ·
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1, cursor: "pointer" }}
                      onClick={() =>
                        setIsReply((pre) => (pre === item._id ? null : item._id))
                      }
                    >
                      Reply
                    </Typography>
                  </Box>
                </Stack>

                {isReply === item._id && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 6, mb: 1 }}>
                    <TextField
                      size="small"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply..."
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 5,
                          fontSize: "0.85rem",
                        },
                      }}
                    />

                    <Button size="small" onClick={() => replySend(post._id, item._id)}>
                      <SendIcon fontSize="small" />
                    </Button>
                  </Box>
                )}


                {replies.length > 0 && (
                  <Typography
                    variant="caption"
                    color="#0085e4ff"
                    sx={{ ml: 6, cursor: "pointer", fontWeight: 600 }}
                    onClick={() => toggleReplies(item._id)}
                  >
                    {visibleReplies[item._id]
                      ? "Hide replies"
                      : `View ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                  </Typography>
                )}

                {visibleReplies[item._id] &&
                  replies.map((replyItem) => (
                    <Box key={replyItem._id} sx={{ ml: 6, mt: 1 }}>
                      <Stack direction="row" spacing={1}>
                        <Avatar sx={{ width: 26, height: 26 }} />

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ bgcolor: "#F7F7F7", borderRadius: 3, px: 1.3, py: 0.8 }}>
                            <Typography fontWeight={700} fontSize="0.8rem">
                              {replyItem.userId.firstName} {replyItem.userId.lastName}
                            </Typography>

                            <Typography fontSize="0.85rem">
                              {replyItem.comment}
                            </Typography>
                          </Box>

                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {moment(replyItem.createdAt).fromNow()}
                          </Typography>

                          <Typography
                            variant="caption"
                            color={replyItem.likedByCurrentUser ? "primary" : "text.secondary"}
                            sx={{ ml: 1, cursor: "pointer" }}
                            onClick={() => likeComment(replyItem._id)}
                          >
                            · {replyItem.likedByCurrentUser ? "Liked" : "Like"}{" "}
                            {replyItem.likes > 0 ? `(${replyItem.likes})` : ""} ·
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1, cursor: "pointer" }}
                            onClick={() =>
                              setIsReply((pre) => (pre === replyItem._id ? null : replyItem._id))
                            }
                          >
                            Reply
                          </Typography>
                        </Box>
                      </Stack>
                      {isReply === replyItem._id && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 5, mb: 1 }}>
                          <TextField
                            size="small"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Write a reply..."
                            sx={{
                              flex: 1,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 5,
                                fontSize: "0.85rem",
                              },
                            }}
                          />

                          <Button
                            size="small"
                            onClick={() => replySend(post._id, replyItem._id)}
                          >
                            <SendIcon fontSize="small" />
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))
                }
                {index < parentComments.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            );
          })}
        </Box>
      }
    </Box>
  );
};

export default CommunityComments;