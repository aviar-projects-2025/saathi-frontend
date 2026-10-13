import React, { memo, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CssBaseline,
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
import Api from "../../Api.jsx";

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
};

const theme = createTheme({
  typography: {
    fontFamily: `"DM Sans", "Inter", "Segoe UI", Roboto, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  palette: { primary: { main: c.rust } },
  shape: { borderRadius: 12 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          borderRadius: 10,
          "& fieldset": { borderColor: c.border },
          "&:hover fieldset": { borderColor: "#B8B09C" },
          "&.Mui-focused fieldset": { borderColor: c.rust },
        },
        input: { padding: "14px 14px", fontSize: 15 },
      },
    },
  },
});
const user = JSON.parse(localStorage.getItem("user"));
const ROLES = [
  ["parent", "My parent needs a companion"],
  ["companion", "I can be a companion"],
];
const RELATIONSHIPS = ["Mother", "Father", "Grandmother", "Grandfather", "Other"];
const AGE_BANDS = ["60 and over", "70 and over", "80 and over"];
// label shown in the UI -> value the backend accepts (case-sensitive)
const AGE_GROUP_ENUM = {
  "60 and over": "60+", // replace with the real enum values
  "70 and over": "70+", // if only "60+" exists, map all three to it
  "80 and over": "80+",
};
const LANGUAGES = [
  "English", "Tamil", "Hindi", "Bengali", "Telugu",
  "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi",
];
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

// ONE state object for every field in the form (both steps)
const INITIAL_FORM = {
  ageBand: "",
  role: "parent",
  flights: [{ ...EMPTY_FLIGHT }], // 1 to MAX_FLIGHTS legs
  availableSeats: 1,
  relationship: "Mother",
  ageBand: "",
  languages: [],
  help: [],
  pickup: "family",
  agreed: false,
};


const AIRLINE_RE = /^[A-Za-z][A-Za-z .&'-]{1,39}$/;
const FLIGHT_NO_RE = /^[A-Za-z0-9]{2}\s?\d{1,4}[A-Za-z]?$/;

const airportCode = (v) => {
  const t = v.trim();
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
    else if (!AIRLINE_RE.test(f.airline.trim())) e.airline = "Use letters only, e.g. Emirates.";

    if (!f.flightNumber.trim()) e.flightNumber = "Enter the flight number.";
    else if (!FLIGHT_NO_RE.test(f.flightNumber.trim()))
      e.flightNumber = "Use airline code + number, e.g. EK 544.";

    if (!f.from.trim()) e.from = "Enter the departure airport.";
    else if (!fromCode) e.from = "Include the 3-letter code, e.g. Chennai (MAA).";
    else if (prevTo && prevTo !== fromCode) e.from = `Must be ${prevTo}, where flight ${i} ends.`;

    if (!f.to.trim()) e.to = "Enter the arrival airport.";
    else if (!toCode) e.to = "Include the 3-letter code, e.g. Dubai (DXB).";
    else if (fromCode === toCode) e.to = "Must differ from the departure airport.";

    if (!f.departure) e.departure = "Enter the departure time.";
    else if (prev?.arrival && f.departure <= prev.arrival)
      e.departure = `Must be after flight ${i} arrives.`;

    if (!f.arrival) e.arrival = "Enter the arrival time.";

    return e;
  });

const validateTraveller = (form) => {
  const e = {};
  if (form.role === "parent") {
    if (!form.relationship) e.relationship = "Select a relationship.";
    if (!form.ageBand) e.ageBand = "Select an age band.";
  }
  if (form.languages.length === 0) e.languages = "Pick at least one language.";
  if (!form.pickup) e.pickup = "Choose who meets them in the US.";
  if (!form.agreed) e.agreed = "Confirm this to post your trip.";
  return e;
};

const hasErrors = (errs) =>
  Array.isArray(errs) ? errs.some((e) => Object.keys(e).length > 0) : Object.keys(errs).length > 0;

const MODE_OF_TRAVEL = "Flight";

const buildPayload = (form, userId) => {
  const { role, flights, ageBand, languages, help } = form;
  const first = flights[0];
  const last = flights[flights.length - 1];

  const fromAirport = first.from.trim();
  const toAirport = last.to.trim();

  return {
    createdBy: user?.id,
    modeOfTravel: MODE_OF_TRAVEL,

    startTime: new Date(first.departure).toISOString(),
    status: "OPEN",
    availableSeats: form.availableSeats,
    totalSeats: form.availableSeats,
    travellerType: role,
    language: languages,
    ageGroupPreference: role === "parent" ? AGE_GROUP_ENUM[ageBand] : undefined,
    transitHelp: help.includes("Transit guidance"),
    medicalAssistance: help.includes("Wheelchair"),
    from: fromAirport,
    fromAirport,
    destination: toAirport,
    toAirport,
    flightNumber: flights.map((f) => f.flightNumber.trim().toUpperCase()).join(" / "),
    airlineName: [...new Set(flights.map((f) => f.airline.trim()))].join(", "),
  };
};


const toastOptions = (isTab, autoClose) => ({
  position: isTab ? "top-center" : "top-right",
  autoClose,
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

/* ---------- small components ---------- */

const FieldLabel = ({ children, small }) => (
  <Typography sx={{ fontWeight: 700, fontSize: small ? 12 : 13, color: "#111", mb: 0.75 }}>
    {children}
  </Typography>
);

const ErrorText = ({ children }) =>
  children ? (
    <Typography sx={{ fontSize: 12, color: c.errText, mt: 0.75 }} role="alert">
      {children}
    </Typography>
  ) : null;

const Field = memo(({ label, small, error, ...props }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <FieldLabel small={small}>{label}</FieldLabel>
    <TextField
      fullWidth
      size="small"
      error={Boolean(error)}
      helperText={error || " "} // " " reserves space so the layout doesn't jump
      {...props}
    />
  </Box>
));

const SelectField = ({ label, options, error, ...props }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <FieldLabel>{label}</FieldLabel>
    <TextField select fullWidth error={Boolean(error)} helperText={error || " "} {...props}>
      {options.map((o) => (
        <MenuItem key={o} value={o}>
          {o}
        </MenuItem>
      ))}
    </TextField>
  </Box>
);

const Row = ({ children }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 0.5 }}>
    {children}
  </Stack>
);

const SectionTitle = ({ children }) => (
  <Typography sx={{ fontWeight: 700, fontSize: 16, color: c.navy, mb: 1 }}>{children}</Typography>
);

const PrimaryButton = (props) => (
  <Button
    fullWidth
    variant="contained"
    disableElevation
    {...props}
    sx={{
      py: 1.75,
      borderRadius: 2.5,
      fontSize: 16,
      bgcolor: c.rust,
      "&:hover": { bgcolor: c.rustDark },
      "&.Mui-disabled": { bgcolor: "#E3C2B3", color: "#fff" },
    }}
  />
);

// Dropdown panel with a "Select" button pinned at the bottom
const DonePaper = ({ onDone, children, ...props }) => (
  <Paper {...props}>
    {children}
    <Box
      sx={{ borderTop: `1px solid ${c.border}`, p: 1, display: "flex", justifyContent: "flex-end" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button
        size="small"
        variant="contained"
        disableElevation
        onClick={onDone}
        sx={{ borderRadius: 3, minWidth: 80, bgcolor: c.rust, "&:hover": { bgcolor: c.rustDark } }}
      >
        Select
      </Button>
    </Box>
  </Paper>
);

const MultiSelect = ({ label, options, value, onChange, error, placeholder }) => {
  const [open, setOpen] = useState(false);

  const PaperWithDone = useMemo(
    () => (props) => <DonePaper {...props} onDone={() => setOpen(false)} />,
    []
  );

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      <Autocomplete
        multiple
        fullWidth
        disableCloseOnSelect
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        value={value}
        onChange={(_, v) => onChange(v)}
        PaperComponent={PaperWithDone}
        renderTags={(tags, getTagProps) =>
          tags.map((tag, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return <Chip key={key} label={tag} size="small" {...tagProps} />;
          })
        }
        renderOption={(props, option, { selected }) => {
          const { key, ...rest } = props;
          return (
            <li key={key} {...rest}>
              <Checkbox
                size="small"
                checked={selected}
                sx={{ p: 0.5, mr: 1, "&.Mui-checked": { color: c.rust } }}
              />
              {option}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={value.length ? "" : placeholder}
            error={Boolean(error)}
            helperText={error || " "}
          />
        )}
      />
    </Box>
  );
};

const fmtDate = (v) => {
  if (!v) return "";
  const [y, m, d] = v.split("T")[0].split("-").map(Number);
  const weekday = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
};
const fmtTime = (v) => v?.split("T")[1] || "";

const PICKUP_LABELS = {
  family: (airport) => `Family member picks up at ${airport}`,
  saathi: () => "Pickup arranged through Saathi",
};

const ReviewSummary = ({ form, postedBy }) => {
  const { role, flights, relationship, ageBand, languages, help, pickup } = form;

  const route = [airportCode(flights[0].from), ...flights.map((f) => airportCode(f.to))]
    .filter(Boolean)
    .join(" → ");
  const flightNos = flights.map((f) => f.flightNumber.trim().toUpperCase()).filter(Boolean).join(" / ");
  const arrivalAirport = airportCode(flights[flights.length - 1].to) || "the arrival airport";

  const who =
    role === "parent"
      ? `Traveller ${ageBand.replace(" and over", "+")}${relationship ? ` (${relationship})` : ""}`
      : "Companion volunteer";

  const rows = [
    ["Flights", flightNos || "—"],
    ["Date", fmtDate(flights[0].departure) || "—"],
    ["Route", route || "—"],
    ["Who", who],
    ["Languages", languages.join(", ") || "—"],
    [role === "parent" ? "Help needed" : "Help offered", help.join(", ") || "None"],
    ["Pickup", PICKUP_LABELS[pickup]?.(arrivalAirport) ?? "—"],
    ["Posted by", `${postedBy} (photo, rating, trust chain)`],
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: c.border, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1 }}>
        Review: what others see before you accept anyone
      </Typography>

      {rows.map(([k, v]) => (
        <Stack key={k} direction="row" spacing={1.5} sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: 13, color: c.muted, width: 92, flexShrink: 0 }}>{k}</Typography>
          <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{v}</Typography>
        </Stack>
      ))}

      {flights.map((f, i) => (
        <Typography key={i} sx={{ fontSize: 12.5, color: c.muted, mt: i === 0 ? 1 : 0.25, lineHeight: 1.5 }}>
          Flight {i + 1}: {f.airline.trim()} {f.flightNumber.trim().toUpperCase()} ·{" "}
          {airportCode(f.from)} {fmtTime(f.departure)} → {airportCode(f.to)} {fmtTime(f.arrival)}
          {f.arrival ? ` (${fmtDate(f.arrival)})` : ""}
        </Typography>
      ))}

      <Typography sx={{ fontSize: 13, color: c.muted, mt: 1, lineHeight: 1.5 }}>
        Never collected or shown: passport, booking reference (PNR), seat, traveller name, exact
        home address.
      </Typography>
    </Paper>
  );
};

const Header = ({ leftLabel, onLeft, step }) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Button
        onClick={onLeft}
        sx={{ p: 0, minWidth: 0, color: c.rust, fontSize: 15, "&:hover": { bgcolor: "transparent" } }}
      >
        {leftLabel}
      </Button>
      <Box sx={{marginLeft:"70%"}}>
      <Typography sx={{ fontSize: 13, color: c.muted }}>
        Step {step} of 2: {step === 1 ? "Flights" : "Traveller and review"}
      </Typography>
      </Box>
    </Stack>
    <Stack direction="row" spacing={1}>
      {[1, 2].map((i) => (
        <Box
          key={i}
          sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: i <= step ? c.rust : "#E8E3DA" }}
        />
      ))}
    </Stack>
  </Box>
);

const dateProps = { type: "datetime-local", InputLabelProps: { shrink: true } };
function StepFlights({ form, setForm, onNext, onCancel }) {
  const { role, flights } = form;
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateFlights(flights), [flights]);
  const invalid = hasErrors(errors);

  const setRole = (value) => setForm((f) => ({ ...f, role: value }));

  const update = (i, key, value) =>
    setForm((f) => ({
      ...f,
      flights: f.flights.map((fl, idx) => (idx === i ? { ...fl, [key]: value } : fl)),
    }));

  const addFlight = () =>
    setForm((f) =>
      f.flights.length < MAX_FLIGHTS ? { ...f, flights: [...f.flights, { ...EMPTY_FLIGHT }] } : f
    );


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

  return (
    <>
      <Header leftLabel="Cancel" onLeft={onCancel} step={1} />
      <Typography component="h1" sx={{ fontWeight: 800, fontSize: 26, color: c.navy, mb: 1.5 }}>
        Post a Travel Buddy trip
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
        {ROLES.map(([val, text]) => {
          const on = role === val;
          return (
            <Button
              key={val}
              fullWidth
              disableElevation
              onClick={() => setRole(val)}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                fontSize: 15,
                bgcolor: on ? c.rust : "#fff",
                color: on ? "#fff" : "#111",
                border: `1px solid ${on ? c.rust : c.border}`,
                "&:hover": { bgcolor: on ? c.rustDark : "#F3EFE6" },
              }}
            >
              {text}
            </Button>
          );
        })}
      </Stack>

      {flights.map((f, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <SectionTitle>Flight {i + 1}</SectionTitle>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: c.border }}>
            <Row>
              <Field small label="Airline" placeholder="Emirates" {...bind(i, "airline")} />
              <Field small label="Flight number" placeholder="EK 544" {...bind(i, "flightNumber")} />
            </Row>
            <Row>
              <Field small label="From airport" placeholder="Chennai (MAA)" {...bind(i, "from")} />
              <Field small label="To airport" placeholder="Dubai (DXB)" {...bind(i, "to")} />
            </Row>
            <Row>
              <Field
                small
                label={`Departure (local time at ${airportCode(f.from) || "origin"})`}
                {...dateProps}
                {...bind(i, "departure")}
              />
              <Field
                small
                label={`Arrival (local time at ${airportCode(f.to) || "destination"})`}
                {...dateProps}
                {...bind(i, "arrival")}
              />
            </Row>
          </Paper>
        </Box>
      ))}

      {flights.length < MAX_FLIGHTS && (
        <Link
          component="button"
          type="button"
          underline="none"
          onClick={addFlight}
          sx={{ color: c.rust, fontWeight: 700, fontSize: 14, mb: 2, display: "block" }}
        >
          + Add another flight (up to {MAX_FLIGHTS})
        </Link>
      )}

      <Stack spacing={1.25} sx={{ mb: 4 }}>
        <Box sx={{ bgcolor: c.infoBg, color: c.infoText, borderRadius: 2, px: 2, py: 1.25, fontSize: 13.5, lineHeight: 1.55 }}>
          Enter each time as shown on the ticket, in the local time of that airport. Chicago is on
          CDT until 11/01/2026 (not CST).
        </Box>
        {submitted && invalid && (
          <Box role="alert" sx={{ bgcolor: c.errBg, color: c.errText, borderRadius: 2, px: 2, py: 1.25, fontSize: 13.5, lineHeight: 1.55 }}>
            Fix the highlighted fields to continue.
          </Box>
        )}
      </Stack>

      <PrimaryButton onClick={handleNext}>Next: Traveller details</PrimaryButton>
    </>
  );
}

function StepTraveller({ form, setForm, onBack, onSubmit, postedBy, submitting }) {
  const isCompanion = form.role === "companion";
  const arrivalAirport = airportCode(form.flights[form.flights.length - 1].to) || "the arrival airport";
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateTraveller(form), [form]);
  const err = (key) => (submitted ? errors[key] : undefined);

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setFromEvent = (key) => (e) => setField(key)(e.target.value);

  const handleSubmit = () => {
    setSubmitted(true);
    if (!hasErrors(errors)) onSubmit();
  };

  return (
    <>
      <Header leftLabel="Back" onLeft={onBack} step={2} />
      <Typography component="h1" sx={{ fontWeight: 800, fontSize: 26, color: c.navy, mb: 1.5 }}>
        {isCompanion ? "About you" : "About your traveller"}
      </Typography>

      {!isCompanion && (
        <Row>
          <SelectField
            label="Relationship"
            options={RELATIONSHIPS}
            value={form.relationship}
            onChange={setFromEvent("relationship")}
            error={err("relationship")}
          />
          <SelectField
            label="Traveller age band"
            options={AGE_BANDS}
            value={form.ageBand}
            onChange={setFromEvent("ageBand")}
            error={err("ageBand")}
          />
        </Row>
      )}

      <Row>
        <MultiSelect
          label="Languages spoken"
          placeholder="Select languages"
          options={LANGUAGES}
          value={form.languages}
          onChange={setField("languages")}
          error={err("languages")}
        />
        <MultiSelect
          label={isCompanion ? "Help you can offer (optional)" : "Help needed (optional)"}
          placeholder="Select help"
          options={HELP}
          value={form.help}
          onChange={setField("help")}
        />
      </Row>

      <Box sx={{ mt: 3, mb: 2 }}>
        <FieldLabel>Who meets them in the US?</FieldLabel>
        <Paper
          variant="outlined"
          sx={{ px: 2, py: 0.5, borderRadius: 3, borderColor: err("pickup") ? c.errText : c.border }}
        >
          <RadioGroup value={form.pickup} onChange={setFromEvent("pickup")}>
            <FormControlLabel
              value="family"
              control={<Radio sx={{ "&.Mui-checked": { color: c.rust } }} />}
              label={PICKUP_LABELS.family(arrivalAirport)}
              sx={{ borderBottom: "1px solid #EEE9DF", m: 0, py: 0.5 }}
            />
            <FormControlLabel
              value="saathi"
              control={<Radio sx={{ "&.Mui-checked": { color: c.rust } }} />}
              label={
                <span>
                  Arrange pickup through Saathi (
                  <Link href="#" underline="none" sx={{ color: c.rust, fontWeight: 700 }}>
                    post an airport-pickup ride
                  </Link>
                  )
                </span>
              }
              sx={{ m: 0, py: 0.5 }}
            />
          </RadioGroup>
        </Paper>
        <ErrorText>{err("pickup")}</ErrorText>
      </Box>

      <Box sx={{ mb: 2 }}>
        <FieldLabel>Family contact in the US (shared only after you accept a companion)</FieldLabel>
        <TextField fullWidth value="Your verified number +1 (***) ***-0142" InputProps={{ readOnly: true }} />
      </Box>

      <ReviewSummary form={form} postedBy={postedBy} />

      <Box sx={{ mb: 6 }}>
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
              I understand companions are volunteers, not caregivers or escorts, and nobody should
              carry items for anyone. I will approve each companion myself and stay reachable during
              the trip.
            </Typography>
          }
        />
        <ErrorText>{err("agreed")}</ErrorText>
      </Box>

      <PrimaryButton onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Posting..." : "Post trip and find matches"}
      </PrimaryButton>
    </>
  );
}

export default function PostTrip({ onCancel, onClose, user, isTab = false, apiUrl }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const requestedRole = location.state?.role;
  const initialRole = ROLES.some(([value]) => value === requestedRole) ? requestedRole : "parent";

  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, role: initialRole }));
  const [submitting, setSubmitting] = useState(false);

  const createTrip = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await axios.post(`${Api}/rides/`, buildPayload(form, user?.id));

      toast.success("Ride Created Successfully...!", toastOptions(isTab, 2000));
      setForm(INITIAL_FORM);
      setStep(1);
      if (onClose) {
        onClose();
      } else {
        navigate("/myride", { state: { tab: 2, refresh: true, refreshKey: Date.now() } });
      }
    } catch (error) {
      console.error("Create ride error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to create ride",
        toastOptions(isTab, 3000)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: c.bg, minHeight: "100vh", py: 2.5, px: 2.5 }}>
        <Box sx={{ maxWidth: 680, mx: "auto" }}>
          {step === 1 ? (
            <StepFlights
              form={form}
              setForm={setForm}
              onCancel={onCancel}
              onNext={() => setStep(2)}
            />
          ) : (
            <StepTraveller
              form={form}
              setForm={setForm}
              onBack={() => setStep(1)}
              onSubmit={createTrip}
              postedBy={user?.name || "You"}
              submitting={submitting}
            />
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
