import React, { memo } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AlignJustify } from "lucide-react";
// Optional font: <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

/* ---------- design tokens ---------- */

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

/* ---------- data (replace with your API response) ---------- */

// tone drives the colours of the avatar and tier chip
const TONES = {
  green: { avatarBg: c.greenBg, avatarText: c.green, chipBg: c.greenBg, chipText: c.green },
  blue: { avatarBg: c.blueBg, avatarText: c.blueText, chipBg: c.blueBg, chipText: c.blueText },
};

const DEFAULT_TRIP = {
  title: "Mother's trip",
  summary: "EK 544 / EK 235 · MAA → DXB → ORD · Sat 10/17/2026",
};

const DEFAULT_GROUPS = [
  {
    id: "same-flight",
    title: "Same flight (best match)",
    tone: "green",
    best: true,
    action: "accept",
    matches: [
      {
        id: "lakshmi",
        initials: "LV",
        name: "Lakshmi V.",
        tier: "Tier 1: same flights",
        details:
          "Flying EK 544 and EK 235 · Tamil, English · 4.9 (6) · via Meena → Vijay · Chicago, IL",
        note: "\u201CTravelling with my husband, happy to walk with her through Dubai.\u201D",
      },
    ],
  },
  {
    id: "same-arrival",
    title: "Same US arrival airport, within 4 hours",
    tone: "blue",
    best: false,
    action: "arrival", // Ask to help at arrival
    matches: [
      {
        id: "ramesh",
        initials: "RS",
        name: "Ramesh S.",
        tier: "Tier 2: arrives ORD 6:45 PM",
        details:
          "Flying Qatar QR 725 via DOH · Telugu, Tamil, English · New member · via Anita → Vijay",
        note: "Different flight: can meet at arrivals, not during the journey.",
      },
    ],
  },
];

/* ---------- small components ---------- */

const SectionLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      color: c.muted,
      mt: 2.5,
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

const MatchActions = ({ action, match, onAccept, onNotNow, onAskHelp }) => {
  // Hooks must be called at the top level of a component, not inside JSX
  const navigate = useNavigate();

  const handleAccept = () => {
    onAccept?.(match);
    navigate(`/trip-matches/${match.id}`); // real id instead of the literal ":id"
  };

  if (action === "accept") {
    return (
      <>
        <Button
          disableElevation
          variant="contained"
          onClick={handleAccept}
          sx={{ ...buttonBase, bgcolor: c.green, "&:hover": { bgcolor: c.greenDark } }}
        >
          Accept as companion
        </Button>
        <Button
          variant="outlined"
          onClick={() => onNotNow?.(match)}
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
      onClick={() => onAskHelp?.(match)}
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

const MatchCard = memo(function MatchCard({
  match,
  tone,
  best,
  action,
  onAccept,
  onNotNow,
  onAskHelp,
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
              sx={{ fontSize: 12.5, color: c.muted, lineHeight: 1.5, wordBreak: "break-word" }}
            >
              {match.details}
            </Typography>
            <Typography
              sx={{ fontSize: 12.5, color: c.text, lineHeight: 1.5, wordBreak: "break-word" }}
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

/* ---------- page ---------- */

export default function TripMatches({
  trip = DEFAULT_TRIP,
  groups = DEFAULT_GROUPS,
  onBack,
  onAccept,
  onNotNow,
  onAskHelp,
  onPreview,
}) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: c.bg, minHeight: "100vh", py: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Link
            component="button"
            type="button"
            underline="none"
            onClick={handleBack}
            sx={{ color: c.rust, fontWeight: 700, fontSize: 14, mb: 1.5 }}
          >
            Back to Travel Buddy
          </Link>

          <Typography
            component="h1"
            sx={{ fontWeight: 800, fontSize: { xs: 22, sm: 26 }, color: c.navy }}
          >
            Matches for {trip.title}
          </Typography>
          <Typography sx={{ fontSize: { xs: 12.5, sm: 13 }, color: c.muted, wordBreak: "break-word" }}>
            {trip.summary}
          </Typography>

          {groups.map((g) => (
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
                    onAccept={onAccept}
                    onNotNow={onNotNow}
                    onAskHelp={onAskHelp}
                  />
                ))}
              </Stack>
            </Box>
          ))}

          <Stack spacing={1.5} sx={{ mt: 2.5, mb: 2.5 }}>
            <Notice bg={c.noteBg} color={c.text}>
              <b>Not matched yet?</b> We text you when a member posts the same flight. Phase 2 adds
              Tier 3: overlapping layover in the same transit airport.
            </Notice>
            <Notice bg={c.warnBg} color={c.warnText}>
              When you accept: your phone numbers are shared with each other only for this trip, and
              a check-in text is sent at arrival + 1 hour. Accepting is the only way a companion sees
              your contact details.
            </Notice>
          </Stack>

          <Box
            sx={{
              width: { xs: "100%", sm: BTN_WIDTH },
              display: "flex",
              justifyContent: { xs: "stretch", sm: "flex-end" },
              ml: { xs: 0, sm: "auto" },
            }}
          >
            <Button
              disableElevation
              variant="contained"
              onClick={onPreview}
              sx={{
                ...buttonBase,
                bgcolor: c.navy,
                "&:hover": { bgcolor: "#0D1E48" },
              }}
            >
              Preview accepted-trip view
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}