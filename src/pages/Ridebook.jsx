import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, Button, IconButton, Box,
  useMediaQuery, useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Api from "../Api";
import { toast } from "react-toastify";
import { useUser } from "../context/userConetext";
import AddCircleOutlineIcon from "@mui/icons-material/Add";
import { Chip, Stack, Avatar } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RemoveCircle from "@mui/icons-material/RemoveCircle";

const ORANGE = "#FF9933";
const ORANGE_DIVIDER = "rgba(255,153,51,0.2)";



export default function Ridebook({ open, onClose, ride, maxSeats = Infinity, requestToEdit = null, setAllMyRequests, allMyRequests }) {
  const theme = useTheme();
  const { currentUser } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = JSON.parse(localStorage.getItem('user'));
  const isFlight = ride?.modeOfTravel === "Flight";
  const isEditMode = Boolean(requestToEdit);
  const [requests, setRequests] = useState();

  // const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const TOASTS = {
    position: isTab ? "top-center" : "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeButton: false,
    style: {
      width: isTab ? "280px" : "360px",
      fontSize: isTab ? "13px" : "15px",
      padding: isTab ? "8px 12px" : "12px 16px",
      borderRadius: isTab ? "8px" : "10px",
      minHeight: isTab ? "42px" : "52px",
    },
  }


  const handleAddMember = () => {
    setRequestData((prev) => {
      if (!isFlight && prev.members.length >= maxSeats) return prev;
      const updatedMembers = [...prev.members, { name: "", age: "" }];

      const newSeats = Math.max(prev.seatsRequested, updatedMembers.length);
      return { ...prev, members: updatedMembers, seatsRequested: newSeats };
    });
  };

  const handleRemoveMember = (index) => {
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
    setRequestData((prev) => {
      const updatedMembers = [...prev.members];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      return { ...prev, members: updatedMembers };
    });
  };
  const [editingRequest, setEditingRequest] = useState(null);

  useEffect(() => {
    if (editingRequest) {
      setRequestData({
        seatsRequested: editingRequest.seatsRequested || 1,
        membersCount: undefined,
        members: editingRequest.members?.length
          ? editingRequest.members
          : [{ name: "", age: "" }],
        message: editingRequest.message || "",
        phone: editingRequest.phone || "",
      });
    }
  }, [editingRequest?.id]);
  const emptyRequestData = {
    seatsRequested: 1,
    // phone: "",
    message: "",
    membersCount: 1,
    members: [{ name: "", age: "" }],
  };

  const [requestData, setRequestData] = useState(emptyRequestData);

  useEffect(() => {
    if (editingRequest) {
      setRequestData({
        seatsRequested: editingRequest.seatsRequested || 1,
        membersCount: undefined,
        members: editingRequest.members?.length
          ? editingRequest.members
          : [{ name: "", age: "" }],
        message: editingRequest.message || "",
        phone: editingRequest.phone || "",
      });
    }
  }, [editingRequest?.id]);


  useEffect(() => {
    if (!open) return;

    if (requestToEdit) {
      setRequestData({
        seatsRequested: requestToEdit.seatsRequested || 1,
        // phone: requestToEdit.phone || "",
        message: requestToEdit.message || "",
        membersCount: requestToEdit.membersCount || (requestToEdit.members?.length ?? 1),
        members: requestToEdit.members?.length
          ? requestToEdit.members
          : [{ name: "", age: "" }],
      });
    } else {
      setRequestData(emptyRequestData);
    }
  }, [open, ride, requestToEdit]);

  useEffect(() => {
    getRidebook()
  }, [])

  const getRidebook = async () => {
    try {
      if (!user?.id) return;

      const res = await axios.get(`${Api}/bookride/send/${user.id}`);

      setRequests(res.data.data);

      const memberRide = res.data.data.map((item) => item.members);

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed", TOASTS);
    }
  };



  //   if (seats < 1) return;

  //   if (seats > maxSeats) {
  //     toast.warning(`Only ${maxSeats} seat(s) available`, TOASTS);
  //     return;
  //   }

  //   setRequestData((prev) => ({
  //     ...prev,
  //     seatsRequested: seats,
  //   }));
  // };
  const handleMembersCountChange = (value) => {
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
        (_, i) => prev.members[i] || { name: "", age: "" }
      ),
    }));
  };



  const validate = () => {
    if (!isFlight && Number(requestData.seatsRequested) > maxSeats) {
      toast.error(`Only ${maxSeats} seat(s) available`, TOASTS);
      return false;
    }

    if (!isFlight && Number(requestData.membersCount) > maxSeats) {
      toast.error(`Only ${maxSeats} member(s) allowed`, TOASTS);
      return false;
    }



    for (let i = 0; i < requestData.members.length; i++) {
      if (!requestData.members[i].name.trim()) {
        toast.error(`Please enter Member ${i + 1} name`, TOASTS);
        return false;
      }
      if (!requestData.members[i].age) {
        toast.error(`Please enter Member ${i + 1} age`, TOASTS);
        return false;
      }
    }

    return true;
  };

  const handleRequestSubmit = async () => {
    if (!ride) return;
    if (!validate()) return;

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const seatsRequested = requestData.members.length;

    const payload = {
      firstName: storedUser?.firstName,
      requestedBy: storedUser?.id,
      seatsRequested: isFlight ? null : seatsRequested,
      membersCount: seatsRequested,
      members: requestData.members,
      phone: requestData.phone,
      message: requestData.message,
      requestType: isFlight ? "COMPANION" : "SEAT",
    };

    try {
      const res = isEditMode
        ? await axios.put(`${Api}/bookride/edit/${requestToEdit._id}`, payload)
        : await axios.post(`${Api}/bookride/${ride._id}`, payload);

      toast.success(res.data.message || (isEditMode ? "Request updated" : "Request sent"), {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });

      setRequestData(emptyRequestData);
      onClose?.();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed", TOASTS);
    }
  };

  const titleText = isFlight
    ? (isEditMode ? "Edit Travel Companion Request" : "Request Travel Companion")
    : (isEditMode ? "Edit Seat Request" : "Request Seat");

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

      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: "20px !important", pb: 3 }}>
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
              label={`${requestData.members.length} / ${maxSeats}`}
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
          Traveling Members
        </Typography>

        {/* Member cards */}
        <Stack spacing={1.25}>
          {requestData.members.map((member, index) => (
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
                transition: "border-color 0.15s ease",
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
                value={member.name}
                fullWidth
                size="small"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "0.85rem",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                  },
                }}
                onChange={(e) => handleMemberChange(index, "name", e.target.value)}
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
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    textAlign: "center",
                  },
                }}
                value={member.age}
                inputProps={{ min: 1, max: 120 }}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (Number(value) >= 1 && Number(value) <= 120)) {
                    handleMemberChange(index, "age", value);
                  }
                }}
              />

              <IconButton
                color="error"
                onClick={() => handleRemoveMember(index)}
                disabled={requestData.members.length <= 1}
                size="small"
              >
                <RemoveCircle fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMember}
          disabled={!isFlight && requestData.members.length >= maxSeats}
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
          label="Phone Number"
          size={isMobile ? "small" : "medium"}
          value={currentUser?.mobile}
          disabled
          sx={{
            mb: 2,
            "& .MuiInputBase-input.Mui-disabled": {
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              WebkitTextFillColor: "#555",
            },
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={isMobile ? 3 : 4}
          size={isMobile ? "small" : "medium"}
          label={isFlight ? "Why do you need a companion?" : "Message to Driver"}
          value={requestData.message}
          sx={{
            "& .MuiInputBase-input": {
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem",
            },
          }}
          onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
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
          onClick={onClose}
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
          {isEditMode ? "Update Request" : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
