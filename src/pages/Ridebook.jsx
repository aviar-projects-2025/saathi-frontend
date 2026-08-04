import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";
import AddCircleOutlineIcon from "@mui/icons-material/Add";
import { Chip, Stack, Avatar } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RemoveCircle from "@mui/icons-material/RemoveCircle";
import ToastConfig from "../components/ToastConfig";

const ORANGE = "#FF9933";
const ORANGE_DIVIDER = "rgba(255,153,51,0.2)";
const GREEN_BG = "#F5FFF5";
const GREEN_AVATAR_BG = "#C8F5D0";
const GREEN_AVATAR_TEXT = "#1B5E20";

export default function Ridebook({
  open,
  onClose,
  ride,
  totalSeat,
  maxSeats = Infinity,
  requestToEdit = null,
  setAllMyRequests,
  allMyRequests,
  onRequestUpdated,
}) {
  const theme = useTheme();
  const { currentUser } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = JSON.parse(localStorage.getItem("user"));
  const isFlight = ride?.modeOfTravel === "Flight";
  const isEditMode = Boolean(requestToEdit);
  const [requests, setRequests] = useState();
  const [requestLoading, setRequestLoading] = useState(false);

  // existingMembers = already CONFIRMED/APPROVED members on this request.
  // Read-only, shown for context, never sent back to the backend.
  const [existingMembers, setExistingMembers] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const calculateAge = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };
  const availableSeat = ride?.availableSeats || 0;
  const defaultSelfMember = () => ({
    name: `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim(),
    age: calculateAge(currentUser?.dob),
  });
  const emptyRequestData = {
    seatsRequested: 1,
    message: "",
    membersCount: 1,
    members: [defaultSelfMember()],
  };
  const [requestData, setRequestData] = useState(emptyRequestData);
  const totalOccupied = isEditMode
    ? existingMembers.length + newMembers.length
    : requestData.members.length;


  const remainingAvailableSeats = isEditMode
    ? Math.max(
      ride?.availableSeats - (existingMembers.length + newMembers.length),
      0
    )
    : Math.max(
      ride?.availableSeats - requestData?.members.length,
      0
    );

  const TOASTS = ToastConfig();





  const handleAddMember = () => {
    if (isEditMode) {
      setNewMembers((prev) => {
        const totalSeats = existingMembers.length + prev.length;
        if (!isFlight && totalSeats >= maxSeats) return prev;
        return [...prev, { name: "", age: "" }];
      });

      return;
    }

    setRequestData((prev) => {


      if (!isFlight && prev.members.length >= maxSeats) return prev;

      const updatedMembers = [...prev.members, { name: "", age: "" }];



      return {
        ...prev,
        members: updatedMembers,
        seatsRequested: updatedMembers.length,
      };
    });

  };


  const handleRemoveMember = (index) => {
    if (isEditMode) {
      setNewMembers((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setRequestData((prev) => {
      const updatedMembers = prev.members.filter((_, i) => i !== index);
      return { ...prev, members: updatedMembers };
    });
  };

  const handleSeatsChange = (value) => {
    let seats = parseInt(value, 10);
    if (isNaN(seats) || seats < 1) seats = 1;
    if (!isFlight && seats > maxSeats) seats = maxSeats;

    setRequestData((prev) => {
      const currentMembers = [...prev.members]; // preserve existing entries as-is
      const diff = seats - currentMembers.length;

      if (seats < currentMembers.length) {
        // can't request fewer seats than members already added
        seats = currentMembers.length;
      } else if (diff > 0) {
        // only append new empty slots, never touch existing ones
        for (let i = 0; i < diff; i++) {
          currentMembers.push({ name: "", age: "" });
        }
      }

      return {
        ...prev,
        seatsRequested: seats,
        members: currentMembers,
      };
    });
  };

  const handleMemberChange = (index, field, value) => {
    if (isEditMode) {
      setNewMembers((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
      return;
    }

    setRequestData((prev) => {
      const updatedMembers = [...prev.members];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, members: updatedMembers };
    });
  };

  const [editingRequest, setEditingRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);




  useEffect(() => {
    if (editingRequest) {
      setRequestData((prev) => ({
        ...prev,
        message: editingRequest.message || "",
        phone: editingRequest.phone || "",
      }));
    }
  }, [editingRequest?.id]);

  useEffect(() => {
    if (isEditMode && requestToEdit) {
      setExistingMembers(requestToEdit.members || []);
      setNewMembers(
        requestToEdit.pendingMembers?.length
          ? requestToEdit.pendingMembers
          : []
      );
    } else {
      setExistingMembers([]);
      setNewMembers([]);
    }
  }, [isEditMode, requestToEdit, currentUser]);

  useEffect(() => {
    if (!open) return;

    if (requestToEdit) {
      setRequestData((prev) => ({
        ...prev,
        message: requestToEdit.message || "",
        phone: requestToEdit.phone || "",
      }));
    } else {
      setRequestData({
        seatsRequested: 1,
        message: "",
        membersCount: 1,
        members: [defaultSelfMember()],
      });
    }
  }, [open, ride, requestToEdit, currentUser]);

  useEffect(() => {
    getRidebook();
  }, []);

  const getRidebook = async () => {
    try {
      if (!user?.id) return;

      const res = await axios.get(`${Api}/bookride/send/${user.id}`);

      setRequests(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed", TOASTS);
    }
  };

  const handleMembersCountChange = (value) => {
    if (isEditMode) return; // count-based quick add only applies to fresh requests

    if (value === "") {
      setRequestData((prev) => ({
        ...prev,
        membersCount: "",
        members: [],
      }));
      return;
    }

    const count = Number(value);
    const limit = isFlight ? 20 : maxSeats;

    if (count < 1) return;

    if (count > limit) {
      toast.warning(`Maximum ${limit} member(s) allowed`, TOASTS);
      return;
    }

    setRequestData((prev) => ({
      ...prev,
      membersCount: count,
      members: Array.from(
        { length: count },
        (_, i) => prev.members[i] || defaultSelfMember(),
      ),
    }));
  };

  const validate = () => {
    const membersToValidate = isEditMode ? newMembers : requestData.members;

    if (isEditMode) {
      const totalSeats = existingMembers.length + newMembers.length;
      if (!isFlight && totalSeats > maxSeats) {
        toast.error(`Only ${maxSeats} seat(s) available`, TOASTS);
        return false;
      }
    } else {
      if (!isFlight && Number(requestData.seatsRequested) > maxSeats) {
        toast.error(`Only ${maxSeats} seat(s) available`, TOASTS);
        return false;
      }

      if (!isFlight && Number(requestData.membersCount) > maxSeats) {
        toast.error(`Only ${maxSeats} member(s) allowed`, TOASTS);
        return false;
      }
    }

    if (membersToValidate.length === 0) {
      toast.error("Please add at least one member", TOASTS);
      return false;
    }

    for (let i = 0; i < membersToValidate.length; i++) {
      if (!membersToValidate[i].name?.trim()) {
        toast.error(`Please enter Member ${i + 1} name`, TOASTS);
        return false;
      }
      if (!membersToValidate[i].age) {
        toast.error(`Please enter Member ${i + 1} age`, TOASTS);
        return false;
      }
    }

    return true;
  };


  const handleRequestSubmit = async () => {

    if (!ride) return;
    if (!validate()) return;
    const userMobile = currentUser?.mobile;
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Only the new/unapproved members are ever sent — existingMembers
    // (already confirmed) are never re-sent to the backend.
    const membersToSubmit = isEditMode ? newMembers : requestData.members;
    const seatsRequested = membersToSubmit.length;

    const payload = {
      firstName: storedUser?.firstName,
      requestedBy: storedUser?.id,
      seatsRequested: isFlight ? null : seatsRequested,
      membersCount: seatsRequested,
      pendingMembers: membersToSubmit,
      phone: userMobile,
      message: requestData.message,
      requestType: isFlight ? "COMPANION" : "SEAT",
    };

    try {
      setRequestLoading(true);
      
      const res = isEditMode
        ? await axios.put(`${Api}/bookride/edit/${requestToEdit._id}`, payload)
        : await axios.post(`${Api}/bookride/${ride._id}`, payload);

      toast.success(
        res.data.message || (isEditMode ? "Request updated" : "Request sent"),
        TOASTS,
      );

      setRequestData(emptyRequestData);
      setNewMembers([]);
      setExistingMembers([]);
      onRequestUpdated?.();
      onClose?.();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed", TOASTS);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReset = () => {
    if (isEditMode && requestToEdit) {
      // Restore original edit data
      setExistingMembers(requestToEdit.members || []);
      setNewMembers(requestToEdit.pendingMembers || []);

      setRequestData((prev) => ({
        ...prev,
        message: requestToEdit.message || "",
        phone: requestToEdit.phone || "",
      }));
    } else {
      // Restore new request defaults
      setExistingMembers([]);
      setNewMembers([]);

      setRequestData({
        seatsRequested: 1,
        message: "",
        membersCount: 1,
        members: [defaultSelfMember()],
      });
    }
  };

  const titleText = isFlight
    ? isEditMode
      ? "Edit Travel Companion Request"
      : "Request Travel Companion"
    : isEditMode
      ? "Edit Seat Request"
      : "Request Seat";

  // The list actually rendered in the editable member cards.
  const editableMembers = isEditMode ? newMembers : requestData.members;


  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          width: "100%",
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: { xs: "1rem", sm: "1.25rem" },
          fontWeight: 700,
          letterSpacing: "-0.01em",
          fontFamily: "'Inter', 'Poppins', sans-serif",
          py: { xs: 1.75, sm: 2.25 },
          px: { xs: 2.5, sm: 3 },
          bgcolor: "#FFF8F0",
          borderBottom: `1px solid ${ORANGE_DIVIDER}`,
        }}
      >
        {titleText}
        <IconButton
          onClick={onClose}
          size={isMobile ? "small" : "medium"}
          sx={{
            bgcolor: "rgba(0,0,0,0.04)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ px: { xs: 2.5, sm: 3 }, pt: "20px !important", pb: 3 }}
      >
        {/* Route */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: "#FAFAFA",
            border: "1px solid #EEE",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              color: "#333",
            }}
          >
            {ride?.from}
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 16, color: ORANGE }} />
          <Typography
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              color: "#333",
            }}
          >
            {ride?.destination}
          </Typography>
        </Box>

        {/* Seats summary */}
        {!isFlight && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              bgcolor: "#FFF3E6",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: "#7A4A00",
              }}
            >
              Available Seats
            </Typography>
            <Chip
              label={`${remainingAvailableSeats}`}
              size="small"
              sx={{
                bgcolor: ORANGE,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.75rem",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </Box>
        )}

        {/* Confirmed / already-approved members (edit mode only, read-only) */}
        {isEditMode && existingMembers.length > 0 && (
          <>
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "text.secondary",
                mb: 1.25,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Confirmed Members
            </Typography>

            <Stack spacing={1.25} sx={{ mb: 3 }}>
              {existingMembers.map((member, index) => (
                <Box
                  key={`existing-${index}`}
                  sx={{
                    display: "flex",
                    gap: 1.25,
                    alignItems: "center",
                    p: 1.25,
                    borderRadius: 2.5,
                    border: "1px solid #E0F2E0",
                    bgcolor: GREEN_BG,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      bgcolor: GREEN_AVATAR_BG,
                      color: GREEN_AVATAR_TEXT,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography
                    sx={{
                      flex: 1,
                      fontSize: "0.85rem",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      color: "#333",
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    sx={{
                      width: 56,
                      textAlign: "center",
                      fontSize: "0.85rem",
                      fontFamily: "'Inter', sans-serif",
                      color: "#666",
                    }}
                  >
                    {member.age}
                  </Typography>
                  <Chip
                    label="Confirmed"
                    size="small"
                    sx={{
                      bgcolor: "#4CAF50",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.65rem",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* Section label */}
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "text.secondary",
            mb: 1.25,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {isEditMode ? "Requested Members" : "Traveling Members"}
        </Typography>


        <Stack spacing={1.25}>
          {editableMembers.map((member, index) => {
            const isLockedSelfSlot = index === 0;
            return (
              <>
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 1.25,
                    alignItems: "center",
                    p: 1.25,
                    borderRadius: 2.5,
                    border: "1px solid #EEE",
                    bgcolor: "#FCFCFC",
                    "&:hover": { borderColor: ORANGE },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      bgcolor: "#FFE3C2",
                      color: "#8A5200",
                    }}
                  >
                    {index + 1}
                  </Avatar>

                  <TextField
                    placeholder="Full name"
                    fullWidth
                    size="small"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    value={
                      isLockedSelfSlot
                        ? `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim()
                        : member.name
                    }
                    disabled={isLockedSelfSlot}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "0.85rem",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      },
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "#555",
                        opacity: 1,
                      },
                    }}
                    onChange={(e) =>
                      !isLockedSelfSlot &&
                      handleMemberChange(index, "name", e.target.value)
                    }
                  />

                  <TextField
                    placeholder="Age"
                    type="number"
                    size="small"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      width: 56,
                      "& .MuiInputBase-input": {
                        fontSize: "0.85rem",
                        textAlign: "center",
                      },
                    }}
                    value={
                      isLockedSelfSlot
                        ? calculateAge(currentUser?.dob)
                        : member.age
                    }
                    disabled={isLockedSelfSlot}
                    inputProps={{ min: 1, max: 120 }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        value === "" ||
                        (Number(value) >= 1 && Number(value) <= 120)
                      ) {
                        handleMemberChange(index, "age", value);
                      }
                    }}
                  />

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveMember(index)}
                    disabled={isLockedSelfSlot}
                    size="small"
                  >
                    <RemoveCircle fontSize="small" />
                  </IconButton>


                </Box>
              </>
            );
          })}
        </Stack>

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMember}
          disabled={!isFlight && totalOccupied >= maxSeats}
          sx={{
            mt: 1.5,
            mb: 3,
            textTransform: "none",
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            color: ORANGE,
            "&:hover": { bgcolor: "#FFF3E6" },
          }}
          size="small"
        >
          Add Member
        </Button>

        <TextField
          fullWidth
          label="Phone Number"
          size={isMobile ? "small" : "medium"}
          value={currentUser?.mobile}
          sx={{
            mb: 2,
            "& .MuiInputBase-input.Mui-disabled": {
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              WebkitTextFillColor: "#555",
            },
          }}
          onChange={(e) =>
            setRequestData({ ...requestData, mobile: e.target.value })
          }
        />

        {/* Contact + message */}
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "text.secondary",
            mb: 1.25,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Contact Details
        </Typography>


        <TextField
          fullWidth
          multiline
          rows={isMobile ? 3 : 4}
          size={isMobile ? "small" : "medium"}
          label={
            isFlight ? "Why do you need a companion?" : "Message to Driver"
          }
          value={requestData.message}
          sx={{
            "& .MuiInputBase-input": {
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
            },
          }}
          onChange={(e) =>
            setRequestData({ ...requestData, message: e.target.value })
          }
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          gap: 1,
          borderTop: `1px solid ${ORANGE_DIVIDER}`,
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          onClick={handleReset}
          sx={{
            textTransform: "none",
            borderRadius: 2.5,
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            color: "text.secondary",
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          onClick={handleRequestSubmit}
          disabled={requestLoading}
          sx={{
            bgcolor: ORANGE,
            "&:hover": { bgcolor: "#e68a00" },
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            boxShadow: "none",
            fontFamily: "'Inter', sans-serif",
            px: 3,
          }}
        >
          {
            requestLoading
              ? (isEditMode ? "Updating..." : "Submitting...")
              : (isEditMode ? "Update Request" : "Submit Request")
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
