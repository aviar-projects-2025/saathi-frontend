
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import OfferRide from "./OfferRide.jsx";
import CloseIcon from "@mui/icons-material/Close";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SearchIcon from "@mui/icons-material/Search";
import GroupsIcon from "@mui/icons-material/Groups";
import { useUser } from "../context/userConetext";
import { useNavigate, useLocation } from "react-router-dom";


const WelcomeBanner = ({
  // firstName = "Friend",
  onPostRide,
  onFindRide,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const { currentUser, completion } = useUser();
  const isProfileComplete = completion === 100;

  if (!visible) return null;

  return (
    <>
      <Dialog
        open={open}
        // onClose={(event, reason) => {
        //   if (reason === "backdropClick") return;
        //   setOpen(false);
        // }}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: "80%",
              md: "90%",
            },
            maxWidth: {
              sm: 600,
              md: 800,
            },
            borderRadius: {
              xs: 0,
              sm: 3,
            },
            m: {
              xs: 0,
              sm: 3,
            },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "relative",
            fontWeight: 700,
            py: 2,
            pr: 6,
          }}
        >
          Offer Ride

          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 1,
              sm: 2,
            },
            overflowY: "auto",
            maxHeight: {
              xs: "100vh",
              sm: "75vh",
            },
          }}
        >
          <OfferRide setOpen={setOpen} />
        </DialogContent>
      </Dialog>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 55%, #FFCC80 100%)",
          border: "1px solid #FFCC80",
          boxShadow: "0 4px 16px rgba(232, 101, 10, 0.10)",
        }}
      >
        {/* Decorative background circle */}
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            bgcolor: "rgba(255, 153, 51, 0.12)",
            top: -85,
            right: 25,
            pointerEvents: "none",
          }}
        />

        {/* Close button */}
        <IconButton
          aria-label="Dismiss welcome banner"
          onClick={() => setVisible(false)}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            color: "#8D3B00",
            bgcolor: "rgba(255,255,255,0.65)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.95)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{ position: "relative", zIndex: 1, pr: 3 }}>
          {/* Welcome heading */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#9A3412",
              mb: 1,
              fontSize: { xs: "1.25rem", sm: "1.6rem" },
            }}
          >
            🙏 Welcome to Saathi, {
              [currentUser?.firstName, currentUser?.lastName]
                .filter(Boolean)
                .join(" ") || "Friend"
            }!
          </Typography>

          <Typography
            sx={{
              color: "#663C22",
              fontSize: { xs: "0.875rem", sm: "0.95rem" },
              lineHeight: 1.8,
              maxWidth: 720,
              mb: 2,
            }}
          >
            Saathi is a community rideshare app built exclusively
            for our Indian community in the US. You can only join
            through a personal invite from someone you trust.
          </Typography>

          {/* Features */}
          <Stack spacing={1} sx={{ mb: 2.5 }}>
            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <DirectionsCarIcon sx={{ color: "#E8650A", mt: 0.3 }} />
              <Typography sx={{ color: "#663C22", fontSize: "0.9rem" }}>
                <strong>Post a Ride</strong> — offer seats if you're
                driving somewhere.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <SearchIcon sx={{ color: "#E8650A", mt: 0.3 }} />
              <Typography sx={{ color: "#663C22", fontSize: "0.9rem" }}>
                <strong>Find a Ride</strong> — search for rides others
                have posted.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <GroupsIcon sx={{ color: "#E8650A", mt: 0.3 }} />
              <Typography sx={{ color: "#663C22", fontSize: "0.9rem" }}>
                <strong>Invite Friends</strong> — share your referral
                link with people you trust.
              </Typography>
            </Stack>
          </Stack>

          {/* Action buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >

            <Tooltip
              title={
                !isProfileComplete
                  ? "Complete your profile to 100% before posting a ride."
                  : ""
              }
              arrow
            >
              <Box component="span">
                <Button
                  onClick={() => setOpen(true)}
                  disabled={!isProfileComplete}
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: "#E8650A",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    borderRadius: "999px",
                    px: 2.5,
                    py: 1.1,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#C94F00",
                      color: "#FFFFFF",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#E8650A",
                      color: "#FFFFFF",
                      opacity: 0.6,
                    },
                  }}
                >
                  Post your first ride
                </Button>
              </Box>
            </Tooltip>
            {/* <Button
              variant="outlined"
              onClick={onFindRide}
              endIcon={<SearchIcon />}
              sx={{
                color: "#9A3412",
                borderColor: "#E8650A",
                borderRadius: "999px",
                px: 2.5,
                py: 1.1,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(232, 101, 10, 0.08)",
                  borderColor: "#C94F00",
                },
              }}
            >
              Find a ride
            </Button> */}
          </Stack>
        </Box>

      </Box>
    </>
  );
};

export default WelcomeBanner;