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
    <Box>
      {preview && (
        <Box sx={{ position: "relative", mb: 1.5 }}>
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: "100%",
              height: { xs: 160, sm: 200 },
              objectFit: "contain",
              borderRadius: 2,
              border: "1px solid #eee",
              display: "block",
            }}
          />
          {file && (
            <Button
              size="small"
              onClick={() => onChange(null)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: 0,
                width: 30,
                height: 30,
                bgcolor: "#fff",
                borderRadius: "50%",
                color: "#333",
              }}
            >
              <CloseIcon fontSize="small" />
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
          startIcon={<AddPhotoAlternateOutlinedIcon />}
          sx={{
            py: 2.5, borderRadius: 3, textTransform: "none", fontWeight: 600, color: "#6B5B4E",
            border: "1.5px dashed #E0D4C8", bgcolor: "#FDFAF7",
            "&:hover": { borderColor: "#E8650A", bgcolor: "#FFF7F0", color: "#E8650A" },
          }}
        >
          Add a photo
        </Button>
      )}

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem component="label" dense>
          <ListItemIcon>
            <CameraAltIcon fontSize="small" sx={{ color: "#FF9933" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>Camera</ListItemText>
          <input hidden type="file" accept="image/*" capture="environment" onChange={handlePick} />
        </MenuItem>
        <MenuItem component="label" dense>
          <ListItemIcon>
            <InsertDriveFileIcon fontSize="small" sx={{ color: "#FF9933" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.85rem" }}>Gallery / File</ListItemText>
          <input hidden type="file" accept="image/*" onChange={handlePick} />
        </MenuItem>
      </Menu>
    </Box>
  );
}