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
  Checkbox,
  FormHelperText,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";

const steps = ["Trip details", "Preferences", "Review & post"];

export default function OfferRide() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
const [hasActiveRide, setHasActiveRide] = useState(false);

useEffect(() => {
  const checkRide = async () => {
    try {
      const { data } = await axios.get(
        `${Api}/rides/active/${user.id}`
      );

      setHasActiveRide(data.hasActiveRide);

      if (data.hasActiveRide) {
        toast.error(
          "You already have an active ride. Complete or cancel it before creating another."
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  checkRide();
}, []);

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

    fromCountry: "",
    fromAirport: "",
    toCountry: "",
    toAirport: "",
    flightNumber: "",
    airlineName: "",
    transitAirport: "",
    travellerType: "",
    language: "",
    ageGroupPreference: "Any",
    medicalAssistance: false,
    languageSupport: false,
    transitHelp: false,
    baggageHelp: false,
  });

  const isFlight = form.modeOfTravel === "Flight";

  const update = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const validateStep = () => {
    setShowErrors(true);

    if (step === 0) {
      if (!form.modeOfTravel) { toast.error("Please select mode of travel"); return false; }
      if (isFlight) {
        if (!form.fromCountry.trim()) { toast.error("Please enter From Country"); return false; }
        if (!form.fromAirport.trim()) { toast.error("Please enter From Airport"); return false; }
        if (!form.toCountry.trim()) { toast.error("Please enter To Country"); return false; }
        if (!form.toAirport.trim()) { toast.error("Please enter To Airport"); return false; }
        if (!form.flightNumber.trim()) { toast.error("Please enter Flight Number"); return false; }
        if (!form.airlineName.trim()) { toast.error("Please enter Airline Name"); return false; }
      } else {
        if (!form.from.trim()) { toast.error("Please enter From location"); return false; }
        if (!form.destination.trim()) { toast.error("Please enter Destination"); return false; }
      }
      if (!form.date) { toast.error("Please select Date"); return false; }
      if (!form.time) { toast.error("Please select Time"); return false; }
      if (!form.description.trim()) { toast.error("Please enter Description"); return false; }
    }

    if (step === 1) {
      if (!form.genderPreference) { toast.error("Please select Gender Preference"); return false; }
      if (isFlight) {
        if (!form.travellerType) { toast.error("Please select Traveller Type"); return false; }
        if (!form.language.trim()) { toast.error("Please enter Language"); return false; }
      } else {
        if (form.availableSeats < 1) { toast.error("Available seats should be at least 1"); return false; }
      }
    }

    return true;
  };

  const formReset = () => {
    setForm({
      from: "", destination: "", date: "", time: "",
      modeOfTravel: "Car", availableSeats: 1, fuelSharing: false,
      description: "", genderPreference: "Any",
      fromCountry: "", fromAirport: "", toCountry: "", toAirport: "",
      flightNumber: "", airlineName: "", transitAirport: "",
      travellerType: "", language: "", ageGroupPreference: "Any",
      medicalAssistance: false, languageSupport: false,
      transitHelp: false, baggageHelp: false,
    });
  };

  const handleSubmit = async () => {
    const payload = {
      createdBy: user?.id,
      modeOfTravel: form.modeOfTravel,
      startTime: new Date(`${form.date}T${form.time}`).toISOString(),
      description: form.description,
      genderPreference: form.genderPreference,
      status: "OPEN",
      ...(isFlight
        ? {
          fromCountry: form.fromCountry, fromAirport: form.fromAirport,
          toCountry: form.toCountry, toAirport: form.toAirport,
          from: form.fromAirport, destination: form.toAirport,
          flightNumber: form.flightNumber, airlineName: form.airlineName,
          transitAirport: form.transitAirport, travellerType: form.travellerType,
          language: form.language, ageGroupPreference: form.ageGroupPreference,
          medicalAssistance: form.medicalAssistance, languageSupport: form.languageSupport,
          transitHelp: form.transitHelp, baggageHelp: form.baggageHelp,
        }
        : {
          from: form.from, destination: form.destination,
          availableSeats: form.availableSeats, fuelSharing: form.fuelSharing,
        }),
    };

   try {
  await axios.post(`${Api}/rides/`, payload);
  toast.success("Ride Created Successfully...!");
  setStep(0);
  formReset();
} catch (error) {
  toast.error(error.response?.data?.message || error.message);
}
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  /* ── shared input size prop ── */
  const inputSize = isMobile ? "small" : "small";

  /* ── shared label font size ── */
  const labelSx = {
    fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
  };

  /* ── shared TextField sx override ── */
  const tfSx = {
    "& .MuiInputBase-input": {
      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
      py: { xs: "6px", sm: "7px" },
    },
    "& .MuiInputLabel-root": {
      fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
    },
    "& .MuiFormHelperText-root": {
      fontSize: { xs: "0.62rem", sm: "0.7rem" },
      mx: 0,
    },
  };

  /* ── shared Select sx override ── */
  const selectSx = {
    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
    "& .MuiSelect-select": {
      py: { xs: "6px", sm: "7px" },
    },
  };

  /* ── shared InputLabel sx override ── */
  const ilSx = { fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" } };

  /* ── review row component ── */
  const ReviewRow = ({ label, value }) => (
    <Stack
      direction={{ xs: "row", sm: "row" }}
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={1}
      sx={{ py: { xs: 0.5, sm: 0.75 }, borderBottom: "1px solid #F0E6DC" }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={500}
        sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }, flexShrink: 0, minWidth: { xs: "42%", sm: "auto" } }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
        sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" }, wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Stack>
  );

  /* ──────────────── SUCCESS SCREEN ──────────────── */
  if (submitted) {
    return (
      <Box
        sx={{
          maxWidth: 520,
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 4, sm: 6 },
          textAlign: "center",
        }}
      >
        <CheckCircleIcon sx={{ fontSize: { xs: 48, sm: 72 }, color: "#52B788", mb: 1.5 }} />
        <Typography variant="h5" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" } }}>
          Ride posted! 🙏
        </Typography>
        <Typography color="text.secondary" mb={3} sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}>
          Your ride is now visible to the Saathi community.
        </Typography>
      </Box>
    );
  }

  /* ──────────────── MAIN RENDER ──────────────── */
  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 600, md: 720 },
          mx: "auto",
          px: { xs: 0, sm: 0 },
        }}
      >
        {/* Page title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 1.5, sm: 3 } }}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" } }}
          >
            Offer a Ride
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            mb: { xs: 2, sm: 3 },
            "& .MuiStepLabel-label": {
              fontSize: { xs: "0.58rem", sm: "0.72rem", md: "0.8rem" },
              mt: { xs: 0.4, sm: 0.75 },
            },
            "& .MuiStepIcon-root": {
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
            },
            "& .MuiStepConnector-line": { minWidth: { xs: 4, sm: 16 } },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form paper */}
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3.5 },
            borderRadius: { xs: 2, sm: 3 },
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >

          {/* ── STEP 0 : Trip details ── */}
          {step === 0 && (
            <Stack spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>

              {/* Mode of Travel */}
              <FormControl fullWidth size={inputSize}>
                <InputLabel sx={ilSx}>Mode of Travel</InputLabel>
                <Select
                  value={form.modeOfTravel}
                  label="Mode of Travel"
                  onChange={(e) => update("modeOfTravel", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="Car" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>🚗 Car</MenuItem>
                  <MenuItem value="Bus" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>🚌 Bus</MenuItem>
                  <MenuItem value="Bike" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>🏍️ Bike</MenuItem>
                  <MenuItem value="Flight" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>✈️ Flight</MenuItem>
                  <MenuItem value="Train" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>🚆 Train</MenuItem>
                </Select>
              </FormControl>

              {/* Flight fields */}
              {isFlight ? (
                <>
                  <Typography fontWeight={700} color="primary" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                    Flight Details
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                    <TextField label="From Country" fullWidth size={inputSize} value={form.fromCountry}
                      onChange={(e) => update("fromCountry", e.target.value)}
                      error={!form.fromCountry && showErrors}
                      helperText={!form.fromCountry && showErrors ? "Required" : ""}
                      sx={tfSx} />
                    <TextField label="From Airport" fullWidth size={inputSize} value={form.fromAirport}
                      onChange={(e) => update("fromAirport", e.target.value)}
                      error={!form.fromAirport && showErrors}
                      helperText={!form.fromAirport && showErrors ? "Required" : ""}
                      sx={tfSx} />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                    <TextField label="To Country" fullWidth size={inputSize} value={form.toCountry}
                      onChange={(e) => update("toCountry", e.target.value)}
                      error={!form.toCountry && showErrors}
                      helperText={!form.toCountry && showErrors ? "Required" : ""}
                      sx={tfSx} />
                    <TextField label="To Airport" fullWidth size={inputSize} value={form.toAirport}
                      onChange={(e) => update("toAirport", e.target.value)}
                      error={!form.toAirport && showErrors}
                      helperText={!form.toAirport && showErrors ? "Required" : ""}
                      sx={tfSx} />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                    <TextField label="Flight Number" fullWidth size={inputSize} value={form.flightNumber}
                      onChange={(e) => update("flightNumber", e.target.value)}
                      error={!form.flightNumber && showErrors}
                      helperText={!form.flightNumber && showErrors ? "Required" : ""}
                      sx={tfSx} />
                    <TextField label="Airline Name" fullWidth size={inputSize} value={form.airlineName}
                      onChange={(e) => update("airlineName", e.target.value)}
                      error={!form.airlineName && showErrors}
                      helperText={!form.airlineName && showErrors ? "Required" : ""}
                      sx={tfSx} />
                  </Stack>

                  <TextField label="Transit Airport (Optional)" fullWidth size={inputSize}
                    value={form.transitAirport}
                    onChange={(e) => update("transitAirport", e.target.value)}
                    sx={tfSx} />
                </>
              ) : (
                /* Non-flight from/destination */
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                  <TextField label="From" fullWidth size={inputSize} value={form.from}
                    onChange={(e) => update("from", e.target.value)}
                    placeholder="Chennai"
                    error={!form.from && showErrors}
                    helperText={!form.from && showErrors ? "Required" : ""}
                    sx={tfSx} />
                  <TextField label="Destination" fullWidth size={inputSize} value={form.destination}
                    onChange={(e) => update("destination", e.target.value)}
                    placeholder="Bangalore"
                    error={!form.destination && showErrors}
                    helperText={!form.destination && showErrors ? "Required" : ""}
                    sx={tfSx} />
                </Stack>
              )}

              {/* Date & Time */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={labelSx}>Date</InputLabel>
                  <TextField fullWidth size={inputSize} type="date" value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    error={!form.date && showErrors}
                    helperText={!form.date && showErrors ? "Required" : ""}
                    sx={tfSx} />
                </Stack>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={labelSx}>{isFlight ? "Departure Time" : "Time"}</InputLabel>
                  <TextField fullWidth size={inputSize} type="time" value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    error={!form.time && showErrors}
                    helperText={!form.time && showErrors ? "Required" : ""}
                    sx={tfSx} />
                </Stack>
              </Stack>

              {/* Description */}
              <TextField label="Description" fullWidth multiline
                rows={isMobile ? 2 : 3}
                size={inputSize}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={
                  isFlight
                    ? "Need companion for airport, transit, baggage or language support..."
                    : "Traveling to Bangalore for a weekend trip..."
                }
                error={!form.description && showErrors}
                helperText={!form.description && showErrors ? "Required" : ""}
                sx={tfSx} />
              <TextField
                label="Journey Duration"
                fullWidth
                size={inputSize}
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="e.g. 2h 30m"
                error={!form.duration && showErrors}
                helperText={!form.duration && showErrors ? "Required" : ""}
                sx={tfSx}
              />
            </Stack>
          )}

          {/* ── STEP 1 : Preferences ── */}
          {step === 1 && (
            <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {isFlight ? (
                <>
                  {/* Traveller Type */}
                  <FormControl fullWidth size={inputSize} error={!form.travellerType && showErrors}>
                    <InputLabel sx={ilSx}>Traveller Type</InputLabel>
                    <Select value={form.travellerType} label="Traveller Type"
                      onChange={(e) => update("travellerType", e.target.value)}
                      sx={selectSx}>
                      {["First-time traveller", "Senior citizen support", "Student travel companion",
                        "Women-only companion", "Family companion"].map((v) => (
                          <MenuItem key={v} value={v} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{v}</MenuItem>
                        ))}
                    </Select>
                    {!form.travellerType && showErrors && (
                      <FormHelperText sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>Required</FormHelperText>
                    )}
                  </FormControl>

                  {/* Language */}
                  <TextField label="Language" fullWidth size={inputSize} value={form.language}
                    onChange={(e) => update("language", e.target.value)}
                    placeholder="Tamil, English"
                    error={!form.language && showErrors}
                    helperText={!form.language && showErrors ? "Required" : ""}
                    sx={tfSx} />

                  {/* Age Group */}
                  <FormControl fullWidth size={inputSize}>
                    <InputLabel sx={ilSx}>Age Group Preference</InputLabel>
                    <Select value={form.ageGroupPreference} label="Age Group Preference"
                      onChange={(e) => update("ageGroupPreference", e.target.value)}
                      sx={selectSx}>
                      {["Any", "18-25", "26-40", "41-60", "60+"].map((v) => (
                        <MenuItem key={v} value={v} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Checkboxes */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr" },
                      gap: { xs: 0, sm: 0 },
                    }}
                  >
                    {[
                      ["medicalAssistance", "Medical Assistance"],
                      ["languageSupport", "Language Support"],
                      ["transitHelp", "Transit Help"],
                      ["baggageHelp", "Baggage Help"],
                    ].map(([key, label]) => (
                      <FormControlLabel
                        key={key}
                        control={
                          <Checkbox
                            checked={form[key]}
                            onChange={(e) => update(key, e.target.checked)}
                            size={isMobile ? "small" : "medium"}
                          />
                        }
                        label={
                          <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" } }}>
                            {label}
                          </Typography>
                        }
                        sx={{ mr: 0 }}
                      />
                    ))}
                  </Box>

                </>
              ) : (
                <>
                  {/* Seats slider */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.825rem", md: "0.875rem" } }}>
                      Available seats: {form.availableSeats}
                    </Typography>
                    <Slider value={form.availableSeats}
                      onChange={(_, value) => update("availableSeats", value)}
                      min={1} max={7} step={1} marks valueLabelDisplay="auto"
                      sx={{ mx: { xs: 0.25, sm: 0 }, "& .MuiSlider-markLabel": { fontSize: { xs: "0.62rem", sm: "0.7rem" } } }} />
                  </Box>

                  {/* Fuel sharing */}
                  <FormControlLabel
                    control={
                      <Switch checked={form.fuelSharing}
                        onChange={(e) => update("fuelSharing", e.target.checked)}
                        color="primary"
                        size={isMobile ? "small" : "medium"} />
                    }
                    label={
                      <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Fuel Sharing</Typography>
                    }
                  />
                </>
              )}

              {/* Gender Preference */}
              <FormControl fullWidth size={inputSize}>
                <InputLabel sx={ilSx}>Gender Preference</InputLabel>
                <Select value={form.genderPreference} label="Gender Preference"
                  onChange={(e) => update("genderPreference", e.target.value)}
                  sx={selectSx}>
                  {["Any", "Male", "Female"].map((v) => (
                    <MenuItem key={v} value={v} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}

          {/* ── STEP 2 : Review ── */}
          {step === 2 && (
            <Box>
              <Alert severity="info"
                sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2, fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" } }}>
                Please review your details before posting.
              </Alert>

              <Stack spacing={0}>
                {(isFlight
                  ? [
                    ["Route", `${form.fromAirport || "—"} → ${form.toAirport || "—"}`],
                    ["Country", `${form.fromCountry || "—"} → ${form.toCountry || "—"}`],
                    ["Date & Departure", `${form.date || "—"} at ${form.time || "—"}`],
                    ["Flight Number", form.flightNumber || "—"],
                    ["Airline Name", form.airlineName || "—"],
                    ["Transit Airport", form.transitAirport || "No transit"],
                    ["Traveller Type", form.travellerType || "—"],
                    ["Language", form.language || "—"],
                    ["Gender Preference", form.genderPreference],
                    ["Age Group Preference", form.ageGroupPreference],
                    ["Medical Assistance", form.medicalAssistance ? "Yes" : "No"],
                    ["Language Support", form.languageSupport ? "Yes" : "No"],
                    ["Transit Help", form.transitHelp ? "Yes" : "No"],
                    ["Baggage Help", form.baggageHelp ? "Yes" : "No"],
                  ]
                  : [
                    ["From → Destination", `${form.from || "—"} → ${form.destination || "—"}`],
                    ["Date & Time", `${form.date || "—"} at ${form.time || "—"}`],
                    ["Mode of Travel", form.modeOfTravel],
                    ["Available Seats", form.availableSeats],
                    ["Fuel Sharing", form.fuelSharing ? "Yes" : "No"],
                    ["Gender Preference", form.genderPreference],
                  ]
                ).map(([label, value]) => (
                  <ReviewRow key={label} label={label} value={value} />
                ))}
              </Stack>

              {form.description && (
                <Box sx={{ bgcolor: "#FFF8F2", borderRadius: 2, p: { xs: 1, sm: 1.5 }, mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}
                    sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2" mt={0.5}
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, wordBreak: "break-word" }}>
                    {form.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ── Navigation buttons ── */}
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 2, sm: 3 } }}>
            {step > 0 && (
              <Button variant="outlined" onClick={() => setStep((s) => s - 1)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.75, sm: 1, md: 1.1 },
                  px: { xs: 1, sm: 2 },
                }}>
                Back
              </Button>
            )}

            {step < 2 ? (
              <Button variant="contained"
                onClick={() => { if (validateStep()) { setShowErrors(false); setStep((s) => s + 1); } }}
                size={isMobile ? "small" : "medium"}
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.75, sm: 1, md: 1.1 },
                  px: { xs: 1, sm: 2 },
                }}>
                Continue
              </Button>
            ) : (
              <Button variant="contained"
                onClick={handleSubmit}
                size={isMobile ? "small" : "medium"}
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.75, sm: 1, md: 1.1 },
                  px: { xs: 1, sm: 2 },
                  bgcolor: "#52B788",
                  "&:hover": { bgcolor: "#2D6A4F" },
                }}>
                🙏 Post to community
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    </PageLayout>
  );
}