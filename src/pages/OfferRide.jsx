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
  Bus,
  MapPin,
  Bike,
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
  User,
} from "lucide-react";
import { useRide } from "../context/RideContext";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig";

/* ──────────────── THEME TOKENS ──────────────── */
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
  travellerType: "",
  language: [],
  ageGroupPreference: "Any",
  price: "",

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
const labelSx = {
  fontSize: { xs: "0.72rem", sm: "0.8rem" },
  mb: 0.5,
  color: "text.secondary",
};
const menuItemSx = { fontSize: { xs: "0.75rem", sm: "0.875rem" } };

/* ──────────────── PRESENTATIONAL HELPERS ──────────────── */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      sx={{ mb: { xs: 1.5, sm: 2 } }}
    >
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
        <Typography
          fontWeight={700}
          sx={{
            fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" } }}
          >
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
          sx={{
            fontSize: { xs: "0.62rem", sm: "0.68rem" },
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
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

export default function OfferRide({ ride, onSave, onClose, selectedRide, setOpen }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTiny = useMediaQuery("(max-width:300px)");
  const inputSize = isMobile ? "small" : "medium";

  const isEditMode = Boolean(ride);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetForm, setResetForm] = useState(null);
  const [errors, setErrors] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState(INITIAL_FORM);

  const isFlight = form.modeOfTravel === "Flight";
  const isCar = form.modeOfTravel === "Car";
  const isBike = form.modeOfTravel === "Bike";
  const isBus = form.modeOfTravel === "Bus";
  const isBusTrain = ["Bus", "Train"].includes(form.modeOfTravel);
  const update = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const TOASTS = ToastConfig();

  /* ──────────────── HYDRATE FORM WHEN EDITING ──────────────── */
  useEffect(() => {
    if (!ride) return;

    const start = ride.startTime ? new Date(ride.startTime) : null;
    const pad = (n) => String(n).padStart(2, "0");

    const date = start
      ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
      : "";
    const time = start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "";

    setForm({
      ...INITIAL_FORM,
      ...ride,
      date,
      time,
      availableSeats: ride.availableSeats ?? ride.totalSeats ?? 1,
      price: ride.fuelSharing || ride.price || "",
      fuelSharing: Boolean(ride.fuelSharing || ride.price),
      language: ride.language || [],
    });
  }, [ride]);

  const reviewItems = isFlight
    ? [
      [MapPin, "Route", `${form.fromAirport || "—"} → ${form.toAirport || "—"}`],
      [MapPin, "Country", `${form.fromCountry || "—"} → ${form.toCountry || "—"}`],
      [Calendar, "Date & Departure", `${form.date || "—"} at ${form.time || "—"}`],
      [Plane, "Mode of Travel", form.modeOfTravel],
      // [Clock, "Journey Duration", form.duration || "—"],
      [Plane, "Flight Number", form.flightNumber || "—"],
      [Plane, "Airline Name", form.airlineName || "—"],

      form.travellerType && [Users, "Traveller Type", form.travellerType],
      form.language?.length > 0 && [
        Languages,
        "Language",
        form.language.join(", "),
      ],

      [Users, "Gender Preference", form.genderPreference],
      [Users, "Age Group Preference", form.ageGroupPreference],
      [HeartPulse, "Medical Assistance", form.medicalAssistance ? "Yes" : "No"],
      [Languages, "Language Support", form.languageSupport ? "Yes" : "No"],
      [MapPin, "Transit Help", form.transitHelp ? "Yes" : "No"],
      [Luggage, "Baggage Help", form.baggageHelp ? "Yes" : "No"],
    ].filter(Boolean)
    : [
      [MapPin, "From → Destination", `${form.from || "—"} → ${form.destination || "—"}`],
      [Calendar, "Date & Time", `${form.date || "—"} at ${form.time || "—"}`],

      (isCar || isBike) && [Clock, "Journey Duration", form.duration || "—"],

      [isBus ? Bus : isBike ? Bike : Car, "Mode of Travel", form.modeOfTravel],

      isCar && [Users, "Available Seats", form.availableSeats],

      ...(isCar
        ? [
          // [Users, "Traveller Type", form.travellerType],
          // form.language?.length > 0 && [
          //   Languages,
          //   "Language",
          //   form.language.join(", "),
          // ],
          [HeartPulse, "Medical Assistance", form.medicalAssistance ? "Yes" : "No"],
          [MapPin, "Transit Help", form.transitHelp ? "Yes" : "No"],
          [Luggage, "Baggage Help", form.baggageHelp ? "Yes" : "No"],

        ]
        : []),
      ...(isBus ? [
        [Users, "Traveller Type", form.travellerType],
        form.language?.length > 0 && [
          Languages,
          "Language",
          form.language.join(", "),
        ],
        [HeartPulse, "Medical Assistance", form.medicalAssistance ? "Yes" : "No"],
        [MapPin, "Transit Help", form.transitHelp ? "Yes" : "No"],
        [Luggage, "Baggage Help", form.baggageHelp ? "Yes" : "No"],
        [Users, "Gender Preference", form.genderPreference],
      ]
        : []),
      ...(isCar || isBike
        ? [
          (isCar || isBike) &&
          form.fuelSharing && [Fuel, "Fuel Sharing", `₹ ${form.price}`],

          form.travellerType && [
            Users,
            "Traveller Type",
            form.travellerType,
          ],

          form.language?.length > 0 && [
            Languages,
            "Language",
            form.language.join(", "),
          ],
          [Users, "Gender Preference", form.genderPreference],
        ]
        : []),
      [Users, "Age Group Preference", form.ageGroupPreference],

      [Languages, "Language Support", form.languageSupport ? "Yes" : "No"],


    ].filter(Boolean);

  /* ──────────────── VALIDATION (same rules, now sets field-level errors instead of toasts) ──────────────── */
  const validateStep = () => {
    setShowErrors(true);

    const newErrors = {};

    const isCar = form.modeOfTravel === "Car";
    const isBike = form.modeOfTravel === "Bike";
    const isBusTrain = ["Bus", "Train"].includes(form.modeOfTravel);

    if (step === 0) {
      if (!form.modeOfTravel) {
        newErrors.modeOfTravel = "Please select mode of travel";
      }

      if (isFlight) {
        if (!form.fromCountry.trim())
          newErrors.fromCountry = "Please enter From Country";

        if (!form.fromAirport.trim())
          newErrors.fromAirport = "Please enter From Airport";

        if (!form.toCountry.trim())
          newErrors.toCountry = "Please enter To Country";

        if (!form.toAirport.trim())
          newErrors.toAirport = "Please enter To Airport";

        if (!form.flightNumber.trim())
          newErrors.flightNumber = "Please enter Flight Number";

        if (!form.airlineName.trim())
          newErrors.airlineName = "Please enter Airline Name";
      } else {
        if (!form.from.trim())
          newErrors.from = "Please enter From location";

        if (!form.destination.trim())
          newErrors.destination = "Please enter Destination";
      }
      if (!form.date) {
        newErrors.date = "Please select Date";
      }

      if (!form.time) {
        newErrors.time = "Please select Time";
      }

      if (form.date && form.time) {
        const selectedDateTime = new Date(`${form.date}T${form.time}:00`);
        const now = new Date();

        // Past date/time
        if (selectedDateTime.getTime() <= now.getTime()) {
          newErrors.time = "Please select a future date and time";
        } else {
          // Minimum allowed time
          const minimumAllowedTime = new Date(now.getTime());

          if (isFlight) {
            minimumAllowedTime.setHours(minimumAllowedTime.getHours() + 3);

            if (selectedDateTime.getTime() < minimumAllowedTime.getTime()) {
              newErrors.time =
                "Flight departure must be at least 3 hours from now.";
            }
          } else {
            minimumAllowedTime.setHours(minimumAllowedTime.getHours() + 1);

            if (selectedDateTime.getTime() < minimumAllowedTime.getTime()) {
              newErrors.time =
                "Ride start time must be at least 1 hour from now.";
            }
          }
        }
      }

      if (!form.description.trim())
        newErrors.description = "Please enter Description";

      if ((isCar || isBike) && !String(form.duration ?? "").trim()) {
        newErrors.duration = "Please enter Journey Duration";
      }
    }

    if (step === 1) {
      if (!form.genderPreference)
        newErrors.genderPreference = "Please select Gender Preference";

      if (isFlight || isBike || isBus || isCar) {
        if (!form.travellerType)
          newErrors.travellerType = "Please select Traveller Type";

        if (!form.language || form.language.length === 0)
          newErrors.language = "Select at least one language";
      }

      if (isCar && Number(form.availableSeats) < 1) {
        newErrors.availableSeats = "Available seats should be at least 1";
      }

      if ((isCar || isBike) && form.fuelSharing && !form.price) {
        newErrors.price = "Enter Split Amount";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const { refreshRides } = useRide();

  // const formReset = () => setForm(INITIAL_FORM);

  const formReset = () => {
    if (isEditMode && ride) {
      const start = ride.startTime ? new Date(ride.startTime) : null;
      const pad = (n) => String(n).padStart(2, "0");

      const date = start
        ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
        : "";

      const time = start
        ? `${pad(start.getHours())}:${pad(start.getMinutes())}`
        : "";

      setForm({
        ...INITIAL_FORM,
        ...ride,
        date,
        time,
        availableSeats: ride.availableSeats ?? ride.totalSeats ?? 1,
        price: ride.fuelSharing || ride.price || "",
        fuelSharing: Boolean(ride.fuelSharing || ride.price),
        language: ride.language || [],
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setStep(0);
    setShowErrors(false);
    setErrors({});
    setError("");
  };

  const buildPayload = () => ({
    createdBy: user?.id,
    modeOfTravel: form.modeOfTravel,
    startTime: new Date(`${form.date}T${form.time}`).toISOString(),
    description: form.description,
    duration: form.duration,
    genderPreference: form.genderPreference,
    travellerType: form.travellerType,
    language: form.language,
    ageGroupPreference: form.ageGroupPreference,
    medicalAssistance: form.medicalAssistance,
    transitHelp: form.transitHelp,
    baggageHelp: form.baggageHelp,
    languageSupport: form.languageSupport,
    status: form.status || "OPEN",
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
        travellerType: form.travellerType,
        language: form.language,
        ageGroupPreference: form.ageGroupPreference,
        medicalAssistance: form.medicalAssistance,
        languageSupport: form.languageSupport,
        baggageHelp: form.baggageHelp,
      }
      : {
        from: form.from,
        destination: form.destination,
        availableSeats: form.availableSeats,
        totalSeats: form.availableSeats,
        fuelSharing: form.price,
      }),
  });

  const createRide = async () => {
    const payload = buildPayload();

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
      setOpen(false)
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
      setTimeout(() => {
        if (onClose) onClose();
        else navigate("/myride");
      }, 1000);
    }
  };

  const updateRide = async () => {
    setError("");

    if (!form.date || !form.time) {
      setError("Please select both a date and a time.");
      return;
    }

    const localDateTime = new Date(`${form.date}T${form.time}:00`);
    if (isNaN(localDateTime)) {
      setError("Invalid date or time. Please check your input.");
      return;
    }

    const payload = buildPayload();

    try {
      setIsSubmitted(true);
      setSaving(true);

      const response = await axios.patch(
        `${Api}/rides/edit/${ride._id || ride.id}`,
        payload
      );

      const updated = response.data?.data ?? { ...ride, ...payload };



      toast.success("Ride Updated Successfully...!", {
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

      setResetForm(updated);

      refreshRides();
      setSubmitted(true);
      setShowErrors(false);
      onSave?.(updated);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update ride. Please try again."
      );
      toast.error(
        err?.response?.data?.message || err.message,
        TOASTS
      );
    } finally {
      setIsSubmitted(false);
      setSaving(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    return isEditMode ? updateRide() : createRide();
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
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
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
            }}
          >
            <CheckCircle2 size={isMobile ? 40 : 48} color="#52B788" strokeWidth={2.2} />
          </Box>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.25rem", sm: "1.6rem" }, mb: 1 }}
          >
            {isEditMode ? "Changes saved!" : "You're all set!"}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.88rem", sm: "1rem" }, mb: 0.5 }}
          >
            {isEditMode
              ? "Your ride details have been updated."
              : "Your ride has been shared with the Saathi community."}
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" }, mb: 4 }}>
            {isEditMode
              ? "Riders will see the latest details right away."
              : "We'll notify you when someone requests to join."}
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
              {isEditMode ? "Edit Ride" : "Offer a Ride"}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: "0.65rem", sm: "0.8rem" } }}>
              {isEditMode ? "Update your ride details" : "Share your journey with the community"}
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

              <FormControl fullWidth size={inputSize} error={showErrors && !!errors.modeOfTravel}>
                <InputLabel sx={ilSx}>Mode of Travel</InputLabel>
                <Select
                  value={form.modeOfTravel}
                  label="Mode of Travel"
                  disabled={isEditMode}
                  onChange={(e) => update("modeOfTravel", e.target.value)}
                  sx={selectSx}
                >
                  <MenuItem value="Car" sx={menuItemSx}>🚗 Car</MenuItem>
                  <MenuItem value="Bus" sx={menuItemSx}>🚌 Bus</MenuItem>
                  <MenuItem value="Bike" sx={menuItemSx}>🏍️ Bike</MenuItem>
                  <MenuItem value="Flight" sx={menuItemSx}>✈️ Flight</MenuItem>
                  {/* <MenuItem value="Train" sx={menuItemSx}>🚆 Train</MenuItem> */}
                </Select>
                <FormHelperText>{showErrors ? errors.modeOfTravel : ""}</FormHelperText>
              </FormControl>

              {isFlight ? (
                <Card variant="outlined" sx={{ borderRadius: 3, borderStyle: "dashed" }}>
                  <CardContent sx={{ p: { xs: 1.25, sm: 2.5 }, "&:last-child": { pb: { xs: 1.25, sm: 2.5 } } }}>
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                      <Typography
                        fontWeight={700}
                        sx={{ color: ACCENT_DARK, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" } }}
                      >
                        ✈️ Flight Details
                      </Typography>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                        <TextField
                          label="From Country"
                          fullWidth
                          size={inputSize}
                          value={form.fromCountry}
                          onChange={(e) => update("fromCountry", e.target.value)}
                          error={showErrors && !!errors.fromCountry}
                          helperText={showErrors ? errors.fromCountry : ""}
                          sx={tfSx}
                        />
                        <TextField
                          label="From Airport"
                          fullWidth
                          size={inputSize}
                          value={form.fromAirport}
                          onChange={(e) => update("fromAirport", e.target.value)}
                          error={showErrors && !!errors.fromAirport}
                          helperText={showErrors ? errors.fromAirport : ""}
                          sx={tfSx}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                        <TextField
                          label="To Country"
                          fullWidth
                          size={inputSize}
                          value={form.toCountry}
                          onChange={(e) => update("toCountry", e.target.value)}
                          error={showErrors && !!errors.toCountry}
                          helperText={showErrors ? errors.toCountry : ""}
                          sx={tfSx}
                        />
                        <TextField
                          label="To Airport"
                          fullWidth
                          size={inputSize}
                          value={form.toAirport}
                          onChange={(e) => update("toAirport", e.target.value)}
                          error={showErrors && !!errors.toAirport}
                          helperText={showErrors ? errors.toAirport : ""}
                          sx={tfSx}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }}>
                        <TextField
                          label="Flight Number"
                          fullWidth
                          size={inputSize}
                          value={form.flightNumber}
                          onChange={(e) => update("flightNumber", e.target.value)}
                          error={showErrors && !!errors.flightNumber}
                          helperText={showErrors ? errors.flightNumber : ""}
                          sx={tfSx}
                        />
                        <TextField
                          label="Airline Name"
                          fullWidth
                          size={inputSize}
                          value={form.airlineName}
                          onChange={(e) => update("airlineName", e.target.value)}
                          error={showErrors && !!errors.airlineName}
                          helperText={showErrors ? errors.airlineName : ""}
                          sx={tfSx}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 2, sm: 2 }}>
                  <TextField
                    label="From"
                    fullWidth
                    size={inputSize}
                    value={form.from}
                    onChange={(e) => update("from", e.target.value)}
                    placeholder=""
                    error={showErrors && !!errors.from}
                    helperText={showErrors ? errors.from : ""}
                    sx={tfSx}
                  />

                  <TextField
                    label="Destination"
                    fullWidth
                    size={inputSize}
                    value={form.destination}
                    onChange={(e) => update("destination", e.target.value)}
                    placeholder=""
                    error={showErrors && !!errors.destination}
                    helperText={showErrors ? errors.destination : ""}
                    sx={tfSx}
                  />
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
                  <TextField
                    fullWidth
                    size={inputSize}
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    error={showErrors && !!errors.date}
                    helperText={showErrors ? errors.date : ""}
                    InputLabelProps={{ shrink: true }}
                    sx={tfSx}
                  />
                </Stack>
                <Stack sx={{ flex: 1, minWidth: 0 }}>
                  <InputLabel sx={labelSx}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={14} /> <span>{isFlight ? "Departure Time" : "Time"}</span>
                    </Stack>
                  </InputLabel>
                  <TextField
                    fullWidth
                    size={inputSize}
                    type="time"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    error={showErrors && !!errors.time}
                    helperText={showErrors ? errors.time : ""}
                    InputLabelProps={{ shrink: true }}
                    sx={tfSx}
                  />
                </Stack>
              </Stack>

              {(!isFlight && !isBusTrain && !isBus) && (
                <TextField
                  label="Journey Duration (Approximate)"
                  fullWidth
                  type="number"
                  size={inputSize}
                  value={form.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d{0,2}$/.test(value)) {
                      update("duration", value);
                    }
                  }}
                  inputProps={{ min: 0, max: 99 }}
                  error={showErrors && !!errors.duration}
                  helperText={showErrors ? errors.duration : ""}
                  sx={tfSx}
                />
              )}
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                size={inputSize}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder={
                  isFlight
                    ? "Need companion for airport, transit, baggage or language support..."
                    : "Traveling to Bangalore for a weekend trip..."
                }
                error={showErrors && !!errors.description}
                helperText={showErrors ? errors.description : ""}
                sx={tfSx}
              />
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

              <>
                <FormControl fullWidth size={inputSize} error={showErrors && !!errors.travellerType}>
                  <InputLabel sx={ilSx}>Traveller Type</InputLabel>
                  <Select
                    value={form.travellerType}
                    label="Traveller Type"
                    onChange={(e) => update("travellerType", e.target.value)}
                    sx={selectSx}
                  >
                    {TRAVELLER_TYPES.map((v) => (
                      <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                    ))}
                  </Select>
                  {showErrors && errors.travellerType && (
                    <FormHelperText sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>{errors.travellerType}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth size={inputSize} error={showErrors && !!errors.language}>
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
                            onMouseDown={(e) => e.stopPropagation()}
                            onDelete={() => {
                              update("language", form.language.filter((item) => item !== value));
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={{ disablePortal: true }}
                  >
                    {languages.map((lang) => (
                      <MenuItem key={lang} value={lang} sx={menuItemSx}>{lang}</MenuItem>
                    ))}
                  </Select>
                  {showErrors && errors.language && (
                    <FormHelperText sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>{errors.language}</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth size={inputSize}>
                  <InputLabel sx={ilSx}>Age Group Preference</InputLabel>
                  <Select
                    value={form.ageGroupPreference}
                    label="Age Group Preference"
                    onChange={(e) => update("ageGroupPreference", e.target.value)}
                    sx={selectSx}
                  >
                    {AGE_GROUPS.map((v) => (
                      <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {!isBike && (
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
                          gridTemplateColumns: { xs: "repeat(auto-fit, minmax(130px, 1fr))", sm: "1fr 1fr" },
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
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0, mt: 1.5 }}>
                                <Icon size={14} color={ACCENT_DARK} style={{ flexShrink: 0 }} />
                                <Typography
                                  sx={{ fontSize: { xs: "0.68rem", sm: "0.8rem", md: "0.875rem" }, wordBreak: "break-word" }}
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
                )}
              </>

              {isCar && (
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 1.25, sm: 2.5 }, "&:last-child": { pb: { xs: 1.25, sm: 2.5 } } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Users size={16} color={ACCENT_DARK} />
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.825rem", md: "0.875rem" } }}
                      >
                        Available seats: {form.availableSeats}
                      </Typography>
                    </Stack>

                    <Slider
                      value={form.availableSeats}
                      onChange={(_, value) => update("availableSeats", value)}
                      min={1}
                      max={7}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      sx={{ mx: { xs: 0.5, sm: 0.5 }, color: ACCENT, "& .MuiSlider-markLabel": { fontSize: { xs: "0.62rem", sm: "0.7rem" } } }}
                    />
                    {showErrors && errors.availableSeats && (
                      <FormHelperText error sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}>
                        {errors.availableSeats}
                      </FormHelperText>
                    )}
                  </CardContent>
                </Card>
              )}

              {(isCar || isBike) && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}
                >
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={form.fuelSharing}
                        onChange={(e) => update("fuelSharing", e.target.checked)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: ACCENT },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: ACCENT },
                        }}
                      />
                    }
                    label={
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <Fuel size={16} color={ACCENT_DARK} />
                        <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>Fuel Sharing</Typography>
                      </Stack>
                    }
                  />

                  {form.fuelSharing && (
                    <TextField
                      label="$ Price"
                      size={inputSize}
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="$5"
                      error={showErrors && !!errors.price}
                      helperText={showErrors ? errors.price : ""}
                      sx={{ ...tfSx, width: { xs: "100%", sm: 180, md: 220 } }}
                    />
                  )}
                </Stack>
              )}

              <FormControl fullWidth size={inputSize} error={showErrors && !!errors.genderPreference}>
                <InputLabel sx={ilSx}>Gender Preference</InputLabel>
                <Select
                  value={form.genderPreference}
                  label="Gender Preference"
                  onChange={(e) => update("genderPreference", e.target.value)}
                  sx={selectSx}
                >
                  {GENDER_OPTIONS.map((v) => (
                    <MenuItem key={v} value={v} sx={menuItemSx}>{v}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{showErrors ? errors.genderPreference : ""}</FormHelperText>
              </FormControl>
            </Stack>
          )}

          {/* ── STEP 2 : Review ── */}
          {step === 2 && (
            <Box>
              <SectionHeader
                icon={ShieldCheck}
                title="Review & Confirm"
                subtitle={isEditMode ? "Double-check your updates" : "Double-check before you post"}
              />

              {error && (
                <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Alert
                icon={<CheckCircle2 size={18} />}
                severity="info"
                sx={{ mb: { xs: 1.5, sm: 2 }, borderRadius: 2, fontSize: { xs: "0.72rem", sm: "0.8rem", md: "0.875rem" } }}
              >
                {isEditMode
                  ? "Please review your changes before saving."
                  : "Please review your details before posting."}
              </Alert>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 1.1, sm: 2.25 }, "&:last-child": { pb: { xs: 1.1, sm: 2.25 } } }}>
                  <Stack spacing={0}>
                    {reviewItems.map(([Icon, label, value]) => (
                      <ReviewItem key={label} icon={Icon} label={label} value={value} />
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {form.description && (
                <Box sx={{ bgcolor: "#FFF8F2", borderRadius: 2, p: { xs: 1, sm: 1.75 }, mt: 1.5 }}>
                  <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.5 }}>
                    <FileText size={14} color={ACCENT_DARK} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ fontSize: { xs: "0.62rem", sm: "0.7rem" } }}
                    >
                      DESCRIPTION
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, wordBreak: "break-word" }}>
                    {form.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ── Navigation buttons ── */}
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: { xs: 2.5, sm: 4 },
              width: "100%",
            }}
          >
            {step > 0 && (
              <Button
                variant="outlined"
                onClick={() => setStep((s) => s - 1)}
                startIcon={<ArrowLeft size={14} />}
                sx={{
                  flex: 1,
                  fontSize: { xs: "0.70rem", sm: "0.875rem" },
                  // py: 1,
                  minHeight: 42,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Back
              </Button>
            )}

            {onClose && (
              <Button
                variant="outlined"
                onClick={(formReset)}
                sx={{
                  flex: 1,
                  fontSize: { xs: "0.70rem", sm: "0.875rem" },
                  // py: 1,
                  minHeight: 42,
                  borderRadius: 2.5,
                  color: "text.secondary",
                  borderColor: "divider",
                  whiteSpace: "nowrap",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Cancel
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
                endIcon={<ArrowRight size={14} />}
                sx={{
                  flex: 1,
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                  // py: 1,
                  minHeight: 42,
                  borderRadius: 2.5,
                  bgcolor: "#FF9933",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "FF9933",
                    boxShadow: "none",
                  },
                  textTransform: "none",
                  fontWeight: 600,

                }}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitted || saving}
                sx={{
                  flex: 1,
                  fontSize: { xs: "0.60rem", sm: "0.875rem" },
                  // py: 1,
                  minHeight: 42,
                  borderRadius: 2.5,
                  bgcolor: "#FF9933",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "FF9933",
                    boxShadow: "none",
                  },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {isEditMode
                  ? isSubmitted || saving
                    ? "Saving Changes..."
                    : "Save Changes"
                  : isSubmitted
                    ? "Ride Posting..."
                    : "Post Your Ride"}
              </Button>
            )}
          </Stack>
        </Paper>
      </Box>
    </PageLayout >
  );
}