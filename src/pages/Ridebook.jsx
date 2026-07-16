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

const ORANGE = "#FF9933";
const ORANGE_DIVIDER = "rgba(255,153,51,0.2)";



export default function Ridebook({ open, onClose, ride, maxSeats = Infinity, onSuccess, requestToEdit = null }) {
  const theme = useTheme();
  const { currentUser } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = JSON.parse(localStorage.getItem('user'));
  const isFlight = ride?.modeOfTravel === "Flight";
  const isEditMode = Boolean(requestToEdit);
  const [allMyRequests, setAllMyRequests] = useState();


  const emptyRequestData = {
    seatsRequested: 1,
    // phone: "",
    message: "",
    membersCount: 1,
    members: [{ name: "", age: "" }],
  };

  const [requestData, setRequestData] = useState(emptyRequestData);

  // Reset (or pre-fill for edit) the form whenever the modal opens
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

      setAllMyRequests(res.data.data);

      const memberRide = res.data.data.map((item) => item.members);

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  const handleSeatsChange = (value) => {
    if (value === "") {
      setRequestData((prev) => ({
        ...prev,
        seatsRequested: "",
      }));
      return;
    }

    const seats = Number(value);

    if (seats < 1) return;

    if (seats > maxSeats) {
      toast.warning(`Only ${maxSeats} seat(s) available`);
      return;
    }

    setRequestData((prev) => ({
      ...prev,
      seatsRequested: seats,
    }));
  };
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
      toast.warning(`Maximum ${limit} member(s) allowed`);
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

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...requestData.members];
    updatedMembers[index][field] = value;
    setRequestData({ ...requestData, members: updatedMembers });
  };

  const validate = () => {
    if (!isFlight && Number(requestData.seatsRequested) > maxSeats) {
      toast.error(`Only ${maxSeats} seat(s) available`);
      return false;
    }

    if (!isFlight && Number(requestData.membersCount) > maxSeats) {
      toast.error(`Only ${maxSeats} member(s) allowed`);
      return false;
    }



    for (let i = 0; i < requestData.members.length; i++) {
      if (!requestData.members[i].name.trim()) {
        toast.error(`Please enter Member ${i + 1} name`);
        return false;
      }
      if (!requestData.members[i].age) {
        toast.error(`Please enter Member ${i + 1} age`);
        return false;
      }
    }

    return true;
  };

  const handleRequestSubmit = async () => {
    if (!ride) return;
    if (!validate()) return;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    const payload = {
      firstName: storedUser?.firstName,
      requestedBy: storedUser?.id,
      seatsRequested: isFlight ? null : Number(requestData.seatsRequested),
      membersCount: Number(requestData.membersCount),
      members: requestData.members,
      phone: requestData.phone,
      message: requestData.message,
      requestType: isFlight ? "COMPANION" : "SEAT",
    };

    try {
      const res = isEditMode
        ? await axios.put(`${Api}/bookride/edit/${requestToEdit._id}`, payload)
        : await axios.post(`${Api}/bookride/${ride._id}`, payload);

      toast.success(res.data.message || (isEditMode ? "Request updated" : "Request sent"));

      setRequestData(emptyRequestData);
      onClose?.();
      onSuccess?.();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Request failed");
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
      PaperProps={{ sx: { m: { xs: 1, sm: 2 }, width: "100%", borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: { xs: "0.95rem", sm: "1.2rem" }, fontWeight: 700,
          py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${ORANGE_DIVIDER}`,
        }}
      >
        {titleText}
        <IconButton onClick={onClose} size={isMobile ? "small" : "medium"}>
          <CloseIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: "16px !important" }}>
        <Typography mb={2} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, color: "text.secondary" }}>
          {ride?.from} {"\u2192"} {ride?.destination}
        </Typography>

        {!isFlight && (
          <Typography variant="body2" color="success.main" mb={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            Available Seats: {maxSeats}
          </Typography>
        )}

        {!isFlight && (
          <TextField
            fullWidth
            type="number"
            label="Seats Required"
            margin="normal"
            size={isMobile ? "small" : "medium"}
            value={requestData.seatsRequested}
            helperText={`You can request maximum ${maxSeats} seat(s)`}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                handleSeatsChange("");
                return;
              }

              const num = Number(value);

              if (num >= 1 && num <= maxSeats) {
                handleSeatsChange(value);
              }
            }}
          />
        )}

        <TextField
          fullWidth
          type="number"
          label="No. of Members"
          margin="normal"
          size={isMobile ? "small" : "medium"}
          value={requestData.membersCount}
          helperText={
            isFlight
              ? "Enter number of members travelling"
              : `Maximum ${maxSeats} member(s) allowed`
          }
          onChange={(e) => {
            const value = e.target.value;
            const limit = isFlight ? 20 : maxSeats;

            if (value === "") {
              handleMembersCountChange("");
              return;
            }

            const num = Number(value);

            if (num >= 1 && num <= limit) {
              handleMembersCountChange(value);
            }
          }}
        />

        {requestData.members.map((member, index) => (
          <Box key={index} sx={{ display: "flex", gap: 1.5, mt: 1.5, alignItems: "center" }}>
            <TextField
              label={`Member ${index + 1} Name`}
              value={member.name}
              fullWidth
              size="small"
              onChange={(e) => handleMemberChange(index, "name", e.target.value)}
            />
            <TextField
              label="Age"
              type="number"
              size="small"
              sx={{ width: { xs: 80, sm: 120 } }}
              value={member.age}
              inputProps={{
                min: 1,
                max: 120,
              }}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "" || (Number(value) >= 1 && Number(value) <= 120)) {
                  handleMemberChange(index, "age", value);
                }
              }}
            />
          </Box>
        ))}

        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          size={isMobile ? "small" : "medium"}
          value={currentUser?.mobile}
          disabled
          onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })}
        />

        <TextField
          fullWidth
          multiline
          rows={isMobile ? 3 : 4}
          margin="normal"
          size={isMobile ? "small" : "medium"}
          label={isFlight ? "Why do you need a companion?" : "Message to Driver"}
          value={requestData.message}

          onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1,
          borderTop: `1px solid ${ORANGE_DIVIDER}`,
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button fullWidth={isMobile} size={isMobile ? "small" : "medium"} onClick={onClose} sx={{ textTransform: "none", borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
          onClick={handleRequestSubmit}
          sx={{ bgcolor: ORANGE, "&:hover": { bgcolor: "#e68a00" }, fontWeight: 700, textTransform: "none", borderRadius: 2, boxShadow: "none" }}
        >
          {isEditMode ? "Update Request" : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
