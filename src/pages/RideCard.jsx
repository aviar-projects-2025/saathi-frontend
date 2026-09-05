import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Tooltip,
  Collapse,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Ridebook from "./Ridebook.jsx";
import { useUser } from "../context/userConetext.jsx";
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
import { useRide } from "../context/RideContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
import ToastConfig from "../components/ToastConfig.jsx";
import ProfileModal from "./Avatar.jsx";

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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [myRequestedRides, setMyRequestedRides] = useState([]);
  const pendingRequest = myRequestedRides.find(
    (item) => item.rideId === ride._id,
  );


  const pendingReqSeats = pendingRequest?.pendingReqSeats;
  const { completion } = useUser();
  const theme = useTheme();
  const { currentUser } = useUser();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openEditModal, setOpenEditModal] = useState(false);
  const [requestData, setRequestData] = useState({
    seatsRequested: 1,
    phone: "",
    message: "",
    membersCount: 1,
    members: [{ name: "", age: "" }],
  });

  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const TOASTS = ToastConfig();

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const user = ride?.createdBy || {};
  const avaialableSeats = ride?.availableSeats;
  const totalSeats = ride?.totalSeats;

  const [totalSeat, setTotalSeat] = useState(totalSeats);
  const [seatAvailable, setSeatAvailable] = useState(avaialableSeats);

  const isFlight = ride.modeOfTravel === "Flight";

  const flightStartTime = new Date(ride.startTime);
  const twoHoursBeforeFlight = new Date(
    flightStartTime.getTime() - 2 * 60 * 60 * 1000,
  );

  const isFlightBookingClosed = isFlight && new Date() >= twoHoursBeforeFlight;

  const userName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Saathi User";
  const routeFrom = isFlight ? ride.fromAirport || ride.from : ride.from;
  const routeTo = isFlight
    ? ride.toAirport || ride.destination
    : ride.destination;
  const userProfile = user?.profileImage;

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isProfileComplete = completion === 100;
  const dateObj = ride.startTime ? new Date(ride.startTime) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "No date";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

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
      toast.warning(`Only ${maxSeats} seat(s) available`, TOASTS);
    }
    setRequestData((prev) => ({
      ...prev,
      membersCount: count,
      seatsRequested: isFlight ? prev.seatsRequested : count,
      members: Array.from(
        { length: count },
        (_, i) => prev.members[i] || { name: "", age: "" },
      ),
    }));
  };

  const { refreshRide } = useRide();

  const handleSeatsChange = (value) => {
    let seats = Number(value);
    if (!seats || seats < 1) seats = 1;
    if (seats > maxSeats) {
      seats = maxSeats;
      toast.warning(`Only ${maxSeats} seat(s) available`, TOASTS);
    }
    setRequestData((prev) => ({
      ...prev,
      seatsRequested: seats,
      membersCount: seats,
      members: Array.from(
        { length: seats },
        (_, i) => prev.members[i] || { name: "", age: "" },
      ),
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...requestData.members];
    updatedMembers[index][field] = value;
    setRequestData({ ...requestData, members: updatedMembers });
  };

  const handleRequestSubmit = async () => {
    if (!selectedRide) return;

    if (!isFlight && Number(requestData.seatsRequested) > maxSeats) {
      toast.error(`Only ${maxSeats} seat(s) available`, TOASTS);
      return;
    }
    const isFlight = selectedRide.modeOfTravel === "Flight";

    // Flight companion booking cutoff: 2 hours before departure
    if (isFlight) {
      const flightStartTime = new Date(selectedRide.startTime);
      const twoHoursBeforeFlight = new Date(
        flightStartTime.getTime() - 2 * 60 * 60 * 1000,
      );

      if (new Date() >= twoHoursBeforeFlight) {
        toast.error(
          "Flight companion booking is closed 2 hours before departure.",
          TOASTS,
        );
        return;
      }
    }

    if (!isFlight && Number(requestData.membersCount) > maxSeats) {
      toast.error(`Only ${maxSeats} member(s) allowed`, TOASTS);
      return;
    }

    if (!requestData.phone.trim()) {
      toast.error("Please enter phone number", TOASTS);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(requestData.phone)) {
      toast.error("Enter valid 10 digit phone number", TOASTS);
      return;
    }

    for (let i = 0; i < requestData.members.length; i++) {
      if (!requestData.members[i].name.trim()) {
        toast.error(`Please enter Member ${i + 1} name`, TOASTS);
        return;
      }

      if (!requestData.members[i].age) {
        toast.error(`Please enter Member ${i + 1} age`, TOASTS);
        return;
      }
    }

    const payload = {
      firstName: storedUser?.firstName,
      requestedBy: storedUser?.id,
      seatsRequested: isFlight ? null : Number(requestData.seatsRequested),
      membersCount: Number(requestData.membersCount),
      members: requestData.members,
      // phone: requestData.phone,
      message: requestData.message,
      requestType: isFlight ? "COMPANION" : "SEAT",
    };

    try {
      const res = await axios.post(
        `${Api}/bookride/${selectedRide._id}`,
        payload,
      );

      toast.success(res.data.message, {
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

      setOpenRequestModal(false);
      resetRequestData();
      myReqRides();
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Request failed", TOASTS);
    }
  };

  useEffect(() => {
    myReqRides();
  }, [refreshRide]);

  const myReqRides = async () => {
    try {
      const res = await axios.get(
        Api + `/bookride/${storedUser.id}?type=requested`,
      );

      if (res.data.success) {
        setMyRequestedRides(res.data.data || []);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const currentRequest = myRequestedRides.find((req) => {
    const rideId =
      typeof req.rideId === "object" ? req.rideId?._id : req.rideId;

    return rideId === ride._id && req.status !== "CANCELLED";
  });

  const requestedCount = currentRequest?.seatsRequested || 0;
  const alreadyRequested = !!currentRequest;

  //   const myRequest = myRequestedRides.find((req) => {
  //   const rideId =
  //     typeof req.rideId === "object" ? req.rideId?._id : req.rideId;

  //   return rideId === ride._id;
  // });

  const cancelledRequestCount = myRequestedRides.filter(
    (item) =>
      item.rideId?.toString() === ride._id?.toString() &&
      item.requestedBy?.toString() === currentUser._id?.toString() &&
      item.status === "CANCELLED"
  ).length;

  const isBlocked = cancelledRequestCount >= 3;
  const myRequest = myRequestedRides.find(
    (item) =>
      item.rideId === ride._id &&
      item.status !== "CANCELLED"
  );


  const isRejected = myRequest?.status === "REJECTED";
  const isAccepted = myRequest?.status === "ACCEPTED";
  const requestedByMe = Number(myRequest?.seatsRequested || 0);
  const approvedSeats = myRequest?.approvedSeats || 0;
  // console.log(requestedByMe, 'requestedByMe')
  // console.log(myRequest, 'myRequest')

  const pendingSeatsByMe = isAccepted ? 0 : requestedByMe;

  const remainingSeatsForUser = isFlight
    ? null
    : Math.max(Number(ride.availableSeats || 0) - pendingSeatsByMe, 0);

  const noSeats = !isFlight && remainingSeatsForUser <= 0;

  const maxSeatsForDialog = isFlight
    ? Infinity
    : alreadyRequested
      ? remainingSeatsForUser + Number(currentRequest?.seatsRequested || 0)
      : remainingSeatsForUser;

  const iconSx = {
    color: ORANGE,
    fontSize: { xs: 14, sm: 16 },
  };

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

  const maxSeats = isFlight ? Infinity : remainingSeatsForUser;

  const canRequestMore = isFlight || remainingSeatsForUser > 0;
  const genderMismatch =
    ride.genderPreference &&
    ride.genderPreference !== "Any" &&
    ride.genderPreference !== currentUser?.gender;
  const detailItems = isFlight
    ? [
      {
        label: "Date & time",
        icon: <CalendarTodayIcon sx={iconSx} />,
        value: `${dateStr}${timeStr ? " · " + timeStr : ""}`,
      },
      {
        label: "Flight no.",
        icon: <FlightTakeoffIcon sx={iconSx} />,
        value: ride.flightNumber || "—",
      },
      {
        label: "Airline",
        icon: <FlightTakeoffIcon sx={iconSx} />,
        value: ride.airlineName || "—",
      },
      // {
      //   label: "Traveller type",
      //   icon: <WcIcon sx={iconSx} />,
      //   value: ride.travellerType || "—",
      // },
    ]
    : [
      {
        label: "Date & time",
        icon: <CalendarTodayIcon sx={iconSx} />,
        value: `${dateStr}${timeStr ? " · " + timeStr : ""}`,
      },
      {
        label: "Total Seats",
        icon: <EventSeatIcon sx={iconSx} />,
        value: isFlight
          ? "—"
          : `${totalSeat}`
      },
      {
        label: "Seats available",
        icon: <EventSeatIcon sx={iconSx} />,
        // value: isFlight
        //   ? "—"
        //   : (() => {
        //     const occupiedSeats = Math.max(
        //       Number(totalSeat || 0) - Number(remainingSeatsForUser ?? 0),
        //       0,
        //     );
        //     return `${occupiedSeats}
        // / ${totalSeat}`;
        //   })(),
        value: totalSeat - pendingSeatsByMe
      },

      {
        label: "Travel mode",
        icon: travelIcons[ride.modeOfTravel],
        value: ride.modeOfTravel || "—",
      },
      {
        label: "Gender pref",
        icon: genderIcon[ride.genderPreference],
        value: ride.genderPreference,
      },
      {
        label: "Fuel sharing",
        icon: <LocalGasStationIcon sx={iconSx} />,
        value: ride.fuelSharing || "0",
      },

      ...(ride?.duration != null
        ? [
          {
            label: "Duration",
            icon: <AccessTimeIcon sx={iconSx} />,
            value: ride.duration,
          },
        ]
        : []),
    ];

  return (
    <>
      {ride.travelStatus !== "Cancelled" && (
        <Box sx={{ mb: 3, maxWidth: 1000, width: "100%" }}>
          {/* ── Light orange-tinted header strip ── */}
          <Box
            sx={{
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
            }}
          >
            {/* Avatar + name + verified */}
            <Box
              display="flex"
              alignItems="center"
              gap={{ xs: 1, sm: 1.5 }}
              sx={{ minWidth: 0, flex: 1 }}
            >
              <Avatar
                src={userProfile || ""}
                alt={userName}
                onClick={() => {
                  setSelectedProfile(user);
                  setProfileModalOpen(true);
                }}
                sx={{
                  bgcolor: isFlight ? "#1A3C5E" : "#2D6A4F",
                  width: { xs: 25, sm: 38 },
                  height: { xs: 25, sm: 38 },
                  fontSize: { xs: "0.8rem", sm: "1.1rem" },
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.2s ease",

                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow: "0 0 0 3px rgba(255,255,255,0.3)",
                  },
                }}
              >
                {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  fontWeight={700}
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.95rem" },
                    lineHeight: 1.2,
                    mt: 0.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
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
              icon={
                isFlight ? (
                  <FlightTakeoffIcon sx={{ fontSize: { xs: 10, sm: 14 } }} />
                ) : (
                  travelIcons[ride.modeOfTravel]
                )
              }
              label={
                isFlight
                  ? "Flight Companion"
                  : isRejected
                    ? "Rejected"
                    : noSeats
                      ? "No Seats"
                      : ride.genderPreference && ride.genderPreference !== "Any"
                        ? `${ride.genderPreference} Only`
                        : "Ride Available"
              }
              size="small"
              sx={{
                bgcolor: isRejected
                  ? "#FDECEA"
                  : noSeats
                    ? "#FFF3E0"
                    : isFlight
                      ? "#EAF2FF"
                      : "#E8F5E9",

                color: isRejected
                  ? "#D32F2F"
                  : noSeats
                    ? "#EF6C00"
                    : isFlight
                      ? "#1A3C5E"
                      : "#2D6A4F",

                fontWeight: 700,
                fontSize: { xs: "0.58rem", sm: "0.7rem" },
                height: { xs: 22, sm: 26 },
                flexShrink: 0,
                "& .MuiChip-label": {
                  px: { xs: 0.75, sm: 1.25 },
                },
              }}
            />
          </Box>

          {/* ── Card body ── */}
          <Card
            elevation={0}
            sx={{
              borderRadius: "0 0 14px 14px",
              border: `1px solid ${ORANGE_BORDER}`,
              borderTop: 0,
              bgcolor: "#fff",
            }}
          >
            <CardContent
              sx={{ p: { xs: "12px !important", sm: "20px 24px !important" } }}
            >
              {/* FROM → TO row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  pb: { xs: 1.25, sm: 2 },
                  mb: { xs: 1.25, sm: 2 },
                  borderBottom: `1px solid ${ORANGE_DIVIDER}`,
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{
                      color: ORANGE,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      fontSize: { xs: "0.58rem", sm: "0.68rem" },
                      mb: 0.3,
                    }}
                  >
                    FROM
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: "break-word",
                      fontSize: { xs: "0.78rem", sm: "0.95rem" },
                      lineHeight: 1.3,
                    }}
                  >
                    {/* {"\u{1F4CD}"} */}
                    {routeFrom || "—"}
                  </Typography>

                  {isFlight && (
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.68rem" },
                        color: "text.secondary",
                        mt: 0.25,
                      }}
                    >
                      {ride.fromCountry}
                    </Typography>
                  )}
                </Box>

                <ArrowForwardIcon
                  sx={{
                    color: ORANGE,
                    fontSize: { xs: 16, sm: 20 },
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ minWidth: 0, flex: 1, textAlign: "right" }}>
                  <Typography
                    sx={{
                      color: ORANGE,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      fontSize: { xs: "0.58rem", sm: "0.68rem" },
                      mb: 0.3,
                    }}
                  >
                    TO
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      wordBreak: "break-word",
                      fontSize: { xs: "0.78rem", sm: "0.95rem" },
                      lineHeight: 1.3,
                    }}
                  >
                    {/* {"\u{1F4CD}"}  */}
                    {routeTo || "—"}
                  </Typography>

                  {isFlight && (
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.68rem" },
                        color: "text.secondary",
                        mt: 0.25,
                      }}
                    >
                      {ride.toCountry}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Details grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
                  gap: { xs: "10px 8px", sm: "16px 24px" },
                  pb: { xs: 1.25, sm: 2 },
                  mb: { xs: 1.25, sm: 2 },
                  borderBottom: `1px solid ${ORANGE_DIVIDER}`,
                }}
              >
                {detailItems.map(({ label, icon, value }) => (
                  <Box key={label}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.68rem" },
                        color: "text.secondary",
                        mb: 0.4,
                      }}
                    >
                      {label}
                    </Typography>
                    <Stack direction="row" spacing={0.6} alignItems="center">
                      {icon}
                      <Typography
                        sx={{
                          fontSize: { xs: "0.65rem", sm: "0.85rem" },
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
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
                  {expanded ? (
                    <KeyboardArrowUpIcon
                      sx={{ fontSize: { xs: 18, sm: 22 } }}
                    />
                  ) : (
                    <KeyboardArrowDownIcon
                      sx={{ fontSize: { xs: 18, sm: 22 } }}
                    />
                  )}
                </IconButton>

                <Tooltip
                  title={
                    !isProfileComplete
                      ? "Complete your profile to 100% before requesting a ride."
                      : ""
                  }
                  arrow
                >
                  <Box component="span">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Tooltip
                        title={
                          !isProfileComplete
                            ? "Complete your profile to 100% before requesting a ride."
                            : ""
                        }
                        arrow
                      >
                        <Box component="span">
                          <Button
                            disabled={
                              genderMismatch ||
                              isRejected ||
                              isBlocked ||
                              !isProfileComplete ||
                              isFlightBookingClosed ||
                              (!isFlight &&
                                !alreadyRequested &&
                                remainingSeatsForUser <= 0)
                            }
                            onClick={() => {
                              setSelectedRide(ride);
                              setSelectedRequest(
                                alreadyRequested ? currentRequest : null,
                              );
                              setOpenEditModal(true);
                            }}
                            sx={{
                              bgcolor: isRejected || isBlocked ? "#D32F2F" : ORANGE,
                              color: "#ffffff",
                              "&:hover": {
                                bgcolor: isRejected || isBlocked ? "#D32F2F" : "#e68a00",
                              },
                              "&.Mui-disabled": {
                                bgcolor: isRejected || isBlocked ? "#EF9A9A" : "#e0e0e0",
                                color: "#ffffff",
                              },
                              fontWeight: 700,
                              fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              px: { xs: 1.2, sm: 3 },
                              py: { xs: 0.5, sm: 1 },
                              borderRadius: 2,
                              whiteSpace: "nowrap",
                              boxShadow: "none",
                              textTransform: "none",
                            }}
                          >
                            {genderMismatch
                              ? `Only ${ride.genderPreference} Allowed`
                              : isRejected
                                ? "Rejected"
                                : isBlocked ?
                                  "You Cancelled More Time"
                                  : isFlightBookingClosed
                                    ? "Companion Booking Closed"
                                    : alreadyRequested
                                      ? remainingSeatsForUser > 0
                                        ? `Edit Request (${remainingSeatsForUser} left)`
                                        : "View Request"
                                      : isFlight
                                        ? "Request Companion"
                                        : remainingSeatsForUser > 0
                                          ? `Request Seat (${remainingSeatsForUser} left)`
                                          : "No Seats Available"}
                          </Button>
                          {/* <Button
                    variant="contained"
                    size={isMobile ? "small" : "medium"}
                    disabled={!isProfileComplete || (!isFlight && remainingSeats <= 0)}
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
                    {!isFlight && remainingSeats <= 0
                      ? "No Seats"
                      : isFlight
                        ? "Request Companion"
                        : alreadyRequested
                          ? `Request More (${remainingSeats} left)`
                          : `Request Seat (${remainingSeats} left)`}
                  </Button> */}
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                {/* {myRequest && (
                  <Chip
                    label={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                            fontWeight: 600,
                            color: isAccepted ? "#2E7D32" : "#1565C0",
                          }}
                        >
                          {isAccepted
                            ? `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""
                            }`
                            : `You applied for ${requestedByMe} seat${requestedByMe > 1 ? "s" : ""
                            }`}
                        </Typography>

                        {isAccepted && pendingReqSeats > 0 && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: { xs: "0.65rem", sm: "0.7rem" },
                              fontWeight: 600,
                              color: "#F57C00",
                            }}
                          >
                            {`and ${pendingReqSeats} pending seat${pendingReqSeats > 1 ? "s" : ""
                              }`}
                          </Typography>
                        )}
                      </Box>
                    }
                    color={isAccepted ? "success" : "info"}
                    sx={{
                      height: { xs: 18, sm: 25 },
                      bgcolor: isAccepted ? "#E8F5E9" : "#E3F2FD",
                      "& .MuiChip-label": {
                        px: { xs: 0.5, sm: 1 },
                      },
                    }}
                  />
                )} */}
                {myRequest &&
                  (() => {
                    const isFlight = ride?.modeOfTravel === "Flight";

                    const mainText = isFlight
                      ? isAccepted
                        ? "You've been accepted for a companion"
                        : "You requested for a companion"
                      : isAccepted
                        ? `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""}`
                        : `You applied for ${requestedByMe} seat${requestedByMe > 1 ? "s" : ""}`;

                    const pendingText =
                      !isFlight && isAccepted && pendingReqSeats > 0
                        ? `and ${pendingReqSeats} pending seat${pendingReqSeats > 1 ? "s" : ""}`
                        : null;

                    return (
                      <Chip
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                fontWeight: 600,
                                color: isAccepted ? "#2E7D32" : "#1565C0",
                              }}
                            >
                              {mainText}
                            </Typography>

                            {pendingText && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                                  fontWeight: 600,
                                  color: "#F57C00",
                                }}
                              >
                                {pendingText}
                              </Typography>
                            )}
                          </Box>
                        }
                        color={isAccepted ? "success" : "info"}
                        sx={{
                          height: { xs: 18, sm: 25 },
                          bgcolor: isAccepted ? "#E8F5E9" : "#E3F2FD",
                          "& .MuiChip-label": {
                            px: { xs: 0.5, sm: 1 },
                          },
                        }}
                      />
                    );
                  })()}
              </Box>
              {/* Expanded details */}
              <Collapse in={expanded}>
                <Box
                  sx={{
                    mt: { xs: 1.25, sm: 2 },
                    p: { xs: 1.25, sm: 2 },
                    bgcolor: ORANGE_BG,
                    border: `1px solid ${ORANGE_BORDER}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.72rem" },
                      color: ORANGE,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      mb: 1,
                    }}
                  >
                    MORE DETAILS
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        sm: "repeat(3, 1fr)",
                      },
                      gap: { xs: "8px 8px", sm: "12px 20px" },
                    }}
                  >
                    {[
                      { label: "Status", value: ride.status },
                      {
                        label: "Age group pref",
                        value: ride.ageGroupPreference,
                      },
                      {
                        label: "Traveller Type",
                        value: ride.travellerType || "None",
                      },
                    ].map(({ label, value }) => (
                      <Box key={label}>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.58rem", sm: "0.65rem" },
                            color: "text.secondary",
                            mb: 0.25,
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: { xs: "0.72rem", sm: "0.82rem" },
                            fontWeight: 600,
                          }}
                        >
                          {value || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.65rem" },
                        color: "text.secondary",
                        mt: 1.5,
                        mb: 0.5,
                      }}
                    >
                      Language
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.72rem", sm: "0.82rem" },
                        fontWeight: 600,
                      }}
                    >
                      {` ${ride.language.join(", ")}  ` || "—"}
                    </Typography>
                  </Box>

                  {/* Description */}
                  {ride.description && (
                    <Box
                      sx={{
                        bgcolor: ORANGE_BG,
                        mt: 1,
                        // px: { xs: 1, sm: 2 }, py: { xs: 0.75, sm: 1.25 }, mb: { xs: 1.25, sm: 2 },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.82rem" },
                          color: "text.secondary",
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            // fontStyle: "italic",
                            fontWeight: 800,
                            fontSize: { xs: "0.75rem", sm: "0.75rem" },
                          }}
                        >
                          Description:
                        </Typography>{" "}
                        {ride.description}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1.25, borderColor: ORANGE_DIVIDER }} />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    flexWrap="wrap"
                    spacing={{ xs: 1, sm: 1.5 }}
                    sx={{
                      width: "100%",
                      alignItems: { xs: "space-between", sm: "center" },
                    }}
                  >
                    {ride.medicalAssistance && (
                      <Chip
                        size="small"
                        icon={
                          <MedicalServicesIcon
                            sx={{ fontSize: { xs: 11, sm: 13 } }}
                          />
                        }
                        label="Medical Help"
                        sx={{
                          fontSize: { xs: "0.58rem", sm: "0.7rem" },
                          bgcolor: "#FFF0DD",
                          color: "#7a4a00",
                        }}
                      />
                    )}

                    {ride.languageSupport && (
                      <Chip
                        size="small"
                        icon={
                          <LanguageIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />
                        }
                        label="Language Support"
                        sx={{
                          fontSize: { xs: "0.58rem", sm: "0.7rem" },
                          bgcolor: "#FFF0DD",
                          color: "#7a4a00",
                        }}
                      />
                    )}

                    {ride.transitHelp && (
                      <Chip
                        size="small"
                        icon={
                          <InfoOutlinedIcon
                            sx={{ fontSize: { xs: 12, sm: 14 } }}
                          />
                        }
                        label="Transit Help"
                        sx={{
                          fontSize: { xs: "0.58rem", sm: "0.7rem" },
                          bgcolor: "#FFF0DD",
                          color: "#7a4a00",
                        }}
                      />
                    )}

                    {ride.baggageHelp && (
                      <Chip
                        size="small"
                        icon={
                          <LuggageIcon sx={{ fontSize: { xs: 11, sm: 13 } }} />
                        }
                        label="Baggage Help"
                        sx={{
                          fontSize: { xs: "0.58rem", sm: "0.7rem" },
                          bgcolor: "#FFF0DD",
                          color: "#7a4a00",
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      )}

      <ProfileModal
        open={profileModalOpen}
        selectedProfile={selectedProfile}
        onClose={() => {
          setProfileModalOpen(false);
        }}
      />

      <Ridebook
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        ride={selectedRide}
        allMyRequests={myRequestedRides}
        setAllMyRequests={setMyRequestedRides}
        maxSeats={maxSeatsForDialog}
        remainingSeatsForUser={remainingSeatsForUser}
        totalSeat={totalSeat}
        requestToEdit={selectedRequest}
        onRequestUpdated={myReqRides}
      />
    </>
  );
}
