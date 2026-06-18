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
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
} from "@mui/material";

import RideCard from "../components/RideCard.jsx";
import Api from "../Api";

export default function FindRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchFrom, setSearchFrom] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [transportMode, setTransportMode] = useState("");
  const [gender, setGender] = useState("");
  const [fuelSharing, setFuelSharing] = useState("");
  const [language, setLanguage] = useState("");

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

  const clearFilters = () => {
    setSearchFrom("");
    setSearchDestination("");
    setTransportMode("");
    setGender("");
    setFuelSharing("");
    setLanguage("");
  };

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

    const destinationMatch = destinationValue
      .toLowerCase()
      .includes(searchDestination.toLowerCase());

    const transportMatch = !transportMode || ride.modeOfTravel === transportMode;

    const genderMatch = !gender || ride.genderPreference === gender;

    const fuelMatch =
      fuelSharing === "" ||
      ride.modeOfTravel === "Flight" ||
      ride.fuelSharing?.toString() === fuelSharing;

    const languageMatch =
      !language ||
      ride.language?.toLowerCase().includes(language.toLowerCase());

    return (
      fromMatch &&
      destinationMatch &&
      transportMatch &&
      genderMatch &&
      fuelMatch &&
      languageMatch
    );
  });

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        Find Rides & Flight Companions
      </Typography>

      <Paper
        sx={{
          mb: 3,
          p: 2,
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="From"
              placeholder="City / Airport / Country"
              value={searchFrom}
              onChange={(e) => setSearchFrom(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Destination"
              placeholder="City / Airport / Country"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Transport</InputLabel>
              <Select
                value={transportMode}
                label="Transport"
                onChange={(e) => setTransportMode(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Car">Car</MenuItem>
                <MenuItem value="Bike">Bike</MenuItem>
                <MenuItem value="Bus">Bus</MenuItem>
                <MenuItem value="Train">Train</MenuItem>
                <MenuItem value="Flight">Flight</MenuItem>
           
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Any">Any</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Fuel Share</InputLabel>
              <Select
                value={fuelSharing}
                label="Fuel Share"
                onChange={(e) => setFuelSharing(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {transportMode === "Flight" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Language"
                placeholder="Tamil, English, Hindi"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Button variant="outlined" fullWidth onClick={clearFilters}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        {filteredRides.length} results found
      </Typography>

      {filteredRides.length > 0 ? (
        filteredRides.map((ride) => <RideCard key={ride._id} ride={ride} />)
      ) : (
        <Box textAlign="center" py={5}>
          <Typography color="text.secondary">
            No rides found.
          </Typography>
        </Box>
      )}
    </Container>
  );
}