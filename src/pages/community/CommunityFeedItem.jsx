import React, { useEffect, useMemo, useState } from "react";
import {
    Paper, Typography, Chip, Stack, Divider, Button, Box, IconButton, Avatar,
    Menu, MenuItem, ListItemIcon, ListItemText,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatIcon from "@mui/icons-material/Chat";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import Api from "../../Api.jsx";
import CommunityComments from "../CommunityComments.jsx";
import CommunityImage from "../../components/CommunityImage.jsx";
import ImagePicker from "./ImagePicker.jsx";
import { getRoom } from "./rooms.js";

const SAFFRON = "#E8650A";
const RUST = "#B33A00";

/* Card padding is reused so the image can bleed edge-to-edge on mobile */
const CARD_PX = { xs: 1.5, sm: 2, md: 2.5 };

const formatTimeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    if (mins < 10080) return `${Math.floor(mins / 1440)}d`;
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const isHttp = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

// Uses the signed URL the API returns (profileImageUrl); falls back to initials if missing / broken.
const AuthorAvatar = ({ author, onClick }) => {
    const [broken, setBroken] = useState(false);
    const src = author?.profileImageUrl || (isHttp(author?.profileImage) ? author.profileImage : "");
    const initials = `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`.toUpperCase();

    useEffect(() => { setBroken(false); }, [src]);

    return (
        <Avatar
            src={!broken && src ? src : undefined}
            alt={`${author?.firstName || ""} ${author?.lastName || ""}`}
            onClick={onClick}
            imgProps={{ onError: () => setBroken(true), referrerPolicy: "no-referrer" }}
            sx={{
                width: { xs: 36, sm: 40, md: 44 },
                height: { xs: 36, sm: 40, md: 44 },
                bgcolor: SAFFRON,
                color: "#fff",
                fontWeight: 800,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
                cursor: "pointer",
                flexShrink: 0,
            }}
        >
            {initials}
        </Avatar>
    );
};

export default function CommunityFeedItem({
    post,
    currentUser,
    isPostSaved,
    onToggleLike,
    onToggleSave,
    onUserClick,
    onMessage,
    onDeletePost,
    onUpdatePost,
}) {
    const author = post?.authorId;
    const isOffering = post.postType === "offering";
    const isAuthor = !!author?._id && author._id === currentUser?._id;
    const saved = isPostSaved(post._id);
    const room = getRoom(post.room);

    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const [expanded, setExpanded] = useState(false);

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editWhen, setEditWhen] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // CommunityComments expects the localStorage-style user ({ id, ... }); give it both shapes.
    const commentUser = useMemo(() => {
        let stored = null;
        try { stored = JSON.parse(localStorage.getItem("user")); } catch { /* ignore */ }
        return { ...(stored || {}), ...(currentUser || {}), id: stored?.id || currentUser?._id };
    }, [currentUser]);

    // Real comment count (same endpoint the old page used)
    useEffect(() => {
        if (!commentUser.id) return;
        let cancelled = false;
        axios
            .get(`${Api}/community/comments/${post._id}/${commentUser.id}`)
            .then((res) => {
                if (!cancelled) setCommentCount(res.data?.data?.comments?.length ?? 0);
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [post._id, commentUser.id]);

    const hasTitle = !!post.title;
    const hasWhen = !!post.timeframe;
    const body = post.description || "";
    const isLong = body.length > 120;

    /* ── edit / delete ── */
    const openEdit = () => {
        setMenuAnchor(null);
        setEditTitle(post.title || "");
        setEditWhen(post.timeframe || "")
        setEditDesc(post.description || "");
        setEditImage(null);
        setEditOpen(true);
    };

    const resetEdit = () => {
        setEditTitle(post.title || "");
        setEditWhen(post.timeframe || "")
        setEditDesc(post.description || "");
        setEditImage(null);
    };

    const handleSave = async () => {
        setUpdating(true);
        console.log(editWhen,'editWhen')
        const ok = await onUpdatePost(post._id, {
            title: hasTitle ? editTitle.trim() : undefined,
            when: hasWhen ? editWhen.trim() : undefined,
            description: editDesc,
            imageFile: editImage,
        });
        setUpdating(false);
        if (ok) setEditOpen(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        const ok = await onDeletePost(post._id);
        setDeleting(false);
        if (ok) setDeleteOpen(false);
    };

    const openProfile = () => onUserClick(author);

    return (
        <>
            <Paper
                sx={{
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    px: CARD_PX,
                    mb: { xs: 1.5, sm: 2, md: 2.5 },
                    borderRadius: { xs: 2.5, sm: 3, md: 4 },
                    border: "1px solid #EFE7DF",
                    boxShadow: "0 1px 2px rgba(60,30,10,0.04)",
                }}
            >
                {/* Header: author on top, like a social post */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={{ xs: 1.25, sm: 1.75, md: 2 }}
                    sx={{ width: "100%" }}
                >
                    <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 1.25, md: 1.5 }}
                        alignItems="center"
                        sx={{ minWidth: 0, flex: 1 }}
                    >
                        <AuthorAvatar author={author} onClick={openProfile} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                fontWeight={700}
                                lineHeight={1.25}
                                noWrap
                                onClick={openProfile}
                                sx={{
                                    fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                {author?.firstName} {author?.lastName}
                            </Typography>
                            <Typography
                                component="div"
                                sx={{
                                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.78rem" },
                                    color: "text.secondary",
                                    lineHeight: 1.5,
                                    mt: 0.25,
                                }}
                                noWrap
                            >
                                {formatTimeAgo(post.createdAt)}
                                <Box component="span" sx={{ mx: { xs: 0.5, sm: 0.75 }, opacity: 0.5 }}>•</Box>
                                <Box component="span" sx={{ color: RUST, fontWeight: 600 }}>{room.label}</Box>
                                <Box component="span" sx={{ mx: { xs: 0.5, sm: 0.75 }, opacity: 0.5 }}>•</Box>
                                <Box component="span" sx={{ textTransform: "capitalize" }}>{post.postType?.replace("_", " ")}</Box>
                            </Typography>
                        </Box>
                    </Stack>

                    {isAuthor && (
                        <Box sx={{ flexShrink: 0, ml: { xs: 0.5, sm: 1 }, mr: { xs: -0.5, sm: 0 } }}>
                            <IconButton
                                size="small"
                                onClick={(e) => setMenuAnchor(e.currentTarget)}
                                sx={{ p: { xs: 0.5, sm: 0.75 } }}
                            >
                                <MoreHorizIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                            </IconButton>
                        </Box>
                    )}
                </Stack>

                {/* Content: bold title only when the post has a real title; otherwise plain body text */}
                {hasTitle ? (
                    <Typography
                        fontWeight={700}
                        lineHeight={1.35}
                        mb={body && !isOffering ? 0.75 : { xs: 1, sm: 1.5 }}
                        sx={{ fontSize: { xs: "0.98rem", sm: "1.05rem", md: "1.1rem" }, wordBreak: "break-word", m: { xs: 0.25, sm: 0.5 } }}
                    >
                        {post.title}
                    </Typography>
                ) : (
                    <Typography
                        sx={{
                            fontSize: { xs: "0.92rem", sm: "0.97rem", md: "1rem" },
                            lineHeight: 1.65,
                            mb: { xs: 1, sm: 1.5 },
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {post.description}
                    </Typography>
                )}

                {hasTitle && body && !isOffering && (
                    <Box mb={{ xs: 1, sm: 1.5 }}>
                        <Typography
                            sx={{
                                fontSize: { xs: "0.86rem", sm: "0.92rem", md: "0.95rem" },
                                lineHeight: 1.65,
                                color: "#444",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: expanded ? "unset" : 3,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            {body}
                        </Typography>
                        {isLong && (
                            <Button
                                size="small"
                                onClick={() => setExpanded((v) => !v)}
                                sx={{
                                    p: 0, mt: 0.25, minWidth: "auto", textTransform: "none",
                                    fontSize: { xs: "0.75rem", sm: "0.8rem" }, fontWeight: 600, color: SAFFRON,
                                }}
                            >
                                {expanded ? "See less" : "See more"}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Tags */}
                {(post.subCategory || post.timeframe || post.zipcode || post.tags?.length > 0) && (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: { xs: 1, sm: 1.75 } }}>
                        {[post.subCategory, post.timeframe, post.zipcode, ...(post.tags || [])].filter(Boolean).map((t) => (
                            <Chip
                                key={t}
                                label={t}
                                size="small"
                                sx={{
                                    bgcolor: "#FAF5F0", color: "#6B5B4E",
                                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                                    fontWeight: 500,
                                    height: { xs: 22, sm: 24 },
                                    maxWidth: "100%",
                                    border: "1px solid #F0E6DC",
                                    "& .MuiChip-label": { px: { xs: 0.9, sm: 1.1 } },
                                }}
                            />
                        ))}
                    </Stack>
                )}

                {/* Image: full width — edge-to-edge on mobile, rounded inside the card on larger screens */}
                {post.postImage && (
                    <Box
                        sx={{
                            mb: { xs: 1.25, sm: 1.75 },
                            mx: { xs: -1.5, sm: 0 },
                            width: { xs: "calc(100% + 24px)", sm: "100%" },
                            maxWidth: { xs: "none", sm: "100%" },
                            borderRadius: { xs: 0, sm: 2.5, md: 3 },
                            overflow: "hidden",
                            border: { xs: "none", sm: "1px solid #EFE7DF" },
                            borderTop: { xs: "1px solid #EFE7DF" },
                            borderBottom: { xs: "1px solid #EFE7DF" },
                            "& img, & video": {
                                display: "block",
                                width: "100%",
                                maxWidth: "100%",
                                height: "auto",
                                objectFit: "cover",
                            },
                        }}
                    >
                        <CommunityImage src={post.postImage} postImageUrl={post.postImageUrl} />
                    </Box>
                )}

                {/* Offering layout vs standard author row */}
                {isOffering && (
                    <Box sx={{ bgcolor: "#F9F9F9", p: { xs: 1.5, sm: 2 }, borderRadius: 2, mb: { xs: 1.5, sm: 2 } }}>
                        {hasTitle && body && (
                            <Typography
                                color="text.secondary"
                                mb={{ xs: 1.5, sm: 2 }}
                                sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem" }, wordBreak: "break-word" }}
                            >
                                {body}
                            </Typography>
                        )}
                        <Stack
                            direction="row"
                            spacing={{ xs: 1.5, sm: 2 }}
                            alignItems="center"
                            sx={{ mt: { xs: 1, sm: 1.5 } }}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <StarIcon sx={{ fontSize: { xs: 15, sm: 16 }, color: "#FFB300" }} />
                                <Typography fontWeight={700} sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" } }}>
                                    {post.providerDetails?.rating || "New"}
                                </Typography>
                                <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }} color="text.secondary">
                                    ({post.providerDetails?.reviewCount || 0} jobs)
                                </Typography>
                            </Stack>
                            <Typography fontWeight={700} sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" } }}>
                                {post.providerDetails?.price || "Contact for price"}
                            </Typography>
                            {post.providerDetails?.isInsured && (
                                <Typography sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" } }} color="#2E7D32" fontWeight={600}>
                                    {/* Insured */}
                                    ✓ Insured
                                </Typography>
                            )}
                        </Stack>
                        {!isAuthor && (
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => onMessage?.(author)}
                                sx={{
                                    textTransform: "none", borderColor: RUST, color: RUST, fontWeight: 600, borderRadius: 2,
                                    py: { xs: 0.6, sm: 0.8 },
                                    fontSize: { xs: "0.82rem", sm: "0.9rem" },
                                }}
                            >
                                Message {author?.firstName}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Actions */}
                <Divider sx={{ borderColor: "#F3ECE5" }} />
                <Stack direction="row" sx={{ pt: 0.5, mx: { xs: -0.75, sm: -0.5 } }}>
                    {[
                        {
                            key: "like",
                            active: post.isLiked,
                            onClick: () => onToggleLike(post._id, post.isLiked),
                            icon: post.isLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />,
                            label: `${post.likes || 0} Useful`,
                        },
                        {
                            key: "answer",
                            active: showComments,
                            onClick: () => setShowComments((v) => !v),
                            icon: <ChatIcon />,
                            label: `Answer${commentCount > 0 ? ` (${commentCount})` : ""}`,
                        },
                        {
                            key: "save",
                            active: saved,
                            onClick: () => onToggleSave(post),
                            icon: saved ? <BookmarkIcon /> : <BookmarkBorderIcon />,
                            label: saved ? "Saved" : "Save",
                        },
                    ].map((a) => (
                        <Button
                            key={a.key}
                            onClick={a.onClick}
                            startIcon={a.icon}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                py: { xs: 0.75, sm: 1 },
                                px: { xs: 0.5, sm: 1 },
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.875rem" },
                                whiteSpace: "nowrap",
                                color: a.active ? SAFFRON : "text.secondary",
                                "&:hover": { bgcolor: "#FFF5EC" },
                                "& .MuiButton-startIcon": {
                                    mr: { xs: 0.4, sm: 0.75, md: 1 },
                                    ml: 0,
                                    "& > *:nth-of-type(1)": { fontSize: { xs: 17, sm: 19, md: 20 } },
                                },
                            }}
                        >
                            {a.label}
                        </Button>
                    ))}
                </Stack>

                {/* Comments */}
                {showComments && (
                    <Box sx={{ mt: { xs: 1, sm: 1.5 }, pt: { xs: 1.5, sm: 2 }, borderTop: "1px solid #F3ECE5", minWidth: 0 }}>
                        <CommunityComments post={post} user={commentUser} onCommentsChanged={setCommentCount} />
                    </Box>
                )}
            </Paper >

            {/* Edit / Delete menu */}
            < Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)
            }>
                <MenuItem onClick={openEdit} sx={{ fontSize: { xs: "0.88rem", sm: "1rem" } }}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ sx: { fontSize: "inherit" } }}>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => { setMenuAnchor(null); setDeleteOpen(true); }}
                    sx={{ fontSize: { xs: "0.88rem", sm: "1rem" } }}
                >
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText primaryTypographyProps={{ sx: { fontSize: "inherit" } }}>Delete</ListItemText>
                </MenuItem>
            </Menu >

            {/* Edit dialog */}
            < Dialog
                open={editOpen}
                fullWidth
                maxWidth="sm"
                scroll="paper"
                disableRestoreFocus
                onClose={(e, reason) => { if (reason !== "backdropClick") setEditOpen(false); }}
                PaperProps={{
                    sx: {
                        borderRadius: { xs: 0, sm: 3 },
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
                        fontWeight: 600, py: 1.5, px: { xs: 1.5, sm: 2 },
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                    }}
                >
                    Edit post
                    <IconButton size="small" onClick={() => setEditOpen(false)} sx={{ p: { xs: 0.75, sm: 0.5 } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
                    {hasTitle && (
                        <TextField
                            fullWidth size="small" margin="dense" label="Title"
                            value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={{ mb: 1 }}
                        />
                    )}
                    {hasWhen && (
                        <TextField
                            fullWidth size="small" margin="dense" label="When"
                            value={editWhen} onChange={(e) => setEditWhen(e.target.value)} sx={{ mb: 1 }}
                        />
                    )}
                    <TextField
                        fullWidth multiline minRows={3} size="small" margin="dense"
                        label={hasTitle ? "Details" : "Description"}
                        value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <Box
                        sx={{
                            mt: 2,
                            width: "100%",
                            "& img": { maxWidth: "100%", height: "auto" },
                        }}
                    >
                        <ImagePicker
                            file={editImage}
                            onChange={setEditImage}
                            existingUrl={post.postImageUrl || post.postImage || ""}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: 1 }}>
                    <Button
                        onClick={resetEdit}
                        sx={{ textTransform: "none", color: "#666", fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="contained"
                        disabled={updating || (!editDesc.trim() && !editTitle.trim())}
                        onClick={handleSave}
                        sx={{
                            textTransform: "none", bgcolor: "#FF9933", fontWeight: 600,
                            fontSize: { xs: "0.85rem", sm: "0.9rem" },
                            "&:hover": { bgcolor: "#E68A00" },
                        }}
                    >
                        {updating ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Delete confirmation */}
            < Dialog
                open={deleteOpen}
                fullWidth
                maxWidth="xs"
                onClose={(e, reason) => { if (reason !== "backdropClick") setDeleteOpen(false); }}
                PaperProps={{ sx: { m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "100%" }, borderRadius: 3 } }}
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
                    <Typography color="text.secondary" sx={{ fontSize: { xs: "0.88rem", sm: "1rem" } }}>
                        Are you sure you want to delete this post? This can't be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteOpen(false)}
                        sx={{ textTransform: "none", fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        onClick={handleDelete}
                        sx={{ textTransform: "none", fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}