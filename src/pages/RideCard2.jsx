import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import Ridebook from "./Ridebook.jsx";
import ProfileModal from "./Avatar.jsx";
import RideDetailsModal from "./RideDetails.jsx";
import { useUser } from "../context/userConetext.jsx";
import { useRide } from "../context/RideContext";
import Api from "../Api";

const FONT = '"DM Sans", "Inter", "Segoe UI", Roboto, Arial, sans-serif';

const BRAND = "#B5440F";
const BRAND_HOVER = "#9A380B";

/* Responsive font scale: xs (phones) → sm (tablets) → md (laptops) → lg (large) */
const FS = {
    route: { xs: 11, sm: 12, md: 13, lg: 14 },
    subtitle: { xs: 9, sm: 10, md: 11, lg: 12 },
    chip: { xs: 8.5, sm: 9, md: 9.5, lg: 10 },
    date: { xs: 10, sm: 11, md: 11.5, lg: 12 },
    time: { xs: 9, sm: 9.5, md: 10, lg: 10.5 },
    button: { xs: 10, sm: 10.5, md: 11, lg: 11.5 },
    avatar: { xs: 10, sm: 11, md: 12 },
};

// chip palettes
const CHIP = {
    blue: { bg: "#C9E2FA", color: "#134F85" }, // mode of travel / flight companion
    green: { bg: "#C8EFD2", color: "#176128" }, // cost share / accepted
    slate: { bg: "#D3DEE9", color: "#2B4258" }, // seats, duration, airline, flight no.
    pink: { bg: "#F6C9E0", color: "#9A1F63" }, // women-only rides
    amber: { bg: "#F5DDB3", color: "#7A4200" }, // no seats
    red: { bg: "#F7C8C3", color: "#A82219" }, // rejected
    info: { bg: "#C6DDF5", color: "#0B54A8" }, // you requested / applied
};

const getRideId = (rideId) =>
    rideId && typeof rideId === "object" ? rideId._id : rideId;

