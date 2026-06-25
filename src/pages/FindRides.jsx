// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   CircularProgress,
//   Box,
//   Grid,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Paper,
//   Button,
// } from "@mui/material";

// import RideCard from "../components/RideCard.jsx";
// import Api from "../Api";

// export default function FindRides() {
//   const [rides, setRides] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [searchFrom, setSearchFrom] = useState("");
//   const [searchDestination, setSearchDestination] = useState("");
//   const [transportMode, setTransportMode] = useState("");
//   const [gender, setGender] = useState("");
//   const [fuelSharing, setFuelSharing] = useState("");
//   const [language, setLanguage] = useState("");

//   useEffect(() => {
//     fetchRides();
//   }, []);

//   const fetchRides = async () => {
//     try {
//       const res = await axios.get(`${Api}/rides/get`);
//       setRides(res.data.data || []);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearFilters = () => {
//     setSearchFrom("");
//     setSearchDestination("");
//     setTransportMode("");
//     setGender("");
//     setFuelSharing("");
//     setLanguage("");
//   };

//   const filteredRides = rides.filter((ride) => {
//     const fromValue =
//       ride.modeOfTravel === "Flight"
//         ? `${ride.fromAirport || ""} ${ride.fromCountry || ""} ${ride.from || ""}`
//         : ride.from || "";

//     const destinationValue =
//       ride.modeOfTravel === "Flight"
//         ? `${ride.toAirport || ""} ${ride.toCountry || ""} ${ride.destination || ""}`
//         : ride.destination || "";

//     const fromMatch = fromValue.toLowerCase().includes(searchFrom.toLowerCase());

//     const destinationMatch = destinationValue
//       .toLowerCase()
//       .includes(searchDestination.toLowerCase());

//     const transportMatch = !transportMode || ride.modeOfTravel === transportMode;

//     const genderMatch = !gender || ride.genderPreference === gender;

//     const fuelMatch =
//       fuelSharing === "" ||
//       ride.modeOfTravel === "Flight" ||
//       ride.fuelSharing?.toString() === fuelSharing;

//     const languageMatch =
//       !language ||
//       ride.language?.toLowerCase().includes(language.toLowerCase());

//     return (
//       fromMatch &&
//       destinationMatch &&
//       transportMatch &&
//       genderMatch &&
//       fuelMatch &&
//       languageMatch
//     );
//   });

//   if (loading) {
//     return (
//       <Box textAlign="center" mt={5}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Container maxWidth="md" sx={{ py: 3 }}>
//       <Typography variant="h5" fontWeight={800} mb={2}>
//         Find Rides & Flight Companions
//       </Typography>

//       <Paper
//         sx={{
//           mb: 3,
//           p: 2,
//           bgcolor: "#fff",
//           borderRadius: 4,
//           boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
//         }}
//       >
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               size="small"
//               label="From"
//               placeholder="City / Airport / Country"
//               value={searchFrom}
//               onChange={(e) => setSearchFrom(e.target.value)}
//             />
//           </Grid>

//           <Grid item xs={12} md={3}>
//             <TextField
//               fullWidth
//               size="small"
//               label="Destination"
//               placeholder="City / Airport / Country"
//               value={searchDestination}
//               onChange={(e) => setSearchDestination(e.target.value)}
//             />
//           </Grid>

//           <Grid item xs={12} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Transport</InputLabel>
//               <Select
//                 value={transportMode}
//                 label="Transport"
//                 onChange={(e) => setTransportMode(e.target.value)}
//               >
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="Car">Car</MenuItem>
//                 <MenuItem value="Bike">Bike</MenuItem>
//                 <MenuItem value="Bus">Bus</MenuItem>
//                 <MenuItem value="Train">Train</MenuItem>
//                 <MenuItem value="Flight">Flight</MenuItem>

