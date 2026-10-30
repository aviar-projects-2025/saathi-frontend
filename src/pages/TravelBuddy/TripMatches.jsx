import React, { memo, useState, useEffect } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Api from "../../Api"; // Adjust path if needed

import {
  Avatar,
  Box,
  Button,
  Chip,
  CssBaseline,
  Link,
  Paper,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  CircularProgress,
  Alert,
} from "@mui/material";

/* ─────────── Design Tokens ─────────── */
const c = {
  rust: "#C4410C",
  rustDark: "#A8360A",
  navy: "#12285F",
  green: "#1A6B3C",
  greenDark: "#14562F",
  greenBg: "#DDF5E4",
  blueBg: "#DDEEFB",
  blueText: "#0B4A7A",
  bg: "#F9F7F3",
  border: "#D9D3C5",
  muted: "#5F6368",
  text: "#1F2937",
  noteBg: "#EEF1F7",
  warnBg: "#FDF0C4",
  warnText: "#7A4B0B",
};

const theme = createTheme({
  typography: {
    fontFamily: `"DM Sans", "Inter", "Segoe UI", Roboto, Arial, sans-serif`,
    button: { textTransform: "none", fontWeight: 700 },
  },
  palette: { primary: { main: c.rust } },
  shape: { borderRadius: 12 },
});

/* One size for every button */
const BTN_WIDTH = 210;
const buttonBase = {
  height: 46,
  minHeight: 46,
  px: 2,
  py: 0,
  borderRadius: 2,
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.2,
  textAlign: "center",
  boxShadow: "none",
  width: "100%",
};

/* Equal-width button group: stacked full width on phones, fixed equal columns from sm up */
const buttonGroupSx = {
  display: "grid",
  gridAutoFlow: { xs: "row", sm: "column" },
  gridAutoColumns: { xs: "1fr", sm: `${BTN_WIDTH}px` },
  gap: 1.25,
  width: { xs: "100%", md: "auto" },
  flexShrink: 0,
  justifyContent: { xs: "stretch", sm: "end" },
  alignItems: { xs: "stretch", sm: "center" },
  ml: { xs: 0, sm: "auto" },
};

const TONES = {
  green: { avatarBg: c.greenBg, avatarText: c.green, chipBg: c.greenBg, chipText: c.green },
  blue: { avatarBg: c.blueBg, avatarText: c.blueText, chipBg: c.blueBg, chipText: c.blueText },
};

const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color: c.muted,
      mt: 3,
      mb: 1.5,
    }}
  >
    {children}
  </Typography>
);

/* ─────────── Match Actions ─────────── */
const MatchActions = ({ action, match, onAccept, onNotNow, onAskHelp, isAccepting }) => {
  if (action === "accept") {
    return (
      <>
        <Button
          disableElevation
          variant="contained"
          onClick={() => onAccept(match)}
          disabled={isAccepting}
          sx={{ ...buttonBase, bgcolor: c.green, "&:hover": { bgcolor: c.greenDark } }}
        >
          {isAccepting ? "Accepting..." : "Accept as companion"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => onNotNow(match)}
          sx={{
            ...buttonBase,
            color: "#111",
            borderColor: c.border,
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#F3EFE6", borderColor: c.border },
          }}
        >
          Not now
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="outlined"
      onClick={() => onAskHelp(match)}
      sx={{
        ...buttonBase,
        color: c.rust,
        borderColor: c.rust,
        borderWidth: 1.5,
        bgcolor: "#fff",
        "&:hover": { bgcolor: "#FFF4EE", borderColor: c.rustDark, borderWidth: 1.5 },
      }}
    >
      Ask to help at arrival
    </Button>
  );
};

/* ─────────── Match Card ─────────── */
const MatchCard = memo(function MatchCard({
  match,
  tone,
  best,
  action,
  onAccept,
  onNotNow,
  onAskHelp,
  isAccepting,
}) {
  const t = TONES[tone];
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        bgcolor: "#fff",
        borderColor: best ? c.green : c.border,
        borderWidth: best ? 2 : 1,
      }}
    >
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, sm: 2 }}
          alignItems="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Avatar
            sx={{
              width: { xs: 40, sm: 46 },
              height: { xs: 40, sm: 46 },
              bgcolor: t.avatarBg,
              color: t.avatarText,
              fontSize: 15,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {match.initials}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 15, sm: 16 }, color: c.navy }}>
                {match.name}
              </Typography>
              <Chip
                label={match.tier}
                size="small"
                sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: t.chipBg, color: t.chipText }}
              />
            </Stack>
            <Typography
              sx={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5, wordBreak: "break-word", mt: 0.5 }}
            >
              {match.details}
            </Typography>
            <Typography
              sx={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, wordBreak: "break-word", mt: 0.5 }}
            >
              {match.note}
            </Typography>
          </Box>
        </Stack>

        <Box sx={buttonGroupSx}>
          <MatchActions
            action={action}
            match={match}
            onAccept={onAccept}
            onNotNow={onNotNow}
            onAskHelp={onAskHelp}
            isAccepting={isAccepting}
          />
        </Box>
      </Stack>
    </Paper>
  );
});

