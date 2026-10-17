import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Container,
  Typography,
  CircularProgress,
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Collapse,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  DialogActions,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Divider,
  Stack,
  Select,
  FormControl,
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseIcon from "@mui/icons-material/Close";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import FlightIcon from "@mui/icons-material/Flight";

import RideCard from "./RideCard.jsx";
import RideList from "./RideCard2.jsx";
import Api from "../Api";
import OfferRide from "./OfferRide.jsx";
import { useUser } from "../context/userConetext.jsx";

/* ─────────── Design tokens ─────────── */
const saffron = {
  50: "#FFF8EE",
  200: "#FFD492",
  500: "#F59300",
  700: "#A85F00",
};

const RUST = "#C83F08";
const RUST_DARK = "#A93205";
const NAVY = "#1B2A4E";

/* ─────────── Responsive UI helpers (UI only) ─────────── */
// Section label used above each filter group
const sectionLabelSx = {
  fontSize: { xs: 10, sm: 10.5, md: 11 },
  fontWeight: 700,
  letterSpacing: 0.6,
  color: "text.secondary",
  mb: 0.75,
  textTransform: "uppercase",
};

// Pill chip style (selected / unselected)
const pillChipSx = (selected, extra = {}) => ({
  borderRadius: 999,
  fontWeight: 600,
  fontSize: { xs: 11.5, sm: 12 },
  height: { xs: 26, sm: 28 },
  bgcolor: selected ? RUST : "#fff",
  color: selected ? "#fff" : "#333",
  border: `1px solid ${selected ? RUST : "#ddd"}`,
  "&:hover": { bgcolor: selected ? RUST : "#f8f8f8" },
  ...extra,
});

// Small date input style
const dateInputSx = {
  flex: 1,
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    fontSize: { xs: 12, sm: 12.5 },
    borderRadius: 1.5,
    height: { xs: 34, sm: 36 },
  },
  "& input": { px: { xs: 1, sm: 1.5 } },
};

// Big search input style
const searchInputSx = {
  flex: 1,
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    fontSize: { xs: 13, sm: 13.5 },
    borderRadius: 1.5,
    height: { xs: 40, sm: 42 },
    bgcolor: "#fff",
  },
};

const TRANSPORT_OPTIONS = [
  { label: "All", value: "", icon: null },
  { label: "Car", value: "Car", icon: <DirectionsCarIcon sx={{ fontSize: 14 }} /> },
  { label: "Bike", value: "Bike", icon: <TwoWheelerIcon sx={{ fontSize: 14 }} /> },
  { label: "Bus", value: "Bus", icon: <DirectionsBusIcon sx={{ fontSize: 14 }} /> },
  { label: "Train", value: "Train", icon: <TrainIcon sx={{ fontSize: 14 }} /> },
  { label: "Flight", value: "Flight", icon: <FlightIcon sx={{ fontSize: 14 }} /> },
];

const CATEGORY_OPTIONS = [
  { label: "All categories", value: "" },
  { label: "Airport pickup / drop", value: "Airport pickup / drop" },
  { label: "Temple / event", value: "Temple / event" },
  { label: "Ride request", value: "Ride request" },
];

const LANGUAGE_OPTIONS = ["Tamil", "Hindi", "Telugu", "English"];

const NAVBAR_HEIGHT = 35;
const SCROLL_COLLAPSE_THRESHOLD = 24;

const emptyFilters = {
  type: "", // Offers | Requests | ""
  transportMode: "", // Car | Bike | ...
  category: "",
  language: "",
  freeRidesOnly: false,
  childFriendly: false,
  womenRidersOnly: false,
  dateFrom: "",
  dateTo: "",
  radiusMi: 25,
};

