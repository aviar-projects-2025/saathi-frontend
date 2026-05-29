import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useApp } from "../context/AppContext.jsx";
import RideCard from "../components/RideCard.jsx";

const filters = ["All", "Airport", "Intercity", "Temple", "Parents", "Late Night"];

export default function FindRides() {
  const { rides } = useApp();
  const [active, setActive] = useState("All");
  const [mode, setMode] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = rides.filter((r) => {
    const matchFilter =
      active === "All" ||
      (active === "Airport" && r.type === "airport") ||
      (active === "Intercity" && r.type === "intercity") ||
      (active === "Temple" && r.type === "temple") ||
      (active === "Parents" && r.tags?.includes("parents")) ||
      (active === "Late Night" && r.tags?.includes("late-night"));

    const matchMode =
      mode === "all" ||
      (mode === "offering" && r.mode === "offering") ||
      (mode === "requesting" && r.mode === "requesting");

    const matchSearch =
      !search ||
      r.from.toLowerCase().includes(search.toLowerCase()) ||
      r.to.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchMode && matchSearch;
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #102A43 0%, #1A3C5E 55%, #E85D26 100%)",
          pt: 5,
          pb: 5,
          px: { xs: 2.5, sm: 4, md: 6 },
          borderBottomLeftRadius: { xs: 28, md: 42 },
          borderBottomRightRadius: { xs: 28, md: 42 },
          boxShadow: "0 18px 35px rgba(26,60,94,0.22)",
        }}
      >
        <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
          <Typography variant="h4" fontWeight={900} color="white" mb={0.5}>
            Find Rides
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.78)", mb: 3 }}
          >
            Search community rides near you
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by city or route..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              maxWidth: 720,
              bgcolor: "rgba(255,255,255,0.96)",
              borderRadius: 999,
              boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
              "& fieldset": { border: "none" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                height: 52,
                px: 1,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#1A3C5E" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 2, sm: 4, md: 6 },
          mt: 3,
        }}
      >
        {/* Mode Toggle */}
        <Paper
          elevation={0}
          sx={{
            p: 0.7,
            mb: 2.5,
            borderRadius: 4,
            bgcolor: "white",
            maxWidth: 520,
            boxShadow: "0 10px 24px rgba(16,42,67,0.08)",
          }}
        >
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            size="small"
            fullWidth
            sx={{
              "& .MuiToggleButton-root": {
                border: "none",
                borderRadius: "14px !important",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.85rem",
                color: "#5A6A7A",
              },
              "& .Mui-selected": {
                bgcolor: "#E85D26 !important",
                color: "white !important",
              },
            }}
          >
            <ToggleButton value="all">All Rides</ToggleButton>
            <ToggleButton value="offering">Offering</ToggleButton>
            <ToggleButton value="requesting">Requesting</ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Filter Chips */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: 1,
            mb: 3,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {filters.map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setActive(f)}
              sx={{
                px: 1,
                height: 36,
                fontWeight: 800,
                whiteSpace: "nowrap",
                borderRadius: 999,
                bgcolor: active === f ? "#1A3C5E" : "white",
                color: active === f ? "white" : "#1A3C5E",
                border: "1px solid rgba(26,60,94,0.12)",
                boxShadow:
                  active === f
                    ? "0 8px 18px rgba(26,60,94,0.22)"
                    : "0 6px 16px rgba(0,0,0,0.05)",
                "&:hover": {
                  bgcolor: active === f ? "#1A3C5E" : "#FFF1EA",
                },
              }}
            />
          ))}
        </Stack>

        {/* Result Heading */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={900}>
            Available Rides
          </Typography>

          <Typography variant="body2" fontWeight={800} color="text.secondary">
            {filtered.length} found
          </Typography>
        </Box>

        {/* Results */}
        {filtered.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
              borderRadius: 5,
              bgcolor: "white",
              boxShadow: "0 10px 28px rgba(16,42,67,0.08)",
            }}
          >
            <Typography fontSize={56}>🚗</Typography>
            <Typography variant="h6" fontWeight={900} mt={1}>
              No rides found
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Try another filter or post a new ride
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2.5,
              alignItems: "start",
            }}
          >
            {filtered.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}