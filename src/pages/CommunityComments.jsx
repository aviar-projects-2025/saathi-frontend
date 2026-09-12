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
import ToastConfig from "../components/ToastConfig";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ProfileModal from './Avatar'

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
const EditCommentInput = ({ value, onChange, onSave, onCancel, load }) => (
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
      {load ? (
        <CircularProgress size={16} thickness={5} />
      ) : (
        <CheckIcon sx={{ fontSize: "1rem" }} />
      )}
    </IconButton>
    <IconButton size="small" onClick={onCancel}>
      <CloseIcon sx={{ fontSize: "1rem" }} />
    </IconButton>
  </Box>
);

const CommunityComments = ({ post, user, onCommentsChanged }) => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [comment, setComment] = useState("");
  const theme = useTheme();
  const [commentsFetched, setCommentsFetched] = useState([]);

  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [isReply, setIsReply] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState({});
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const SAFFRON = "#E8650A";
  const CARD_BORDER = "1px solid #F0E6DC";

  const toasts = ToastConfig();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const showSidebar = useMediaQuery(theme.breakpoints.up("sm"));

  const avatarSize = isMobile ? 30 : 35;
  const iconFontSize = isMobile ? "small" : "medium";
  const btnFontSize = isMobile ? "0.5rem" : "0.7rem";
  const bodyFontSize = isMobile ? "0.7rem" : "0.8rem";
  const captionSize = isMobile ? "0.6rem" : "0.6rem";
  const avatarFontSize = isMobile ? "0.6rem" : "1.1rem";
  // three-dot menu state: which comment's menu is open + its anchor element
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuComment, setMenuComment] = useState(null);

  // inline editing state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);

  // const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    getComments();
  }, [post]);

  const getComments = async () => {
    try {
      //  setLoading(true);
      const res = await axios.get(Api + `/community/comments/${post?._id}/${user.id}`);
      const list = res.data.data.comments;


      setCommentsFetched(res.data.data.comments);

      onCommentsChanged?.(list.length);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const replySend = async (postId, parentId) => {
    if (!reply.trim()) return;
    try {
      await axios.post(
        Api + `/community/comments/${postId}/reply/${parentId}/${user.id}`,
        { reply },
      );
      setReply("");
      setIsReply(null);
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
        `${Api}/community/likes/comment/${commentId}/${user.id}`
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

      setCommentsLoading(true);

      await axios.patch(`${Api}/community/comments/${commentId}/${user.id}`, {
        comment: editText,
      });

      toast.success("Comment Updated", toasts);

      setEditingCommentId(null);
      setEditText("");
      getComments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update comment",
        toasts,
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!menuComment) return;

    try {
      setDeleteLoading(true);

      await axios.delete(
        `${Api}/community/comments/${menuComment._id}/${user.id}`
      );

      toast.success("Comment deleted", toasts);

      handleMenuClose();
      setReply("");
      setIsReply(null);
      await getComments();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete comment",
        toasts
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const parentComments = commentsFetched.filter(
    (c) => c.parentCommentId === null,
  );
  const getReplies = (parentId, replyItem) =>
    commentsFetched.filter((c) => c.parentCommentId === parentId && c.parentCommentId !== replyItem?._id);



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
            load={commentsLoading}
          />
        ) : (
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={700}
                noWrap
                sx={{
                  fontSize: {
                    xs: isChild ? "0.65rem" : "0.7rem",
                    sm: isChild ? "0.7rem" : "0.75rem",
                    md: isChild ? "0.75rem" : "0.8rem",
                  },
                }}
              >
                {item.userId?.firstName} {item.userId?.lastName}
              </Typography>
              <Typography
                sx={{
                  fontSize: {
                    xs: isChild ? "0.68rem" : "0.72rem",
                    sm: isChild ? "0.74rem" : "0.78rem",
                    md: isChild ? "0.78rem" : "0.82rem",
                  },
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
        {commentsFetched.length > 0 && (
          <>Comments ({commentsFetched.length})</>
        )}


      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            mt: 0.75,
            maxHeight: { xs: 280, sm: 320, md: 360 }, // ≈ height of ~5 comments
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5, // avoid content hiding under scrollbar
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#E0D4C8",
              borderRadius: 4,
            },
            scrollbarWidth: "thin",
            scrollbarColor: "#E0D4C8 transparent",
          }}
        >
          {parentComments.map((item, index) => {
            const replies = getReplies(item._id);
            const CommentUserId = parentComments.map((item) => item.userId);

            return (
              <Box key={item._id}>
                {/* parent comment */}
                <Stack
                  direction="row"
                  spacing={{ xs: 0.75, sm: 1 }}
                  sx={{ py: 0.75 }}
                >
                  <Avatar
                    src={item.userId?.profileImage}
                    onClick={() => {
                      setSelectedProfile(item.userId);
                      setProfileModalOpen(true);
                    }}
                    sx={{
                      width: avatarSize,
                      height: avatarSize,
                      bgcolor: SAFFRON,
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: avatarFontSize,
                      flexShrink: 0,
                      mt: { xs: 0.4, sm: 0.5 },
                    }}
                  >
                    {!currentUser?.profileImage &&
                      `${currentUser?.firstName?.[0] || ""}${currentUser?.lastName?.[0] || ""}`}
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
                        color={
                          item.likedByCurrentUser ? "primary" : "text.secondary"
                        }
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
                          src={replyItem?.userId?.profileImage}
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
                                <ThumbUpAltIcon sx={{ fontSize: 14 }} />
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

                {index < parentComments.length - 1 && (
                  <Divider sx={{ mt: 0.75 }} />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <ProfileModal
        open={profileModalOpen}
        selectedProfile={selectedProfile}
        onClose={() => {
          setProfileModalOpen(false);
        }}
      />

      {/* three-dot menu (shared across all comments/replies) */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }} disabled={deleteLoading}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {deleteLoading ? "Deleting..." : "Delete"}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommunityComments;
