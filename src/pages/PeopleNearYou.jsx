import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import Api from "../Api";
import { useUser } from "../context/userConetext";

const ORANGE = "#E8650A";

export default function PeopleNearYou() {
  const navigate = useNavigate();

  const { currentUser } = useUser();

  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // FETCH PEOPLE WITH SAME ZIPCODE
  // ---------------------------------------------------------

  const fetchNearbyPeople = async () => {
    if (!currentUser?.zipcode) {
      setPeople([]);
      return;
    }

    try {
      setLoading(true);

      console.log(currentUser, 'currentUser')
      const response = await axios.get(Api + `/users/nearby/user/${currentUser._id}`);

      setPeople(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching nearby people:", error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // FETCH WHEN ZIPCODE IS AVAILABLE
  // ---------------------------------------------------------

  useEffect(() => {
    if (currentUser?.zipcode) {
      fetchNearbyPeople();
    }
  }, [currentUser?.zipcode]);

  // ---------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------

  const filteredPeople = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return people;
    }

    return people.filter((person) => {
      const firstName = person?.firstName?.toLowerCase() || "";
      const lastName = person?.lastName?.toLowerCase() || "";
      const profession = person?.profession?.toLowerCase() || "";
      const bio = person?.bio?.toLowerCase() || "";
      const city = person?.city?.toLowerCase() || "";

      return (
        firstName.includes(value) ||
        lastName.includes(value) ||
        profession.includes(value) ||
        bio.includes(value) ||
        city.includes(value)
      );
    });
  }, [people, search]);

  // ---------------------------------------------------------
  // VIEW PROFILE
  // ---------------------------------------------------------

  const handleViewProfile = (person) => {
    navigate(`/user-profile/${person._id}`);
  };

  // ---------------------------------------------------------
  // NO ZIPCODE
  // ---------------------------------------------------------

  if (!currentUser?.zipcode) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#FCFAF8",
        }}
      >
        {/* HEADER */}
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

            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  fontWeight: 800,
                  color: "#2D211B",
                }}
              >
                People Near You
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.72rem" },
                  color: "text.secondary",
                }}
              >
                Discover Saathi members around your area
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* CONTENT */}
        <Box
          sx={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 3,
          }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 350 }}>
            <PeopleAltRoundedIcon
              sx={{
                fontSize: 50,
                color: ORANGE,
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#33251D",
              }}
            >
              ZIP code required
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: "0.75rem",
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Please add your ZIP code to your profile to discover
              Saathi members in your area.
            </Typography>

            <Button
              onClick={() => navigate("/profile")}
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
              Update Profile
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        width: "100%",
        background: "#FCFAF8",
        overflowX: "hidden",
      }}
    >
      {/* HEADER */}
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
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: 800,
                color: "#2D211B",
              }}
            >
              People Near You
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.72rem" },
                color: "text.secondary",
              }}
            >
              Discover Saathi members around your area
            </Typography>
          </Box>

          <IconButton
            onClick={fetchNearbyPeople}
            disabled={loading}
            sx={{
              color: ORANGE,
            }}
          >
            <RefreshRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        sx={{
          width: "100%",
          maxWidth:"100%",
          mx: "auto",
          px: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          py: {
            xs: 1,
            sm: 2,
            md: 3,
          },
          boxSizing: "border-box",
        }}
      >
        {/* AREA INFO */}
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
            <PeopleAltRoundedIcon
              sx={{
                color: ORANGE,
                fontSize: 22,
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: "0.76rem", sm: "0.85rem" },
                fontWeight: 700,
                color: "#4A3327",
              }}
            >
              People around your area
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "0.63rem", sm: "0.72rem" },
                color: "text.secondary",
                mt: 0.3,
              }}
            >
              Showing Saathi members in your registered area
            </Typography>
          </Box>
        </Box>

        {/* SEARCH */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search people or profession..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mt: 1.5,
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
        />

        {/* RESULT COUNT */}
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
              fontSize: { xs: "0.78rem", sm: "0.9rem" },
              fontWeight: 700,
              color: "#4A3327",
            }}
          >
            {loading
              ? "Finding people..."
              : `${filteredPeople.length} ${filteredPeople.length === 1 ? "member" : "members"
              } in your area`}
          </Typography>

          <Chip
            label="Your Area"
            size="small"
            sx={{
              height: 25,
              background: "#FFF3E3",
              color: "#A85F00",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          />
        </Box>

        {/* LOADING */}
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
              Finding Saathi members in your area...
            </Typography>
          </Box>
        )}

        {/* PEOPLE LIST */}
        {!loading && filteredPeople.length > 0 && (
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
                  alt={`${person.firstName || ""} ${person.lastName || ""
                    }`}
                  sx={{
                    width: { xs: 52, sm: 58 },
                    height: { xs: 52, sm: 58 },
                    background: "#FFF0DC",
                    color: ORANGE,
                    border: "2px solid #FFE0B2",
                  }}
                >
                  {!person.profileImage && <PersonRoundedIcon />}
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
                      {person.firstName} {person.lastName}
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

                  {(person.profession || person.bio) && (
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
                      {person.profession || person.bio}
                    </Typography>
                  )}

                  <Typography
                    sx={{
                      mt: 0.45,
                      fontSize: {
                        xs: "0.62rem",
                        sm: "0.7rem",
                      },
                      color: "#777",
                    }}
                  >
                    {person.city || "Your area"}
                  </Typography>
                </Box>

                {/* VIEW PROFILE */}
                {/* <Button
                  onClick={() => handleViewProfile(person)}
                  sx={{
                    minWidth: "auto",
                    px: { xs: 1, sm: 1.5 },
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
                </Button> */}
              </Box>
            ))}
          </Box>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredPeople.length === 0 && (
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
              No people found in your area
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
              We couldn't find any other Saathi members
              registered in your area yet.
            </Typography>
          </Box>
        )}

        {/* PRIVACY NOTE */}
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
            🔒 Your registered location is used to find
            members in your area. Exact addresses are not
            shown to other members.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}