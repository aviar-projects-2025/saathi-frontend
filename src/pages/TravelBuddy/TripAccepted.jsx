
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Api from "../../Api";

const COLORS = {
  primary: "#E8650A",
  primaryDark: "#C94F00",
  cream: "#FFF7F0",
  background: "#F7F8FA",
  text: "#172033",
  muted: "#667085",
  border: "#E7EAF0",
  green: "#16804A",
  greenBg: "#E8F7EE",
};

const getRoute = (trip) => {
  if (!trip) return "Route unavailable";

  const flights = Array.isArray(trip.flights) ? trip.flights : [];

  if (flights.length) {
    const first = flights[0];
    const last = flights[flights.length - 1];

    return `${first.fromCode || first.from || "Origin"} → ${
      last.toCode || last.to || "Destination"
    }`;
  }

  const from =
    trip.origin || trip.from || trip.fromLocation || trip.source;
  const to =
    trip.destination ||
    trip.to ||
    trip.toLocation ||
    trip.destinationName;

  return from || to
    ? `${from || "Origin"} → ${to || "Destination"}`
    : trip.title || trip.relationship || "Travel Buddy trip";
};

const getDeparture = (trip) => {
  if (!trip) return "";

  const value =
    trip.departureTime ||
    trip.departureDate ||
    trip.travelDate ||
    trip.startTime ||
    trip.flights?.[0]?.departureTime;

  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "TB";
};

// WhatsApp requires a country code and digits only.
// A 10-digit local number defaults to India (+91).
const getWhatsAppNumber = (phone = "") => {
  const trimmed = String(phone).trim();

  if (!trimmed) return "";

  let digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("00")) {
    digits = trimmed.slice(2).replace(/\D/g, "");
  } else if (digits.length === 10) {
    digits = `91${digits}`;
  }

  // E.164 numbers contain at most 15 digits.
  if (digits.length < 8 || digits.length > 15) return "";

  return digits;
};

