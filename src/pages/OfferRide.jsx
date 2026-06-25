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

    // Flight fields
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
    setForm((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const validateStep = () => {
    setShowErrors(true);

    if (step === 0) {
      if (!form.modeOfTravel) {
        toast.error("Please select mode of travel");
        return false;
      }

      if (isFlight) {
        if (!form.fromCountry.trim()) {
          toast.error("Please enter From Country");
          return false;
        }

        if (!form.fromAirport.trim()) {
          toast.error("Please enter From Airport");
          return false;
        }

        if (!form.toCountry.trim()) {
          toast.error("Please enter To Country");
          return false;
        }

        if (!form.toAirport.trim()) {
          toast.error("Please enter To Airport");
          return false;
        }

        if (!form.flightNumber.trim()) {
          toast.error("Please enter Flight Number");
          return false;
        }

        if (!form.airlineName.trim()) {
          toast.error("Please enter Airline Name");
          return false;
        }
      } else {
        if (!form.from.trim()) {
          toast.error("Please enter From location");
          return false;
        }

        if (!form.destination.trim()) {
          toast.error("Please enter Destination");
          return false;
        }
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

      if (isFlight) {
        if (!form.travellerType) {
          toast.error("Please select Traveller Type");
          return false;
        }

        if (!form.language.trim()) {
          toast.error("Please enter Language");
          return false;
        }
      } else {
        if (form.availableSeats < 1) {
          toast.error("Available seats should be at least 1");
          return false;
        }
      }
    }

    return true;
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
            fromCountry: form.fromCountry,
            fromAirport: form.fromAirport,
            toCountry: form.toCountry,
            toAirport: form.toAirport,
            from: form.fromAirport,
            destination: form.toAirport,
            flightNumber: form.flightNumber,
            airlineName: form.airlineName,
            transitAirport: form.transitAirport,
            travellerType: form.travellerType,
            language: form.language,
            ageGroupPreference: form.ageGroupPreference,
            medicalAssistance: form.medicalAssistance,
            languageSupport: form.languageSupport,
            transitHelp: form.transitHelp,
            baggageHelp: form.baggageHelp,
          }
        : {
            from: form.from,
            destination: form.destination,
            availableSeats: form.availableSeats,
            fuelSharing: form.fuelSharing,
          }),
    };

    try {
      await axios.post(`${Api}/rides/`, payload);
      toast.success("Ride Created Successfully...!");
      setStep(0);
      formReset();
      setSubmitted(true);
      setShowErrors(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [submitted]);

  if (submitted) {
    return (
      <Box
        sx={{
          maxWidth: 560,
          width: "100%",
          mx: "auto",
          px: { xs: 2.5, sm: 3 },
          py: { xs: 5, sm: 6 },
          textAlign: "center",
        }}
      >
        <CheckCircleIcon
          sx={{ fontSize: { xs: 56, sm: 72 }, color: "#52B788", mb: 2 }}
        />

        <Typography
          variant="h5"
          fontWeight={800}
          gutterBottom
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          Ride posted! 🙏
        </Typography>

        <Typography
          color="text.secondary"
          mb={3}
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Your ride is now visible to the Saathi community.
        </Typography>
      </Box>
    );
  }

  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: 720,
          mx: "auto",
          px: { xs: 0, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" } }}
          >
            Offer a Ride
          </Typography>
        </Box>

        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{
            mb: { xs: 2.5, sm: 3 },
            "& .MuiStepLabel-label": {
              fontSize: { xs: "0.65rem", sm: "0.8rem" },
              mt: { xs: 0.5, sm: 0.75 },
              whiteSpace: { xs: "normal", sm: "nowrap" },
            },
            "& .MuiStepIcon-root": {
              fontSize: { xs: "1.5rem", sm: "1.75rem" },
            },
            "& .MuiStepConnector-line": {
              minWidth: { xs: 8, sm: 16 },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 3.5 },
            borderRadius: { xs: 2, sm: 3 },
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {step === 0 && (
            <Stack spacing={{ xs: 2, sm: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Mode of Travel</InputLabel>
                <Select
                  value={form.modeOfTravel}
                  label="Mode of Travel"
                  onChange={(e) => update("modeOfTravel", e.target.value)}
                >
                  <MenuItem value="Car">🚗 Car</MenuItem>
                  <MenuItem value="Bus">🚌 Bus</MenuItem>
                  <MenuItem value="Bike">🏍️ Bike</MenuItem>
                  <MenuItem value="Flight">✈️ Flight</MenuItem>
                  <MenuItem value="Train">🚆 Train</MenuItem>
                </Select>
              </FormControl>

              {isFlight ? (
                <>
                  <Typography
                    fontWeight={700}
                    color="primary"
                    sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                  >
                    Flight Details
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 2 }}
                  >
                    <TextField
                      label="From Country"
                      fullWidth
                      size="small"
                      value={form.fromCountry}
                      onChange={(e) => update("fromCountry", e.target.value)}
                      error={!form.fromCountry && showErrors}
                      helperText={
                        !form.fromCountry && showErrors ? "Required Field" : ""
                      }
                    />

                    <TextField
                      label="From Airport"
                      fullWidth
                      size="small"
                      value={form.fromAirport}
                      onChange={(e) => update("fromAirport", e.target.value)}
                      error={!form.fromAirport && showErrors}
                      helperText={
                        !form.fromAirport && showErrors ? "Required Field" : ""
                      }
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 2 }}
                  >
                    <TextField
                      label="To Country"
                      fullWidth
                      size="small"
                      value={form.toCountry}
                      onChange={(e) => update("toCountry", e.target.value)}
                      error={!form.toCountry && showErrors}
                      helperText={
                        !form.toCountry && showErrors ? "Required Field" : ""
                      }
                    />

                    <TextField
                      label="To Airport"
                      fullWidth
                      size="small"
                      value={form.toAirport}
                      onChange={(e) => update("toAirport", e.target.value)}
                      error={!form.toAirport && showErrors}
                      helperText={
                        !form.toAirport && showErrors ? "Required Field" : ""
                      }
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 2, sm: 2 }}
                  >
                    <TextField
                      label="Flight Number"
                      fullWidth
                      size="small"
                      value={form.flightNumber}
                      onChange={(e) => update("flightNumber", e.target.value)}
                      error={!form.flightNumber && showErrors}
                      helperText={
                        !form.flightNumber && showErrors ? "Required Field" : ""
                      }
                    />

                    <TextField
                      label="Airline Name"
                      fullWidth
                      size="small"
                      value={form.airlineName}
                      onChange={(e) => update("airlineName", e.target.value)}
                      error={!form.airlineName && showErrors}
                      helperText={
                        !form.airlineName && showErrors ? "Required Field" : ""
                      }
                    />
                  </Stack>

                  <TextField
                    label="Transit Airport Optional"
                    fullWidth
                    size="small"
                    value={form.transitAirport}
                    onChange={(e) => update("transitAirport", e.target.value)}
                  />
                </>
              ) : (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 2 }}
                >
                  <TextField
                    label="From"
                    fullWidth
                    size="small"
                    value={form.from}
                    onChange={(e) => update("from", e.target.value)}
                    placeholder="Chennai"
                    error={!form.from && showErrors}
                    helperText={!form.from && showErrors ? "Required Field" : ""}
                  />

                  <TextField
                    label="Destination"
                    fullWidth
                    size="small"
                    value={form.destination}
                    onChange={(e) => update("destination", e.target.value)}
                    placeholder="Bangalore"
                    error={!form.destination && showErrors}
                    helperText={
                      !form.destination && showErrors ? "Required Field" : ""
                    }
                  />
                </Stack>
              )}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 2 }}
              >
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                    Date
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    error={!form.date && showErrors}
                    helperText={!form.date && showErrors ? "Required Field" : ""}
                  />
                </Stack>

                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                    {isFlight ? "Departure Time" : "Time"}
                  </InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    error={!form.time && showErrors}
                    helperText={!form.time && showErrors ? "Required Field" : ""}
                  />
                </Stack>
              </Stack>

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={
                  isFlight
                    ? "Need companion for airport, transit, baggage or language support..."
                    : "Traveling to Bangalore for a weekend trip..."
                }
                error={!form.description && showErrors}
                helperText={
                  !form.description && showErrors ? "Required Field" : ""
                }
              />
            </Stack>
          )}

          {step === 1 && (
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              {isFlight ? (
                <>
                  <FormControl
                    fullWidth
                    size="small"
                    error={!form.travellerType && showErrors}
                  >
                    <InputLabel>Traveller Type</InputLabel>
                    <Select
                      value={form.travellerType}
                      label="Traveller Type"
                      onChange={(e) => update("travellerType", e.target.value)}
                    >
                      <MenuItem value="First-time traveller">
                        First-time traveller
                      </MenuItem>
                      <MenuItem value="Senior citizen support">
                        Senior citizen support
                      </MenuItem>
                      <MenuItem value="Student travel companion">
                        Student travel companion
                      </MenuItem>
                      <MenuItem value="Women-only companion">
                        Women-only companion
                      </MenuItem>
                      <MenuItem value="Family companion">
                        Family companion
                      </MenuItem>
                    </Select>
                    {!form.travellerType && showErrors && (
                      <FormHelperText>Required Field</FormHelperText>
                    )}
                  </FormControl>

                  <TextField
                    label="Language"
                    fullWidth
                    size="small"
                    value={form.language}
                    onChange={(e) => update("language", e.target.value)}
                    placeholder="Tamil, English"
                    error={!form.language && showErrors}
                    helperText={
                      !form.language && showErrors ? "Required Field" : ""
                    }
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel>Age Group Preference</InputLabel>
                    <Select
                      value={form.ageGroupPreference}
                      label="Age Group Preference"
                      onChange={(e) =>
                        update("ageGroupPreference", e.target.value)
                      }
                    >
                      <MenuItem value="Any">Any</MenuItem>
                      <MenuItem value="18-25">18-25</MenuItem>
                      <MenuItem value="26-40">26-40</MenuItem>
                      <MenuItem value="41-60">41-60</MenuItem>
                      <MenuItem value="60+">60+</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                      },
                      columnGap: 1,
                      rowGap: 0,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.medicalAssistance}
                          onChange={(e) =>
                            update("medicalAssistance", e.target.checked)
                          }
                        />
                      }
                      label="Medical Assistance Optional"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.languageSupport}
                          onChange={(e) =>
                            update("languageSupport", e.target.checked)
                          }
                        />
                      }
                      label="Language Support Optional"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.transitHelp}
                          onChange={(e) =>
                            update("transitHelp", e.target.checked)
                          }
                        />
                      }
                      label="Transit Help Optional"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.baggageHelp}
                          onChange={(e) =>
                            update("baggageHelp", e.target.checked)
                          }
                        />
                      }
                      label="Baggage Help Optional"
                    />
                  </Stack>
                </>
              ) : (
                <>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      gutterBottom
                      sx={{ fontSize: { xs: "0.825rem", sm: "0.875rem" } }}
                    >
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
                      sx={{ mx: { xs: 0.5, sm: 0 } }}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.fuelSharing}
                        onChange={(e) =>
                          update("fuelSharing", e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label="Fuel Sharing"
                  />
                </>
              )}

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
            </Stack>
          )}

          {step === 2 && (
            <Box>
              <Alert
                severity="info"
                sx={{ mb: 2, borderRadius: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                Please review your details before posting.
              </Alert>

              <Stack spacing={1.25}>
                {(isFlight
                  ? [
                      [
                        "Route",
                        `${form.fromAirport || "—"} → ${form.toAirport || "—"}`,
                      ],
                      [
                        "Country",
                        `${form.fromCountry || "—"} → ${form.toCountry || "—"}`,
                      ],
                      [
                        "Date & Departure",
                        `${form.date || "—"} at ${form.time || "—"}`,
                      ],
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
                      [
                        "From → Destination",
                        `${form.from || "—"} → ${form.destination || "—"}`,
                      ],
                      ["Date & Time", `${form.date || "—"} at ${form.time || "—"}`],
                      ["Mode of Travel", form.modeOfTravel],
                      ["Available Seats", form.availableSeats],
                      ["Fuel Sharing", form.fuelSharing ? "Yes" : "No"],
                      ["Gender Preference", form.genderPreference],
                    ]
                ).map(([label, value]) => (
                  <Stack
                    key={label}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={{ xs: 0.25, sm: 2 }}
                    sx={{
                      py: 0.75,
                      borderBottom: "1px solid #F0E6DC",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign={{ xs: "left", sm: "right" }}
                      sx={{
                        fontSize: { xs: "0.825rem", sm: "0.875rem" },
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </Typography>
                  </Stack>
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

                    <Typography
                      variant="body2"
                      mt={0.5}
                      sx={{ wordBreak: "break-word" }}
                    >
                      {form.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{ mt: { xs: 2.5, sm: 3 } }}
          >
            {step > 0 && (
              <Button
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  py: { xs: 1, sm: 1.1 },
                }}
              >
                Back
              </Button>
            )}

            {step < 2 ? (
              <Button
                variant="contained"
                onClick={() => {
                  if (validateStep()) {
                    setShowErrors(false);
                    setStep((s) => s + 1);
                  }
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  py: { xs: 1, sm: 1.1 },
                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  py: { xs: 1, sm: 1.1 },
                  bgcolor: "#52B788",
                  "&:hover": {
                    bgcolor: "#2D6A4F",
                  },
                }}
              >
                🙏 Post to community
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    </PageLayout>
  );
}