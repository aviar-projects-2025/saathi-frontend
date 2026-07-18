import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Api from "../Api";
import axios from "axios";
import moment from "moment/moment";
import UserAvatar from "../components/UserAvatar";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import { toast } from "react-toastify"; // remove if you use a different toast lib



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

/* ── inline edit box for a comment/reply, also defined OUTSIDE ── */
const EditCommentInput = ({ value, onChange, onSave, onCancel }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    <TextField
      fullWidth
      multiline
      minRows={1}
      maxRows={4}
      size="small"
      autoFocus
      value={value}
      onChange={onChange}
      variant="outlined"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2.5,
          fontSize: { xs: "0.72rem", sm: "0.78rem", md: "0.82rem" },
        },
      }}
    />
    <IconButton size="small" color="primary" onClick={onSave}>
      <CheckIcon sx={{ fontSize: "1rem" }} />
    </IconButton>
    <IconButton size="small" onClick={onCancel}>
      <CloseIcon sx={{ fontSize: "1rem" }} />
    </IconButton>
  </Box>
);

const CommunityComments = ({ post, user }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [comment, setComment] = useState("");
  const theme = useTheme();
  const [commentsFetched, setCommentsFetched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [isReply, setIsReply] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState({});
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const showSidebar = useMediaQuery(theme.breakpoints.up('sm'));

  const avatarSize = isMobile ? 30 : 35;
  const iconFontSize = isMobile ? 'small' : 'medium';
  const btnFontSize = isMobile ? '0.5rem' : '0.7rem';
  const bodyFontSize = isMobile ? '0.7rem' : '0.8rem';
  const captionSize = isMobile ? '0.6rem' : '0.6rem';
  const avatarFontSize = isMobile ? '0.6rem' : '1.1rem';
  // three-dot menu state: which comment's menu is open + its anchor element
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuComment, setMenuComment] = useState(null);

  // inline editing state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  // delete confirmation modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getComments();
  }, [post]);


  const getComments = async () => {
    try {
      // setLoading(true);
      const res = await axios.get(Api + `/community/comments/${post?._id}`);

      setCommentsFetched(res.data.data.comments);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async (postId) => {
    try {
      await axios.post(Api + `/community/comments/${postId}/${user.id}`, { comment });
      setComment("");
      getComments();
    } catch (error) {
      console.log(error.message);
    }
  };

  const replySend = async (postId, parentId) => {
    try {
      await axios.post(
        Api + `/community/comments/${postId}/reply/${parentId}/${user.id}`,
        { reply }
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
        Api + `/community/likes/comment/${commentId}/${user.id}`
      );
      setCommentsFetched((prev) =>
        prev.map((item) =>
          item._id === commentId
            ? { ...item, likes: res.data.likes, likedByCurrentUser: res.data.liked }
            : item
        )
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  /* ── three-dot menu handlers ── */
  const handleMenuOpen = (event, commentItem) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuComment(commentItem);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuComment(null);
  };

  /* ── edit handlers ── */
  const handleEditClick = () => {
    if (!menuComment) return;
    setEditingCommentId(menuComment._id);
    setEditText(menuComment.comment);
    handleMenuClose();
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleEditSave = async (commentId) => {
    try {
      await axios.patch(
        `${Api}/community/comments/${commentId}/${user.id}`,
        {
          comment: editText,
        }
      );

      toast.success("Comment Updated", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });

      setEditingCommentId(null);
      setEditText("");
      getComments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update comment", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });
    }
  };

  /* ── delete handlers ── */
  const handleDeleteClick = () => {
    setCommentToDelete(menuComment);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCommentToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    try {
      const res = await axios.delete(
        `${Api}/community/comments/${commentToDelete._id}/${user.id}`
      );
      toast.success("Comment deleted", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });
      getComments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete comment", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const parentComments = commentsFetched.filter((c) => c.parentCommentId === null);
  const getReplies = (parentId) =>
    commentsFetched.filter((c) => c.parentCommentId === parentId);

  /* ── reusable renderer for a comment/reply bubble, with menu + edit ── */
  const renderCommentBody = (item, isChild = false) => {
    const isOwner = item.userId?._id === user.id;
    const isEditing = editingCommentId === item._id;

    return (
      <Box
        sx={{
          bgcolor: "#F7F7F7",
          borderRadius: 2.5,
          px: { xs: isChild ? 0.9 : 1, sm: isChild ? 1.1 : 1.25 },
          py: { xs: isChild ? 0.4 : 0.5, sm: isChild ? 0.6 : 0.75 },
          position: "relative",
        }}
      >
        {isEditing ? (
          <EditCommentInput
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onSave={() => handleEditSave(item._id)}
            onCancel={handleEditCancel}
          />
        ) : (
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={700}
                noWrap
                sx={{ fontSize: { xs: isChild ? "0.65rem" : "0.7rem", sm: isChild ? "0.7rem" : "0.75rem", md: isChild ? "0.75rem" : "0.8rem" } }}
              >
                {item.userId?.firstName} {item.userId?.lastName}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: isChild ? "0.68rem" : "0.72rem", sm: isChild ? "0.74rem" : "0.78rem", md: isChild ? "0.78rem" : "0.82rem" },
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                }}
              >
                {item.comment}
              </Typography>
            </Box>

            {isOwner && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, item)}
                sx={{ p: 0.25, ml: 0.5, flexShrink: 0 }}
              >
                <MoreVertIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            )}
          </Stack>
        )}
      </Box>
    );
  };

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
            const CommentUserId = parentComments.map((item) => item.userId)

            return (
              <Box key={item._id}>
                {/* parent comment */}
                <Stack direction="row" spacing={{ xs: 0.75, sm: 1 }} sx={{ py: 0.75 }}>
                  <Avatar
                    src={item.userId?.profileImage}
                    sx={{
                      width: avatarSize,
                      height: avatarSize,
                      bgcolor: SAFFRON,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: avatarFontSize,
                      flexShrink: 0,
                      mt: { xs: 0.4, sm: 0.5 }
                    }}
                  >

                    {!currentUser?.profileImage &&
                      `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {renderCommentBody(item, false)}

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
                        color={item.likedByCurrentUser ? "primary" : "text.secondary"}
                        onClick={() => likeComment(item._id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          fontSize: { xs: "0.62rem", sm: "0.65rem" },
                          ml: 0.75,
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        {item.likedByCurrentUser ? (
                          <ThumbUpAltIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />
                        )}
                        {item.likes > 0 ? `${item.likes}` : ""}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        onClick={() =>
                          setIsReply((pre) => (pre === item._id ? null : item._id))
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
                          {renderCommentBody(replyItem, true)}

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
                              sx={{ fontSize: { xs: "0.58rem", sm: "0.62rem" } }}
                            >
                              {moment(replyItem.createdAt).fromNow()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={replyItem.likedByCurrentUser ? "primary" : "text.secondary"}
                              onClick={() => likeComment(replyItem._id)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.4,
                                fontSize: { xs: "0.58rem", sm: "0.62rem" },
                                ml: 0.75,
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              {replyItem.likedByCurrentUser ? (
                                <ThumbUpAltIcon sx={{ fontSize: 13 }} />
                              ) : (
                                <ThumbUpAltOutlinedIcon sx={{ fontSize: 13 }} />
                              )}
                              {replyItem.likes > 0 ? `${replyItem.likes}` : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Box>
                  ))}

                {index < parentComments.length - 1 && <Divider sx={{ mt: 0.75 }} />}
              </Box>
            );
          })}
        </Box>
      )}

      {/* three-dot menu (shared across all comments/replies) */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* delete confirmation modal */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete comment?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove the comment. This action can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" onClick={() => handleDeleteConfirm(comment._id)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityComments;