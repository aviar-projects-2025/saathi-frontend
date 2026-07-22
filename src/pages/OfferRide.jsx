
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Card,
  CardContent,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Switch,
  Slider,
  Button,
  Alert,
  Divider,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Car,
  Plane,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Users,
  Fuel,
  ShieldCheck,
  Languages,
  Luggage,
  HeartPulse,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRide } from "../context/RideContext";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig";


/* ──────────────── THEME TOKENS ──────────────── */
// Saffron accent — swap these two if you ever want to re-theme.
const ACCENT = "#FF9933";
const ACCENT_DARK = "#CC7722";
const ACCENT_TINT = "rgba(255,153,51,0.12)";

const steps = ["Trip Details", "Preferences", "Review"];

const TRAVELLER_TYPES = [
  "First-time traveller",
  "Senior citizen support",
  "Student travel companion",
  "Women-only companion",
  "Family companion",
];

const AGE_GROUPS = ["Any", "18-25", "26-40", "41-60", "60+"];
const GENDER_OPTIONS = ["Any", "Male", "Female"];

const INITIAL_FORM = {
  from: "",
  destination: "",
  date: "",
  time: "",
  duration: "",
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
  language: [],
  ageGroupPreference: "Any",
  price: '',

  medicalAssistance: false,
  languageSupport: false,
  transitHelp: false,
  baggageHelp: false,
};

/* ──────────────── STYLE HELPERS ──────────────── */
const tfSx = {
  "& .MuiInputBase-input": { fontSize: { xs: "0.8rem", sm: "0.9rem" } },
};
const selectSx = { fontSize: { xs: "0.8rem", sm: "0.9rem" } };
const ilSx = { fontSize: { xs: "0.8rem", sm: "0.9rem" } };
const labelSx = { fontSize: { xs: "0.72rem", sm: "0.8rem" }, mb: 0.5, color: "text.secondary" };
const menuItemSx = { fontSize: { xs: "0.75rem", sm: "0.875rem" } };

