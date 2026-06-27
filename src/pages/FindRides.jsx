import React, { useEffect, useRef, useState } from "react";
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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

import RideCard from "../components/RideCard.jsx";
import Api from "../Api";

// ── Saffron design tokens ──────────────────────────────────────────────────
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

const inputFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "0.82rem",
    background: saffron[50],
    "& fieldset": { borderColor: saffron[200] },
    "&:hover fieldset": { borderColor: saffron[400] },
    "&.Mui-focused fieldset": { borderColor: saffron[500], borderWidth: 2 },
  },
  "& .MuiInputLabel-root": { fontSize: "0.8rem", color: saffron[600] },
  "& .MuiInputLabel-root.Mui-focused": { color: saffron[600] },
};

const selectSx = {
  borderRadius: "10px",
  fontSize: "0.82rem",
  background: saffron[50],
  "& .MuiOutlinedInput-notchedOutline": { borderColor: saffron[200] },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: saffron[400] },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: saffron[500], borderWidth: 2 },
};

const TRANSPORT_OPTIONS = [
  { label: "All", value: "", icon: null },
  { label: "Car", value: "Car", icon: <DirectionsCarIcon sx={{ fontSize: 14 }} /> },
  { label: "Bike", value: "Bike", icon: <TwoWheelerIcon sx={{ fontSize: 14 }} /> },
  { label: "Bus", value: "Bus", icon: <DirectionsBusIcon sx={{ fontSize: 14 }} /> },
  { label: "Train", value: "Train", icon: <TrainIcon sx={{ fontSize: 14 }} /> },
  { label: "Flight", value: "Flight", icon: <FlightIcon sx={{ fontSize: 14 }} /> },
];

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Any", value: "Any" },
];

const FUEL_OPTIONS = [
  { label: "All", value: "" },
  { label: "Yes", value: "true" },
  { label: "No", value: "false" },
];

// ── How tall is your navbar? Adjust this value to match. ──────────────────
const NAVBAR_HEIGHT = 64; // px

