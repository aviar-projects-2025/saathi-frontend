import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  Checkbox,
  Switch,
  Button,
  Alert,
  Chip,
  IconButton,
  useMediaQuery,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  Minus,
  Info,
  Users,
  Luggage,
  Baby,
  ShieldCheck,
} from "lucide-react";
import { useRide } from "../context/RideContext";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import axios from "axios";
import Api from "../Api";
import { toast } from "react-toastify";
import ToastConfig from "../components/ToastConfig";
import RideLocationPicker from "../components/RideLocationPicker";

/* ═══════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════ */
const RUST = "#C83F08";
const RUST_DARK = "#A93205";
const NAVY = "#1B2A4E";
const INK = "#2A2A2A";
const MUTED = "#666";
const BORDER = "#E7E0D8";
const BG = "#FAF8F5";
const CARD = "#FFFFFF";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════ */
const OFFER_STEPS = ["Trip details", "Ride options", "Review"];

const TIME_ZONES = [
  "Eastern (ET)",
  "Central (CT)",
  "Mountain (MT)",
  "Pacific (PT)",
  "Alaska (AKT)",
  "Hawaii (HT)",
];

const OFFER_CATEGORIES = [
  "Airport pickup / drop",
  "Temple / event",
  "Grocery / shopping",
  "Regular commute",
  "Other",
];

const REQUEST_CATEGORIES = [
  "Airport pickup / drop",
  "Temple / event",
  "Other",
];

const LUGGAGE_OPTIONS = ["None", "1–2 bags", "3+ bags"];

const HELP_OPTIONS = [
  "Help with luggage",
  "Wait at terminal",
  "Speaks Tamil",
  "Speaks Hindi",
];

const FLEXIBILITY_OPTIONS = ["± 15 min", "± 30 min", "± 1 hour", "± 2 hours"];

/* ═══════════════════════════════════════════════════════
   COST CAP
   ═══════════════════════════════════════════════════════ */
const COST_FLOOR = 5;
const COST_RATE_PER_MILE = 0.3;
const COST_BUFFER = 2;
const computeCostCap = (miles = 0) =>
  Math.max(COST_FLOOR, Math.round(miles * COST_RATE_PER_MILE + COST_BUFFER));

/* ═══════════════════════════════════════════════════════
   INITIAL STATE
   ═══════════════════════════════════════════════════════ */
const INITIAL_OFFER = {
  from: "",
  destination: "",
  fromLocation: { address: "", latitude: null, longitude: null },
  destinationLocation: { address: "", latitude: null, longitude: null },
  distanceKm: null,
  duration: null,
  date: "",
  time: "",
  timeZone: "Central (CT)",
  category: "",
  customCategory: "",
  description: "",
  availableSeats: 2,
  costPerSeat: "",
  luggageSpace: "None",
  childFriendly: false,
  recurringRide: false,
  womenOnly: false,
  helpCanOffer: [],
  exactPickup: "",
  notes: "",
  confirmCostSharing: false,
};

const INITIAL_REQUEST = {
  from: "",
  destination: "",
  fromLocation: { address: "", latitude: null, longitude: null },
  destinationLocation: { address: "", latitude: null, longitude: null },
  distanceKm: null,
  date: "",
  neededBy: "",
  flexibility: "± 1 hour",
  passengers: 1,
  bags: 1,
  category: "",
  customCategory: "",
  womenDriversOnly: false,
  travelingWithChild: false,
  notes: "",
};

/* ═══════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════ */
const tfSx = {
  "& .MuiInputBase-input": { fontSize: { xs: "0.9rem", sm: "0.95rem" } },
  "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" },
};
const selectSx = {
  fontSize: { xs: "0.9rem", sm: "0.95rem" },
  borderRadius: 2,
  bgcolor: "#fff",
};
const labelSx = {
  fontSize: { xs: "0.72rem", sm: "0.78rem" },
  fontWeight: 700,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  color: MUTED,
  mb: 0.9,
};
const primaryBtn = {
  bgcolor: RUST,
  color: "#fff",
  textTransform: "none",
  fontWeight: 700,
  fontSize: { xs: 14.5, sm: 15.5 },
  py: { xs: 1.4, sm: 1.55 },
  borderRadius: 2,
  boxShadow: "none",
  width: "100%",
  "&:hover": { bgcolor: RUST_DARK, boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#E3C9BE", color: "#fff" },
};

/* ═══════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════ */
function ChipToggle({ label, active, onClick }) {
  return (
    <Chip
      label={label}
      clickable
      onClick={onClick}
      sx={{
        borderRadius: 999,
        fontWeight: 600,
        fontSize: { xs: 12.5, sm: 13 },
        height: { xs: 30, sm: 34 },
        bgcolor: active ? RUST : "#fff",
        color: active ? "#fff" : INK,
        border: `1px solid ${active ? RUST : BORDER}`,
        "&:hover": { bgcolor: active ? RUST_DARK : "#F4F0EA" },
      }}
    />
  );
}

function ToggleRow({ icon: Icon, title, subtitle, checked, onChange }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        py: { xs: 1.5, sm: 1.75 },
        borderBottom: `1px solid ${BORDER}`,
        "&:last-of-type": { borderBottom: "none" },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ pr: 2, minWidth: 0 }}>
        {Icon && (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              bgcolor: "rgba(200,63,8,0.08)",
              display: "grid",
              placeItems: "center",
              color: RUST,
              flexShrink: 0,
              mt: 0.15,
            }}
          >
            <Icon size={16} />
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: "0.9rem", sm: "0.95rem" }, fontWeight: 600, color: INK }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.78rem" },
                color: MUTED,
                mt: 0.25,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": { color: RUST },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: RUST },
          flexShrink: 0,
        }}
      />
    </Stack>
  );
}