const Notice = ({ bg, color, children }) => (
  <Box
    sx={{
      bgcolor: bg,
      color,
      borderRadius: 2,
      px: { xs: 1.75, sm: 2 },
      py: 1.5,
      fontSize: { xs: 12.5, sm: 13 },
      lineHeight: 1.6,
    }}
  >
    {children}
  </Box>
);

/* ─────────── Main Page ─────────── */
export default function TripMatches() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [matches, setMatches] = useState({ tier1: [], tier2: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please sign in to view your trips.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [tripRes, matchRes] = await Promise.all([
          axios.get(`${Api}/travel-buddy/${id}`, config),
          axios.get(`${Api}/travel-buddy/${id}/matches`, config),
        ]);

        setTrip(tripRes.data?.data ?? null);

        const result = matchRes.data?.data ?? {};

        setMatches({
          tier1: Array.isArray(result.tier1) ? result.tier1 : [],
          tier2: Array.isArray(result.tier2) ? result.tier2 : [],
        });
      } catch (err) {
        console.error("Travel Buddy matches failed:", err);
        setError(
          err.response?.data?.message || "Failed to load real matches."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatches();
    }

    // Refresh if the route changes; prevent updates after unmount.
    // Existing loading/error rendering should remain below.
  }, [id]);

  const handleAccept = async (match) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Your session has expired. Please sign in again.");
      navigate("/login");
      return;
    }

    try {
      setAcceptingId(match.id);

      await axios.post(
        `${Api}/travel-buddy/${id}/accept`,
        { matchId: match.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Companion accepted successfully!");

      navigate(`/trip-accepted/${id}`);
    } catch (err) {
      console.error("Accept companion failed:", err);

      toast.error(
        err.response?.data?.message ||
        "Failed to accept. Please try again."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const groups = [
    {
      id: "tier1",
      title: "Same flight (best match)",
      tone: "green",
      best: true,
      action: "accept",
      matches: matches.tier1,
    },
    {
      id: "tier2",
      title: "Same US arrival airport, within 4 hours",
      tone: "blue",
      best: false,
      action: "arrival",
      matches: matches.tier2,
    },
  ].filter((g) => g.matches.length > 0);

  // Format summary text
  const route = trip?.flights?.length > 0
    ? [trip.flights[0].fromCode, ...trip.flights.map(f => f.toCode)].join(" → ")
    : "";
  const flightNos = trip?.flights?.map(f => f.flightNumber).join(" / ") || "";
  const dateStr = trip?.flights?.[0]?.departureTime ? new Date(trip.flights[0].departureTime).toLocaleDateString("en-US", { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' }) : "";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: c.bg, minHeight: "100vh", py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>

          <Link
            component="button"
            type="button"
            underline="none"
            onClick={() => navigate("/travel-buddy")}
            sx={{ color: c.rust, fontWeight: 700, fontSize: 14, mb: 2, display: "inline-block" }}
          >
            Back to Travel Buddy
          </Link>

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress sx={{ color: c.rust }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : (
            <>
              <Typography component="h1" sx={{ fontWeight: 800, fontSize: { xs: 22, sm: 26 }, color: c.navy }}>
                Matches for {trip?.relationship ? `${trip.relationship}'s trip` : "your trip"}
              </Typography>
              <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: c.muted, wordBreak: "break-word", mt: 0.5, mb: 2 }}>
                {flightNos} · {route} · {dateStr}
              </Typography>

              {groups.length === 0 ? (
                <Box sx={{ mt: 4, p: 4, textAlign: "center", bgcolor: "#fff", borderRadius: 3, border: `1px dashed ${c.border}` }}>
                  <Typography sx={{ color: c.muted, fontSize: 15 }}>
                    No matches found yet. We will text you when a member posts the same flight.
                  </Typography>
                </Box>
              ) : (
                groups.map((g) => (
                  <Box key={g.id}>
                    <SectionLabel>{g.title}</SectionLabel>
                    <Stack spacing={1.5}>
                      {g.matches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          tone={g.tone}
                          best={g.best}
                          action={g.action}
                          onAccept={handleAccept}
                          onNotNow={(match) => toast.info("Dismissed " + match.name)}
                          onAskHelp={(match) => toast.info("Request sent to " + match.name)}
                          isAccepting={acceptingId === m.id}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))
              )}

              <Stack spacing={1.5} sx={{ mt: 3, mb: 2.5 }}>
                <Notice bg={c.noteBg} color={c.text}>
                  <b>Not matched yet?</b> We text you when a member posts the same flight. Phase 2 adds Tier 3: overlapping layover in the same transit airport.
                </Notice>
                <Notice bg={c.warnBg} color={c.warnText}>
                  When you accept: your phone numbers are shared with each other only for this trip, and a check-in text is sent at arrival + 1 hour. Accepting is the only way a companion sees your contact details.
                </Notice>
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}