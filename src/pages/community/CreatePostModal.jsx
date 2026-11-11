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

/* Shared responsive tokens */
const BODY_PX = { xs: 1.75, sm: 3 };
const H_SIZE = { xs: "1.2rem", sm: "1.4rem", md: "1.5rem" };
const chipSx = {
  height: { xs: 30, sm: 32 },
  fontSize: { xs: "0.78rem", sm: "0.8125rem" },
  mt: { xs: 0.25, sm: 0.5 },
  maxWidth: "100%",
  "& .MuiChip-label": { px: { xs: 1.1, sm: 1.5 } },
};

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
        display: "flex", justifyContent: "center", alignItems: { xs: "center", md: "center" },
        p: { xs: 1, md: 2 },
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%", maxWidth: { xs: "100%", sm: 600 }, display: "flex", flexDirection: "column", overflow: "hidden",
          boxSizing: "border-box",
          height: { xs: "92dvh", md: "auto" }, maxHeight: { xs: "92dvh", md: "90dvh" },
          borderRadius: { xs: "10px", sm: "20px 20px 0 0", md: "20px" },
        }}
      >

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 0.75, sm: 1.5 },
            py: { xs: 0.75, sm: 1.25 },
            borderBottom: "1px solid #F0E6DC",
            flexShrink: 0,
          }}
        >
          {/* Left: Title and progress */}
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography
              fontWeight={700}
              noWrap
              sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
            >
              {step === 1 ? "New post" : "Post details"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 0.75,
                mt: 0.5,
              }}
            >
              <Box
                sx={{
                  width: { xs: 24, sm: 28 },
                  height: 3,
                  borderRadius: 2,
                  bgcolor: "#E8650A",
                }}
              />

              <Box
                sx={{
                  width: { xs: 24, sm: 28 },
                  height: 3,
                  borderRadius: 2,
                  bgcolor: step === 2 ? "#E8650A" : "#E0E0E0",
                }}
              />
            </Box>
          </Box>

          {/* Right: Cancel / Back */}
          <Button
            onClick={step === 1 ? onClose : () => setStep(1)}
            disabled={loading}
            sx={{
              minWidth: "auto",
              textTransform: "none",
              fontSize: { xs: "12px", sm: "13px" },
              fontWeight: 600,
              color: "#E8650A",
              px: 1,
            }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0,
            px: BODY_PX, py: { xs: 2, sm: 3 },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {step === 1 ? (
            <>
              <Typography fontWeight={800} mb={0.5} sx={{ fontSize: H_SIZE, lineHeight: 1.25 }}>
                What would you like to do?
              </Typography>
              <Typography color="text.secondary" mb={{ xs: 2, sm: 3 }} sx={{ fontSize: { xs: "0.82rem", sm: "0.9rem" }, m: 1 }}>
                Picking one helps the right people find it.
              </Typography>

              <Stack spacing={{ xs: 1, sm: 1.5 }} mb={{ xs: 3, sm: 4 }}>
                {POST_TYPES.map((t) => (
                  <Paper
                    key={t.id}
                    onClick={() => setPostType(t.id)}
                    sx={{
                      p: { xs: 1.25, sm: 2 }, borderRadius: { xs: 2.5, sm: 3 }, boxShadow: "none", cursor: "pointer",
                      display: "flex", gap: { xs: 1.25, sm: 2 }, alignItems: "center", minWidth: 0,
                      border: postType === t.id ? "2px solid #E8650A" : "1px solid #E0E0E0",
                      // keep the box size constant when the border width changes
                      m: postType === t.id ? 0 : "1px",
                      bgcolor: postType === t.id ? "#FFF8F2" : "#fff",
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, flexShrink: 0,
                        borderRadius: 2, bgcolor: "#F5F5F5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: { xs: "1.05rem", sm: "1.2rem" },
                      }}
                    >
                      {t.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" } }}>{t.label}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: { xs: "0.74rem", sm: "0.8rem" }, lineHeight: 1.4 }}>
                        {t.hint}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>

              <Typography fontWeight={700} mb={{ xs: 1, sm: 1.5 }} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" }, m: 1.2 }}>
                Which room?
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.75, sm: 1 }, mb: subOptions.length ? { xs: 2.5, sm: 3 } : 1 }}>
                {ALL_ROOMS.map((r) => (
                  <Chip
                    key={r.id}
                    label={r.label}
                    onClick={() => { setRoom(r.id); setSubCategory(""); }}
                    sx={{ ...chipSx, bgcolor: room === r.id ? "#333" : "#F5F5F5", color: room === r.id ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: room === r.id ? "#333" : "#EAEAEA" } }}
                  />
                ))}
              </Box>

              {subOptions.length > 0 && (
                <>
                  <Typography fontWeight={700} mb={{ xs: 1, sm: 1.5 }} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" } }}>
                    Topic <Typography component="span" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.85rem" } }}>(optional)</Typography>
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.75, sm: 1 } }}>
                    {subOptions.map((s) => (
                      <Chip
                        key={s}
                        label={s}
                        onClick={() => setSubCategory((prev) => (prev === s ? "" : s))}
                        sx={{ ...chipSx, bgcolor: subCategory === s ? "#E8650A" : "#F5F5F5", color: subCategory === s ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: subCategory === s ? "#E8650A" : "#EAEAEA" } }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Stack spacing={{ xs: 2.25, sm: 3 }}>
              <Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={{ xs: 1, sm: 1.5 }}>
                  <Chip size="small" label={typeInfo?.label.replace("...", "")} sx={{ bgcolor: "#FFF0E5", color: "#B33A00", fontWeight: 700, maxWidth: "100%", fontSize: { xs: "0.72rem", sm: "0.8125rem" } }} />
                  <Chip size="small" label={roomLabel} sx={{ bgcolor: "#E8F5E9", fontWeight: 600, maxWidth: "100%", fontSize: { xs: "0.72rem", sm: "0.8125rem" } }} />
                  {subCategory && <Chip size="small" label={subCategory} sx={{ bgcolor: "#F5F5F5", fontWeight: 600, maxWidth: "100%", fontSize: { xs: "0.72rem", sm: "0.8125rem" } }} />}
                </Stack>
                <Typography fontWeight={800} sx={{ fontSize: H_SIZE, lineHeight: 1.25, wordBreak: "break-word" }}>
                  Tell {currentUser?.city || "your city"} what you need
                </Typography>
              </Box>

              {["housing", "services"].includes(room) && (
                <Box>
                  <Typography fontWeight={700} mb={{ xs: 1, sm: 1.25 }} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" } }}>
                    Type of help
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.75, sm: 1 } }}>
                    {HOUSING_TAGS.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                        sx={{ ...chipSx, bgcolor: tags.includes(t) ? "#1B5E20" : "#F5F5F5", color: tags.includes(t) ? "#fff" : "#333", fontWeight: 600, "&:hover": { bgcolor: tags.includes(t) ? "#1B5E20" : "#EAEAEA" } }}
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
                sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.92rem", sm: "1rem" } } }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2.25, sm: 2 }}>
                <TextField {...fieldProps} label="When" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="This weekend" sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.92rem", sm: "1rem" } } }} />
                <TextField {...fieldProps} label="Zip code" value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="75034" sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.92rem", sm: "1rem" } } }} />
              </Stack>

              {postType === "offering" && (
                <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }} alignItems="center">
                  <TextField {...fieldProps} label="Price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$60/hr" sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.92rem", sm: "1rem" } } }} />
                  <FormControlLabel
                    sx={{
                      m: 0, whiteSpace: "nowrap", flexShrink: 0,
                      "& .MuiFormControlLabel-label": { fontSize: { xs: "0.85rem", sm: "1rem" } },
                    }}
                    control={<Checkbox checked={isInsured} onChange={(e) => setIsInsured(e.target.checked)} sx={{ p: { xs: 0.75, sm: 1 }, "&.Mui-checked": { color: "#E8650A" } }} />}
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
                sx={{ "& .MuiInputBase-input": { fontSize: { xs: "0.92rem", sm: "1rem" } } }}
              />

              <Box sx={{ width: "100%", minWidth: 0, "& img": { maxWidth: "100%", height: "auto" } }}>
                <Typography fontWeight={700} mb={{ xs: 1, sm: 1.25 }} sx={{ fontSize: { xs: "0.92rem", sm: "1rem" } }}>
                  Photo <Typography component="span" color="text.secondary" sx={{ fontSize: { xs: "0.78rem", sm: "0.85rem" } }}>(optional)</Typography>
                </Typography>
                <ImagePicker file={image} onChange={setImage} disabled={loading} />
              </Box>
            </Stack>
          )}
        </Box>

        {/* Sticky footer */}
        <Divider />
        <Box
          sx={{
            px: BODY_PX, pt: { xs: 1.25, sm: 2 },
            pb: { xs: "calc(10px + env(safe-area-inset-bottom, 0px))", sm: 2 },
            flexShrink: 0,
          }}
        >
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
  bgcolor: "#B33A00",
  py: { xs: 1.1, sm: 1.4 },
  borderRadius: { xs: 2.5, sm: 3 },
  fontWeight: 700,
  fontSize: { xs: "0.92rem", sm: "1rem" },
  textTransform: "none", boxShadow: "none",
  "&:hover": { bgcolor: "#8f2e00", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#E5D5CB", color: "#fff" },
};