// Pixels the results area must scroll before the open filter panel
// auto-collapses. Small enough to feel responsive, large enough to
// ignore accidental micro-scrolls/bounce.
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

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false); // collapsed by default

  const [searchFrom, setSearchFrom] = useState("");
  const [searchDestination, setSearchDestination] = useState("");

  // Staged filter values: edited live inside the panel, but only
  // committed to `appliedFilters` (and therefore the results) on Apply.
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  const resultsRef = useRef(null);
  const scrollStartRef = useRef(0);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await axios.get(`${Api}/rides/get`);
      setRides(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ── Filter panel open/close + scroll-to-collapse ──────────────────────
  const openFilters = () => {
    scrollStartRef.current = resultsRef.current ? resultsRef.current.scrollTop : 0;
    setFiltersOpen(true);
  };

  const closeFilters = () => setFiltersOpen(false);

  const toggleFilters = () => {
    if (filtersOpen) closeFilters();
    else openFilters();
  };

  const handleResultsScroll = (e) => {
    if (!filtersOpen) return;
    const delta = Math.abs(e.target.scrollTop - scrollStartRef.current);
    if (delta > SCROLL_COLLAPSE_THRESHOLD) {
      closeFilters();
    }
  };

  // ── Apply / clear ──────────────────────────────────────────────────────
  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    closeFilters();
  };

  const clearFilters = () => {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Language only applies to Flight; drop it if mode changes away from Flight
      if (key === "transportMode" && value !== "Flight") next.language = "";
      return next;
    });
  };

  const { transportMode, gender, fuelSharing, language } = draftFilters;
  const {
    transportMode: appliedTransportMode,
    gender: appliedGender,
    fuelSharing: appliedFuelSharing,
    language: appliedLanguage,
  } = appliedFilters;

  // Chips reflect APPLIED filters (what's actually affecting results),
  // each chip's clear button removes that filter immediately and re-applies.
  const activeFilters = [
    appliedTransportMode && {
      key: "transport",
      label: appliedTransportMode,
      clear: () => {
        const next = { ...appliedFilters, transportMode: "", language: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedGender && {
      key: "gender",
      label: appliedGender,
      clear: () => {
        const next = { ...appliedFilters, gender: "" };
        setAppliedFilters(next);
        setDraftFilters(next);
      },
    },
    appliedFuelSharing !== "" && {
      key: "fuel",
      label: `Fuel: ${appliedFuelSharing === "true" ? "Yes" : "No"}`,
      clear: () => {
        const next = { ...appliedFilters, fuelSharing: "" };
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
  ].filter(Boolean);

  const draftFilterCount = [transportMode, gender, fuelSharing !== "" ? fuelSharing : "", language].filter(
    Boolean
  ).length;

  // ── Filtering uses APPLIED filters + live search text ─────────────────
  const filteredRides = rides.filter((ride) => {
    const fromValue =
      ride.modeOfTravel === "Flight"
        ? `${ride.fromAirport || ""} ${ride.fromCountry || ""} ${ride.from || ""}`
        : ride.from || "";

    const destinationValue =
      ride.modeOfTravel === "Flight"
        ? `${ride.toAirport || ""} ${ride.toCountry || ""} ${ride.destination || ""}`
        : ride.destination || "";

    const fromMatch = fromValue.toLowerCase().includes(searchFrom.toLowerCase());
    const destinationMatch = destinationValue.toLowerCase().includes(searchDestination.toLowerCase());
    const transportMatch = !appliedTransportMode || ride.modeOfTravel === appliedTransportMode;
    const genderMatch = !appliedGender || ride.genderPreference === appliedGender;
    const fuelMatch =
      appliedFuelSharing === "" ||
      ride.modeOfTravel === "Flight" ||
      ride.fuelSharing?.toString() === appliedFuelSharing;
    const languageMatch =
      !appliedLanguage || ride.language?.toLowerCase().includes(appliedLanguage.toLowerCase());

    return fromMatch && destinationMatch && transportMatch && genderMatch && fuelMatch && languageMatch;
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: saffron[50],
        }}
      >
        <CircularProgress sx={{ color: saffron[500] }} />
      </Box>
    );
  }

  return (
    // Outer wrapper: full viewport height minus navbar, no overflow on itself
    <Box
      sx={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: { xs: "100%", sm: 720 },
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* ── Sticky block: ONLY the hero + From/To/Filter search bar.
             The expanded filter panel lives OUTSIDE this sticky block,
             so it scrolls/collapses away instead of staying pinned. ── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
          // background: saffron[50],
          pb: 1,
        }}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <Box
          sx={{
            color: "#000000",
            pt: { xs: 2.5, sm: 4, md: 5 },
            pb: { xs: 2.5, sm: 3, md: 3.5 },
            px: { xs: 1.5, sm: 3 },
          }}
        >
          <Container maxWidth="md" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
            {/* Title */}
            <Typography
              fontWeight={800}
              sx={{
                fontSize: { xs: "1rem", sm: "1.45rem", md: "1.8rem" },
                letterSpacing: "0.2px",
                lineHeight: 1.25,
              }}
            >
              Find Rides & Flight Companions
            </Typography>

            {/* Search row: From / To / Filter — this is what stays sticky */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.75, sm: 1.25 },
                alignItems: "center",
                flexDirection: "row",
                mt: { xs: 1, sm: 1.5 },
              }}
            >
              {/* From */}
              <TextField
                size="small"
                placeholder={isMobile ? "From / City" : " From / City / Airport"}
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: saffron[500], fontSize: { xs: 14, sm: 17 } }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    background: "rgba(255,255,255,0.96)",
                    fontSize: { xs: "0.7rem", sm: "0.84rem" },
                    height: { xs: 34, sm: 40 },
                    pr: 0.5,
                    "& fieldset": { border: "none" },
                    "& input": { py: 0, px: { xs: 1, sm: 1 } },
                    "& .MuiInputAdornment-root": { ml: { xs: 0.75, sm: 1 }, mr: { xs: 0.25, sm: 0.5 } },
                  },
                }}
              />

              {/* To */}
              <TextField
                size="small"
                placeholder={isMobile ? "To / City" : " To / City / Airport"}
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: saffron[500], fontSize: { xs: 14, sm: 17 } }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    background: "rgba(255,255,255,0.96)",
                    fontSize: { xs: "0.7rem", sm: "0.84rem" },
                    height: { xs: 34, sm: 40 },
                    pr: 0.5,
                    "& fieldset": { border: "none" },
                    "& input": { py: 0, px: { xs: 1, sm: 1 } },
                    "& .MuiInputAdornment-root": { ml: { xs: 0.75, sm: 1 }, mr: { xs: 0.25, sm: 0.5 } },
                  },
                }}
              />

              {/* Filter toggle button */}
              <Button
                onClick={toggleFilters}
                sx={{
                  flexShrink: 0,
                  borderRadius: "50px",
                  background: "#ffff",
                  backdropFilter: "blur(6px)",
                  border: "none",
                  color: "#100f0f",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.7rem", sm: "0.82rem" },
                  height: { xs: 34, sm: 40 },
                  minWidth: { xs: "auto", sm: 100 },
                  px: { xs: 1.25, sm: 2 },
                  gap: { xs: 0.4, sm: 0.75 },
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  "&:hover": { background: `${saffron[500]}`, boxShadow: "none", color: "#ffff" },
                }}
              >
                <TuneIcon sx={{ fontSize: { xs: 14, sm: 17 } }} />
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
                </Box>
                {isMobile && activeFilters.length > 0 && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#fff",
                      flexShrink: 0,
                    }}
                  />
                )}
              </Button>
            </Box>

            {/* Applied filter chips live just under the sticky search row
                 so the user can see/clear them without opening the panel. */}
            {activeFilters.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.5, sm: 0.75 }, mt: 1.25 }}>
                {activeFilters.map((f) => (
                  <Chip
                    key={f.key}
                    label={f.label}
                    onDelete={f.clear}
                    deleteIcon={<CloseIcon />}
                    size="small"
                    sx={{
                      background: "rgba(255,255,255,0.9)",
                      border: `1px solid ${saffron[300]}`,
                      color: saffron[800],
                      fontWeight: 600,
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      height: { xs: 22, sm: 26 },
                      "& .MuiChip-deleteIcon": { color: saffron[500], fontSize: { xs: "0.8rem", sm: "0.95rem" } },
                      "& .MuiChip-label": { px: { xs: 0.75, sm: 1 } },
                    }}
                  />
                ))}
              </Box>
            )}
          </Container>
        </Box>
      </Box>

      {/* ── Scrollable results area. The filter panel renders as the
             FIRST thing inside this scrollable area (not in the sticky
             block), so: scrolling naturally moves it out of view, AND
             we additionally force-collapse it past a small scroll delta
             so it doesn't loiter half-visible. ── */}
      <Box
        ref={resultsRef}
        onScroll={handleResultsScroll}
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          pb: { xs: 4, sm: 6 },
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-track": { background: saffron[50] },
          "&::-webkit-scrollbar-thumb": { background: saffron[300], borderRadius: 4 },
        }}
      >
        <Container maxWidth="md" disableGutters sx={{ px: { xs: 1.5, sm: 3 } }}>
          {/* ── Filter Panel (not sticky — scrolls/collapses away) ──── */}
          <Collapse in={filtersOpen}>
            <Box
              sx={{
                background: "#fff",
                borderRadius: { xs: 3, md: 4 },
                border: `1.5px solid ${saffron[100]}`,
                // boxShadow: `0 4px 20px rgba(245,147,0,0.10)`,
                p: { xs: 1.75, sm: 3 },
                mt: { xs: 1.5, sm: 2 },
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              {/* Transport chips */}
              <Box mb={2}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "0.65rem", sm: "0.7rem" },
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: saffron[700],
                    display: "block",
                    mb: 1,
                  }}
                >
                  Mode of Travel
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.6, sm: 1 } }}>
                  {TRANSPORT_OPTIONS.map((opt) => {
                    const selected = transportMode === opt.value;
                    return (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        icon={opt.icon}
                        onClick={() => updateDraft("transportMode", opt.value)}
                        sx={{
                          borderRadius: "20px",
                          border: `1.5px solid ${selected ? saffron[500] : saffron[200]}`,
                          background: selected ? saffron[500] : "#fff",
                          color: selected ? "#fff" : saffron[700],
                          fontWeight: 600,
                          fontSize: { xs: "0.68rem", sm: "0.86rem" },
                          height: { xs: 24, sm: 30 },
                          cursor: "pointer",
                          transition: "all 0.15s",
                          "& .MuiChip-label": { px: { xs: 1, sm: 1.8 } },
                          "&:hover": {
                            background: selected ? saffron[600] : saffron[50],
                            borderColor: saffron[400],
                          },
                          "& .MuiChip-icon": {
                            color: selected ? "#fff" : saffron[500],
                            ml: { xs: 0.5, sm: 0.75 },
                            mr: { xs: "-4px", sm: "-2px" },
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* Dropdowns row */}
              <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="flex-end">
                {/* Gender */}
                <Grid item xs={6} sm={4} md={3}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: saffron[700],
                      display: "block",
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    Gender
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={gender}
                      displayEmpty
                      onChange={(e) => updateDraft("gender", e.target.value)}
                      sx={{ ...selectSx, fontSize: { xs: "0.7rem", sm: "0.82rem" }, height: { xs: 30, sm: 36 } }}
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <MenuItem key={g.value} value={g.value} sx={{ fontSize: { xs: "0.7rem", sm: "0.85rem" } }}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Fuel Sharing */}
                <Grid item xs={6} sm={4} md={3}>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: saffron[700],
                      display: "block",
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    Fuel Sharing
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={fuelSharing}
                      displayEmpty
                      onChange={(e) => updateDraft("fuelSharing", e.target.value)}
                      sx={{ ...selectSx, fontSize: { xs: "0.7rem", sm: "0.82rem" }, height: { xs: 30, sm: 36 } }}
                    >
                      {FUEL_OPTIONS.map((f) => (
                        <MenuItem key={f.value} value={f.value} sx={{ fontSize: { xs: "0.7rem", sm: "0.85rem" } }}>
                          {f.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Language — Flight only */}
                {transportMode === "Flight" && (
                  <Grid item xs={12} sm={4} md={6}>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: { xs: "0.6rem", sm: "0.7rem" },
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: saffron[700],
                        display: "block",
                        mt: 1,
                      }}
                    >
                      Language
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Tamil, English, Hindi…"
                      value={language}
                      onChange={(e) => updateDraft("language", e.target.value)}
                      sx={{
                        ...inputFieldSx,
                        "& .MuiOutlinedInput-root": {
                          ...inputFieldSx["& .MuiOutlinedInput-root"],
                          fontSize: { xs: "0.7rem", sm: "0.82rem" },
                          height: { xs: 30, sm: 36 },
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
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: { xs: 1.5, sm: 2.5 },
                }}
              >
                <Button
                  startIcon={<FilterListOffIcon sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                  onClick={clearFilters}
                  sx={{
                    borderRadius: "50px",
                    border: `1.5px solid ${saffron[300]}`,
                    color: saffron[700],
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.82rem" },
                    px: { xs: 1.5, sm: 2.5 },
                    height: { xs: 30, sm: 36 },
                    textTransform: "none",
                    "&:hover": { background: saffron[50], borderColor: saffron[300], color: saffron[500] },
                  }}
                >
                  Clear all
                </Button>

                <Button
                  onClick={applyFilters}
                  sx={{
                    borderRadius: "50px",
                    border: "none",
                    background: saffron[500],
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: { xs: "0.72rem", sm: "0.85rem" },
                    px: { xs: 2, sm: 3 },
                    height: { xs: 32, sm: 38 },
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { background: saffron[600] },
                  }}
                >
                  Apply
                  {/* {draftFilterCount > 0 ? ` (${draftFilterCount})` : ""} */}
                </Button>
              </Box>
            </Box>
          </Collapse>

          {/* ── Results bar ── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: { xs: 0.75, sm: 1 },
              mb: { xs: 1.5, sm: 2 },
              mt: { xs: 1, sm: 1.5 },
            }}
          >
            <Typography fontWeight={700} sx={{ color: saffron[800], fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              {filteredRides.length}{" "}
              <Typography component="span" fontWeight={400} color="text.secondary" fontSize="inherit">
                {filteredRides.length === 1 ? "result" : "results"} found
              </Typography>
            </Typography>
          </Box>

          {/* ── Ride cards ── */}
          {filteredRides.length > 0 ? (
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {filteredRides.map((ride) => (
                <Grid item xs={12} sm={6} md={4} key={ride._id}>
                  <RideCard ride={ride} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                background: "#fff",
                borderRadius: { xs: 3, sm: 4 },
                border: `1.5px dashed ${saffron[200]}`,
                textAlign: "center",
                py: { xs: 3, sm: 5 },
                px: { xs: 2, sm: 4 },
              }}
            >
              <Typography fontSize={{ xs: "2rem", sm: "2.5rem" }} mb={0.75}>
                🔍
              </Typography>
              <Typography fontWeight={700} color={saffron[700]} mb={0.5} fontSize={{ xs: "0.9rem", sm: "1rem" }}>
                No rides found
              </Typography>
              <Typography color="text.secondary" fontSize={{ xs: "0.78rem", sm: "0.88rem" }}>
                Try adjusting your filters or search terms
              </Typography>
              <Button
                onClick={clearFilters}
                sx={{
                  mt: 2,
                  borderRadius: "50px",
                  border: `1.5px solid ${saffron[300]}`,
                  color: saffron[700],
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  px: { xs: 2, sm: 2.5 },
                  height: { xs: 32, sm: 36 },
                  textTransform: "none",
                  "&:hover": { background: saffron[50], borderColor: saffron[500] },
                }}
              >
                Clear filters
              </Button>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}