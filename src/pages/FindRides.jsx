import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Chip,
  Collapse,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  DialogActions,
} from "@mui/material";

import { useUser } from "../context/userConetext";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

import RideCard from "./RideCard.jsx";
import Api from "../Api";

// ─────────────────────────────────────────────
// Saffron design tokens
// ─────────────────────────────────────────────

const saffron = {
  50: "#FFF8EE",
  100: "#FFE9C2",
  200: "#FFD492",
  300: "#FFC05C",
  400: "#FFAB28",
  500: "#F59300",
  600: "#D47A00",
  700: "#A85F00",
  800: "#7C4500",
  900: "#502C00",
};

const ORANGE = "#FF9933";

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.82rem",
    background: saffron[50],

    "& fieldset": {
      borderColor: saffron[200],
    },

    "&:hover fieldset": {
      borderColor: saffron[400],
    },

    "&.Mui-focused fieldset": {
      borderColor: saffron[500],
      borderWidth: 2,
    },
  },

  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",
    color: saffron[600],
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: saffron[600],
  },
};

const selectSx = {
  borderRadius: "10px",
  fontSize: "0.82rem",
  background: saffron[50],

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: saffron[200],
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: saffron[400],
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: saffron[500],
    borderWidth: 2,
  },
};

const TRANSPORT_OPTIONS = [
  {
    label: "All",
    value: "",
    icon: null,
  },
  {
    label: "Car",
    value: "Car",
    icon: <DirectionsCarIcon sx={{ fontSize: 14 }} />,
  },
  {
    label: "Bike",
    value: "Bike",
    icon: <TwoWheelerIcon sx={{ fontSize: 14 }} />,
  },
  {
    label: "Bus",
    value: "Bus",
    icon: <DirectionsBusIcon sx={{ fontSize: 14 }} />,
  },
  {
    label: "Train",
    value: "Train",
    icon: <TrainIcon sx={{ fontSize: 14 }} />,
  },
  {
    label: "Flight",
    value: "Flight",
    icon: <FlightIcon sx={{ fontSize: 14 }} />,
  },
];

const GENDER_OPTIONS = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Any",
    value: "Any",
  },
];

const FUEL_OPTIONS = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Yes",
    value: "true",
  },
  {
    label: "No",
    value: "false",
  },
];

const NAVBAR_HEIGHT = 64;

const SCROLL_COLLAPSE_THRESHOLD = 24;

const emptyFilters = {
  transportMode: "",
  gender: "",
  fuelSharing: "",
  language: "",
};

