import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, IconButton, Chip, Stack, TextField, Button,
  FormControlLabel, Checkbox, Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { toast } from "react-toastify";

import Api from "../../Api.jsx";
import { useUser } from "../../context/userConetext.jsx";
import ToastConfig from "../../components/ToastConfig.jsx";
import uploadImageToS3 from "../../utils/s3Upload.js";
import ImagePicker from "./ImagePicker.jsx";
import { ALL_ROOMS, SUB_CATEGORIES } from "./rooms.js";

const POST_TYPES = [
  { id: "question", label: "Ask a question", icon: "❓", hint: "Get advice from people who've been there." },
  { id: "looking_for", label: "I'm looking for...", icon: "🔍", hint: "Find a person, place or service." },
  { id: "offering", label: "I'm offering...", icon: "🤝", hint: "Share a service or help others." },
  { id: "recommend", label: "Recommend", icon: "⭐", hint: "Tell the community what worked for you." },
];

const HOUSING_TAGS = ["Handyman", "Plumbing", "Electrical", "HVAC", "Cleaning", "Movers", "Pest control", "Lawn"];

export default function CreatePostModal({
  open,
  onClose,
  onPosted,
  defaultRoom = "general",
  defaultSubCategory = "",
}) {
  const { currentUser } = useUser();
  const toasts = ToastConfig();

  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState("question");
  const [room, setRoom] = useState(defaultRoom);
  const [subCategory, setSubCategory] = useState(defaultSubCategory);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [tags, setTags] = useState([]);
  const [timeframe, setTimeframe] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [price, setPrice] = useState("");
  const [isInsured, setIsInsured] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fresh form every time the modal opens
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPostType("question");
    setRoom(defaultRoom);
    setSubCategory(defaultSubCategory);
    setTitle("");
    setDetails("");
    setTags([]);
    setTimeframe("");
    setZipcode(currentUser?.zipcode || "");
    setPrice("");
    setIsInsured(false);
    setImage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const subOptions = (SUB_CATEGORIES[room] || []).filter((s) => s !== "All");

  const handlePost = async () => {
    if (!title.trim()) return toast.error("Please add a title", toasts);

    try {
      setLoading(true);

      let imageKey;
      if (image) {
        const { key } = await uploadImageToS3(image, "community");
        imageKey = key;
      }

      await axios.post(`${Api}/community/`, {
        room,
        postType,
        title: title.trim(),
        description: details.trim(),
        tags,
        timeframe,
        zipcode,
        authorId: currentUser._id,
        ...(subCategory && { subCategory }),
        ...(imageKey && { postImage: imageKey }),
        ...(postType === "offering" && {
          providerDetails: { price: price.trim() || undefined, isInsured },
        }),
      });

      toast.success("Posted successfully!", toasts);
      onPosted?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to post", toasts);
    } finally {
      setLoading(false);
    }
  };

  const typeInfo = POST_TYPES.find((t) => t.id === postType);
  const roomLabel = ALL_ROOMS.find((r) => r.id === room)?.label || room;
  const fieldProps = { fullWidth: true, InputLabelProps: { shrink: true } };

  return (
    <Box
      sx={{
        position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.5)", zIndex: 1300,
        display: "flex", justifyContent: "center", alignItems: { xs: "flex-end", md: "center" },
        p: { xs: 0, md: 2 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%", maxWidth: 600, display: "flex", flexDirection: "column", overflow: "hidden",
          height: { xs: "92vh", md: "auto" }, maxHeight: { xs: "92vh", md: "90vh" },
          borderRadius: { xs: "20px 20px 0 0", md: "20px" },
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.25, borderBottom: "1px solid #F0E6DC", flexShrink: 0 }}>
          <IconButton onClick={step === 1 ? onClose : () => setStep(1)} disabled={loading}>
            {step === 1 ? <CloseIcon /> : <ArrowBackIcon />}
          </IconButton>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography fontWeight={700} fontSize="0.95rem">{step === 1 ? "New post" : "Post details"}</Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 0.5 }}>
              <Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: "#E8650A" }} />
              <Box sx={{ width: 28, height: 3, borderRadius: 2, bgcolor: step === 2 ? "#E8650A" : "#E0E0E0" }} />
            </Box>
          </Box>
          <Box width={40} />
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
          {step === 1 ? (
            <>
              <Typography variant="h5" fontWeight={800} mb={0.5}>What would you like to do?</Typography>
              <Typography color="text.secondary" fontSize="0.9rem" mb={3}>Picking one helps the right people find it.</Typography>

              <Stack spacing={1.5} mb={4}>
                {POST_TYPES.map((t) => (
                  <Paper
                    key={t.id}
                    onClick={() => setPostType(t.id)}
                    sx={{
                      p: 2, borderRadius: 3, boxShadow: "none", cursor: "pointer", display: "flex", gap: 2, alignItems: "center",
                      border: postType === t.id ? "2px solid #E8650A" : "1px solid #E0E0E0",
                      bgcolor: postType === t.id ? "#FFF8F2" : "#fff",
                    }}
                  >
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{t.icon}</Box>
                    <Box>
                      <Typography fontWeight={700}>{t.label}</Typography>
                      <Typography fontSize="0.8rem" color="text.secondary">{t.hint}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>

              <Typography fontWeight={700} mb={1.5}>Which room?</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: subOptions.length ? 3 : 1 }}>
                {ALL_ROOMS.map((r) => (
                  <Chip
                    key={r.id}
                    label={r.label}
                    onClick={() => { setRoom(r.id); setSubCategory(""); }}
                    sx={{ bgcolor: room === r.id ? "#333" : "#F5F5F5", color: room === r.id ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: room === r.id ? "#333" : "#EAEAEA" } }}
                  />
                ))}
              </Box>

              {subOptions.length > 0 && (
                <>
                  <Typography fontWeight={700} mb={1.5}>Topic <Typography component="span" color="text.secondary" fontSize="0.85rem">(optional)</Typography></Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {subOptions.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        onClick={() => setSubCategory((prev) => (prev === s ? "" : s))}
                        sx={{ bgcolor: subCategory === s ? "#E8650A" : "#F5F5F5", color: subCategory === s ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: subCategory === s ? "#E8650A" : "#EAEAEA" } }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={1.5}>
                  <Chip size="small" label={typeInfo?.label.replace("...", "")} sx={{ bgcolor: "#FFF0E5", color: "#B33A00", fontWeight: 700 }} />
                  <Chip size="small" label={roomLabel} sx={{ bgcolor: "#E8F5E9", fontWeight: 600 }} />
                  {subCategory && <Chip size="small" label={subCategory} sx={{ bgcolor: "#F5F5F5", fontWeight: 600 }} />}
                </Stack>
                <Typography variant="h5" fontWeight={800} lineHeight={1.25}>
                  Tell {currentUser?.city || "your city"} what you need
                </Typography>
              </Box>

              {["housing", "services"].includes(room) && (
                <Box>
                  <Typography fontWeight={700} mb={1.25}>Type of help</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {HOUSING_TAGS.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                        sx={{ bgcolor: tags.includes(t) ? "#1B5E20" : "#F5F5F5", color: tags.includes(t) ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: tags.includes(t) ? "#1B5E20" : "#EAEAEA" } }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                {...fieldProps}
                label="In one line"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Plumber this weekend for a kitchen sink leak"
                inputProps={{ maxLength: 100 }}
                helperText={`${title.length}/100`}
                FormHelperTextProps={{ sx: { textAlign: "right", mx: 0 } }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField {...fieldProps} label="When" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="This weekend" />
                <TextField {...fieldProps} label="Zip code" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="75034" />
              </Stack>

              {postType === "offering" && (
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField {...fieldProps} label="Price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$60/hr" />
                  <FormControlLabel
                    sx={{ m: 0, whiteSpace: "nowrap", flexShrink: 0 }}
                    control={<Checkbox checked={isInsured} onChange={(e) => setIsInsured(e.target.checked)} sx={{ "&.Mui-checked": { color: "#E8650A" } }} />}
                    label="Insured"
                  />
                </Stack>
              )}

              <TextField
                {...fieldProps}
                multiline
                minRows={4}
                label="Details (optional)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Slow leak under the sink..."
              />

              <Box>
                <Typography fontWeight={700} mb={1.25}>Photo <Typography component="span" color="text.secondary" fontSize="0.85rem">(optional)</Typography></Typography>
                <ImagePicker file={image} onChange={setImage} disabled={loading} />
              </Box>
            </Stack>
          )}
        </Box>

        {/* Sticky footer */}
        <Divider />
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}>
          {step === 1 ? (
            <Button fullWidth variant="contained" onClick={() => setStep(2)} sx={primaryBtn}>Continue</Button>
          ) : (
            <Button fullWidth variant="contained" onClick={handlePost} disabled={loading || !title.trim()} sx={primaryBtn}>
              {loading ? (image ? "Uploading..." : "Posting...") : `Post to ${currentUser?.city || "your city"}`}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

const primaryBtn = {
  bgcolor: "#B33A00", py: 1.4, borderRadius: 3, fontWeight: 700, fontSize: "1rem",
  textTransform: "none", boxShadow: "none",
  "&:hover": { bgcolor: "#8f2e00", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#E5D5CB", color: "#fff" },
};