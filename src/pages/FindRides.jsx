import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Button,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import SortIcon from "@mui/icons-material/Sort";

import { useApp } from "../context/AppContext.jsx";
import { filterCategories } from "../data/mockData.jsx";
import RideCard from "../components/RideCard.jsx";
import Sidebar from "../components/Sidebar.jsx";

const cityRouteMap = {
  chennai: [
    "chennai",
    "villupuram",
    "trichy",
    "madurai",
    "tirunelveli",
    "kanyakumari",
  ],
  kanyakumari: [
    "kanyakumari",
    "tirunelveli",
    "madurai",
    "trichy",
    "villupuram",
    "chennai",
  ],
  madurai: ["madurai", "trichy", "villupuram", "chennai"],
  trichy: ["trichy", "villupuram", "chennai"],
};

const normalize = (text = "") => text.toLowerCase().trim();

export default function FindRides() {
  const {
    rides,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [userLocation, setUserLocation] = useState("");

  const filteredRides = useMemo(() => {
    const fromText = normalize(from);
    const toText = normalize(to);
    const normalSearch = normalize(searchQuery);

    return rides.filter((ride) => {
      const rideFrom = normalize(ride.from);
      const rideTo = normalize(ride.to);
      const rideName = normalize(ride.driver?.name || "");

      const routeCities =
        fromText && toText && cityRouteMap[fromText]
          ? cityRouteMap[fromText]
          : [];

      const fromIndex = routeCities.indexOf(fromText);
      const toIndex = routeCities.indexOf(toText);
      const rideFromIndex = routeCities.indexOf(rideFrom);
      const rideToIndex = routeCities.indexOf(rideTo);

      const isBetweenRoute =
        fromIndex !== -1 &&
        toIndex !== -1 &&
        rideFromIndex !== -1 &&
        rideToIndex !== -1 &&
        rideFromIndex >= fromIndex &&
        rideToIndex <= toIndex;

      const matchesFromTo =
        !fromText && !toText
          ? true
          : rideFrom.includes(fromText) ||
            rideTo.includes(toText) ||
            isBetweenRoute ||
            routeCities.includes(rideFrom) ||
            routeCities.includes(rideTo);

      const matchesSearch =
        !normalSearch ||
        rideFrom.includes(normalSearch) ||
        rideTo.includes(normalSearch) ||
        rideName.includes(normalSearch);

      const matchesFilter =
        activeFilter === "all" || ride.type === activeFilter;

      return matchesFromTo && matchesSearch && matchesFilter;
    });
  }, [rides, from, to, searchQuery, activeFilter]);

  const handleLocationAccess = () => {
    if (!navigator.geolocation) {
      alert("Location access is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
        setUserLocation("Current location detected");
      },
      () => {
        alert("Please allow location access");
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2, md: 3 },
        py: 3,
      }}
    >
  

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.25 }}>
            Community <span style={{ color: "#E8650A" }}>rides</span>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Showing {filteredRides.length} rides ·{" "}
            {userLocation || "Dallas area"}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1,
            mb: 2,
          }}
        >
          <TextField
            size="small"
            placeholder="From destination"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon
                    fontSize="small"
                    sx={{ color: "primary.main" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />

          <TextField
            size="small"
            placeholder="To destination"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon
                    fontSize="small"
                    sx={{ color: "#E8650A" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by city, airport, or community member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          />

          <Button
            startIcon={<LocationOnIcon />}
            variant="outlined"
            size="small"
            onClick={handleLocationAccess}
            sx={{ flexShrink: 0 }}
          >
            Location
          </Button>

          <Button
            startIcon={<MapIcon />}
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Map
          </Button>

          <Button
            startIcon={<SortIcon />}
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
          >
            Sort
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mb: 2.5, overflowX: "auto", pb: 0.5 }}
        >
          {filterCategories.map((cat) => (
            <Chip
              key={cat.value}
              label={`${cat.icon} ${cat.label}`}
              onClick={() => setActiveFilter(cat.value)}
              variant={activeFilter === cat.value ? "filled" : "outlined"}
              sx={{
                flexShrink: 0,
                fontWeight: activeFilter === cat.value ? 700 : 500,
                bgcolor:
                  activeFilter === cat.value
                    ? "primary.main"
                    : "transparent",
                color: activeFilter === cat.value ? "#fff" : "text.secondary",
                borderColor:
                  activeFilter === cat.value ? "primary.main" : "#E0D5CC",
                "&:hover": {
                  bgcolor:
                    activeFilter === cat.value ? "primary.dark" : "#FFF8F2",
                },
              }}
            />
          ))}
        </Stack>

        {filteredRides.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px dashed #E0D5CC",
              bgcolor: "#FFF8F2",
            }}
          >
            <Typography fontSize="2rem" mb={1}>
              🙏
            </Typography>
            <Typography fontWeight={600} color="text.secondary">
              No rides found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try changing From, To, or search keyword
            </Typography>
          </Paper>
        ) : (
          filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </Box>
    </Box>
  );
}