export default function FindRides() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { currentUser, completion } = useUser();

  const navigate = useNavigate();

  const [rides, setRides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 10;

  const loadingMoreRef = useRef(false);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [search, setSearch] = useState("");

  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const isProfileComplete = completion === 100;

  const SIDEBAR_SCROLL_HEIGHT = "calc(100vh - 120px)";

  const [profileGateOpen, setProfileGateOpen] = useState(false);

  const hasCheckedProfileGateRef = useRef(false);

  // ─────────────────────────────────────────────
  // Current user's GPS location
  // ─────────────────────────────────────────────

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const token = localStorage.getItem('token')
  const resultsRef = useRef(null);
  const scrollStartRef = useRef(0);


  // ─────────────────────────────────────────────
  // Fetch rides
  // ─────────────────────────────────────────────



  const {
    transportMode,
    gender,
    fuelSharing,
    language,
  } = draftFilters;

  const {
    transportMode: appliedTransportMode,
    gender: appliedGender,
    fuelSharing: appliedFuelSharing,
    language: appliedLanguage,
  } = appliedFilters;

  const fetchRides = async ({
    pageNumber = 1,
    reset = false,
    searchFromValue = searchFrom,
    searchDestinationValue = searchDestination,
    searchValue = search,
    transportModeValue = appliedTransportMode,
    genderValue = appliedGender,
    fuelSharingValue = appliedFuelSharing,
    languageValue = appliedLanguage,
  } = {}) => {
    if (loadingMoreRef.current) {
      return;
    }

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      loadingMoreRef.current = true;

      const res = await axios.get(`${Api}/rides/get`, {
        params: {
          type: "find",

          page: pageNumber,
          limit: LIMIT,

          searchFrom: searchFromValue,
          searchDestination: searchDestinationValue,
          search: searchValue,

          transportMode: transportModeValue,
          gender: genderValue,
          fuelSharing: fuelSharingValue,
          language: languageValue,
        },

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body = res?.data || {};

      const newRides = Array.isArray(body.data)
        ? body.data
        : [];

      console.log(
        `Find Rides page ${pageNumber}:`,
        newRides
      );

      setRides((prev) => {
        if (reset) {
          return newRides;
        }

        const existingIds = new Set(
          prev.map((ride) => String(ride?._id))
        );

        const uniqueRides = newRides.filter(
          (ride) =>
            !existingIds.has(String(ride?._id))
        );

        return [...prev, ...uniqueRides];
      });

      setPage(pageNumber);

      setHasMore(
        typeof body.hasMore === "boolean"
          ? body.hasMore
          : newRides.length === LIMIT
      );

    } catch (error) {
      console.error(
        "Find rides error:",
        error?.response?.data || error
      );
    } finally {
      loadingMoreRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRides({
      pageNumber: 1,
      reset: true,
    });
  }, []);

  const isFirstFilterRender = useRef(true);

  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setRides([]);
      setPage(1);
      setHasMore(true);

      fetchRides({
        pageNumber: 1,
        reset: true,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    searchFrom,
    searchDestination,
    search,
    appliedTransportMode,
    appliedGender,
    appliedFuelSharing,
    appliedLanguage,
  ]);



  // ─────────────────────────────────────────────
  // Distance calculation
  // ─────────────────────────────────────────────

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (
      lat1 == null ||
      lon1 == null ||
      lat2 == null ||
      lon2 == null
    ) {
      return Infinity;
    }

    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  // ─────────────────────────────────────────────
  // Request current location
  // ─────────────────────────────────────────────

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation(null);
      setLocationLoading(false);
      setLocationError(
        "Location is not supported by this browser."
      );

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        console.log(
          "CURRENT USER GPS LOCATION:",
          location
        );

        setUserLocation(location);
        setLocationLoading(false);
        setLocationError("");
      },

      (error) => {
        console.error(
          "GPS LOCATION ERROR:",
          error
        );

        setUserLocation(null);
        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission is denied. Please allow location access."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location Services are turned off. Please turn them on."
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setLocationError(
              "Unable to get your current location."
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Request GPS once when Find Rides opens
  useEffect(() => {
    requestCurrentLocation();
  }, []);

  // ─────────────────────────────────────────────
  // NEW:
  // Open People Near You page
  // ─────────────────────────────────────────────

  const handlePeopleNearby = () => {
    navigate("/people-nearby");
  };

  // ─────────────────────────────────────────────
  // Get ride coordinates
  // ─────────────────────────────────────────────

  const getRideCoordinates = (ride) => {
    const fromLatitude = Number(
      ride?.fromLocation?.latitude
    );

    const fromLongitude = Number(
      ride?.fromLocation?.longitude
    );

    if (
      Number.isFinite(fromLatitude) &&
      Number.isFinite(fromLongitude)
    ) {
      return {
        latitude: fromLatitude,
        longitude: fromLongitude,
      };
    }

    const directLatitude = Number(
      ride?.fromLatitude
    );

    const directLongitude = Number(
      ride?.fromLongitude
    );

    if (
      Number.isFinite(directLatitude) &&
      Number.isFinite(directLongitude)
    ) {
      return {
        latitude: directLatitude,
        longitude: directLongitude,
      };
    }

    const coordinates =
      ride?.fromLocation?.coordinates;

    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2
    ) {
      const longitude = Number(coordinates[0]);
      const latitude = Number(coordinates[1]);

      if (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
      ) {
        return {
          latitude,
          longitude,
        };
      }
    }

    return null;
  };

  const getRideDistanceKm = (ride) => {
    if (!userLocation) {
      return Infinity;
    }

    const rideCoordinates =
      getRideCoordinates(ride);

    if (!rideCoordinates) {
      return Infinity;
    }

    return calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      rideCoordinates.latitude,
      rideCoordinates.longitude
    );
  };

  // ─────────────────────────────────────────────
  // Profile completion gate
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (hasCheckedProfileGateRef.current) {
      return;
    }

    if (
      currentUser &&
      currentUser._id &&
      typeof completion === "number"
    ) {
      hasCheckedProfileGateRef.current = true;

      setProfileGateOpen(
        completion !== 100
      );
    }
  }, [currentUser, completion]);

  const handleCloseProfileGate = () => {
    setProfileGateOpen(false);
  };

  // ─────────────────────────────────────────────
  // Filters
  // ─────────────────────────────────────────────

  const openFilters = () => {
    scrollStartRef.current =
      resultsRef.current
        ? resultsRef.current.scrollTop
        : 0;

    setFiltersOpen(true);
  };

  const closeFilters = () => {
    setFiltersOpen(false);
  };

  const toggleFilters = () => {
    if (filtersOpen) {
      closeFilters();
    } else {
      openFilters();
    }
  };

  const handleResultsScroll = (e) => {
    const element = e.currentTarget;

    // ----------------------------------------
    // Close filters when user starts scrolling
    // ----------------------------------------
    if (filtersOpen) {
      const delta = Math.abs(
        element.scrollTop - scrollStartRef.current
      );

      if (delta > SCROLL_COLLAPSE_THRESHOLD) {
        closeFilters();
      }
    }

    // ----------------------------------------
    // Infinite scroll
    // ----------------------------------------
    const distanceFromBottom =
      element.scrollHeight -
      element.scrollTop -
      element.clientHeight;

    if (
      distanceFromBottom <= 300 &&
      hasMore &&
      !loadingMoreRef.current
    ) {
      console.log(
        "🔥 Near bottom. Loading page:",
        page + 1
      );

      fetchRides({
        pageNumber: page + 1,
        reset: false,
      });
    }
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    closeFilters();
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const updateDraft = (
    key,
    value
  ) => {
    setDraftFilters((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (
        key === "transportMode" &&
        value !== "Flight"
      ) {
        next.language = "";
      }

      return next;
    });
  };

  const activeFilters = [
    appliedTransportMode && {
      key: "transport",

      label: appliedTransportMode,

      clear: () => {
        const next = {
          ...appliedFilters,
          transportMode: "",
          language: "",
        };

        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },

    appliedGender && {
      key: "gender",

      label: appliedGender,

      clear: () => {
        const next = {
          ...appliedFilters,
          gender: "",
        };

        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },

    appliedFuelSharing !== "" && {
      key: "fuel",

      label: `Fuel: ${appliedFuelSharing === "true"
        ? "Yes"
        : "No"
        }`,

      clear: () => {
        const next = {
          ...appliedFilters,
          fuelSharing: "",
        };

        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },

    appliedLanguage && {
      key: "lang",

      label: `Lang: ${appliedLanguage}`,

      clear: () => {
        const next = {
          ...appliedFilters,
          language: "",
        };

        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
  ].filter(Boolean);

  // ─────────────────────────────────────────────
  // Filter rides
  // ─────────────────────────────────────────────

  const now = new Date();


  const visibleRides = rides;

  // ─────────────────────────────────────────────
  // Sort rides by distance
  // ─────────────────────────────────────────────

  const sortedVisibleRides =
    useMemo(() => {
      return [...visibleRides].sort(
        (a, b) => {
          if (userLocation) {
            const distanceA =
              getRideDistanceKm(a);

            const distanceB =
              getRideDistanceKm(b);

            const validA =
              Number.isFinite(
                distanceA
              );

            const validB =
              Number.isFinite(
                distanceB
              );

            if (
              validA &&
              !validB
            ) {
              return -1;
            }

            if (
              !validA &&
              validB
            ) {
              return 1;
            }

            if (
              validA &&
              validB &&
              distanceA !== distanceB
            ) {
              return (
                distanceA - distanceB
              );
            }
          }

          return (
            new Date(a.startTime).getTime() -
            new Date(b.startTime).getTime()
          );
        }
      );
    }, [
      visibleRides,
      userLocation,
    ]);

  const formatDistance = (
    distanceKm
  ) => {
    if (
      !Number.isFinite(distanceKm)
    ) {
      return null;
    }

    if (distanceKm < 1) {
      return `${Math.round(
        distanceKm * 1000
      )} m`;
    }

    return `${distanceKm.toFixed(
      1
    )} km`;
  };

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  // if (loading) {
  //   return (
  //     <Box
  //       sx={{
  //         minHeight: "100vh",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <CircularProgress
  //         sx={{
  //           color: saffron[500],
  //         }}
  //       />
  //     </Box>
  //   );
  // }

  return (
    <>

      <Dialog
        open={profileGateOpen}
        onClose={(event, reason) => {
          if (
            reason === "backdropClick"
          ) {
            return;
          }

          handleCloseProfileGate();
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: {
              xs: 2,
              sm: 3,
            },

            m: {
              xs: 1.5,
              sm: 2,
            },

            width: {
              xs: "95%",
              sm: "100%",
            },

            textAlign: "center",

            p: {
              xs: 1,
              sm: 1.5,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
            fontSize: {
              xs: "1rem",
              sm: "1.15rem",
            },
            pt: 3,
          }}
        >
          <WarningAmberRoundedIcon
            sx={{
              fontSize: 40,
              color: "#E8650A",
            }}
          />

          Complete Your Profile
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
              },

              color: "text.secondary",
            }}
          >
            Your profile is only{" "}
            {Number.isFinite(completion)
              ? completion
              : 0}
            % complete. Please complete
            your profile to 100% to unlock
            all features, including
            posting, liking, commenting and
            saving in the Community.
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              px: {
                xs: 1,
                sm: 3,
              },
            }}
          >
            <LinearProgress
              variant="determinate"
              value={
                Number.isFinite(completion)
                  ? completion
                  : 0
              }
              sx={{
                height: 8,
                borderRadius: 5,
                bgcolor: "#F0E6DC",

                "& .MuiLinearProgress-bar":
                {
                  bgcolor: "#E8650A",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            pb: 3,
            pt: 1,
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={
              handleCloseProfileGate
            }
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              fontWeight: 600,
              bgcolor: "#FF9933",
              color: "#fff",

              "&:hover": {
                bgcolor: "#FF9933",
                color: "#fff",
              },
            }}
          >
            OK
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              navigate(
                "/user-profile",
                {
                  state: {
                    openEditProfile: true,
                  },
                }
              );
            }}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              fontWeight: 600,
              bgcolor: "#FF9933",
              color: "#fff",

              "&:hover": {
                bgcolor: "#FF9933",
                color: "#fff",
              },
            }}
          >
            Update profile
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,

          display: "flex",
          flexDirection: "column",

          width: "100%",

          boxSizing: "border-box",

          overflowX: "hidden",

          p: 1,
        }}
      >
        {/* ──────────────────────────────────────
            Sticky header
        ─────────────────────────────────────── */}

        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              color: "#000000",

              pt: {
                xs: 1,
                sm: 2,
                md: 5,
              },

              pb: {
                xs: 0,
                sm: 2,
                md: 3,
              },
            }}
          >
            <Container
              disableGutters
            >
              {/* ───────────────────────────────
                  Page title
              ─────────────────────────────── */}

              <Typography
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "1rem",
                    sm: "1.45rem",
                    md: "1.8rem",
                  },

                  letterSpacing:
                    "0.3px",

                  lineHeight: 1.2,
                }}
              >
                Find Rides & Flight
                Companions
              </Typography>

              {/* ───────────────────────────────
                  Location + People Near You
              ─────────────────────────────── */}

              <Box
                sx={{
                  mt: 1,
                  mb: 0.5,

                  display: "flex",

                  alignItems:
                    "center",

                  gap: 1,

                  flexWrap: "wrap",
                }}
              >
                {/* Enable Location */}

                <Button
                  onClick={
                    requestCurrentLocation
                  }
                  disabled={
                    locationLoading
                  }
                  startIcon={
                    <LocationOnIcon
                      sx={{
                        fontSize:
                          "18px !important",

                        color:
                          userLocation
                            ? "#2E7D32"
                            : "#E8650A",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 30,

                    px: 1.5,

                    borderRadius: 999,

                    textTransform:
                      "none",

                    fontSize: {
                      xs: "0.72rem",
                      sm: "0.78rem",
                    },

                    fontWeight: 600,

                    color:
                      userLocation
                        ? "#2E7D32"
                        : "#E8650A",

                    background:
                      userLocation
                        ? "#EAF6EC"
                        : "#FFF4E8",

                    border: `1px solid ${userLocation
                      ? "#A5D6A7"
                      : "#FFD09B"
                      }`,

                    boxShadow: "none",

                    "&:hover": {
                      background:
                        userLocation
                          ? "#E0F2E3"
                          : "#FFEBD7",

                      boxShadow: "none",
                    },
                  }}
                >
                  {locationLoading
                    ? "Getting location..."
                    : userLocation
                      ? "Location Enabled"
                      : "Enable Location"}
                </Button>

                {/* ─────────────────────────────
                    NEW: People Near You
                ───────────────────────────── */}

                <Button
                  onClick={
                    handlePeopleNearby
                  }
                  startIcon={
                    <PeopleAltIcon
                      sx={{
                        fontSize:
                          "17px !important",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 30,

                    px: 1.5,

                    borderRadius: 999,

                    textTransform:
                      "none",

                    fontSize: {
                      xs: "0.72rem",
                      sm: "0.78rem",
                    },

                    fontWeight: 700,

                    color: "#E8650A",

                    background:
                      "#FFF",

                    border:
                      "1px solid #FFD09B",

                    boxShadow: "none",

                    "&:hover": {
                      background:
                        "#FFF4E8",

                      borderColor:
                        "#FFAB28",

                      boxShadow: "none",
                    },
                  }}
                >
                  People Near You
                </Button>

                {/* Location error */}

                {!userLocation &&
                  !locationLoading &&
                  locationError && (
                    <Typography
                      sx={{
                        width: {
                          xs: "100%",
                          sm: "auto",
                        },

                        fontSize: {
                          xs: "0.68rem",
                          sm: "0.75rem",
                        },

                        color: "#D32F2F",
                      }}
                    >
                      {locationError}
                    </Typography>
                  )}
              </Box>

              {/* ───────────────────────────────
                  General search
              ─────────────────────────────── */}

              <Box
                sx={{
                  display: "flex",
                  gap: {
                    xs: 0.7,
                    sm: 1.25,
                  },

                  alignItems:
                    "center",

                  flexDirection: "row",

                  mt: {
                    xs: 2.3,
                    sm: 1.5,
                  },
                }}
              >
                <TextField
                  size="small"

                  placeholder="Search by From / To / Airport / City..."

                  value={search}

                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            color:
                              saffron[500],

                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}

                  sx={{
                    flex: 1,

                    minWidth: 0,

                    "& .MuiOutlinedInput-root":
                    {
                      borderRadius:
                        "12px",

                      background:
                        "rgba(255,255,255,0.96)",

                      fontSize: {
                        xs: "0.65rem",
                        sm: "0.84rem",
                      },

                      height: {
                        xs: 32,
                        sm: 40,
                      },

                      "& fieldset": {
                        border: "none",
                      },

                      "& input": {
                        py: 0,

                        px: {
                          xs: 1,
                          sm: 1,
                        },
                      },

                      "& .MuiInputAdornment-root":
                      {
                        ml: {
                          xs: 0.75,
                          sm: 1,
                        },

                        mr: {
                          xs: 0.25,
                          sm: 0.5,
                        },
                      },
                    },
                  }}
                />
              </Box>

              {/* ───────────────────────────────
                  From / To / Filters / Requests
              ─────────────────────────────── */}

              <Box
                sx={{
                  display: "flex",

                  gap: {
                    xs: 1,
                    sm: 1.25,
                  },

                  alignItems:
                    "center",

                  flexDirection: "row",

                  mt: {
                    xs: 2,
                    sm: 1.5,
                  },

                  mb: {
                    xs: 1,
                    sm: 1,
                  },
                }}
              >
                {/* From */}

                <TextField
                  size="small"

                  placeholder={
                    isMobile
                      ? "From"
                      : "From / City / Airport"
                  }

                  value={searchFrom}

                  onChange={(e) =>
                    setSearchFrom(
                      e.target.value
                    )
                  }

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            color:
                              saffron[500],

                            fontSize: {
                              xs: 14,
                              sm: 17,
                            },
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}

                  sx={{
                    flex: 1,

                    minWidth: 0,

                    "& .MuiOutlinedInput-root":
                    {
                      borderRadius:
                        "12px",

                      background:
                        "rgba(255,255,255,0.96)",

                      fontSize: {
                        xs: "0.65rem",
                        sm: "0.84rem",
                      },

                      height: {
                        xs: 34,
                        sm: 40,
                      },

                      "& fieldset": {
                        border: "none",
                      },

                      "& input": {
                        py: 0,

                        px: {
                          xs: 1,
                          sm: 1,
                        },
                      },

                      "& .MuiInputAdornment-root":
                      {
                        ml: {
                          xs: 0.75,
                          sm: 1,
                        },

                        mr: {
                          xs: 0.25,
                          sm: 0.5,
                        },
                      },
                    },
                  }}
                />

                {/* To */}

                <TextField
                  size="small"

                  placeholder={
                    isMobile
                      ? "To"
                      : "To / City / Airport"
                  }

                  value={
                    searchDestination
                  }

                  onChange={(e) =>
                    setSearchDestination(
                      e.target.value
                    )
                  }

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            color:
                              saffron[500],

                            fontSize: {
                              xs: 12,
                              sm: 17,
                            },
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}

                  sx={{
                    flex: 1,

                    minWidth: 0,

                    "& .MuiOutlinedInput-root":
                    {
                      borderRadius:
                        "12px",

                      background:
                        "rgba(255,255,255,0.96)",

                      fontSize: {
                        xs: "0.65rem",
                        sm: "0.84rem",
                      },

                      height: {
                        xs: 34,
                        sm: 40,
                      },

                      pr: 0.5,

                      "& fieldset": {
                        border: "none",
                      },

                      "& input": {
                        py: 0,

                        px: {
                          xs: 1,
                          sm: 1,
                        },
                      },

                      "& .MuiInputAdornment-root":
                      {
                        ml: {
                          xs: 0.75,
                          sm: 1,
                        },

                        mr: {
                          xs: 0.25,
                          sm: 0.5,
                        },
                      },
                    },
                  }}
                />

                {/* Filters */}

                <Button
                  onClick={
                    toggleFilters
                  }
                  sx={{
                    flexShrink: 0,

                    borderRadius:
                      "50px",

                    background:
                      "#ffff",

                    backdropFilter:
                      "blur(6px)",

                    border: "none",

                    color: "#100f0f",

                    fontWeight: 700,

                    textTransform:
                      "none",

                    fontSize: {
                      xs: "0.7rem",
                      sm: "0.82rem",
                    },

                    height: {
                      xs: 34,
                      sm: 40,
                    },

                    minWidth: {
                      xs: "auto",
                      sm: 100,
                    },

                    px: {
                      xs: 1.25,
                      sm: 2,
                    },

                    gap: {
                      xs: 0.4,
                      sm: 0.75,
                    },

                    boxShadow: "none",

                    whiteSpace:
                      "nowrap",

                    display: "flex",

                    alignItems:
                      "center",

                    "&:hover": {
                      background:
                        saffron[500],

                      boxShadow: "none",

                      color: "#ffff",
                    },
                  }}
                >
                  <TuneIcon
                    sx={{
                      fontSize: {
                        xs: 14,
                        sm: 17,
                      },
                    }}
                  />

                  <Box
                    component="span"
                    sx={{
                      display: {
                        xs: "none",
                        sm: "inline",
                      },
                    }}
                  >
                    Filters
                    {activeFilters.length >
                      0
                      ? ` (${activeFilters.length})`
                      : ""}
                  </Box>

                  {isMobile &&
                    activeFilters.length >
                    0 && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius:
                            "50%",

                          background:
                            "#fff",

                          flexShrink: 0,
                        }}
                      />
                    )}
                </Button>

                {/* Requests */}

                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    <VisibilityIcon />
                  }
                  onClick={() =>
                    navigate(
                      "/request-ride"
                    )
                  }
                  sx={{
                    bgcolor: ORANGE,

                    color: "#ffffff",

                    "&:hover": {
                      bgcolor:
                        "#e68a00",
                    },

                    "&.Mui-disabled":
                    {
                      bgcolor:
                        "#e0e0e0",
                    },

                    fontWeight: 700,

                    fontSize: {
                      xs: "0.7rem",
                      sm: "0.875rem",
                    },

                    px: {
                      xs: 1.5,
                      sm: 3,
                    },

                    py: {
                      xs: 0.5,
                      sm: 1,
                    },

                    borderRadius: 2,

                    whiteSpace:
                      "nowrap",

                    boxShadow: "none",

                    textTransform:
                      "none",
                  }}
                >
                  View Your Requests
                </Button>
              </Box>

              {/* Active filter chips */}

              {activeFilters.length >
                0 && (
                  <Box
                    sx={{
                      display: "flex",

                      flexWrap:
                        "wrap",

                      gap: {
                        xs: 0.5,
                        sm: 0.75,
                      },

                      mt: 1.25,
                    }}
                  >
                    {activeFilters.map(
                      (f) => (
                        <Chip
                          key={f.key}
                          label={f.label}
                          onDelete={
                            f.clear
                          }
                          deleteIcon={
                            <CloseIcon />
                          }
                          size="small"
                          sx={{
                            background:
                              "rgba(255,255,255,0.9)",

                            border: `1px solid ${saffron[300]}`,

                            color:
                              saffron[800],

                            fontWeight: 600,

                            fontSize: {
                              xs: "0.65rem",
                              sm: "0.75rem",
                            },

                            height: {
                              xs: 22,
                              sm: 26,
                            },

                            "& .MuiChip-deleteIcon":
                            {
                              color:
                                saffron[500],

                              fontSize: {
                                xs: "0.8rem",
                                sm: "0.95rem",
                              },
                            },

                            "& .MuiChip-label":
                            {
                              px: {
                                xs: 0.75,
                                sm: 1,
                              },
                            },
                          }}
                        />
                      )
                    )}
                  </Box>
                )}
            </Container>
          </Box>
        </Box>

        {/* ──────────────────────────────────────
            Results
        ─────────────────────────────────────── */}

        <Box
          ref={resultsRef}
          onScroll={
            handleResultsScroll
          }
          sx={{
            flex: 1,

            overflowY: "auto",

            overflowX: "hidden",

            pb: {
              xs: 4,
              sm: 6,
            },

            "&::-webkit-scrollbar":
            {
              width: 5,
            },

            "&::-webkit-scrollbar-track":
            {
              background:
                saffron[50],
            },

            "&::-webkit-scrollbar-thumb":
            {
              background:
                saffron[300],

              borderRadius: 4,
            },
          }}
        >
          <Container
            maxWidth="md"
            disableGutters
            sx={{
              px: {
                xs: 0,
                sm: 3,
              },
            }}
          >
            {/* ───────────────────────────────
                Filter panel
            ─────────────────────────────── */}

            <Collapse
              in={filtersOpen}
            >
              <Box
                sx={{
                  background:
                    "#fff",

                  borderRadius: {
                    xs: 3,
                    md: 4,
                  },

                  border: `1.5px solid ${saffron[100]}`,

                  p: {
                    xs: 1.75,
                    sm: 3,
                  },

                  mt: {
                    xs: 1.5,
                    sm: 2,
                  },

                  mb: {
                    xs: 1.5,
                    sm: 2,
                  },
                }}
              >
                {/* Transport */}

                <Box mb={2}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: {
                        xs: "0.65rem",
                        sm: "0.7rem",
                      },

                      fontWeight: 700,

                      textTransform:
                        "uppercase",

                      letterSpacing:
                        "0.08em",

                      color:
                        saffron[700],

                      display:
                        "block",

                      mb: 1,
                    }}
                  >
                    Mode of Travel
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",

                      flexWrap:
                        "wrap",

                      gap: {
                        xs: 0.6,
                        sm: 1,
                      },
                    }}
                  >
                    {TRANSPORT_OPTIONS.map(
                      (opt) => {
                        const selected =
                          transportMode ===
                          opt.value;

                        return (
                          <Chip
                            key={
                              opt.value
                            }
                            label={
                              opt.label
                            }
                            icon={
                              opt.icon
                            }
                            onClick={() =>
                              updateDraft(
                                "transportMode",
                                opt.value
                              )
                            }
                            sx={{
                              borderRadius:
                                "20px",

                              border: `1.5px solid ${selected
                                ? saffron[500]
                                : saffron[200]
                                }`,

                              background:
                                selected
                                  ? saffron[500]
                                  : "#fff",

                              color:
                                selected
                                  ? "#fff"
                                  : saffron[700],

                              fontWeight: 600,

                              fontSize: {
                                xs: "0.68rem",
                                sm: "0.86rem",
                              },

                              height: {
                                xs: 24,
                                sm: 30,
                              },

                              cursor:
                                "pointer",

                              "& .MuiChip-label":
                              {
                                px: {
                                  xs: 1,
                                  sm: 1.8,
                                },
                              },

                              "&:hover":
                              {
                                background:
                                  selected
                                    ? saffron[600]
                                    : saffron[50],

                                borderColor:
                                  saffron[400],
                              },

                              "& .MuiChip-icon":
                              {
                                color:
                                  selected
                                    ? "#fff"
                                    : saffron[500],

                                ml: {
                                  xs: 0.5,
                                  sm: 0.75,
                                },

                                mr: {
                                  xs: "-4px",
                                  sm: "-2px",
                                },
                              },
                            }}
                          />
                        );
                      }
                    )}
                  </Box>
                </Box>

                {/* Dropdowns */}

                <Grid
                  container
                  spacing={{
                    xs: 1,
                    sm: 2,
                  }}
                  alignItems="flex-end"
                >
                  {/* Gender */}

                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                        },

                        fontWeight: 600,

                        textTransform:
                          "uppercase",

                        letterSpacing:
                          "0.08em",

                        color:
                          saffron[700],

                        display:
                          "block",

                        mt: 1,

                        mb: 1,
                      }}
                    >
                      Gender
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                    >
                      <Select
                        value={gender}
                        displayEmpty
                        onChange={(e) =>
                          updateDraft(
                            "gender",
                            e.target.value
                          )
                        }
                        sx={{
                          ...selectSx,

                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.82rem",
                          },

                          height: {
                            xs: 30,
                            sm: 36,
                          },
                        }}
                      >
                        {GENDER_OPTIONS.map(
                          (g) => (
                            <MenuItem
                              key={
                                g.value
                              }
                              value={
                                g.value
                              }
                              sx={{
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.85rem",
                                },
                              }}
                            >
                              {g.label}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Fuel */}

                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                  >
                    <Typography
                      component="span"
                      sx={{
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.7rem",
                        },

                        fontWeight: 600,

                        textTransform:
                          "uppercase",

                        letterSpacing:
                          "0.08em",

                        color:
                          saffron[700],

                        display:
                          "block",

                        mt: 1,

                        mb: 1,
                      }}
                    >
                      Fuel Sharing
                    </Typography>

                    <FormControl
                      fullWidth
                      size="small"
                    >
                      <Select
                        value={
                          fuelSharing
                        }
                        displayEmpty
                        onChange={(e) =>
                          updateDraft(
                            "fuelSharing",
                            e.target.value
                          )
                        }
                        sx={{
                          ...selectSx,

                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.82rem",
                          },

                          height: {
                            xs: 30,
                            sm: 36,
                          },
                        }}
                      >
                        {FUEL_OPTIONS.map(
                          (f) => (
                            <MenuItem
                              key={
                                f.value
                              }
                              value={
                                f.value
                              }
                              sx={{
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.85rem",
                                },
                              }}
                            >
                              {f.label}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Language */}

                  {transportMode ===
                    "Flight" && (
                      <Grid
                        item
                        xs={12}
                        sm={4}
                        md={6}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                            },

                            fontWeight: 600,

                            textTransform:
                              "uppercase",

                            letterSpacing:
                              "0.08em",

                            color:
                              saffron[700],

                            display:
                              "block",

                            mt: 1,
                          }}
                        >
                          Language
                        </Typography>

                        <TextField
                          fullWidth
                          size="small"

                          placeholder="Tamil, English, Hindi…"

                          value={
                            language
                          }

                          onChange={(e) =>
                            updateDraft(
                              "language",
                              e.target
                                .value
                            )
                          }

                          sx={{
                            ...inputFieldSx,

                            "& .MuiOutlinedInput-root":
                            {
                              ...inputFieldSx[
                              "& .MuiOutlinedInput-root"
                              ],

                              fontSize: {
                                xs: "0.7rem",
                                sm: "0.82rem",
                              },

                              height: {
                                xs: 30,
                                sm: 36,
                              },

                              mt: 1,
                            },
                          }}
                        />
                      </Grid>
                    )}
                </Grid>

                {/* Filter actions */}

                <Box
                  sx={{
                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap: 1,

                    mt: {
                      xs: 1.5,
                      sm: 2.5,
                    },
                  }}
                >
                  <Button
                    startIcon={
                      <FilterListOffIcon
                        sx={{
                          fontSize: {
                            xs: 12,
                            sm: 16,
                          },
                        }}
                      />
                    }
                    onClick={
                      clearFilters
                    }
                    variant="contained"
                    sx={{
                      borderRadius:
                        "50px",

                      color: "#ffff",

                      bgcolor:
                        "#757575",

                      fontWeight: 600,

                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.82rem",
                      },

                      px: {
                        xs: 1.5,
                        sm: 2.5,
                      },

                      height: {
                        xs: 30,
                        sm: 36,
                      },

                      textTransform:
                        "none",
                    }}
                  >
                    Clear all
                  </Button>

                  <Button
                    onClick={
                      applyFilters
                    }
                    sx={{
                      borderRadius:
                        "50px",

                      border: "none",

                      background:
                        saffron[500],

                      color: "#fff",

                      fontWeight: 700,

                      fontSize: {
                        xs: "0.72rem",
                        sm: "0.85rem",
                      },

                      px: {
                        xs: 2,
                        sm: 3,
                      },

                      height: {
                        xs: 32,
                        sm: 38,
                      },

                      textTransform:
                        "none",

                      boxShadow: "none",

                      "&:hover": {
                        background:
                          saffron[600],
                      },
                    }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Collapse>

            <Box
              sx={{
                display: "flex",
                mb: {
                  xs: 1.5,
                  sm: 2,
                },

                mt: {
                  xs: 2,
                  sm: 1.5,
                },
              }}
            >
              {/* <Typography
                fontWeight={700}
                sx={{
                  color:
                    saffron[800],

                  fontSize: {
                    xs: "0.83rem",
                    sm: "1rem",
                  },
                }}
              >
                {visibleRides.length}{" "}
                <Typography
                  component="span"
                  fontWeight={400}
                  color="text.secondary"
                >
                  {visibleRides.length ===
                    1
                    ? "result"
                    : "results"}{" "}
                  found
                </Typography>
              </Typography> */}
            </Box>

            {/* ───────────────────────────────
                Ride cards
            ─────────────────────────────── */}

            {loading ?

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  sx={{
                    color: saffron[500],
                  }}
                />
              </Box>
              :

              sortedVisibleRides.length >
                0 ? (
                <>
                  <Grid
                    container
                    spacing={{
                      xs: 1,
                      sm: 2,
                    }}
                  >
                    {sortedVisibleRides.map(
                      (ride) => {
                        const isOwnRide =
                          ride.createdBy?._id ===
                          currentUser?._id;

                        const distanceKm =
                          getRideDistanceKm(
                            ride
                          );

                        return (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={
                              ride._id
                            }
                          >
                            <RideCard
                              ride={ride}
                              isOwnRide={
                                isOwnRide
                              }
                              distanceKm={
                                distanceKm
                              }
                              distanceLabel={formatDistance(
                                distanceKm
                              )}
                            />
                          </Grid>
                        );
                      }
                    )}
                  </Grid>

                  {loadingMore && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 2,
                      }}
                    >
                      <CircularProgress
                        size={26}
                        sx={{
                          color: saffron[500],
                        }}
                      />
                    </Box>
                  )}

                  {!hasMore && (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        fontSize: "0.8rem",
                        py: 2,
                      }}
                    >
                      No more rides
                    </Typography>
                  )}
                </>

              ) : (
                <Box
                  sx={{
                    borderRadius: {
                      xs: 3,
                      sm: 4,
                    },

                    textAlign:
                      "center",

                    py: {
                      xs: 3,
                      sm: 5,
                    },

                    px: {
                      xs: 2,
                      sm: 4,
                    },

                    mt: {
                      xs: "40%",
                      sm: "10%",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                  >
                    No rides found
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                    }}
                  >
                    Try adjusting your
                    filters or search
                    terms
                  </Typography>
                </Box>
              )
            }
          </Container>
        </Box>
      </Box>
    </>
  );
} 