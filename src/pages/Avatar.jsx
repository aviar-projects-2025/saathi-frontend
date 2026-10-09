import React from "react";
import {
    Dialog,
    DialogContent,
    Avatar,
    Typography,
    IconButton,
    Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MessageIcon from "@mui/icons-material/Message";

const SAFFRON = "#FF9933";

const ProfileModal = ({
    open,
    onClose,
    selectedProfile,
    onMessage,
    currentUser,
}) => {
    const isOwnProfile =
        selectedProfile?._id === currentUser?._id;

    const getProfileName = () => {
        const fullName = `${selectedProfile?.firstName || ""} ${
            selectedProfile?.lastName || ""
        }`.trim();

        return fullName || selectedProfile?.name || "";
    };

    const getInitials = () => {
        const first =
            selectedProfile?.firstName?.[0] ||
            selectedProfile?.name?.[0] ||
            "";

        const last =
            selectedProfile?.lastName?.[0] || "";

        return `${first}${last}`.toUpperCase();
    };

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
            {/* CLOSE BUTTON */}

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

                    transition: "all 0.2s ease",

                    "&:hover": {
                        backgroundColor:
                            "rgba(0, 0, 0, 0.7)",
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
                {/* PROFILE IMAGE */}

                <Avatar
                    src={selectedProfile?.profileImage || ""}
                    alt={getProfileName()}
                    sx={{
                        width: {
                            xs: 200,
                            sm: 360,
                        },

                        height: {
                            xs: 200,
                            sm: 360,
                        },

                        mx: "auto",
                        mb: 1.5,

                        bgcolor: SAFFRON,
                        color: "#fff",

                        fontSize: {
                            xs: "3rem",
                            sm: "5rem",
                        },

                        fontWeight: 800,

                        border:
                            "3px solid rgba(255,255,255,0.9)",

                        boxShadow:
                            "0 8px 30px rgba(0,0,0,0.35)",
                    }}
                >
                    {!selectedProfile?.profileImage &&
                        getInitials()}
                </Avatar>

                {/* NAME */}

                <Typography
                    fontWeight={700}
                    sx={{
                        color: "#fff",

                        fontSize: {
                            xs: "1rem",
                            sm: "1.25rem",
                        },

                        textShadow:
                            "0 2px 5px rgba(0,0,0,0.7)",
                    }}
                >
                    {getProfileName()}
                </Typography>

                {/* MESSAGE BUTTON */}

                {!isOwnProfile &&
                    selectedProfile?._id && (
                        <Button
                            variant="contained"
                            startIcon={<MessageIcon />}
                            onClick={() => {
                                onMessage(selectedProfile);
                            }}
                            sx={{
                                mt: 1.5,

                                px: 3,
                                py: 0.8,

                                borderRadius: 2,

                                backgroundColor:
                                    SAFFRON,

                                color: "#fff",

                                fontWeight: 700,

                                textTransform:
                                    "none",

                                boxShadow:
                                    "0 4px 12px rgba(0,0,0,0.25)",

                                "&:hover": {
                                    backgroundColor:
                                        "#e68a00",
                                },
                            }}
                        >
                            Message
                        </Button>
                    )}
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;