function DetailLine({ label, value }) {
  if (!value) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography
        sx={{
          color: COLORS.muted,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          mt: 0.4,
          color: COLORS.text,
          fontSize: 14,
          fontWeight: 600,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function TripCard({ title, subtitle, trip, number }) {
  const flights = Array.isArray(trip?.flights) ? trip.flights : [];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${COLORS.primary}, #FFB36F)`,
        }}
      />

      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Box>
            <Typography
              sx={{
                color: COLORS.muted,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {subtitle}
            </Typography>

            <Typography
              sx={{
                color: COLORS.text,
                fontWeight: 800,
                fontSize: 16,
                mt: 0.5,
              }}
            >
              {title}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: COLORS.cream,
              color: COLORS.primary,
              fontWeight: 800,
            }}
          >
            {number}
          </Avatar>
        </Stack>

        <Typography
          sx={{
            mt: 2.5,
            fontSize: { xs: 20, sm: 23 },
            lineHeight: 1.35,
            fontWeight: 800,
            color: COLORS.text,
            overflowWrap: "anywhere",
          }}
        >
          {getRoute(trip)}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          sx={{
            mt: 1.5,
            p: 1.5,
            bgcolor: "#F8F9FB",
            borderRadius: 2.5,
          }}
        >
          <Typography sx={{ fontSize: 18 }}>📅</Typography>
          <Box>
            <Typography sx={{ fontSize: 11, color: COLORS.muted }}>
              DEPARTURE
            </Typography>
            <Typography
              sx={{
                mt: 0.3,
                fontSize: 13,
                color: COLORS.text,
                fontWeight: 700,
              }}
            >
              {getDeparture(trip) || "Date not provided"}
            </Typography>
          </Box>
        </Stack>

        {trip?.status && (
          <Chip
            size="small"
            label={String(trip.status).replaceAll("_", " ")}
            sx={{
              mt: 1.5,
              bgcolor: COLORS.greenBg,
              color: COLORS.green,
              fontWeight: 800,
              textTransform: "capitalize",
            }}
          />
        )}

        {flights.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1.5 }} />

            {flights.map((flight, index) => (
              <Box key={flight._id || index} sx={{ py: 0.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  ✈ {flight.flightNumber || `Flight ${index + 1}`}
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.muted,
                    fontSize: 12,
                    mt: 0.4,
                  }}
                >
                  {flight.fromCode || flight.from || "Origin"} →{" "}
                  {flight.toCode || flight.to || "Destination"}
                </Typography>

                {flight.departureTime && (
                  <Typography
                    sx={{ color: COLORS.muted, fontSize: 12, mt: 0.4 }}
                  >
                    {new Date(flight.departureTime).toLocaleString()}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {trip?.description && (
          <Typography
            sx={{
              mt: 1.5,
              fontSize: 13,
              lineHeight: 1.6,
              color: COLORS.muted,
            }}
          >
            {trip.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function TripAccepted() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAcceptedTrip = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${Api}/travel-buddy/accepted/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data?.data || null);

      if (!response.data?.data) {
        setError("The accepted trip details were not returned.");
      }
    } catch (err) {
      console.error("Unable to load accepted trip:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadAcceptedTrip();
  }, [loadAcceptedTrip]);

  const companion = data?.otherTraveller;
  const phone = companion?.phone || "";
  const whatsappNumber = getWhatsAppNumber(phone);

  const whatsappMessage = encodeURIComponent(
    `Hi ${companion?.name || "there"}! We have been matched on Saathi Rides. I’m reaching out to coordinate our travel plans.`
  );

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: COLORS.background,
        pb: 6,
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(130deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #F99A4D 100%)`,
          color: "#fff",
          pt: { xs: 3, sm: 4 },
          pb: { xs: 5, sm: 7 },
          px: 2,
        }}
      >
        <Container maxWidth="md">
          <Button
            onClick={() => navigate("/travelBuddy")}
            sx={{
              color: "#fff",
              mb: 3,
              px: 0,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            ← Back to Travel Buddy
          </Button>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.18)",
                fontSize: 20,
              }}
            >
              ✓
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Match confirmed
            </Typography>
          </Stack>

          <Typography
            component="h1"
            sx={{
              maxWidth: 650,
              fontSize: { xs: 29, sm: 39 },
              lineHeight: 1.15,
              fontWeight: 900,
              letterSpacing: -0.8,
            }}
          >
            Your journey is better together.
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              maxWidth: 570,
              color: "rgba(255,255,255,0.9)",
              fontSize: { xs: 14, sm: 16 },
              lineHeight: 1.8,
            }}
          >
            Your Travel Buddy connection is confirmed. Connect with your
            companion and coordinate your travel plans.
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              mt: 2.5,
              display: "inline-flex",
              px: 1.5,
              py: 0.8,
              borderRadius: 20,
              bgcolor: "rgba(255,255,255,0.16)",
            }}
          >
            <Typography sx={{ fontSize: 14 }}>🛡️</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              Accepted companion connection
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ mt: { xs: -3, sm: -4 } }}>
        {loading ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 4,
              textAlign: "center",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CircularProgress sx={{ color: COLORS.primary }} />
            <Typography sx={{ mt: 2, color: COLORS.muted }}>
              Loading your matched trip...
            </Typography>
          </Paper>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: 4,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>

            <Button
              variant="contained"
              onClick={loadAcceptedTrip}
              sx={{
                bgcolor: COLORS.primary,
                "&:hover": { bgcolor: COLORS.primaryDark },
              }}
            >
              Try again
            </Button>
          </Paper>
        ) : data ? (
          <Stack spacing={3}>
            {/* Companion contact card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                border: `1px solid ${COLORS.border}`,
                bgcolor: "#fff",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Stack
                  direction="row"
                  spacing={1.75}
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: COLORS.cream,
                      color: COLORS.primary,
                      fontSize: 22,
                      fontWeight: 900,
                      border: "2px solid #FFE0C7",
                    }}
                  >
                    {getInitials(companion?.name)}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: COLORS.muted,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Your travel companion
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: { xs: 19, sm: 22 },
                        fontWeight: 900,
                        color: COLORS.text,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {companion?.name || "Saathi member"}
                    </Typography>

                    <Chip
                      size="small"
                      label="Matched successfully"
                      sx={{
                        mt: 0.8,
                        bgcolor: COLORS.greenBg,
                        color: COLORS.green,
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    />
                  </Box>
                </Stack>

                {whatsappUrl && (
                  <Button
                    component="a"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    startIcon={
                      <Box component="span" sx={{ fontSize: 18 }}>
                        ☎
                      </Box>
                    }
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      borderRadius: 2.5,
                      bgcolor: "#168C50",
                      color: "#fff",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      "&:hover": { bgcolor: "#107441" },
                    }}
                  >
                    Chat on WhatsApp
                  </Button>
                )}
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: COLORS.muted,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.7,
                    }}
                  >
                    PHONE NUMBER
                  </Typography>

                  {phone ? (
                    <Link
                      href={`tel:${phone}`}
                      underline="hover"
                      sx={{
                        display: "inline-block",
                        mt: 0.6,
                        color: COLORS.text,
                        fontSize: 15,
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {phone}
                    </Link>
                  ) : (
                    <Typography sx={{ mt: 0.6, color: COLORS.muted }}>
                      Phone number unavailable
                    </Typography>
                  )}
                </Box>

                {companion?.email && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: COLORS.muted,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.7,
                      }}
                    >
                      EMAIL ADDRESS
                    </Typography>

                    <Link
                      href={`mailto:${companion.email}`}
                      underline="hover"
                      sx={{
                        display: "inline-block",
                        mt: 0.6,
                        color: COLORS.text,
                        fontSize: 14,
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {companion.email}
                    </Link>
                  </Box>
                )}
              </Stack>

              {phone && !whatsappNumber && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  WhatsApp couldn't validate this number. Store the
                  companion's phone with its international country code,
                  such as +91 or +1.
                </Alert>
              )}

              {!phone && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  WhatsApp chat is unavailable because the companion's
                  phone number was not returned by the server.
                </Alert>
              )}
            </Paper>

            {/* Trip details */}
            <Box>
              <Typography
                sx={{
                  color: COLORS.text,
                  fontSize: 21,
                  fontWeight: 900,
                  mb: 0.5,
                }}
              >
                Your trip details
              </Typography>

              <Typography
                sx={{
                  color: COLORS.muted,
                  fontSize: 13,
                  mb: 2,
                }}
              >
                Review both trips before coordinating your journey.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                  alignItems: "stretch",
                }}
              >
                <TripCard
                  title="Original trip"
                  subtitle="Trip 01"
                  number="01"
                  trip={data.targetTrip}
                />

                <TripCard
                  title="Companion's trip"
                  subtitle="Trip 02"
                  number="02"
                  trip={data.submittedTrip}
                />
              </Box>
            </Box>

            {/* Reminder */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: COLORS.cream,
                border: "1px solid #FFE1C8",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Typography sx={{ fontSize: 22 }}>💬</Typography>
                <Box>
                  <Typography
                    sx={{ fontWeight: 800, color: COLORS.text }}
                  >
                    Connect before you travel
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      color: COLORS.muted,
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    Confirm departure times, meeting points, and any
                    changes directly with your companion. Share only the
                    information needed to coordinate your journey.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Alert severity="warning">
            No accepted trip details are available.
          </Alert>
        )}
      </Container>
    </Box>
  );
}