function SeatStepper({ value, onChange, min = 1, max = 7 }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const btnSx = {
    width: { xs: 40, sm: 44 },
    height: { xs: 40, sm: 44 },
    border: `1px solid ${BORDER}`,
    borderRadius: 999,
    bgcolor: "#fff",
    color: INK,
    "&:hover": { bgcolor: "#F4F0EA" },
    "&.Mui-disabled": { bgcolor: "#F7F3EE", color: "#BBB" },
  };

  return (
    <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 2.5 }}>
      <IconButton onClick={dec} disabled={value <= min} sx={btnSx}>
        <Minus size={18} />
      </IconButton>
      <Typography
        sx={{
          fontSize: { xs: 22, sm: 24 },
          fontWeight: 800,
          color: INK,
          minWidth: 32,
          textAlign: "center",
        }}
      >
        {value}
      </Typography>
      <IconButton onClick={inc} disabled={value >= max} sx={btnSx}>
        <Plus size={18} />
      </IconButton>
    </Stack>
  );
}

function StepProgress({ steps, step }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: { xs: 3, sm: 3.5 } }}>
      {steps.map((_, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            bgcolor: i <= step ? RUST : "#E8E1D8",
            transition: "background-color 0.25s ease",
          }}
        />
      ))}
    </Stack>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function OfferRide({ ride, requestRide, onSave, onClose, setOpen }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const inputSize = isMobile ? "small" : "medium";
  const isEditMode = Boolean(ride);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { refreshRides } = useRide();
  const TOASTS = ToastConfig();

  /* "offer" or "request" */
  const [mode, setMode] = useState("offer");

  /* Offer state */
  const [offerForm, setOfferForm] = useState(INITIAL_OFFER);
  const [step, setStep] = useState(0);

  /* Request state */
  const [requestForm, setRequestForm] = useState(INITIAL_REQUEST);
  const [requestErrors, setRequestErrors] = useState({});

  /* Shared */
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  /* Hydrate offer when editing */
  useEffect(() => {
    if (!ride || mode !== "offer") return;
    const start = ride.startTime ? new Date(ride.startTime) : null;
    const pad = (n) => String(n).padStart(2, "0");
    setOfferForm({
      ...INITIAL_OFFER,
      ...ride,
      date: start ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}` : "",
      time: start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "",
      costPerSeat: ride.costPerSeat ?? ride.fuelSharing ?? "",
      luggageSpace: ride.luggageSpace || "None",
      childFriendly: !!ride.childFriendly,
      recurringRide: !!ride.recurringRide,
      womenOnly: !!ride.womenOnly,
      helpCanOffer: ride.helpCanOffer || [],
      exactPickup: ride.exactPickup || "",
      notes: ride.notes || "",
      confirmCostSharing: !!ride.confirmCostSharing,
    });
  }, [ride, mode]);

  /*
   * When a member clicks "I can drive" on a ride request, prefill the offer
   * form with that request's route, requested departure time, and location data.
   * This is separate from the edit-ride hydration above so normal Offer Ride
   * creation and editing keep their existing behaviour.
   */
  useEffect(() => {
    if (!requestRide) return;

    const start = requestRide.startTime ? new Date(requestRide.startTime) : null;
    const pad = (n) => String(n).padStart(2, "0");
    const validDate = start && !Number.isNaN(start.getTime());

    setMode("offer");
    setStep(0);
    setSubmitted(false);
    setShowErrors(false);
    setErrors({});
    setServerError("");
    setOfferForm({
      ...INITIAL_OFFER,
      from: requestRide.from || requestRide.fromLocation?.address || "",
      destination:
        requestRide.destination || requestRide.destinationLocation?.address || "",
      fromLocation: requestRide.fromLocation || {
        address: requestRide.from || "",
        latitude: null,
        longitude: null,
      },
      destinationLocation: requestRide.destinationLocation || {
        address: requestRide.destination || "",
        latitude: null,
        longitude: null,
      },
      distanceKm: requestRide.distanceKm ?? null,
      date: validDate
        ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
        : "",
      time: validDate ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "",
      category: REQUEST_CATEGORIES.includes(requestRide.category)
        ? requestRide.category
        : requestRide.category
          ? "Other"
          : "",
      customCategory:
        requestRide.category && !REQUEST_CATEGORIES.includes(requestRide.category)
          ? requestRide.category
          : "",
      description: requestRide.description || requestRide.notes || "",
      availableSeats: Math.max(1, Number(requestRide.passengers || requestRide.seatsRequested || 1)),
      timeZone: requestRide.timeZone || INITIAL_OFFER.timeZone,
      notes: requestRide.notes || "",
      status: "OPEN",
    });
  }, [requestRide]);

  /* Update helpers */
  const updateOffer = (key, value) => {
    setOfferForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      if (value !== "" && value !== null && value !== undefined) delete n[key];
      return n;
    });
  };
  const updateRequest = (key, value) => {
    setRequestForm((prev) => ({ ...prev, [key]: value }));
    setRequestErrors((prev) => {
      const n = { ...prev };
      if (value !== "" && value !== null && value !== undefined) delete n[key];
      return n;
    });
  };

  const toggleHelp = (label) => {
    const list = offerForm.helpCanOffer || [];
    const next = list.includes(label) ? list.filter((x) => x !== label) : [...list, label];
    updateOffer("helpCanOffer", next);
  };

  /* Cost cap */
  const distanceMiles = offerForm.distanceKm ? Math.round(offerForm.distanceKm * 0.621371) : 0;
  const costCap = useMemo(() => computeCostCap(distanceMiles), [distanceMiles]);
  const costEntered = Number(offerForm.costPerSeat || 0);
  const costExceedsCap = costEntered > costCap;

  /* ─────── OFFER VALIDATION ─────── */
  const validateOfferStep = () => {
    setShowErrors(true);
    const e = {};

    if (step === 0) {
      if (!offerForm.from?.trim()) e.from = "From is required";
      if (!offerForm.destination?.trim()) e.destination = "To is required";
      if (!offerForm.date) e.date = "Date is required";
      if (!offerForm.time) e.time = "Departure time is required";
      if (!offerForm.timeZone) e.timeZone = "Pick a time zone";
      if (!offerForm.category && !offerForm.customCategory?.trim()) e.category = "Pick a category";
      if (Number(offerForm.availableSeats) < 1) e.availableSeats = "At least 1 seat";
      if (offerForm.date && offerForm.time) {
        const d = new Date(`${offerForm.date}T${offerForm.time}:00`);
        if (d.getTime() <= Date.now()) e.time = "Departure can't be in the past";
      }
    }
    if (step === 1) {
      if (offerForm.costPerSeat !== "" && Number(offerForm.costPerSeat) < 0) {
        e.costPerSeat = "Cost must be positive";
      }
      if (costExceedsCap) {
        e.costPerSeat = `$${costEntered} exceeds the $${costCap} cap for this distance.`;
      }
      if (!offerForm.luggageSpace) e.luggageSpace = "Pick a luggage option";
    }
    if (step === 2) {
      if (!offerForm.confirmCostSharing) {
        e.confirmCostSharing = "Please confirm cost-sharing before posting";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─────── REQUEST VALIDATION ─────── */
  const validateRequest = () => {
    const e = {};
    if (!requestForm.from?.trim()) e.from = "From is required";
    if (!requestForm.destination?.trim()) e.destination = "To is required";
    if (!requestForm.date) e.date = "Date is required";
    if (!requestForm.neededBy) e.neededBy = "Needed by time is required";
    if (!requestForm.flexibility) e.flexibility = "Pick a flexibility window";
    if (!requestForm.category && !requestForm.customCategory?.trim()) e.category = "Pick a category";
    if (Number(requestForm.passengers) < 1) e.passengers = "At least 1 passenger";
    if (Number(requestForm.bags) < 0) e.bags = "Cannot be negative";

    if (requestForm.date && requestForm.neededBy) {
      const d = new Date(`${requestForm.date}T${requestForm.neededBy}`);
      if (d.getTime() <= Date.now()) e.neededBy = "Needed-by time can't be in the past";
    }

    setRequestErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─────── OFFER PAYLOAD ─────── */
  const buildOfferPayload = () => {
    const categoryFinal =
      offerForm.category === "Other" ? offerForm.customCategory?.trim() : offerForm.category;

    return {
      createdBy: user?.id,
      modeOfTravel: "Car",
      startTime: new Date(`${offerForm.date}T${offerForm.time}`).toISOString(),
      from: offerForm.from,
      destination: offerForm.destination,
      fromLocation: offerForm.fromLocation,
      destinationLocation: offerForm.destinationLocation,
      distanceKm: offerForm.distanceKm,
      duration: offerForm.duration,
      timeZone: offerForm.timeZone,
      category: categoryFinal,
      description: offerForm.description,
      availableSeats: offerForm.availableSeats,
      totalSeats: offerForm.availableSeats,
      costPerSeat:
        offerForm.costPerSeat === "" ? null : Number(offerForm.costPerSeat),
      luggageSpace: offerForm.luggageSpace,
      childFriendly: offerForm.childFriendly,
      recurringRide: offerForm.recurringRide,
      womenOnly: offerForm.womenOnly,
      helpCanOffer: offerForm.helpCanOffer,
      exactPickup: offerForm.exactPickup,
      notes: offerForm.notes,
      confirmCostSharing: offerForm.confirmCostSharing,
      status: offerForm.status || "OPEN",
      kind: "offer",
    };
  };

  /* ─────── REQUEST PAYLOAD ─────── */
  const buildRequestPayload = () => {
    const categoryFinal =
      requestForm.category === "Other"
        ? requestForm.customCategory?.trim()
        : requestForm.category;

    return {
      createdBy: user?.id,
      kind: "request",
      modeOfTravel: "Car",
      startTime: new Date(`${requestForm.date}T${requestForm.neededBy}`).toISOString(),
      from: requestForm.from,
      destination: requestForm.destination,
      fromLocation: requestForm.fromLocation,
      destinationLocation: requestForm.destinationLocation,
      distanceKm: requestForm.distanceKm,
      flexibility: requestForm.flexibility,
      passengers: Number(requestForm.passengers),
      bags: Number(requestForm.bags),
      category: categoryFinal,
      womenDriversOnly: requestForm.womenDriversOnly,
      travelingWithChild: requestForm.travelingWithChild,
      notes: requestForm.notes,
      status: "OPEN",
    };
  };

  /* ─────── SUBMIT ─────── */

  const createOffer = async () => {
    // Keep your existing form validation before this point.
    try {
      const payload = buildOfferPayload();
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to continue");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (requestRide) {
        // I Can Help: send a proposal, not a public Ride.
        const response = await axios.post(
          `${Api}/help-proposals`,
          {
            requestRideId: requestRide._id,
            offerDetails: payload,
          },
          config
        );

        toast.success(
          response.data?.message ||
          "Your offer has been sent to the passenger"
        );

        onClose();
        return;
      }

      // Normal offer posting remains unchanged.
      await axios.post(`${Api}/rides/`, payload, config);

      toast.success("Ride posted successfully");
      onClose();
    } catch (error) {
      console.error("Unable to submit offer:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to submit your offer"
      );
    }
  };


  const updateOfferRide = async () => {
    try {
      setSaving(true);
      setServerError("");
      const res = await axios.patch(`${Api}/rides/edit/${ride._id || ride.id}`, buildOfferPayload());
      const updated = res.data?.data || { ...ride, ...buildOfferPayload() };
      toast.success("Ride updated", TOASTS);
      refreshRides();
      onSave?.(updated);
      setSubmitted(true);
      setTimeout(() => onClose?.(), 1200);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to update ride");
      toast.error(err.response?.data?.message || "Failed to update ride", TOASTS);
    } finally {
      setSaving(false);
    }
  };

  const createRequest = async () => {
    if (!validateRequest()) return;
    try {
      setSaving(true);
      setServerError("");
      await axios.post(`${Api}/rides/`, buildRequestPayload());
      toast.success(
        "Request posted. Drivers going your way will see it and can offer a seat.",
        TOASTS
      );
      setSubmitted(true);
      setTimeout(() => {
        if (onClose) onClose();
        else navigate("/myride", { state: { tab: 2, refresh: true, refreshKey: Date.now() } });
      }, 1400);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to post request");
      toast.error(err.response?.data?.message || "Failed to post request", TOASTS);
    } finally {
      setSaving(false);
    }
  };

  const formReset = () => {
    setOfferForm(INITIAL_OFFER);
    setRequestForm(INITIAL_REQUEST);
    setStep(0);
    setErrors({});
    setRequestErrors({});
    setShowErrors(false);
    setServerError("");
  };

  /* ─────── SUCCESS SCREEN ─────── */
  if (submitted) {
    return (
      <PageLayout>
        <Box
          sx={{
            minHeight: { xs: "60dvh", sm: "50dvh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 460 }}>
            <Box
              sx={{
                width: { xs: 72, sm: 88 },
                height: { xs: 72, sm: 88 },
                borderRadius: "50%",
                bgcolor: "rgba(82,183,136,0.14)",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2.5,
              }}
            >
              <CheckCircle2 size={isMobile ? 38 : 46} color="#52B788" strokeWidth={2.4} />
            </Box>
            <Typography
              sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 800, color: NAVY, mb: 1 }}
            >
              {mode === "offer"
                ? isEditMode
                  ? "Changes saved!"
                  : "Ride posted!"
                : "Request posted!"}
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: { xs: 14, sm: 15 }, lineHeight: 1.55 }}>
              {mode === "offer"
                ? "We'll text you when someone requests a seat."
                : "Drivers going your way will see your request and can offer to drive."}
            </Typography>
          </Box>
        </Box>
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <PageLayout>
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 640, md: 720 },
          mx: "auto",
          px: { xs: 2, sm: 3, md: 3 },
          pt: { xs: 1.5, sm: 2.5 },
          pb: { xs: 5, sm: 8 },
          bgcolor: BG,
          minHeight: "100dvh",
          boxSizing: "border-box",
        }}
      >
        {/* ─── Header ─── */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          {mode === "offer" && (
            <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>
              Step {step + 1} of {OFFER_STEPS.length}
            </Typography>
          )}
        </Stack>

        {/* ─── Progress ─── */}
        {mode === "offer" && <StepProgress steps={OFFER_STEPS} step={step} />}

        {/* ─── Title ─── */}
        <Typography
          sx={{
            fontSize: { xs: 26, sm: 32 },
            fontWeight: 800,
            color: NAVY,
            letterSpacing: -0.4,
            mb: 0.5,
          }}
        >
          {mode === "offer"
            ? step === 0
              ? requestRide ? "Offer a ride for this request" : "Post a ride"
              : step === 1
                ? "Ride options"
                : "Review your ride"
            : "Post a ride"}
        </Typography>
        <Typography sx={{ color: MUTED, fontSize: { xs: 13.5, sm: 14.5 }, mb: 3 }}>
          {mode === "offer"
            ? step === 0
              ? requestRide ? "Review the requested trip details and add your ride options." : "Share your journey with the community."
              : step === 1
                ? "Tell riders what to expect."
                : "This is how members will see it in Find Ride."
            : "Tell drivers where you need to go."}
        </Typography>

        {/* When opened from "I can drive", the user has already chosen to offer a ride.
            Hide the request/offer switch to avoid an accidental switch to "I need a ride". */}
        {!requestRide && (
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              fullWidth
              onClick={() => {
                setMode("offer");
                formReset();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: 13.5, sm: 14 },
                py: 1.25,
                borderRadius: 2,
                bgcolor: mode === "offer" ? RUST : "#fff",
                color: mode === "offer" ? "#fff" : INK,
                border: `1px solid ${mode === "offer" ? RUST : BORDER}`,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: mode === "offer" ? RUST_DARK : "#F4F0EA",
                  boxShadow: "none",
                },
              }}
            >
              I'm offering a ride
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setMode("request");
                formReset();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: 13.5, sm: 14 },
                py: 1.25,
                borderRadius: 2,
                bgcolor: mode === "request" ? RUST : "#fff",
                color: mode === "request" ? "#fff" : INK,
                border: `1px solid ${mode === "request" ? RUST : BORDER}`,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: mode === "request" ? RUST_DARK : "#F4F0EA",
                  boxShadow: "none",
                },
              }}
            >
              I need a ride
            </Button>
          </Stack>
        )}

        {/* ══════════════════════════════════════════════════════
           REQUEST FLOW (single page)
        ══════════════════════════════════════════════════════ */}
        {mode === "request" && (
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={labelSx}>From (US city or airport)</Typography>
              <RideLocationPicker
                fromLocation={requestForm.fromLocation}
                destinationLocation={requestForm.destinationLocation}
                onFromChange={(loc) => {
                  setRequestForm((p) => ({ ...p, from: loc.address, fromLocation: loc }));
                  setRequestErrors((p) => {
                    const n = { ...p };
                    delete n.from;
                    return n;
                  });
                }}
                onDestinationChange={(loc) => {
                  setRequestForm((p) => ({
                    ...p,
                    destination: loc.address,
                    destinationLocation: loc,
                  }));
                  setRequestErrors((p) => {
                    const n = { ...p };
                    delete n.destination;
                    return n;
                  });
                }}
                onRouteCalculated={(route) => {
                  setRequestForm((p) => ({ ...p, distanceKm: route?.distanceKm ?? null }));
                }}
                ride={null}
              />
              {requestErrors.from && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {requestErrors.from}
                </Typography>
              )}
              {requestErrors.destination && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {requestErrors.destination}
                </Typography>
              )}
            </Box>

            {/* Date / Needed by / Flexible by */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Date</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="date"
                  value={requestForm.date}
                  onChange={(e) => updateRequest("date", e.target.value)}
                  error={!!requestErrors.date}
                  helperText={requestErrors.date}
                  InputLabelProps={{ shrink: true }}
                  sx={tfSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Needed by</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="time"
                  value={requestForm.neededBy}
                  onChange={(e) => updateRequest("neededBy", e.target.value)}
                  error={!!requestErrors.neededBy}
                  helperText={requestErrors.neededBy}
                  InputLabelProps={{ shrink: true }}
                  sx={tfSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Flexible by</Typography>
                <FormControl fullWidth size={inputSize}>
                  <Select
                    value={requestForm.flexibility}
                    onChange={(e) => updateRequest("flexibility", e.target.value)}
                    sx={selectSx}
                  >
                    {FLEXIBILITY_OPTIONS.map((f) => (
                      <MenuItem key={f} value={f} sx={{ fontSize: 14 }}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            {/* Passengers / Bags */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Passengers</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="number"
                  value={requestForm.passengers}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v)) updateRequest("passengers", v);
                  }}
                  error={!!requestErrors.passengers}
                  helperText={requestErrors.passengers}
                  inputProps={{ min: 1, max: 7 }}
                  sx={tfSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Bags</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="number"
                  value={requestForm.bags}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*$/.test(v)) updateRequest("bags", v);
                  }}
                  error={!!requestErrors.bags}
                  helperText={requestErrors.bags}
                  inputProps={{ min: 0, max: 10 }}
                  sx={tfSx}
                />
              </Box>
            </Stack>

            {/* Category */}
            <Box>
              <Typography sx={labelSx}>Category</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {REQUEST_CATEGORIES.map((c) => (
                  <ChipToggle
                    key={c}
                    label={c}
                    active={requestForm.category === c}
                    onClick={() => updateRequest("category", c)}
                  />
                ))}
              </Stack>
              {requestForm.category === "Other" && (
                <TextField
                  fullWidth
                  size={inputSize}
                  placeholder="Describe your category"
                  value={requestForm.customCategory}
                  onChange={(e) => updateRequest("customCategory", e.target.value)}
                  sx={{ ...tfSx, mt: 1.5 }}
                />
              )}
              {requestErrors.category && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {requestErrors.category}
                </Typography>
              )}
            </Box>

            {/* Preference toggles */}
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: BORDER, bgcolor: CARD, overflow: "hidden" }}
            >
              <Box sx={{ px: { xs: 2, sm: 2.5 } }}>
                <ToggleRow
                  icon={ShieldCheck}
                  title="Women drivers only"
                  checked={requestForm.womenDriversOnly}
                  onChange={(v) => updateRequest("womenDriversOnly", v)}
                />
                <ToggleRow
                  icon={Baby}
                  title="Traveling with a child"
                  checked={requestForm.travelingWithChild}
                  onChange={(v) => updateRequest("travelingWithChild", v)}
                />
              </Box>
            </Paper>

            {/* Notes */}
            <Box>
              <Typography sx={labelSx}>
                Notes <span style={{ fontWeight: 400, textTransform: "none", color: MUTED }}>(optional)</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size={inputSize}
                placeholder="Anything drivers should know?"
                value={requestForm.notes}
                onChange={(e) => updateRequest("notes", e.target.value)}
                sx={tfSx}
              />
            </Box>

            {/* Info callout */}
            <Alert
              icon={<Info size={18} />}
              severity="info"
              sx={{
                borderRadius: 2,
                bgcolor: "#EAF3FB",
                color: "#1A3E8A",
                "& .MuiAlert-icon": { color: "#1A3E8A" },
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              Drivers going your way will see this request and can offer to drive. You choose who
              to accept. Your exact address and phone are shared only after you accept.
            </Alert>

            {serverError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {serverError}
              </Alert>
            )}

            <Button
              onClick={createRequest}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : null}
              sx={primaryBtn}
            >
              {saving ? "Posting..." : "Post request"}
            </Button>
          </Stack>
        )}

        {/* ══════════════════════════════════════════════════════
           OFFER FLOW — STEP 0
        ══════════════════════════════════════════════════════ */}
        {mode === "offer" && step === 0 && (
          <Stack spacing={2.5}>
            <Typography sx={{ ...labelSx, fontSize: 13, color: NAVY, mt: 0.5 }}>
              Trip details
            </Typography>

            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 2, bgcolor: "#EAF3FB" }}
            >
              <Box
                sx={{
                  bgcolor: "#fff",
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 1.5,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1A3E8A",
                }}
              >
                Car
              </Box>
              <Typography sx={{ fontSize: 12.5, color: "#1A3E8A", lineHeight: 1.5 }}>
                Rides are car-only and within the US. Flying with a parent? Use Travel Buddy.
              </Typography>
            </Stack>

            <Box>
              <Typography sx={labelSx}>From (US address, city or airport)</Typography>
              <RideLocationPicker
                fromLocation={offerForm.fromLocation}
                destinationLocation={offerForm.destinationLocation}
                onFromChange={(loc) => {
                  setOfferForm((p) => ({ ...p, from: loc.address, fromLocation: loc }));
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.from;
                    return n;
                  });
                }}
                onDestinationChange={(loc) => {
                  setOfferForm((p) => ({
                    ...p,
                    destination: loc.address,
                    destinationLocation: loc,
                  }));
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.destination;
                    return n;
                  });
                }}
                onRouteCalculated={(route) => {
                  setOfferForm((p) => ({
                    ...p,
                    distanceKm: route?.distanceKm ?? null,
                    duration: route?.durationMinutes ?? null,
                  }));
                }}
                ride={ride}
              />
              {showErrors && errors.from && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {errors.from}
                </Typography>
              )}
              {showErrors && errors.destination && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {errors.destination}
                </Typography>
              )}
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Date</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="date"
                  value={offerForm.date}
                  onChange={(e) => updateOffer("date", e.target.value)}
                  error={showErrors && !!errors.date}
                  helperText={showErrors ? errors.date : ""}
                  InputLabelProps={{ shrink: true }}
                  sx={tfSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Departure time</Typography>
                <TextField
                  fullWidth
                  size={inputSize}
                  type="time"
                  value={offerForm.time}
                  onChange={(e) => updateOffer("time", e.target.value)}
                  error={showErrors && !!errors.time}
                  helperText={showErrors ? errors.time : ""}
                  InputLabelProps={{ shrink: true }}
                  sx={tfSx}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Time zone</Typography>
                <FormControl
                  fullWidth
                  size={inputSize}
                  error={showErrors && !!errors.timeZone}
                >
                  <Select
                    value={offerForm.timeZone}
                    onChange={(e) => updateOffer("timeZone", e.target.value)}
                    sx={selectSx}
                  >
                    {TIME_ZONES.map((tz) => (
                      <MenuItem key={tz} value={tz} sx={{ fontSize: 14 }}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Box>
              <Typography sx={labelSx}>Category</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {OFFER_CATEGORIES.map((c) => (
                  <ChipToggle
                    key={c}
                    label={c}
                    active={offerForm.category === c}
                    onClick={() => updateOffer("category", c)}
                  />
                ))}
              </Stack>
              {offerForm.category === "Other" && (
                <TextField
                  fullWidth
                  size={inputSize}
                  placeholder="Describe your category"
                  value={offerForm.customCategory}
                  onChange={(e) => updateOffer("customCategory", e.target.value)}
                  sx={{ ...tfSx, mt: 1.5 }}
                />
              )}
              {showErrors && errors.category && (
                <Typography sx={{ fontSize: 12, color: "#C5221F", mt: 0.5 }}>
                  {errors.category}
                </Typography>
              )}
            </Box>

            <Box>
              <Typography sx={labelSx}>Seats available</Typography>
              <SeatStepper
                value={Number(offerForm.availableSeats)}
                onChange={(v) => updateOffer("availableSeats", v)}
                min={1}
                max={7}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Description</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size={inputSize}
                placeholder="Add details — pickup spot, what you're offering, etc."
                value={offerForm.description}
                onChange={(e) => updateOffer("description", e.target.value)}
                sx={tfSx}
              />
            </Box>

            {showErrors && Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ borderRadius: 2, fontSize: 13 }}>
                Please fill the highlighted fields before continuing.
              </Alert>
            )}

            <Button
              onClick={() => {
                if (validateOfferStep()) {
                  setShowErrors(false);
                  setStep(1);
                }
              }}
              sx={primaryBtn}
            >
              Next: Ride options
            </Button>
          </Stack>
        )}

        {/* ══════════════════════════════════════════════════════
           OFFER FLOW — STEP 1
        ══════════════════════════════════════════════════════ */}
        {mode === "offer" && step === 1 && (
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.9 }}>
                <Typography sx={{ ...labelSx, mb: 0 }}>
                  Cost share per passenger
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                  (optional, leave blank for free)
                </Typography>
              </Stack>
              <TextField
                size={inputSize}
                type="number"
                placeholder="$ 12"
                value={offerForm.costPerSeat}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*\.?\d*$/.test(v)) updateOffer("costPerSeat", v);
                }}
                error={costExceedsCap}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{
                  ...tfSx,
                  width: { xs: "100%", sm: 220 },
                  "& input": { fontSize: 16, fontWeight: 700 },
                }}
                inputProps={{ min: 0, step: "0.5" }}
              />
              <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.9, lineHeight: 1.5 }}>
                Max for this trip: <strong>${costCap}</strong>{" "}
                {distanceMiles > 0 && (
                  <>
                    ({distanceMiles} mi × ${COST_RATE_PER_MILE.toFixed(2)} + ${COST_BUFFER}
                    , floor ${COST_FLOOR})
                  </>
                )}
              </Typography>
              {costExceedsCap && (
                <Alert severity="error" sx={{ mt: 1.25, borderRadius: 2, fontSize: 12.5 }}>
                  ${costEntered} is above the ${costCap} cap for this distance. Saathi is for
                  sharing costs, not for profit.
                </Alert>
              )}
            </Box>

            <Box>
              <Typography sx={labelSx}>Luggage space</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {LUGGAGE_OPTIONS.map((l) => (
                  <ChipToggle
                    key={l}
                    label={l}
                    active={offerForm.luggageSpace === l}
                    onClick={() => updateOffer("luggageSpace", l)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography sx={labelSx}>Preferences</Typography>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: BORDER, bgcolor: CARD, overflow: "hidden" }}
              >
                <Box sx={{ px: { xs: 2, sm: 2.5 } }}>
                  <ToggleRow
                    icon={Baby}
                    title="Child-friendly"
                    checked={offerForm.childFriendly}
                    onChange={(v) => updateOffer("childFriendly", v)}
                  />
                  <ToggleRow
                    title="Recurring ride"
                    subtitle="weekly, pick days"
                    checked={offerForm.recurringRide}
                    onChange={(v) => updateOffer("recurringRide", v)}
                  />
                  <ToggleRow
                    icon={ShieldCheck}
                    title="Women riders only"
                    subtitle="Only women who set gender on their profile can request"
                    checked={offerForm.womenOnly}
                    onChange={(v) => updateOffer("womenOnly", v)}
                  />
                </Box>
              </Paper>
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.9 }}>
                <Typography sx={{ ...labelSx, mb: 0 }}>Help I can offer</Typography>
                <Typography sx={{ fontSize: 12.5, color: MUTED }}>(optional)</Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {HELP_OPTIONS.map((h) => (
                  <ChipToggle
                    key={h}
                    label={h}
                    active={(offerForm.helpCanOffer || []).includes(h)}
                    onClick={() => toggleHelp(h)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.9 }}>
                <Typography sx={{ ...labelSx, mb: 0 }}>Notes</Typography>
                <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                  (optional, no phone numbers)
                </Typography>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={3}
                size={inputSize}
                placeholder="Leaving from the Metro station lot."
                value={offerForm.notes}
                onChange={(e) => updateOffer("notes", e.target.value)}
                sx={tfSx}
              />
            </Box>

            <Button
              onClick={() => {
                if (validateOfferStep()) {
                  setShowErrors(false);
                  setStep(2);
                }
              }}
              sx={primaryBtn}
            >
              Next: Review
            </Button>
          </Stack>
        )}

        {/* ══════════════════════════════════════════════════════
           OFFER FLOW — STEP 2 (Review)
        ══════════════════════════════════════════════════════ */}
        {mode === "offer" && step === 2 && (
          <Stack spacing={2.5}>
            {serverError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {serverError}
              </Alert>
            )}

            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2.5,
                borderColor: BORDER,
                bgcolor: CARD,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: { xs: 44, sm: 48 },
                    height: { xs: 44, sm: 48 },
                    borderRadius: "50%",
                    bgcolor: "#FEF7E0",
                    color: "#B06000",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: { xs: 14, sm: 15 },
                    flexShrink: 0,
                  }}
                >
                  {(user?.firstName?.[0] || "U") +
                    (user?.lastName?.[0] || "").toUpperCase()}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 15, sm: 16 },
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: INK,
                    }}
                  >
                    {offerForm.from || "—"} → {offerForm.destination || "—"}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: 12, sm: 12.5 }, color: MUTED, mt: 0.4 }}>
                    {offerForm.date} · {offerForm.time} {offerForm.timeZone} ·{" "}
                    {offerForm.availableSeats} seat
                    {offerForm.availableSeats === 1 ? "" : "s"}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1.25 }}
                  >
                    {offerForm.category && (
                      <Chip
                        size="small"
                        label={
                          offerForm.category === "Other"
                            ? offerForm.customCategory
                            : offerForm.category
                        }
                        sx={{
                          borderRadius: 999,
                          fontSize: 11.5,
                          bgcolor: "#EAF3FB",
                          color: "#1A3E8A",
                        }}
                      />
                    )}
                    {offerForm.costPerSeat && (
                      <Chip
                        size="small"
                        label={`Cost share $${offerForm.costPerSeat}`}
                        sx={{
                          borderRadius: 999,
                          fontSize: 11.5,
                          bgcolor: "#E6F4EA",
                          color: "#14532D",
                        }}
                      />
                    )}
                    {offerForm.childFriendly && (
                      <Chip
                        size="small"
                        label="Child-friendly"
                        sx={{
                          borderRadius: 999,
                          fontSize: 11.5,
                          bgcolor: "#FEF7E0",
                          color: "#B06000",
                        }}
                      />
                    )}
                    {offerForm.luggageSpace && offerForm.luggageSpace !== "None" && (
                      <Chip
                        size="small"
                        label={offerForm.luggageSpace}
                        sx={{
                          borderRadius: 999,
                          fontSize: 11.5,
                          bgcolor: "#EAF3FB",
                          color: "#1A3E8A",
                        }}
                      />
                    )}
                    {(offerForm.helpCanOffer || []).map((h) => (
                      <Chip
                        key={h}
                        size="small"
                        label={h}
                        sx={{
                          borderRadius: 999,
                          fontSize: 11.5,
                          bgcolor: "#FFF3E8",
                          color: "#A85F00",
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: { xs: 2, sm: 2.25 }, borderRadius: 2, borderColor: BORDER, bgcolor: CARD }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK, mb: 0.5 }}>
                Exact pickup address (private)
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: MUTED, mb: 1.5, lineHeight: 1.5 }}>
                {offerForm.exactPickup ||
                  offerForm.fromLocation?.address ||
                  "Will be shared after you accept"}
              </Typography>

              {offerForm.notes && (
                <>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK, mb: 0.5 }}>
                    Notes
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: MUTED, mb: 1.5, lineHeight: 1.5 }}>
                    {offerForm.notes}
                  </Typography>
                </>
              )}

              <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                The exact address and your phone number are shown only to passengers you accept.
              </Typography>
            </Paper>

            <FormControlLabel
              control={
                <Checkbox
                  checked={offerForm.confirmCostSharing}
                  onChange={(e) => updateOffer("confirmCostSharing", e.target.checked)}
                  sx={{
                    "&.Mui-checked": { color: RUST },
                    color: "#BBB",
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: { xs: 13, sm: 13.5 }, lineHeight: 1.5, color: INK }}>
                  I confirm this is a cost-sharing trip I am already making. I hold a valid
                  license and insurance for this vehicle.
                </Typography>
              }
            />
            {showErrors && errors.confirmCostSharing && (
              <Typography sx={{ fontSize: 12, color: "#C5221F", mt: -1.5 }}>
                {errors.confirmCostSharing}
              </Typography>
            )}

            <Alert
              icon={<Info size={18} />}
              severity="info"
              sx={{
                borderRadius: 2,
                bgcolor: "#EAF3FB",
                color: "#1A3E8A",
                "& .MuiAlert-icon": { color: "#1A3E8A" },
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              What happens next: members request seats, you Accept or Decline in My Rides, and we
              share phone numbers once you accept. If nobody is accepted, the ride moves to
              Expired after departure; if at least one was accepted, it moves to Completed.
            </Alert>

            <Button
              onClick={() => {
                if (validateOfferStep()) {
                  if (isEditMode) updateOfferRide();
                  else createOffer();
                }
              }}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : null}
              sx={primaryBtn}
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Posting..."
                : isEditMode
                  ? "Update ride"
                  : "Post ride"}
            </Button>
          </Stack>
        )}
      </Box>
    </PageLayout>
  );
}