/* ──────────────── PRESENTATIONAL HELPERS ──────────────── */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: { xs: 1.5, sm: 2 } }}>
      <Box
        sx={{
          width: { xs: 32, sm: 36 },
          height: { xs: 32, sm: 36 },
          borderRadius: "10px",
          bgcolor: ACCENT_TINT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={ACCENT_DARK} />
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" }, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" } }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function ReviewItem({ icon: Icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={{
        py: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      {Icon && (
        <Box sx={{ mt: 0.25, color: ACCENT_DARK, flexShrink: 0 }}>
          <Icon size={16} />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.62rem", sm: "0.68rem" }, textTransform: "uppercase", letterSpacing: 0.4 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "0.78rem", sm: "0.875rem" },
            fontWeight: 600,
          }}
        >
          {Array.isArray(value) ? value.join(", ") : value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function OfferRide() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTiny = useMediaQuery("(max-width:300px)");
  const inputSize = isMobile ? "small" : "medium";

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState(INITIAL_FORM);

  const isFlight = form.modeOfTravel === "Flight";

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const TOASTS = ToastConfig();

  /* ──────────────── VALIDATION (unchanged logic) ──────────────── */
  const validateStep = () => {
    setShowErrors(true);

    if (step === 0) {
      if (!form.modeOfTravel) {
        toast.error("Please select mode of travel", TOASTS);
        return false;
      }
      if (isFlight) {
        if (!form.fromCountry.trim()) { toast.error("Please enter From Country", TOASTS); return false; }
        if (!form.fromAirport.trim()) { toast.error("Please enter From Airport", TOASTS); return false; }
        if (!form.toCountry.trim()) { toast.error("Please enter To Country", TOASTS); return false; }
        if (!form.toAirport.trim()) { toast.error("Please enter To Airport", TOASTS); return false; }
        if (!form.flightNumber.trim()) { toast.error("Please enter Flight Number", TOASTS); return false; }
        if (!form.airlineName.trim()) { toast.error("Please enter Airline Name", TOASTS); return false; }
      } else {
        if (!form.from.trim()) { toast.error("Please enter From location", TOASTS); return false; }
        if (!form.destination.trim()) { toast.error("Please enter Destination", TOASTS); return false; }
      }
      if (!form.date) {
        toast.error("Please select Date", TOASTS);
        return false;
      }

      if (!form.time) {
        toast.error("Please select Time", TOASTS);
        return false;
      }

      const selectedDateTime = new Date(`${form.date}T${form.time}`);
      const now = new Date();


      if (selectedDateTime <= now) {
        toast.error("Please select a future date and time", TOASTS);
        return false;
      }


      const minimumAllowedTime = new Date(now);

      if (isFlight) {
        minimumAllowedTime.setHours(minimumAllowedTime.getHours() + 3);

        if (selectedDateTime < minimumAllowedTime) {
          toast.error("Flight departure must be at least 3 hours from now.", TOASTS);
          return false;
        }
      } else {
        minimumAllowedTime.setHours(minimumAllowedTime.getHours() + 1);

        if (selectedDateTime < minimumAllowedTime) {
          toast.error("Ride start time must be at least 1 hour from now.", TOASTS);
          return false;
        }
      }

      if (!form.description.trim()) { toast.error("Please enter Description", TOASTS); return false; }
      if (!form.duration.trim()) { toast.error("Please enter Journey Duration", TOASTS); return false; }
    }

    if (step === 1) {
      if (!form.genderPreference) { toast.error("Please select Gender Preference", TOASTS); return false; }
      if (isFlight) {
        if (!form.travellerType) { toast.error("Please select Traveller Type", TOASTS); return false; }
        if (!form.language || form.language.length === 0) {
          toast.error("Select at least one language", TOASTS);
          return false;
        }
      } else {
        if (form.availableSeats < 1) {
          toast.error("Available seats should be at least 1", TOASTS);
          return false;
        }

        if (form.fuelSharing && !form.price) {
          toast.error("Enter Split Amount", TOASTS);
          return false;
        }

        return true;
      }
    }

    return true;
  };
  const { refreshRides } = useRide();

  const formReset = () => setForm(INITIAL_FORM);

  const handleSubmit = async () => {
    const payload = {
      createdBy: user?.id,
      modeOfTravel: form.modeOfTravel,
      startTime: new Date(`${form.date}T${form.time}`).toISOString(),
      description: form.description,
      duration: form.duration,
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
      setIsSubmitted(true);
      await axios.post(`${Api}/rides/`, payload);

      toast.success("Ride Created Successfully...!", {
        position: isTab ? "top-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "90vw" : "360px",
          maxWidth: isTab ? "320px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
          margin: "0 auto",
        },
      });
      refreshRides();
      setStep(0);
      formReset();
      setSubmitted(true);
      setShowErrors(false);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message, {
        position: isTab ? "top-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeButton: false,
        style: {
          width: isTab ? "280px" : "360px",
          fontSize: isTab ? "13px" : "15px",
          padding: isTab ? "8px 12px" : "12px 16px",
          borderRadius: isTab ? "8px" : "10px",
          minHeight: isTab ? "42px" : "52px",
        },
      });
    } finally {
      setIsSubmitted(false);
    }
  };

  const languages = [
    "English",
    "Tamil",
    "Hindi",
    "Bengali",
    "Telugu",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
  ];

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => setSubmitted(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  /* ──────────────── SUCCESS SCREEN ──────────────── */
  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: "35dvh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // overflow: "hidden",
          boxSizing: "border-box",
          // px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Icon in a soft circular badge */}
          <Box
            sx={{
              width: isMobile ? 72 : 88,
              height: isMobile ? 72 : 88,
              borderRadius: "50%",
              bgcolor: "rgba(82, 183, 136, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              // mb: 3,
            }}
          >
            <CheckCircle2 size={isMobile ? 40 : 48} color="#52B788" strokeWidth={2.2} />
          </Box>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.25rem", sm: "1.6rem" }, mb: 1 }}
          >
            You're all set!
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.88rem", sm: "1rem" }, mb: 0.5 }}
          >
            Your ride has been shared with the Saathi community.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, mb: 4 }}
          >
            We'll notify you when someone requests to join.
          </Typography>
        </Box>
      </Box>
    );
  }
  /* ──────────────── MAIN RENDER ──────────────── */
  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 620, md: 760 },
          mx: "auto",
          px: { xs: isTiny ? 1 : 1.5, sm: 0 },
          pb: { xs: 3, sm: 4 },
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        {/* Page header */}
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.25 }}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: { xs: 2, sm: 3 }, rowGap: 0.5 }}
        >
          <Box
            sx={{
              width: { xs: 34, sm: 44 },
              height: { xs: 34, sm: 44 },
              borderRadius: "12px",
              bgcolor: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Car size={isTiny ? 18 : 22} color="#fff" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ fontSize: { xs: "0.95rem", sm: "1.3rem", md: "1.5rem" }, lineHeight: 1.25 }}
            >
              Offer a Ride
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
              Share your journey with the community
            </Typography>
          </Box>
        </Stack>

        {/* Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1, sm: 2 },
            mb: { xs: 1.5, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Stepper
            activeStep={step}
            alternativeLabel
            sx={{
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.52rem", sm: "0.72rem", md: "0.8rem" },
                mt: { xs: 0.35, sm: 0.75 },
                fontWeight: 600,
                whiteSpace: { xs: "normal", sm: "nowrap" },
                lineHeight: 1.2,
              },
              "& .MuiStepIcon-root": {
                fontSize: { xs: "1.1rem", sm: "1.6rem", md: "1.8rem" },
              },
              "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": {
                color: ACCENT,
              },
              "& .MuiStepConnector-line": { minWidth: { xs: 2, sm: 16 } },
              "& .MuiStep-root": { px: { xs: 0.25, sm: 1 } },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form card */}
        <Paper
          sx={{
            p: { xs: 1.5, sm: 3, md: 4 },
            borderRadius: { xs: 2.5, sm: 4 },
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {/* ── STEP 0 : Trip details ── */}
          {step === 0 && (
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <SectionHeader
                icon={isFlight ? Plane : Car}
                title="Trip Details"
                subtitle="Tell us how and when you're travelling"
              />

              <FormControl fullWidth size={inputSize}>
                <InputLabel sx={ilSx}>Mode of Travel</InputLabel>
                <Select
                  value={form.modeOfTravel}
                  label="Mode of Travel"
                  onChange={(e) => update("modeOfTravel", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="Car" sx={menuItemSx}>🚗 Car</MenuItem>
                  <MenuItem value="Bus" sx={menuItemSx}>🚌 Bus</MenuItem>
                  <MenuItem value="Bike" sx={menuItemSx}>🏍️ Bike</MenuItem>
                  <MenuItem value="Flight" sx={menuItemSx}>✈️ Flight</MenuItem>
                  <MenuItem value="Train" sx={menuItemSx}>🚆 Train</MenuItem>
                </Select>
              </FormControl>

              {isFlight ? (
                <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: "dashed" }}>
                  <CardContent sx={{ p: { xs: 1.25, sm: 2.5 }, "&:last-child": { pb: { xs: 1.25, sm: 2.5 } } }}>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      <Typography fontWeight={700} sx={{ color: ACCENT_DARK, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}>
                        ✈️ Flight Details
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
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 2 }}>
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

              <Divider sx={{ my: { xs: 0.5, sm: 1 } }} />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={labelSx}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar size={14} /> <span>Date</span>
                    </Stack>
                  </InputLabel>
                  <TextField fullWidth size={inputSize} type="date" value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    error={!form.date && showErrors}
                    helperText={!form.date && showErrors ? "Required" : ""}
                    InputLabelProps={{ shrink: true }}
                    sx={tfSx} />
                </Stack>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={labelSx}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={14} /> <span>{isFlight ? "Departure Time" : "Time"}</span>
                    </Stack>
                  </InputLabel>
                  <TextField fullWidth size={inputSize} type="time" value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    error={!form.time && showErrors}
                    helperText={!form.time && showErrors ? "Required" : ""}
                    InputLabelProps={{ shrink: true }}
                    sx={tfSx} />
                </Stack>
              </Stack>

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
            </Stack>
          )}

          {/* ── STEP 1 : Preferences ── */}
          {step === 1 && (
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
              <SectionHeader
                icon={Users}
                title="Preferences"
                subtitle={isFlight ? "Help us match the right companion" : "Set your ride preferences"}
              />

              {isFlight ? (
                <>
                  <FormControl fullWidth size={inputSize} error={!form.travellerType && showErrors}>
                    <InputLabel sx={ilSx}>Traveller Type</InputLabel>
                    <Select value={form.travellerType} label="Traveller Type"
                      onChange={(e) => update("travellerType", e.target.value)}
                      sx={selectSx}>
                      {TRAVELLER_TYPES.map((v) => (
                        <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                      ))}
                    </Select>
                    {!form.travellerType && showErrors && (
                      <FormHelperText sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>Required</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl
                    fullWidth
                    size={inputSize}
                    error={!form.language?.length && showErrors}
                  >
                    <InputLabel sx={ilSx}>Language</InputLabel>

                    <Select
                      multiple
                      value={form.language || []}
                      label="Language"
                      onChange={(e) => update("language", e.target.value)}
                      sx={selectSx}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              onMouseDown={(e) => e.stopPropagation()} // 🔥 prevent dropdown open
                              onDelete={() => {
                                update(
                                  "language",
                                  form.language.filter((item) => item !== value)
                                );
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      MenuProps={{
                        disablePortal: true, // keeps dropdown under field
                      }}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang} value={lang} sx={menuItemSx}>
                          {lang}
                        </MenuItem>
                      ))}
                    </Select>

                    {!form.language?.length && showErrors && (
                      <FormHelperText sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>
                        Required
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl fullWidth size={inputSize}>
                    <InputLabel sx={ilSx}>Age Group Preference</InputLabel>
                    <Select value={form.ageGroupPreference} label="Age Group Preference"
                      onChange={(e) => update("ageGroupPreference", e.target.value)}
                      sx={selectSx}>
                      {AGE_GROUPS.map((v) => (
                        <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: { xs: 1.1, sm: 2 }, "&:last-child": { pb: { xs: 1.1, sm: 2 } } }}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.62rem", sm: "0.72rem" }, textTransform: "uppercase", letterSpacing: 0.4 }}
                      >
                        Assistance Needed
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "repeat(auto-fit, minmax(130px, 1fr))",
                            sm: "1fr 1fr",
                          },
                          gap: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        {[
                          ["medicalAssistance", "Medical Assistance", HeartPulse],
                          ["languageSupport", "Language Support", Languages],
                          ["transitHelp", "Transit Help", MapPin],
                          ["baggageHelp", "Baggage Help", Luggage],
                        ].map(([key, label, Icon]) => (
                          <FormControlLabel
                            key={key}
                            control={
                              <Checkbox
                                checked={form[key]}
                                onChange={(e) => update(key, e.target.checked)}
                                size={isMobile ? "small" : "medium"}
                                sx={{ "&.Mui-checked": { color: ACCENT } }}
                              />
                            }
                            label={
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                                <Icon size={14} color={ACCENT_DARK} style={{ flexShrink: 0 }} />
                                <Typography
                                  sx={{
                                    fontSize: { xs: "0.68rem", sm: "0.8rem", md: "0.875rem" },
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {label}
                                </Typography>
                              </Stack>
                            }
                            sx={{ mr: 0, ml: 0, alignItems: "flex-start" }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: { xs: 1.25, sm: 2.5 }, "&:last-child": { pb: { xs: 1.25, sm: 2.5 } } }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Users size={16} color={ACCENT_DARK} />
                        <Typography variant="subtitle2" fontWeight={700}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.825rem", md: "0.875rem" } }}>
                          Available seats: {form.availableSeats}
                        </Typography>
                      </Stack>
                      <Slider value={form.availableSeats}
                        onChange={(_, value) => update("availableSeats", value)}
                        min={1} max={7} step={1} marks valueLabelDisplay="auto"
                        sx={{
                          mx: { xs: 0.5, sm: 0.5 },
                          color: ACCENT,
                          "& .MuiSlider-markLabel": { fontSize: { xs: "0.62rem", sm: "0.7rem" } },
                        }} />
                    </CardContent>
                  </Card>

                  <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch checked={form.fuelSharing}
                          onChange={(e) => update("fuelSharing", e.target.checked)}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ACCENT },
                          }} />
                      }
                      label={
                        <Stack direction="row" spacing={0.6} alignItems="center">
                          <Fuel size={16} color={ACCENT_DARK} />
                          <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Fuel Sharing</Typography>
                        </Stack>

                      }
                    />
                    <Box>
                      {form.fuelSharing &&
                        <>
                          <TextField label="$ Price" fullWidth size={inputSize} value={form.price}
                            onChange={(e) => update("price", e.target.value)}
                            placeholder="$5"
                            error={!form.price && showErrors}
                            helperText={!form.price && showErrors ? "Required" : ""}
                            sx={tfSx} />
                        </>
                      }
                    </Box>
                  </Box>
                </>
              )}

              <FormControl fullWidth size={inputSize}>
                <InputLabel sx={ilSx}>Gender Preference</InputLabel>
                <Select value={form.genderPreference} label="Gender Preference"
                  onChange={(e) => update("genderPreference", e.target.value)}
                  sx={selectSx}>
                  {GENDER_OPTIONS.map((v) => (
                    <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}

          {/* ── STEP 2 : Review ── */}
          {step === 2 && (
            <Box>
              <SectionHeader icon={ShieldCheck} title="Review & Confirm" subtitle="Double-check before you post" />

              <Alert
                icon={<CheckCircle2 size={18} />}
                severity="info"
                sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2, fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" } }}>
                Please review your details before posting.
              </Alert>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 1.1, sm: 2.25 }, "&:last-child": { pb: { xs: 1.1, sm: 2.25 } } }}>
                  <Stack spacing={0}>
                    {(isFlight
                      ? [
                        [MapPin, "Route", `${form.fromAirport || "—"} → ${form.toAirport || "—"}`],
                        [MapPin, "Country", `${form.fromCountry || "—"} → ${form.toCountry || "—"}`],
                        [Calendar, "Date & Departure", `${form.date || "—"} at ${form.time || "—"}`],
                        [Clock, "Journey Duration", form.duration || "—"],
                        [Plane, "Flight Number", form.flightNumber || "—"],
                        [Plane, "Airline Name", form.airlineName || "—"],
                        [MapPin, "Transit Airport", form.transitAirport || "No transit"],
                        [Users, "Traveller Type", form.travellerType || "—"],
                        [Languages, "Language", form.language || "—"],
                        [Users, "Gender Preference", form.genderPreference],
                        [Users, "Age Group Preference", form.ageGroupPreference],
                        [HeartPulse, "Medical Assistance", form.medicalAssistance ? "Yes" : "No"],
                        [Languages, "Language Support", form.languageSupport ? "Yes" : "No"],
                        [MapPin, "Transit Help", form.transitHelp ? "Yes" : "No"],
                        [Luggage, "Baggage Help", form.baggageHelp ? "Yes" : "No"],
                      ]
                      : [
                        [MapPin, "From → Destination", `${form.from || "—"} → ${form.destination || "—"}`],
                        [Calendar, "Date & Time", `${form.date || "—"} at ${form.time || "—"}`],
                        [Clock, "Journey Duration", form.duration || "—"],
                        [Car, "Mode of Travel", form.modeOfTravel],
                        [Users, "Available Seats", form.availableSeats],
                        [Fuel, "Fuel Sharing", form.fuelSharing ? "Yes" : "No"],
                        [Users, "Gender Preference", form.genderPreference],
                      ]
                    ).map(([Icon, label, value]) => (
                      <ReviewItem key={label} icon={Icon} label={label} value={value} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {form.description && (
                <Box sx={{ bgcolor: "#FFF8F2", borderRadius: 2, p: { xs: 1, sm: 1.75 }, mt: 1.5 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.5 }}>
                    <FileText size={14} color={ACCENT_DARK} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700}
                      sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>
                      DESCRIPTION
                    </Typography>
                  </Stack>
                  <Typography variant="body2"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, wordBreak: "break-word" }}>
                    {form.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ── Navigation buttons ── */}
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 2.5, sm: 4 } }}>
            {step > 0 && (
              <Button
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                size="small"
                startIcon={<ArrowLeft size={16} />}
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.68rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.9, sm: 1, md: 1.1 },
                  px: { xs: 0.75, sm: 2 },
                  minHeight: 40,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  color: "text.primary",
                  whiteSpace: "nowrap",
                }}>
                Back
              </Button>
            )}

            {step < 2 ? (
              <Button variant="contained"
                onClick={() => { if (validateStep()) { setShowErrors(false); setStep((s) => s + 1); } }}
                size={isMobile ? "small" : "medium"}
                endIcon={<ArrowRight size={16} />}
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.9, sm: 1, md: 1.1 },
                  px: { xs: 0.75, sm: 2 },
                  minHeight: 40,
                  borderRadius: 2.5,
                  bgcolor: ACCENT,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: ACCENT_DARK, boxShadow: "none" },
                }}>
                Continue
              </Button>
            ) : (
              <Button variant="contained"
                onClick={handleSubmit}
                size="small"
                sx={{
                  flex: 1, minWidth: 0,
                  fontSize: { xs: "0.56rem", sm: "0.8rem", md: "0.875rem" },
                  py: { xs: 0.9, sm: 1, md: 1.1 },
                  px: { xs: 0.75, sm: 2 },
                  minHeight: 40,
                  borderRadius: 2.5,
                  bgcolor: ACCENT,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: ACCENT_DARK, boxShadow: "none" },
                }}>
                {isSubmitted ? " Ride Posting... " : " Post Your Ride "}
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    </PageLayout >
  );
}