//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid item xs={12} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Gender</InputLabel>
//               <Select
//                 value={gender}
//                 label="Gender"
//                 onChange={(e) => setGender(e.target.value)}
//               >
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="Male">Male</MenuItem>
//                 <MenuItem value="Female">Female</MenuItem>
//                 <MenuItem value="Any">Any</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid item xs={12} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Fuel Share</InputLabel>
//               <Select
//                 value={fuelSharing}
//                 label="Fuel Share"
//                 onChange={(e) => setFuelSharing(e.target.value)}
//               >
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="true">Yes</MenuItem>
//                 <MenuItem value="false">No</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           {transportMode === "Flight" && (
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 label="Language"
//                 placeholder="Tamil, English, Hindi"
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value)}
//               />
//             </Grid>
//           )}

//           <Grid item xs={12}>
//             <Button variant="outlined" fullWidth onClick={clearFilters}>
//               Clear Filters
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>

//       <Typography variant="subtitle1" fontWeight={700} mb={2}>
//         {filteredRides.length} results found
//       </Typography>

//       {filteredRides.length > 0 ? (
//         filteredRides.map((ride) => <RideCard key={ride._id} ride={ride} />)
//       ) : (
//         <Box textAlign="center" py={5}>
//           <Typography color="text.secondary">
//             No rides found.
//           </Typography>
//         </Box>
//       )}
//     </Container>
//   );
// }



import React, { useEffect, useState } from "react";
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
    borderRadius: "12px",
    fontSize: "0.88rem",
    background: saffron[50],
    "& fieldset": { borderColor: saffron[200] },
    "&:hover fieldset": { borderColor: saffron[400] },
    "&.Mui-focused fieldset": { borderColor: saffron[500], borderWidth: 2 },
  },
  "& .MuiInputLabel-root": { fontSize: "0.85rem", color: saffron[600] },
  "& .MuiInputLabel-root.Mui-focused": { color: saffron[600] },
};

const selectSx = {
  borderRadius: "12px",
  fontSize: "0.85rem",
  background: saffron[50],
  "& .MuiOutlinedInput-notchedOutline": { borderColor: saffron[200] },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: saffron[400] },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: saffron[500], borderWidth: 2 },
};

