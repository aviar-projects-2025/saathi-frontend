import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardContent, Box, Typography, Avatar, Chip, Button,
  Collapse, Stack, IconButton, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, useMediaQuery, useTheme,
} from "@mui/material";

import VerifiedIcon from "@mui/icons-material/Verified";
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
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WcIcon from "@mui/icons-material/Wc";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import WomanIcon from "@mui/icons-material/Woman";
import GroupsIcon from "@mui/icons-material/Groups";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import TrainIcon from "@mui/icons-material/Train";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import Api from "../Api";
import { toast } from "react-toastify";

const ORANGE = "#FF9933";
const ORANGE_BG = "#FFF9F2";
const ORANGE_BORDER = "rgba(255,153,51,0.25)";
const ORANGE_DIVIDER = "rgba(255,153,51,0.2)";

export default function RideCard({ ride }) {
  const [expanded, setExpanded] = useState(false);
  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [myRequestedRides, setMyRequestedRides] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [requestData, setRequestData] = useState({
    seatsRequested: 1,
    phone: "",
    message: "",
    membersCount: 1,
    members: [{ name: "", age: "" }],
  });

  const user = ride?.createdBy || {};
  const isFlight = ride?.modeOfTravel === "Flight";
  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Saathi User";
  const routeFrom = isFlight ? ride.fromAirport || ride.from : ride.from;
  const routeTo = isFlight ? ride.toAirport || ride.destination : ride.destination;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const dateObj = ride.startTime ? new Date(ride.startTime) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "No date";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "";

  const resetRequestData = () => {
    setRequestData({ seatsRequested: 1, phone: "", message: "", membersCount: 1, members: [{ name: "", age: "" }] });
  };

  const handleMembersCountChange = (value) => {
    let count = Number(value);
    if (!count || count < 1) count = 1;
    if (!isFlight && count > maxSeats) { count = maxSeats; toast.warning(`Only ${maxSeats} seat(s) available`); }
    setRequestData((prev) => ({
      ...prev, membersCount: count,
      seatsRequested: isFlight ? prev.seatsRequested : count,
      members: Array.from({ length: count }, (_, i) => prev.members[i] || { name: "", age: "" }),
    }));
  };

  const handleSeatsChange = (value) => {
    let seats = Number(value);
    if (!seats || seats < 1) seats = 1;
    if (seats > maxSeats) { seats = maxSeats; toast.warning(`Only ${maxSeats} seat(s) available`); }
    setRequestData((prev) => ({
      ...prev, seatsRequested: seats, membersCount: seats,
      members: Array.from({ length: seats }, (_, i) => prev.members[i] || { name: "", age: "" }),
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...requestData.members];
    updatedMembers[index][field] = value;
    setRequestData({ ...requestData, members: updatedMembers });
  };

  const handleRequestSubmit = async () => {
    if (!selectedRide) return;
    if (!isFlight && Number(requestData.seatsRequested) > maxSeats) { toast.error(`Only ${maxSeats} seat(s) available`); return; }
    if (!isFlight && Number(requestData.membersCount) > maxSeats) { toast.error(`Only ${maxSeats} member(s) allowed`); return; }
    if (!requestData.phone.trim()) { toast.error("Please enter phone number"); return; }
    if (!/^[6-9]\d{9}$/.test(requestData.phone)) { toast.error("Enter valid 10 digit phone number"); return; }
    for (let i = 0; i < requestData.members.length; i++) {
      if (!requestData.members[i].name.trim()) { toast.error(`Please enter Member ${i + 1} name`); return; }
      if (!requestData.members[i].age) { toast.error(`Please enter Member ${i + 1} age`); return; }
    }
    const payload = {
      requestedBy: storedUser?.id,
      seatsRequested: selectedRide.modeOfTravel === "Flight" ? null : Number(requestData.seatsRequested),
      membersCount: Number(requestData.membersCount),
      members: requestData.members,
      phone: requestData.phone,
      message: requestData.message,
      requestType: selectedRide.modeOfTravel === "Flight" ? "COMPANION" : "SEAT",
    };

    try {
      axios.post(`${Api}/bookride/${selectedRide._id}`, payload)
        .then((res) => {
          toast.success(
            selectedRide.modeOfTravel === "Flight"
              ? "Companion request sent"
              : "Seat request sent"
          );
          setOpenRequestModal(false);
          resetRequestData();
          myReqRides();
        })
    } catch (error) {
      console.log("Full Error:", error);
      console.log("Error Response:", error.response?.data);

      toast.error(error.response?.data?.message || "Request failed");
    }
  };

  useEffect(() => {
    myReqRides();
  }, [])

  const myReqRides = async () => {
    try {
      const res = await axios.get(Api + `/bookride/${storedUser.id}?type=requested`);
      if (res.data.success) {
        setMyRequestedRides(res.data.data || []);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const iconSx = { color: ORANGE, fontSize: { xs: 14, sm: 16 } };

  const genderIcon = {
    Male: <PersonIcon sx={iconSx} />,
    Female: <WomanIcon sx={iconSx} />,
    Any: <GroupsIcon sx={iconSx} />,
  };

  const travelIcons = {
    Car: <DirectionsCarIcon sx={iconSx} />,
    Bus: <DirectionsBusIcon sx={iconSx} />,
    Bike: <TwoWheelerIcon sx={iconSx} />,
    Flight: <FlightIcon sx={iconSx} />,
    Ship: <DirectionsBoatIcon sx={iconSx} />,
    Train: <TrainIcon sx={iconSx} />,
  };



  const currentRequest = myRequestedRides.find(
    (req) => req.rideId === ride._id && req.status !== "CANCELLED"
  );

  const alreadyRequested = !!currentRequest;

  const requestedByMe = currentRequest ? Number(currentRequest.seatsRequested || 0) : 0;

  const remainingSeats = isFlight
    ? null
    : Math.max(Number(ride.availableSeats || 0) - requestedByMe, 0);

  const maxSeats = isFlight ? Infinity : remainingSeats;

  const canRequestMore = isFlight || remainingSeats > 0;
  const detailItems = isFlight
    ? [
      { label: "Date & time", icon: <CalendarTodayIcon sx={iconSx} />, value: `${dateStr}${timeStr ? " · " + timeStr : ""}` },
      { label: "Flight no.", icon: <FlightTakeoffIcon sx={iconSx} />, value: ride.flightNumber || "—" },
      { label: "Airline", icon: <FlightTakeoffIcon sx={iconSx} />, value: ride.airlineName || "—" },
      { label: "Traveller type", icon: <WcIcon sx={iconSx} />, value: ride.travellerType || "—" },
      { label: "Language", icon: <LanguageIcon sx={iconSx} />, value: ride.language || "—" },
      ...(ride.transitAirport ? [{ label: "Transit", icon: <FlightTakeoffIcon sx={iconSx} />, value: ride.transitAirport }] : []),
    ]
    : [
      { label: "Date & time", icon: <CalendarTodayIcon sx={iconSx} />, value: `${dateStr}${timeStr ? " · " + timeStr : ""}` },
      {
        label: "Seats available",
        icon: <EventSeatIcon sx={iconSx} />,
        value: isFlight
          ? "—"
          : `${remainingSeats ?? 0} seat${remainingSeats === 1 ? "" : "s"}`,
      },
      { label: "Travel mode", icon: travelIcons[ride.modeOfTravel], value: ride.modeOfTravel || "—" },
      { label: "Gender pref", icon: genderIcon[ride.genderPreference], value: ride.genderPreference },
      { label: "Fuel sharing", icon: <LocalGasStationIcon sx={iconSx} />, value: ride.fuelSharing ? "Yes" : "No" },
    ];



  return (
    <>
      <Box sx={{ mb: 2, mx: { xs: 0, sm: 0 }, maxWidth: 1000, width: "100%" }}>

        {/* ── Light orange-tinted header strip ── */}
        <Box sx={{
          bgcolor: ORANGE_BG,
          border: `1px solid ${ORANGE_BORDER}`,
          borderBottom: 0,
          borderRadius: "14px 14px 0 0",
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 1, sm: 1.4 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}>
          {/* Avatar + name + verified */}
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} sx={{ minWidth: 0, flex: 1 }}>
            <Avatar sx={{
              bgcolor: isFlight ? "#1A3C5E" : "#2D6A4F",
              width: { xs: 25, sm: 38 }, height: { xs: 25, sm: 38 },
              fontSize: { xs: "0.8rem", sm: "1.1rem" }, flexShrink: 0,
            }}>
              {userName.charAt(0)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} sx={{

                fontSize: { xs: "0.8rem", sm: "0.95rem" }, lineHeight: 1.2, mt: 0.5,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {userName}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {/* <VerifiedIcon color="success" sx={{ fontSize: { xs: 10, sm: 14 }, mt: 0.5 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" } }}>
                  Verified User
                </Typography> */}
              </Box>
            </Box>
          </Box>

          {/* Mode chip */}
          <Chip
            icon={isFlight
              ? <FlightTakeoffIcon sx={{ fontSize: { xs: 10, sm: 14 } }} />
              : travelIcons[ride.modeOfTravel]}
            label={isFlight ? "Flight Companion" : "Ride Available"}
            size="small"
            sx={{
              bgcolor: isFlight ? "#EAF2FF" : "#E8F5E9",
              color: isFlight ? "#1A3C5E" : "#2D6A4F",
              fontWeight: 700,
              fontSize: { xs: "0.58rem", sm: "0.7rem" },
              height: { xs: 22, sm: 26 },
              flexShrink: 0,
              "& .MuiChip-label": { px: { xs: 0.75, sm: 1.25 } },
            }}
          />
        </Box>

        {/* ── Card body ── */}
        <Card elevation={0} sx={{
          borderRadius: "0 0 14px 14px",
          border: `1px solid ${ORANGE_BORDER}`,
          borderTop: 0,
          bgcolor: "#fff",
        }}>
          <CardContent sx={{ p: { xs: "12px !important", sm: "20px 24px !important" } }}>

            {/* FROM → TO row */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
              pb: { xs: 1.25, sm: 2 }, mb: { xs: 1.25, sm: 2 },
              borderBottom: `1px solid ${ORANGE_DIVIDER}`,
            }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: "0.58rem", sm: "0.68rem" }, mb: 0.3 }}>
                  FROM
                </Typography>
                <Typography fontWeight={700} sx={{ wordBreak: "break-word", fontSize: { xs: "0.78rem", sm: "0.95rem" }, lineHeight: 1.3 }}>
                  {"\u{1F4CD}"} {routeFrom || "—"}
                </Typography>

                {/* {isFlight && (
                    <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, color: "text.secondary", mt: 0.25 }}>
                      {ride.fromCountry}
                    </Typography>
                  )} */}

              </Box>

              <ArrowForwardIcon sx={{ color: ORANGE, fontSize: { xs: 16, sm: 20 }, flexShrink: 0 }} />

              <Box sx={{ minWidth: 0, flex: 1, textAlign: "right" }}>
                <Typography sx={{ color: ORANGE, fontWeight: 700, letterSpacing: 0.8, fontSize: { xs: "0.58rem", sm: "0.68rem" }, mb: 0.3 }}>
                  TO
                </Typography>
                <Typography fontWeight={700} sx={{ wordBreak: "break-word", fontSize: { xs: "0.78rem", sm: "0.95rem" }, lineHeight: 1.3 }}>
                  {"\u{1F4CD}"} {routeTo || "—"}
                </Typography>

                {/* {isFlight && (
                    <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, color: "text.secondary", mt: 0.25 }}>
                      {ride.toCountry}
                    </Typography>
                  )} */}

              </Box>
            </Box>

            {/* Details grid */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: { xs: "10px 8px", sm: "16px 24px" },
              pb: { xs: 1.25, sm: 2 }, mb: { xs: 1.25, sm: 2 },
              borderBottom: `1px solid ${ORANGE_DIVIDER}`,
            }}>
              {detailItems.map(({ label, icon, value }) => (
                <Box key={label}>
                  <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.68rem" }, color: "text.secondary", mb: 0.4 }}>
                    {label}
                  </Typography>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    {icon}
                    <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.85rem" }, fontWeight: 600, lineHeight: 1.3 }}>
                      {value}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>


            {/* Footer: expand + action button */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                // alignItems:"center",
                // gap:1,
              }}
            >
              <IconButton
                onClick={() => setExpanded(!expanded)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  border: `1px solid ${ORANGE_BORDER}`,
                  borderRadius: 2,
                  p: { xs: 0.4, sm: 0.75 },
                  color: ORANGE,
                }}
              >
                {expanded
                  ? <KeyboardArrowUpIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
                  : <KeyboardArrowDownIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />}
              </IconButton>

              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                disabled={!isFlight && remainingSeats <= 0}
                onClick={() => {
                  setSelectedRide(ride);
                  resetRequestData();
                  setOpenRequestModal(true);
                }}
                sx={{
                  bgcolor: ORANGE,
                  "&:hover": { bgcolor: "#e68a00" },
                  "&.Mui-disabled": { bgcolor: "#e0e0e0" },
                  fontWeight: 700,
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                  px: { xs: 1.5, sm: 3 },
                  py: { xs: 0.5, sm: 1 },
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  textTransform: "none",
                }}
              >
                {isFlight
                  ? "Request Companion"
                  : remainingSeats <= 0
                    ? "No Seats"
                    : alreadyRequested
                      ? `Request More (${remainingSeats} left)`
                      : `Request Seat (${remainingSeats} left)`}
              </Button>
            </Box>

            {/* Expanded details */}
            <Collapse in={expanded}>
              <Box sx={{
                mt: { xs: 1.25, sm: 2 }, p: { xs: 1.25, sm: 2 },
                bgcolor: ORANGE_BG, border: `1px solid ${ORANGE_BORDER}`, borderRadius: 2,
              }}>
                <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.72rem" }, color: ORANGE, fontWeight: 700, letterSpacing: 0.6, mb: 1 }}>
                  MORE DETAILS
                </Typography>
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
                  gap: { xs: "8px 8px", sm: "12px 20px" },
                }}>
                  {[
                    { label: "Status", value: ride.status },
                    { label: "Gender preference", value: ride.genderPreference },
                    { label: "Travel mode", value: ride.modeOfTravel },
                    ...(isFlight
                      ? [
                        { label: "Age group pref", value: ride.ageGroupPreference },
                        { label: "Transit airport", value: ride.transitAirport || "None" },
                      ]
                      : []),
                  ].map(({ label, value }) => (
                    <Box key={label}>
                      <Typography sx={{ fontSize: { xs: "0.58rem", sm: "0.65rem" }, color: "text.secondary", mb: 0.25 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.82rem" }, fontWeight: 600 }}>
                        {value || "—"}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Description */}
                {ride.description && (
                  <Box sx={{
                    bgcolor: ORANGE_BG,
                    mt: 1
                    // px: { xs: 1, sm: 2 }, py: { xs: 0.75, sm: 1.25 }, mb: { xs: 1.25, sm: 2 },
                  }}>
                    <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.82rem" }, color: "text.secondary" }}>
                      <Typography
                        component="span"
                        sx={{
                          // fontStyle: "italic",
                          fontWeight: 800,
                          fontSize: { xs: "0.75rem", sm: "0.75rem" },
                        }}
                      >
                        Description:
                      </Typography>  {ride.description}
                    </Typography>
                  </Box>
                )}

                {isFlight && (
                  <>
                    <Divider sx={{ my: 1.25, borderColor: ORANGE_DIVIDER }} />
                    <Stack direction="row" flexWrap="wrap" sx={{ gap: 1.5 }}>
                      {ride.medicalAssistance && (
                        <Chip size="small" icon={<MedicalServicesIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />} label="Medical Help"
                          sx={{ fontSize: { xs: "0.58rem", sm: "0.7rem" }, bgcolor: "#FFF0DD", color: "#7a4a00" }} />
                      )}
                      {ride.languageSupport && (
                        <Chip size="small" icon={<LanguageIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />} label="Language Support"
                          sx={{ fontSize: { xs: "0.58rem", sm: "0.7rem" }, bgcolor: "#FFF0DD", color: "#7a4a00" }} />
                      )}
                      {ride.transitHelp && (
                        <Chip size="small" label="Transit Help" icon={<InfoOutlinedIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                          sx={{ fontSize: { xs: "0.58rem", sm: "0.7rem" }, bgcolor: "#FFF0DD", color: "#7a4a00" }} />
                      )}
                      {ride.baggageHelp && (
                        <Chip size="small" icon={<LuggageIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />} label="Baggage Help"
                          sx={{ fontSize: { xs: "0.58rem", sm: "0.7rem" }, bgcolor: "#FFF0DD", color: "#7a4a00" }} />
                      )}
                    </Stack>
                  </>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Box>

      {/* ── Request Modal ── */}
      <Dialog open={openRequestModal} onClose={() => setOpenRequestModal(false)} fullWidth maxWidth="sm"
        PaperProps={{ sx: { m: { xs: 1, sm: 2 }, width: "100%", borderRadius: 3 } }}>
        <DialogTitle sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: { xs: "0.95rem", sm: "1.2rem" }, fontWeight: 700,
          py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 },
          borderBottom: `1px solid ${ORANGE_DIVIDER}`,
        }}>
          {selectedRide?.modeOfTravel === "Flight" ? "Request Travel Companion" : "Request Seat"}
          <IconButton onClick={() => setOpenRequestModal(false)} size={isMobile ? "small" : "medium"}>
            <CloseIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: "16px !important" }}>
          <Typography mb={2} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, color: "text.secondary" }}>
            {selectedRide?.from} {"\u2192"} {selectedRide?.destination}
          </Typography>

          {!isFlight && (
            <Typography variant="body2" color="success.main" mb={1} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Available Seats: {maxSeats}
            </Typography>
          )}

          {selectedRide?.modeOfTravel !== "Flight" && (
            <TextField fullWidth type="number" label="Seats Required" margin="normal"
              size={isMobile ? "small" : "medium"} value={requestData.seatsRequested}
              inputProps={{ min: 1, max: maxSeats }} helperText={`You can request maximum ${maxSeats} seat(s)`}
              onChange={(e) => handleSeatsChange(e.target.value)} />
          )}

          <TextField fullWidth type="number" label="No. of Members" margin="normal"
            size={isMobile ? "small" : "medium"} value={requestData.membersCount}
            inputProps={{ min: 1, max: isFlight ? 20 : maxSeats }}
            helperText={isFlight ? "Enter number of members travelling" : `Maximum ${maxSeats} member(s) allowed`}
            onChange={(e) => handleMembersCountChange(e.target.value)} />

          {requestData.members.map((member, index) => (
            <Box key={index} sx={{ display: "flex", gap: 1.5, mt: 1.5, alignItems: "center" }}>
              <TextField label={`Member ${index + 1} Name`} value={member.name} fullWidth size="small"
                onChange={(e) => handleMemberChange(index, "name", e.target.value)} />
              <TextField label="Age" type="number" size="small" sx={{ width: { xs: 80, sm: 120 } }}
                value={member.age} onChange={(e) => handleMemberChange(index, "age", e.target.value)} />
            </Box>
          ))}

          <TextField fullWidth label="Phone Number" margin="normal" size={isMobile ? "small" : "medium"}
            value={requestData.phone} onChange={(e) => setRequestData({ ...requestData, phone: e.target.value })} />

          <TextField fullWidth multiline rows={isMobile ? 3 : 4} margin="normal" size={isMobile ? "small" : "medium"}
            label={selectedRide?.modeOfTravel === "Flight" ? "Why do you need a companion?" : "Message to Driver"}
            value={requestData.message} onChange={(e) => setRequestData({ ...requestData, message: e.target.value })} />
        </DialogContent>

        <DialogActions sx={{
          px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1,
          borderTop: `1px solid ${ORANGE_DIVIDER}`,
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}>
          <Button fullWidth={isMobile} size={isMobile ? "small" : "medium"}
            onClick={() => setOpenRequestModal(false)} sx={{ textTransform: "none", borderRadius: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" fullWidth={isMobile} size={isMobile ? "small" : "medium"}
            onClick={handleRequestSubmit}
            sx={{ bgcolor: ORANGE, "&:hover": { bgcolor: "#e68a00" }, fontWeight: 700, textTransform: "none", borderRadius: 2, boxShadow: "none" }}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
