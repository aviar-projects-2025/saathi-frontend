import React from "react";
import {
    Dialog,
    DialogContent,
    Avatar,
    Typography,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SAFFRON = "#FF9933";

const ProfileModal = ({
    open,
    onClose,
    selectedProfile,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        backgroundColor: "transparent",
                        boxShadow: "none",
                        overflow: "visible",
                        m: 1,
                    },
                },
            }}
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: "absolute",
                    top: { xs: 1, sm: 5 },
                    right: { xs: 1, sm: 5 },
                    zIndex: 10,
                    width: { xs: 36, sm: 42 },
                    height: { xs: 36, sm: 42 },
                    color: "#fff",
                    //   backgroundColor: "rgba(0, 0, 0, 0.45)",
                    transition: "all 0.2s ease",

                    "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        transform: "rotate(90deg)",
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent
                sx={{
                    p: { xs: 1, sm: 2 },
                    textAlign: "center",
                    overflow: "visible",
                }}
            >
                <Avatar
                    src={selectedProfile?.profileImage || ""}
                    alt={`${selectedProfile?.firstName || ""} ${selectedProfile?.lastName || ""} ${selectedProfile?.name || ""}
          }`}
                    sx={{
                        width: { xs: 200, sm: 360 },
                        height: { xs: 200, sm: 360 },
                        mx: "auto",
                        mb: 1.5,
                        bgcolor: SAFFRON,
                        color: "#fff",
                        fontSize: { xs: "3rem", sm: "5rem" },
                        fontWeight: 800,
                        border: "3px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
                    }}
                >
                    {!selectedProfile?.profileImage &&
                        `${selectedProfile?.firstName?.[0] || ""} ${selectedProfile?.lastName?.[0] || ""
                        } ${selectedProfile?.name || ""}`}
                </Avatar>

                <Typography
                    fontWeight={700}
                    sx={{
                        color: "#fff",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        textShadow: "0 2px 5px rgba(0,0,0,0.7)",
                    }}
                >
                    {`${selectedProfile?.firstName || ""} ${selectedProfile?.lastName || ""
                        }`.trim() || selectedProfile?.name || ""}
                </Typography>
            </DialogContent>
        </Dialog >
    );
};

export default ProfileModal;