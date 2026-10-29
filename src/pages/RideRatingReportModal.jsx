import React, { useState, useRef, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Box, Avatar, IconButton, TextField, Radio, RadioGroup,
    FormControlLabel, Chip, Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig.jsx";

export default function RideRatingReportModal({
    open,
    onClose,
    ride,
    targetUser,
    onSuccess,
    onLater,
}) {
    const [view, setView] = useState("rating");
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [comment, setComment] = useState("");
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const toasts = ToastConfig();
    const token = localStorage.getItem("token");
    const closingRef = useRef(false);

    // ───────────────────────────────────────────────────────────
    // ★ Self-rating guard — never allow rating yourself
    // ───────────────────────────────────────────────────────────
    const currentUserId = (() => {
        try {
            const u = JSON.parse(localStorage.getItem("user") || "null");
            return String(u?.id || u?._id || "");
        } catch {
            return "";
        }
    })();
    const targetUserId = String(targetUser?._id || targetUser?.id || "");
    const isSelfTarget = Boolean(currentUserId && targetUserId && currentUserId === targetUserId);

    // If we're asked to rate self, close programmatically
    useEffect(() => {
        if (!open || !isSelfTarget) return;
        console.warn("[RATING MODAL] refusing to rate self — closing");
        if (onLater && ride?._id) {
            try { onLater(ride._id); } catch { /* ignore */ }
        }
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isSelfTarget]);

    if (!ride || !targetUser || isSelfTarget) return null;

    // ───────────────────────────────────────────────────────────
    // Helpers
    // ───────────────────────────────────────────────────────────
    const resetFields = () => {
        setView("rating");
        setRating(5);
        setHoverRating(0);
        setSelectedTags([]);
        setComment("");
        setReportReason("");
        setReportDetails("");
    };

    const handleLater = () => {
        if (closingRef.current) return;
        closingRef.current = true;
        if (onLater && ride?._id) {
            try { onLater(ride._id); } catch (err) { console.warn("onLater failed:", err); }
        }
        resetFields();
        onClose();
        setTimeout(() => { closingRef.current = false; }, 300);
    };

    const submitRating = async () => {
        if (closingRef.current) return;
        closingRef.current = true;

        try {
            setLoading(true);
            await axios.post(
                `${Api}/reviews`,
                {
                    rideId: ride._id,
                    revieweeId: targetUser._id || targetUser.id,
                    rating,
                    tags: selectedTags,
                    comment,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Rating submitted successfully!", toasts);
            if (onSuccess) onSuccess(ride._id);
            resetFields();
            onClose();
        } catch (error) {
            if (error?.response?.data?.message?.includes("already reviewed")) {
                toast.info("You have already rated this ride.", toasts);
                if (onSuccess) onSuccess(ride._id);
                resetFields();
                onClose();
            } else {
                toast.error(error?.response?.data?.message || "Failed to submit rating", toasts);
                closingRef.current = false;
            }
        } finally {
            setLoading(false);
        }
    };

    const submitReport = async () => {
        if (!reportReason) {
            toast.error("Please select a reason for the report", toasts);
            return;
        }
        if (closingRef.current) return;
        closingRef.current = true;

        try {
            setLoading(true);
            await axios.post(
                `${Api}/reports`,
                {
                    rideId: ride._id,
                    reportedUserId: targetUser._id || targetUser.id,
                    reason: reportReason,
                    details: reportDetails,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Report submitted. Our team will review it.", toasts);
            if (onSuccess) onSuccess(ride._id);
            resetFields();
            onClose();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to submit report", toasts);
            closingRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => handleLater();

    // ───────────────────────────────────────────────────────────
    // Derived display values
    // ───────────────────────────────────────────────────────────
    const userInitials = `${targetUser?.firstName?.[0] || ""}${targetUser?.lastName?.[0] || ""}`.toUpperCase() || "U";
    const userName = `${targetUser?.firstName || ""} ${targetUser?.lastName || ""}`.trim() || "Community Member";
    const routeLabel = `${ride?.from?.split(",")[0] || "Origin"} to ${ride?.destination?.split(",")[0] || "Destination"}`;
    const dateLabel = new Date(ride?.startTime).toLocaleDateString("en-US", {
        month: "2-digit", day: "2-digit", year: "numeric",
    });

    const RATING_TAGS = ["On time", "Friendly", "Safe driving", "Clean car"];

    const toggleTag = (tag) =>
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );

    const REPORT_OPTIONS = [
        "Unsafe driving or behavior",
        "Harassment or inappropriate messages",
        "Asked for more than the cost share",
        "No-show or cancelled last minute",
        "Fake profile or not who they said",
        "Other",
    ];

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 450, mx: "auto" } }}
        >
            {view === "rating" ? (
                <>
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                        <Typography variant="h6" fontWeight={800} color="#1A2B4C">Rate your ride</Typography>
                        <IconButton onClick={handleLater} size="small"><CloseIcon /></IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ pb: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                            <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1565C0", fontWeight: 700 }}>{userInitials}</Avatar>
                            <Box>
                                <Typography fontWeight={700} fontSize="0.95rem">{userName}</Typography>
                                <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                                    {routeLabel} • {dateLabel}
                                </Typography>
                            </Box>
                        </Stack>

                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 1 }}>Overall</Typography>
                        <Box sx={{ display: "flex", gap: 0.5, mb: 3 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconButton
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    sx={{ p: 0.5 }}
                                >
                                    {star <= (hoverRating || rating) ? (
                                        <StarIcon sx={{ color: "#FFB300", fontSize: 40 }} />
                                    ) : (
                                        <StarBorderIcon sx={{ color: "#D1D5DB", fontSize: 40 }} />
                                    )}
                                </IconButton>
                            ))}
                        </Box>

                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 1 }}>
                            What went well <Typography component="span" variant="body2" color="text.secondary">(optional)</Typography>
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                            {RATING_TAGS.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <Chip
                                        key={tag}
                                        label={tag}
                                        onClick={() => toggleTag(tag)}
                                        sx={{
                                            bgcolor: isSelected ? "#C83F08" : "#fff",
                                            color: isSelected ? "#fff" : "#333",
                                            border: isSelected ? "1px solid #C83F08" : "1px solid #D1D5DB",
                                            fontWeight: 600,
                                            "&:hover": { bgcolor: isSelected ? "#A93205" : "#F3F4F6" },
                                        }}
                                    />
                                );
                            })}
                        </Stack>

                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 1 }}>
                            Comment <Typography component="span" variant="body2" color="text.secondary">(optional, public on their Trust Profile)</Typography>
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />

                        <Box sx={{ bgcolor: "#E3F2FD", p: 1.5, borderRadius: 2, display: "flex", gap: 1 }}>
                            <InfoOutlinedIcon sx={{ color: "#1565C0", fontSize: 20, mt: 0.2 }} />
                            <Typography fontSize="0.8rem" color="#1565C0" lineHeight={1.4}>
                                You can rate for 48 hours after the ride. Ratings can't be edited after you submit. Had a problem? Use Report instead.
                            </Typography>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, pt: 1, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                        <Button
                            onClick={() => setView("report")}
                            variant="text"
                            sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.85rem" }}
                        >
                            Report instead
                        </Button>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                onClick={handleLater}
                                variant="outlined"
                                sx={{
                                    borderColor: "#D1D5DB",
                                    color: "#374151",
                                    fontWeight: 700,
                                    py: 1,
                                    borderRadius: 2,
                                    "&:hover": { bgcolor: "#F3F4F6" },
                                }}
                            >
                                Maybe later
                            </Button>

                            <Button
                                onClick={submitRating}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    bgcolor: "#C83F08",
                                    color: "#fff",
                                    fontWeight: 700,
                                    py: 1,
                                    borderRadius: 2,
                                    "&:hover": { bgcolor: "#A93205" },
                                }}
                            >
                                {loading ? "Submitting..." : "Submit"}
                            </Button>
                        </Box>
                    </DialogActions>
                </>
            ) : (
                <>
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                        <Typography variant="h6" fontWeight={800} color="#1A2B4C">Report {userName.split(" ")[0]}</Typography>
                        <IconButton onClick={handleLater} size="small"><CloseIcon /></IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ pb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Reports are private. The member is not told who reported them.
                        </Typography>

                        <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                            {REPORT_OPTIONS.map((option) => (
                                <Box
                                    key={option}
                                    sx={{
                                        border: reportReason === option ? "2px solid #C83F08" : "1px solid #E5E7EB",
                                        bgcolor: reportReason === option ? "#FFF3E0" : "#fff",
                                        borderRadius: 2,
                                        mb: 1,
                                        px: 1,
                                    }}
                                >
                                    <FormControlLabel
                                        value={option}
                                        control={<Radio sx={{ color: "#C83F08", "&.Mui-checked": { color: "#C83F08" } }} />}
                                        label={<Typography fontWeight={reportReason === option ? 700 : 500} fontSize="0.9rem">{option}</Typography>}
                                        sx={{ width: "100%", m: 0, py: 0.5 }}
                                    />
                                </Box>
                            ))}
                        </RadioGroup>

                        <Typography fontWeight={700} fontSize="0.9rem" sx={{ mb: 1, mt: 2 }}>
                            Details <Typography component="span" variant="body2" color="text.secondary">(optional)</Typography>
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Tell us what happened."
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />

                        <Box sx={{ bgcolor: "#FEF3C7", p: 1.5, borderRadius: 2 }}>
                            <Typography fontSize="0.8rem" color="#92400E" lineHeight={1.4}>
                                If you are in danger, call 911. After 3 reports from different members the account is suspended automatically and a moderator reviews it within 24 hours.
                            </Typography>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 2, pt: 1, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                        <Button onClick={() => setView("rating")} variant="text" sx={{ color: "#6B7280", fontWeight: 600, fontSize: "0.85rem" }}>
                            Back to rating
                        </Button>
                        <Button
                            onClick={submitReport}
                            disabled={loading || !reportReason}
                            variant="contained"
                            sx={{
                                flex: 1,
                                bgcolor: "#D32F2F",
                                color: "#fff",
                                fontWeight: 700,
                                py: 1,
                                borderRadius: 2,
                                "&:hover": { bgcolor: "#B71C1C" },
                                "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
                            }}
                        >
                            {loading ? "Submitting..." : "Submit report"}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}