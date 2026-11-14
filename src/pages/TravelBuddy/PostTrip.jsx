import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../../Api";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

const c = {
  rust: "#C4410C",
  rustDark: "#A8360A",
  navy: "#12285F",
  bg: "#F9F7F3",
  border: "#D9D3C5",
  muted: "#5F6368",
  infoBg: "#DDEEFB",
  infoText: "#0B4A7A",
  errBg: "#FDE0E0",
  errText: "#8A1C1C",
  green: "#1A6B3C",
};

const theme = createTheme({
  typography: {
    fontFamily: `"DM Sans", "Inter", "Segoe UI", Roboto, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  palette: { primary: { main: c.rust } },
  shape: { borderRadius: 12 },
});

const BTN = {
  height: { xs: 44, sm: 46 },
  minHeight: { xs: 44, sm: 46 },
  px: 2,
  py: 0,
  borderRadius: 2.5,
  fontSize: { xs: 14, sm: 15 },
  fontWeight: 700,
  lineHeight: 1.2,
  textAlign: "center",
  boxShadow: "none",
};

const inputFontSx = {
  "& .MuiInputBase-input, & .MuiSelect-select": { fontSize: { xs: 16, sm: 14 } },
};

const pageSx = {
  bgcolor: c.bg,
  minHeight: "100vh",
  "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
  width: "100%",
  boxSizing: "border-box",
  overflowX: "hidden",
  pt: { xs: 2, sm: 2.5, md: 4 },
  pb: {
    xs: "calc(24px + env(safe-area-inset-bottom, 0px))",
    sm: "calc(24px + env(safe-area-inset-bottom, 0px))",
    md: 6,
  },
  pl: { xs: "max(16px, env(safe-area-inset-left, 0px))", sm: 2.5, md: 4 },
  pr: { xs: "max(16px, env(safe-area-inset-right, 0px))", sm: 2.5, md: 4 },
};

const ROLES = [
  ["parent", "My parent needs a companion"],
  ["companion", "I can be a companion"],
];
const RELATIONSHIPS = ["Mother", "Father", "Grandmother", "Grandfather", "Other"];
const AGE_BANDS = ["60 and over", "70 and over", "80 and over"];
const LANGUAGES = ["English", "Tamil", "Hindi", "Bengali", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];
const HELP = ["Transit guidance", "Immigration forms", "Wheelchair"];
const MAX_FLIGHTS = 4;

const EMPTY_FLIGHT = {
  airline: "",
  flightNumber: "",
  from: "",
  to: "",
  departure: "",
  arrival: "",
};

const INITIAL_FORM = {
  role: "parent",
  flights: [{ ...EMPTY_FLIGHT }],
  relationship: "Mother",
  ageBand: "",
  languages: ["Tamil"],
  help: [],
  pickup: "family",
  agreed: false,
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const mapTripFlightsToForm = (trip) => {
  if (!Array.isArray(trip?.flights) || trip.flights.length === 0) return [{ ...EMPTY_FLIGHT }];
  return trip.flights.slice(0, MAX_FLIGHTS).map((flight) => ({
    airline: flight.airline || "",
    flightNumber: flight.flightNumber || "",
    from: flight.fromCode || "",
    to: flight.toCode || "",
    departure: toDateTimeLocal(flight.departureTime),
    arrival: toDateTimeLocal(flight.arrivalTime),
  }));
};

const airportCode = (v) => {
  const t = (v || "").trim();
  const m = t.match(/\(([A-Za-z]{3})\)$/) || t.match(/^([A-Za-z]{3})$/);
  return m ? m[1].toUpperCase() : null;
};

const validateFlights = (flights) =>
  flights.map((f, i) => {
    const e = {};
    const prev = i > 0 ? flights[i - 1] : null;
    const prevTo = prev ? airportCode(prev.to) : null;
    const fromCode = airportCode(f.from);
    const toCode = airportCode(f.to);

    if (!f.airline.trim()) e.airline = "Enter the airline.";
    if (!f.flightNumber.trim()) e.flightNumber = "Enter the flight number.";

    if (!f.from.trim()) e.from = "Enter the departure airport.";
    else if (!fromCode) e.from = "Include the 3-letter code, e.g. Chennai (MAA).";
    else if (prevTo && prevTo !== fromCode) e.from = `Must be ${prevTo} to connect.`;

    if (!f.to.trim()) e.to = "Enter the arrival airport.";
    else if (!toCode) e.to = "Include the 3-letter code, e.g. Dubai (DXB).";
    else if (fromCode === toCode) e.to = "Must differ from departure.";

    if (!f.departure) e.departure = "Enter departure time.";
    if (!f.arrival) e.arrival = "Enter arrival time.";

    if (f.departure && f.arrival && new Date(f.arrival) <= new Date(f.departure)) {
      e.arrival = "Arrival must be after departure.";
    }
    if (prev && prev.arrival && f.departure && new Date(f.departure) < new Date(prev.arrival)) {
      e.departure = "Departure cannot be before previous flight arrives.";
    }

    return e;
  });

const validateTraveller = (form) => {
  const e = {};
  if (form.role === "parent") {
    if (!form.ageBand) e.ageBand = "Select an age band.";
  }
  if (form.languages.length === 0) e.languages = "Pick at least one language.";
  if (!form.agreed) e.agreed = "Confirm this to post your trip.";
  return e;
};

const hasErrors = (errs) =>
  Array.isArray(errs) ? errs.some((e) => Object.keys(e).length > 0) : Object.keys(errs).length > 0;

const FieldLabel = ({ children, small }) => (
  <Typography sx={{ fontWeight: 700, fontSize: small ? 12 : 13, color: "#111", mb: 0.75, lineHeight: 1.35, overflowWrap: "anywhere" }}>
    {children}
  </Typography>
);

const fieldSx = {
  ...inputFontSx,
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff",
    borderRadius: 1.5,
    "& fieldset": { borderColor: c.border },
    "&.Mui-focused fieldset": { borderColor: c.rust },
  },
  "& input[type='datetime-local']": { minWidth: 0, width: "100%", boxSizing: "border-box" },
};

const Field = ({ label, small, error, ...props }) => (
  <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
    <FieldLabel small={small}>{label}</FieldLabel>
    <TextField
      fullWidth
      size="small"
      error={Boolean(error)}
      helperText={error || " "}
      {...props}
      sx={fieldSx}
    />
  </Box>
);

const SelectField = ({ label, options, error, ...props }) => (
  <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
    <FieldLabel>{label}</FieldLabel>
    <TextField
      select
      fullWidth
      size="small"
      error={Boolean(error)}
      helperText={error || " "}
      {...props}
      sx={fieldSx}
    >
      {options.map((o) => (<MenuItem key={o} value={o}>{o}</MenuItem>))}
    </TextField>
  </Box>
);

const MultiSelect = ({ label, options, value, onChange, error }) => (
  <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
    <FieldLabel>{label}</FieldLabel>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <Chip
            key={opt}
            label={opt}
            clickable
            onClick={() => {
              if (selected) onChange(value.filter((v) => v !== opt));
              else onChange([...value, opt]);
            }}
            sx={{
              height: { xs: 36, sm: 32 },
              fontSize: { xs: 13.5, sm: 13 },
              borderRadius: "20px",
              bgcolor: selected ? c.rust : "#fff",
              color: selected ? "#fff" : "#333",
              border: `1px solid ${selected ? c.rust : c.border}`,
              fontWeight: 600,
              "&:hover": { bgcolor: selected ? c.rustDark : "#F3EFE6" },
            }}
          />
        );
      })}
    </Box>
    {error && <Typography sx={{ fontSize: 12, color: c.errText, mt: 0.5 }}>{error}</Typography>}
  </Box>
);

const Row = ({ children }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: 1.5, minWidth: 0 }}>
    {children}
  </Stack>
);

const SectionTitle = ({ children }) => (
  <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, color: c.navy, mb: 1.5, mt: 2 }}>{children}</Typography>
);

const PrimaryButton = (props) => (
  <Button
    fullWidth
    variant="contained"
    disableElevation
    {...props}
    sx={{
      ...BTN,
      bgcolor: c.rust,
      "&:hover": { bgcolor: c.rustDark },
      "&.Mui-disabled": { bgcolor: "#E3C2B3", color: "#fff" },
    }}
  />
);

const Header = ({ leftLabel, onLeft, step, totalSteps = 2 }) => (
  <Box sx={{ mb: { xs: 2, sm: 3 }, width: "100%" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1, width: "100%" }}>
      <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: c.muted, textAlign: "left", flex: 1, minWidth: 0 }}>
        Step {step} of {totalSteps}: {step === 1 ? "Flights" : "Traveller and review"}
      </Typography>
      <Button
        onClick={onLeft}
        sx={{ p: 0, minWidth: 44, minHeight: 44, flexShrink: 0, color: c.rust, fontSize: 14, whiteSpace: "nowrap", "&:hover": { bgcolor: "transparent" } }}
      >
        {leftLabel}
      </Button>
    </Stack>
    <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            bgcolor: i + 1 <= step ? c.rust : "#E8E3DA",
            transition: "background-color 0.3s ease",
          }}
        />
      ))}
    </Stack>
  </Box>
);

const pageTitleSx = {
  fontWeight: 800,
  fontSize: { xs: 22, sm: 24, md: 26 },
  color: c.navy,
  mb: 2,
  lineHeight: 1.25,
};

function StepFlights({ form, setForm, onNext, onCancel, isPrefilled, isEditMode }) {
  const { role, flights } = form;
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateFlights(flights);
  const invalid = hasErrors(errors);

  const setRole = (value) => setForm((f) => ({ ...f, role: value }));

  const update = (i, key, value) =>
    setForm((f) => ({
      ...f,
      flights: f.flights.map((fl, idx) => (idx === i ? { ...fl, [key]: value } : fl)),
    }));

  const addFlight = () =>
    setForm((f) => (f.flights.length < MAX_FLIGHTS ? { ...f, flights: [...f.flights, { ...EMPTY_FLIGHT }] } : f));

  const bind = (i, key) => ({
    value: flights[i][key],
    onChange: (e) => update(i, key, e.target.value),
    onBlur: () => setTouched((t) => ({ ...t, [`${i}.${key}`]: true })),
    error: submitted || touched[`${i}.${key}`] ? errors[i][key] : undefined,
  });

  const handleNext = () => {
    setSubmitted(true);
    if (!invalid) onNext();
  };

  // Edit mode fully unlocks everything — role, flights, traveller prefs.
  // Only "request mode" (isPrefilled) locks fields, because a request
  // must match the target trip's exact itinerary and role.
  const flightsLocked = Boolean(isPrefilled);
  const roleLocked = Boolean(isPrefilled);

  return (
    <>
      <Header leftLabel="Cancel" onLeft={onCancel} step={1} />
      <Typography component="h1" sx={pageTitleSx}>
        {isEditMode ? "Edit your Travel Buddy trip" : "Post a Travel Buddy trip"}
      </Typography>

      {isEditMode && (
        <Alert severity="info" sx={{ mb: 2, fontSize: { xs: 13, sm: 14 } }}>
          You can edit everything on this trip until someone matches with you.
          If you change the role or flight itinerary, any pending requests
          against this trip will be closed automatically and their senders
          will be notified.
        </Alert>
      )}

      {isPrefilled && !isEditMode && (
        <Alert severity="info" sx={{ mb: 2, fontSize: { xs: 13, sm: 14 } }}>
          You're requesting to join another trip. The flight details are fixed to match their itinerary. You can only add your traveler details.
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5, mb: 3 }}>
        {ROLES.map(([val, text]) => {
          const on = form.role === val;
          return (
            <Button
              key={val}
              fullWidth
              disableElevation
              disabled={roleLocked}
              onClick={() => setRole(val)}
              sx={{
                ...BTN,
                height: "auto",
                py: 1,
                bgcolor: on ? c.rust : "#fff",
                color: on ? "#fff" : "#111",
                border: `1px solid ${on ? c.rust : c.border}`,
                "&:hover": { bgcolor: on ? c.rustDark : "#F3EFE6" },
                "&.Mui-disabled": { opacity: 0.6 },
              }}
            >
              {text}
            </Button>
          );
        })}
      </Box>

      {flights.map((f, i) => (
        <Box key={i} sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 2 }}>
            <SectionTitle>Flight segment {i + 1}</SectionTitle>
            {i > 0 && !flightsLocked && (
              <IconButton
                aria-label={`Remove flight segment ${i + 1}`}
                onClick={() => setForm((prev) => ({ ...prev, flights: prev.flights.filter((_, idx) => idx !== i) }))}
                size="small"
                sx={{ color: "#D32F2F", width: 40, height: 40, mt: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, borderColor: c.border, opacity: flightsLocked ? 0.75 : 1 }}>
            <Row>
              <Field small label="Airline" disabled={flightsLocked} {...bind(i, "airline")} />
              <Field small label="Flight number" disabled={flightsLocked} {...bind(i, "flightNumber")} />
            </Row>
            <Row>
              <Field small label="From airport" disabled={flightsLocked} {...bind(i, "from")} />
              <Field small label="To airport" disabled={flightsLocked} {...bind(i, "to")} />
            </Row>
            <Row>
              <Field small label={`Departure (local time at ${airportCode(f.from) || "origin"})`} type="datetime-local" disabled={flightsLocked} InputLabelProps={{ shrink: true }} {...bind(i, "departure")} />
              <Field small label={`Arrival (local time at ${airportCode(f.to) || "destination"})`} type="datetime-local" disabled={flightsLocked} InputLabelProps={{ shrink: true }} {...bind(i, "arrival")} />
            </Row>
          </Paper>
        </Box>
      ))}

      {!flightsLocked && flights.length < MAX_FLIGHTS && (
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={addFlight}
          sx={{ color: c.rust, fontWeight: 700, fontSize: 14, mb: 2, display: "flex", alignItems: "center", minHeight: 44, textAlign: "left" }}
        >
          + Add another segment (up to {MAX_FLIGHTS})
        </Link>
      )}

      <PrimaryButton onClick={handleNext}>
        Next: Traveller details
      </PrimaryButton>
    </>
  );
}

function StepTraveller({ form, setForm, onBack, onSubmit, submitting, requestMode, isEditMode, publishOnReject, setPublishOnReject }) {
  const isCompanion = form.role === "companion";
  const [submitted, setSubmitted] = useState(false);

  const errors = validateTraveller(form);
  const err = (key) => (submitted ? errors[key] : undefined);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    setSubmitted(true);
    if (!hasErrors(errors)) onSubmit();
  };

  const firstFlight = form.flights[0];
  const lastFlight = form.flights[form.flights.length - 1];
  const route = [airportCode(firstFlight.from), ...form.flights.map((f) => airportCode(f.to))].filter(Boolean).join(" → ");

  const submitLabel = submitting
    ? "Saving..."
    : isEditMode
      ? "Save changes"
      : requestMode
        ? "Send request"
        : "Post trip and find matches";

  return (
    <>
      <Header leftLabel="Back" onLeft={onBack} step={2} />
      <Typography component="h1" sx={pageTitleSx}>
        {isCompanion ? "About you" : "About your traveller"}
      </Typography>

      {isEditMode && (
        <Alert severity="info" sx={{ mb: 2, fontSize: { xs: 13, sm: 14 } }}>
          Traveller preferences and languages are safe to edit — they do not
          affect any pending requests.
        </Alert>
      )}

      {!isCompanion && (
        <Row>
          <SelectField
            label="Relationship"
            options={RELATIONSHIPS}
            value={form.relationship}
            onChange={(e) => setField("relationship")(e.target.value)}
          />
          <SelectField
            label="Traveller age band"
            options={AGE_BANDS}
            value={form.ageBand}
            onChange={(e) => setField("ageBand")(e.target.value)}
            error={err("ageBand")}
          />
        </Row>
      )}

      <Box sx={{ mb: 2 }}>
        <MultiSelect
          label="Languages spoken"
          options={LANGUAGES}
          value={form.languages}
          onChange={setField("languages")}
          error={err("languages")}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <MultiSelect
          label={isCompanion ? "Help you can offer (optional)" : "Help needed (optional)"}
          options={HELP}
          value={form.help}
          onChange={setField("help")}
        />
      </Box>

      <Box sx={{ mt: 3, mb: 3 }}>
        <FieldLabel>Who meets them in the US?</FieldLabel>
        <Paper variant="outlined" sx={{ px: { xs: 1.5, sm: 2 }, py: 1, borderRadius: 3, borderColor: c.border }}>
          <RadioGroup value={form.pickup} onChange={(e) => setField("pickup")(e.target.value)}>
            <FormControlLabel
              value="family"
              control={<Radio sx={{ "&.Mui-checked": { color: c.rust } }} />}
              label={<Typography sx={{ fontSize: 14, overflowWrap: "anywhere" }}>Family member picks up at {airportCode(lastFlight.to) || "US airport"}</Typography>}
              sx={{ borderBottom: `1px solid ${c.border}`, m: 0, py: 0.5, minHeight: 44, alignItems: "center" }}
            />
            <FormControlLabel
              value="saathi"
              control={<Radio sx={{ "&.Mui-checked": { color: c.rust } }} />}
              label={<Typography sx={{ fontSize: 14, overflowWrap: "anywhere" }}>Arrange pickup through Saathi</Typography>}
              sx={{ m: 0, py: 0.5, minHeight: 44, alignItems: "center" }}
            />
          </RadioGroup>
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, borderColor: c.border, mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>Review: what others see</Typography>
        <Typography sx={{ fontSize: 13, color: c.muted, mb: 1, overflowWrap: "anywhere" }}>
          {route} · {form.languages.join(", ")}
        </Typography>
        {!isCompanion && (
          <Typography sx={{ fontSize: 13, color: c.muted, overflowWrap: "anywhere" }}>
            Traveller {form.ageBand} · {form.relationship}
          </Typography>
        )}
        <Typography sx={{ fontSize: 12, color: c.muted, mt: 1 }}>
          Never collected or shown: passport, booking reference (PNR), seat, exact home address.
        </Typography>
      </Paper>

      {requestMode && !isEditMode && (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: 2.5, borderColor: c.border, bgcolor: "#fff" }}>
          <FormControlLabel
            sx={{ alignItems: "flex-start", mx: 0 }}
            control={
              <Checkbox
                size="small"
                checked={publishOnReject}
                onChange={(e) => setPublishOnReject(e.target.checked)}
                sx={{ p: 0.5, mr: 1, "&.Mui-checked": { color: c.rust } }}
              />
            }
            label={<Typography sx={{ fontSize: 13, lineHeight: 1.55, fontWeight: 700 }}>If my offer is rejected, publish my submitted trip as a normal trip.</Typography>}
          />
          <Typography sx={{ fontSize: 12, color: c.muted, ml: 4, mt: 0.5 }}>
            If unchecked, your submitted trip stays private and is visible only to you and in the related request history.
          </Typography>
        </Paper>
      )}

      <Box sx={{ mb: 4 }}>
        <FormControlLabel
          sx={{ alignItems: "flex-start", mx: 0 }}
          control={
            <Checkbox
              size="small"
              checked={form.agreed}
              onChange={(e) => setField("agreed")(e.target.checked)}
              sx={{ p: 0.5, mr: 1, "&.Mui-checked": { color: c.rust } }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, lineHeight: 1.55 }}>
              I understand companions are volunteers, not caregivers or escorts, and nobody should carry items for anyone. I will approve each companion myself and stay reachable during the trip.
            </Typography>
          }
        />
        {err("agreed") && <Typography sx={{ fontSize: 12, color: c.errText, mt: 0.5 }}>{err("agreed")}</Typography>}
      </Box>

      <PrimaryButton onClick={handleSubmit} disabled={submitting}>
        {submitLabel}
      </PrimaryButton>
    </>
  );
}

export default function PostTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [publishOnReject, setPublishOnReject] = useState(false);
  const [contactConsentOpen, setContactConsentOpen] = useState(false);

  const requestedRole = location.state?.role;
  const prefillTrip = location.state?.prefillTrip;
  const editTrip = location.state?.editTrip;

  const isEditMode = Boolean(editTrip?._id);
  const sourceTrip = editTrip || prefillTrip;

  const initialRole = isEditMode
    ? editTrip.role
    : ROLES.some(([value]) => value === requestedRole)
      ? requestedRole
      : "parent";

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    role: initialRole,
    flights: sourceTrip ? mapTripFlightsToForm(sourceTrip) : [{ ...EMPTY_FLIGHT }],
    relationship:
      initialRole === "parent"
        ? (sourceTrip?.relationship || INITIAL_FORM.relationship)
        : INITIAL_FORM.relationship,
    ageBand:
      initialRole === "parent"
        ? (sourceTrip?.ageBand || "")
        : "",
    languages: sourceTrip?.languages?.length
      ? [...sourceTrip.languages]
      : [...INITIAL_FORM.languages],
    help: sourceTrip?.help?.length ? [...sourceTrip.help] : [],
    pickup: sourceTrip?.pickup || INITIAL_FORM.pickup,
    agreed: isEditMode,
  }));

  useEffect(() => {
    if (isEditMode && editTrip.status !== "OPEN") {
      toast.error("This trip can no longer be edited because it is matched or cancelled.");
      navigate("/travelbuddy", { replace: true });
    }
  }, [isEditMode, editTrip, navigate]);

  const buildPayload = () => ({
    role: form.role,
    relationship: form.role === "parent" ? form.relationship : undefined,
    ageBand: form.role === "parent" ? form.ageBand : undefined,
    languages: form.languages,
    help: form.help,
    pickup: form.pickup,
    flights: form.flights.map((f) => ({
      airline: f.airline,
      flightNumber: f.flightNumber.trim().toUpperCase(),
      fromCode: airportCode(f.from),
      toCode: airportCode(f.to),
      departureTime: f.departure,
      arrivalTime: f.arrival,
    })),
  });

  const createOrUpdateTrip = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = buildPayload();
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to continue.");
        setSubmitting(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEditMode) {
        await axios.patch(`${Api}/travel-buddy/${editTrip._id}`, payload, config);
        toast.success("Trip updated successfully!");
        navigate("/travelbuddy");
        return;
      }

      if (prefillTrip?._id) {
        await axios.post(
          `${Api}/travel-buddy/requests`,
          {
            targetTripId: prefillTrip._id,
            trip: payload,
            publishOnReject,
            contactConsent: true,
          },
          config
        );
        toast.success("Request sent! The trip owner must approve it.");
        setContactConsentOpen(false);
      } else {
        await axios.post(`${Api}/travel-buddy`, payload, config);
        toast.success("Trip posted successfully!");
      }

      navigate("/travelbuddy");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        (isEditMode ? "Failed to update trip" : "Failed to post trip")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={pageSx}>
        <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 600, md: 680 }, mx: "auto" }}>
          {step === 1 ? (
            <StepFlights
              form={form}
              setForm={setForm}
              onCancel={() => navigate(-1)}
              isPrefilled={Boolean(prefillTrip)}
              isEditMode={isEditMode}
              onNext={() => setStep(2)}
            />
          ) : (
            <StepTraveller
              form={form}
              setForm={setForm}
              onBack={() => setStep(1)}
              onSubmit={() => {
                if (isEditMode) {
                  createOrUpdateTrip();
                } else if (prefillTrip?._id) {
                  setContactConsentOpen(true);
                } else {
                  createOrUpdateTrip();
                }
              }}
              submitting={submitting}
              requestMode={Boolean(prefillTrip?._id) && !isEditMode}
              isEditMode={isEditMode}
              publishOnReject={publishOnReject}
              setPublishOnReject={setPublishOnReject}
            />
          )}
        </Box>
      </Box>

      <Dialog
        open={contactConsentOpen}
        onClose={() => {
          if (!submitting) setContactConsentOpen(false);
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { m: { xs: 2, sm: 4 }, width: { xs: "calc(100% - 32px)", sm: "100%" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: c.navy, fontSize: { xs: 18, sm: 20 } }}>
          Share contact details?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: 14, sm: 16 } }}>
            By sending this Travel Buddy request, you agree that your registered
            contact details may be shared with the trip owner if they approve
            the request and both of you consent to the connection.
          </DialogContentText>
          <Alert severity="info" sx={{ mt: 2, fontSize: { xs: 13, sm: 14 } }}>
            Your contact details will not be unlocked just by sending the request.
            The trip owner must approve it and agree to contact sharing too.
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            pt: 0,
            gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: "stretch",
            "& > :not(style) ~ :not(style)": { ml: 0 },
          }}
        >
          <Button
            color="inherit"
            disabled={submitting}
            onClick={() => setContactConsentOpen(false)}
            sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={createOrUpdateTrip}
            sx={{ minHeight: 44, width: { xs: "100%", sm: "auto" } }}
          >
            {submitting ? "Sending..." : "Agree & Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}