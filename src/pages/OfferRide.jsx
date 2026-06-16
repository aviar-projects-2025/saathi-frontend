import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Slider,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";

const steps = ["Trip details", "Preferences", "Review & post"];

export default function OfferRide() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const [showErrors, setShowErrors] = useState(false);

  const [form, setForm] = useState({
    from: "",
    destination: "",
    date: "",
    time: "",
    modeOfTravel: "Car",
    availableSeats: 1,
    fuelSharing: false,
    description: "",
    genderPreference: "Any",
  });

  const validateStep = () => {
    setShowErrors(true);

    if (step === 0) {
      if (!form.from.trim()) {
        toast.error("Please enter From location");
        return false;
      }

      if (!form.destination.trim()) {
        toast.error("Please enter Destination");
        return false;
      }

      if (!form.date) {
        toast.error("Please select Date");
        return false;
      }

      if (!form.time) {
        toast.error("Please select Time");
        return false;
      }

      if (!form.description.trim()) {
        toast.error("Please enter Description");
        return false;
      }
    }

    if (step === 1) {
      if (!form.genderPreference) {
        toast.error("Please select Gender Preference");
        return false;
      }

      if (form.availableSeats < 1) {
        toast.error("Available seats should be at least 1");
        return false;
      }
    }

    return true;
  };

  const update = (key, val) => {
    setForm((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const formReset = () => {
    setForm({
      from: "",
      destination: "",
      date: "",
      time: "",
      modeOfTravel: "Car",
      availableSeats: 1,
      fuelSharing: false,
      description: "",
      genderPreference: "Any",
    })
  }

  const handleSubmit = async () => {
    const payload = {
      createdBy: user?.id,
      from: form.from,
      destination: form.destination,
      startTime: new Date(`${form.date}T${form.time}`).toISOString(),
      modeOfTravel: form.modeOfTravel,
      availableSeats: form.availableSeats,
      fuelSharing: form.fuelSharing,
      description: form.description,
      genderPreference: form.genderPreference,
      status: "OPEN",
    };
    console.log("Ride Payload:", payload);
    try {
      axios.post(`${Api}/rides/`, payload)
        .then((res) => {
          console.log(res, 'res')
          toast.success("Ride Created Successfully...!")
          setStep(0);
          formReset()
          setShowErrors(true);
        })
    } catch (error) {
      console.log(error.message)
    }
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        // navigate("/myride"); // or "/find-ride"
        setSubmitted(false)
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [submitted, navigate]);

  if (submitted) {
    return (
      <Box
        sx={{
          maxWidth: 560,
          mx: "auto",
          px: 3,
          py: 6,
          textAlign: "center",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 72, color: "#52B788", mb: 2 }} />

        <Typography variant="h5" fontWeight={800} gutterBottom>
          Ride posted! 🙏
        </Typography>

        <Typography color="text.secondary" mb={3}>
          Your ride is now visible to the Saathi community.
        </Typography>

        {/* <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="outlined" onClick={() => navigate("/myride")}>
            View my rides
          </Button>

          <Button variant="contained" onClick={() => navigate("/find-ride")}>
            Browse rides
          </Button>
        </Stack> */}
      </Box>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        {/* <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/home")}
          sx={{ color: "text.secondary" }}
        >
          Back
        </Button> */}

        <Typography variant="h5" fontWeight={800}>
          Offer a Ride
        </Typography>
      </Box>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                "& .MuiStepLabel-label": {
                  fontSize: "0.8rem",
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {step === 0 && (
          <Stack spacing={2.5}>
            <TextField
              label="From"
              fullWidth
              size="small"
              value={form.from}
              onChange={(e) => update("from", e.target.value)}
              placeholder="Chennai"
              error={!form.from && showErrors}
              helperText={!form.from && showErrors ? "Required Field " : ""}
            />

            <TextField
              label="Destination"
              fullWidth
              size="small"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="Bangalore"
              error={!form.destination && showErrors}
              helperText={!form.destination && showErrors ? "Required Field " : ""}
            />
            <Stack direction="row" spacing={2}>
              <Stack sx={{ flex: 1 }}>
                <InputLabel>Date</InputLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!form.date && showErrors}
                  helperText={!form.date && showErrors ? "Required Field " : ""}
                />
              </Stack>

              <Stack sx={{ flex: 1 }}>
                <InputLabel>Time</InputLabel>
                <TextField
                  fullWidth
                  size="small"
                  type="time"
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={!form.time && showErrors}
                  helperText={!form.time && showErrors ? "Required Field " : ""}
                />
              </Stack>
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Mode of Travel</InputLabel>
              <Select
                value={form.modeOfTravel}
                label="Mode of Travel"
                onChange={(e) => update("modeOfTravel", e.target.value)}
                error={!form.modeOfTravel && showErrors}
                helperText={!form.modeOfTravel && showErrors ? "Required Field " : ""}
              >
                <MenuItem value="Car">🚗 Car</MenuItem>
                <MenuItem value="Bus">🚌 Bus</MenuItem>
                <MenuItem value="Bike">🏍️ Bike</MenuItem>
                <MenuItem value="Flight">✈️ Flight</MenuItem>
                <MenuItem value="Ship">🚢 Ship</MenuItem>
                <MenuItem value="Train">🚆 Train</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Traveling to Bangalore for a weekend trip..."
              error={!form.description && showErrors}
              helperText={!form.description && showErrors ? "Required Field " : ""}
            />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Available seats: {form.availableSeats}
              </Typography>

              <Slider
                value={form.availableSeats}
                onChange={(_, value) => update("availableSeats", value)}
                min={1}
                max={7}
                step={1}
                marks
                valueLabelDisplay="auto"
                sx={{ color: "primary.main" }}
              />
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel>Gender Preference</InputLabel>
              <Select
                value={form.genderPreference}
                label="Gender Preference"
                onChange={(e) => update("genderPreference", e.target.value)}
              >
                <MenuItem value="Any">Any</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={form.fuelSharing}
                  onChange={(e) => update("fuelSharing", e.target.checked)}
                  color="primary"
                />
              }
              label="Fuel Sharing"
            />
          </Stack>
        )}

        {step === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Please review your ride details before posting.
            </Alert>

            <Stack spacing={1.5}>
              {[
                ["From → Destination", `${form.from || "—"} → ${form.destination || "—"}`],
                ["Date & Time", `${form.date || "—"} at ${form.time || "—"}`],
                ["Mode of Travel", form.modeOfTravel],
                ["Available Seats", form.availableSeats],
                ["Fuel Sharing", form.fuelSharing ? "Yes" : "No"],
                ["Gender Preference", form.genderPreference],
                ["Status", "OPEN"],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.75,
                    borderBottom: "1px solid #F0E6DC",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {label}
                  </Typography>

                  <Typography variant="body2" fontWeight={600}>
                    {value}
                  </Typography>
                </Box>
              ))}

              {form.description && (
                <Box sx={{ bgcolor: "#FFF8F2", borderRadius: 2, p: 1.5 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    DESCRIPTION
                  </Typography>

                  <Typography variant="body2" mt={0.5}>
                    {form.description}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}

        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          {step > 0 && (
            <Button
              variant="outlined"
              onClick={() => setStep((s) => s - 1)}
              sx={{ flex: 1 }}
            >
              Back
            </Button>
          )}

          {step < 2 ? (
            <Button
              variant="contained"
              onClick={() => {
                if (validateStep()) {
                  setStep((s) => s + 1);
                }
              }}
              sx={{ flex: 1 }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                flex: 1,
                bgcolor: "#52B788",
                "&:hover": {
                  bgcolor: "#2D6A4F",
                },
              }}
            >
              🙏 Post ride to community
            </Button>
          )}
        </Stack>
      </Paper>
    </PageLayout>
  );
}