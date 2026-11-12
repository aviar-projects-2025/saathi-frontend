import React, { useEffect, useState } from "react";
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";

/**
 * file          : currently selected File (or null)
 * onChange      : (File | null) => void
 * existingUrl   : already-saved image URL to preview when no new file is picked
 */
export default function ImagePicker({ file, onChange, existingUrl = "", disabled = false }) {
  const [anchor, setAnchor] = useState(null);
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setObjectUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = objectUrl || existingUrl;

  const handlePick = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
    e.target.value = "";
    setAnchor(null);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
      {preview && (
        <Box sx={{ position: "relative", width: "100%", mb: { xs: 1, sm: 1.5 } }}>
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: { xs: 160, sm: 200, md: 240 },
              objectFit: "contain",
              borderRadius: { xs: 1.5, sm: 2 },
              border: "1px solid #eee",
              display: "block",
              bgcolor: "#FAFAFA",
            }}
          />
          {file && (
            <Button
              size="small"
              onClick={() => onChange(null)}
              sx={{
                position: "absolute",
                top: { xs: 6, sm: 8 },
                right: { xs: 6, sm: 8 },
                minWidth: 0,
                p: 0,
                width: { xs: 28, sm: 30 },
                height: { xs: 28, sm: 30 },
                bgcolor: "#fff",
                borderRadius: "50%",
                color: "#333",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
            </Button>
          )}
        </Box>
      )}

      {preview ? (
        <Button
          variant="outlined"
          size="small"
          disabled={disabled}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            textTransform: "none", fontWeight: 600, borderRadius: 2, borderColor: "#FF9933", color: "#E8650A",
            fontSize: { xs: "0.78rem", sm: "0.85rem" },
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.5, sm: 0.6 },
            "&:hover": { borderColor: "#E8650A", bgcolor: "#FFF7F0" },
          }}
        >
          Change image
        </Button>
      ) : (
        <Button
          fullWidth
          disabled={disabled}
          onClick={(e) => setAnchor(e.currentTarget)}
          startIcon={<AddPhotoAlternateOutlinedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />}
          sx={{
            py: { xs: 1.75, sm: 2.5 },
            px: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 2.5, sm: 3 },
            textTransform: "none", fontWeight: 600, color: "#6B5B4E",
            fontSize: { xs: "0.88rem", sm: "0.95rem", md: "1rem" },
            border: "1.5px dashed #E0D4C8", bgcolor: "#FDFAF7",
            "& .MuiButton-startIcon": { mr: { xs: 0.75, sm: 1 } },
            "&:hover": { borderColor: "#E8650A", bgcolor: "#FFF7F0", color: "#E8650A" },
          }}
        >
          Add a photo
        </Button>
      )}

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem component="label" dense sx={{ py: { xs: 1, sm: 0.75 } }}>
          <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36 } }}>
            <CameraAltIcon sx={{ color: "#FF9933", fontSize: { xs: 18, sm: 20 } }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: "0.82rem", sm: "0.85rem" } }}>Camera</ListItemText>
          <input hidden type="file" accept="image/*" capture="environment" onChange={handlePick} />
        </MenuItem>
        <MenuItem component="label" dense sx={{ py: { xs: 1, sm: 0.75 } }}>
          <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36 } }}>
            <InsertDriveFileIcon sx={{ color: "#FF9933", fontSize: { xs: 18, sm: 20 } }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: { xs: "0.82rem", sm: "0.85rem" } }}>Gallery / File</ListItemText>
          <input hidden type="file" accept="image/*" onChange={handlePick} />
        </MenuItem>
      </Menu>
    </Box>
  );
}