const TRANSPORT_OPTIONS = [
  { label: "All", value: "", icon: null },
  { label: "Car", value: "Car", icon: <DirectionsCarIcon sx={{ fontSize: 16 }} /> },
  { label: "Bike", value: "Bike", icon: <TwoWheelerIcon sx={{ fontSize: 16 }} /> },
  { label: "Bus", value: "Bus", icon: <DirectionsBusIcon sx={{ fontSize: 16 }} /> },
  { label: "Train", value: "Train", icon: <TrainIcon sx={{ fontSize: 16 }} /> },
  { label: "Flight", value: "Flight", icon: <FlightIcon sx={{ fontSize: 16 }} /> },
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

export default function FindRides() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [gender, setGender] = useState("");
  const [fuelSharing, setFuelSharing] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => { fetchRides(); }, []);

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

  const clearFilters = () => {
    setSearchFrom("");
    setSearchDestination("");
    setTransportMode("");
    setGender("");
    setFuelSharing("");
    setLanguage("");
  };

  const activeFilters = [
    transportMode && { key: "transport", label: transportMode, clear: () => setTransportMode("") },
    gender && { key: "gender", label: gender, clear: () => setGender("") },
    fuelSharing !== "" && { key: "fuel", label: `Fuel: ${fuelSharing === "true" ? "Yes" : "No"}`, clear: () => setFuelSharing("") },
    language && { key: "lang", label: `Lang: ${language}`, clear: () => setLanguage("") },
  ].filter(Boolean);

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
    const transportMatch = !transportMode || ride.modeOfTravel === transportMode;
    const genderMatch = !gender || ride.genderPreference === gender;
    const fuelMatch =
      fuelSharing === "" || ride.modeOfTravel === "Flight" ||
      ride.fuelSharing?.toString() === fuelSharing;
    const languageMatch = !language || ride.language?.toLowerCase().includes(language.toLowerCase());

    return fromMatch && destinationMatch && transportMatch && genderMatch && fuelMatch && languageMatch;
  });

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: saffron[50]
      }}>
        <CircularProgress sx={{ color: saffron[500] }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh", background: `linear-gradient(160deg, ${saffron[50]} 0%, #FFFDF8 60%, #FFF5E0 100%)`, pb: 6, width: '100%',
      maxWidth: { xs: '100%', sm: 750 },
      // mx: 'auto',
      px: { xs: 2, sm: 3 },
      py: { xs: 2, sm: 3 },
      boxSizing: 'border-box',
    }}
    >

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${saffron[500]} 0%, ${saffron[600]} 100%)`,
        color: "#fff",
        pt: { xs: 3, md: 5 },
        pb: { xs: 8, sm: 6, md: 7 }, // extra bottom space on mobile so the panel's negative margin never collides with wrapped title text
        px: { xs: 2, sm: 3 },
      }}>
        <Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
          <Typography variant="h5" fontWeight={800}
            sx={{ fontSize: { xs: "1.15rem", sm: "1.55rem", md: "1.85rem" }, letterSpacing: "0.3px" }}>
            Find Rides & Flight Companions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 1.5, mb: 2, fontSize: { xs: "0.78rem", sm: "0.9rem" } }}>
            Search and filter rides tailored to your journey
          </Typography>

          {/* Search inputs */}
          <Grid container spacing={1.5} mt={1.5} alignItems="stretch">
            <Grid item xs={12} sm={6} md={5}>
              <TextField fullWidth size="small"
                placeholder="From — City / Airport "
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: saffron[500], fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    background: "rgba(255,255,255,0.96)",
                    fontSize: "0.85rem",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <TextField fullWidth size="small"
                placeholder="To — City / Airport"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: saffron[500], fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "50px",
                    background: "rgba(255,255,255,0.96)",
                    fontSize: "0.85rem",
                    "& fieldset": { border: "none" },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained"
                onClick={() => setFiltersOpen((o) => !o)}
                startIcon={<TuneIcon sx={{ fontSize: 18 }} />}
                sx={{
                  borderRadius: "50px",
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                  border: "1.5px solid rgba(255,255,255,0.55)",
                  color: "#fff",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.85rem",
                  minHeight: 40,
                  height: "100%",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { background: "rgba(255,255,255,0.28)", boxShadow: "none" },
                }}>
                Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Content ──────────────────────────────────────────── */}
      <Container maxWidth="md">

        {/* ── Filter Panel ── */}
        <Collapse in={filtersOpen}>
          <Box sx={{
            background: "#fff",
            borderRadius: { xs: 3, md: 4 },
            boxShadow: `0 8px 32px rgba(245,147,0,0.12)`,
            border: `1.5px solid ${saffron[100]}`,
            p: { xs: 2, sm: 3 },
            mt: { xs: -4, sm: -3, md: -4 },
            mx: { xs: 1, sm: 0 },
            position: "relative",
            zIndex: 1,
          }}>

            {/* Transport chips */}
            <Box mb={2.5}>
              <Typography component="span" sx={{
                fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.08em", color: saffron[700], mb: 1.5, display: "block",
              }}>
                Mode of Travel
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {TRANSPORT_OPTIONS.map((opt) => {
                  const selected = transportMode === opt.value;
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      icon={opt.icon}
                      onClick={() => setTransportMode(opt.value)}
                      sx={{
                        borderRadius: "12px",
                        border: `1.5px solid ${selected ? saffron[500] : saffron[200]}`,
                        background: selected ? saffron[500] : "#fff",
                        color: selected ? "#fff" : saffron[700],
                        fontWeight: 600,
                        fontSize: { xs: "0.72rem", sm: "0.78rem" },
                        height: { xs: 28, sm: 32 },
                        cursor: "pointer",
                        transition: "all 0.16s",
                        "&:hover": {
                          background: selected ? saffron[600] : saffron[50],
                          borderColor: saffron[400],
                        },
                        "& .MuiChip-icon": { color: selected ? "#fff" : saffron[500] },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Gender */}
              <Grid item xs={6} sm={4} md={3}>
                <Typography component="span" sx={{
                  fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: saffron[700], mb: 0.5, display: "block", mt: 2
                }}>
                  Gender
                </Typography>
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                  <Select value={gender} displayEmpty onChange={(e) => setGender(e.target.value)} sx={selectSx}>
                    {GENDER_OPTIONS.map((g) => (
                      <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fuel Sharing */}
              <Grid item xs={6} sm={4} md={3}>
                <Typography component="span" sx={{
                  fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: saffron[700], mb: 0.5, display: "block", mt: 2
                }}>
                  Fuel Sharing
                </Typography>
                <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                  <Select value={fuelSharing} displayEmpty onChange={(e) => setFuelSharing(e.target.value)} sx={selectSx}>
                    {FUEL_OPTIONS.map((f) => (
                      <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Language — Flight only */}
              {transportMode === "Flight" && (
                <Grid item xs={12} sm={4} md={6}>
                  <Typography component="span" sx={{
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: saffron[700], mb: 0.5, display: "block", mt: 2
                  }}>
                    Language
                  </Typography>
                  <TextField fullWidth size="small"
                    placeholder="Tamil, English, Hindi…"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    sx={{ mt: 0.5, ...inputFieldSx }}
                  />
                </Grid>
              )}
            </Grid>

            {/* Filter actions */}
            <Box sx={{
              display: "flex",
              justifyContent: { xs: "stretch", sm: "flex-end" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              mt: 1.5,
            }}>
              <Button startIcon={<FilterListOffIcon />} onClick={clearFilters}
                fullWidth={isMobile}
                sx={{
                  order: { xs: 2, sm: 1 },
                  borderRadius: "50px", border: `1.5px solid ${saffron[300]}`,
                  color: saffron[700], fontWeight: 600, fontSize: "0.82rem",
                  px: 2.5, textTransform: "none",
                  "&:hover": { background: saffron[50], borderColor: saffron[500] },
                }}>
                Clear all
              </Button>

              {isMobile && (
                <Button onClick={() => setFiltersOpen(false)}
                  fullWidth
                  sx={{
                    order: 1,
                    borderRadius: "50px",
                    background: `linear-gradient(90deg, ${saffron[500]} 0%, ${saffron[600]} 100%)`,
                    color: "#fff", fontWeight: 700, fontSize: "0.85rem", px: 3,
                    textTransform: "none",
                    boxShadow: `0 4px 14px rgba(245,147,0,0.35)`,
                    "&:hover": { background: `linear-gradient(90deg, ${saffron[600]} 0%, ${saffron[700]} 100%)` },
                  }}>
                  Show {filteredRides.length} results
                </Button>
              )}
            </Box>
          </Box>
        </Collapse>

        {/* ── Results bar ── */}
        <Box sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
          mt: 3,
        }}>
          <Typography fontWeight={700}
            sx={{ color: saffron[800], fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            {filteredRides.length}{" "}
            <Typography component="span" fontWeight={400} color="text.secondary" fontSize="inherit">
              {filteredRides.length === 1 ? "result" : "results"} found
            </Typography>
          </Typography>

          {activeFilters.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {activeFilters.map((f) => (
                <Chip key={f.key} label={f.label} onDelete={f.clear}
                  deleteIcon={<CloseIcon />} size="small"
                  sx={{
                    background: saffron[50], border: `1px solid ${saffron[300]}`,
                    color: saffron[800], fontWeight: 600, fontSize: "0.75rem", height: 26,
                    "& .MuiChip-deleteIcon": { color: saffron[500], fontSize: "0.95rem" },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* ── Ride cards ── */}
        {filteredRides.length > 0 ? (
          <Grid spacing={2}>
            {filteredRides.map((ride) => (
              <Grid item xs={12} sm={6} md={4} key={ride._id}>
                <RideCard ride={ride} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{ background: "#fff", borderRadius: 4, border: `1.5px dashed ${saffron[200]}`, textAlign: "center", padding: "20px 20px 20px 20px" }} >
            <Typography fontSize="2.5rem" mb={1}>🔍</Typography>
            <Typography fontWeight={700} color={saffron[700]} mb={0.5}>No rides found</Typography>
            <Typography color="text.secondary" fontSize="0.88rem">
              Try adjusting your filters or search terms
            </Typography>
            <Button onClick={clearFilters}
              sx={{
                mt: 2, borderRadius: "50px", border: `1.5px solid ${saffron[300]}`,
                color: saffron[700], fontWeight: 600, fontSize: "0.82rem",
                px: 2.5, textTransform: "none",
                "&:hover": { background: saffron[50], borderColor: saffron[500] },
              }}>
              Clear filters
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}