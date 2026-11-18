import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Stack, TextField, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteOutlineIcon from "@mui/icons-material/Delete";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../Api";
import ToastConfig from "../components/ToastConfig.jsx";
import uploadImageToS3 from "../utils/s3Upload.js";   // ← same helper EditProfile uses

const C = {
  saffron: "#E8650A",
  saffronDark: "#C95406",
  ink: "#1F1A17",
  muted: "#7A7168",
  line: "#EDE5DC",
  canvas: "#FBF8F4",
  paper: "#FFFFFF",
};
const RADIUS = { card: "20px", control: "12px" };
const SERIF = "'Fraunces', 'Georgia', 'Times New Roman', serif";

/* Resolve the displayable image URL — prefer the signed URL if present. */
const resolvePostImage = (post) => {
  if (!post) return "";
  const url = post.postImageUrl;
  if (url) return Array.isArray(url) ? url[0] || "" : url;
  const raw = post.postImage;
  if (!raw) return "";
  return Array.isArray(raw) ? raw[0] || "" : raw;
};

const PostContext = createContext(null);

export const usePost = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePost must be used inside <PostProvider>");
  return ctx;
};

export function PostProvider({ children }) {
  const toasts = ToastConfig();

  const authConfig = useCallback(
    () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }),
    []
  );

  /* ─────────────── edit state ─────────────── */
  const [editOpen, setEditOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editWhen, setEditWhen] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  /* ─────────────── delete state ─────────────── */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePost, setDeletePost] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /* ─────────────── listeners ─────────────── */
  const updateListeners = useRef(new Set());
  const deleteListeners = useRef(new Set());

  const onPostUpdated = useCallback((cb) => {
    updateListeners.current.add(cb);
    return () => updateListeners.current.delete(cb);
  }, []);
  const onPostDeleted = useCallback((cb) => {
    deleteListeners.current.add(cb);
    return () => deleteListeners.current.delete(cb);
  }, []);

  const emitUpdated = (post) => updateListeners.current.forEach((cb) => { try { cb(post); } catch (e) { console.error(e); } });
  const emitDeleted = (postId) => deleteListeners.current.forEach((cb) => { try { cb(postId); } catch (e) { console.error(e); } });

  /* ─────────────── public API ─────────────── */
  const openEdit = useCallback((post) => {
    if (!post?._id) return;
    setEditPost(post);
    setEditTitle(post.title || "");
    setEditWhen(post.timeframe || "");
    setEditDesc(post.description || "");
    setEditFile(null);
    setEditPreview(resolvePostImage(post));
    setEditError("");
    setEditOpen(true);
  }, []);

  const openDelete = useCallback((post) => {
    if (!post?._id) return;
    setDeletePost(post);
    setDeleteError("");
    setDeleteOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    if (saving) return;
    setEditOpen(false);
    setTimeout(() => { setEditPost(null); setEditFile(null); setEditPreview(""); }, 200);
  }, [saving]);

  const closeDelete = useCallback(() => {
    if (deleting) return;
    setDeleteOpen(false);
    setTimeout(() => setDeletePost(null), 200);
  }, [deleting]);

  const onFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const resetEdit = () => {
    if (!editPost) return;
    setEditTitle(editPost.title || "");
    setEditWhen(editPost.timeframe || "");
    setEditDesc(editPost.description || "");
    setEditFile(null);
    setEditPreview(resolvePostImage(editPost));
    setEditError("");
  };

  /* ─────────────── SAVE — mirrors EditProfile's S3 flow ─────────────── */
  const saveEdit = async () => {
    if (!editPost?._id) return;
    setSaving(true);
    setEditError("");
    try {
      const userId = (() => {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return u?.id || u?._id || "";
        } catch { return ""; }
      })();

      // ★ Step 1: If the user picked a new image, upload it to S3 first.
      //   Same pattern as EditProfile.jsx: `uploadImageToS3(file, folder)` → { key }.
      let newImageKey = "";
      if (editFile) {
        const uploaded = await uploadImageToS3(editFile, "community-posts");
        newImageKey = uploaded?.key || "";
        if (!newImageKey) throw new Error("Image upload failed");
      }

      // ★ Step 2: Send the S3 KEY (not the file) to the backend.
      const formData = new FormData();
      if (userId) formData.append("userId", userId);
      formData.append("description", editDesc);
      if (editTitle && editTitle.trim()) formData.append("title", editTitle);
      if (editWhen && editWhen.trim()) formData.append("when", editWhen);
      if (newImageKey) formData.append("postImage", newImageKey);   // ← S3 key, not File

      const res = await axios.put(`${Api}/community/${editPost._id}`, formData, {
        ...authConfig(),
        headers: { ...authConfig().headers, "Content-Type": "multipart/form-data" },
      });

      const updated = res?.data?.data || {};

      // ★ Preserve populated authorId (defensive against a bare-doc response)
      const nextAuthorId =
        updated.authorId && typeof updated.authorId === "object"
          ? updated.authorId
          : editPost.authorId;

      const merged = {
        ...editPost,
        ...updated,
        authorId: nextAuthorId,
        description: updated.description ?? editDesc,
        title: updated.title ?? editTitle,
        timeframe: updated.timeframe ?? editWhen,
        postImage: updated.postImage ?? (newImageKey || editPost.postImage),
        postImageUrl:
          updated.postImageUrl ?? (newImageKey ? editPreview : editPost.postImageUrl),
      };

      emitUpdated(merged);
      toast.success(res?.data?.message || "Post updated", toasts);
      closeEdit();
    } catch (err) {
      setEditError(
        err?.response?.data?.message || err?.message || "Could not update post"
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletePost?._id) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const userId = (() => {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "null");
          return u?.id || u?._id || "";
        } catch { return ""; }
      })();

      const res = await axios.delete(`${Api}/community/${deletePost._id}/delete`, {
        ...authConfig(),
        data: { userId },
      });
      emitDeleted(deletePost._id);
      toast.success(res?.data?.message || "Post deleted", toasts);
      closeDelete();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || "Could not delete post");
    } finally {
      setDeleting(false);
    }
  };

  const value = useMemo(() => ({
    openEdit,
    openDelete,
    onPostUpdated,
    onPostDeleted,
    editOpen,
    editPost,
    deleteOpen,
    deletePost,
  }), [openEdit, openDelete, onPostUpdated, onPostDeleted, editOpen, editPost, deleteOpen, deletePost]);

  return (
    <PostContext.Provider value={value}>
      {children}

      {/* ─── Shared Edit Dialog ─── */}
      <Dialog
        open={editOpen}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        disableRestoreFocus
        onClose={(e, reason) => { if (reason !== "backdropClick") closeEdit(); }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: RADIUS.card },
            m: { xs: 0, sm: 2 },
            width: { xs: "100%", sm: "calc(100% - 32px)" },
            maxWidth: { xs: "100%", sm: 600 },
            height: { xs: "100dvh", sm: "auto" },
            maxHeight: { xs: "100dvh", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: SERIF, fontWeight: 600, py: 1.5, px: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.15rem" },
          }}
        >
          Edit post
          <IconButton size="small" onClick={closeEdit} disabled={saving} sx={{ p: 0.75 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          {editError && <Alert severity="error" sx={{ mb: 1.5, borderRadius: RADIUS.control }}>{editError}</Alert>}

          {editPost?.title && (
            <TextField
              fullWidth size="small" margin="dense" label="Title"
              value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={{ mb: 1 }}
            />
          )}
          {editPost?.timeframe && (
            <TextField
              fullWidth size="small" margin="dense" label="When"
              value={editWhen} onChange={(e) => setEditWhen(e.target.value)} sx={{ mb: 1 }}
            />
          )}
          <TextField
            fullWidth multiline minRows={3} size="small" margin="dense"
            label={editPost?.title ? "Details" : "Description"}
            value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
          />

          {editPreview && (
            <Box
              component="img"
              src={editPreview}
              alt="Post preview"
              sx={{ width: "100%", maxHeight: 260, objectFit: "contain", mt: 2, borderRadius: RADIUS.control, bgcolor: C.canvas }}
            />
          )}
          <Button
            component="label"
            variant="outlined"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            sx={{ mt: 1.5, textTransform: "none", borderRadius: "999px", color: C.ink, borderColor: C.line }}
          >
            {editPreview ? "Change image" : "Add image"}
            <input hidden type="file" accept="image/*" onChange={onFileChange} />
          </Button>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button onClick={resetEdit} disabled={saving} sx={{ textTransform: "none", color: "#666" }}>
            Reset
          </Button>
          <Button
            variant="contained"
            disabled={saving || (!editDesc.trim() && !editTitle.trim())}
            onClick={saveEdit}
            sx={{
              textTransform: "none", bgcolor: C.saffron, fontWeight: 600,
              "&:hover": { bgcolor: C.saffronDark },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Shared Delete Dialog ─── */}
      <Dialog
        open={deleteOpen}
        fullWidth
        maxWidth="xs"
        onClose={(e, reason) => { if (reason !== "backdropClick") closeDelete(); }}
        PaperProps={{ sx: { m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "100%" }, borderRadius: RADIUS.card } }}
      >
        <DialogTitle
          sx={{
            display: "flex", alignItems: "center", gap: 1, fontWeight: 600,
            fontSize: { xs: "1.05rem", sm: "1.2rem" }, px: { xs: 2, sm: 3 },
          }}
        >
          <WarningAmberRoundedIcon color="error" /> Delete post?
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          {deleteError && <Alert severity="error" sx={{ mb: 1.5 }}>{deleteError}</Alert>}
          <Typography color="text.secondary" sx={{ fontSize: { xs: "0.88rem", sm: "1rem" } }}>
            Are you sure you want to delete this post? This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, gap: 1 }}>
          <Button onClick={closeDelete} disabled={deleting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={confirmDelete}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </PostContext.Provider>
  );
}