import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Collapse,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import VerifiedIcon from "@mui/icons-material/Verified";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LanguageIcon from "@mui/icons-material/Language";
import LuggageIcon from "@mui/icons-material/Luggage";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloseIcon from "@mui/icons-material/Close";


import Api from "../Api";
import { toast } from "react-toastify";

export default function RideCard({ ride }) {
  const [expanded, setExpanded] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const [requestData, setRequestData] = useState({
    seatsRequested: 1,
    phone: "",
    message: "",
    membersCount: 1,
    members: [{ name: "", age: "" }],
  });

  const user = ride?.createdBy || {};
  const isFlight = ride?.modeOfTravel === "Flight";

  const userName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Saathi User";

  const routeFrom = isFlight ? ride.fromAirport || ride.from : ride.from;
  const routeTo = isFlight
    ? ride.toAirport || ride.destination
    : ride.destination;

  const maxSeats = Number(selectedRide?.availableSeats || ride?.availableSeats || 1);

  const resetRequestData = () => {
    setRequestData({
      seatsRequested: 1,
      phone: "",
      message: "",
      membersCount: 1,
      members: [{ name: "", age: "" }],
    });
  };

  const handleMembersCountChange = (value) => {
    let count = Number(value);

    if (!count || count < 1) count = 1;

    if (!isFlight && count > maxSeats) {
      count = maxSeats;
      toast.warning(`Only ${maxSeats} seat(s) available`);
    }

    setRequestData((prev) => ({
      ...prev,
      membersCount: count,
      seatsRequested: isFlight ? prev.seatsRequested : count,
      members: Array.from({ length: count }, (_, index) => {
        return prev.members[index] || { name: "", age: "" };
      }),
    }));
  };

  const handleSeatsChange = (value) => {
    let seats = Number(value);

    if (!seats || seats < 1) seats = 1;

    if (seats > maxSeats) {
      seats = maxSeats;
      toast.warning(`Only ${maxSeats} seat(s) available`);
    }

    setRequestData((prev) => ({
      ...prev,
      seatsRequested: seats,
      membersCount: seats,
      members: Array.from({ length: seats }, (_, index) => {
        return prev.members[index] || { name: "", age: "" };
      }),
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...requestData.members];
    updatedMembers[index][field] = value;

    setRequestData({
      ...requestData,
      members: updatedMembers,
    });
  };

  const handleRequestSubmit = async () => {
    if (!selectedRide) return;

    if (!isFlight && Number(requestData.seatsRequested) > maxSeats) {
      toast.error(`Only ${maxSeats} seat(s) available`);
      return;
    }

    if (!isFlight && Number(requestData.membersCount) > maxSeats) {
      toast.error(`Only ${maxSeats} member(s) allowed`);
      return;
    }

    if (!requestData.phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(requestData.phone)) {
      toast.error("Enter valid 10 digit phone number");
      return;
    }

    for (let i = 0; i < requestData.members.length; i++) {
      if (!requestData.members[i].name.trim()) {
        toast.error(`Please enter Member ${i + 1} name`);
        return;
      }

      if (!requestData.members[i].age) {
        toast.error(`Please enter Member ${i + 1} age`);
        return;
      }
    }

    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      requestedBy: user?.id,
      seatsRequested:
        selectedRide.modeOfTravel === "Flight"
          ? null
          : Number(requestData.seatsRequested),
      membersCount: Number(requestData.membersCount),
      members: requestData.members,
      phone: requestData.phone,
      message: requestData.message,
      requestType:
        selectedRide.modeOfTravel === "Flight" ? "COMPANION" : "SEAT",
    };

    console.log("Selected Ride:", selectedRide);
    console.log("Request Data:", requestData);
    console.log("API Payload:", payload);

    try {
      const res = await axios.post(`${Api}/bookride/request/create/${selectedRide._id}`, payload);

      console.log("API Response:", res.data);

      toast.success(
        selectedRide.modeOfTravel === "Flight"
          ? "Companion request sent"
          : "Seat request sent"
      );

      setOpenRequestModal(false);
      resetRequestData();
    } catch (error) {
      console.log("Full Error:", error);
      console.log("Error Response:", error.response?.data);

      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        mx: { xs: 1, sm: 0 },
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",

      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },

        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" }
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: isFlight ? "#1A3C5E" : "#2D6A4F" }}>
              {userName.charAt(0)}
            </Avatar>

            <Box>
              <Typography fontWeight={800} sx={{ mt: 1, mb: 1 }}>{userName}</Typography>

              <Box display="flex" alignItems="center" gap={0.5}>
                <VerifiedIcon color="success" sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary">
                  Verified User
                </Typography>
              </Box>
            </Box>
          </Box>

          <Chip
            icon={isFlight ? <FlightTakeoffIcon /> : <DirectionsCarIcon />}
            label={isFlight ? "Flight Companion" : "Ride Available"}
            sx={{
              bgcolor: isFlight ? "#EAF2FF" : "#E8F5E9",
              color: isFlight ? "#1A3C5E" : "#2D6A4F",
              fontWeight: 700,
            }}
          />
        </div>

        <Box sx={{ mt: 3, p: 2, bgcolor: "#F8FAFC", borderRadius: 3, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            textAlign="center"
            sx={{
              wordBreak: "break-word",
              fontSize: { xs: "0.8rem", sm: "1.5rem" },
            }}
          >
            {routeFrom || "From"}
            <Box component="span" sx={{ mx: 1, color: "#1976d2" }}>
              →
            </Box>
            {routeTo || "Destination"}
          </Typography>

          {isFlight && (
            <Typography textAlign="center" variant="caption" color="text.secondary">
              {ride.fromCountry} → {ride.toCountry}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={2}>
          <Chip
            icon={<AccessTimeIcon />}
            label={
              ride.startTime
                ? new Date(ride.startTime).toLocaleString()
                : "No time"
            }
          />

          {isFlight ? (
            <>
              <Chip icon={<FlightTakeoffIcon />} label={ride.flightNumber || "Flight No"} />
              <Chip label={ride.airlineName || "Airline"} />
            </>
          ) : (
            <>
              <Chip icon={<EventSeatIcon />} label={`${ride.availableSeats || 0} Seats`} />
              <Chip
                icon={<LocalGasStationIcon />}
                color={ride.fuelSharing ? "success" : "default"}
                label={ride.fuelSharing ? "Fuel Sharing" : "No Fuel Sharing"}
              />
            </>
          )}
        </Stack>

        {isFlight && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 2 }}>
            <Chip label={ride.travellerType || "Traveller Type"} />
            <Chip icon={<LanguageIcon />} label={ride.language || "Language"} />

            {ride.transitAirport && (
              <Chip label={`Transit: ${ride.transitAirport}`} />
            )}
          </Stack>
        )}

        <Box sx={{ mt: 2, p: 2, bgcolor: "#FDFDFD", borderRadius: 2 }}>
          <Typography variant="body2">
            {ride.description || "No description added."}
          </Typography>
        </Box>

        <div
          // alignItems="center"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            mt: 3,
          }}
        >
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>

          <Button
            variant="contained"
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
            disabled={!isFlight && Number(ride.availableSeats) <= 0}
            onClick={() => {
              setSelectedRide(ride);
              resetRequestData();
              setOpenRequestModal(true);
            }}
          >
            {!isFlight && Number(ride.availableSeats) <= 0
              ? "No Seats Available"
              : isFlight
                ? "Request Companion"
                : "Request Seat"}
          </Button>
        </div>

        <Dialog
          open={openRequestModal}
          onClose={() => setOpenRequestModal(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              m: 1,
              width: "100%",
            },
          }}
        >

          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {selectedRide?.modeOfTravel === "Flight"
              ? "Request Travel Companion"
              : "Request Seat"}

            <IconButton onClick={() => setOpenRequestModal(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Typography mb={2}>
              {selectedRide?.from} → {selectedRide?.destination}
            </Typography>

            {!isFlight && (
              <Typography variant="body2" color="success.main" mb={1}>
                Available Seats: {maxSeats}
              </Typography>
            )}

            {selectedRide?.modeOfTravel !== "Flight" && (
              <TextField
                fullWidth
                type="number"
                label={`Seats Required`}
                margin="normal"
                value={requestData.seatsRequested}
                inputProps={{ min: 1, max: maxSeats }}
                helperText={`You can request maximum ${maxSeats} seat(s)`}
                onChange={(e) => handleSeatsChange(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              type="number"
              label={isFlight ? "No. of Members" : `No. of Members`}
              margin="normal"
              value={requestData.membersCount}
              inputProps={{ min: 1, max: isFlight ? 20 : maxSeats }}
              helperText={
                isFlight
                  ? "Enter number of members travelling"
                  : `Maximum ${maxSeats} member(s) allowed`
              }
              onChange={(e) => handleMembersCountChange(e.target.value)}
            />

            {requestData.members.map((member, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  label={`Member ${index + 1} Name`}
                  value={member.name}
                  fullWidth
                  size="small"
                  onChange={(e) =>
                    handleMemberChange(index, "name", e.target.value)
                  }
                />

                <TextField
                  label="Age"
                  type="number"
                  size="small"
                  sx={{
                    width: { xs: "100%", sm: 120 },
                  }}
                  value={member.age}
                  onChange={(e) =>
                    handleMemberChange(index, "age", e.target.value)
                  }
                />
              </Box>
            ))}

            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              value={requestData.phone}
              onChange={(e) =>
                setRequestData({
                  ...requestData,
                  phone: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label={
                selectedRide?.modeOfTravel === "Flight"
                  ? "Why do you need a companion?"
                  : "Message to Driver"
              }
              margin="normal"
              value={requestData.message}
              onChange={(e) =>
                setRequestData({
                  ...requestData,
                  message: e.target.value,
                })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button
              sx={{
                width: { xs: "100%", sm: "auto" },
              }}
              onClick={() => setOpenRequestModal(false)}>Cancel</Button>

            <Button variant="contained" sx={{
              width: { xs: "100%", sm: "auto" },
            }}
              onClick={handleRequestSubmit}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#F5F7FB" }}>
            <Typography variant="body2">
              <strong>Status:</strong> {ride.status}
            </Typography>

            <Typography variant="body2">
              <strong>Gender Preference:</strong> {ride.genderPreference}
            </Typography>

            <Typography variant="body2">
              <strong>Travel Mode:</strong> {ride.modeOfTravel}
            </Typography>

            {isFlight && (
              <>
                <Divider sx={{ my: 1.5 }} />

                <Typography variant="body2">
                  <strong>Age Group Preference:</strong>{" "}
                  {ride.ageGroupPreference}
                </Typography>

                <Typography variant="body2">
                  <strong>Transit Airport:</strong>{" "}
                  {ride.transitAirport || "No transit"}
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                  mt={1.5}
                  sx={{
                    "& .MuiChip-root": {
                      maxWidth: "100%",
                    },
                  }}
                >
                  {ride.medicalAssistance && (
                    <Chip
                      size="small"
                      icon={<MedicalServicesIcon />}
                      label="Medical Help"
                    />
                  )}

                  {ride.languageSupport && (
                    <Chip
                      size="small"
                      icon={<LanguageIcon />}
                      label="Language Support"
                    />
                  )}

                  {ride.transitHelp && <Chip size="small" label="Transit Help" />}

                  {ride.baggageHelp && (
                    <Chip
                      size="small"
                      icon={<LuggageIcon />}
                      label="Baggage Help"
                    />
                  )}
                </Stack>
              </>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}