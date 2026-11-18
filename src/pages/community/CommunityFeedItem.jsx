import React, { useEffect, useMemo, useState } from "react";
import {
    Paper, Typography, Chip, Stack, Divider, Button, Box, IconButton,
    Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import axios from "axios";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatIcon from "@mui/icons-material/Chat";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Api from "../../Api.jsx";
import CommunityComments from "../CommunityComments.jsx";
import CommunityImage from "../../components/CommunityImage.jsx";
import { getRoom } from "./rooms.js";
import ProtectedAvatar from "../../components/ProtectedAvatar.jsx";
import { usePost } from "../../context/PostContext.jsx";

const SAFFRON = "#E8650A";
const RUST = "#B33A00";
const CARD_PX = { xs: 1.5, sm: 2, md: 2.5 };

const formatTimeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    if (mins < 10080) return `${Math.floor(mins / 1440)}d`;
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
};

const isHttp = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

const AuthorAvatar = ({ author, onClick }) => {
    const [broken, setBroken] = useState(false);
    const src = author?.profileImageUrl || (isHttp(author?.profileImage) ? author.profileImage : "");
    const initials = `${author?.firstName?.[0] || ""}${author?.lastName?.[0] || ""}`.toUpperCase();

    useEffect(() => { setBroken(false); }, [src]);

    return (
        <ProtectedAvatar
            src={!broken && src ? src : undefined}
            alt={`${author?.firstName || ""} ${author?.lastName || ""}`}
            onClick={onClick}
            imgProps={{ onError: () => setBroken(true), referrerPolicy: "no-referrer" }}
            sx={{
                width: { xs: 36, sm: 40, md: 44 },
                height: { xs: 36, sm: 40, md: 44 },
                bgcolor: SAFFRON, color: "#fff", fontWeight: 800,
                fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1.05rem" },
                cursor: "pointer", flexShrink: 0,
            }}
        >
            {initials}
        </ProtectedAvatar>
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
    // Kept for backward compatibility; no longer used for edit/delete flow.
    onDeletePost,
    onUpdatePost,
}) {
    const { openEdit, openDelete, onPostUpdated, onPostDeleted } = usePost();

    // ─── Local mirror so this card reacts to edits/deletes made elsewhere ───
    const [livePost, setLivePost] = useState(post);
    useEffect(() => { setLivePost(post); }, [post]);

    useEffect(() => {
        if (!post?._id) return;
        const offUpdate = onPostUpdated((updated) => {
            if (String(updated?._id) === String(post._id)) {
                setLivePost((prev) => ({ ...prev, ...updated }));
            }
        });
        const offDelete = onPostDeleted((deletedId) => {
            if (String(deletedId) === String(post._id)) {
                setLivePost((prev) => ({ ...prev, __deleted: true }));
            }
        });
        return () => { offUpdate(); offDelete(); };
    }, [post?._id, onPostUpdated, onPostDeleted]);

    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(livePost?.commentCount || 0);
    const [expanded, setExpanded] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    // CommunityComments expects { id, ...user }
    const commentUser = useMemo(() => {
        let stored = null;
        try { stored = JSON.parse(localStorage.getItem("user")); } catch { /* ignore */ }
        return {
            ...(stored || {}),
            ...(currentUser || {}),
            id: stored?.id || currentUser?._id,
        };
    }, [currentUser]);

    useEffect(() => {
        if (!livePost?._id || !commentUser.id) return;
        let cancelled = false;
        axios
            .get(`${Api}/community/comments/${livePost._id}/${commentUser.id}`)
            .then((res) => {
                if (!cancelled) setCommentCount(res.data?.data?.comments?.length ?? 0);
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [livePost?._id, commentUser.id]);

    // If the post was deleted from elsewhere, stop rendering it.
    if (livePost?.__deleted) return null;

    const author = livePost?.authorId;
    const isOffering = livePost?.postType === "offering";
    const isAuthor = !!author?._id && author._id === currentUser?._id;
    const saved = isPostSaved(livePost?._id);
    const room = getRoom(livePost?.room);

    const hasTitle = !!livePost?.title;
    const body = livePost?.description || "";
    const isLong = body.length > 120;

    const openProfile = () => onUserClick?.(author);
    const handleEdit = () => { setMenuAnchor(null); openEdit(livePost); };
    const handleDelete = () => { setMenuAnchor(null); openDelete(livePost); };

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
                {/* Header */}
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
                                {formatTimeAgo(livePost?.createdAt)}
                                <Box component="span" sx={{ mx: { xs: 0.5, sm: 0.75 }, opacity: 0.5 }}>•</Box>
                                <Box component="span" sx={{ color: RUST, fontWeight: 600 }}>{room.label}</Box>
                                <Box component="span" sx={{ mx: { xs: 0.5, sm: 0.75 }, opacity: 0.5 }}>•</Box>
                                <Box component="span" sx={{ textTransform: "capitalize" }}>
                                    {livePost?.postType?.replace("_", " ")}
                                </Box>
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

                {/* Title / body */}
                {hasTitle ? (
                    <Typography
                        fontWeight={700}
                        lineHeight={1.35}
                        mb={body && !isOffering ? 0.75 : { xs: 1, sm: 1.5 }}
                        sx={{
                            fontSize: { xs: "0.98rem", sm: "1.05rem", md: "1.1rem" },
                            wordBreak: "break-word",
                            m: { xs: 0.25, sm: 0.5 },
                        }}
                    >
                        {livePost.title}
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
                        {livePost.description}
                    </Typography>
                )}

                {hasTitle && body && (
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
                                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                                    fontWeight: 600, color: SAFFRON,
                                }}
                            >
                                {expanded ? "See less" : "See more"}
                            </Button>
                        )}
                    </Box>
                )}

                {/* Tags */}
                {(livePost?.subCategory || livePost?.timeframe || livePost?.zipcode || livePost?.tags?.length > 0) && (
                    <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: { xs: 1, sm: 1.75 } }}
                    >
                        {[livePost?.subCategory, livePost?.timeframe, livePost?.zipcode, ...(livePost?.tags || [])]
                            .filter(Boolean)
                            .map((t) => (
                                <Chip
                                    key={t}
                                    label={t}
                                    size="small"
                                    sx={{
                                        bgcolor: "#FAF5F0",
                                        color: "#6B5B4E",
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

                {/* Image */}
                {livePost?.postImage && (
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
                        <CommunityImage src={livePost.postImage} postImageUrl={livePost.postImageUrl} />
                    </Box>
                )}

                {/* Actions */}
                <Divider sx={{ borderColor: "#F3ECE5" }} />
                <Stack direction="row" sx={{ pt: 0.5, mx: { xs: -0.75, sm: -0.5 } }}>
                    {[
                        {
                            key: "like",
                            active: livePost?.isLiked,
                            onClick: () => onToggleLike?.(livePost._id, livePost.isLiked),
                            icon: livePost?.isLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />,
                            label: `${livePost?.likes || 0} Useful`,
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
                            onClick: () => onToggleSave?.(livePost),
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

                {showComments && (
                    <Box
                        sx={{
                            mt: { xs: 1, sm: 1.5 },
                            pt: { xs: 1.5, sm: 2 },
                            borderTop: "1px solid #F3ECE5",
                            minWidth: 0,
                        }}
                    >
                        <CommunityComments
                            post={livePost}
                            user={commentUser}
                            onCommentsChanged={setCommentCount}
                        />
                    </Box>
                )}
            </Paper>

            {/* Author menu (Edit / Delete) — the actual dialogs live in PostProvider */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            borderRadius: "12px",
                            minWidth: { xs: 120, sm: 140 },
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.14)",
                            p: 0.5,
                        },
                    },
                }}
            >
                <MenuItem
                    onClick={handleEdit}
                    sx={{ borderRadius: "10px", bgcolor: "#FFFFFF", mb: 0.5, "&:hover": { bgcolor: "#EEF2FF" } }}
                >
                    <ListItemIcon sx={{ minWidth: { xs: 24, sm: 30 } }}>
                        <EditIcon sx={{ color: "#6C63FF", fontSize: { xs: 15, sm: 18, md: 20 } }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Edit"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            sx: { fontSize: { xs: 12, sm: 13, md: 14 } },
                        }}
                    />
                </MenuItem>

                <MenuItem
                    onClick={handleDelete}
                    sx={{ borderRadius: "10px", bgcolor: "#FFFFFF", "&:hover": { bgcolor: "#FFF1F2" } }}
                >
                    <ListItemIcon sx={{ minWidth: { xs: 24, sm: 30 } }}>
                        <DeleteIcon sx={{ color: "#E53935", fontSize: { xs: 15, sm: 18, md: 20 } }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Delete"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            color: "error.main",
                            sx: { fontSize: { xs: 12, sm: 13, md: 14 } },
                        }}
                    />
                </MenuItem>
            </Menu>
        </>
    );
}