export default function RideList({ ride, onIcanHelp }) {
    const { completion, currentUser } = useUser();
    const { refreshRide } = useRide();

    const [myRequestedRides, setMyRequestedRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedRideModal, setSelectedRideModal] = useState(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const storedUser = JSON.parse(localStorage.getItem("user"));

    const user = ride?.createdBy || {};
    const totalSeat = ride?.totalSeats;
    const isFlight = ride?.modeOfTravel === "Flight";
    const isProfileComplete = completion === 100;

    // Determine if this is an Offer (driving) or Request (needs a ride)
    // Checks standard 'type' field, common alternative 'intent' field, or defaults to Offer
    const rideType = (ride?.kind || "").toLowerCase();
    const isOffer = rideType === "offer";
    const isRequest = rideType === "request";

    /* ───────────── API ───────────── */
    const myReqRides = async () => {
        try {
            const res = await axios.get(
                `${Api}/bookride/${storedUser?.id}?type=requested`,
            );
            if (res.data.success) setMyRequestedRides(res.data.data || []);
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        myReqRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshRide]);

    /* ───────────── Display values ───────────── */
    const userName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Saathi User";
    const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`;
    const userProfile = user?.profileImageUrl;

    const routeFrom = isFlight ? ride.fromAirport || ride.from : ride.from;
    const routeTo = isFlight ? ride.toAirport || ride.destination : ride.destination;

    const dateObj = ride.startTime ? new Date(ride.startTime) : null;
    const dateStr = dateObj
        ? dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        })
        : "No date";
    const timeStr = dateObj
        ? dateObj.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
        : "";

    const languages = Array.isArray(ride?.createdBy?.language)
        ? ride.createdBy?.language.join(", ")
        : "";

    /* ───────────── Request state ───────────── */
    const pendingRequest = myRequestedRides.find(
        (item) => getRideId(item.rideId) === ride._id,
    );
    const pendingReqSeats = pendingRequest?.pendingReqSeats ?? 0;

    const currentRequest = myRequestedRides.find(
        (req) => getRideId(req.rideId) === ride._id && req.status !== "CANCELLED",
    );
    const alreadyRequested = !!currentRequest;

    const myRequest = currentRequest;
    const isRejected = myRequest?.status === "REJECTED";
    const isAccepted = myRequest?.status === "ACCEPTED";
    const requestedByMe = Number(myRequest?.seatsRequested || 0);
    const approvedSeats = myRequest?.approvedSeats || 0;

    const cancelledRequestCount = myRequestedRides.filter(
        (item) =>
            getRideId(item.rideId)?.toString() === ride._id?.toString() &&
            item.requestedBy?.toString() === currentUser?._id?.toString() &&
            item.status === "CANCELLED",
    ).length;
    const isBlocked = cancelledRequestCount >= 3;

    const pendingSeatsByMe = isAccepted ? 0 : requestedByMe;
    const remainingSeatsForUser = isFlight
        ? 1
        : Math.max(Number(ride.availableSeats || 0) - pendingSeatsByMe, 0);
    const noSeats = !isFlight && remainingSeatsForUser <= 0;

    const maxSeatsForDialog = isFlight
        ? Infinity
        : alreadyRequested
            ? remainingSeatsForUser + Number(currentRequest?.seatsRequested || 0)
            : remainingSeatsForUser;

    const genderMismatch =
        ride.genderPreference &&
        ride.genderPreference !== "Any" &&
        ride.genderPreference !== currentUser?.gender;

    // Flight companion booking closes 2 hours before departure
    const isFlightBookingClosed =
        isFlight &&
        dateObj &&
        new Date() >= new Date(dateObj.getTime() - 2 * 60 * 60 * 1000);

    /* ───────────── Subtitle ───────────── */
    const subtitle = [
        userName,
        isFlight ? "Flight companion" : ride.modeOfTravel,
        languages,
    ]
        .filter(Boolean)
        .join(" · ");

    /* ───────────── Chips ───────────── */
    const durationText =
        ride?.duration != null
            ? ride.duration >= 60
                ? `${Math.floor(ride.duration / 60)} hr ${ride.duration % 60} min`
                : `${ride.duration} min`
            : null;
    const chips = [];

    if (isFlight) {
        chips.push({
            label: "Flight companion",
            ...CHIP.blue,
        });

        if (ride.airlineName) {
            chips.push({
                label: ride.airlineName,
                ...CHIP.slate,
            });
        }

        if (ride.flightNumber) {
            chips.push({
                label: `Flight ${ride.flightNumber}`,
                ...CHIP.slate,
            });
        }
    } else {

        if (ride.kind === "offer") {
            chips.push({
                label: "Offer",
                ...CHIP.green,
            });
        } else if (ride.kind === "request") {
            chips.push({
                label: "Request",
                ...CHIP.amber,
            });
        }

        if (ride.modeOfTravel) {
            chips.push({
                label: ride.modeOfTravel,
                ...CHIP.blue,
            });
        }

        if (ride.category) {
            chips.push({
                label: ride.category,
                ...CHIP.blue,
            });
        }

        // Show Women Only chip only when womenOnly is true
        if (ride.womenOnly === true) {
            chips.push({
                label: "Women riders only",
                ...CHIP.pink,
            });
        }

        if (ride.childFriendly === true) {
            chips.push({
                label: "Child Friendly",
                ...CHIP.amber,
            });
        }

        if (Number(ride.costPerSeat) === 0) {
            chips.push({
                label: "Free",
                ...CHIP.green,
            });
        } else if (Number(ride.costPerSeat) > 0) {
            chips.push({
                label: `Cost share $${ride.costPerSeat}`,
                ...CHIP.green,
            });
        }

        chips.push(
            noSeats
                ? {
                    label: "No seats",
                    ...CHIP.amber,
                }
                : {
                    label: `${remainingSeatsForUser} seat${remainingSeatsForUser > 1 ? "s" : ""}${totalSeat ? ` of ${totalSeat}` : ""}`,
                    ...CHIP.slate,
                },
        );

        if (ride.luggageSpace) {
            chips.push({
                label: ride.luggageSpace,
                ...CHIP.blue,
            });
        }
    }

    if (durationText) {
        chips.push({
            label: durationText,
            ...CHIP.slate,
        });
    }

    // if (ride.genderPreference === "Female") {
    //     chips.push({
    //         label: "Women riders only",
    //         ...CHIP.pink,
    //     });
    // } else if (ride.genderPreference === "Male") {
    //     chips.push({
    //         label: "Men riders only",
    //         ...CHIP.slate,
    //     });
    // }

    if (isRejected) {
        chips.push({
            label: "Rejected",
            ...CHIP.red,
        });
    }

    if (myRequest && !isRejected) {
        const mainText = isFlight
            ? isAccepted
                ? "You've been accepted for a companion"
                : "You requested a companion"
            : isAccepted
                ? `You have ${approvedSeats} approved seat${approvedSeats > 1 ? "s" : ""}`
                : `You applied for ${requestedByMe} seat${requestedByMe > 1 ? "s" : ""}`;

        const pendingText =
            !isFlight && isAccepted && pendingReqSeats > 0
                ? ` and ${pendingReqSeats} pending`
                : "";

        chips.push({
            label: `${mainText}${pendingText}`,
            ...(isAccepted ? CHIP.green : CHIP.info),
        });
    }

    /* ───────────── Button Logic ───────────── */
    const isDanger = isRejected || isBlocked;

    const buttonDisabled =
        genderMismatch ||
        isRejected ||
        isBlocked ||
        !isProfileComplete ||
        isFlightBookingClosed ||
        // Only check seat availability for Offers, not Requests
        (isOffer && !isFlight && !alreadyRequested && remainingSeatsForUser <= 0) ||
        (isRequest && alreadyRequested);

    // console.log(
    //     genderMismatch, "genderMismatch",
    //     isRejected, "isRejected",
    //     isBlocked, "isBlocked",
    //     isProfileComplete, "isProfileComplete",
    //     isFlightBookingClosed, "isFlightBookingClosed",
    //     isFlight, "isFlight",
    //     alreadyRequested, "alreadyRequested",
    //     remainingSeatsForUser, "remainingSeatsForUser",
    //     isRequest, "isRequest",
    //     isOffer, "isOffer",              // <- add this for clarity
    //     buttonDisabled, "buttonDisabled" // <- add this to verify the result
    // );

    // Base label based on type
    let baseLabel = isOffer ? "Request seat" : "I can drive";

    let buttonLabel;
    if (genderMismatch) {
        buttonLabel = `Only ${ride.genderPreference} allowed`;
    } else if (isRejected) {
        buttonLabel = "Rejected";
    } else if (isBlocked) {
        buttonLabel = "You cancelled too many times";
    } else if (isFlightBookingClosed) {
        buttonLabel = "Booking closed";
    } else if (alreadyRequested) {
        if (isOffer) {
            buttonLabel = remainingSeatsForUser > 0
                ? `Edit request (${remainingSeatsForUser} left)`
                : "View request";
        } else {
            buttonLabel = "View request";
        }
    } else if (isFlight) {
        buttonLabel = "Request companion";
    } else if (!isOffer && !isRequest) {
        // fallback
        buttonLabel = "Request seat";
    } else if (isOffer && remainingSeatsForUser <= 0) {
        buttonLabel = "No seats available";
    } else {
        buttonLabel = baseLabel;
    }

    const handleButtonClick = (event) => {
        event.stopPropagation();

        // A request card's action means "I can help", so open the parent
        // Offer Ride flow with this request prefilled. Keep Request seat on
        // offer cards routed through the existing Ridebook modal.
        if (isRequest) {
            if (typeof onIcanHelp === "function") {
                onIcanHelp(ride);
            }
            return;
        }

        setSelectedRide(ride);
        setSelectedRequest(alreadyRequested ? currentRequest : null);
        setOpenEditModal(true);
    };

    if (ride.travelStatus === "Cancelled") return null;

    return (
        <>
            <Box sx={{ width: "100%", mb: { xs: 0.75, sm: 1, md: 1.25 } }}>
                <Paper
                    elevation={0}
                    onClick={() => setSelectedRideModal(ride)}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "stretch",
                        gap: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 1, sm: 1.5, md: 2 },
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: { xs: "8px", md: "10px" },
                        border: "1px solid #E6E6E6",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        bgcolor: "#fff",
                        fontFamily: FONT,
                        cursor: "pointer",
                        overflow: "hidden",
                    }}
                >
                    {/* Avatar */}
                    <Avatar
                        src={userProfile || ""}
                        alt={userName}
                        onClick={(event) => {
                            event.stopPropagation();
                            setSelectedProfile(user);
                            setProfileModalOpen(true);
                        }}
                        sx={{
                            width: { xs: 28, sm: 32, md: 36 },
                            height: { xs: 28, sm: 32, md: 36 },
                            bgcolor: "#FDE5D0",
                            color: "#C2531B",
                            fontSize: FS.avatar,
                            fontWeight: 600,
                            fontFamily: FONT,
                            flexShrink: 0,
                            cursor: "pointer",
                        }}
                    >
                        {initials}
                    </Avatar>

                    {/* Left: full ride name, subtitle, chips (clipped) */}
                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.25,
                        }}
                    >
                        {/* full ride name – wraps, never truncated */}
                        <Typography
                            sx={{
                                fontFamily: FONT,
                                fontSize: FS.route,
                                fontWeight: 700,
                                color: "#1A1A1A",
                                lineHeight: 1.3,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                            }}
                        >
                            {isRequest && "Looking for : "}
                            {`${routeFrom || "—"} → ${routeTo || "—"}`}
                        </Typography>

                        <Typography
                            noWrap
                            sx={{
                                fontFamily: FONT,
                                fontSize: FS.subtitle,
                                color: "#6B6B6B",
                                lineHeight: 2.5,
                            }}
                        >
                            {subtitle}
                        </Typography>

                        {/* chips: single row, overflow hidden */}
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                mt: 0.5,
                                gap: { xs: 0.55, md: 0.85 },
                                width: "100%",
                                minWidth: 0,
                            }}
                        >
                            {chips.map((chip) => (
                                <Chip
                                    key={chip.label}
                                    label={chip.label}
                                    size="small"
                                    sx={{
                                        flexShrink: 1,
                                        minWidth: 0,
                                        maxWidth: { xs: 120, sm: 150, md: 180 },
                                        height: { xs: 16, sm: 18, md: 20 },
                                        borderRadius: "10px",
                                        bgcolor: chip.bg,
                                        color: chip.color,
                                        fontFamily: FONT,
                                        fontSize: FS.chip,
                                        fontWeight: 500,
                                        "& .MuiChip-label": {
                                            display: "block",
                                            minWidth: 0,
                                            px: { xs: 0.75, md: 1 },
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Right: date top-right, button bottom-right */}
                    <Box
                        sx={{
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: 0.75,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: FONT,
                                    fontSize: FS.date,
                                    fontWeight: 700,
                                    color: "#1A1A1A",
                                    lineHeight: 1.3,
                                }}
                            >
                                {dateStr}
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: FONT,
                                    fontSize: FS.time,
                                    color: "#6B6B6B",
                                    lineHeight: 1.3,
                                }}
                            >
                                {timeStr} {ride?.timeZone?.match(/\(([^)]+)\)/)?.[1]}
                            </Typography>
                        </Box>

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
                                    variant="contained"
                                    disableElevation
                                    disabled={buttonDisabled}
                                    onClick={handleButtonClick}
                                    sx={{
                                        px: { xs: 1, sm: 1.5, md: 2 },
                                        py: { xs: 0.35, md: 0.5 },
                                        minHeight: 0,
                                        minWidth: 0,
                                        borderRadius: "6px",
                                        textTransform: "none",
                                        fontFamily: FONT,
                                        fontSize: FS.button,
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                        whiteSpace: "nowrap",
                                        color: isDanger || isOffer ? "#fff" : BRAND,
                                        border: isOffer ? "none" : `1px solid ${BRAND}`,
                                        bgcolor: isDanger ? "#D32F2F" : isOffer ? BRAND : "#ffffffff",

                                        "&:hover": {
                                            bgcolor: isDanger ? "#D32F2F" : isOffer ? BRAND_HOVER : "#FDF0E8",
                                            // Ensure text remains visible on hover
                                            color: isDanger || isOffer ? "#fff" : BRAND,
                                        },

                                        "&.Mui-disabled": {
                                            bgcolor: isDanger ? "#EF9A9A" : isOffer ? "#E0E0E0" : "#F5F5F5",
                                            color: isDanger || isOffer ? "#fff" : "#A0A0A0",
                                            border: isOffer ? "none" : "1px solid #E0E0E0",
                                        },
                                    }}
                                >
                                    {buttonLabel}
                                </Button>
                            </Box>
                        </Tooltip>
                    </Box>
                </Paper>
            </Box>

            <ProfileModal
                open={profileModalOpen}
                selectedProfile={selectedProfile}
                onClose={() => setProfileModalOpen(false)}
            />

            {selectedRideModal && (
                <RideDetailsModal
                    onClose={() => setSelectedRideModal(null)}
                    ride={selectedRideModal}
                />
            )}

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