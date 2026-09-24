import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import Api from "../Api";

const ORANGE = "#E8650A";

const saffron = {
  50: "#FFF8EE",
  100: "#FFE9C2",
  200: "#FFD492",
  300: "#FFC05C",
  400: "#FFAB28",
  500: "#F59300",
  600: "#D47A00",
  700: "#A85F00",
  800: "#7C4500",
};

const RADIUS_OPTIONS = [
  { label: "5 miles", value: 5 },
  { label: "10 miles", value: 10 },
  { label: "25 miles", value: 25 },
  { label: "50 miles", value: 50 },
];

export default function PeopleNearYou() {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  /*
   * FindRides passes the user's GPS location through
   * navigate("/people-nearby", { state: { userLocation } })
   */
  const initialLocation = routerLocation.state?.userLocation || null;

  const [userLocation, setUserLocation] = useState(initialLocation);

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [locationError, setLocationError] = useState("");
  const [search, setSearch] = useState("");
  const [radius, setRadius] = useState(25);

  /*
   * ---------------------------------------------------------
   * GET CURRENT LOCATION
   * ---------------------------------------------------------
   */

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setUserLocation(location);
        setLocationLoading(false);
      },
      (error) => {
        console.error("LOCATION ERROR:", error);

        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location permission is denied. Please allow location access."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setLocationError(
              "Location services are unavailable."
            );
            break;

          case error.TIMEOUT:
            setLocationError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setLocationError(
              "Unable to get your current location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  /*
   * ---------------------------------------------------------
   * FETCH NEARBY PEOPLE
   * ---------------------------------------------------------
   */

  const fetchNearbyPeople = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       *
       * This assumes your backend provides:
       *
       * GET /users/nearby
       *
       * with:
       * latitude
       * longitude
       * radius
       *
       * Example:
       *
       * /users/nearby?latitude=32.7767&longitude=-96.7970&radius=25
       */

      const response = await axios.get(`${Api}/users/nearby`, {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius,
        },
      });

      setPeople(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching nearby people:", error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Fetch whenever location or radius changes.
   */

  useEffect(() => {
    if (userLocation) {
      fetchNearbyPeople();
    }
  }, [userLocation, radius]);

  /*
   * If page was opened directly without FindRides state,
   * request location automatically.
   */

  useEffect(() => {
    if (!userLocation) {
      requestCurrentLocation();
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */

  const filteredPeople = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return people;
    }

    return people.filter((person) => {
      const firstName =
        person?.firstName?.toLowerCase() || "";

      const lastName =
        person?.lastName?.toLowerCase() || "";

      const profession =
        person?.bio?.toLowerCase() || "";

      const city =
        person?.city?.toLowerCase() || "";

      const zipcode =
        person?.zipcode?.toLowerCase() || "";

      return (
        firstName.includes(value) ||
        lastName.includes(value) ||
        profession.includes(value) ||
        city.includes(value) ||
        zipcode.includes(value)
      );
    });
  }, [people, search]);

  /*
   * ---------------------------------------------------------
   * DISTANCE FORMAT
   * ---------------------------------------------------------
   */

  const formatDistance = (distance) => {
    if (distance == null || !Number.isFinite(Number(distance))) {
      return null;
    }

    const value = Number(distance);

    if (value < 0.1) {
      return "Less than 0.1 mi away";
    }

    return `${value.toFixed(1)} mi away`;
  };

  /*
   * ---------------------------------------------------------
   * PROFILE
   * ---------------------------------------------------------
   */

  const handleViewProfile = (person) => {
    /*
     * Change this route if your application already has
     * a different public profile route.
     */

    navigate(`/user-profile/${person._id}`);
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        width: "100%",
        background: "#FCFAF8",
        overflowX: "hidden",
      }}
    >
      {/* ------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------ */}

      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#FFFFFF",
          borderBottom: "1px solid #F0E8E0",
        }}
      >
        <Box
          sx={{
            minHeight: 58,
            px: { xs: 1.5, sm: 3 },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#4A3327",
              width: 38,
              height: 38,
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.2rem",
                },
                fontWeight: 800,
                color: "#2D211B",
              }}
            >
              People Near You
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "0.65rem",
                  sm: "0.72rem",
                },
                color: "text.secondary",
              }}
            >
              Discover Saathi members around your area
            </Typography>
          </Box>

          <IconButton
            onClick={fetchNearbyPeople}
            disabled={loading || !userLocation}
            sx={{
              color: ORANGE,
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ------------------------------------------------ */}
      {/* CONTENT */}
      {/* ------------------------------------------------ */}

      <Box
        sx={{
          width: "100%",
          maxWidth: 700,
          mx: "auto",
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1.5, sm: 3 },
        }}
      >
        {/* LOCATION INFO */}

        <Box
          sx={{
            p: { xs: 1.4, sm: 2 },
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #FFF8EE 0%, #FFF1DD 100%)",
            border: "1px solid #FFD49A",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              minWidth: 40,
              borderRadius: "50%",
              background: "#FFE8C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocationOnRoundedIcon
              sx={{
                color: ORANGE,
                fontSize: 22,
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: "0.76rem",
                  sm: "0.85rem",
                },
                fontWeight: 700,
                color: "#4A3327",
              }}
            >
              People around your area
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "0.63rem",
                  sm: "0.72rem",
                },
                color: "text.secondary",
                mt: 0.3,
              }}
            >
              Showing members within approximately {radius} miles
            </Typography>
          </Box>
        </Box>

        {/* ------------------------------------------------ */}
        {/* SEARCH + RADIUS */}
        {/* ------------------------------------------------ */}

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1.5,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search people or profession..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      fontSize: 19,
                      color: ORANGE,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: "12px",
                background: "#FFFFFF",
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.8rem",
                },
                "& fieldset": {
                  borderColor: "#E8DDD4",
                },
                "&:hover fieldset": {
                  borderColor: "#FFAB28",
                },
                "&.Mui-focused fieldset": {
                  borderColor: ORANGE,
                },
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: 92,
                sm: 120,
              },
            }}
          >
            <InputLabel
              sx={{
                fontSize: "0.75rem",
              }}
            >
              Radius
            </InputLabel>

            <Select
              value={radius}
              label="Radius"
              onChange={(e) =>
                setRadius(Number(e.target.value))
              }
              sx={{
                height: 40,
                borderRadius: "12px",
                background: "#FFFFFF",
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.8rem",
                },
              }}
            >
              {RADIUS_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    fontSize: "0.8rem",
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* ------------------------------------------------ */}
        {/* LOCATION ERROR */}
        {/* ------------------------------------------------ */}

        {locationError && (
          <Box
            sx={{
              mt: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: "#FFF4F4",
              border: "1px solid #F3C5C5",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#D32F2F",
              }}
            >
              {locationError}
            </Typography>

            <Button
              onClick={requestCurrentLocation}
              disabled={locationLoading}
              sx={{
                mt: 0.5,
                p: 0,
                minWidth: 0,
                textTransform: "none",
                fontSize: "0.7rem",
                color: ORANGE,
                fontWeight: 700,
              }}
            >
              {locationLoading
                ? "Getting location..."
                : "Try again"}
            </Button>
          </Box>
        )}

        {/* ------------------------------------------------ */}
        {/* RESULT COUNT */}
        {/* ------------------------------------------------ */}

        <Box
          sx={{
            mt: 2,
            mb: 1.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "0.78rem",
                sm: "0.9rem",
              },
              fontWeight: 700,
              color: "#4A3327",
            }}
          >
            {loading
              ? "Finding people..."
              : `${filteredPeople.length} ${
                  filteredPeople.length === 1
                    ? "member"
                    : "members"
                } nearby`}
          </Typography>

          <Chip
            icon={
              <PeopleAltRoundedIcon
                sx={{ fontSize: "15px !important" }}
              />
            }
            label={`${radius} mi`}
            size="small"
            sx={{
              height: 25,
              background: "#FFF3E3",
              color: "#A85F00",
              fontSize: "0.65rem",
              fontWeight: 700,
              "& .MuiChip-icon": {
                color: ORANGE,
              },
            }}
          />
        </Box>

        {/* ------------------------------------------------ */}
        {/* LOADING */}
        {/* ------------------------------------------------ */}

        {loading && (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress
              size={30}
              sx={{
                color: ORANGE,
              }}
            />

            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              Finding Saathi members near you...
            </Typography>
          </Box>
        )}

        {/* ------------------------------------------------ */}
        {/* PEOPLE LIST */}
        {/* ------------------------------------------------ */}

        {!loading && userLocation && filteredPeople.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.2,
            }}
          >
            {filteredPeople.map((person) => (
              <Box
                key={person._id}
                sx={{
                  background: "#FFFFFF",
                  border: "1px solid #EEE4DC",
                  borderRadius: 3,
                  p: { xs: 1.4, sm: 1.8 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.3,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#FFD49A",
                    boxShadow:
                      "0 4px 15px rgba(245,147,0,0.08)",
                  },
                }}
              >
                {/* PROFILE IMAGE */}

                <Avatar
                  src={person.profileImage || ""}
                  alt={`${person.firstName || ""} ${
                    person.lastName || ""
                  }`}
                  sx={{
                    width: {
                      xs: 52,
                      sm: 58,
                    },
                    height: {
                      xs: 52,
                      sm: 58,
                    },
                    background: "#FFF0DC",
                    color: ORANGE,
                    border: "2px solid #FFE0B2",
                  }}
                >
                  {!person.profileImage && (
                    <PersonRoundedIcon />
                  )}
                </Avatar>

                {/* DETAILS */}

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.82rem",
                          sm: "0.92rem",
                        },
                        fontWeight: 700,
                        color: "#2D211B",
                      }}
                    >
                      {person.firstName}{" "}
                      {person.lastName}
                    </Typography>

                    {person.isVerified && (
                      <Chip
                        label="Verified"
                        size="small"
                        sx={{
                          height: 19,
                          background: "#EAF6EC",
                          color: "#2E7D32",
                          fontSize: "0.55rem",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>

                  {person.bio && (
                    <Typography
                      sx={{
                        mt: 0.25,
                        fontSize: {
                          xs: "0.67rem",
                          sm: "0.75rem",
                        },
                        color: "text.secondary",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {person.bio}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.4,
                      mt: 0.45,
                    }}
                  >
                    <LocationOnRoundedIcon
                      sx={{
                        fontSize: 13,
                        color: ORANGE,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: {
                          xs: "0.62rem",
                          sm: "0.7rem",
                        },
                        color: "#777",
                      }}
                    >
                      {person.city ||
                        person.location ||
                        "Nearby"}
                    </Typography>

                    {person.distance != null && (
                      <>
                        <Typography
                          sx={{
                            fontSize: "0.65rem",
                            color: "#BBB",
                          }}
                        >
                          •
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: {
                              xs: "0.62rem",
                              sm: "0.7rem",
                            },
                            color: ORANGE,
                            fontWeight: 600,
                          }}
                        >
                          {formatDistance(
                            person.distance
                          )}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>

                {/* VIEW PROFILE */}

                <Button
                  onClick={() =>
                    handleViewProfile(person)
                  }
                  sx={{
                    minWidth: "auto",
                    px: {
                      xs: 1,
                      sm: 1.5,
                    },
                    py: 0.7,
                    borderRadius: 2,
                    background: "#FFF4E8",
                    color: ORANGE,
                    textTransform: "none",
                    fontSize: {
                      xs: "0.62rem",
                      sm: "0.72rem",
                    },
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      background: "#FFE7CB",
                    },
                  }}
                >
                  View
                </Button>
              </Box>
            ))}
          </Box>
        )}

        {/* ------------------------------------------------ */}
        {/* EMPTY STATE */}
        {/* ------------------------------------------------ */}

        {!loading &&
          userLocation &&
          filteredPeople.length === 0 && (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3,
              }}
            >
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: "#FFF2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                <PeopleAltRoundedIcon
                  sx={{
                    fontSize: 32,
                    color: "#F59300",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#33251D",
                }}
              >
                No people found nearby
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  maxWidth: 300,
                  lineHeight: 1.5,
                }}
              >
                Try increasing the search radius or
                changing your search.
              </Typography>

              <Button
                onClick={() =>
                  setRadius((prev) =>
                    prev < 50 ? 50 : prev
                  )
                }
                sx={{
                  mt: 2,
                  borderRadius: 999,
                  background: ORANGE,
                  color: "#FFF",
                  px: 2.5,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  "&:hover": {
                    background: "#C95608",
                  },
                }}
              >
                Search a larger area
              </Button>
            </Box>
          )}

        {/* ------------------------------------------------ */}
        {/* PRIVACY NOTE */}
        {/* ------------------------------------------------ */}

        <Box
          sx={{
            mt: 3,
            mb: 3,
            px: 1.5,
            py: 1.3,
            borderRadius: 2,
            background: "#F8F8F8",
            border: "1px solid #EEEEEE",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "0.62rem",
                sm: "0.68rem",
              },
              color: "#777",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            🔒 For privacy, exact locations and
            addresses are not shown to other members.
            Only an approximate distance and available
            profile information are displayed.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}