export default function FindRides() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { currentUser, completion } = useUser();
  const navigate = useNavigate();

  const [rides, setRides] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 10;
  const loadingMoreRef = useRef(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchDestination, setSearchDestination] = useState("");

  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const [profileGateOpen, setProfileGateOpen] = useState(false);
  const hasCheckedProfileGateRef = useRef(false);

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const token = localStorage.getItem("token");
  const resultsRef = useRef(null);
  const scrollStartRef = useRef(0);
  // Always holds the latest window-scroll handler (used by the window listener below)
  const windowScrollHandlerRef = useRef(() => { });

  /* Applied filter shortcuts */
  const {
    type: appliedType,
    transportMode: appliedTransportMode,
    category: appliedCategory,
    language: appliedLanguage,
    freeRidesOnly: appliedFreeRidesOnly,
    childFriendly: appliedChildFriendly,
    womenRidersOnly: appliedWomenRidersOnly,
    dateFrom: appliedDateFrom,
    dateTo: appliedDateTo,
    radiusMi: appliedRadiusMi,
  } = appliedFilters;

  /* ─────────── Fetch rides ─────────── */
  const fetchRides = async ({
    pageNumber = 1,
    reset = false,
    searchFromValue = searchFrom,
    searchDestinationValue = searchDestination,
    typeValue = appliedType,
    transportModeValue = appliedTransportMode,
    categoryValue = appliedCategory,
    languageValue = appliedLanguage,
    freeRidesOnlyValue = appliedFreeRidesOnly,
    childFriendlyValue = appliedChildFriendly,
    womenRidersOnlyValue = appliedWomenRidersOnly,
    dateFromValue = appliedDateFrom,
    dateToValue = appliedDateTo,
    radiusMiValue = appliedRadiusMi,
  } = {}) => {
    if (loadingMoreRef.current) return;

    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      loadingMoreRef.current = true;

      const res = await axios.get(`${Api}/rides/get`, {
        params: {
          type: "find",
          page: pageNumber,
          limit: LIMIT,
          searchFrom: searchFromValue,
          searchDestination: searchDestinationValue,
          typeFilter: typeValue,
          transportMode: transportModeValue,
          category: categoryValue,
          language: languageValue,
          freeRidesOnly: freeRidesOnlyValue,
          childFriendly: childFriendlyValue,
          womenRidersOnly: womenRidersOnlyValue,
          dateFrom: dateFromValue,
          dateTo: dateToValue,
          radiusMi: radiusMiValue,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = res?.data || {};
      const newRides = Array.isArray(body.data) ? body.data : [];

      setRides((prev) => {
        if (reset) return newRides;
        const existingIds = new Set(prev.map((r) => String(r?._id)));
        return [...prev, ...newRides.filter((r) => !existingIds.has(String(r?._id)))];
      });

      setPage(pageNumber);
      setHasMore(
        typeof body.hasMore === "boolean"
          ? body.hasMore
          : newRides.length === LIMIT
      );
    } catch (error) {
      console.error("Find rides error:", error?.response?.data || error);
    } finally {
      loadingMoreRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRides({ pageNumber: 1, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      fetchRides({ pageNumber: 1, reset: true });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchFrom,
    searchDestination,
    appliedType,
    appliedTransportMode,
    appliedCategory,
    appliedLanguage,
    appliedFreeRidesOnly,
    appliedChildFriendly,
    appliedWomenRidersOnly,
    appliedDateFrom,
    appliedDateTo,
    appliedRadiusMi,
  ]);

  /* ─────────── Location ─────────── */
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
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
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error("GPS LOCATION ERROR:", error);
        setUserLocation(null);
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission is denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Please turn on your location to find rides nearby.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to get your current location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    requestCurrentLocation();
  }, []);

  const getRideCoordinates = (ride) => {
    const fromLatitude = Number(ride?.fromLocation?.latitude);
    const fromLongitude = Number(ride?.fromLocation?.longitude);
    if (Number.isFinite(fromLatitude) && Number.isFinite(fromLongitude)) {
      return { latitude: fromLatitude, longitude: fromLongitude };
    }
    const directLatitude = Number(ride?.fromLatitude);
    const directLongitude = Number(ride?.fromLongitude);
    if (Number.isFinite(directLatitude) && Number.isFinite(directLongitude)) {
      return { latitude: directLatitude, longitude: directLongitude };
    }
    const coordinates = ride?.fromLocation?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const longitude = Number(coordinates[0]);
      const latitude = Number(coordinates[1]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude };
      }
    }
    return null;
  };

  const getRideDistanceKm = (ride) => {
    if (!userLocation) return Infinity;
    const c = getRideCoordinates(ride);
    if (!c) return Infinity;
    return calculateDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      c.latitude,
      c.longitude
    );
  };

  /* ─────────── Profile gate ─────────── */
  useEffect(() => {
    if (hasCheckedProfileGateRef.current) return;
    if (currentUser && currentUser._id && typeof completion === "number") {
      hasCheckedProfileGateRef.current = true;
      setProfileGateOpen(completion !== 100);
    }
  }, [currentUser, completion]);

  const handleCloseProfileGate = () => setProfileGateOpen(false);

  /* ─────────── Filters ─────────── */
  const openFilters = () => {
    scrollStartRef.current = resultsRef.current ? resultsRef.current.scrollTop : 0;
    // UI: page now scrolls on the window, so also remember the window position
    if (typeof window !== "undefined" && window.scrollY) {
      scrollStartRef.current = window.scrollY;
    }
    setFiltersOpen(true);
  };
  const closeFilters = () => setFiltersOpen(false);
  const toggleFilters = () => (filtersOpen ? closeFilters() : openFilters());

  const handleResultsScroll = (e) => {
    const element = e.currentTarget;
    if (filtersOpen) {
      const delta = Math.abs(element.scrollTop - scrollStartRef.current);
      if (delta > SCROLL_COLLAPSE_THRESHOLD) closeFilters();
    }
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceFromBottom <= 300 && hasMore && !loadingMoreRef.current) {
      fetchRides({ pageNumber: page + 1, reset: false });
    }
  };

  /* ─────────── Window scroll (page scrolls on Y axis, filters stay sticky) ─────────── */
  // Updated on every render so it always sees the latest state
  windowScrollHandlerRef.current = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    if (filtersOpen) {
      const delta = Math.abs(scrollTop - scrollStartRef.current);
      if (delta > SCROLL_COLLAPSE_THRESHOLD) closeFilters();
    }

    const distanceFromBottom =
      document.documentElement.scrollHeight - scrollTop - window.innerHeight;
    if (distanceFromBottom <= 300 && hasMore && !loadingMoreRef.current) {
      fetchRides({ pageNumber: page + 1, reset: false });
    }
  };

  useEffect(() => {
    const onWindowScroll = () => windowScrollHandlerRef.current();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    closeFilters();
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const activeFilters = [
    appliedType && {
      key: "type",
      label: appliedType,
      clear: () => {
        const next = { ...appliedFilters, type: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedTransportMode && {
      key: "transport",
      label: appliedTransportMode,
      clear: () => {
        const next = { ...appliedFilters, transportMode: "", language: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedCategory && {
      key: "category",
      label: appliedCategory,
      clear: () => {
        const next = { ...appliedFilters, category: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedLanguage && {
      key: "lang",
      label: `Lang: ${appliedLanguage}`,
      clear: () => {
        const next = { ...appliedFilters, language: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedFreeRidesOnly && {
      key: "free",
      label: "Free rides only",
      clear: () => {
        const next = { ...appliedFilters, freeRidesOnly: false };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedChildFriendly && {
      key: "child",
      label: "Child-friendly",
      clear: () => {
        const next = { ...appliedFilters, childFriendly: false };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedWomenRidersOnly && {
      key: "women",
      label: "Women riders only",
      clear: () => {
        const next = { ...appliedFilters, womenRidersOnly: false };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    (appliedDateFrom || appliedDateTo) && {
      key: "dates",
      label:
        appliedDateFrom && appliedDateTo
          ? `${appliedDateFrom} → ${appliedDateTo}`
          : appliedDateFrom
            ? `From ${appliedDateFrom}`
            : `Until ${appliedDateTo}`,
      clear: () => {
        const next = { ...appliedFilters, dateFrom: "", dateTo: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
  ].filter(Boolean);

  /* ─────────── Sort rides ─────────── */
  const sortedVisibleRides = useMemo(() => {
    return [...rides].sort((a, b) => {
      if (userLocation) {
        const dA = getRideDistanceKm(a);
        const dB = getRideDistanceKm(b);
        const vA = Number.isFinite(dA);
        const vB = Number.isFinite(dB);
        if (vA && !vB) return -1;
        if (!vA && vB) return 1;
        if (vA && vB && dA !== dB) return dA - dB;
      }
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rides, userLocation]);

  /* ─────────── Filter Panel ─────────── */
  const FilterPanel = () => (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2.25, md: 2.5 },
        borderRadius: 2.5,
        borderColor: "divider",
        bgcolor: "#fff",
        width: "100%",
        boxSizing: "border-box",

        position: isDesktop ? "sticky" : "static",
        top: NAVBAR_HEIGHT + 8, // Move Paper 8px closer to the navbar
        alignSelf: "flex-start",
        zIndex: 2,

        maxHeight: isDesktop
          ? `calc(100vh - ${NAVBAR_HEIGHT}px - 48px)`
          : "none",

        overflowY: isDesktop ? "auto" : "visible",
        overflowX: "hidden",
      }}
    >
      <Stack direction="row"
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <Typography
          sx={{
            fontSize: { xs: 14, sm: 15, md: 16 },
            fontWeight: 700,
            color: "#1a1a1a",
          }}
        >
          Filters
        </Typography>
        {!isDesktop && (
          <IconButton size="small" onClick={closeFilters}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {/* ─── Date range ─── */}
      <Typography sx={sectionLabelSx}>Date range</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          type="date"
          value={draftFilters.dateFrom}
          onChange={(e) => updateDraft("dateFrom", e.target.value)}
          sx={dateInputSx}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          type="date"
          value={draftFilters.dateTo}
          onChange={(e) => updateDraft("dateTo", e.target.value)}
          sx={dateInputSx}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      {/* ─── Type ─── */}
      <Typography sx={sectionLabelSx}>Type</Typography>
      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexWrap: "wrap", gap: 0.75 }}>
        {[
          { label: "All", value: "" },
          { label: "Offers", value: "Offers" },
          { label: "Requests", value: "Requests" },
        ].map((t) => {
          const selected = (draftFilters.type || "") === t.value;
          return (
            <Chip
              key={t.value || "all"}
              label={t.label}
              clickable
              onClick={() => updateDraft("type", t.value)}
              sx={pillChipSx(selected)}
            />
          );
        })}
      </Stack>

      {/* ─── Mode of travel ─── */}
      {/* <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 0.6,
          color: "text.secondary",
          mb: 0.75,
          textTransform: "uppercase",
        }}
      >
        Mode of travel
      </Typography>
      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexWrap: "wrap", gap: 0.75 }}>
        {TRANSPORT_OPTIONS.map((opt) => {
          const selected = draftFilters.transportMode === opt.value;
          return (
            <Chip
              key={opt.value || "all-t"}
              label={opt.label}
              icon={opt.icon}
              clickable
              onClick={() => updateDraft("transportMode", opt.value)}
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 12,
                height: 28,
                bgcolor: selected ? RUST : "#fff",
                color: selected ? "#fff" : "#333",
                border: `1px solid ${selected ? RUST : "#ddd"}`,
                "& .MuiChip-icon": {
                  color: selected ? "#fff" : "#666",
                  ml: 0.5,
                  mr: -0.25,
                },
                "&:hover": { bgcolor: selected ? RUST : "#f8f8f8" },
              }}
            />
          );
        })}
      </Stack> */}

      {/* ─── Category ─── */}
      <Typography sx={sectionLabelSx}>Category</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <Select
          value={draftFilters.category}
          onChange={(e) => updateDraft("category", e.target.value)}
          displayEmpty
          sx={{
            fontSize: { xs: 12.5, sm: 13 },
            borderRadius: 1.5,
            height: { xs: 34, sm: 36 },
          }}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <MenuItem
              key={c.value}
              value={c.value}
              sx={{ fontSize: { xs: 12.5, sm: 13 } }}
            >
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* ─── Language ─── */}
      <Typography sx={sectionLabelSx}>Language</Typography>
      <Stack direction="row" spacing={0.75} sx={{ mb: 2, flexWrap: "wrap", gap: 0.75 }}>
        {LANGUAGE_OPTIONS.map((lang) => {
          const selected = draftFilters.language === lang;
          return (
            <Chip
              key={lang}
              label={lang}
              clickable
              onClick={() => updateDraft("language", selected ? "" : lang)}
              sx={pillChipSx(selected)}
            />
          );
        })}
      </Stack>

      {/* ─── Toggles ─── */}
      <FormGroup sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftFilters.freeRidesOnly}
              onChange={(e) => updateDraft("freeRidesOnly", e.target.checked)}
              sx={{ color: "#bbb", "&.Mui-checked": { color: RUST }, py: 0.25 }}
            />
          }
          label={
            <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, color: "#333" }}>
              Free rides only
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftFilters.childFriendly}
              onChange={(e) => updateDraft("childFriendly", e.target.checked)}
              sx={{ color: "#bbb", "&.Mui-checked": { color: RUST }, py: 0.25 }}
            />
          }
          label={
            <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, color: "#333" }}>
              Child-friendly
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={draftFilters.womenRidersOnly}
              onChange={(e) => updateDraft("womenRidersOnly", e.target.checked)}
              sx={{ color: "#bbb", "&.Mui-checked": { color: RUST }, py: 0.25 }}
            />
          }
          label={
            <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, color: "#333" }}>
              Women riders only{" "}
              <Typography
                component="span"
                sx={{ fontSize: { xs: 11, sm: 11.5 }, color: "text.secondary" }}
              >
                (shown to women)
              </Typography>
            </Typography>
          }
        />
      </FormGroup>

      <Button
        fullWidth
        onClick={applyFilters}
        sx={{
          bgcolor: RUST,
          color: "#fff",
          textTransform: "none",
          fontWeight: 700,
          fontSize: { xs: 13.5, sm: 14 },
          py: { xs: 0.9, sm: 1.1 },
          borderRadius: 2,
          boxShadow: "none",
          "&:hover": { bgcolor: RUST_DARK, boxShadow: "none" },
        }}
      >
        Apply filters
      </Button>

      {activeFilters.length > 0 && (
        <Button
          fullWidth
          size="small"
          startIcon={<FilterListOffIcon sx={{ fontSize: 15 }} />}
          onClick={clearFilters}
          sx={{
            mt: 1,
            color: "text.secondary",
            textTransform: "none",
            fontSize: { xs: 12, sm: 12.5 },
            fontWeight: 600,
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          Clear all
        </Button>
      )}
    </Paper>
  );

  /* ─────────── Main render ─────────── */
  return (
    <>
      {/* ─── Profile gate dialog ─── */}

      <Dialog
        open={profileGateOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          handleCloseProfileGate();
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            boxSizing: "border-box",
            borderRadius: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
            m: {
              xs: 1,
              sm: 2,
              md: 3,
            },
            width: {
              xs: "calc(100% - 16px)",
              sm: "calc(100% - 32px)",
              md: "100%",
            },
            maxWidth: {
              xs: "450px",
              sm: "450px",
            },
            textAlign: "center",
            p: {
              xs: 1,
              sm: 1.3,
              md: 1.6,
            },
            overflowX: "hidden",
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
            fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
            pt: { xs: 2, sm: 3 },
          }}
        >
          <WarningAmberRoundedIcon
            sx={{ fontSize: { xs: 34, sm: 40 }, color: "#E8650A" }}
          />
          Complete Your Profile
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
              color: "text.secondary",
            }}
          >
            Your profile is only {Number.isFinite(completion) ? completion : 0}%
            complete. Please complete your profile to 100% to unlock all features.
          </Typography>
          <Box sx={{ mt: 2.5, px: { xs: 1, sm: 3 } }}>
            <LinearProgress
              variant="determinate"
              value={Number.isFinite(completion) ? completion : 0}
              sx={{
                height: 8,
                borderRadius: 5,
                bgcolor: "#F0E6DC",
                "& .MuiLinearProgress-bar": { bgcolor: "#FF9933" },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            flexWrap: "wrap",
            pb: { xs: 2, sm: 3 },
            pt: 1,
            gap: 1.5,
          }}
        >
          <Button
            variant="contained"
            onClick={handleCloseProfileGate}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: { xs: 2.5, sm: 3 },
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 600,
              bgcolor: "#FF9933",
              color: "#fff",
              "&:hover": { bgcolor: "#FF9933", color: "#fff" },
            }}
          >
            OK
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              navigate("/user-profile", { state: { openEditProfile: true } })
            }
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: { xs: 2.5, sm: 3 },
              fontSize: { xs: 13, sm: 14 },
              fontWeight: 600,
              bgcolor: "#FF9933",
              color: "#fff",
              "&:hover": { bgcolor: "#FF9933", color: "#fff" },
            }}
          >
            Update profile
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          minHeight: {
            xs: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
            sm: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
            md: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            lg: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          },
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          bgcolor: "#FAF8F5",
          p: {
            xs: 0.5,
            sm: 1.5,
            md: 2.5,
            lg: 3,
          },
          // "clip" prevents horizontal overflow WITHOUT creating a scroll container,
          // so position: sticky on the filter panel keeps working.
          // (overflowX: "hidden" would break sticky)
          overflowX: "clip",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ px: { xs: 1.5, sm: 2.5, md: 3 }, py: { xs: 1.5, sm: 2.5 } }}
        >
          {/* ─── Title row ─── */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: { xs: 1.5, sm: 2 } }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 20, sm: 26, md: 30 },
                fontWeight: 800,
                color: NAVY,
                letterSpacing: -0.3,
                lineHeight: 1.2,
              }}
            >
              Find a ride
            </Typography>

            {/* <Button
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{
                bgcolor: RUST,
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13.5,
                px: 2.5,
                py: 0.9,
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: RUST_DARK, boxShadow: "none" },
              }}
            >
              + Post a ride
            </Button> */}
          </Stack>

          {/* ─── 2-column layout ─── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "280px minmax(0, 1fr)",
                lg: "300px minmax(0, 1fr)",
              },
              gap: { xs: 1.5, sm: 2, md: 3 },
              // flex-start is required so the sticky filter column doesn't stretch
              alignItems: "flex-start",
            }}
          >
            {/* Filters column */}
            {isDesktop ? (
              <FilterPanel />
            ) : (
              <Collapse in={filtersOpen} timeout="auto">
                <FilterPanel />
              </Collapse>
            )}

            {/* Right column */}
            <Box sx={{ minWidth: 0, width: "100%" }}>
              {/* ─── Mobile filter trigger ─── */}
              {!isDesktop && (
                <Button
                  fullWidth
                  onClick={toggleFilters}
                  startIcon={<FilterListOffIcon />}
                  sx={{
                    mb: 1.5,
                    bgcolor: "#fff",
                    color: "#333",
                    border: "1px solid #ddd",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: 12.5, sm: 13.5 },
                    py: { xs: 0.8, sm: 1 },
                    borderRadius: 2,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#f8f8f8", boxShadow: "none" },
                  }}
                >
                  {filtersOpen ? "Hide filters" : "Show filters"}
                  {activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
                </Button>
              )}

              {/* ─── Search card ─── */}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.25, sm: 2 },
                  mb: 2,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  bgcolor: "#fff",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  sx={{ mb: { xs: 1.25, sm: 1.75 } }}
                >
                  <TextField
                    size="small"
                    placeholder="From (US city or airport)"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    sx={searchInputSx}
                  />
                  <TextField
                    size="small"
                    placeholder="To (US city or airport)"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    sx={searchInputSx}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon sx={{ fontSize: 18 }} />}
                    onClick={() => fetchRides({ pageNumber: 1, reset: true })}
                    sx={{
                      bgcolor: NAVY,
                      color: "#fff",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: { xs: 13, sm: 13.5 },
                      px: { xs: 2, sm: 3 },
                      height: { xs: 40, sm: 42 },
                      width: { xs: "100%", sm: "auto" },
                      flexShrink: 0,
                      borderRadius: 1.5,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#0F1E3D", boxShadow: "none" },
                    }}
                  >
                    Search
                  </Button>
                </Stack>

                <Divider sx={{ my: { xs: 1.25, sm: 1.75 } }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    flexWrap: "wrap",
                    gap: { xs: 1.25, md: 1.5 },
                  }}
                >
                  <Button
                    onClick={requestCurrentLocation}
                    disabled={locationLoading}
                    startIcon={
                      <LocationOnIcon
                        sx={{
                          fontSize: { xs: 16, sm: 18, md: 15 },
                          color: userLocation ? "#2E7D32" : RUST,
                        }}
                      />
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: { xs: 12.5, sm: 13, md: 10.5 },
                      borderRadius: 999,
                      px: { xs: 2, sm: 2, md: 1 },
                      py: 0.75,
                      border: `1.5px solid ${userLocation ? "#A5D6A7" : RUST}`,
                      bgcolor: userLocation ? "#EAF6EC" : "#fff",
                      whiteSpace: "nowrap",
                      alignSelf: { xs: "stretch", md: "center" },
                      "&:hover": {
                        bgcolor: userLocation ? "#E0F2E3" : "#FFF5EC",
                        borderColor: userLocation ? "#A5D6A7" : RUST,
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: 12.5, sm: 13, md: 10.5 },
                        color: userLocation ? "#2E7D32" : RUST,
                        textAlign: { xs: "center", md: "left" },
                        fontWeight: 600,
                      }}
                    >
                      {locationLoading ? "Getting location..." : "Use my location"}
                    </Typography>
                  </Button>

                  <Typography
                    sx={{
                      fontSize: { xs: 12, sm: 13 },
                      color: "text.secondary",
                      textAlign: { xs: "center", md: "left" },
                    }}
                  >
                    or type a location
                  </Typography>

                  <TextField
                    size="small"
                    placeholder="City or zip"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    sx={{
                      flex: 1,
                      minWidth: { xs: 0, md: 160 },
                      width: { xs: "100%", md: "auto" },
                      "& .MuiOutlinedInput-root": {
                        fontSize: { xs: 12.5, sm: 13 },
                        borderRadius: 1.5,
                        height: { xs: 36, sm: 38 },
                        bgcolor: "#fff",
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: { xs: 12, sm: 13 }, color: "text.secondary" }}
                    >
                      within
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "row", gap: 0.5 }}>
                      {[
                        { label: "10 mi", value: 10 },
                        { label: "25 mi", value: 25 },
                        { label: "50 mi", value: 50 },
                      ].map((r) => {
                        const isActive = draftFilters.radiusMi === r.value;
                        return (
                          <Chip
                            key={r.value}
                            label={r.label}
                            clickable
                            onClick={() => updateDraft("radiusMi", r.value)}
                            sx={{
                              borderRadius: 999,
                              fontWeight: 700,
                              fontSize: { xs: 11.5, sm: 12 },
                              height: { xs: 28, sm: 30 },
                              bgcolor: isActive ? RUST : "#fff",
                              color: isActive ? "#fff" : "#333",
                              border: `1px solid ${isActive ? RUST : "#ddd"}`,
                              "&:hover": {
                                bgcolor: isActive ? RUST : "#f8f8f8",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                <Typography
                  sx={{
                    fontSize: { xs: 11.5, sm: 12.5 },
                    color: "text.secondary",
                    mt: { xs: 1.25, sm: 1.75 },
                    lineHeight: 1.5,
                  }}
                >
                  {sortedVisibleRides.length} ride
                  {sortedVisibleRides.length === 1 ? "" : "s"} near{" "}
                  {searchFrom || "your area"}. Your location is used only for
                  this search and is not stored.
                </Typography>

                {locationError && (
                  <Typography
                    sx={{
                      fontSize: { xs: 11.5, sm: 12 },
                      color: "#B00020",
                      mt: 0.75,
                    }}
                  >
                    {locationError}
                  </Typography>
                )}
              </Paper>

              {/* ─── Active filter chips ─── */}
              {activeFilters.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1.5 }}
                >
                  {activeFilters.map((f) => (
                    <Chip
                      key={f.key}
                      label={f.label}
                      onDelete={f.clear}
                      size="small"
                      sx={{
                        bgcolor: "#fff",
                        border: `1px solid ${RUST}`,
                        color: RUST,
                        fontWeight: 600,
                        fontSize: { xs: 11, sm: 11.5 },
                        height: { xs: 24, sm: 26 },
                        maxWidth: "100%",
                        "& .MuiChip-deleteIcon": {
                          color: RUST,
                          fontSize: 16,
                        },
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* ─── Ride list ─── */}
              {/* No inner scroll now: the whole page scrolls on the Y axis
                  while the filter panel stays sticky. */}
              <Box
                ref={resultsRef}
                onScroll={handleResultsScroll}
                sx={{
                  maxHeight: "none",
                  overflowY: "visible",
                  overflowX: "clip",
                  pr: 0,
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: { xs: 5, sm: 8 } }}>
                    <CircularProgress sx={{ color: saffron[500] }} />
                  </Box>
                ) : sortedVisibleRides.length > 0 ? (
                  <>
                    <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
                      {sortedVisibleRides.map((ride) => (
                        // <RideCard key={ride._id} ride={ride} />
                        <RideList key={ride._id} ride={ride} />
                      ))}
                    </Stack>

                    {loadingMore && (
                      <Box
                        sx={{ display: "flex", justifyContent: "center", py: 2 }}
                      >
                        <CircularProgress
                          size={26}
                          sx={{ color: saffron[500] }}
                        />
                      </Box>
                    )}

                    {!hasMore && (
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "text.secondary",
                          fontSize: { xs: "0.75rem", sm: "0.8rem" },
                          py: 2,
                        }}
                      >
                        No more rides
                      </Typography>
                    )}
                  </>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: "divider",
                      textAlign: "center",
                      py: { xs: 3.5, sm: 5 },
                      px: { xs: 2, sm: 4 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="text.primary"
                      sx={{ fontSize: { xs: 15, sm: 16, md: 17 } }}
                    >
                      No rides match your search.
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, fontSize: { xs: 12.5, sm: 14 } }}
                    >
                      Try a wider radius or post a request so drivers can find
                      you.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setOpen(true)}
                      sx={{
                        mt: 2.5,
                        px: 3,
                        py: { xs: 0.8, sm: 1 },
                        borderRadius: 999,
                        backgroundColor: RUST,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: { xs: 13, sm: 14 },
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: RUST_DARK,
                          boxShadow: "none",
                        },
                      }}
                    >
                      Post a Ride
                    </Button>
                  </Paper>
                )}
              </Box>

              {/* ─── Info footer ─── */}
              <Box
                sx={{
                  mt: 2,
                  p: { xs: 1.25, sm: 1.75 },
                  borderRadius: 2,
                  bgcolor: "#EAF3FB",
                  border: "1px solid #CFE2F3",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 11.5, sm: 12.5 },
                    color: "#1A3E8A",
                    lineHeight: 1.55,
                  }}
                >
                  Cards show city or airport only. The exact pickup address and
                  phone number are shared after the driver accepts your request.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── Post ride dialog ─── */}
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") return;
          setOpen(false);
        }}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "80%", md: "90%" },
            maxWidth: { sm: 600, md: 800 },
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 3 },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            position: "relative",
            fontWeight: 700,
            fontSize: { xs: "1.05rem", sm: "1.25rem" },
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
            p: { xs: 1, sm: 2 },
            overflowY: "auto",
            maxHeight: { xs: "100vh", sm: "75vh" },
          }}
        >
          <OfferRide setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}